import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { Y as useServerFn, k as adminSaveSettings, l as adminGetSettings, s as adminDiagnostics } from "./_ssr/server-fns-BeozUQqq.mjs";
import { X as EyeOff, Y as Eye, u as Trophy, w as RefreshCw } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
import { t as Switch } from "./_ssr/switch-B7vSEhN9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.settings-C9qdu5wj.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Academy Settings
*/
var DEFAULT = {
	telegramHandle: "",
	telegramUrl: "",
	announcementOm: "",
	announcementEn: "",
	contactEmail: "",
	contactPhone: "",
	rankingsPublished: false
};
function SettingsPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [settings, setSettings] = (0, import_react.useState)(DEFAULT);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [diag, setDiag] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		call(adminGetSettings, void 0).then((s) => setSettings(s)).catch((e) => toast.error(serverErrorMessage(e, t))).finally(() => setLoading(false));
		call(adminDiagnostics, void 0).then((d) => setDiag(d)).catch(() => {});
	}, []);
	const set = (k, v) => setSettings((p) => ({
		...p,
		[k]: v
	}));
	async function save() {
		setSaving(true);
		try {
			await call(adminSaveSettings, { settings });
			toast.success(t("common.success"));
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 rounded-xl" })]
	});
	const diagRows = diag ? [
		{
			label: "Service account (FIREBASE_SERVICE_ACCOUNT_JSON)",
			ok: diag.serviceAccountSet && diag.serviceAccountValid,
			hint: diag.serviceAccountSet && !diag.serviceAccountValid ? "Present but invalid JSON / missing required fields" : void 0
		},
		{
			label: "Firebase API key (server)",
			ok: diag.apiKeySet
		},
		{
			label: "Firestore auth mode",
			ok: diag.tokenMode !== "none",
			hint: diag.tokenMode === "service-account" ? "Service-account OAuth (privileged / Pro)" : diag.tokenMode === "user-token" ? "Caller x-id-token proxy (Vercel Hobby — no Pro required)" : "Could not resolve any Firestore token"
		},
		{
			label: "Firestore reachable",
			ok: diag.firestoreReachable
		}
	] : [];
	function reloadDiag() {
		call(adminDiagnostics, void 0).then((d) => setDiag(d)).catch((e) => toast.error(serverErrorMessage(e, t)));
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-2xl",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "mb-6 text-2xl font-bold",
			children: t("common.settings")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-6",
			children: [
				diag && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, {
						className: "flex-row items-center justify-between space-y-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
							className: "text-base",
							children: "Server status"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "sm",
							onClick: reloadDiag,
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-4" })
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-2",
						children: [
							diagRows.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-4 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-muted-foreground",
										children: r.label
									}), r.hint && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-[11px] leading-tight text-muted-foreground/90 mt-0.5",
										children: r.hint
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("shrink-0 font-medium", r.ok ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"),
									children: r.ok ? "Ready" : "Missing / broken"
								})]
							}, r.label)),
							diag.projectId && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "pt-1 text-xs text-muted-foreground",
								children: ["Project: ", diag.projectId]
							}),
							diag.tokenMode === "user-token" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "pt-1 text-sm text-green-600 dark:text-green-400",
								children: [
									"✅ Running in ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "user-token proxy mode" }),
									" — no Vercel Pro / service account required. Firestore rules enforce role-based access for all admin operations."
								]
							}),
							diag.tokenMode !== "service-account" && diag.tokenMode !== "user-token" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "pt-1 text-sm text-amber-600 dark:text-amber-400",
								children: [
									"For full privileged server access (optional Pro upgrade), set",
									" ",
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("code", {
										className: "font-mono text-xs",
										children: "FIREBASE_SERVICE_ACCOUNT_JSON"
									}),
									" in env vars, then press refresh. The app works fine without it using the signed-in user's own token."
								]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Telegram" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("admin.telegramHandle") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: settings.telegramHandle,
							onChange: (e) => set("telegramHandle", e.target.value),
							placeholder: "@handle"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Telegram URL" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: settings.telegramUrl,
							onChange: (e) => set("telegramUrl", e.target.value),
							placeholder: "https://t.me/..."
						})]
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Announcements" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Announcement (Afaan Oromoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: settings.announcementOm,
							onChange: (e) => set("announcementOm", e.target.value),
							rows: 3
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Announcement (English)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							value: settings.announcementEn,
							onChange: (e) => set("announcementEn", e.target.value),
							rows: 3
						})]
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Contact" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.email") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							value: settings.contactEmail,
							onChange: (e) => set("contactEmail", e.target.value)
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.phone") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: settings.contactPhone,
							onChange: (e) => set("contactPhone", e.target.value)
						})]
					})]
				})] }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: cn(settings.rankingsPublished ? "border-green-500/40 bg-green-500/5 dark:bg-green-900/10" : "border-border"),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-5 text-primary" }), "Leaderboard & Rankings"]
					}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
						className: "space-y-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start justify-between gap-4 rounded-lg bg-muted/50 p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex-1 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "rankings-publish",
										className: "text-base font-semibold cursor-pointer",
										children: "Publish student rankings"
									}), settings.rankingsPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " LIVE"]
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(EyeOff, { className: "size-3" }), " DRAFT"]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground leading-relaxed",
									children: "When enabled, students can view the full leaderboard anonymously. Each student sees their nickname instead of their real name for privacy. Students always see their own rank even when unpublished."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
								id: "rankings-publish",
								checked: settings.rankingsPublished,
								onCheckedChange: (v) => set("rankingsPublished", v)
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground space-y-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-foreground/80",
								children: "💡 Privacy note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
								className: "list-disc list-inside space-y-1 text-[13px]",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Published:" }), " All students see the leaderboard with nicknames. Real names and emails are never shown to other students."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Unpublished:" }), " Students only see their own personal rank. Nobody else can see their position."] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("b", { children: "Admins & Owners:" }), " Always see the full leaderboard with real names and contact info, regardless of this setting."] })
								]
							})]
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "w-full",
					onClick: () => void save(),
					disabled: saving,
					children: saving ? t("common.saving") : t("common.save")
				})
			]
		})]
	});
}
//#endregion
export { SettingsPage as component };
