/**
 * Thin wrapper that calls a TanStack Start server function while injecting
 * the current Firebase ID token as the `x-id-token` request header.
 *
 * The compiled server function (`fn`) is TanStack's own client RPC, so it
 * handles payload serialization, GET/POST encoding and — importantly — parsing
 * the seroval response envelope and throwing the server-side error. We only
 * need to attach the auth header through its built-in `headers` option.
 *
 * Usage (identical to calling the server fn directly):
 *   const call = useServerFn();
 *   const result = await call(startExam, { examId, password });
 */
import { useCallback } from "react";
import { getIdToken } from "firebase/auth";
import { getFirebaseAuth, firebaseReady } from "@/lib/firebase";

type ServerFnCallable = (opts: {
  data?: unknown;
  headers?: Record<string, string>;
}) => Promise<unknown>;

export function useServerFn() {
  return useCallback(async <TInput, TOutput>(fn: unknown, data?: TInput): Promise<TOutput> => {
    // Get the current Firebase ID token (empty string when unauthenticated / offline)
    let idToken = "";
    if (firebaseReady) {
      try {
        const auth = getFirebaseAuth();
        if (auth.currentUser) {
          idToken = await getIdToken(auth.currentUser, false);
        }
      } catch {
        /* offline — server will reject if auth is required */
      }
    }

    const callable = fn as ServerFnCallable & { url?: string };
    if (typeof window !== "undefined" && callable.url) {
      // Browser: the compiled fn with the auth header attached.
      return (await callable({ data, headers: { "x-id-token": idToken } })) as TOutput;
    }
    // SSR / non-compiled fallback: call it without the auth header.
    return (await callable({ data })) as TOutput;
  }, []);
}
