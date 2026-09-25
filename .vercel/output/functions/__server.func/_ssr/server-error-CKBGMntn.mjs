//#region node_modules/.nitro/vite/services/ssr/assets/server-error-CKBGMntn.js
var CODE_KEYS = {
	"auth/required": "error.auth.required",
	"auth/invalid-session": "error.auth.required",
	"auth/forbidden": "error.auth.forbidden",
	"auth/suspended": "error.auth.suspended",
	"ai/not-configured": "error.ai.notConfigured",
	"activation/invalid-code": "error.activation.invalidCode",
	"activation/code-used": "error.activation.codeUsed",
	"activation/code-expired": "error.activation.codeExpired",
	"activation/code-revoked": "error.activation.codeRevoked",
	"activation/code-wrong-user": "error.activation.codeWrongUser",
	"activation/account-locked": "error.activation.accountLocked",
	"activation/activation-required": "error.activation.activationRequired",
	"activation/not-approved": "error.activation.notApproved",
	"activation/not-found": "error.activation.notFound",
	"exam/not-enrolled": "error.exam.notEnrolled"
};
function messageOf(e) {
	if (e instanceof Error) return e.message;
	if (e && typeof e === "object" && "message" in e && typeof e.message === "string") return e.message;
	return "";
}
function serverErrorMessage(e, t) {
	const msg = messageOf(e).trim();
	if (!msg) return t("common.error");
	const key = CODE_KEYS[msg];
	if (key) return t(key);
	if (/^[a-z][a-z0-9]*\/[a-z0-9-]+$/.test(msg)) return t("error.unknown", { code: msg });
	if (msg.length <= 220) return msg;
	return t("common.error");
}
//#endregion
export { serverErrorMessage as t };
