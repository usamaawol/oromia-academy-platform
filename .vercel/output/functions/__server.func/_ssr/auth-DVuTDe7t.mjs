import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { c as sendPasswordResetEmail, d as signInWithRedirect, f as signOut, l as signInWithEmailAndPassword, m as updateProfile, n as GoogleAuthProvider, o as onAuthStateChanged, p as updatePassword, r as createUserWithEmailAndPassword, s as reauthenticateWithCredential, t as EmailAuthProvider, u as signInWithPopup } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { c as setDoc, d as doc, l as where, n as getDocs, r as limit, s as query, t as getDoc, u as collection } from "../_libs/@firebase/firestore+[...].mjs";
import { n as getDb, r as getFirebaseAuth, t as firebaseReady } from "./firebase-Bve1OLnm.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-DVuTDe7t.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEFAULT_SETTINGS = {
	telegramHandle: "@SuufiyaanBJICS",
	telegramUrl: "https://t.me/SuufiyaanBJICS",
	heroTitleOm: "",
	heroTitleEn: "",
	heroSubtitleOm: "",
	heroSubtitleEn: "",
	announcementOm: "",
	announcementEn: "",
	contactEmail: "",
	contactPhone: ""
};
var col = {
	users: () => collection(getDb(), "users"),
	courses: () => collection(getDb(), "courses"),
	questions: () => collection(getDb(), "questions"),
	exams: () => collection(getDb(), "exams"),
	attempts: () => collection(getDb(), "examAttempts"),
	notifications: () => collection(getDb(), "notifications"),
	auditLogs: () => collection(getDb(), "auditLogs"),
	settings: () => collection(getDb(), "settings")
};
function withId(id, data) {
	return {
		id,
		...data
	};
}
async function getUserProfile(uid) {
	const snap = await getDoc(doc(col.users(), uid));
	return snap.exists() ? withId(snap.id, snap.data()) : null;
}
async function saveUserProfile(profile) {
	const { id, ...rest } = profile;
	await setDoc(doc(col.users(), id), {
		id,
		...rest,
		updatedAt: Date.now()
	}, { merge: true });
}
async function listCourses() {
	return (await getDocs(col.courses())).docs.map((d) => withId(d.id, d.data())).sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
}
async function listNotifications(userId) {
	const [mine, broadcast] = await Promise.all([getDocs(query(col.notifications(), where("userId", "==", userId), limit(50))), getDocs(query(col.notifications(), where("userId", "==", "all"), limit(50)))]);
	return [...mine.docs, ...broadcast.docs].map((d) => withId(d.id, d.data())).sort((a, b) => b.createdAt - a.createdAt).slice(0, 50);
}
/**
* Offline / demo data layer.
* Used when Firebase credentials are not configured so the whole app stays
* usable and visible. Data persists in localStorage per browser.
*/
var KEY = "oa.localdb.v2";
function uid(prefix = "id") {
	return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}
var now = Date.now();
var courses = [
	{
		id: "c_ai",
		titleOm: "Gulaallii AI (AI Editing)",
		titleEn: "AI Editing",
		descOm: "Suuraa, sagalee fi viidiyoo meeshaalee AI'tiin gulaaluu.",
		descEn: "Edit images, audio and video using modern AI tools.",
		icon: "sparkles",
		level: "easy",
		status: "active",
		instructor: "Usama Awol",
		lessons: 12,
		order: 1,
		createdAt: now
	},
	{
		id: "c_tg",
		titleOm: "Telegram irraa Galii Argachuu",
		titleEn: "Telegram Earning",
		descOm: "Karaa Telegram hojii fi galii dhugaa uumuu.",
		descEn: "Build real income streams with Telegram channels and services.",
		icon: "send",
		level: "medium",
		status: "active",
		instructor: "Usama Awol",
		lessons: 9,
		order: 2,
		createdAt: now
	},
	{
		id: "c_bot",
		titleOm: "Bot Automation",
		titleEn: "Bot Automation",
		descOm: "Bot ofumaan hojjetu ijaaruu fi bulchuu.",
		descEn: "Design, build and operate automation bots.",
		icon: "bot",
		level: "hard",
		status: "active",
		instructor: "Usama Awol",
		lessons: 14,
		order: 3,
		createdAt: now
	}
];
function mcq(id, courseId, topic, text, textEn, opts, correctIdx) {
	return {
		id,
		courseId,
		topic,
		type: "mcq",
		language: "both",
		difficulty: "easy",
		text,
		textEn,
		options: opts.map((o, i) => ({
			id: `o${i + 1}`,
			text: o
		})),
		correctOptionId: `o${correctIdx + 1}`,
		points: 1,
		tags: [topic],
		approved: true,
		source: "manual",
		createdAt: now
	};
}
var questions = [
	mcq("q1", "c_ai", "Bu'uura", "AI jechuun maal jechuudha?", "What does AI stand for?", [
		"Artificial Intelligence",
		"Automatic Internet",
		"Applied Image",
		"Audio Input"
	], 0),
	mcq("q2", "c_ai", "Meeshaalee", "Meeshaan kam suuraa uumuuf oola?", "Which tool is used to generate images?", [
		"Midjourney",
		"Excel",
		"Notepad",
		"WinRAR"
	], 0),
	{
		id: "q3",
		courseId: "c_ai",
		topic: "Bu'uura",
		type: "truefalse",
		language: "both",
		difficulty: "easy",
		text: "AI suuraa haaraa uumuu danda'a.",
		textEn: "AI can generate brand new images.",
		options: [],
		correctBool: true,
		points: 1,
		tags: ["basics"],
		approved: true,
		source: "manual",
		createdAt: now
	},
	mcq("q4", "c_tg", "Telegram", "Chaanaalii Telegram irratti galii argachuuf karaa filatamaan kami?", "What is a common way to earn on Telegram?", [
		"Beeksisa gurguruu",
		"Bilbila cufuu",
		"Faayila haquu",
		"Interneetii dhaamsuu"
	], 0),
	{
		id: "q5",
		courseId: "c_tg",
		topic: "Telegram",
		type: "short",
		language: "both",
		difficulty: "medium",
		text: "Chaanaalii kee guddisuuf tooftaa tokko barreessi.",
		textEn: "Write one strategy to grow your channel.",
		options: [],
		expectedAnswer: "Consistent content, collaborations, SEO-friendly names.",
		rubric: "Any reasonable growth tactic earns full points.",
		points: 2,
		tags: ["growth"],
		approved: true,
		source: "manual",
		createdAt: now
	},
	mcq("q6", "c_bot", "Automation", "Bot Telegram ijaaruuf token eessaa argatta?", "Where do you get a Telegram bot token?", [
		"@BotFather",
		"@Support",
		"Google Drive",
		"Play Store"
	], 0),
	{
		id: "q7",
		courseId: "c_bot",
		topic: "Automation",
		type: "truefalse",
		language: "both",
		difficulty: "medium",
		text: "Webhook bot dhaaf dhaamsa fida.",
		textEn: "A webhook delivers messages to a bot.",
		options: [],
		correctBool: true,
		points: 1,
		tags: ["webhook"],
		approved: true,
		source: "manual",
		createdAt: now
	}
];
var exams = [
	{
		id: "e_ai1",
		title: "AI Editing — Qormaata Bu'uuraa",
		courseId: "c_ai",
		topic: "Bu'uura",
		description: "Qormaata bu'uuraa AI Editing.",
		instructions: "Gaaffii hunda deebisi. Yeroon daangeffameera.",
		language: "both",
		instructor: "Usama Awol",
		startAt: null,
		endAt: null,
		durationMin: 15,
		maxAttempts: 2,
		password: "1234",
		passMark: 50,
		questionIds: [
			"q1",
			"q2",
			"q3"
		],
		poolSize: 0,
		shuffleQuestions: true,
		shuffleOptions: true,
		allowBackward: true,
		oneAtATime: false,
		requireFullscreen: false,
		trackTabs: true,
		resultPolicy: "immediate",
		resultsPublished: true,
		showAnswersAfter: true,
		status: "active",
		createdAt: now
	},
	{
		id: "e_tg1",
		title: "Telegram Earning — Qormaata 1",
		courseId: "c_tg",
		topic: "Telegram",
		description: "Telegram irraa galii argachuu.",
		instructions: "Deebii gabaabaa ifa ta'e barreessi.",
		language: "both",
		instructor: "Usama Awol",
		startAt: null,
		endAt: null,
		durationMin: 20,
		maxAttempts: 1,
		password: "tg2026",
		passMark: 60,
		questionIds: ["q4", "q5"],
		poolSize: 0,
		shuffleQuestions: false,
		shuffleOptions: true,
		allowBackward: true,
		oneAtATime: false,
		requireFullscreen: false,
		trackTabs: true,
		resultPolicy: "manual",
		resultsPublished: false,
		showAnswersAfter: false,
		status: "active",
		createdAt: now
	},
	{
		id: "e_bot1",
		title: "Bot Automation — Qormaata 1",
		courseId: "c_bot",
		topic: "Automation",
		description: "Bot ijaaruu fi bulchuu.",
		instructions: "Yeroo kee sirriitti fayyadami.",
		language: "both",
		instructor: "Usama Awol",
		startAt: null,
		endAt: null,
		durationMin: 25,
		maxAttempts: 0,
		password: "bot2026",
		passMark: 50,
		questionIds: ["q6", "q7"],
		poolSize: 0,
		shuffleQuestions: true,
		shuffleOptions: true,
		allowBackward: false,
		oneAtATime: true,
		requireFullscreen: false,
		trackTabs: true,
		resultPolicy: "immediate",
		resultsPublished: true,
		showAnswersAfter: true,
		status: "active",
		createdAt: now
	}
];
function seed() {
	return {
		users: [],
		courses,
		questions,
		exams,
		attempts: [],
		notifications: [{
			id: "n1",
			userId: "all",
			titleOm: "Baga nagaan dhuftan!",
			titleEn: "Welcome to Oromia Academy!",
			bodyOm: "Qormaata jalqabuuf gara daashboordii deemi.",
			bodyEn: "Head to your dashboard to start an exam.",
			createdAt: now
		}],
		audit: [],
		settings: DEFAULT_SETTINGS,
		activationCodes: [],
		enrollments: []
	};
}
var cache = null;
function readDb() {
	if (cache) return cache;
	if (typeof window === "undefined") {
		cache = seed();
		return cache;
	}
	try {
		const raw = window.localStorage.getItem(KEY);
		cache = raw ? {
			...seed(),
			...JSON.parse(raw)
		} : seed();
	} catch {
		cache = seed();
	}
	return cache;
}
function writeDb(next) {
	cache = next;
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(KEY, JSON.stringify(next));
	} catch {}
}
function mutate(fn) {
	const db = { ...readDb() };
	fn(db);
	writeDb(db);
	return db;
}
var Ctx = (0, import_react.createContext)(null);
var SESSION_KEY = "oa.session";
var PW_KEY = "oa.pw";
function readPw() {
	try {
		return JSON.parse(window.localStorage.getItem(PW_KEY) ?? "{}");
	} catch {
		return {};
	}
}
function AuthProvider({ children }) {
	const [user, setUser] = (0, import_react.useState)(null);
	const [profile, setProfile] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const localMode = !firebaseReady;
	const loadProfile = (0, import_react.useCallback)(async (u) => {
		let p = await getUserProfile(u.uid);
		const now = Date.now();
		if (!p) {
			p = {
				id: u.uid,
				uid: u.uid,
				fullName: u.displayName ?? (u.email ?? "").split("@")[0] ?? "",
				email: u.email ?? "",
				role: "student",
				status: "active",
				activationStatus: "pending",
				enrolledCourseIds: [],
				createdAt: now,
				updatedAt: now
			};
			await saveUserProfile(p);
		} else {
			let changed = false;
			if (!p.activationStatus) {
				const isStaff = p.role === "owner" || p.role === "admin" || p.role === "instructor";
				const hasAnyCourse = (p.enrolledCourseIds?.length ?? 0) > 0 || (p.courseIds?.length ?? 0) > 0;
				p.activationStatus = isStaff || hasAnyCourse ? "active" : "pending";
				changed = true;
			}
			if (!p.updatedAt) {
				p.updatedAt = now;
				changed = true;
			}
			if (changed) await saveUserProfile(p);
		}
		setProfile(p);
	}, []);
	(0, import_react.useEffect)(() => {
		if (localMode) {
			try {
				const id = window.localStorage.getItem(SESSION_KEY);
				const p = id ? readDb().users.find((u) => u.id === id) ?? null : null;
				if (p) {
					setUser({
						uid: p.id,
						email: p.email,
						displayName: p.fullName
					});
					setProfile(p);
				}
			} catch {}
			setLoading(false);
			return;
		}
		return onAuthStateChanged(getFirebaseAuth(), async (u) => {
			setUser(u ? {
				uid: u.uid,
				email: u.email,
				displayName: u.displayName
			} : null);
			if (u) try {
				await loadProfile({
					uid: u.uid,
					email: u.email,
					displayName: u.displayName
				});
			} catch (err) {
				console.error(err);
			}
			else setProfile(null);
			setLoading(false);
		});
	}, [loadProfile, localMode]);
	const register = (0, import_react.useCallback)(async (input) => {
		const email = input.email.trim();
		if (localMode) {
			if (readDb().users.find((u) => u.email.toLowerCase() === email.toLowerCase())) throw { code: "auth/email-already-in-use" };
			if (input.password.length < 6) throw { code: "auth/weak-password" };
			const id = uid("u");
			const now = Date.now();
			const p = {
				id,
				uid: id,
				fullName: input.fullName,
				email,
				...input.phone ? { phone: input.phone } : {},
				...input.department ? { department: input.department } : {},
				role: "student",
				status: "active",
				activationStatus: "pending",
				enrolledCourseIds: [],
				courseIds: [],
				createdAt: now,
				updatedAt: now
			};
			mutate((db) => {
				db.users = [...db.users, p];
			});
			const pw = readPw();
			pw[p.id] = input.password;
			window.localStorage.setItem(PW_KEY, JSON.stringify(pw));
			window.localStorage.setItem(SESSION_KEY, p.id);
			setUser({
				uid: p.id,
				email: p.email,
				displayName: p.fullName
			});
			setProfile(p);
			return;
		}
		const cred = await createUserWithEmailAndPassword(getFirebaseAuth(), email, input.password);
		await updateProfile(cred.user, { displayName: input.fullName });
		const canonicalEmail = (cred.user.email ?? email).toLowerCase().trim();
		const now = Date.now();
		const p = {
			id: cred.user.uid,
			uid: cred.user.uid,
			fullName: input.fullName,
			email: canonicalEmail,
			...input.phone ? { phone: input.phone } : {},
			...input.department ? { department: input.department } : {},
			role: "student",
			status: "active",
			activationStatus: "pending",
			enrolledCourseIds: [],
			courseIds: [],
			createdAt: now,
			updatedAt: now
		};
		await saveUserProfile(p);
		setProfile(p);
	}, [localMode]);
	const login = (0, import_react.useCallback)(async (email, password) => {
		if (localMode) {
			const p = readDb().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
			const pw = readPw();
			if (!p || pw[p.id] !== password) throw { code: "auth/invalid-credential" };
			window.localStorage.setItem(SESSION_KEY, p.id);
			setUser({
				uid: p.id,
				email: p.email,
				displayName: p.fullName
			});
			setProfile(p);
			return;
		}
		await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
	}, [localMode]);
	const loginWithGoogle = (0, import_react.useCallback)(async () => {
		if (localMode) throw { code: "auth/google-unavailable" };
		const provider = new GoogleAuthProvider();
		provider.setCustomParameters({ prompt: "select_account" });
		try {
			await signInWithPopup(getFirebaseAuth(), provider);
		} catch (err) {
			const code = err?.code ?? "";
			if (code === "auth/popup-blocked" || code === "auth/operation-not-supported-in-this-environment") {
				await signInWithRedirect(getFirebaseAuth(), provider);
				return;
			}
			console.error("Google Sign-In Error:", err);
			throw err;
		}
	}, [localMode]);
	const logout = (0, import_react.useCallback)(async () => {
		if (localMode) {
			window.localStorage.removeItem(SESSION_KEY);
			setUser(null);
			setProfile(null);
			return;
		}
		await signOut(getFirebaseAuth());
		setProfile(null);
	}, [localMode]);
	const resetPassword = (0, import_react.useCallback)(async (email) => {
		if (localMode) return;
		await sendPasswordResetEmail(getFirebaseAuth(), email.trim(), { url: `${window.location.origin}/auth` });
	}, [localMode]);
	const changePassword = (0, import_react.useCallback)(async (currentPassword, newPassword) => {
		if (localMode) {
			if (!user) throw { code: "auth/user-not-found" };
			const pw = readPw();
			if (pw[user.uid] !== currentPassword) throw { code: "auth/wrong-password" };
			pw[user.uid] = newPassword;
			window.localStorage.setItem(PW_KEY, JSON.stringify(pw));
			return;
		}
		const currentUser = getFirebaseAuth().currentUser;
		if (!currentUser || !currentUser.email) throw { code: "auth/user-not-found" };
		const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
		await reauthenticateWithCredential(currentUser, credential);
		await updatePassword(currentUser, newPassword);
	}, [localMode, user]);
	const refreshProfile = (0, import_react.useCallback)(async () => {
		if (!user) return;
		if (localMode) {
			setProfile(readDb().users.find((u) => u.id === user.uid) ?? null);
			return;
		}
		await loadProfile(user);
	}, [
		user,
		loadProfile,
		localMode
	]);
	const updateDepartment = (0, import_react.useCallback)(async (department) => {
		if (!profile) return;
		const next = {
			...profile,
			department
		};
		if (localMode) mutate((db) => {
			db.users = db.users.map((u) => u.id === next.id ? next : u);
		});
		else await saveUserProfile(next);
		setProfile(next);
	}, [profile, localMode]);
	const activationStatus = profile?.activationStatus ?? void 0;
	const isStaffComputed = profile?.role === "owner" || profile?.role === "admin" || profile?.role === "instructor";
	const isActivated = isStaffComputed || profile?.activationStatus === "active";
	const value = (0, import_react.useMemo)(() => ({
		user,
		profile,
		loading,
		localMode,
		isOwner: profile?.role === "owner",
		isStaff: isStaffComputed,
		isActivated,
		activationStatus,
		register,
		login,
		loginWithGoogle,
		logout,
		resetPassword,
		changePassword,
		refreshProfile,
		updateDepartment
	}), [
		user,
		profile,
		loading,
		localMode,
		isStaffComputed,
		isActivated,
		activationStatus,
		register,
		login,
		loginWithGoogle,
		logout,
		resetPassword,
		changePassword,
		refreshProfile,
		updateDepartment
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ctx.Provider, {
		value,
		children
	});
}
function useAuth() {
	const ctx = (0, import_react.useContext)(Ctx);
	if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
	return ctx;
}
function authErrorKey(err) {
	const code = err?.code ?? "";
	const message = err?.message ?? "";
	console.error("Auth error details:", {
		code,
		message,
		err
	});
	if (code.includes("google-unavailable") || code.includes("operation-not-allowed")) return "auth.googleUnavailable";
	if (code.includes("popup-closed") || code.includes("cancelled-popup")) return "auth.googlePopupClosed";
	if (code.includes("permission-denied") || code.includes("Firestore")) return "auth.registrationFailed";
	if (code.includes("email-already-in-use")) return "auth.emailInUse";
	if (code.includes("weak-password")) return "auth.weakPassword";
	if (code.includes("wrong-password") || code.includes("user-not-found") || code.includes("invalid-credential") || code.includes("invalid-email")) return "auth.invalidCredentials";
	return "common.error";
}
//#endregion
export { readDb as a, listNotifications as i, authErrorKey as n, useAuth as o, listCourses as r, AuthProvider as t };
