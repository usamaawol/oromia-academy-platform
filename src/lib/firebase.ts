import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase web API keys are PUBLIC client configuration — safe to embed in
// source code. They are already visible in every browser network request and
// are not secret. The VITE_* env vars are preferred when available (lets the
// key be overridden per-environment), but the literals below are the project
// defaults and will always work for this Firebase project.
const env = import.meta.env;

// Helper: return env var value only if it looks like a real key (not a
// placeholder like "your-firebase-web-api-key" or an empty string).
function envOrFallback(envKey: string, fallback: string): string {
  const v = env[envKey] as string | undefined;
  if (v && v.length > 10 && !v.startsWith("your-") && !v.includes("placeholder")) return v;
  return fallback;
}

export const firebaseConfig = {
  apiKey:            envOrFallback("VITE_FIREBASE_API_KEY",            "AIzaSyBHO0E9No9m90MCWjO48NIUak1DwVhA35s"),
  authDomain:        envOrFallback("VITE_FIREBASE_AUTH_DOMAIN",        "oromia-academy.firebaseapp.com"),
  projectId:         envOrFallback("VITE_FIREBASE_PROJECT_ID",         "oromia-academy"),
  storageBucket:     envOrFallback("VITE_FIREBASE_STORAGE_BUCKET",     "oromia-academy.firebasestorage.app"),
  messagingSenderId: envOrFallback("VITE_FIREBASE_MESSAGING_SENDER_ID","754534143898"),
  appId:             envOrFallback("VITE_FIREBASE_APP_ID",             "1:754534143898:web:1ee8549a7cec2cd0990c23"),
  measurementId:     envOrFallback("VITE_FIREBASE_MEASUREMENT_ID",     "G-EGTGLPQ83E"),
};

export const firebaseReady = Boolean(firebaseConfig.apiKey);

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
  if (!firebaseReady) throw new Error("Firebase is not configured");
  if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}

export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = initializeFirestore(getFirebaseApp(), {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    });
  }
  return dbInstance;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storageInstance) storageInstance = getStorage(getFirebaseApp());
  return storageInstance;
}
