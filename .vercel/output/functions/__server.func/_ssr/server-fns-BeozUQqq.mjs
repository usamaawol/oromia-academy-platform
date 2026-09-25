import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { a as getIdToken, o as onAuthStateChanged } from "../_libs/firebase__auth.mjs";
import "../_libs/firebase.mjs";
import { r as getFirebaseAuth, t as firebaseReady } from "./firebase-Bve1OLnm.mjs";
import { t as getServerFnById } from "../__23tanstack-start-server-fn-resolver-8CMjyqcp.mjs";
import { c as createServerFn, i as TSS_SERVER_FUNCTION } from "./createServerFn-CIHAFgYl.mjs";
import { a as objectType, i as numberType, n as booleanType, o as recordType, r as enumType, s as stringType, t as arrayType } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/server-fns-BeozUQqq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Thin wrapper that calls a TanStack Start server function while injecting
* the current Firebase ID token as the `x-id-token` request header.
*
* Changes from v1:
* - Forces a token refresh (`forceRefresh = true`) so a freshly-signed-up
*   user never sends a stale/expired token.
* - If `auth.currentUser` is null right after sign-up (Firebase SDK still
*   hydrating), waits up to 3 s for it to appear before giving up.
*/
/** Wait for Firebase to resolve the current user (up to `timeoutMs`). */
function waitForCurrentUser(timeoutMs = 3e3) {
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
function useServerFn() {
	return (0, import_react.useCallback)(async (fn, data) => {
		let idToken = "";
		if (firebaseReady) try {
			const currentUser = getFirebaseAuth().currentUser ?? await waitForCurrentUser(3e3);
			if (currentUser) idToken = await getIdToken(currentUser, true);
		} catch {}
		const callable = fn;
		if (typeof window !== "undefined" && callable.url) return await callable({
			data,
			headers: { "x-id-token": idToken }
		});
		return await callable({ data });
	}, []);
}
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
/**
* TanStack Start server functions — all privileged exam operations.
*
* Every function that touches answer keys, passwords, timers or grading runs
* here. The browser never receives sensitive data.
*/
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
var startExam = createServerFn({ method: "POST" }).validator(objectType({
	examId: stringType(),
	password: stringType()
})).handler(createSsrRpc("29f24d15963df554fb845c310d3de145468578df1e2e93c27dd2cdb4632b19e7"));
var saveAnswer = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	questionId: stringType(),
	answer: stringType()
})).handler(createSsrRpc("348c0a48445d878792ba6ac10e9daf5ec0a31d8a7976a15f4fd91318dc17512c"));
var submitExam = createServerFn({ method: "POST" }).validator(objectType({ attemptId: stringType() })).handler(createSsrRpc("99f98556a4b957df236a174722ee714b64d5edf767fc0791b9f6687666fca7ae"));
var getMyResult = createServerFn({ method: "GET" }).validator(objectType({ attemptId: stringType() })).handler(createSsrRpc("c8764fe361ce52aa9d0372fe75c8285df81f7d5cc210c89f820d4636b9233f9e"));
var adminListExams = createServerFn({ method: "GET" }).handler(createSsrRpc("c4be4f89e98bfc4103ea9b0954e6670500b9a147defba5fb2b74709e8338c5f9"));
var adminSaveExam = createServerFn({ method: "POST" }).validator(objectType({
	exam: ExamSchema,
	password: stringType().optional()
})).handler(createSsrRpc("3cb1554ffecc59687311f4dfe3e3e156170d1300489c68d20542be58da693866"));
var adminDeleteExam = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(createSsrRpc("90d5ed71ec80e9b89541c3822c64dbab2a84b0b950ce012688b81ab260f83cc6"));
var adminListQuestions = createServerFn({ method: "GET" }).validator(objectType({ courseId: stringType().optional() })).handler(createSsrRpc("4ab9eec02649bbb2e50b473c22297220474e36733d53f012c8161d5ede3b1648"));
var adminSaveQuestion = createServerFn({ method: "POST" }).validator(objectType({ question: QuestionSchema })).handler(createSsrRpc("568a247d41cfc3937290111867a576b2fb4dc8d10444672b06cb659113b81dd8"));
var adminDeleteQuestion = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(createSsrRpc("26a3cf1c986baba35209e3dbf73634c00e7594a53a165a69d534850263667c99"));
var adminListCourses = createServerFn({ method: "GET" }).handler(createSsrRpc("66aab1078404da44e6683a60ca92b646696f02ea1786b4457d9d1e545b277bea"));
var adminSaveCourse = createServerFn({ method: "POST" }).validator(objectType({ course: CourseSchema })).handler(createSsrRpc("ec2311b48111ebf4df24af01781c10415ff4427be77f23d491cf80235ff248f8"));
var adminDeleteCourse = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(createSsrRpc("f64baa1e4da286ffda442564252565ea3e7619195b4973e258006d85a294dfb6"));
var adminListStudents = createServerFn({ method: "GET" }).handler(createSsrRpc("8cdeb80e11e478ec7f5d472ad71c95cd0f66700124d4568bafc6a38dbc66a29b"));
var adminSetRole = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	role: enumType([
		"owner",
		"admin",
		"instructor",
		"student"
	])
})).handler(createSsrRpc("15d008da0810e99c34012f26963eeecd783105cd64bdf2f15d39e6a33ef4c5b9"));
var adminSetStatus = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	status: enumType(["active", "suspended"])
})).handler(createSsrRpc("040364d1e77d01180e51bb6fcbab69f3ce9e35788609870f3c494e8066b8dd75"));
var adminListAttempts = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType().optional() })).handler(createSsrRpc("8e81ed2343079d44f1528cf413ba259139cece9f730b08046187dadcfdcfadd2"));
var adminGradeAttempt = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	manualGrades: recordType(objectType({
		points: numberType(),
		feedback: stringType().optional()
	})),
	feedback: stringType().optional()
})).handler(createSsrRpc("1a0621263896a961f53b544e498c999c6abda3584951bb70e7fb6ba5eecae53f"));
var adminPublishResult = createServerFn({ method: "POST" }).validator(objectType({
	attemptId: stringType(),
	published: booleanType()
})).handler(createSsrRpc("95c8204265b2c5cf1197247ba71c85babf82524fed51f5ca8cff47f7e3d5eb52"));
var adminPublishAllResults = createServerFn({ method: "POST" }).validator(objectType({ examId: stringType() })).handler(createSsrRpc("e4b8c27a2fe7b7686fc9975fc59f31c9b6c2422bf68d9dddb20edf9a7bbe125b"));
var adminListAudit = createServerFn({ method: "GET" }).handler(createSsrRpc("da04532a672d4ad286847cc088616e2c4eac64b3633c0c5f1415412a58d4691a"));
var adminGetSettings = createServerFn({ method: "GET" }).handler(createSsrRpc("079867f0aed6aaabcf9aa58c9f4b9a52825ac1d985fd2c327038f1299e79f2ff"));
var adminSaveSettings = createServerFn({ method: "POST" }).validator(objectType({ settings: objectType({
	telegramHandle: stringType(),
	telegramUrl: stringType(),
	announcementOm: stringType(),
	announcementEn: stringType(),
	contactEmail: stringType(),
	contactPhone: stringType(),
	rankingsPublished: booleanType()
}) })).handler(createSsrRpc("8e0791653f71f34fc6f48b2a21d72bbdc11e6d444a89d9ae5a198e33376d5b92"));
var adminGetAnalytics = createServerFn({ method: "GET" }).handler(createSsrRpc("b2ec60736fc199524fdf35e95498c047f19b531d220d78e4b9bbf0f756328bec"));
var myAttempts = createServerFn({ method: "GET" }).handler(createSsrRpc("5595d25f90092ef20a04324cad03b64bbc6355d236cfa469aae0d63808688df3"));
var availableExams = createServerFn({ method: "GET" }).handler(createSsrRpc("7c51422ad847292d5f94bbe63b80e48123e7282265341e24ea8ab993b32a4ba1"));
var getExamInfo = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(createSsrRpc("a389079eef2dfb9c1a5d5dea7d535d4e9146cc758e102423c8324bc3b7f74bc5"));
createServerFn({ method: "POST" }).validator(objectType({ notification: objectType({
	userId: stringType(),
	titleOm: stringType(),
	titleEn: stringType(),
	bodyOm: stringType().optional(),
	bodyEn: stringType().optional()
}) })).handler(createSsrRpc("2fea0ae822475796429b4f7980e83d4af28721284b9fa7b2506e3ea67f4f460f"));
createServerFn({ method: "GET" }).handler(createSsrRpc("db232402c5b0a54bf9ec1743d96ae2a5426dd223ec49615948c891f1a8812d29"));
var updateMyProfile = createServerFn({ method: "POST" }).validator(objectType({
	fullName: stringType().optional(),
	phone: stringType().optional(),
	department: stringType().optional(),
	nickname: stringType().optional()
})).handler(createSsrRpc("8de4b526b6d51276361fd00b7d2abefb3db8de1310fb3d3bc91514e5e692bfd6"));
var getOwnerStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("4844a7cc5dd7a922320e740dafaff34e54c45eeb260dbe128a3058107be06653"));
/**
* Bootstraps the academy owner. Lets the first signed-in account on a fresh
* database claim the `owner` role so the admin panel can be reached. Server
* enforces that an owner does not already exist.
*/
var claimOwner = createServerFn({ method: "POST" }).handler(createSsrRpc("c5c6487cbaeb8d48ab0ec1b44b5be222405732ca65b0dac4d57ce187a12b83a4"));
createServerFn({ method: "POST" }).validator(objectType({
	email: stringType().email(),
	password: stringType()
})).handler(createSsrRpc("d7778299dc6705d1c66bbfa10ca27843c7deb9e654d4f41a8a580592dd6bee89"));
createServerFn({ method: "POST" }).validator(objectType({
	id: stringType(),
	fullName: stringType(),
	email: stringType(),
	phone: stringType().optional(),
	department: stringType().optional(),
	courseId: stringType().optional()
})).handler(createSsrRpc("6c10f1fa962d702489b9449cc0b55721bd8c7a67314e74e1216e5def48f57806"));
var getRankings = createServerFn({ method: "GET" }).handler(createSsrRpc("73cc446412689f2de49fa03948cfc649d38fe75afca6db5d32c096cf6f685d6a"));
var adminPublishRankings = createServerFn({ method: "POST" }).handler(createSsrRpc("03820c8a77dbabd991be46621229d9f3e302c2a82a461e4c2603130f1729a53e"));
var adminUnpublishRankings = createServerFn({ method: "POST" }).handler(createSsrRpc("524d220d43e7c0f3a69bd8d0fd7ebac0cae56e6e3e7ac1727f635732b0239026"));
var getExamLeaderboard = createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(createSsrRpc("329d7d93bafe0e512ea951004764c19199485846ee110e9557ea6bb1e44678df"));
createServerFn({ method: "GET" }).validator(objectType({ examId: stringType() })).handler(createSsrRpc("ccf10e17702ebf0b43bec5d51567fe4656f616d216c847bab108646649c3b869"));
var adminDiagnostics = createServerFn({ method: "GET" }).handler(createSsrRpc("948408cf8788e28104953655cb1fa380fd72517bc15f5020728f66bb7efb521f"));
var adminAiExtractQuestions = createServerFn({ method: "POST" }).validator(objectType({ text: stringType().min(10) })).handler(createSsrRpc("8f679be7f1961018b72f07617f60a80a93196dd7ffb4fb3e0f2368cbdc30df8c"));
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
var adminBulkSaveQuestions = createServerFn({ method: "POST" }).validator(objectType({ questions: arrayType(AiQuestionSchema) })).handler(createSsrRpc("3934edbd15388af2eab92a19b3db09c290d8034c9785659ee7daa8f35be9aefa"));
/**
* Find an activation code by raw user input.
* Hashes the normalized input and queries the activationCodes collection.
*/
/**
* Upsert enrollment: activate (or re-activate) `userId` in `courseId` and mark
* it paid. Used both during code redemption and for admin manual activation.
* Returns the enrollment id.
*/
var generateActivationCodes = createServerFn({ method: "POST" }).validator(objectType({
	count: numberType().int().min(1).max(500),
	courseId: stringType().nullable().optional(),
	assignedUserId: stringType().nullable().optional(),
	expiresAt: numberType().nullable().optional(),
	note: stringType().optional()
})).handler(createSsrRpc("c1c13a9c5b5397b32c2e4224fdf69130790e4abb097a3df23cd348fa07e7cfa7"));
var redeemActivationCode = createServerFn({ method: "POST" }).validator(objectType({ code: stringType().min(6).max(64) })).handler(createSsrRpc("d2672ea551baee501aef45db956be0d9306ff8fe4054440e312671bc4ea6fc05"));
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
}).optional()).handler(createSsrRpc("f05d8dd60a3997739791af205a40dd153cc314795816500edfaa88ce87b82365"));
var adminRevokeActivationCode = createServerFn({ method: "POST" }).validator(objectType({ id: stringType() })).handler(createSsrRpc("e40777978aa08cef3a4dc3b2b94b8bcc17c6ab2193f026a7d2124967e47aa991"));
var adminManualActivateStudent = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	courseIds: arrayType(stringType()).optional(),
	expiresAt: numberType().nullable().optional(),
	note: stringType().optional()
})).handler(createSsrRpc("319c9ed95fe08f4ea80264e419b1c8f0e9c9d4b1ab862f5e3c1c665923d5c9c2"));
var adminSetActivationStatus = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	activationStatus: enumType([
		"pending",
		"active",
		"suspended",
		"expired"
	])
})).handler(createSsrRpc("a35d140bedab0a0f9244dcc76e479a91cc4da86365af127eeb288e8db9207564"));
createServerFn({ method: "GET" }).handler(createSsrRpc("d2773a5feea43339be2c7952a95cd7df06585ad07489d0f19a15df12ceca0796"));
/**
* Return true if `profile` has an active, paid, non-expired enrollment for
* `courseId`. Staff users are treated as enrolled in every course.
*/
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
var adminApproveStudent = createServerFn({ method: "POST" }).validator(objectType({ userId: stringType() })).handler(createSsrRpc("bc833ba626611f1fa2c090644c678220e95be02df4a3f39efe4142cbbcca6da2"));
/**
* adminRejectStudent — sets activationStatus = "rejected" with optional reason.
*/
var adminRejectStudent = createServerFn({ method: "POST" }).validator(objectType({
	userId: stringType(),
	reason: stringType().optional()
})).handler(createSsrRpc("04418f6767336d41d1bcfd140184d3a0c3944d4cb39709a1bd6ec5c432938ecf"));
/**
* adminReApproveStudent — re-approves a previously rejected student.
* Reuses the same approval flow.
*/
var adminReApproveStudent = createServerFn({ method: "POST" }).validator(objectType({ userId: stringType() })).handler(createSsrRpc("21df95364390341a547d6142683cd89e5182e9b9cd1aeb22bccd9cb9938808fc"));
/**
* getMyPendingCode — called by the student on the waiting page.
*
* Returns the raw activation code ONLY when:
*   - The caller is authenticated.
*   - The caller's profile activationStatus is "approved".
*   - The code is assigned to the caller's UID.
*
* Returns null otherwise (pending / rejected / active states).
*/
var getMyPendingCode = createServerFn({ method: "GET" }).handler(createSsrRpc("fb51675efd869ab6bea5aba6348a5b2aa0a91395bd313f725558c5c5be15d389"));
/**
* adminListPendingStudents — list all students with activationStatus = "pending"
* sorted by newest first.
*/
var adminListPendingStudents = createServerFn({ method: "GET" }).handler(createSsrRpc("b8edbc55f21179b93193c7f2bd5af38274646a53f871d128e41848adf8c3be5e"));
//#endregion
export { adminSetActivationStatus as A, getMyResult as B, adminReApproveStudent as C, adminSaveExam as D, adminSaveCourse as E, claimOwner as F, saveAnswer as G, getRankings as H, generateActivationCodes as I, updateMyProfile as J, startExam as K, getExamInfo as L, adminSetStatus as M, adminUnpublishRankings as N, adminSaveQuestion as O, availableExams as P, getExamLeaderboard as R, adminPublishResult as S, adminRevokeActivationCode as T, myAttempts as U, getOwnerStatus as V, redeemActivationCode as W, useServerFn as Y, adminListQuestions as _, adminDeleteExam as a, adminPublishAllResults as b, adminGetAnalytics as c, adminListActivationCodes as d, adminListAttempts as f, adminListPendingStudents as g, adminListExams as h, adminDeleteCourse as i, adminSetRole as j, adminSaveSettings as k, adminGetSettings as l, adminListCourses as m, adminApproveStudent as n, adminDeleteQuestion as o, adminListAudit as p, submitExam as q, adminBulkSaveQuestions as r, adminDiagnostics as s, adminAiExtractQuestions as t, adminGradeAttempt as u, adminListStudents as v, adminRejectStudent as w, adminPublishRankings as x, adminManualActivateStudent as y, getMyPendingCode as z };
