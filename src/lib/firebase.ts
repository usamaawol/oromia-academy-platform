import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

// Firebase web configuration for Oromia Academy.
//
// These are PUBLIC client-side values — not secrets. Firebase web API keys
// identify the project to Google; they appear in every network request and
// the Firebase console. It is safe and correct to embed them here.
//
// We do NOT read VITE_FIREBASE_* env vars for the core config because Vercel
// (and other hosts) may inject incorrect or placeholder values that override
// these correct literals at build time, causing auth/api-key-not-valid errors.
export const firebaseConfig = {
  apiKey:            "AIzaSyBHO0E9No9m90MCWjO48NIUak1DwVhA35s",
  authDomain:        "oromia-academy.firebaseapp.com",
  projectId:         "oromia-academy",
  storageBucket:     "oromia-academy.firebasestorage.app",
  messagingSenderId: "754534143898",
  appId:             "1:754534143898:web:1ee8549a7cec2cd0990c23",
  measurementId:     "G-EGTGLPQ83E",
};

export const firebaseReady = true; // config is always present

let app: FirebaseApp | null = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let storageInstance: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp {
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
