/**
 * Thin wrapper that calls a TanStack Start server function while injecting
 * the current Firebase ID token as the `x-id-token` request header.
 *
 * Changes from v1:
 * - Forces a token refresh (`forceRefresh = true`) so a freshly-signed-up
 *   user never sends a stale/expired token.
 * - If `auth.currentUser` is null right after sign-up (Firebase SDK still
 *   hydrating), waits up to 3 s for it to appear before giving up.
 * - Always injects the `x-id-token` header regardless of runtime/preset,
 *   so the server can authenticate on Vercel (Node.js) and Cloudflare alike.
 */
import { useCallback } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import { getFirebaseAuth, firebaseReady } from "@/lib/firebase";

type ServerFnCallable = (opts: {
  data?: unknown;
  headers?: Record<string, string>;
}) => Promise<unknown>;

/** Wait for Firebase to resolve the current user (up to `timeoutMs`). */
function waitForCurrentUser(timeoutMs = 3000): Promise<import("firebase/auth").User | null> {
  const auth = getFirebaseAuth();
  if (auth.currentUser) return Promise.resolve(auth.currentUser);

  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      unsub();
      resolve(null);
    }, timeoutMs);

    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        clearTimeout(timer);
        unsub();
        resolve(user);
      }
    });
  });
}

export function useServerFn() {
  return useCallback(async <TInput, TOutput>(fn: unknown, data?: TInput): Promise<TOutput> => {
    let idToken = "";

    if (firebaseReady) {
      try {
        const auth = getFirebaseAuth();
        // If currentUser is null (auth still hydrating after signup), wait briefly.
        const currentUser = auth.currentUser ?? (await waitForCurrentUser(3000));
        if (currentUser) {
          // forceRefresh = true ensures we never send an expired/stale token.
          idToken = await getIdToken(currentUser, true);
        }
      } catch {
        /* offline — server will reject if auth is required */
      }
    }

    // Always inject x-id-token. TanStack Start server functions accept a
    // `headers` option that is forwarded as request headers on the server.
    // The previous guard (`callable.url`) was skipping header injection on
    // Vercel's Node.js runtime where `.url` may be absent on the function
    // object, causing every authenticated call to fail with auth/required.
    const callable = fn as ServerFnCallable;
    return (await callable({ data, headers: { "x-id-token": idToken } })) as TOutput;
  }, []);
}
