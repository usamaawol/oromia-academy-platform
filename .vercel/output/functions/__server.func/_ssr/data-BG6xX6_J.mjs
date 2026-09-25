import { t as firebaseReady } from "./firebase-Bve1OLnm.mjs";
import { a as readDb, i as listNotifications$1, r as listCourses$1 } from "./auth-DVuTDe7t.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/data-BG6xX6_J.js
/**
* Single data façade. Uses Firebase when configured, otherwise the local
* offline store so the app is fully usable without credentials.
*/
var usingLocal = !firebaseReady;
async function listCourses() {
	if (usingLocal) return [...readDb().courses].sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
	return listCourses$1();
}
async function listNotifications(userId) {
	if (usingLocal) return readDb().notifications.filter((n) => n.userId === "all" || n.userId === userId).sort((a, b) => b.createdAt - a.createdAt);
	return listNotifications$1(userId);
}
//#endregion
export { listNotifications as n, listCourses as t };
