/**
 * Thin wrapper that calls a TanStack Start server function while injecting
 * the current Firebase ID token as the `x-id-token` request header.
 *
 * Token strategy:
 * - Use the cached token when it has more than 5 minutes left (no network
 *   round-trip needed for the vast majority of calls).
 * - Force-refresh only when the token is within 5 minutes of expiry.
 *   This avoids the race condition where multiple parallel server-function
 *   calls each trigger force-refresh simultaneously, causing some of them to
 *   get a token that was immediately superseded by another refresh, leading
 *   to auth/invalid-session errors.
 * - If auth.currentUser is null (Firebase SDK still hydrating after sign-up
 *   or page load), wait up to 3 s for it to appear before giving up.
 */
import { useCallback } from "react";
import { getIdToken, onAuthStateChanged } from "firebase/auth";
import type { User } from "firebase/auth";
import { getFirebaseAuth, firebaseReady } from "@/lib/firebase";

type ServerFnCallable = (opts: {
  data?: unknown;
  headers?: Record<string, string>;
}) => Promise<unknown>;

/** Wait for Firebase to resolve the current user (up to `timeoutMs`). */
function waitForCurrentUser(timeoutMs = 3000): Promise<User | null> {
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

/**
 * Returns true when the token will expire within the next `thresholdMs`.
 * Firebase ID tokens have a 1-hour lifetime; `expirationTime` is an ISO
 * string on the decoded token result.
 */
function isTokenNearExpiry(user: User, thresholdMs = 5 * 60 * 1000): boolean {
  try {
    // Firebase stores the token in memory; stsTokenManager is internal but
    // stable across SDK versions. Access it safely with optional chaining.
    const mgr = (user as unknown as { stsTokenManager?: { expirationTime?: number } })
      .stsTokenManager;
    if (!mgr?.expirationTime) return true; // unknown → refresh to be safe
    return mgr.expirationTime - Date.now() < thresholdMs;
  } catch {
    return true; // if anything goes wrong, refresh
  }
}

// Module-level token cache: avoids parallel force-refreshes when multiple
// server functions are called at the same time on a single page load.
let pendingTokenRefresh: Promise<string> | null = null;

async function getToken(user: User): Promise<string> {
  // If there's already a refresh in flight, wait for it instead of starting
  // another one — this is the key fix for the parallel-call race condition.
  if (pendingTokenRefresh) {
    try {
      return await pendingTokenRefresh;
    } catch {
      pendingTokenRefresh = null;
    }
  }

  const needsRefresh = isTokenNearExpiry(user);
  if (!needsRefresh) {
    // Token is fresh — use the cached one without a network round-trip.
    return getIdToken(user, false);
  }

  // Start a single refresh and share it with any concurrent callers.
  pendingTokenRefresh = getIdToken(user, true).finally(() => {
    pendingTokenRefresh = null;
  });
  return pendingTokenRefresh;
}

export function useServerFn() {
  return useCallback(async <TInput, TOutput>(fn: unknown, data?: TInput): Promise<TOutput> => {
    let idToken = "";

    if (firebaseReady) {
      try {
        const auth = getFirebaseAuth();
        const currentUser = auth.currentUser ?? (await waitForCurrentUser(3000));
        if (currentUser) {
          idToken = await getToken(currentUser);
        }
      } catch {
        /* offline or token error — server will reject if auth is required */
      }
    }

    // Always inject the x-id-token header regardless of runtime/preset.
    const callable = fn as ServerFnCallable;
    return (await callable({ data, headers: { "x-id-token": idToken } })) as TOutput;
  }, []);
}
