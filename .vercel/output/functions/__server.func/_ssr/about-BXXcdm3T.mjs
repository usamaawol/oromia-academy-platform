import { N as require_jsx_runtime } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n } from "./utils-DJzCcaxX.mjs";
import { t as Button } from "./button-Dlq7EbrN.mjs";
import { A as MessageCircle, G as Globe, P as Mail, U as Heart, W as GraduationCap, _t as BookOpen, a as Users, bt as ArrowRight, gt as Bot, h as Sparkles, p as Target, yt as Award } from "../_libs/lucide-react.mjs";
import { n as CardContent, t as Card } from "./card-6xbYZB6Z.mjs";
import { t as SiteHeader } from "./site-header-r2TkZ-J4.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/about-BXXcdm3T.js
var import_jsx_runtime = require_jsx_runtime();
function AboutPage() {
	const { t, lang } = useI18n();
	const isOm = lang === "om";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "surface-hero relative overflow-hidden",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "grid-glow absolute inset-0 opacity-40" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "relative mx-auto w-full max-w-6xl px-4 py-20 md:py-28",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-3xl",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-1.5 text-sm font-medium",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Heart, { className: "size-4" }), isOm ? "Waa'ee Oromia Academy" : "About Oromia Academy"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
									className: "text-4xl font-bold leading-tight md:text-6xl",
									children: isOm ? "Teeknooloojii fi AI — Afaan Keetiiin Baradhuu" : "Learn Technology & AI — In Your Language"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-6 max-w-2xl text-base leading-8 text-primary-foreground/85 md:text-lg",
									children: isOm ? "Oromia Academy bakka barattoota Oromoo teeknooloojii, Artificial Intelligence (AI) fi gara fuulduraatti gaafatanitti hima. Barnoonni keenya gochaan, Afaan Oromootiin, akkasumas English keessatti ni himama." : "Oromia Academy is where the Oromo community comes to learn technology, artificial intelligence, and future-ready skills — hands-on, in Afaan Oromoo, with English also available."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-8 flex flex-wrap gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										className: "bg-background text-foreground hover:bg-background/90",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: "mailto:oromiaacademy@gmail.com",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mr-2 size-5" }), "oromiaacademy@gmail.com"]
										})
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										asChild: true,
										size: "lg",
										variant: "outline",
										className: "border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
											href: "#mission",
											children: [isOm ? "Yaada Keenya Ilaali" : "Discover Our Mission", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "ml-2 size-4" })]
										})
									})]
								})
							]
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					id: "mission",
					className: "mx-auto w-full max-w-6xl px-4 py-20",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid gap-10 md:grid-cols-2 md:items-start",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold uppercase tracking-widest text-primary",
								children: isOm ? "Yaada fi Misiina Keenya" : "Our Mission & Vision"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "mt-2 text-3xl font-bold md:text-4xl",
								children: isOm ? "Barattoota Oromoo teeknooloojii irraa deebi'uuf qopheessuuf." : "Empowering the Oromo community through technology."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-5 leading-7 text-muted-foreground md:text-lg",
								children: isOm ? "Misiina keenya namni Oromoo teeknooloojii fi AI dandeettii qabaachuuf, iddoo gargaaruu fi barnoota gochaa kennuudha. Osoo gosa, barnoota, booda deemtuu hamus ta'uu qaba jedhee waan dhagaynu irraan garee garaa caalaa bu'aa qabu kennuuf qophii jira." : "Our mission is simple — give every Oromo learner a fair shot at the future by providing practical, hands-on technology and AI education that actually works. No empty theory; just real tools, real projects, and real skills you can use starting today."
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-8 space-y-4",
								children: [
									{
										icon: Target,
										title: isOm ? "Fayyaa baradhaa" : "Excellence in teaching",
										body: isOm ? "Barnoota calaaqaa, gochaa, fi sirriitti himama." : "Structured, high-quality, practical training programs."
									},
									{
										icon: Globe,
										title: isOm ? "Afaan keetiiin" : "In your language",
										body: isOm ? "Afaan Oromootiin himama, English akka bakka bu'aa ni argama." : "Taught primarily in Afaan Oromoo, with English as a secondary medium."
									},
									{
										icon: Award,
										title: isOm ? "Qormaata nageenyaa" : "Secure certification",
										body: isOm ? "Qormaata dijitaalaa nageenyaa fi bu'aa ni argachuuf qophii jira." : "Protected digital exams with verifiable results."
									}
								].map(({ icon: Ic, title, body }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start gap-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary",
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ic, { className: "size-5" })
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "font-semibold",
										children: title
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-0.5 text-sm leading-6 text-muted-foreground",
										children: body
									})] })]
								}, title))
							})
						] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid gap-4 md:mt-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "overflow-hidden border-primary/20 shadow-soft",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-8 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-4 text-2xl font-bold",
												children: isOm ? "Barattoota Gargaaruu" : "For Every Student"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 leading-7 text-muted-foreground",
												children: isOm ? "Yeroo kamiyyuu, nama kamiyyuu fi gosa kamiyyuu barachuuf danda'a. Barattoonni bilbila keessan gaaffii gaarii kennanii itti fufuudha." : "Whether you're a complete beginner or you already know some tech, our programs meet you exactly where you are. You can learn from your phone, no fancy laptop required."
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "overflow-hidden shadow-soft",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-8 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-4 text-2xl font-bold",
												children: isOm ? "AI fi Future Tech" : "AI & Future-Ready Skills"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 leading-7 text-muted-foreground",
												children: isOm ? "Suuraa AI, fiidiyoo, Telegram bootii, fi iddoo gaarii kaayyoo hojjennaan garee gara caalaa bu'aa buusuuf qophii jira." : "We cover AI image & video editing, earning through Telegram, building AI-powered Telegram bots, and everything in between — genuinely useful skills for the economy coming."
											})
										]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
									className: "overflow-hidden shadow-soft",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
										className: "p-6",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "size-8 text-primary" }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "mt-4 text-2xl font-bold",
												children: isOm ? "Barnoota Gochaa" : "Hands-On, Practical Courses"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-2 leading-7 text-muted-foreground",
												children: isOm ? "Yaada qofa osoo hin ta'uu, meeshaalee dhugaa irratti hojjennaan garii galmeessu." : "You don't just hear about it — you do it. Every lesson pairs explanation with a real exercise you complete on the spot."
											})
										]
									})
								})
							]
						})]
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "border-y bg-muted/40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mx-auto grid w-full max-w-6xl gap-8 px-4 py-16 md:grid-cols-4",
						children: [
							{
								icon: GraduationCap,
								value: "3+",
								label: t("landing.statsCourses")
							},
							{
								icon: Users,
								value: "100+",
								label: t("landing.statsStudents")
							},
							{
								icon: Award,
								value: "3",
								label: t("landing.statsExams")
							},
							{
								icon: Sparkles,
								value: "100%",
								label: isOm ? "Barnoota Gochaa" : "Practical Learning"
							}
						].map(({ icon: Ic, value, label }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "text-center",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mx-auto grid size-14 place-items-center rounded-2xl bg-card shadow-soft",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Ic, { className: "size-6 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-4 text-4xl font-black tracking-tight",
									children: value
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-1 text-sm font-medium text-muted-foreground",
									children: label
								})
							]
						}, label))
					})
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mx-auto w-full max-w-4xl px-4 py-20 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mx-auto grid size-16 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-glow",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "size-8" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "mt-6 text-3xl font-bold md:text-4xl",
							children: isOm ? "Nu Qunnami" : "Get In Touch"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground",
							children: isOm ? "Barnoota keenya, galmaa'uuf, ykn gaaffii qabaachuu dandeessu. Maaloo gara imeelii keessatti nu qunnami — nuun ofii sirritti deebi'a." : "Have questions about our courses, enrollment, or how Oromia Academy can help you? We'd love to hear from you. Send us an email and we will get back to you personally."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-10",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
								className: "mx-auto max-w-xl overflow-hidden border-primary/20 shadow-soft",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
									className: "p-8",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid size-14 mx-auto place-items-center rounded-2xl bg-primary/10",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-7 text-primary" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground",
											children: isOm ? "Imeelii Qunnamuu" : "Contact Email"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											href: "mailto:oromiaacademy@gmail.com",
											className: "mt-1 block text-2xl font-bold text-primary hover:underline break-all",
											children: "oromiaacademy@gmail.com"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "mt-3 text-sm leading-6 text-muted-foreground",
											children: isOm ? "Imeelii kana irratti gaaffilee, galmaa'uuf fi gargaarsa baradhaa nu qunnami." : "Reach out to us here for any questions, registrations, or support. We reply to every message."
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											asChild: true,
											size: "lg",
											className: "mt-6 w-full",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
												href: "mailto:oromiaacademy@gmail.com",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mail, { className: "mr-2 size-5" }), isOm ? "Imeelii Ergi" : "Send us an Email"]
											})
										})
									]
								})
							})
						})
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "© 2026 Oromia Academy" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
					href: "mailto:oromiaacademy@gmail.com",
					className: "hover:text-foreground transition-colors",
					children: "oromiaacademy@gmail.com"
				})]
			})
		]
	});
}
//#endregion
export { AboutPage as component };
