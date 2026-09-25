import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { o as useAuth } from "./_ssr/auth-DVuTDe7t.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { g as Link } from "./_libs/@tanstack/react-router+[...].mjs";
import { A as adminSetActivationStatus, C as adminReApproveStudent, M as adminSetStatus, Y as useServerFn, j as adminSetRole, m as adminListCourses, n as adminApproveStudent, v as adminListStudents, w as adminRejectStudent, y as adminManualActivateStudent } from "./_ssr/server-fns-BeozUQqq.mjs";
import { B as KeyRound, C as RotateCcw, a as Users, c as UserCheck, ct as CircleCheck, g as ShieldOff, it as ClipboardList, lt as CircleAlert, ot as CircleX, s as UserX, tt as Clock, x as Search } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, i as DialogFooter, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
import { i as Trigger, n as List, r as Root2, t as Content } from "./_libs/radix-ui__react-tabs.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.students-BUHWlxKx.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Tabs = Root2;
var TabsList = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(List, {
	ref,
	className: cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className),
	...props
}));
TabsList.displayName = List.displayName;
var TabsTrigger = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trigger, {
	ref,
	className: cn("inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow", className),
	...props
}));
TabsTrigger.displayName = Trigger.displayName;
var TabsContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content, {
	ref,
	className: cn("mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className),
	...props
}));
TabsContent.displayName = Content.displayName;
/**
* Admin — Students management with Approval Queue + Activation Control
*/
var ROLE_OPTIONS = [
	"student",
	"instructor",
	"admin",
	"owner"
];
var ACTIVATION_BADGE = {
	active: {
		labelOm: "Hojiirra jira",
		className: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
		icon: CircleCheck
	},
	pending: {
		labelOm: "Eeggachaa",
		className: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
		icon: Clock
	},
	approved: {
		labelOm: "Eeyyamame",
		className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
		icon: CircleCheck
	},
	rejected: {
		labelOm: "Didame",
		className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
		icon: CircleX
	},
	suspended: {
		labelOm: "Dhaabbateera",
		className: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
		icon: ShieldOff
	},
	expired: {
		labelOm: "Darbeera",
		className: "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
		icon: CircleAlert
	}
};
function ActivationBadge({ status }) {
	const cfg = ACTIVATION_BADGE[status ?? "pending"] ?? ACTIVATION_BADGE["pending"];
	const Icon = cfg.icon;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
		className: cn("inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold", cfg.className),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3 shrink-0" }), cfg.labelOm]
	});
}
function StudentsPage() {
	const { t } = useI18n();
	const { profile: myProfile } = useAuth();
	const call = useServerFn();
	const [users, setUsers] = (0, import_react.useState)([]);
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [query, setQuery] = (0, import_react.useState)("");
	const [roleFilter, setRoleFilter] = (0, import_react.useState)("all");
	const [activationFilter, setActivationFilter] = (0, import_react.useState)("all");
	const [activateTarget, setActivateTarget] = (0, import_react.useState)(null);
	const [activateCourseIds, setActivateCourseIds] = (0, import_react.useState)([]);
	const [activateExpiry, setActivateExpiry] = (0, import_react.useState)("");
	const [activateNote, setActivateNote] = (0, import_react.useState)("");
	const [activating, setActivating] = (0, import_react.useState)(false);
	const [rejectTarget, setRejectTarget] = (0, import_react.useState)(null);
	const [rejectReason, setRejectReason] = (0, import_react.useState)("");
	const [rejecting, setRejecting] = (0, import_react.useState)(false);
	const [reviewTarget, setReviewTarget] = (0, import_react.useState)(null);
	const [approving, setApproving] = (0, import_react.useState)(false);
	const refresh = async () => {
		setLoading(true);
		try {
			const [usersData, coursesData] = await Promise.all([call(adminListStudents, void 0), call(adminListCourses, void 0)]);
			setUsers(usersData);
			setCourses(coursesData.filter((c) => c.status === "active"));
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	const filtered = users.filter((u) => {
		const matchesQuery = !query || u.fullName.toLowerCase().includes(query.toLowerCase()) || u.email.toLowerCase().includes(query.toLowerCase());
		const matchesRole = roleFilter === "all" || u.role === roleFilter;
		const matchesActivation = activationFilter === "all" || (u.activationStatus ?? "pending") === activationFilter;
		return matchesQuery && matchesRole && matchesActivation;
	});
	const pendingQueue = users.filter((u) => u.role === "student" && (u.activationStatus ?? "pending") === "pending").sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
	async function changeRole(userId, role) {
		try {
			await call(adminSetRole, {
				userId,
				role
			});
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function toggleStatus(user) {
		const next = user.status === "active" ? "suspended" : "active";
		try {
			await call(adminSetStatus, {
				userId: user.id,
				status: next
			});
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function setActivationStatusFn(userId, status) {
		try {
			await call(adminSetActivationStatus, {
				userId,
				activationStatus: status
			});
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function handleApprove(user) {
		setApproving(true);
		try {
			await call(adminApproveStudent, { userId: user.id });
			toast.success(`${user.fullName} — eeyyamame. Koodii activation uumame.`);
			setReviewTarget(null);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setApproving(false);
		}
	}
	async function handleReject() {
		if (!rejectTarget) return;
		setRejecting(true);
		try {
			await call(adminRejectStudent, {
				userId: rejectTarget.id,
				reason: rejectReason || void 0
			});
			toast.success(`${rejectTarget.fullName} — didame.`);
			setRejectTarget(null);
			setRejectReason("");
			setReviewTarget(null);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setRejecting(false);
		}
	}
	async function handleReApprove(user) {
		try {
			await call(adminReApproveStudent, { userId: user.id });
			toast.success(`${user.fullName} — irra deebi'ee eeyyamame.`);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function handleManualActivate() {
		if (!activateTarget) return;
		setActivating(true);
		try {
			const expiresAt = activateExpiry ? new Date(activateExpiry).getTime() : null;
			await call(adminManualActivateStudent, {
				userId: activateTarget.id,
				courseIds: activateCourseIds,
				expiresAt,
				note: activateNote || void 0
			});
			toast.success(`${activateTarget.fullName} — hojiirra kaafame.`);
			setActivateTarget(null);
			setActivateCourseIds([]);
			setActivateExpiry("");
			setActivateNote("");
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setActivating(false);
		}
	}
	const pendingCount = users.filter((u) => u.role === "student" && (u.activationStatus ?? "pending") === "pending").length;
	const approvedCount = users.filter((u) => u.role === "student" && u.activationStatus === "approved").length;
	const activeCount = users.filter((u) => u.role === "student" && u.activationStatus === "active").length;
	const rejectedCount = users.filter((u) => u.role === "student" && u.activationStatus === "rejected").length;
	const totalStudents = users.filter((u) => u.role === "student").length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: t("admin.students")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground",
					children: [
						totalStudents,
						" ",
						t("common.students")
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
					to: "/admin/activation-codes",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						size: "sm",
						variant: "outline",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 mr-1" }), t("admin.activationCodes")]
					})
				})]
			}),
			!loading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-3 sm:grid-cols-5",
				children: [
					{
						label: "Waliigala",
						value: totalStudents,
						color: "text-foreground"
					},
					{
						label: "Eeggachaa",
						value: pendingCount,
						color: "text-yellow-600 dark:text-yellow-400"
					},
					{
						label: "Eeyyamame",
						value: approvedCount,
						color: "text-blue-600 dark:text-blue-400"
					},
					{
						label: "Hojiirra jira",
						value: activeCount,
						color: "text-emerald-600 dark:text-emerald-400"
					},
					{
						label: "Didame",
						value: rejectedCount,
						color: "text-red-500"
					}
				].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "rounded-xl border border-border/60 bg-card p-3 text-center",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: cn("text-xl font-bold", color),
						children: value
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground mt-0.5",
						children: label
					})]
				}, label))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Tabs, {
				defaultValue: pendingCount > 0 ? "waiting" : "all",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsList, {
						className: "mb-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "waiting",
							className: "gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardList, { className: "size-3.5" }),
								"Gaaffii Eeggatanii",
								pendingCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "destructive",
									className: "ml-1 h-5 px-1.5 text-xs",
									children: pendingCount
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsTrigger, {
							value: "all",
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), "Barattoota Hunda"]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "waiting",
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-base font-semibold",
							children: "Gaaffii Galmee Barattoota"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: "Eeyyama eegaa jiran"
						})] }), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: Array.from({ length: 3 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }, i))
						}) : pendingQueue.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-dashed border-border/60 py-12 text-center",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto size-10 text-muted-foreground/40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-muted-foreground",
								children: "Eeggachaa hin jiru"
							})]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: pendingQueue.map((user) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground",
										children: user.fullName[0]?.toUpperCase() ?? "?"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex-1 min-w-0",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "font-semibold",
												children: user.fullName
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm text-muted-foreground",
												children: user.email
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"
											})
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivationBadge, { status: user.activationStatus }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												size: "sm",
												variant: "outline",
												className: "gap-1.5 text-muted-foreground",
												onClick: () => setReviewTarget(user),
												children: "Ilaaluu"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												className: "gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
												onClick: () => void handleApprove(user),
												disabled: approving,
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), "Eeyyami"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
												size: "sm",
												variant: "outline",
												className: "gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20",
												onClick: () => {
													setRejectTarget(user);
													setRejectReason("");
												},
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), "Diidi"]
											})
										]
									})
								]
							}, user.id))
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(TabsContent, {
						value: "all",
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative flex-1 min-w-[180px]",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "absolute left-2.5 top-2.5 size-4 text-muted-foreground" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: t("common.search"),
										className: "pl-9",
										value: query,
										onChange: (e) => setQuery(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: roleFilter,
									onValueChange: setRoleFilter,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-36",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: "all",
										children: t("common.all")
									}), ROLE_OPTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
										value: r,
										children: t(`common.${r}`)
									}, r))] })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
									value: activationFilter,
									onValueChange: setActivationFilter,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
										className: "w-44",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Activation status" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "all",
											children: "Activation — Hunda"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "pending",
											children: "Eeggachaa"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "approved",
											children: "Eeyyamame"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "active",
											children: "Hojiirra jira"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "rejected",
											children: "Didame"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "suspended",
											children: "Dhaabbateera"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
											value: "expired",
											children: "Darbeera"
										})
									] })]
								})
							]
						}), loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-3",
							children: Array.from({ length: 5 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-16 rounded-lg" }, i))
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border/60 bg-card overflow-hidden",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "overflow-x-auto",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
									className: "w-full text-sm",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
										className: "border-b border-border/60 bg-muted/30",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
												children: t("common.name")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "hidden px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide md:table-cell",
												children: t("common.email")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
												children: t("common.role")
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide",
												children: "Activation"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
												className: "px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide",
												children: t("common.actions")
											})
										] })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
										className: "divide-y divide-border/40",
										children: filtered.map((user) => {
											const activStatus = user.activationStatus ?? "pending";
											return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
												className: "hover:bg-muted/20 transition-colors",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
														className: "px-4 py-3",
														children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "font-medium",
																children: user.fullName
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
																className: "text-xs text-muted-foreground md:hidden",
																children: user.email
															}),
															user.courseIds && user.courseIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "text-xs text-muted-foreground mt-0.5",
																children: [user.courseIds.length, " koorsii"]
															})
														]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "hidden px-4 py-3 text-muted-foreground md:table-cell",
														children: user.email
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: myProfile?.role === "owner" || myProfile?.role === "admin" && user.role !== "owner" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
															value: user.role,
															onValueChange: (v) => void changeRole(user.id, v),
															disabled: user.id === myProfile?.id,
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
																className: "h-7 w-32 text-xs",
																children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: ROLE_OPTIONS.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: r,
																children: t(`common.${r}`)
															}, r)) })]
														}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
															variant: "outline",
															className: "capitalize",
															children: user.role
														})
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivationBadge, { status: activStatus })
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
														className: "px-4 py-3",
														children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex items-center justify-end gap-1 flex-wrap",
															children: [user.id !== myProfile?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
																variant: "ghost",
																size: "sm",
																onClick: () => void toggleStatus(user),
																title: user.status === "active" ? "Suspend" : "Unsuspend",
																className: "h-7 w-7 p-0",
																children: user.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserX, { className: "size-3.5 text-destructive" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "size-3.5 text-emerald-500" })
															}), user.role === "student" && user.id !== myProfile?.id && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
																activStatus === "pending" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "outline",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20",
																	onClick: () => void handleApprove(user),
																	disabled: approving,
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Eeyyami"]
																}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "ghost",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20",
																	onClick: () => {
																		setRejectTarget(user);
																		setRejectReason("");
																	},
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3" }), "Diidi"]
																})] }),
																activStatus === "approved" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "outline",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20",
																	onClick: () => setActivateTarget(user),
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Harkaan Hojiirra Kaasi"]
																}),
																activStatus === "active" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "ghost",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20",
																	onClick: () => void setActivationStatusFn(user.id, "suspended"),
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldOff, { className: "size-3" }), "Dhaabi"]
																}),
																activStatus === "rejected" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "ghost",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
																	onClick: () => void handleReApprove(user),
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, { className: "size-3" }), "Irra Deebi'ee Eeyyami"]
																}),
																(activStatus === "suspended" || activStatus === "expired") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																	variant: "ghost",
																	size: "sm",
																	className: "h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20",
																	onClick: () => void setActivationStatusFn(user.id, "active"),
																	children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3" }), "Irra Deebisiisi"]
																})
															] })]
														})
													})
												]
											}, user.id);
										})
									})]
								})
							}), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "py-10 text-center text-muted-foreground",
								children: t("common.notFound")
							})]
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!reviewTarget,
				onOpenChange: (v) => {
					if (!v) setReviewTarget(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: "Galmee Barataa Ilaaluu" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Barataan kun eeyyama eegaa jira." })] }),
						reviewTarget && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "rounded-xl bg-muted/40 px-4 py-3 space-y-2 text-sm",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Maqaa"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: reviewTarget.fullName
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Imeelii"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium",
											children: reviewTarget.email
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Guyyaa"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reviewTarget.createdAt ? new Date(reviewTarget.createdAt).toLocaleDateString() : "—" })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between items-center",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Haala"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ActivationBadge, { status: reviewTarget.activationStatus })]
									}),
									reviewTarget.department && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-muted-foreground",
											children: "Damee"
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: reviewTarget.department })]
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "\"Eeyyami\" yoo cuqaastu, koodii activation dafee uumama."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, {
							className: "gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								className: "flex-1 gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20",
								onClick: () => {
									if (reviewTarget) {
										setRejectTarget(reviewTarget);
										setRejectReason("");
									}
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), "Diidi"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								className: "flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white",
								onClick: () => reviewTarget && void handleApprove(reviewTarget),
								disabled: approving,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }), approving ? "Hojiirraa kaafamaa..." : "Eeyyami"]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!rejectTarget,
				onOpenChange: (v) => {
					if (!v) {
						setRejectTarget(null);
						setRejectReason("");
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5 text-red-600" }), "Galmee Diiduu"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: rejectTarget?.fullName }), " — galmee isaanii ni diiduuf jirta."] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Sababa (Filannoo)" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
									placeholder: "fkn: Odeeffannoon galmee sirrii miti",
									value: rejectReason,
									onChange: (e) => setRejectReason(e.target.value),
									rows: 3
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Sababi yoo galte, barataan argachuu danda'a."
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => setRejectTarget(null),
							children: "Haquu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-red-600 hover:bg-red-700 text-white",
							onClick: () => void handleReject(),
							disabled: rejecting,
							children: rejecting ? "Diddamaa jira..." : "Diidi"
						})] })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!activateTarget,
				onOpenChange: (v) => {
					if (!v) {
						setActivateTarget(null);
						setActivateCourseIds([]);
						setActivateExpiry("");
						setActivateNote("");
					}
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-w-md",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-emerald-600" }), "Barataa Harkaan Hojiirra Kaasi"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogDescription, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: activateTarget?.fullName }), " — koodii activation osoo hin fayyadamiin herrega isaanii harkaan hojiirra kaastuu."] })] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Koorsiiwwan (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/60 p-2",
										children: [courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
											className: "flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 cursor-pointer",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
												type: "checkbox",
												className: "rounded border-border",
												checked: activateCourseIds.includes(c.id),
												onChange: (e) => {
													setActivateCourseIds((prev) => e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id));
												}
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium",
												children: c.titleOm || c.titleEn
											}), c.titleEn && c.titleOm !== c.titleEn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-xs text-muted-foreground",
												children: c.titleEn
											})] })]
										}, c.id)), courses.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-sm text-muted-foreground py-2 text-center",
											children: "Koorsiin hojirra jiru hin jiru"
										})]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Guyyaa dhumaa (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "date",
										value: activateExpiry,
										onChange: (e) => setActivateExpiry(e.target.value)
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Yaadadhu (Filannoo)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "fkn: Admin harkaan hojiirra kaase",
										value: activateNote,
										onChange: (e) => setActivateNote(e.target.value)
									})]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "outline",
							onClick: () => {
								setActivateTarget(null);
								setActivateCourseIds([]);
							},
							children: "Haquu"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "bg-emerald-600 hover:bg-emerald-700 text-white",
							onClick: () => void handleManualActivate(),
							disabled: activating,
							children: activating ? "Hojiirra kaafamaa jira..." : "Hojiirra Kaasi"
						})] })
					]
				})
			})
		]
	});
}
//#endregion
export { StudentsPage as component };
