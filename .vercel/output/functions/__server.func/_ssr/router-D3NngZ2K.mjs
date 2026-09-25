import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { t as ThemeProvider } from "./theme-qtZ2-RP_.mjs";
import { i as useI18n, t as I18nProvider } from "./utils-DJzCcaxX.mjs";
import { t as AuthProvider } from "./auth-DVuTDe7t.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, m as createFileRoute, p as lazyRouteComponent, s as Scripts, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { et as CloudDownload, n as X, w as RefreshCw } from "../_libs/lucide-react.mjs";
import { t as Toaster } from "../_libs/sonner.mjs";
import { t as Route$22 } from "./exam._examId-BZvAsGvM.mjs";
import { t as Route$23 } from "./result._attemptId-Bn9fKBBc.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-D3NngZ2K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles-BQJpJjiS.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster, {
		className: "toaster group",
		toastOptions: { classNames: {
			toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
			description: "group-[.toast]:text-muted-foreground",
			actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
			cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
		} },
		...props
	});
};
var useIsStandalone = () => {
	const [standalone, setStandalone] = (0, import_react.useState)(() => typeof window !== "undefined" ? window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true : false);
	(0, import_react.useEffect)(() => {
		const onAppInstalled = () => setStandalone(true);
		window.addEventListener("appinstalled", onAppInstalled);
		return () => window.removeEventListener("appinstalled", onAppInstalled);
	}, []);
	return standalone;
};
/**
* PWA shell handling: install prompt, offline-ready toast and update banner.
* All browser APIs run in effects so this is safe under SSR.
*/
function PwaInstaller() {
	const { t } = useI18n();
	const standalone = useIsStandalone();
	const [installEvt, setInstallEvt] = (0, import_react.useState)(null);
	const [dismissed, setDismissed] = (0, import_react.useState)(false);
	const [offlineReady, setOfflineReady] = (0, import_react.useState)(false);
	const [needRefresh, setNeedRefresh] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		let disposed = false;
		let unregister;
		const onPrompt = (e) => {
			e.preventDefault();
			if (!disposed) setInstallEvt(e);
		};
		window.addEventListener("beforeinstallprompt", onPrompt);
		import("./virtual_pwa-register-D2xFYFhu.mjs").then(({ registerSW }) => {
			if (disposed) return;
			unregister = registerSW({
				immediate: true,
				onOfflineReady: () => {
					if (!disposed) setOfflineReady(true);
				},
				onNeedRefresh: () => {
					if (!disposed) setNeedRefresh(true);
				}
			});
		}).catch(() => {});
		return () => {
			disposed = true;
			window.removeEventListener("beforeinstallprompt", onPrompt);
			unregister?.();
		};
	}, []);
	(0, import_react.useEffect)(() => {
		if (!offlineReady) return;
		const id = window.setTimeout(() => setOfflineReady(false), 3600);
		return () => window.clearTimeout(id);
	}, [offlineReady]);
	const handleInstall = async () => {
		if (!installEvt) return;
		await installEvt.prompt();
		await installEvt.userChoice;
		setInstallEvt(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [needRefresh && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-sm items-center gap-3 rounded-xl border border-primary/40 bg-card p-3 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-5 shrink-0 text-primary" }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t("pwa.updateReady")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t("pwa.updateBody")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "/",
					onClick: () => window.location.reload(),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						size: "sm",
						onClick: () => window.location.reload(),
						children: t("pwa.reload")
					})
				})
			]
		})
	}), !standalone && installEvt && !dismissed && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "fixed inset-x-0 bottom-4 z-[60] flex justify-center px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex w-full max-w-sm items-center gap-3 rounded-xl border bg-card p-3 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CloudDownload, { className: "size-5" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t("pwa.install")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t("pwa.installBody")
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					size: "sm",
					onClick: () => void handleInstall(),
					children: t("pwa.installCta")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					"aria-label": t("common.close"),
					className: "rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground",
					onClick: () => setDismissed(true),
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" })
				})
			]
		})
	})] });
}
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		reportLovableError(error, { boundary: "tanstack_root_error_component" });
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							router.invalidate();
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$21 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{
				name: "theme-color",
				content: "#13795f"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "default"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "OromiaAcademy"
			},
			{ title: "Oromia Academy" },
			{
				name: "description",
				content: "Afaan Oromoo-first technology education and digital examinations."
			},
			{
				name: "author",
				content: "Oromia Academy"
			},
			{
				property: "og:title",
				content: "Oromia Academy"
			},
			{
				property: "og:description",
				content: "Practical technology education and digital examinations in Afaan Oromoo."
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			}
		],
		links: [
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$21.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QueryClientProvider, {
		client: queryClient,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ThemeProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AuthProvider, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Toaster$1, {
				richColors: true,
				position: "top-right"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PwaInstaller, {})
		] }) }) })
	});
}
var $$splitComponentImporter$20 = () => import("./routes-iNkeEch5.mjs");
var Route$20 = createFileRoute("/")({
	head: () => ({ meta: [
		{ title: "Oromia Academy — Technology Education" },
		{
			name: "description",
			content: "Learn AI editing, Telegram earning and bot automation in Afaan Oromoo and English."
		},
		{
			property: "og:title",
			content: "Oromia Academy — Technology Education"
		},
		{
			property: "og:description",
			content: "Practical technology courses and secure digital examinations in Afaan Oromoo."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$20, "component")
});
/**
* Admin layout — sidebar navigation + staff-only guard.
*/
var $$splitComponentImporter$19 = () => import("../_admin-BT9FWMFh.mjs");
var Route$19 = createFileRoute("/_admin")({ component: lazyRouteComponent($$splitComponentImporter$19, "component") });
/**
* Layout route that redirects unauthenticated users to /auth.
* All protected pages nest under this route.
* Staff users (owner/admin/instructor) are redirected to the admin panel.
*
* Student routing by activationStatus:
*   pending  → /waiting-for-approval
*   approved → /waiting-for-approval  (code shown there, they activate from that page)
*   rejected → /waiting-for-approval  (rejection message shown)
*   active   → allowed into dashboard
*   suspended → /waiting-for-approval (suspension message shown)
*/
var $$splitComponentImporter$18 = () => import("../_authed-COQaBHQN.mjs");
var Route$18 = createFileRoute("/_authed")({ component: lazyRouteComponent($$splitComponentImporter$18, "component") });
var $$splitComponentImporter$17 = () => import("./about-BXXcdm3T.mjs");
var Route$17 = createFileRoute("/about")({
	head: () => ({ meta: [
		{ title: "About Us — Oromia Academy" },
		{
			name: "description",
			content: "Learn about Oromia Academy — practical technology and AI education in Afaan Oromoo and English. Contact us at oromiaacademy@gmail.com."
		},
		{
			property: "og:title",
			content: "About Us — Oromia Academy"
		},
		{
			property: "og:description",
			content: "Oromia Academy provides hands-on technology and AI training for the Oromo community."
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$17, "component")
});
/**
* Student Activation Page — /activate
*
* A student must redeem a valid activation code issued by Oromia Academy
* before they can access the Student Dashboard.
*
* Security: The actual validation runs entirely on the server (server fn).
* No local/session storage, no frontend boolean, no hidden button tricks.
*/
var $$splitComponentImporter$16 = () => import("./activate-aHgyz4eG.mjs");
var Route$16 = createFileRoute("/activate")({
	head: () => ({ meta: [{ title: "Herrega Haa Hojiirra Oolu — Oromia Academy" }, {
		name: "description",
		content: "Koodii activation kee galchi."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$16, "component")
});
var $$splitComponentImporter$15 = () => import("./auth-Bf2ZWCfs.mjs");
var Route$15 = createFileRoute("/auth")({
	head: () => ({ meta: [
		{ title: "Seeni / Galmaa'i — Oromia Academy" },
		{
			name: "description",
			content: "Create your Oromia Academy account or sign in to take Afaan Oromoo technology exams."
		},
		{
			property: "og:title",
			content: "Sign in — Oromia Academy"
		},
		{
			property: "og:description",
			content: "Access courses and digital examinations at Oromia Academy."
		},
		{
			property: "og:type",
			content: "website"
		},
		{
			name: "twitter:card",
			content: "summary_large_image"
		}
	] }),
	component: lazyRouteComponent($$splitComponentImporter$15, "component")
});
/**
* Waiting-for-Approval Page — /waiting-for-approval
*
* Shown to students who have registered but are not yet activated.
*
* State machine (mirrors activationStatus on the user profile):
*   pending   → "Waiting for admin approval" (no code shown)
*   approved  → "Approved! Your activation code is OA-XXXX-XXXX" + Activate button
*   rejected  → "Your request was not approved" + optional reason
*   suspended → "Your account has been suspended"
*   active    → redirect to /dashboard (already activated)
*
* Real-time: uses Firestore onSnapshot so the page auto-updates when admin
* approves or rejects without the student needing to refresh.
*
* Security: the raw activation code is fetched via a server function that
* verifies activationStatus === "approved" + userId match server-side.
* The browser never directly reads the activationCodeSecrets collection.
*/
var $$splitComponentImporter$14 = () => import("./waiting-for-approval-Cwfl9hsl.mjs");
var Route$14 = createFileRoute("/waiting-for-approval")({
	head: () => ({ meta: [{ title: "Eeyyama Eegachaa — Oromia Academy" }, {
		name: "description",
		content: "Eeyyama bulchiinsaa eegachaa jirta."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$14, "component")
});
/**
* Admin section layout — wraps all /admin/* routes.
* This file MUST only render <Outlet /> so child routes display properly.
* The overview dashboard lives in _admin.admin.index.tsx
*/
var $$splitComponentImporter$13 = () => import("../_admin.admin-BA-VExqH.mjs");
var Route$13 = createFileRoute("/_admin/admin")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
/**
* Student dashboard — real Firebase data via server functions.
*/
var $$splitComponentImporter$12 = () => import("../_authed.dashboard-CU9AH2xR.mjs");
var Route$12 = createFileRoute("/_authed/dashboard")({
	head: () => ({ meta: [{ title: "Student Dashboard — Oromia Academy" }, {
		name: "description",
		content: "Your courses, exams and results at Oromia Academy."
	}] }),
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
/**
* Admin root — redirects /admin to /admin/exams.
*/
var $$splitComponentImporter$11 = () => import("../_admin.admin.index-D_CuKoEe.mjs");
var Route$11 = createFileRoute("/_admin/admin/")({
	head: () => ({ meta: [{ title: "Admin — Oromia Academy" }] }),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
/**
* Admin — Activation Codes management
*
* Allows admins to:
* - Generate single or bulk activation codes
* - Assign codes to specific students / courses
* - Set expiration dates
* - Revoke codes
* - Search, filter, and copy generated codes
*/
var $$splitComponentImporter$10 = () => import("../_admin.admin.activation-codes-DBn7gEZt.mjs");
var Route$10 = createFileRoute("/_admin/admin/activation-codes")({ component: lazyRouteComponent($$splitComponentImporter$10, "component") });
/**
* Admin — AI Question Import
* Full workflow: paste text → AI extract → validate → review/edit → approve → save to Question Bank
*/
var $$splitComponentImporter$9 = () => import("../_admin.admin.ai-import-CTgi8EG2.mjs");
var Route$9 = createFileRoute("/_admin/admin/ai-import")({ component: lazyRouteComponent($$splitComponentImporter$9, "component") });
/**
* Admin — Analytics
*/
var $$splitComponentImporter$8 = () => import("../_admin.admin.analytics-BGQR0eKV.mjs");
var Route$8 = createFileRoute("/_admin/admin/analytics")({ component: lazyRouteComponent($$splitComponentImporter$8, "component") });
/**
* Admin — Audit Log
*/
var $$splitComponentImporter$7 = () => import("../_admin.admin.audit-CINylO2d.mjs");
var Route$7 = createFileRoute("/_admin/admin/audit")({ component: lazyRouteComponent($$splitComponentImporter$7, "component") });
/**
* Admin — Courses management
*/
var $$splitComponentImporter$6 = () => import("../_admin.admin.courses-DvvUxNv5.mjs");
var Route$6 = createFileRoute("/_admin/admin/courses")({
	validateSearch: (s) => ({ new: s.new === "1" ? "1" : void 0 }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
/**
* Admin — Exams management
* Full-featured exam creation wizard with PDF import, question bank, leaderboard controls.
*/
var $$splitComponentImporter$5 = () => import("../_admin.admin.exams-CQv9yjWk.mjs");
var Route$5 = createFileRoute("/_admin/admin/exams")({
	validateSearch: (s) => ({ ...s["new"] === "1" ? { new: "1" } : {} }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
/**
* Admin — Question bank
*/
var $$splitComponentImporter$4 = () => import("../_admin.admin.questions-CbHlwoXO.mjs");
var Route$4 = createFileRoute("/_admin/admin/questions")({
	validateSearch: (s) => ({ ...s["new"] === "1" ? { new: "1" } : {} }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
/** Split raw text into individual question blocks */
/** Parse a single question block */
/** Parse all questions from a multi-question paste */
/**
* Admin — Student Rankings / Leaderboard
*/
var $$splitComponentImporter$3 = () => import("../_admin.admin.rankings-iFe5Kn9K.mjs");
var Route$3 = createFileRoute("/_admin/admin/rankings")({ component: lazyRouteComponent($$splitComponentImporter$3, "component") });
/**
* Admin — Results & Grading
*/
var $$splitComponentImporter$2 = () => import("../_admin.admin.results-BUtuQCot.mjs");
var Route$2 = createFileRoute("/_admin/admin/results")({ component: lazyRouteComponent($$splitComponentImporter$2, "component") });
/**
* Admin — Academy Settings
*/
var $$splitComponentImporter$1 = () => import("../_admin.admin.settings-C9qdu5wj.mjs");
var Route$1 = createFileRoute("/_admin/admin/settings")({ component: lazyRouteComponent($$splitComponentImporter$1, "component") });
/**
* Admin — Students management with Approval Queue + Activation Control
*/
var $$splitComponentImporter = () => import("../_admin.admin.students-BUHWlxKx.mjs");
var Route = createFileRoute("/_admin/admin/students")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var IndexRoute = Route$20.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$21
});
var AdminRoute = Route$19.update({
	id: "/_admin",
	getParentRoute: () => Route$21
});
var AuthedRoute = Route$18.update({
	id: "/_authed",
	getParentRoute: () => Route$21
});
var AboutRoute = Route$17.update({
	id: "/about",
	path: "/about",
	getParentRoute: () => Route$21
});
var ActivateRoute = Route$16.update({
	id: "/activate",
	path: "/activate",
	getParentRoute: () => Route$21
});
var AuthRoute = Route$15.update({
	id: "/auth",
	path: "/auth",
	getParentRoute: () => Route$21
});
var WaitingForApprovalRoute = Route$14.update({
	id: "/waiting-for-approval",
	path: "/waiting-for-approval",
	getParentRoute: () => Route$21
});
var AdminAdminRoute = Route$13.update({
	id: "/admin",
	path: "/admin",
	getParentRoute: () => AdminRoute
});
var AuthedDashboardRoute = Route$12.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AuthedRoute
});
var ExamExamIdRoute = Route$22.update({
	id: "/exam/$examId",
	path: "/exam/$examId",
	getParentRoute: () => Route$21
});
var ResultAttemptIdRoute = Route$23.update({
	id: "/result/$attemptId",
	path: "/result/$attemptId",
	getParentRoute: () => Route$21
});
var AdminAdminIndexRoute = Route$11.update({
	id: "/",
	path: "/",
	getParentRoute: () => AdminAdminRoute
});
var AdminAdminRouteChildren = {
	AdminAdminActivationCodesRoute: Route$10.update({
		id: "/activation-codes",
		path: "/activation-codes",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminAiImportRoute: Route$9.update({
		id: "/ai-import",
		path: "/ai-import",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminAnalyticsRoute: Route$8.update({
		id: "/analytics",
		path: "/analytics",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminAuditRoute: Route$7.update({
		id: "/audit",
		path: "/audit",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminCoursesRoute: Route$6.update({
		id: "/courses",
		path: "/courses",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminExamsRoute: Route$5.update({
		id: "/exams",
		path: "/exams",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminQuestionsRoute: Route$4.update({
		id: "/questions",
		path: "/questions",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminRankingsRoute: Route$3.update({
		id: "/rankings",
		path: "/rankings",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminResultsRoute: Route$2.update({
		id: "/results",
		path: "/results",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminSettingsRoute: Route$1.update({
		id: "/settings",
		path: "/settings",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminStudentsRoute: Route.update({
		id: "/students",
		path: "/students",
		getParentRoute: () => AdminAdminRoute
	}),
	AdminAdminIndexRoute
};
var AdminRouteChildren = { AdminAdminRoute: AdminAdminRoute._addFileChildren(AdminAdminRouteChildren) };
var AdminRouteWithChildren = AdminRoute._addFileChildren(AdminRouteChildren);
var AuthedRouteChildren = { AuthedDashboardRoute };
var rootRouteChildren = {
	IndexRoute,
	AdminRoute: AdminRouteWithChildren,
	AuthedRoute: AuthedRoute._addFileChildren(AuthedRouteChildren),
	AboutRoute,
	ActivateRoute,
	AuthRoute,
	WaitingForApprovalRoute,
	ExamExamIdRoute,
	ResultAttemptIdRoute
};
var routeTree = Route$21._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
