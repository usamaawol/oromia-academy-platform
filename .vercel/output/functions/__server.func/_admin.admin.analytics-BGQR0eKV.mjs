import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n } from "./_ssr/utils-DJzCcaxX.mjs";
import { Y as useServerFn, c as adminGetAnalytics } from "./_ssr/server-fns-BeozUQqq.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { a as Bar, i as CartesianGrid, n as YAxis, o as ResponsiveContainer, r as XAxis, s as Tooltip, t as BarChart } from "./_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.analytics-BGQR0eKV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Analytics
*/
function AnalyticsPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [data, setData] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		call(adminGetAnalytics, void 0).then((d) => setData(d)).catch((e) => toast.error(serverErrorMessage(e, t))).finally(() => setLoading(false));
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "mb-6",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "text-2xl font-bold",
			children: t("admin.analytics")
		})
	}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "grid gap-4 sm:grid-cols-2",
		children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48 rounded-xl" }, i))
	}) : data ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
				children: [
					["Total Students", data.totalStudents],
					["Total Attempts", data.totalAttempts],
					["Average Score", `${data.avgScore}%`],
					["Pass Rate", `${data.passRate}%`]
				].map(([label, value]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-3xl font-bold",
						children: value
					})]
				}) }, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 sm:grid-cols-3 lg:grid-cols-5",
				children: [
					{
						label: "Waliigala",
						value: data.totalStudents ?? 0,
						color: "text-foreground"
					},
					{
						label: "Eeggachaa (Pending)",
						value: data.pendingStudents ?? 0,
						color: "text-yellow-600 dark:text-yellow-400"
					},
					{
						label: "Eeyyamame (Approved)",
						value: data.approvedStudents ?? 0,
						color: "text-blue-600 dark:text-blue-400"
					},
					{
						label: "Hojiirra jira (Activated)",
						value: data.activatedStudents ?? 0,
						color: "text-emerald-600 dark:text-emerald-400"
					},
					{
						label: "Didame (Rejected)",
						value: data.rejectedStudents ?? 0,
						color: "text-red-500"
					}
				].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "p-4 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `text-2xl font-bold ${color}`,
						children: String(value)
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted-foreground",
						children: label
					})]
				}) }, label))
			}),
			data.examStats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Pass Rate by Exam" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: 260,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: data.examStats,
					margin: {
						top: 0,
						right: 16,
						bottom: 0,
						left: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							className: "stroke-border"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "title",
							tick: { fontSize: 12 },
							tickLine: false,
							axisLine: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							domain: [0, 100],
							tick: { fontSize: 12 },
							tickLine: false,
							axisLine: false,
							tickFormatter: (v) => `${v}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							formatter: (v) => [`${v}%`, "Pass rate"],
							contentStyle: {
								borderRadius: "8px",
								fontSize: "13px"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "passRate",
							fill: "hsl(var(--primary))",
							radius: [
								4,
								4,
								0,
								0
							]
						})
					]
				})
			}) })] }),
			data.examStats.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Avg Score by Exam" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
				width: "100%",
				height: 260,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
					data: data.examStats,
					margin: {
						top: 0,
						right: 16,
						bottom: 0,
						left: 0
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CartesianGrid, {
							strokeDasharray: "3 3",
							className: "stroke-border"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
							dataKey: "title",
							tick: { fontSize: 12 },
							tickLine: false,
							axisLine: false
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, {
							domain: [0, 100],
							tick: { fontSize: 12 },
							tickLine: false,
							axisLine: false,
							tickFormatter: (v) => `${v}%`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {
							formatter: (v) => [`${v}%`, "Avg score"],
							contentStyle: {
								borderRadius: "8px",
								fontSize: "13px"
							}
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
							dataKey: "avgScore",
							fill: "hsl(var(--chart-2))",
							radius: [
								4,
								4,
								0,
								0
							]
						})
					]
				})
			}) })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, { children: "Exam breakdown" }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-b text-left text-muted-foreground",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-3 pr-4 font-medium",
							children: "Exam"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-3 pr-4 font-medium",
							children: "Attempts"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-3 pr-4 font-medium",
							children: "Avg Score"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "pb-3 font-medium",
							children: "Pass Rate"
						})
					]
				}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
					className: "divide-y",
					children: data.examStats.map((es) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 pr-4",
							children: es.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "py-3 pr-4",
							children: es.attempts
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-3 pr-4",
							children: [es.avgScore, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "py-3",
							children: [es.passRate, "%"]
						})
					] }, es.id))
				})]
			}) })] })
		]
	}) : null] });
}
//#endregion
export { AnalyticsPage as component };
