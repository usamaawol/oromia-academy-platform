import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { a as objectType, i as numberType, n as booleanType, o as recordType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
import { n as examWindowState, t as autoGrade } from "./exam-engine-C-iWJGOh.mjs";
import { t as getRequestHeader } from "./request-response-B5fXtxnG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-fns-DfMhw2B8.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* Trusted Firebase access layer (server only).
*
* Uses a Firebase service account to talk to the Firestore REST API with full
* authority, so Firestore security rules can stay strict for browsers.
* Nothing in this file may ever be imported from client code.
*
* DEVELOPMENT FALLBACK: when `FIREBASE_SERVICE_ACCOUNT_JSON` is not configured,
* requests are authorised with the caller's own Firebase ID token (sent as the
* `x-id-token` header). This lets the admin dashboard run without a service
* account so long as the Firestore rules allow the signed-in user access.
*/
var FIRESTORE = "https://firestore.googleapis.com/v1";
function serviceAccount() {
	const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
	if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured");
	const parsed = JSON.parse(raw);
	if (!parsed.private_key || !parsed.client_email || !parsed.project_id) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is missing required fields");
	return parsed;
}
function projectId() {
	if (!process.env["FIREBASE_SERVICE_ACCOUNT_JSON"]) return (process.env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "oromia-academy.firebaseapp.com").split(".")[0];
	return serviceAccount().project_id;
}
function b64url(bytes) {
	const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
	let s = "";
	for (const b of arr) s += String.fromCharCode(b);
	return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function pemToDer(pem) {
	const body = pem.replace(/-----BEGIN PRIVATE KEY-----/, "").replace(/-----END PRIVATE KEY-----/, "").replace(/\\n/g, "\n").replace(/\n/g, "").replace(/\r/g, "").replace(/\s/g, "");
	const bin = atob(body);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out.buffer;
}
var tokenCache = null;
/**
* Resolve the Firestore auth token for this request.
*
* Order of attempts:
*   1. Cached service-account access token (valid for > 60 s still)
*   2. Full service-account JWT → Google OAuth token exchange (only works on
*      runtimes with Node/WebCrypto `RSA-PSS` signing + a well-formed
*      `FIREBASE_SERVICE_ACCOUNT_JSON` env var — e.g. paid Vercel + Pro, or
*      a Node VPS).
*   3. Caller's own Firebase ID token (`x-id-token` request header). This is
*      the **Vercel Hobby / free-tier path**. The server just proxies Firestore
*      operations AS the signed-in user, and Firestore rules enforce role
*      access (staff-only collections, per-student row isolation, etc.).
*
* Fallback (3) means no Pro plan is required and no RSA signing is needed on
* the server; the rules in `firestore.rules` provide the security boundary.
*/
async function accessToken() {
	if (tokenCache && tokenCache.expiresAt > Date.now() + 6e4) return tokenCache.token;
	const userToken = getRequestHeader("x-id-token") ?? "";
	if (process.env["FIREBASE_SERVICE_ACCOUNT_JSON"]) try {
		const sa = serviceAccount();
		const iat = Math.floor(Date.now() / 1e3);
		const header = b64url(new TextEncoder().encode(JSON.stringify({
			alg: "RS256",
			typ: "JWT"
		})));
		const claims = b64url(new TextEncoder().encode(JSON.stringify({
			iss: sa.client_email,
			scope: "https://www.googleapis.com/auth/datastore",
			aud: "https://oauth2.googleapis.com/token",
			iat,
			exp: iat + 3600
		})));
		const key = await crypto.subtle.importKey("pkcs8", pemToDer(sa.private_key.replace(/\\n/g, "\n")), {
			name: "RSASSA-PKCS1-v1_5",
			hash: "SHA-256"
		}, false, ["sign"]);
		const jwt = `${header}.${claims}.${b64url(await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${header}.${claims}`)))}`;
		const res = await fetch("https://oauth2.googleapis.com/token", {
			method: "POST",
			headers: { "content-type": "application/x-www-form-urlencoded" },
			body: new URLSearchParams({
				grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
				assertion: jwt
			})
		});
		if (res.ok) {
			const json = await res.json();
			tokenCache = {
				token: json.access_token,
				expiresAt: Date.now() + json.expires_in * 1e3
			};
			return json.access_token;
		}
		console.warn(`[fb-admin] Service-account token exchange failed (${res.status}); falling back to caller x-id-token mode.`);
	} catch (err) {
		console.warn(`[fb-admin] Service-account auth unavailable (${err?.message ?? String(err)}); falling back to caller x-id-token mode.`);
	}
	if (userToken) return userToken;
	throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured and no caller x-id-token is present on the request. Either (a) set FIREBASE_SERVICE_ACCOUNT_JSON, or (b) ensure the browser client is signed in via Firebase Auth so the admin dashboard attaches an x-id-token header.");
}
function encode(value) {
	if (value === null || value === void 0) return { nullValue: null };
	if (typeof value === "boolean") return { booleanValue: value };
	if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
	if (typeof value === "string") return { stringValue: value };
	if (Array.isArray(value)) return { arrayValue: { values: value.map(encode) } };
	if (typeof value === "object") {
		const fields = {};
		for (const [k, v] of Object.entries(value)) fields[k] = encode(v);
		return { mapValue: { fields } };
	}
	return { nullValue: null };
}
function decode(value) {
	if (!value) return void 0;
	if ("nullValue" in value) return null;
	if ("booleanValue" in value) return value["booleanValue"];
	if ("integerValue" in value) return Number(value["integerValue"]);
	if ("doubleValue" in value) return Number(value["doubleValue"]);
	if ("stringValue" in value) return value["stringValue"];
	if ("timestampValue" in value) return Date.parse(String(value["timestampValue"]));
	if ("arrayValue" in value) return (value["arrayValue"].values ?? []).map((x) => decode(x));
	if ("mapValue" in value) {
		const v = value["mapValue"];
		const out = {};
		for (const [k, f] of Object.entries(v.fields ?? {})) out[k] = decode(f);
		return out;
	}
}
function encodeFields(data) {
	const fields = {};
	for (const [k, v] of Object.entries(data)) fields[k] = encode(v);
	return fields;
}
function docToObject(doc) {
	const out = { id: doc.name.split("/").pop() };
	for (const [k, v] of Object.entries(doc.fields ?? {})) out[k] = decode(v);
	return out;
}
async function api(path, init) {
	const token = await accessToken();
	const res = await fetch(`${FIRESTORE}/projects/${projectId()}/databases/(default)/documents${path}`, {
		...init,
		headers: {
			...init?.headers,
			authorization: `Bearer ${token}`,
			"content-type": "application/json"
		}
	});
	if (res.status === 404) return null;
	if (!res.ok) throw new Error(`Firestore ${res.status}: ${await res.text()}`);
	return res.json();
}
async function fsGet(collection, id) {
	const doc = await api(`/${collection}/${encodeURIComponent(id)}`);
	return doc ? docToObject(doc) : null;
}
/** Create or fully overwrite a document at a known id. */
async function fsSet(collection, id, data) {
	const mask = Object.keys(data).map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`).join("&");
	await api(`/${collection}/${encodeURIComponent(id)}?${mask}`, {
		method: "PATCH",
		body: JSON.stringify({ fields: encodeFields(data) })
	});
}
async function fsCreate(collection, data) {
	return (await api(`/${collection}`, {
		method: "POST",
		body: JSON.stringify({ fields: encodeFields(data) })
	})).name.split("/").pop();
}
async function fsDelete(collection, id) {
	await api(`/${collection}/${encodeURIComponent(id)}`, { method: "DELETE" });
}
async function fsList(collection) {
	const out = [];
	let pageToken;
	do {
		const q = new URLSearchParams({ pageSize: "300" });
		if (pageToken) q.set("pageToken", pageToken);
		const page = await api(`/${collection}?${q.toString()}`);
		for (const d of page?.documents ?? []) out.push(docToObject(d));
		pageToken = page?.nextPageToken;
	} while (pageToken);
	return out;
}
async function fsQuery(collection, filters, limit = 500) {
	const token = await accessToken();
	const body = { structuredQuery: {
		from: [{ collectionId: collection }],
		limit,
		...filters.length ? { where: { compositeFilter: {
			op: "AND",
			filters: filters.map(([field, op, value]) => ({ fieldFilter: {
				field: { fieldPath: field },
				op,
				value: encode(value)
			} }))
		} } } : {}
	} };
	const res = await fetch(`${FIRESTORE}/projects/${projectId()}/databases/(default)/documents:runQuery`, {
		method: "POST",
		headers: {
			authorization: `Bearer ${token}`,
			"content-type": "application/json"
		},
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error(`Firestore query ${res.status}: ${await res.text()}`);
	return (await res.json()).filter((r) => r.document).map((r) => docToObject(r.document));
}
/**
* Resolve the Firebase Web API key used for verifying client ID tokens.
*
* On Vercel / serverless runtimes, `VITE_*` variables are only baked into
* client bundles at build time. Server-side, TanStack Start / Nitro / Vercel
* typically expose them through `import.meta.env` (Vite SSR) or plain
* `process.env` if the user added them to the Vercel project settings.
*
* We also accept a bare `FIREBASE_API_KEY` / `GOOGLE_API_KEY` so operators can
* avoid the VITE_ prefix entirely on the server.
*/
function resolveFirebaseApiKey() {
	const direct = process.env["GOOGLE_API_KEY"] ?? process.env["FIREBASE_API_KEY"] ?? process.env["VITE_FIREBASE_API_KEY"];
	if (direct) return direct;
	if (typeof import.meta !== "undefined") {
		const env = {
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
		if (env) {
			const vite = env["VITE_FIREBASE_API_KEY"] ?? env["FIREBASE_API_KEY"] ?? env["GOOGLE_API_KEY"];
			if (vite) return vite;
		}
	}
}
/**
* Validates a Firebase ID token with Google's identity service. The client can
* never fake this: an invalid or expired token is rejected upstream.
*/
async function verifyIdToken(idToken) {
	if (!idToken) throw new Error("auth/required");
	const key = resolveFirebaseApiKey();
	if (!key) throw new Error("Firebase API key is not configured on the server. Set GOOGLE_API_KEY, FIREBASE_API_KEY, or VITE_FIREBASE_API_KEY in Vercel project settings.");
	let res;
	try {
		res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(key)}`, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ idToken })
		});
	} catch (cause) {
		throw new Error("auth/network-error", { cause });
	}
	if (res.status === 400) throw new Error("auth/invalid-session");
	if (!res.ok) throw new Error(`auth/id-token-check-failed (${res.status})`);
	const u = (await res.json()).users?.[0];
	if (!u) throw new Error("auth/invalid-session");
	return {
		uid: u.localId,
		email: u.email ?? "",
		emailVerified: Boolean(u.emailVerified),
		name: u.displayName ?? ""
	};
}
/**
* Reports the server-side Firebase configuration without leaking secrets.
* Used by the admin "Server status" card so misconfiguration is obvious in-app.
*/
async function systemDiagnostics() {
	const apiKey = resolveFirebaseApiKey();
	const out = {
		serviceAccountSet: false,
		serviceAccountValid: false,
		projectId: projectId(),
		apiKeySet: Boolean(apiKey),
		tokenMode: "none",
		firestoreReachable: false
	};
	const raw = process.env["FIREBASE_SERVICE_ACCOUNT_JSON"];
	out.serviceAccountSet = Boolean(raw);
	let sa = null;
	if (raw) try {
		sa = JSON.parse(raw);
		out.serviceAccountValid = Boolean(sa.private_key && sa.client_email && sa.project_id);
		if (out.serviceAccountValid) out.projectId = sa.project_id ?? null;
	} catch {
		sa = null;
	}
	try {
		const userToken = getRequestHeader("x-id-token") ?? "";
		const couldUseSA = out.serviceAccountValid && (tokenCache && tokenCache.expiresAt > Date.now() + 6e4 ? true : sa !== null);
		const tok = await accessToken();
		if (couldUseSA && tok && tok.startsWith("ya29.")) out.tokenMode = "service-account";
		else if (tok && userToken && tok === userToken) out.tokenMode = "user-token";
		else if (tok) out.tokenMode = sa && out.serviceAccountValid ? "service-account" : "user-token";
	} catch {}
	try {
		await fsGet("settings", "site");
		out.firestoreReachable = true;
	} catch {}
	return out;
}
async function sha256Hex(input) {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
function randomShuffle(items) {
	const out = [...items];
	for (let i = out.length - 1; i > 0; i--) {
		const j = crypto.getRandomValues(/* @__PURE__ */ new Uint32Array(1))[0] % (i + 1);
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}
var STAFF_ROLES = [
	"owner",
	"admin",
	"instructor"
];
var ADMIN_ROLES = ["owner", "admin"];
/**
* Server-side authentication + authorisation. Server only.
*
* Every privileged operation resolves the caller from a Firebase ID token that
* Google validated, then reads the role from Firestore. The browser never
* supplies its own role.
*/
var AppError = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
/** Resolves the caller and guarantees a `/users/{uid}` profile exists. */
async function requireProfile(idToken) {
	if (!idToken) throw new AppError("auth/required");
	let verified;
	try {
		verified = await verifyIdToken(idToken);
	} catch (err) {
		const msg = err?.message ?? "";
		if (msg.includes("API key is not configured") || msg.includes("SERVICE_ACCOUNT_JSON") || msg.includes("id-token-check-failed") || msg.includes("auth/network-error")) throw new Error(msg);
		throw new AppError("auth/invalid-session");
	}
	const existing = await fsGet("users", verified.uid);
	if (existing) {
		if (existing.status === "suspended") throw new AppError("auth/suspended");
		if (existing.activationStatus === "suspended") throw new AppError("auth/suspended");
		let migrated = existing;
		if (!migrated.activationStatus) {
			const isStaff = [
				"owner",
				"admin",
				"instructor"
			].includes(migrated.role);
			const hasCourse = (migrated.courseIds?.length ?? 0) > 0;
			const activationStatus = isStaff || hasCourse ? "active" : "pending";
			migrated = {
				...migrated,
				courseIds: migrated.courseIds ?? [],
				activationStatus,
				updatedAt: Date.now()
			};
			fsSet("users", verified.uid, migrated).catch(() => void 0);
		} else migrated = {
			...migrated,
			courseIds: migrated.courseIds ?? []
		};
		return migrated;
	}
	const now = Date.now();
	const profile = {
		id: verified.uid,
		uid: verified.uid,
		fullName: verified.name || verified.email.split("@")[0] || "Student",
		email: verified.email,
		role: "student",
		courseIds: [],
		status: "active",
		activationStatus: "pending",
		createdAt: now,
		updatedAt: now
	};
	await fsSet("users", verified.uid, { ...profile });
	return profile;
}
async function requireRole(idToken, roles) {
	const profile = await requireProfile(idToken);
	if (!roles.includes(profile.role)) throw new AppError("auth/forbidden");
	return profile;
}
function requireStaff(idToken) {
	return requireRole(idToken, STAFF_ROLES);
}
function requireAdmin(idToken) {
	return requireRole(idToken, ADMIN_ROLES);
}
async function logAudit(actor, action, target, details) {
	try {
		await fsCreate("auditLogs", {
			userId: actor.id,
			userName: actor.fullName || actor.email,
			action,
			target: target ?? null,
			details: details ?? null,
			createdAt: Date.now()
		});
	} catch {}
}
/**
* TanStack Start server functions — all privileged exam operations.
*
* Every function that touches answer keys, passwords, timers or grading runs
* here. The browser never receives sensitive data.
*/
function getToken() {
	return getRequestHeader("x-id-token") ?? "";
}
var ExamSchema = objectType({
	id: stringType(),
	title: stringType(),
	courseId: stringType(),
	topic: stringType().optional(),
	description: stringType().optional(),
	instructions: stringType().optional(),
	language: enumType([
		"om",
		"en",
		"both"
	]),
	startAt: numberType().nullable(),
	endAt: numberType().nullable(),
	durationMin: numberType(),
	maxAttempts: numberType(),
	passMark: numberType(),
	questionIds: arrayType(stringType()),
	poolSize: numberType(),
	shuffleQuestions: booleanType(),
	shuffleOptions: booleanType(),
	allowBackward: booleanType(),
	requireFullscreen: booleanType(),
	resultPolicy: enumType([
		"immediate",
		"manual",
		"scheduled"
	]),
	resultsPublishAt: numberType().nullable(),
	status: enumType([
		"draft",
		"active",
		"closed",
		"archived"
	]),
	hasPassword: booleanType().optional(),
	showAnswersAfter: booleanType().optional(),
	anonymous: booleanType().optional()
});
var QuestionSchema = objectType({
	id: stringType(),
	courseId: stringType(),
	topic: stringType(),
	type: enumType([
		"mcq",
		"truefalse",
		"short",
		"essay"
	]),
	language: enumType([
		"om",
		"en",
		"both"
	]),
	difficulty: enumType([
		"easy",
		"medium",
		"hard"
	]),
	textOm: stringType(),
	textEn: stringType().optional(),
	options: arrayType(objectType({
		id: stringType(),
		textOm: stringType(),
		textEn: stringType().optional()
	})),
	correctOptionId: stringType().optional(),
	correctBool: booleanType().optional(),
	expectedAnswer: stringType().optional(),
	rubric: stringType().optional(),
	points: numberType(),
	tags: arrayType(stringType()),
	approved: booleanType()
});
var CourseSchema = objectType({
	id: stringType(),
	titleOm: stringType(),
	titleEn: stringType(),
	descOm: stringType(),
	descEn: stringType(),
	icon: stringType().optional(),
	level: enumType([
		"easy",
		"medium",
		"hard"
	]),
	status: enumType([
		"active",
		"draft",
		"archived"
	]),
	order: numberType().optional()
});
var startExam_createServerFn_handler = createServerRpc({
	id: "29f24d15963df554fb845c310d3de145468578df1e2e93c27dd2cdb4632b19e7",
	name: "startExam",
	filename: "src/lib/server-fns.ts"
}, (opts) => startExam.__executeServer(opts));
var startExam = createServerFn({ method: "POST" }).validator(objectType({
	examId: stringType(),
	password: stringType()
})).handler(startExam_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	const now = Date.now();
	const exam = await fsGet("exams", data.examId);
	if (!exam) throw new AppError("exam/not-found");
	if (exam.status !== "active") throw new AppError("exam/not-open");
	if (examWindowState(exam, now) !== "open") throw new AppError("exam/not-open");
	if (![
		"owner",
		"admin",
		"instructor"
	].includes(profile.role)) {
		if (profile.activationStatus !== "active") throw new AppError("activation/activation-required");
		if (!await hasActiveEnrollment(profile, exam.courseId)) throw new AppError("exam/not-enrolled");
	}
	if (exam.hasPassword) {
		const secret = await fsGet("examSecrets", data.examId);
		if (!secret) throw new AppError("exam/password-required");
		if (await sha256Hex(data.password.trim()) !== secret.hash) throw new AppError("exam/wrong-password");
	}
	const existing = await fsQuery("examAttempts", [[
		"examId",
		"EQUAL",
		data.examId
	], [
		"studentId",
		"EQUAL",
		profile.id
	]]);
	const maxAttempts = exam.maxAttempts ?? 0;
	if (maxAttempts > 0 && existing.length >= maxAttempts) throw new AppError("exam/no-attempts-left");
	const inProgress = existing.find((a) => a.status === "in_progress");
	if (inProgress) return buildAttemptView(exam, inProgress, await loadPublicQuestions(exam, inProgress), now);
	const valid = (await Promise.all(exam.questionIds.map((id) => fsGet("questions", id)))).filter((q) => q !== null);
	`${data.examId}${profile.id}${existing.length + 1}`;
	let selected = [...valid];
	if (exam.shuffleQuestions) selected = randomShuffle(selected);
	if (exam.poolSize > 0 && exam.poolSize < selected.length) selected = selected.slice(0, exam.poolSize);
	const questionOrder = selected.map((q) => q.id);
	const optionOrders = {};
	for (const q of selected) optionOrders[q.id] = exam.shuffleOptions && q.type === "mcq" ? randomShuffle(q.options.map((o) => o.id)) : q.options.map((o) => o.id);
	const durationMs = (exam.durationMin ?? 60) * 60 * 1e3;
	const attemptData = {
		examId: exam.id,
		examTitle: exam.title,
		courseId: exam.courseId,
		studentId: profile.id,
		studentName: profile.fullName,
		attemptNumber: existing.length + 1,
		status: "in_progress",
		questionOrder,
		optionOrders,
		answers: {},
		startedAt: now,
		expiresAt: now + durationMs,
		submittedAt: null,
		autoScore: 0,
		manualScore: 0,
		totalPoints: selected.reduce((s, q) => s + q.points, 0),
		correctCount: 0,
		wrongCount: 0,
		unansweredCount: selected.length,
		percentage: 0,
		passed: false,
		needsManualGrading: false,
		published: false
	};
	const attemptId = await fsCreate("examAttempts", attemptData);
	const attempt = {
		...attemptData,
		id: attemptId
	};
	const publicQuestions = selected.map((q) => ({
		questionId: q.id,
		type: q.type,
		points: q.points,
		textOm: q.textOm,
		...q.textEn ? { textEn: q.textEn } : {},
		options: optionOrders[q.id].map((oid) => {
			const opt = q.options.find((o) => o.id === oid);
			return {
				id: opt.id,
				textOm: opt.textOm,
				...opt.textEn ? { textEn: opt.textEn } : {}
			};
		})
	}));
	return {
		attempt: {
			id: attemptId,
			examId: exam.id,
			examTitle: exam.title,
			status: "in_progress",
			startedAt: now,
			expiresAt: attempt.expiresAt,
			submittedAt: null,
			answers: {},
			allowBackward: exam.allowBackward,
			requireFullscreen: exam.requireFullscreen,
			language: exam.language
		},
		questions: publicQuestions,
		serverNow: now
	};
});
async function loadPublicQuestions(exam, attempt) {
	const questions = await Promise.all(attempt.questionOrder.map((id) => fsGet("questions", id)));
	return attempt.questionOrder.map((id) => {
		const q = questions.find((x) => x?.id === id);
		if (!q) return null;
		const optOrder = attempt.optionOrders?.[id] ?? q.options.map((o) => o.id);
		return {
			questionId: q.id,
			type: q.type,
			points: q.points,
			textOm: q.textOm,
			...q.textEn ? { textEn: q.textEn } : {},
			options: optOrder.map((oid) => {
				const opt = q.options.find((o) => o.id === oid);
				return {
					id: opt.id,
					textOm: opt.textOm,
					...opt.textEn ? { textEn: opt.textEn } : {}
				};
			})
		};
	}).filter(Boolean);
}
function buildAttemptView(exam, attempt, questions, now) {
	return {
		attempt: {
			id: attempt.id,
			examId: exam.id,
			examTitle: exam.title,
			status: attempt.status,
			startedAt: attempt.startedAt,
			expiresAt: attempt.expiresAt,
			submittedAt: attempt.submittedAt,
			answers: attempt.answers ?? {},
			allowBackward: exam.allowBackward,
			requireFullscreen: exam.requireFullscreen,
			language: exam.language
		},
		questions,
		serverNow: now
	};
}
var saveAnswer_createServerFn_handler = createServerRpc({
	id: "348c0a48445d878792ba6ac10e9daf5ec0a31d8a7976a15f4fd91318dc17512c",
	name: "saveAnswer",
	filename: "src/lib/server-fns.ts"
}, (opts) => saveAnswer.__executeServer(opts));
var saveAnswer = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	questionId: stringType(),
	answer: stringType()
})).handler(saveAnswer_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	const now = Date.now();
	const attempt = await fsGet("examAttempts", data.attemptId);
	if (!attempt) throw new AppError("attempt/not-found");
	if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
	if (attempt.status !== "in_progress") throw new AppError("attempt/already-submitted");
	if (now > attempt.expiresAt) {
		await _submitAttempt(attempt, now);
		return {
			ok: true,
			serverNow: now
		};
	}
	const answers = {
		...attempt.answers ?? {},
		[data.questionId]: data.answer
	};
	await fsSet("examAttempts", data.attemptId, { answers });
	return {
		ok: true,
		serverNow: now
	};
});
var submitExam_createServerFn_handler = createServerRpc({
	id: "99f98556a4b957df236a174722ee714b64d5edf767fc0791b9f6687666fca7ae",
	name: "submitExam",
	filename: "src/lib/server-fns.ts"
}, (opts) => submitExam.__executeServer(opts));
var submitExam = createServerFn({ method: "POST" }).validator(objectType({ attemptId: stringType() })).handler(submitExam_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	const now = Date.now();
	const attempt = await fsGet("examAttempts", data.attemptId);
	if (!attempt) throw new AppError("attempt/not-found");
	if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
	if (attempt.status !== "in_progress") throw new AppError("attempt/already-submitted");
	return _submitAttempt(attempt, now);
});
async function _submitAttempt(attempt, now) {
	const valid = (await Promise.all(attempt.questionOrder.map((id) => fsGet("questions", id)))).filter((q) => q !== null);
	const presented = attempt.questionOrder.map((qid) => ({
		questionId: qid,
		optionOrder: attempt.optionOrders?.[qid] ?? []
	}));
	const grade = autoGrade(presented, valid, attempt.answers ?? {});
	const exam = await fsGet("exams", attempt.examId);
	const passMark = exam?.passMark ?? 50;
	const percentage = grade.totalPoints > 0 ? Math.round(grade.autoScore / grade.totalPoints * 100) : 0;
	const patch = {
		status: "graded",
		submittedAt: now,
		autoScore: grade.autoScore,
		totalPoints: grade.totalPoints,
		correctCount: grade.correctCount,
		wrongCount: grade.wrongCount,
		unansweredCount: grade.unansweredCount,
		needsManualGrading: grade.needsManualGrading,
		percentage,
		passed: percentage >= passMark,
		manualScore: 0
	};
	await fsSet("examAttempts", attempt.id, patch);
	if ((exam?.resultPolicy ?? "immediate") !== "immediate") return { published: false };
	return {
		attemptId: attempt.id,
		examId: attempt.examId,
		examTitle: attempt.examTitle,
		submittedAt: now,
		totalPoints: grade.totalPoints,
		score: grade.autoScore,
		percentage,
		passed: percentage >= passMark,
		correctCount: grade.correctCount,
		wrongCount: grade.wrongCount,
		unansweredCount: grade.unansweredCount,
		needsManualGrading: grade.needsManualGrading
	};
}
var getMyResult_createServerFn_handler = createServerRpc({
	id: "c8764fe361ce52aa9d0372fe75c8285df81f7d5cc210c89f820d4636b9233f9e",
	name: "getMyResult",
	filename: "src/lib/server-fns.ts"
}, (opts) => getMyResult.__executeServer(opts));
var getMyResult = createServerFn({ method: "GET" }).validator(objectType({ attemptId: stringType() })).handler(getMyResult_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	const attempt = await fsGet("examAttempts", data.attemptId);
	if (!attempt) throw new AppError("attempt/not-found");
	if (attempt.studentId !== profile.id) throw new AppError("auth/forbidden");
	if (!attempt.published) return { published: false };
	const exam = await fsGet("exams", attempt.examId);
	let questionReview;
	if (exam?.showAnswersAfter) {
		const valid = (await Promise.all(attempt.questionOrder.map((id) => fsGet("questions", id)))).filter((q) => q !== null);
		const answers = attempt.answers ?? {};
		questionReview = attempt.questionOrder.map((qid) => {
			const q = valid.find((x) => x.id === qid);
			if (!q) return null;
			const yourAnswer = answers[qid] ?? "";
			let correctAnswer = "";
			let result = "unanswered";
			let earned = 0;
			if (q.type === "mcq") {
				correctAnswer = q.correctOptionId ?? "";
				if (!yourAnswer) result = "unanswered";
				else if (yourAnswer === q.correctOptionId) {
					result = "correct";
					earned = q.points;
				} else result = "wrong";
			} else if (q.type === "truefalse") {
				correctAnswer = q.correctBool === true ? "true" : "false";
				if (!yourAnswer) result = "unanswered";
				else if (yourAnswer === correctAnswer) {
					result = "correct";
					earned = q.points;
				} else result = "wrong";
			} else {
				const mg = attempt.manualGrades?.[qid];
				if (!yourAnswer) result = "unanswered";
				else if (mg) {
					earned = mg.points;
					result = mg.points >= q.points ? "correct" : mg.points > 0 ? "partial" : "wrong";
				} else {
					result = "unanswered";
					correctAnswer = q.expectedAnswer ?? "";
				}
			}
			return {
				questionId: qid,
				textOm: q.textOm,
				textEn: q.textEn,
				type: q.type,
				yourAnswer,
				correctAnswer,
				result,
				points: q.points,
				earned,
				options: q.options
			};
		}).filter(Boolean);
	}
	return {
		attemptId: attempt.id,
		examId: attempt.examId,
		examTitle: attempt.examTitle,
		submittedAt: attempt.submittedAt ?? null,
		totalPoints: attempt.totalPoints,
		score: attempt.autoScore + attempt.manualScore,
		percentage: attempt.percentage,
		passed: attempt.passed,
		correctCount: attempt.correctCount,
		wrongCount: attempt.wrongCount,
		unansweredCount: attempt.unansweredCount,
		needsManualGrading: attempt.needsManualGrading,
		...attempt.feedback ? { feedback: attempt.feedback } : {},
		...questionReview ? { questionReview } : {}
	};
});
var adminListExams_createServerFn_handler = createServerRpc({
	id: "c4be4f89e98bfc4103ea9b0954e6670500b9a147defba5fb2b74709e8338c5f9",
	name: "adminListExams",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListExams.__executeServer(opts));
var adminListExams = createServerFn({ method: "GET" }).handler(adminListExams_createServerFn_handler, async () => {
	await requireStaff(getToken());
	return fsList("exams");
});
var adminSaveExam_createServerFn_handler = createServerRpc({
	id: "3cb1554ffecc59687311f4dfe3e3e156170d1300489c68d20542be58da693866",
	name: "adminSaveExam",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSaveExam.__executeServer(opts));
var adminSaveExam = createServerFn({ method: "POST" }).validator(objectType({
	exam: ExamSchema,
	password: stringType().optional()
})).handler(adminSaveExam_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const { exam, password } = data;
	const isNew = !await fsGet("exams", exam.id);
	let hasPassword = Boolean(exam.hasPassword);
	if (Boolean(password && password.trim()) && password) {
		const hash = await sha256Hex(password.trim());
		await fsSet("examSecrets", exam.id, { hash });
		hasPassword = true;
	} else if (!hasPassword) await fsDelete("examSecrets", exam.id).catch(() => void 0);
	const examDoc = {
		...exam,
		hasPassword,
		updatedAt: Date.now()
	};
	if (isNew) examDoc["createdAt"] = Date.now();
	await fsSet("exams", exam.id, examDoc);
	await logAudit(actor, isNew ? "exam.create" : "exam.update", exam.id, exam.title);
	return { id: exam.id };
});
var adminDeleteExam_createServerFn_handler = createServerRpc({
	id: "90d5ed71ec80e9b89541c3822c64dbab2a84b0b950ce012688b81ab260f83cc6",
	name: "adminDeleteExam",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminDeleteExam.__executeServer(opts));
var adminDeleteExam = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(adminDeleteExam_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	await fsDelete("exams", data.id);
	await fsDelete("examSecrets", data.id).catch(() => void 0);
	await logAudit(actor, "exam.delete", data.id);
});
var adminListQuestions_createServerFn_handler = createServerRpc({
	id: "4ab9eec02649bbb2e50b473c22297220474e36733d53f012c8161d5ede3b1648",
	name: "adminListQuestions",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListQuestions.__executeServer(opts));
var adminListQuestions = createServerFn({ method: "GET" }).validator(objectType({ courseId: stringType().optional() })).handler(adminListQuestions_createServerFn_handler, async ({ data }) => {
	await requireStaff(getToken());
	if (data.courseId) return fsQuery("questions", [[
		"courseId",
		"EQUAL",
		data.courseId
	]]);
	return fsList("questions");
});
var adminSaveQuestion_createServerFn_handler = createServerRpc({
	id: "568a247d41cfc3937290111867a576b2fb4dc8d10444672b06cb659113b81dd8",
	name: "adminSaveQuestion",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSaveQuestion.__executeServer(opts));
var adminSaveQuestion = createServerFn({ method: "POST" }).validator(objectType({ question: QuestionSchema })).handler(adminSaveQuestion_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const q = data.question;
	const isNew = !await fsGet("questions", q.id);
	await fsSet("questions", q.id, {
		...q,
		updatedAt: Date.now(),
		...isNew ? { createdAt: Date.now() } : {}
	});
	await logAudit(actor, isNew ? "question.create" : "question.update", q.id, q.textOm.slice(0, 60));
	return { id: q.id };
});
var adminDeleteQuestion_createServerFn_handler = createServerRpc({
	id: "26a3cf1c986baba35209e3dbf73634c00e7594a53a165a69d534850263667c99",
	name: "adminDeleteQuestion",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminDeleteQuestion.__executeServer(opts));
var adminDeleteQuestion = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(adminDeleteQuestion_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	await fsDelete("questions", data.id);
	await logAudit(actor, "question.delete", data.id);
});
var adminListCourses_createServerFn_handler = createServerRpc({
	id: "66aab1078404da44e6683a60ca92b646696f02ea1786b4457d9d1e545b277bea",
	name: "adminListCourses",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListCourses.__executeServer(opts));
var adminListCourses = createServerFn({ method: "GET" }).handler(adminListCourses_createServerFn_handler, async () => {
	await requireStaff(getToken());
	return fsList("courses");
});
var adminSaveCourse_createServerFn_handler = createServerRpc({
	id: "ec2311b48111ebf4df24af01781c10415ff4427be77f23d491cf80235ff248f8",
	name: "adminSaveCourse",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSaveCourse.__executeServer(opts));
var adminSaveCourse = createServerFn({ method: "POST" }).validator(objectType({ course: CourseSchema })).handler(adminSaveCourse_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const c = data.course;
	const isNew = !await fsGet("courses", c.id);
	await fsSet("courses", c.id, {
		...c,
		updatedAt: Date.now(),
		...isNew ? { createdAt: Date.now() } : {}
	});
	await logAudit(actor, isNew ? "course.create" : "course.update", c.id, c.titleEn);
	return { id: c.id };
});
var adminDeleteCourse_createServerFn_handler = createServerRpc({
	id: "f64baa1e4da286ffda442564252565ea3e7619195b4973e258006d85a294dfb6",
	name: "adminDeleteCourse",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminDeleteCourse.__executeServer(opts));
var adminDeleteCourse = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(adminDeleteCourse_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	await fsDelete("courses", data.id);
	await logAudit(actor, "course.delete", data.id);
});
var adminListStudents_createServerFn_handler = createServerRpc({
	id: "8cdeb80e11e478ec7f5d472ad71c95cd0f66700124d4568bafc6a38dbc66a29b",
	name: "adminListStudents",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListStudents.__executeServer(opts));
var adminListStudents = createServerFn({ method: "GET" }).handler(adminListStudents_createServerFn_handler, async () => {
	await requireStaff(getToken());
	return fsList("users");
});
var adminSetRole_createServerFn_handler = createServerRpc({
	id: "15d008da0810e99c34012f26963eeecd783105cd64bdf2f15d39e6a33ef4c5b9",
	name: "adminSetRole",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSetRole.__executeServer(opts));
var adminSetRole = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	role: enumType([
		"owner",
		"admin",
		"instructor",
		"student"
	])
})).handler(adminSetRole_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	if (actor.id === data.userId && data.role !== actor.role) throw new AppError("auth/cannot-change-own-role");
	await fsSet("users", data.userId, {
		role: data.role,
		updatedAt: Date.now()
	});
	await logAudit(actor, "user.role", data.userId, data.role);
});
var adminSetStatus_createServerFn_handler = createServerRpc({
	id: "040364d1e77d01180e51bb6fcbab69f3ce9e35788609870f3c494e8066b8dd75",
	name: "adminSetStatus",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSetStatus.__executeServer(opts));
var adminSetStatus = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	status: enumType(["active", "suspended"])
})).handler(adminSetStatus_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	await fsSet("users", data.userId, {
		status: data.status,
		updatedAt: Date.now()
	});
	await logAudit(actor, "user.status", data.userId, data.status);
});
var adminListAttempts_createServerFn_handler = createServerRpc({
	id: "8e81ed2343079d44f1528cf413ba259139cece9f730b08046187dadcfdcfadd2",
	name: "adminListAttempts",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListAttempts.__executeServer(opts));
var adminListAttempts = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType().optional() })).handler(adminListAttempts_createServerFn_handler, async ({ data }) => {
	await requireStaff(getToken());
	if (data.examId) return fsQuery("examAttempts", [[
		"examId",
		"EQUAL",
		data.examId
	]]);
	return fsList("examAttempts");
});
var adminGradeAttempt_createServerFn_handler = createServerRpc({
	id: "1a0621263896a961f53b544e498c999c6abda3584951bb70e7fb6ba5eecae53f",
	name: "adminGradeAttempt",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminGradeAttempt.__executeServer(opts));
var adminGradeAttempt = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	manualGrades: recordType(objectType({
		points: numberType(),
		feedback: stringType().optional()
	})),
	feedback: stringType().optional()
})).handler(adminGradeAttempt_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const attempt = await fsGet("examAttempts", data.attemptId);
	if (!attempt) throw new AppError("attempt/not-found");
	const exam = await fsGet("exams", attempt.examId);
	const manualScore = Object.values(data.manualGrades).reduce((s, g) => s + (g.points || 0), 0);
	const total = attempt.autoScore + manualScore;
	const percentage = attempt.totalPoints > 0 ? Math.round(total / attempt.totalPoints * 100) : 0;
	const passMark = exam?.passMark ?? 50;
	await fsSet("examAttempts", data.attemptId, {
		manualGrades: data.manualGrades,
		manualScore,
		percentage,
		passed: percentage >= passMark,
		status: "graded",
		needsManualGrading: false,
		feedback: data.feedback ?? "",
		gradedAt: Date.now()
	});
	await logAudit(actor, "attempt.grade", data.attemptId);
});
var adminPublishResult_createServerFn_handler = createServerRpc({
	id: "95c8204265b2c5cf1197247ba71c85babf82524fed51f5ca8cff47f7e3d5eb52",
	name: "adminPublishResult",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminPublishResult.__executeServer(opts));
var adminPublishResult = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	published: booleanType()
})).handler(adminPublishResult_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	await fsSet("examAttempts", data.attemptId, {
		published: data.published,
		publishedAt: data.published ? Date.now() : null
	});
	await logAudit(actor, data.published ? "result.publish" : "result.unpublish", data.attemptId);
});
var adminPublishAllResults_createServerFn_handler = createServerRpc({
	id: "e4b8c27a2fe7b7686fc9975fc59f31c9b6c2422bf68d9dddb20edf9a7bbe125b",
	name: "adminPublishAllResults",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminPublishAllResults.__executeServer(opts));
var adminPublishAllResults = createServerFn({ method: "POST" }).validator(objectType({ examId: stringType() })).handler(adminPublishAllResults_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const graded = (await fsQuery("examAttempts", [[
		"examId",
		"EQUAL",
		data.examId
	]])).filter((a) => a.status === "graded" && !a.published);
	await Promise.all(graded.map((a) => fsSet("examAttempts", a.id, {
		published: true,
		publishedAt: Date.now()
	})));
	await logAudit(actor, "result.publishAll", data.examId, `${graded.length} results`);
	return { count: graded.length };
});
var adminListAudit_createServerFn_handler = createServerRpc({
	id: "da04532a672d4ad286847cc088616e2c4eac64b3633c0c5f1415412a58d4691a",
	name: "adminListAudit",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListAudit.__executeServer(opts));
var adminListAudit = createServerFn({ method: "GET" }).handler(adminListAudit_createServerFn_handler, async () => {
	await requireAdmin(getToken());
	return (await fsList("auditLogs")).sort((a, b) => b.createdAt - a.createdAt).slice(0, 300);
});
var adminGetSettings_createServerFn_handler = createServerRpc({
	id: "079867f0aed6aaabcf9aa58c9f4b9a52825ac1d985fd2c327038f1299e79f2ff",
	name: "adminGetSettings",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminGetSettings.__executeServer(opts));
var adminGetSettings = createServerFn({ method: "GET" }).handler(adminGetSettings_createServerFn_handler, async () => {
	await requireStaff(getToken());
	return await fsGet("settings", "academy") ?? {
		telegramHandle: "",
		telegramUrl: "",
		announcementOm: "",
		announcementEn: "",
		contactEmail: "",
		contactPhone: "",
		rankingsPublished: false
	};
});
var adminSaveSettings_createServerFn_handler = createServerRpc({
	id: "8e0791653f71f34fc6f48b2a21d72bbdc11e6d444a89d9ae5a198e33376d5b92",
	name: "adminSaveSettings",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSaveSettings.__executeServer(opts));
var adminSaveSettings = createServerFn({ method: "POST" }).validator(objectType({ settings: objectType({
	telegramHandle: stringType(),
	telegramUrl: stringType(),
	announcementOm: stringType(),
	announcementEn: stringType(),
	contactEmail: stringType(),
	contactPhone: stringType(),
	rankingsPublished: booleanType()
}) })).handler(adminSaveSettings_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	await fsSet("settings", "academy", data.settings);
	await logAudit(actor, "settings.update");
});
var adminGetAnalytics_createServerFn_handler = createServerRpc({
	id: "b2ec60736fc199524fdf35e95498c047f19b531d220d78e4b9bbf0f756328bec",
	name: "adminGetAnalytics",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminGetAnalytics.__executeServer(opts));
var adminGetAnalytics = createServerFn({ method: "GET" }).handler(adminGetAnalytics_createServerFn_handler, async () => {
	await requireStaff(getToken());
	const [attempts, exams, users, courses] = await Promise.all([
		fsList("examAttempts"),
		fsList("exams"),
		fsList("users"),
		fsList("courses")
	]);
	const submitted = attempts.filter((a) => a.status !== "in_progress");
	const students = users.filter((u) => u.role === "student");
	const avgScore = submitted.length > 0 ? Math.round(submitted.reduce((s, a) => s + (a.percentage ?? 0), 0) / submitted.length) : 0;
	const passCount = submitted.filter((a) => a.passed).length;
	const passRate = submitted.length > 0 ? Math.round(passCount / submitted.length * 100) : 0;
	const activeExams = exams.filter((e) => e.status === "active").length;
	const examStats = exams.map((exam) => {
		const examAttempts = submitted.filter((a) => a.examId === exam.id);
		const examAvg = examAttempts.length > 0 ? Math.round(examAttempts.reduce((s, a) => s + (a.percentage ?? 0), 0) / examAttempts.length) : 0;
		const examPass = examAttempts.length > 0 ? Math.round(examAttempts.filter((a) => a.passed).length / examAttempts.length * 100) : 0;
		return {
			id: exam.id,
			title: exam.title,
			attempts: examAttempts.length,
			avgScore: examAvg,
			passRate: examPass
		};
	});
	return {
		totalStudents: students.length,
		pendingStudents: students.filter((u) => (u.activationStatus ?? "pending") === "pending").length,
		approvedStudents: students.filter((u) => u.activationStatus === "approved").length,
		activatedStudents: students.filter((u) => u.activationStatus === "active").length,
		rejectedStudents: students.filter((u) => u.activationStatus === "rejected").length,
		suspendedStudents: students.filter((u) => u.activationStatus === "suspended").length,
		totalCourses: courses.length,
		totalExams: exams.length,
		activeExams,
		totalAttempts: submitted.length,
		avgScore,
		passRate,
		examStats
	};
});
var myAttempts_createServerFn_handler = createServerRpc({
	id: "5595d25f90092ef20a04324cad03b64bbc6355d236cfa469aae0d63808688df3",
	name: "myAttempts",
	filename: "src/lib/server-fns.ts"
}, (opts) => myAttempts.__executeServer(opts));
var myAttempts = createServerFn({ method: "GET" }).handler(myAttempts_createServerFn_handler, async () => {
	return fsQuery("examAttempts", [[
		"studentId",
		"EQUAL",
		(await requireProfile(getToken())).id
	]]);
});
var availableExams_createServerFn_handler = createServerRpc({
	id: "7c51422ad847292d5f94bbe63b80e48123e7282265341e24ea8ab993b32a4ba1",
	name: "availableExams",
	filename: "src/lib/server-fns.ts"
}, (opts) => availableExams.__executeServer(opts));
var availableExams = createServerFn({ method: "GET" }).handler(availableExams_createServerFn_handler, async () => {
	const profile = await requireProfile(getToken());
	const all = await fsQuery("exams", [[
		"status",
		"EQUAL",
		"active"
	]]);
	const now = Date.now();
	const opened = all.filter((e) => examWindowState(e, now) === "open" || e.status === "active");
	if (profile.role === "owner" || profile.role === "admin" || profile.role === "instructor") return opened;
	if ([...new Set(opened.map((e) => e.courseId))].length === 0) return [];
	const myEnrollments = await fsQuery("enrollments", [[
		"userId",
		"EQUAL",
		profile.id
	]]);
	const active = /* @__PURE__ */ new Set();
	for (const e of myEnrollments) if (e.status === "active" && e.paymentStatus === "paid" && (!e.expiresAt || e.expiresAt >= now)) active.add(e.courseId);
	const legacy = new Set(profile.courseIds ?? []);
	return opened.filter((e) => active.has(e.courseId) || legacy.has(e.courseId));
});
var getExamInfo_createServerFn_handler = createServerRpc({
	id: "a389079eef2dfb9c1a5d5dea7d535d4e9146cc758e102423c8324bc3b7f74bc5",
	name: "getExamInfo",
	filename: "src/lib/server-fns.ts"
}, (opts) => getExamInfo.__executeServer(opts));
var getExamInfo = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(getExamInfo_createServerFn_handler, async ({ data }) => {
	await requireProfile(getToken());
	const exam = await fsGet("exams", data.examId);
	if (!exam) throw new AppError("exam/not-found");
	const { questionIds, ...rest } = exam;
	return {
		...rest,
		questionCount: questionIds.length,
		hasPassword: exam.hasPassword ?? false
	};
});
var adminPushNotification_createServerFn_handler = createServerRpc({
	id: "2fea0ae822475796429b4f7980e83d4af28721284b9fa7b2506e3ea67f4f460f",
	name: "adminPushNotification",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminPushNotification.__executeServer(opts));
var adminPushNotification = createServerFn({ method: "POST" }).validator(objectType({ notification: objectType({
	userId: stringType(),
	titleOm: stringType(),
	titleEn: stringType(),
	bodyOm: stringType().optional(),
	bodyEn: stringType().optional()
}) })).handler(adminPushNotification_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	await fsCreate("notifications", {
		...data.notification,
		createdAt: Date.now()
	});
	await logAudit(actor, "notification.push", data.notification.userId);
});
var getMyProfile_createServerFn_handler = createServerRpc({
	id: "db232402c5b0a54bf9ec1743d96ae2a5426dd223ec49615948c891f1a8812d29",
	name: "getMyProfile",
	filename: "src/lib/server-fns.ts"
}, (opts) => getMyProfile.__executeServer(opts));
var getMyProfile = createServerFn({ method: "GET" }).handler(getMyProfile_createServerFn_handler, async () => {
	return requireProfile(getToken());
});
var updateMyProfile_createServerFn_handler = createServerRpc({
	id: "8de4b526b6d51276361fd00b7d2abefb3db8de1310fb3d3bc91514e5e692bfd6",
	name: "updateMyProfile",
	filename: "src/lib/server-fns.ts"
}, (opts) => updateMyProfile.__executeServer(opts));
var updateMyProfile = createServerFn({ method: "POST" }).validator(objectType({
	fullName: stringType().optional(),
	phone: stringType().optional(),
	department: stringType().optional(),
	nickname: stringType().optional()
})).handler(updateMyProfile_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	const updates = { updatedAt: Date.now() };
	if (data.fullName !== void 0) updates["fullName"] = data.fullName;
	if (data.phone !== void 0) updates["phone"] = data.phone;
	if (data.department !== void 0) updates["department"] = data.department;
	if (data.nickname !== void 0) updates["nickname"] = data.nickname;
	await fsSet("users", profile.id, updates);
});
var getOwnerStatus_createServerFn_handler = createServerRpc({
	id: "4844a7cc5dd7a922320e740dafaff34e54c45eeb260dbe128a3058107be06653",
	name: "getOwnerStatus",
	filename: "src/lib/server-fns.ts"
}, (opts) => getOwnerStatus.__executeServer(opts));
var getOwnerStatus = createServerFn({ method: "GET" }).handler(getOwnerStatus_createServerFn_handler, async () => {
	await requireProfile(getToken());
	return { hasOwner: (await fsList("users")).some((u) => u.role === "owner") };
});
var claimOwner_createServerFn_handler = createServerRpc({
	id: "c5c6487cbaeb8d48ab0ec1b44b5be222405732ca65b0dac4d57ce187a12b83a4",
	name: "claimOwner",
	filename: "src/lib/server-fns.ts"
}, (opts) => claimOwner.__executeServer(opts));
var claimOwner = createServerFn({ method: "POST" }).handler(claimOwner_createServerFn_handler, async () => {
	const profile = await requireProfile(getToken());
	if ((await fsList("users")).some((u) => u.role === "owner")) throw new AppError("auth/owner-exists");
	await fsSet("users", profile.id, {
		role: "owner",
		updatedAt: Date.now()
	});
	await logAudit(profile, "user.role", profile.id, "owner");
	return { success: true };
});
var setupOwnerAccount_createServerFn_handler = createServerRpc({
	id: "d7778299dc6705d1c66bbfa10ca27843c7deb9e654d4f41a8a580592dd6bee89",
	name: "setupOwnerAccount",
	filename: "src/lib/server-fns.ts"
}, (opts) => setupOwnerAccount.__executeServer(opts));
var setupOwnerAccount = createServerFn({ method: "POST" }).validator(objectType({
	email: stringType().email(),
	password: stringType()
})).handler(setupOwnerAccount_createServerFn_handler, async ({ data }) => {
	const users = await fsList("users");
	if (users.find((u) => u.role === "owner")) throw new AppError("auth/owner-exists");
	const user = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
	if (!user) throw new AppError("auth/user-not-found");
	await fsSet("users", user.id, {
		role: "owner",
		updatedAt: Date.now()
	});
	return { success: true };
});
var createUserProfile_createServerFn_handler = createServerRpc({
	id: "6c10f1fa962d702489b9449cc0b55721bd8c7a67314e74e1216e5def48f57806",
	name: "createUserProfile",
	filename: "src/lib/server-fns.ts"
}, (opts) => createUserProfile.__executeServer(opts));
var createUserProfile = createServerFn({ method: "POST" }).validator(objectType({
	id: stringType(),
	fullName: stringType(),
	email: stringType(),
	phone: stringType().optional(),
	department: stringType().optional(),
	courseId: stringType().optional()
})).handler(createUserProfile_createServerFn_handler, async ({ data }) => {
	const existing = await fsGet("users", data.id);
	if (existing) return existing;
	const now = Date.now();
	const profile = {
		id: data.id,
		uid: data.id,
		fullName: data.fullName,
		email: data.email.toLowerCase().trim(),
		role: "student",
		courseIds: [],
		status: "active",
		activationStatus: "pending",
		createdAt: now,
		updatedAt: now,
		...data.phone && { phone: data.phone },
		...data.department && { department: data.department }
	};
	await fsSet("users", data.id, profile);
	return profile;
});
var getRankings_createServerFn_handler = createServerRpc({
	id: "73cc446412689f2de49fa03948cfc649d38fe75afca6db5d32c096cf6f685d6a",
	name: "getRankings",
	filename: "src/lib/server-fns.ts"
}, (opts) => getRankings.__executeServer(opts));
var getRankings = createServerFn({ method: "GET" }).handler(getRankings_createServerFn_handler, async () => {
	const profile = await requireProfile(getToken());
	const [attempts, users, settingsDoc] = await Promise.all([
		fsList("examAttempts"),
		fsList("users"),
		fsGet("settings", "academy")
	]);
	const submitted = attempts.filter((a) => a.status === "graded" && a.published);
	const students = users.filter((u) => u.role === "student");
	const rankingsPublished = settingsDoc?.rankingsPublished ?? false;
	const isStaff = profile.role === "owner" || profile.role === "admin" || profile.role === "instructor";
	const studentScores = students.map((student) => {
		const studentAttempts = submitted.filter((a) => a.studentId === student.id);
		const totalScore = studentAttempts.reduce((sum, a) => sum + (a.percentage ?? 0), 0);
		const avgScore = studentAttempts.length > 0 ? Math.round(totalScore / studentAttempts.length) : 0;
		const examCount = studentAttempts.length;
		const nickname = student?.nickname;
		return {
			id: student.id,
			fullName: student.fullName,
			email: student.email,
			nickname: nickname ?? `Student${student.id.slice(-4).toUpperCase()}`,
			avgScore,
			examCount,
			totalScore
		};
	});
	studentScores.sort((a, b) => {
		if (b.avgScore !== a.avgScore) return b.avgScore - a.avgScore;
		return b.examCount - a.examCount;
	});
	const ranked = studentScores.map((s, index) => ({
		...s,
		rank: index + 1
	}));
	if (isStaff) return {
		all: ranked,
		rankingsPublished,
		isStaff: true,
		myRank: null
	};
	const myRank = ranked.find((r) => r.id === profile.id) ?? null;
	if (rankingsPublished) return {
		all: ranked.map((r) => ({
			rank: r.rank,
			nickname: r.nickname,
			avgScore: r.avgScore,
			examCount: r.examCount,
			id: r.id === profile.id ? r.id : null
		})),
		rankingsPublished: true,
		isStaff: false,
		myRank
	};
	return {
		all: myRank ? [{
			rank: myRank.rank,
			nickname: myRank.nickname,
			avgScore: myRank.avgScore,
			examCount: myRank.examCount,
			id: myRank.id
		}] : [],
		rankingsPublished: false,
		isStaff: false,
		myRank
	};
});
var adminPublishRankings_createServerFn_handler = createServerRpc({
	id: "03820c8a77dbabd991be46621229d9f3e302c2a82a461e4c2603130f1729a53e",
	name: "adminPublishRankings",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminPublishRankings.__executeServer(opts));
var adminPublishRankings = createServerFn({ method: "POST" }).handler(adminPublishRankings_createServerFn_handler, async () => {
	const actor = await requireStaff(getToken());
	await fsSet("settings", "academy", {
		...await fsGet("settings", "academy") ?? {
			telegramHandle: "",
			telegramUrl: "",
			announcementOm: "",
			announcementEn: "",
			contactEmail: "",
			contactPhone: "",
			rankingsPublished: false
		},
		rankingsPublished: true
	});
	await logAudit(actor, "rankings.publish");
	return {
		success: true,
		rankingsPublished: true
	};
});
var adminUnpublishRankings_createServerFn_handler = createServerRpc({
	id: "524d220d43e7c0f3a69bd8d0fd7ebac0cae56e6e3e7ac1727f635732b0239026",
	name: "adminUnpublishRankings",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminUnpublishRankings.__executeServer(opts));
var adminUnpublishRankings = createServerFn({ method: "POST" }).handler(adminUnpublishRankings_createServerFn_handler, async () => {
	const actor = await requireStaff(getToken());
	await fsSet("settings", "academy", {
		...await fsGet("settings", "academy") ?? {
			telegramHandle: "",
			telegramUrl: "",
			announcementOm: "",
			announcementEn: "",
			contactEmail: "",
			contactPhone: "",
			rankingsPublished: false
		},
		rankingsPublished: false
	});
	await logAudit(actor, "rankings.unpublish");
	return {
		success: true,
		rankingsPublished: false
	};
});
var getExamLeaderboard_createServerFn_handler = createServerRpc({
	id: "329d7d93bafe0e512ea951004764c19199485846ee110e9557ea6bb1e44678df",
	name: "getExamLeaderboard",
	filename: "src/lib/server-fns.ts"
}, (opts) => getExamLeaderboard.__executeServer(opts));
var getExamLeaderboard = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(getExamLeaderboard_createServerFn_handler, async ({ data }) => {
	await requireProfile(getToken());
	const [attempts, users] = await Promise.all([fsQuery("examAttempts", [[
		"examId",
		"EQUAL",
		data.examId
	]]), fsList("users")]);
	const graded = attempts.filter((a) => a.status === "graded" && a.published);
	const userMap = new Map(users.map((u) => [u.id, u]));
	const bestByStudent = /* @__PURE__ */ new Map();
	for (const a of graded) {
		const prev = bestByStudent.get(a.studentId);
		if (!prev || a.percentage > prev.percentage) bestByStudent.set(a.studentId, a);
	}
	return [...bestByStudent.values()].sort((a, b) => b.percentage - a.percentage).map((a, idx) => {
		const nickname = userMap.get(a.studentId)?.nickname || `Student${(idx + 1).toString().padStart(3, "0")}`;
		return {
			rank: idx + 1,
			nickname,
			percentage: a.percentage,
			passed: a.passed,
			score: a.autoScore + a.manualScore,
			totalPoints: a.totalPoints
		};
	});
});
var downloadExamPdf_createServerFn_handler = createServerRpc({
	id: "ccf10e17702ebf0b43bec5d51567fe4656f616d216c847bab108646649c3b869",
	name: "downloadExamPdf",
	filename: "src/lib/server-fns.ts"
}, (opts) => downloadExamPdf.__executeServer(opts));
var downloadExamPdf = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(downloadExamPdf_createServerFn_handler, async ({ data }) => {
	const admin = await requireAdmin(getToken());
	const exam = await fsGet("exams", data.examId);
	if (!exam) throw new AppError("exam/not-found");
	const questions = (await Promise.all(exam.questionIds.map((qid) => fsGet("questions", qid)))).filter((q) => q !== null);
	await logAudit(admin, "exam.download", exam.id, exam.title);
	return {
		exam,
		questions,
		fileName: `${exam.title.replace(/\s+/g, "_")}_${Date.now()}.pdf`
	};
});
var adminDiagnostics_createServerFn_handler = createServerRpc({
	id: "948408cf8788e28104953655cb1fa380fd72517bc15f5020728f66bb7efb521f",
	name: "adminDiagnostics",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminDiagnostics.__executeServer(opts));
var adminDiagnostics = createServerFn({ method: "GET" }).handler(adminDiagnostics_createServerFn_handler, async () => {
	await requireStaff(getToken());
	return systemDiagnostics();
});
var adminAiExtractQuestions_createServerFn_handler = createServerRpc({
	id: "8f679be7f1961018b72f07617f60a80a93196dd7ffb4fb3e0f2368cbdc30df8c",
	name: "adminAiExtractQuestions",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminAiExtractQuestions.__executeServer(opts));
var adminAiExtractQuestions = createServerFn({ method: "POST" }).validator(objectType({ text: stringType().min(10) })).handler(adminAiExtractQuestions_createServerFn_handler, async ({ data }) => {
	await requireStaff(getToken());
	const apiKey = process.env["OPENROUTER_API_KEY"] ?? process.env["VITE_OPENROUTER_API_KEY"] ?? "";
	if (!apiKey) throw new AppError("ai/not-configured");
	try {
		const { aiExtractQuestions } = await import("./ai-import.server-CBI1n-Nj.mjs");
		return await aiExtractQuestions(data.text, apiKey);
	} catch (err) {
		throw new AppError((err instanceof Error ? err.message : String(err)).slice(0, 200));
	}
});
var AiQuestionSchema = objectType({
	id: stringType(),
	courseId: stringType(),
	topic: stringType(),
	type: enumType([
		"mcq",
		"truefalse",
		"short",
		"essay"
	]),
	language: enumType([
		"om",
		"en",
		"both"
	]),
	difficulty: enumType([
		"easy",
		"medium",
		"hard"
	]),
	textOm: stringType(),
	textEn: stringType().optional(),
	options: arrayType(objectType({
		id: stringType(),
		textOm: stringType(),
		textEn: stringType().optional()
	})),
	correctOptionId: stringType().optional(),
	correctBool: booleanType().optional(),
	expectedAnswer: stringType().optional(),
	rubric: stringType().optional(),
	explanationOm: stringType().optional(),
	explanationEn: stringType().optional(),
	points: numberType(),
	tags: arrayType(stringType()),
	approved: booleanType()
});
var adminBulkSaveQuestions_createServerFn_handler = createServerRpc({
	id: "3934edbd15388af2eab92a19b3db09c290d8034c9785659ee7daa8f35be9aefa",
	name: "adminBulkSaveQuestions",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminBulkSaveQuestions.__executeServer(opts));
var adminBulkSaveQuestions = createServerFn({ method: "POST" }).validator(objectType({ questions: arrayType(AiQuestionSchema) })).handler(adminBulkSaveQuestions_createServerFn_handler, async ({ data }) => {
	const actor = await requireStaff(getToken());
	const ids = [];
	for (const q of data.questions) {
		const isNew = !await fsGet("questions", q.id);
		const { explanationOm: _eo, explanationEn: _ee, ...clean } = {
			...q,
			rubric: q.rubric || q.explanationOm || "",
			updatedAt: Date.now(),
			...isNew ? { createdAt: Date.now() } : {}
		};
		await fsSet("questions", q.id, clean);
		ids.push(q.id);
	}
	await logAudit(actor, "question.bulkImport", void 0, `${ids.length} questions imported via AI`);
	return {
		saved: ids.length,
		ids
	};
});
var CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function randomSegment(len) {
	const bytes = crypto.getRandomValues(new Uint8Array(len));
	let out = "";
	for (const b of bytes) out += CODE_ALPHABET[b % 32];
	return out;
}
/** Generate one activation code in the form `OA-XXXX-XXXX`. */
function generateRawCode() {
	return `OA-${randomSegment(4)}-${randomSegment(4)}`;
}
function normalizeCode(raw) {
	return raw.trim().toUpperCase().replace(/[^A-Z0-9-]/g, "");
}
/**
* Find an activation code by raw user input.
* Hashes the normalized input and queries the activationCodes collection.
*/
async function findCodeByRaw(raw) {
	const norm = normalizeCode(raw);
	if (!norm) return null;
	const matches = await fsQuery("activationCodes", [[
		"codeHash",
		"EQUAL",
		await sha256Hex(norm)
	]]);
	if (matches.length === 0) return null;
	return matches[0];
}
/**
* Upsert enrollment: activate (or re-activate) `userId` in `courseId` and mark
* it paid. Used both during code redemption and for admin manual activation.
* Returns the enrollment id.
*/
async function activateEnrollment(userId, courseId, { activatedByCodeId, expiresAt }) {
	const now = Date.now();
	const existing = await fsQuery("enrollments", [[
		"userId",
		"EQUAL",
		userId
	], [
		"courseId",
		"EQUAL",
		courseId
	]]);
	const base = {
		userId,
		courseId,
		status: "active",
		paymentStatus: "paid",
		activatedByCodeId,
		enrolledAt: now,
		expiresAt,
		updatedAt: now
	};
	if (existing[0]) {
		const id = existing[0].id;
		await fsSet("enrollments", id, base);
		return id;
	}
	return await fsCreate("enrollments", {
		...base,
		createdAt: now
	});
}
var generateActivationCodes_createServerFn_handler = createServerRpc({
	id: "c1c13a9c5b5397b32c2e4224fdf69130790e4abb097a3df23cd348fa07e7cfa7",
	name: "generateActivationCodes",
	filename: "src/lib/server-fns.ts"
}, (opts) => generateActivationCodes.__executeServer(opts));
var generateActivationCodes = createServerFn({ method: "POST" }).validator(objectType({
	count: numberType().int().min(1).max(500),
	courseId: stringType().nullable().optional(),
	assignedUserId: stringType().nullable().optional(),
	expiresAt: numberType().nullable().optional(),
	note: stringType().optional()
})).handler(generateActivationCodes_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const now = Date.now();
	const out = [];
	const n = Math.max(1, Math.min(500, Math.floor(data.count)));
	for (let i = 0; i < n; i++) {
		const raw = generateRawCode();
		const hash = await sha256Hex(raw);
		const codeLast4 = raw.slice(-4);
		const record = {
			id: crypto.randomUUID(),
			codeHash: hash,
			codeLast4,
			status: "available",
			assignedUserId: data.assignedUserId ?? null,
			courseId: data.courseId ?? null,
			createdBy: actor.id,
			createdAt: now,
			expiresAt: data.expiresAt ?? null,
			usedAt: null,
			usedByUserId: null,
			revokedAt: null,
			revokedByUserId: null,
			...data.note ? { note: data.note } : {}
		};
		await fsCreate("activationCodes", record);
		out.push({
			...record,
			rawCode: raw
		});
	}
	await logAudit(actor, "activationCodes.generate", void 0, `Generated ${n} code(s)${data.courseId ? ` for course ${data.courseId}` : ""}${data.assignedUserId ? ` assigned to ${data.assignedUserId}` : ""}`);
	return out;
});
var redeemActivationCode_createServerFn_handler = createServerRpc({
	id: "d2672ea551baee501aef45db956be0d9306ff8fe4054440e312671bc4ea6fc05",
	name: "redeemActivationCode",
	filename: "src/lib/server-fns.ts"
}, (opts) => redeemActivationCode.__executeServer(opts));
var redeemActivationCode = createServerFn({ method: "POST" }).validator(objectType({ code: stringType().min(6).max(64) })).handler(redeemActivationCode_createServerFn_handler, async ({ data }) => {
	const profile = await requireProfile(getToken());
	if (profile.activationStatus === "active") return {
		ok: true,
		activationStatus: "active",
		courseId: null
	};
	if (profile.activationStatus === "suspended" || profile.activationStatus === "expired" || profile.activationStatus === "rejected") throw new AppError("activation/account-locked");
	if (profile.activationStatus === "pending") throw new AppError("activation/not-approved");
	const code = await findCodeByRaw(data.code);
	if (!code) throw new AppError("activation/invalid-code");
	const now = Date.now();
	if (code.status === "used") throw new AppError("activation/code-used");
	if (code.status === "revoked") throw new AppError("activation/code-revoked");
	if (code.expiresAt && code.expiresAt < now) throw new AppError("activation/code-expired");
	if (code.assignedUserId && code.assignedUserId !== profile.id) throw new AppError("activation/code-wrong-user");
	const fresh = await fsGet("activationCodes", code.id);
	if (!fresh || fresh.status !== "available") throw new AppError("activation/code-used");
	const updatedCode = {
		...fresh,
		status: "used",
		usedAt: now,
		usedByUserId: profile.id
	};
	await fsSet("activationCodes", fresh.id, updatedCode);
	const profilePatch = {
		activationStatus: "active",
		activatedAt: now,
		activationCodeId: fresh.id,
		updatedAt: now
	};
	const activatedCourseId = fresh.courseId;
	if (activatedCourseId) profilePatch["courseIds"] = [.../* @__PURE__ */ new Set([...profile.courseIds ?? [], activatedCourseId])];
	await fsSet("users", profile.id, profilePatch);
	let enrollmentId = null;
	if (activatedCourseId) enrollmentId = await activateEnrollment(profile.id, activatedCourseId, {
		activatedByCodeId: fresh.id,
		expiresAt: fresh.expiresAt
	});
	await logAudit(profile, "activation.redeemed", activatedCourseId ?? void 0, `code=${fresh.codeLast4}${enrollmentId ? ` enrollment=${enrollmentId}` : ""}`);
	return {
		ok: true,
		activationStatus: "active",
		courseId: activatedCourseId
	};
});
var adminListActivationCodes_createServerFn_handler = createServerRpc({
	id: "f05d8dd60a3997739791af205a40dd153cc314795816500edfaa88ce87b82365",
	name: "adminListActivationCodes",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListActivationCodes.__executeServer(opts));
var adminListActivationCodes = createServerFn({ method: "GET" }).validator(objectType({
	status: enumType([
		"all",
		"available",
		"used",
		"expired",
		"revoked"
	]).optional(),
	courseId: stringType().nullable().optional(),
	searchLast4: stringType().nullable().optional(),
	assignedUserId: stringType().nullable().optional()
}).optional()).handler(adminListActivationCodes_createServerFn_handler, async ({ data }) => {
	await requireStaff(getToken());
	const all = await fsList("activationCodes");
	const users = await fsList("users");
	const courses = await fsList("courses");
	const userById = new Map(users.map((u) => [u.id, u]));
	const courseById = new Map(courses.map((c) => [c.id, c]));
	const filt = data ?? {};
	const out = [];
	for (const c of all) {
		if (filt.status && filt.status !== "all" && c.status !== filt.status) continue;
		if (filt.courseId && c.courseId !== filt.courseId) continue;
		if (filt.assignedUserId && c.assignedUserId !== filt.assignedUserId) continue;
		if (filt.searchLast4 && !c.codeLast4.includes(filt.searchLast4.toUpperCase())) continue;
		const usedBy = c.usedByUserId ? userById.get(c.usedByUserId) : void 0;
		const assigned = c.assignedUserId ? userById.get(c.assignedUserId) : void 0;
		const course = c.courseId ? courseById.get(c.courseId) : void 0;
		out.push({
			...c,
			usedByUserName: usedBy ? usedBy.fullName : void 0,
			assignedUserName: assigned ? assigned.fullName : void 0,
			courseTitleOm: course?.titleOm,
			courseTitleEn: course?.titleEn
		});
	}
	out.sort((a, b) => b.createdAt - a.createdAt);
	return out;
});
var adminRevokeActivationCode_createServerFn_handler = createServerRpc({
	id: "e40777978aa08cef3a4dc3b2b94b8bcc17c6ab2193f026a7d2124967e47aa991",
	name: "adminRevokeActivationCode",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminRevokeActivationCode.__executeServer(opts));
var adminRevokeActivationCode = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(adminRevokeActivationCode_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const existing = await fsGet("activationCodes", data.id);
	if (!existing) throw new AppError("activation/not-found");
	if (existing.status === "used") throw new AppError("activation/code-used");
	const now = Date.now();
	await fsSet("activationCodes", data.id, {
		status: "revoked",
		revokedAt: now,
		revokedByUserId: actor.id,
		updatedAt: now
	});
	await logAudit(actor, "activationCodes.revoke", data.id);
});
var adminManualActivateStudent_createServerFn_handler = createServerRpc({
	id: "319c9ed95fe08f4ea80264e419b1c8f0e9c9d4b1ab862f5e3c1c665923d5c9c2",
	name: "adminManualActivateStudent",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminManualActivateStudent.__executeServer(opts));
var adminManualActivateStudent = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	courseIds: arrayType(stringType()).optional(),
	expiresAt: numberType().nullable().optional(),
	note: stringType().optional()
})).handler(adminManualActivateStudent_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const target = await fsGet("users", data.userId);
	if (!target) throw new AppError("auth/user-not-found");
	const now = Date.now();
	const profilePatch = {
		activationStatus: "active",
		status: "active",
		activatedAt: target.activatedAt ?? now,
		updatedAt: now
	};
	if (data.courseIds && data.courseIds.length > 0) profilePatch["courseIds"] = [.../* @__PURE__ */ new Set([...target.courseIds ?? [], ...data.courseIds])];
	await fsSet("users", target.id, profilePatch);
	if (data.courseIds && data.courseIds.length > 0) for (const courseId of data.courseIds) await activateEnrollment(target.id, courseId, {
		activatedByCodeId: null,
		expiresAt: data.expiresAt ?? null
	});
	await logAudit(actor, "activation.adminActivate", target.id, [`courses=${(data.courseIds ?? []).join(",") || "none"}`, data.note ? `note=${data.note}` : ""].filter(Boolean).join(" "));
});
var adminSetActivationStatus_createServerFn_handler = createServerRpc({
	id: "a35d140bedab0a0f9244dcc76e479a91cc4da86365af127eeb288e8db9207564",
	name: "adminSetActivationStatus",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminSetActivationStatus.__executeServer(opts));
var adminSetActivationStatus = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	activationStatus: enumType([
		"pending",
		"active",
		"suspended",
		"expired"
	])
})).handler(adminSetActivationStatus_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const target = await fsGet("users", data.userId);
	if (!target) throw new AppError("auth/user-not-found");
	const now = Date.now();
	await fsSet("users", target.id, {
		activationStatus: data.activationStatus,
		updatedAt: now
	});
	await logAudit(actor, `activation.setStatus.${data.activationStatus}`, target.id);
});
var getMyEnrollments_createServerFn_handler = createServerRpc({
	id: "d2773a5feea43339be2c7952a95cd7df06585ad07489d0f19a15df12ceca0796",
	name: "getMyEnrollments",
	filename: "src/lib/server-fns.ts"
}, (opts) => getMyEnrollments.__executeServer(opts));
var getMyEnrollments = createServerFn({ method: "GET" }).handler(getMyEnrollments_createServerFn_handler, async () => {
	const all = await fsQuery("enrollments", [[
		"userId",
		"EQUAL",
		(await requireProfile(getToken())).id
	]]);
	const now = Date.now();
	for (const e of all) if (e.status === "active" && e.expiresAt && e.expiresAt < now) {
		e.status = "expired";
		fsSet("enrollments", e.id, {
			status: "expired",
			updatedAt: now
		}).catch(() => void 0);
	}
	return all;
});
/**
* Return true if `profile` has an active, paid, non-expired enrollment for
* `courseId`. Staff users are treated as enrolled in every course.
*/
async function hasActiveEnrollment(profile, courseId) {
	if (profile.role === "owner" || profile.role === "admin" || profile.role === "instructor") return true;
	if (!courseId) return true;
	const list = await fsQuery("enrollments", [[
		"userId",
		"EQUAL",
		profile.id
	], [
		"courseId",
		"EQUAL",
		courseId
	]]);
	const now = Date.now();
	return list.some((e) => e.status === "active" && e.paymentStatus === "paid" && (!e.expiresAt || e.expiresAt >= now));
}
/**
* adminApproveStudent
*
* 1. Verifies the requester is admin/owner.
* 2. Generates a unique activation code assigned exclusively to this student.
* 3. Sets activationStatus = "approved" on the profile.
* 4. Records approvedBy + approvedAt.
* 5. The raw code is NOT returned here — the student sees it on their page
*    via getMyPendingCode, which is guarded to their own UID.
*/
var adminApproveStudent_createServerFn_handler = createServerRpc({
	id: "bc833ba626611f1fa2c090644c678220e95be02df4a3f39efe4142cbbcca6da2",
	name: "adminApproveStudent",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminApproveStudent.__executeServer(opts));
var adminApproveStudent = createServerFn({ method: "POST" }).validator(objectType({ userId: stringType() })).handler(adminApproveStudent_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const target = await fsGet("users", data.userId);
	if (!target) throw new AppError("auth/user-not-found");
	const now = Date.now();
	if (target.activationStatus === "active") {
		await logAudit(actor, "student.approveSkipped", target.id, "already active");
		return;
	}
	let codeId = target.assignedActivationCodeId ?? null;
	let rawCode = null;
	if (!codeId) {
		rawCode = generateRawCode();
		const hash = await sha256Hex(rawCode);
		const codeLast4 = rawCode.slice(-4);
		codeId = await fsCreate("activationCodes", {
			id: crypto.randomUUID(),
			codeHash: hash,
			codeLast4,
			status: "available",
			assignedUserId: target.id,
			courseId: null,
			createdBy: actor.id,
			createdAt: now,
			expiresAt: null,
			usedAt: null,
			usedByUserId: null,
			revokedAt: null,
			revokedByUserId: null,
			note: `Auto-generated on approval for ${target.email}`
		});
		await fsSet("activationCodeSecrets", codeId, {
			rawCode,
			userId: target.id,
			createdAt: now
		});
	}
	await fsSet("users", target.id, {
		activationStatus: "approved",
		assignedActivationCodeId: codeId,
		approvedBy: actor.id,
		approvedAt: now,
		rejectedBy: null,
		rejectedAt: null,
		rejectionReason: null,
		updatedAt: now
	});
	await logAudit(actor, "student.approved", target.id, target.email);
});
var adminRejectStudent_createServerFn_handler = createServerRpc({
	id: "04418f6767336d41d1bcfd140184d3a0c3944d4cb39709a1bd6ec5c432938ecf",
	name: "adminRejectStudent",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminRejectStudent.__executeServer(opts));
var adminRejectStudent = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	reason: stringType().optional()
})).handler(adminRejectStudent_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const target = await fsGet("users", data.userId);
	if (!target) throw new AppError("auth/user-not-found");
	const now = Date.now();
	await fsSet("users", target.id, {
		activationStatus: "rejected",
		rejectedBy: actor.id,
		rejectedAt: now,
		rejectionReason: data.reason ?? null,
		updatedAt: now
	});
	await logAudit(actor, "student.rejected", target.id, data.reason ?? target.email);
});
var adminReApproveStudent_createServerFn_handler = createServerRpc({
	id: "21df95364390341a547d6142683cd89e5182e9b9cd1aeb22bccd9cb9938808fc",
	name: "adminReApproveStudent",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminReApproveStudent.__executeServer(opts));
var adminReApproveStudent = createServerFn({ method: "POST" }).validator(objectType({ userId: stringType() })).handler(adminReApproveStudent_createServerFn_handler, async ({ data }) => {
	const actor = await requireAdmin(getToken());
	const target = await fsGet("users", data.userId);
	if (!target) throw new AppError("auth/user-not-found");
	const now = Date.now();
	let codeId = target.assignedActivationCodeId ?? null;
	if (!codeId) {
		const rawCode = generateRawCode();
		const hash = await sha256Hex(rawCode);
		const codeLast4 = rawCode.slice(-4);
		codeId = await fsCreate("activationCodes", {
			id: crypto.randomUUID(),
			codeHash: hash,
			codeLast4,
			status: "available",
			assignedUserId: target.id,
			courseId: null,
			createdBy: actor.id,
			createdAt: now,
			expiresAt: null,
			usedAt: null,
			usedByUserId: null,
			revokedAt: null,
			revokedByUserId: null,
			note: `Re-approval code for ${target.email}`
		});
		await fsSet("activationCodeSecrets", codeId, {
			rawCode,
			userId: target.id,
			createdAt: now
		});
	}
	await fsSet("users", target.id, {
		activationStatus: "approved",
		assignedActivationCodeId: codeId,
		approvedBy: actor.id,
		approvedAt: now,
		rejectedBy: null,
		rejectedAt: null,
		rejectionReason: null,
		updatedAt: now
	});
	await logAudit(actor, "student.reApproved", target.id, target.email);
});
var getMyPendingCode_createServerFn_handler = createServerRpc({
	id: "fb51675efd869ab6bea5aba6348a5b2aa0a91395bd313f725558c5c5be15d389",
	name: "getMyPendingCode",
	filename: "src/lib/server-fns.ts"
}, (opts) => getMyPendingCode.__executeServer(opts));
var getMyPendingCode = createServerFn({ method: "GET" }).handler(getMyPendingCode_createServerFn_handler, async () => {
	const profile = await requireProfile(getToken());
	const status = profile.activationStatus ?? "pending";
	if (status !== "approved") return {
		code: null,
		status
	};
	const codeId = profile.assignedActivationCodeId;
	if (!codeId) return {
		code: null,
		status
	};
	const secret = await fsGet("activationCodeSecrets", codeId);
	if (!secret || secret.userId !== profile.id) return {
		code: null,
		status
	};
	return {
		code: secret.rawCode,
		status
	};
});
var adminListPendingStudents_createServerFn_handler = createServerRpc({
	id: "b8edbc55f21179b93193c7f2bd5af38274646a53f871d128e41848adf8c3be5e",
	name: "adminListPendingStudents",
	filename: "src/lib/server-fns.ts"
}, (opts) => adminListPendingStudents.__executeServer(opts));
var adminListPendingStudents = createServerFn({ method: "GET" }).handler(adminListPendingStudents_createServerFn_handler, async () => {
	await requireAdmin(getToken());
	return (await fsList("users")).filter((u) => u.role === "student").sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
});
//#endregion
export { adminAiExtractQuestions_createServerFn_handler, adminApproveStudent_createServerFn_handler, adminBulkSaveQuestions_createServerFn_handler, adminDeleteCourse_createServerFn_handler, adminDeleteExam_createServerFn_handler, adminDeleteQuestion_createServerFn_handler, adminDiagnostics_createServerFn_handler, adminGetAnalytics_createServerFn_handler, adminGetSettings_createServerFn_handler, adminGradeAttempt_createServerFn_handler, adminListActivationCodes_createServerFn_handler, adminListAttempts_createServerFn_handler, adminListAudit_createServerFn_handler, adminListCourses_createServerFn_handler, adminListExams_createServerFn_handler, adminListPendingStudents_createServerFn_handler, adminListQuestions_createServerFn_handler, adminListStudents_createServerFn_handler, adminManualActivateStudent_createServerFn_handler, adminPublishAllResults_createServerFn_handler, adminPublishRankings_createServerFn_handler, adminPublishResult_createServerFn_handler, adminPushNotification_createServerFn_handler, adminReApproveStudent_createServerFn_handler, adminRejectStudent_createServerFn_handler, adminRevokeActivationCode_createServerFn_handler, adminSaveCourse_createServerFn_handler, adminSaveExam_createServerFn_handler, adminSaveQuestion_createServerFn_handler, adminSaveSettings_createServerFn_handler, adminSetActivationStatus_createServerFn_handler, adminSetRole_createServerFn_handler, adminSetStatus_createServerFn_handler, adminUnpublishRankings_createServerFn_handler, availableExams_createServerFn_handler, claimOwner_createServerFn_handler, createUserProfile_createServerFn_handler, downloadExamPdf_createServerFn_handler, generateActivationCodes_createServerFn_handler, getExamInfo_createServerFn_handler, getExamLeaderboard_createServerFn_handler, getMyEnrollments_createServerFn_handler, getMyPendingCode_createServerFn_handler, getMyProfile_createServerFn_handler, getMyResult_createServerFn_handler, getOwnerStatus_createServerFn_handler, getRankings_createServerFn_handler, myAttempts_createServerFn_handler, redeemActivationCode_createServerFn_handler, saveAnswer_createServerFn_handler, setupOwnerAccount_createServerFn_handler, startExam_createServerFn_handler, submitExam_createServerFn_handler, updateMyProfile_createServerFn_handler };
