import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, r as localized } from "./utils-DJzCcaxX.mjs";
import { n as authErrorKey, o as useAuth } from "./auth-DVuTDe7t.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { _ as useNavigate, g as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { W as GraduationCap, _ as ShieldCheck, h as Sparkles } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-C66tOvwJ.mjs";
import { t as Label } from "./label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./select-_rVIUp5t.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, r as CardDescription, t as Card } from "./card-6xbYZB6Z.mjs";
import { t as SiteHeader } from "./site-header-r2TkZ-J4.mjs";
import { t as listCourses } from "./data-BG6xX6_J.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auth-Bf2ZWCfs.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DEPARTMENTS = [
	{
		id: "ai-editing",
		om: "Gulaalcha AI",
		en: "AI Editing"
	},
	{
		id: "telegram-earning",
		om: "Telegram irraa Galii Argachuu",
		en: "Telegram Earning"
	},
	{
		id: "bot-automation",
		om: "Bot Automation",
		en: "Bot Automation"
	},
	{
		id: "web-development",
		om: "Marsariitii Ijaaruu",
		en: "Web Development"
	},
	{
		id: "graphics-design",
		om: "Dizaayinii Giraafiksii",
		en: "Graphics Design"
	},
	{
		id: "other",
		om: "Kan biraa",
		en: "Other"
	}
];
function GoogleMark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 48 48",
		className: "size-4",
		"aria-hidden": "true",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#EA4335",
				d: "M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.4 17.7 9.5 24 9.5z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#4285F4",
				d: "M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.2 7-17.6z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#FBBC05",
				d: "M10.5 28.6a14.6 14.6 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2z"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
				fill: "#34A853",
				d: "M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-3.9-13.5-9.4l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
			})
		]
	});
}
function AuthPage() {
	const { t, lang } = useI18n();
	const { login, register, resetPassword, loginWithGoogle, user, profile, isStaff, loading } = useAuth();
	const navigate = useNavigate();
	const [mode, setMode] = (0, import_react.useState)("login");
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [fullName, setFullName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [phone, setPhone] = (0, import_react.useState)("");
	const [department, setDepartment] = (0, import_react.useState)("");
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [confirm, setConfirm] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		listCourses().then(setCourses).catch(() => void 0);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!loading && user) {
			const target = isStaff ? "/admin" : profile?.activationStatus === "active" ? "/dashboard" : "/waiting-for-approval";
			navigate({ to: target });
		}
	}, [
		user,
		profile,
		isStaff,
		loading,
		navigate
	]);
	function postAuthRedirect() {
		if (isStaff) return navigate({ to: "/admin" });
		if (profile?.activationStatus === "active") return navigate({ to: "/dashboard" });
		return navigate({ to: "/waiting-for-approval" });
	}
	async function google() {
		setBusy(true);
		try {
			await loginWithGoogle();
			toast.success(t("common.success"));
			await postAuthRedirect();
		} catch (err) {
			toast.error(t(authErrorKey(err)));
		} finally {
			setBusy(false);
		}
	}
	async function submit(e) {
		e.preventDefault();
		setBusy(true);
		try {
			if (mode === "login") {
				await login(email, password);
				toast.success(t("common.success"));
				await postAuthRedirect();
			} else if (mode === "register") {
				if (!department) {
					toast.error(t("auth.departmentRequired"));
					return;
				}
				if (password !== confirm) {
					toast.error(t("auth.passwordMismatch"));
					return;
				}
				await register({
					fullName,
					email,
					password,
					department,
					...phone ? { phone } : {},
					...courseId ? { courseId } : {}
				});
				toast.success(t("common.success"));
				await postAuthRedirect();
			} else {
				await resetPassword(email);
				toast.success(t("auth.resetSent"));
				setMode("login");
			}
		} catch (err) {
			toast.error(t(authErrorKey(err)));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "relative overflow-hidden",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-glow pointer-events-none absolute inset-0 opacity-[0.35]" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_460px] lg:py-16",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "hidden lg:block",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }),
								" ",
								t("landing.badge")
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "mt-6 text-4xl font-bold leading-tight",
							children: t("landing.heroTitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 max-w-xl leading-7 text-muted-foreground",
							children: t("landing.heroSubtitle")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-8 grid gap-4",
							children: [[
								GraduationCap,
								t("landing.why1Title"),
								t("landing.why1Body")
							], [
								ShieldCheck,
								t("landing.why2Title"),
								t("landing.why2Body")
							]].map(([Icon, title, body]) => {
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block font-semibold",
										children: String(title)
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "block text-sm text-muted-foreground",
										children: String(body)
									})] })]
								}, String(title));
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "border-border/80 bg-card/90 shadow-glow backdrop-blur",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
						className: "text-2xl",
						children: mode === "login" ? t("auth.loginTitle") : mode === "register" ? t("auth.registerTitle") : t("auth.resetTitle")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardDescription, { children: mode === "login" ? t("auth.loginSubtitle") : mode === "register" ? t("auth.emailNote") : t("auth.resetBody") })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [
						mode !== "reset" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							type: "button",
							variant: "outline",
							className: "w-full gap-2",
							disabled: busy,
							onClick: () => void google(),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoogleMark, {}), t("auth.google")]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" }),
								t("auth.or"),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "h-px flex-1 bg-border" })
							]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "flex flex-col gap-4",
							onSubmit: submit,
							children: [
								mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "fullName",
										children: t("auth.fullName")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "fullName",
										value: fullName,
										onChange: (e) => setFullName(e.target.value),
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "email",
										children: t("auth.email")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "email",
										type: "email",
										value: email,
										onChange: (e) => setEmail(e.target.value),
										required: true
									})]
								}),
								mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("auth.department") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: department,
											onValueChange: setDepartment,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: t("auth.selectDepartment") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: DEPARTMENTS.map((d) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: d.id,
												children: lang === "om" ? d.om : d.en
											}, d.id)) })]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
											htmlFor: "phone",
											children: [
												t("auth.phone"),
												" ",
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
													className: "text-xs text-muted-foreground",
													children: [
														"(",
														t("common.optional"),
														")"
													]
												})
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											id: "phone",
											value: phone,
											onChange: (e) => setPhone(e.target.value)
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "grid gap-2",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
											t("auth.selectCourse"),
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: [
													"(",
													t("common.optional"),
													")"
												]
											})
										] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
											value: courseId,
											onValueChange: setCourseId,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: t("auth.selectCourse") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: c.id,
												children: localized(lang, c.titleOm, c.titleEn)
											}, c.id)) })]
										})]
									})
								] }),
								mode !== "reset" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "password",
										children: t("auth.password")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "password",
										type: "password",
										value: password,
										onChange: (e) => setPassword(e.target.value),
										required: true
									})]
								}),
								mode === "register" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
										htmlFor: "confirm",
										children: t("auth.confirmPassword")
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										id: "confirm",
										type: "password",
										value: confirm,
										onChange: (e) => setConfirm(e.target.value),
										required: true
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									type: "submit",
									disabled: busy,
									className: "w-full",
									children: busy ? t("common.loading") : mode === "login" ? t("auth.login") : mode === "register" ? t("auth.register") : t("auth.resetSend")
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-5 flex flex-col gap-2 text-sm text-muted-foreground",
							children: [
								mode === "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-left underline-offset-4 hover:underline",
									onClick: () => setMode("reset"),
									children: t("auth.forgot")
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-left font-medium text-primary underline-offset-4 hover:underline",
									onClick: () => setMode("register"),
									children: t("auth.noAccount")
								})] }),
								mode !== "login" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "text-left underline-offset-4 hover:underline",
									onClick: () => setMode("login"),
									children: t("auth.haveAccount")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/",
									className: "underline-offset-4 hover:underline",
									children: t("common.back")
								})
							]
						})
					] })]
				})]
			})]
		})]
	});
}
//#endregion
export { AuthPage as component };
