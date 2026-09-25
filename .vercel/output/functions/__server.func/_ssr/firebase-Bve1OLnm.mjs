import { a as getApp, o as getApps, s as initializeApp } from "../_libs/@firebase/app+[...].mjs";
import { i as getAuth } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { a as persistentLocalCache, f as initializeFirestore, o as persistentMultipleTabManager } from "../_libs/@firebase/firestore+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/firebase-Bve1OLnm.js
var env = {
	"BASE_URL": "/",
	"DEV": false,
	"MODE": "production",
	"PROD": true,
	"SSR": true,
	"TSS_DEV_SERVER": "false",
	"TSS_DEV_SSR_STYLES_BASEPATH": "/",
	"TSS_DEV_SSR_STYLES_ENABLED": "true",
	"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
	"TSS_INLINE_CSS_ENABLED": "false",
	"TSS_ROUTER_BASEPATH": "",
	"TSS_SERVER_FN_BASE": "/_serverFn/",
	"VITE_FIREBASE_API_KEY": "AIzaSyBHO0E9No9m90MCWjO48NIUak1DwVhA35s",
	"VITE_FIREBASE_AUTH_DOMAIN": "oromia-academy.firebaseapp.com",
	"VITE_FIREBASE_PROJECT_ID": "oromia-academy"
};
var firebaseConfig = {
	apiKey: env["VITE_FIREBASE_API_KEY"] ?? "AIzaSyBHO0E9No9m90MCWjO48NIUak1DwVhA35s",
	authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "oromia-academy.firebaseapp.com",
	projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "oromia-academy",
	storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "oromia-academy.firebasestorage.app",
	messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "754534143898",
	appId: env["VITE_FIREBASE_APP_ID"] ?? "1:754534143898:web:1ee8549a7cec2cd0990c23",
	measurementId: env["VITE_FIREBASE_MEASUREMENT_ID"] ?? "G-EGTGLPQ83E"
};
var firebaseReady = Boolean(firebaseConfig.apiKey);
var app = null;
var authInstance = null;
var dbInstance = null;
function getFirebaseApp() {
	if (!firebaseReady) throw new Error("Firebase is not configured");
	if (!app) app = getApps().length ? getApp() : initializeApp(firebaseConfig);
	return app;
}
function getFirebaseAuth() {
	if (!authInstance) authInstance = getAuth(getFirebaseApp());
	return authInstance;
}
function getDb() {
	if (!dbInstance) dbInstance = initializeFirestore(getFirebaseApp(), { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) });
	return dbInstance;
}
//#endregion
export { getDb as n, getFirebaseAuth as r, firebaseReady as t };
