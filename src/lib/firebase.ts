import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = import.meta.env;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "oromia-academy.firebaseapp.com",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "oromia-academy",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "oromia-academy.firebasestorage.app",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "754534143898",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "1:754534143898:web:1ee8549a7cec2cd0990c23",
  measurementId: env["VITE_FIREBASE_MEASUREMENT_ID"] ?? "G-EGTGLPQ83E",
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
