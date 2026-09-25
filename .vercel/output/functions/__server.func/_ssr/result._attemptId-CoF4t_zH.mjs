import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./utils-DJzCcaxX.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as getMyResult, Y as useServerFn } from "./server-fns-BeozUQqq.mjs";
import { ct as CircleCheck, nt as Clock3, ot as CircleX, st as CircleQuestionMark, u as Trophy } from "../_libs/lucide-react.mjs";
import { t as Skeleton } from "./skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./server-error-CKBGMntn.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-6xbYZB6Z.mjs";
import { t as SiteHeader } from "./site-header-r2TkZ-J4.mjs";
import { t as Progress } from "./progress-BIYMjxT2.mjs";
import { t as Route } from "./result._attemptId-Bn9fKBBc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/result._attemptId-CoF4t_zH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Student result page — shows score, pass/fail, question breakdown.
*/
function ResultPage() {
	const { attemptId } = Route.useParams();
	const { t } = useI18n();
	const call = useServerFn();
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		call(getMyResult, { attemptId }).then((r) => setResult(r)).catch((e) => toast.error(serverErrorMessage(e, t))).finally(() => setLoading(false));
	}, [attemptId]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-2xl px-4 py-12",
			children: loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 w-full" })]
			}) : !result ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: t("common.error")
			}) : "published" in result && !result.published ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "text-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "pt-10 pb-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "mx-auto size-12 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-4 text-xl font-semibold",
							children: t("result.notPublished")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: t("result.pending")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "mt-6",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/dashboard",
								children: t("nav.dashboard")
							})
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResultView, {
				result,
				t
			})
		})]
	});
}
function ResultView({ result, t }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: cn("mx-auto grid size-20 place-items-center rounded-full", result.passed ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"),
						children: result.passed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "size-10" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-10" })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-4 text-2xl font-bold",
						children: result.passed ? t("result.passed") : t("result.failed")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-muted-foreground",
						children: result.examTitle
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("result.score") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-5xl font-bold",
							children: [result.percentage, "%"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								result.score,
								" / ",
								result.totalPoints,
								" ",
								t("common.points")
							]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
						value: result.percentage,
						className: "h-3"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-3 gap-4 pt-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto size-5 text-green-500" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-xl font-bold",
										children: result.correctCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: t("result.correct")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mx-auto size-5 text-red-500" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-xl font-bold",
										children: result.wrongCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: t("result.wrong")
									})
								]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleQuestionMark, { className: "mx-auto size-5 text-yellow-500" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-1 text-xl font-bold",
										children: result.unansweredCount
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground",
										children: t("result.unanswered")
									})
								]
							})
						]
					})
				]
			})] }),
			result.needsManualGrading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
					className: "pt-4 pb-4",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-yellow-800 dark:text-yellow-200",
						children: t("result.pending")
					})
				})
			}),
			result.feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: t("result.feedback") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "whitespace-pre-line text-sm",
				children: result.feedback
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				asChild: true,
				className: "w-full",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/dashboard",
					children: t("nav.dashboard")
				})
			})
		]
	});
}
//#endregion
export { ResultPage as component };
