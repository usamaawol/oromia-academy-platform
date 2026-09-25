import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n } from "./_ssr/utils-DJzCcaxX.mjs";
import { Y as useServerFn, p as adminListAudit } from "./_ssr/server-fns-BeozUQqq.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.audit-CINylO2d.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Audit Log
*/
function AuditPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [entries, setEntries] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		call(adminListAudit, void 0).then((data) => setEntries(data)).catch((e) => toast.error(serverErrorMessage(e, t))).finally(() => setLoading(false));
	}, []);
	function fmt(ts) {
		return new Date(ts).toLocaleString(void 0, {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit"
		});
	}
	function actionColor(action) {
		if (action.includes("delete")) return "text-red-600 dark:text-red-400";
		if (action.includes("create") || action.includes("publish")) return "text-green-600 dark:text-green-400";
		return "text-muted-foreground";
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mb-6",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold",
			children: t("admin.audit")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm text-muted-foreground",
			children: "Last 300 actions"
		})]
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "space-y-2",
		children: Array.from({ length: 6 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-14 rounded" }, i))
	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
		className: "p-0",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "divide-y",
			children: [entries.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-4 px-4 py-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "min-w-[120px] text-xs text-muted-foreground",
						children: fmt(e.createdAt)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex-1 min-w-0",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: `text-sm font-mono font-medium ${actionColor(e.action)}`,
								children: e.action
							}),
							e.target && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "ml-2 text-sm text-muted-foreground",
								children: ["→ ", e.target]
							}),
							e.details && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground truncate",
								children: e.details
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "text-xs text-muted-foreground shrink-0",
						children: e.userName
					})
				]
			}, e.id)), entries.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-muted-foreground",
				children: t("common.notFound")
			})]
		})
	}) })] });
}
//#endregion
export { AuditPage as component };
