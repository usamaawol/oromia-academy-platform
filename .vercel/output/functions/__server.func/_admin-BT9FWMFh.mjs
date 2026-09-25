import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { n as useTheme } from "./_ssr/theme-qtZ2-RP_.mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { o as useAuth } from "./_ssr/auth-DVuTDe7t.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { _ as useNavigate, f as Outlet, g as Link, l as useRouterState } from "./_libs/@tanstack/react-router+[...].mjs";
import { Y as useServerFn, g as adminListPendingStudents } from "./_ssr/server-fns-BeozUQqq.mjs";
import { B as KeyRound, F as LogOut, H as History, W as GraduationCap, _t as BookOpen, a as Users, ht as ChartColumn, it as ClipboardList, j as Menu, k as Moon, m as Sun, n as X, t as Zap, u as Trophy, v as Settings, yt as Award } from "./_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin-BT9FWMFh.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin layout — sidebar navigation + staff-only guard.
*/
var NAV_ITEMS = [
	{
		to: "/admin/students",
		label: "admin.students",
		icon: Users,
		badgeKey: "pending"
	},
	{
		to: "/admin/activation-codes",
		label: "admin.activationCodes",
		icon: KeyRound
	},
	{
		to: "/admin/rankings",
		label: "common.rankings",
		icon: Trophy
	},
	{
		to: "/admin/courses",
		label: "admin.courses",
		icon: BookOpen
	},
	{
		to: "/admin/questions",
		label: "admin.questions",
		icon: ClipboardList
	},
	{
		to: "/admin/exams",
		label: "admin.exams",
		icon: GraduationCap
	},
	{
		to: "/admin/results",
		label: "admin.grading",
		icon: Award
	},
	{
		to: "/admin/analytics",
		label: "admin.analytics",
		icon: ChartColumn
	},
	{
		to: "/admin/audit",
		label: "admin.audit",
		icon: History
	},
	{
		to: "/admin/settings",
		label: "common.settings",
		icon: Settings
	}
];
function AdminLayout() {
	const { t } = useI18n();
	const { user, profile, loading, isStaff, logout } = useAuth();
	const navigate = useNavigate();
	const [sidebarOpen, setSidebarOpen] = (0, import_react.useState)(false);
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const { theme, setTheme } = useTheme();
	const call = useServerFn();
	const [pendingCount, setPendingCount] = (0, import_react.useState)(0);
	(0, import_react.useEffect)(() => {
		if (!loading && (!user || !isStaff)) navigate({ to: user ? "/dashboard" : "/auth" });
	}, [
		user,
		loading,
		isStaff,
		navigate
	]);
	(0, import_react.useEffect)(() => {
		if (!user || !isStaff) return;
		call(adminListPendingStudents, void 0).then((students) => setPendingCount(students.filter((s) => (s.activationStatus ?? "pending") === "pending").length)).catch(() => void 0);
	}, [user, isStaff]);
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col items-center gap-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid size-12 place-items-center rounded-2xl bg-primary/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
					src: "/favicon.ico",
					alt: "Logo",
					className: "size-6 object-contain animate-pulse"
				})
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "h-1 w-32 overflow-hidden rounded-full bg-muted",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-full w-1/2 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-primary" })
			})]
		})
	});
	if (!user || !isStaff) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-background",
		children: [
			sidebarOpen && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden",
				onClick: () => setSidebarOpen(false)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("aside", {
				className: cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0", sidebarOpen ? "translate-x-0" : "-translate-x-full"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex h-16 items-center gap-3 border-b border-border/60 px-5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								src: "/favicon.ico",
								alt: "Logo",
								className: "size-9 shrink-0 rounded-xl object-contain shadow-glow"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "truncate font-bold text-sm leading-tight",
									children: t("common.academy")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-1 mt-0.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-2.5 text-primary" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-xs text-muted-foreground",
										children: "Admin Panel"
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "ml-auto rounded-lg p-1.5 hover:bg-accent transition-colors lg:hidden",
								onClick: () => setSidebarOpen(false),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
						className: "flex-1 overflow-y-auto px-3 py-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70",
							children: "Navigation"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-0.5",
							children: NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => {
								const active = pathname === to || pathname.startsWith(to + "/");
								const showBadge = "badgeKey" in rest && rest.badgeKey === "pending" && pendingCount > 0;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to,
									onClick: () => setSidebarOpen(false),
									className: cn("group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150", active ? "bg-primary text-primary-foreground shadow-glow" : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: cn("grid size-7 shrink-0 place-items-center rounded-lg transition-colors", active ? "bg-primary-foreground/15" : "bg-muted group-hover:bg-accent-foreground/10"),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5" })
										}),
										t(label),
										showBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("ml-auto flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold", active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-destructive text-destructive-foreground"),
											children: pendingCount
										}),
										active && !showBadge && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "ml-auto size-1.5 rounded-full bg-primary-foreground/70" })
									]
								}, to);
							})
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "border-t border-border/60 p-3 space-y-1",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setTheme(theme === "dark" ? "light" : "dark"),
								className: "w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors",
								children: [theme === "dark" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sun, { className: "size-3.5 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Moon, { className: "size-3.5 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: theme === "dark" ? "Light mode" : "Dark mode" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm",
									children: (profile?.fullName ?? "A")[0]?.toUpperCase()
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "min-w-0 flex-1",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "truncate text-xs font-semibold",
										children: profile?.fullName
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize", {
											owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
											admin: "bg-primary/10 text-primary",
											instructor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
										}[profile?.role ?? "admin"] ?? "bg-muted text-muted-foreground"),
										children: profile?.role
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "ghost",
								size: "sm",
								className: "w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors",
								onClick: () => void logout(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "size-3.5" }), t("auth.logout")]
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col min-w-0",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-sm lg:hidden sticky top-0 z-30",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => setSidebarOpen(true),
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
							src: "/favicon.ico",
							alt: "Logo",
							className: "size-7 rounded-lg object-contain"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-semibold text-sm",
							children: t("admin.title")
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "flex-1 overflow-auto p-4 md:p-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})
		]
	});
}
//#endregion
export { AdminLayout as component };
