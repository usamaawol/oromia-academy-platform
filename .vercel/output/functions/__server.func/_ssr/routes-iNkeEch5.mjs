import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, r as localized } from "./utils-DJzCcaxX.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { V as Info, b as Send, bt as ArrowRight, ct as CircleCheck, gt as Bot, h as Sparkles, i as WifiOff, nt as Clock3 } from "../_libs/lucide-react.mjs";
import { t as SiteHeader } from "./site-header-r2TkZ-J4.mjs";
import { t as listCourses } from "./data-BG6xX6_J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-iNkeEch5.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Index() {
	const { t, lang } = useI18n();
	const [courses, setCourses] = (0, import_react.useState)([]);
	(0, import_react.useEffect)(() => {
		listCourses().then(setCourses).catch(() => setCourses([]));
	}, []);
	const icons = {
		sparkles: Sparkles,
		send: Send,
		bot: Bot
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface-hero relative overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-glow absolute inset-0 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative mx-auto grid min-h-[530px] w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_.8fr] md:py-20",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-3xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4" }),
										" ",
										t("landing.badge")
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-4xl font-bold leading-tight md:text-6xl",
									children: t("landing.heroTitle")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg",
									children: t("landing.heroSubtitle")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex flex-wrap gap-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "lg",
											className: "bg-background text-foreground hover:bg-background/90",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/auth",
												children: [
													t("landing.ctaPrimary"),
													" ",
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, {})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "lg",
											variant: "outline",
											className: "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
												href: "#courses",
												children: t("landing.ctaSecondary")
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "lg",
											variant: "outline",
											className: "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
												to: "/about",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Info, { className: "mr-2 size-5" }), t("nav.about")]
											})
										})
									]
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "hidden md:block",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "border-l border-primary-foreground/20 pl-8",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-semibold uppercase text-primary-foreground/65",
										children: "Oromia Academy"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-4 text-2xl font-semibold leading-snug",
										children: t("landing.heroQuestion")
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "mt-8 grid grid-cols-3 gap-3",
										children: [
											["3+", t("landing.statsCourses")],
											["100+", t("landing.statsStudents")],
											["3", t("landing.statsExams")]
										].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "border-t border-primary-foreground/25 pt-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "text-2xl font-bold",
												children: value
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "mt-1 text-xs text-primary-foreground/65",
												children: label
											})]
										}, label))
									})
								]
							})
						})]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					id: "courses",
					className: "mx-auto w-full max-w-6xl px-4 py-16",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "max-w-2xl",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold text-primary",
								children: t("nav.courses")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-3xl font-bold",
								children: t("landing.coursesTitle")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-muted-foreground",
								children: t("landing.coursesSubtitle")
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-8 grid gap-4 md:grid-cols-3",
						children: courses.map((course) => {
							const Icon = icons[course.icon] ?? Sparkles;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: "rounded-lg border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-11 place-items-center rounded-md bg-accent text-accent-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "mt-5 text-xl font-semibold",
										children: localized(lang, course.titleOm, course.titleEn)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 min-h-12 text-sm leading-6 text-muted-foreground",
										children: localized(lang, course.descOm, course.descEn)
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-5 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
											className: "flex items-center gap-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-4" }),
												" ",
												course.lessons ?? 0,
												" lessons"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "capitalize",
											children: course.level
										})]
									})
								]
							}, course.id);
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-y bg-muted/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3",
						children: [
							[
								CircleCheck,
								t("landing.why1Title"),
								t("landing.why1Body")
							],
							[
								Clock3,
								t("landing.why2Title"),
								t("landing.why2Body")
							],
							[
								WifiOff,
								t("landing.why4Title"),
								t("landing.why4Body")
							]
						].map(([Icon, title, body]) => {
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-6 text-primary" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "mt-4 font-semibold",
									children: String(title)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm leading-6 text-muted-foreground",
									children: String(body)
								})
							] }, String(title));
						})
					})
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 Oromia Academy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: t("landing.footerNote") })]
			})
		]
	});
}
//#endregion
export { Index as component };
