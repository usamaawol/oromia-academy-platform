import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { E as adminSaveCourse, Y as useServerFn, m as adminListCourses, r as adminBulkSaveQuestions, t as adminAiExtractQuestions } from "./_ssr/server-fns-BeozUQqq.mjs";
import { D as Pen, L as LoaderCircle, S as Save, T as Plus, Y as Eye, ct as CircleCheck, f as Trash2, gt as Bot, h as Sparkles, lt as CircleAlert, mt as Check, n as X, ot as CircleX, pt as ChevronDown, rt as ClipboardPaste, ut as ChevronUp, w as RefreshCw } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
import { t as Separator } from "./_ssr/separator-xtkvXYpu.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.ai-import-CTgi8EG2.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — AI Question Import
* Full workflow: paste text → AI extract → validate → review/edit → approve → save to Question Bank
*/
var EXAMPLE_TEXT = `Question1:
AI jechuun maal jechuudha?
A. Sammuu Nam-tolchee
B. Interneetii Ofumaan Hojjetu
C. Odeeffannoo Sadarkaa Ol'aanaa
D. Appilikeeshinii Interneetii

Correct Answer: A
Explanation: AI jechuun Sammuu Nam-tolchee jechuudha. Inni hojiiwwan yeroo baay'ee sammuu namaatiin hojjetaman kompiitaraan akka raawwataman gargaaru.

Question2:
Telegram Bot jechuun maalidha?
A. Sagantaa hojiiwwan ofumaan raawwatu
B. Nama Telegram fayyadamu
C. Simkaartii haaraa
D. Computer game

Correct Answer: A
Explanation: Telegram Bot sagantaa hojiiwwan murtaa'an ofumaan raawwatuudha.

Question3:
Automation jechuun maal jechuudha?
A. Hojiiwwan tokko tokko ofumaan akka raawwataman gochuu
B. Hojii hunda harkaan hojjechuu
C. Computer cufuu
D. Internet balleessuu

Correct Answer: A
Explanation: Automation jechuun hojiiwwan tokko tokko nama irraa hirkachuu xiqqeessuun ofumaan akka raawwataman gochuudha.`;
var STEPS = [
	"input",
	"extracting",
	"review",
	"saving",
	"done"
];
function AiImportPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [step, setStep] = (0, import_react.useState)("input");
	const [rawText, setRawText] = (0, import_react.useState)("");
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [coursesLoading, setCoursesLoading] = (0, import_react.useState)(true);
	const [courseInput, setCourseInput] = (0, import_react.useState)("");
	const [courseId, setCourseId] = (0, import_react.useState)("");
	const [topic, setTopic] = (0, import_react.useState)("");
	const [difficulty, setDifficulty] = (0, import_react.useState)("medium");
	const [points, setPoints] = (0, import_react.useState)(1);
	const [showSuggestions, setShowSuggestions] = (0, import_react.useState)(false);
	const [progress, setProgress] = (0, import_react.useState)([]);
	const [extractError, setExtractError] = (0, import_react.useState)("");
	const [drafts, setDrafts] = (0, import_react.useState)([]);
	const textareaRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		call(adminListCourses, void 0).then((c) => setCourses(c)).catch(() => {}).finally(() => setCoursesLoading(false));
	}, []);
	const suggestions = courseInput.trim() ? courses.filter((c) => c.titleOm.toLowerCase().includes(courseInput.toLowerCase()) || c.titleEn.toLowerCase().includes(courseInput.toLowerCase())) : courses.slice(0, 6);
	const isNewCourse = courseInput.trim().length > 0 && !courses.some((c) => c.titleOm.toLowerCase() === courseInput.trim().toLowerCase() || c.titleEn.toLowerCase() === courseInput.trim().toLowerCase());
	function selectCourse(c) {
		setCourseInput(c.titleOm || c.titleEn);
		setCourseId(c.id);
		setShowSuggestions(false);
	}
	async function resolveOrCreateCourse() {
		const name = courseInput.trim() || "Uncategorized";
		const match = courses.find((c) => c.titleOm.toLowerCase() === name.toLowerCase() || c.titleEn.toLowerCase() === name.toLowerCase());
		if (match) return match.id;
		const newId = crypto.randomUUID();
		await call(adminSaveCourse, { course: {
			id: newId,
			titleOm: name,
			titleEn: name,
			descOm: "",
			descEn: "",
			icon: "sparkles",
			level: "medium",
			status: "active",
			order: courses.length
		} });
		const fresh = await call(adminListCourses, void 0);
		setCourses(fresh);
		return newId;
	}
	async function handleExtract() {
		if (!rawText.trim()) {
			toast.error("Gaaffilee paste godhi");
			return;
		}
		setExtractError("");
		setProgress([]);
		setStep("extracting");
		const steps = [
			"✓ Barreeffama dubbisaa jira...",
			"✓ Gaaffilee adda baasaa jira...",
			"✓ AI'n xiinxalaa jira...",
			"✓ Deebii mirkaneessaa jira..."
		];
		for (let i = 0; i < steps.length - 1; i++) {
			await delay(400);
			setProgress((p) => [...p, steps[i]]);
		}
		try {
			const data = await call(adminAiExtractQuestions, { text: rawText });
			setProgress((p) => [
				...p,
				steps[steps.length - 1],
				`✓ Gaaffii ${data.totalDetected} argame`
			]);
			let resolvedCourseId = courseId;
			try {
				resolvedCourseId = await resolveOrCreateCourse();
				setCourseId(resolvedCourseId);
			} catch {
				resolvedCourseId = courseId || crypto.randomUUID();
			}
			const draftList = data.questions.map((q) => ({
				...q,
				_id: crypto.randomUUID(),
				_approved: q.valid,
				_expanded: !q.valid,
				courseId: resolvedCourseId,
				topic,
				difficulty,
				points
			}));
			setDrafts(draftList);
			await delay(300);
			setStep("review");
		} catch (err) {
			setExtractError(serverErrorMessage(err, t));
			setStep("input");
		}
	}
	function updateDraft(id, patch) {
		setDrafts((prev) => prev.map((d) => d._id === id ? {
			...d,
			...patch
		} : d));
	}
	function deleteDraft(id) {
		setDrafts((prev) => prev.filter((d) => d._id !== id));
	}
	function toggleApprove(id) {
		setDrafts((prev) => prev.map((d) => {
			if (d._id !== id) return d;
			return {
				...d,
				_approved: !d._approved
			};
		}));
	}
	function approveAll() {
		setDrafts((prev) => prev.map((d) => ({
			...d,
			_approved: true
		})));
	}
	function approveValid() {
		setDrafts((prev) => prev.map((d) => ({
			...d,
			_approved: d.valid
		})));
	}
	async function handleSave() {
		const approved = drafts.filter((d) => d._approved);
		if (approved.length === 0) {
			toast.error("Gaaffilee mirkaneessuu filadhu");
			return;
		}
		setStep("saving");
		try {
			const questions = approved.map((d) => {
				const opts = d.options.map((o) => ({
					id: crypto.randomUUID(),
					textOm: o.textOm,
					textEn: o.textEn || void 0
				}));
				const correctIdx = [
					"A",
					"B",
					"C",
					"D"
				].indexOf(d.correctAnswer ?? "");
				const correctOptionId = correctIdx >= 0 ? opts[correctIdx]?.id : void 0;
				return {
					id: crypto.randomUUID(),
					courseId: d.courseId,
					topic: d.topic || "",
					type: d.type,
					language: d.questionEn ? "both" : "om",
					difficulty: d.difficulty,
					textOm: d.questionOm,
					textEn: d.questionEn || void 0,
					options: opts,
					correctOptionId: d.type === "mcq" ? correctOptionId : void 0,
					correctBool: d.type === "truefalse" ? d.correctAnswer?.toLowerCase() === "true" : void 0,
					expectedAnswer: d.type === "short" || d.type === "essay" ? d.explanationOm : void 0,
					rubric: d.explanationOm || "",
					explanationOm: d.explanationOm,
					explanationEn: d.explanationEn || void 0,
					points: d.points,
					tags: ["ai-import"],
					approved: true
				};
			});
			const saved = (await call(adminBulkSaveQuestions, { questions })).saved;
			toast.success(`${saved} gaaffii kuusaa gaaffilee galche`);
			setStep("done");
		} catch (err) {
			toast.error(serverErrorMessage(err, t));
			setStep("review");
		}
	}
	const approvedCount = drafts.filter((d) => d._approved).length;
	const invalidCount = drafts.filter((d) => !d.valid).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-4xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-start justify-between gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
					className: "text-2xl font-bold flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-6 text-primary" }), "AI'n Gaaffilee Galchi"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground mt-1",
					children: "Gaaffilee paste godhi → AI xiinxala → mirkaneessi → Kuusaa Gaaffilee galchi"
				})] }), step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2 shrink-0",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => setStep("input"),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: "size-3.5 mr-1.5" }), " Haaraa"]
					})
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mb-8",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex items-center gap-0",
					children: [
						{
							id: "input",
							label: "1. Galchi"
						},
						{
							id: "extracting",
							label: "2. Xiinxali"
						},
						{
							id: "review",
							label: "3. Ilaali"
						},
						{
							id: "saving",
							label: "4. Olkaa'i"
						},
						{
							id: "done",
							label: "5. Xumurame"
						}
					].map((s, i, arr) => {
						const stepIdx = STEPS.indexOf(step);
						const thisIdx = STEPS.indexOf(s.id);
						const done = stepIdx > thisIdx;
						const active = stepIdx === thisIdx;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center min-w-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", active ? "bg-primary text-primary-foreground" : done ? "bg-primary/20 text-primary" : "text-muted-foreground"),
								children: [
									done && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3 shrink-0" }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "hidden sm:inline",
										children: s.label
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "sm:hidden",
										children: i + 1
									})
								]
							}), i < arr.length - 1 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: cn("h-px flex-1 min-w-4 mx-1", done || active ? "bg-primary/40" : "bg-border") })]
						}, s.id);
					})
				})
			}),
			step === "input" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-6",
				children: [
					extractError && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-5 text-destructive shrink-0 mt-0.5" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium text-sm text-destructive",
								children: "AI xiinxalli kufe"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm text-muted-foreground mt-0.5",
								children: extractError
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground mt-1",
								children: "Barreeffamni kee olitti argama. Irra deebi'ii yaalii."
							})
						] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
								className: "text-sm flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 text-primary" }), "Qindaa'ina Galchii"]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "relative space-y-1.5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Koorsii ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "text-destructive",
											children: "*"
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "relative",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "Maqaa koorsii barreessi...",
												value: courseInput,
												autoComplete: "off",
												onChange: (e) => {
													setCourseInput(e.target.value);
													setCourseId("");
													setShowSuggestions(true);
												},
												onFocus: () => setShowSuggestions(true),
												onBlur: () => setTimeout(() => setShowSuggestions(false), 150)
											}), courseInput.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: cn("absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none", isNewCourse ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"),
												children: isNewCourse ? "haaraa ✦" : "✓ jira"
											})]
										}),
										showSuggestions && (suggestions.length > 0 || isNewCourse) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden",
											children: [suggestions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												onMouseDown: () => selectCourse(c),
												className: "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "flex-1 font-medium",
													children: c.titleOm || c.titleEn
												})
											}, c.id)), isNewCourse && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "px-3 py-2 border-t bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
													"\"",
													courseInput.trim(),
													"\" — koorsii haaraa uumama"
												] })]
											})]
										})
									]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Mata duree" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: "Mata duree (fakk. AI Fundamentals)",
										value: topic,
										onChange: (e) => setTopic(e.target.value)
									})]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "grid grid-cols-2 gap-4",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Ulfaatina" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
										value: difficulty,
										onValueChange: (v) => setDifficulty(v),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "easy",
												children: "Salphaa"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "medium",
												children: "Giddugaleessa"
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
												value: "hard",
												children: "Cimaa"
											})
										] })]
									})]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-1.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Qabxii gaaffii tokkoof" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										type: "number",
										min: 1,
										value: points,
										onChange: (e) => setPoints(Number(e.target.value))
									})]
								})]
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "border-border/60",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardHeader, {
							className: "pb-3",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardTitle, {
									className: "text-sm flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, { className: "size-4 text-primary" }), "Gaaffilee Paste Godhi"]
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "ghost",
									size: "sm",
									className: "text-xs gap-1.5 text-muted-foreground",
									onClick: () => setRawText(EXAMPLE_TEXT),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " Fakkeenyaa ilaali"]
								})]
							})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
							ref: textareaRef,
							placeholder: `Gaaffilee kee asitti paste godhi...\n\nFakkeenyaaf:\nQuestion1:\nAI jechuun maal jechuudha?\nA. Sammuu Nam-tolchee\nB. Interneetii\nC. Odeeffannoo\nD. Appilikeeshinii\n\nCorrect Answer: A\nExplanation: AI jechuun Sammuu Nam-tolchee jechuudha.`,
							value: rawText,
							onChange: (e) => setRawText(e.target.value),
							rows: 14,
							className: "font-mono text-sm resize-y"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between mt-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: rawText.trim() ? `~${rawText.split(/Question\s*\d+/i).length - 1 || 1} gaaffii argame` : "Gaaffilee paste godhi"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => void handleExtract(),
								disabled: !rawText.trim(),
								className: "gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-4" }), "AI'n Gaaffilee Baasi"]
							})]
						})] })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
						className: "border-border/40 bg-muted/30",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
							className: "p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs font-semibold text-muted-foreground mb-2",
								children: "📋 FORMAT FAYYADAMAA:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
								className: "text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed",
								children: `Question1:
Gaaffii kee asitti barreessi
A. Filannoo duraa
B. Filannoo lammaffaa
C. Filannoo sadaffaa
D. Filannoo afraffaa

Correct Answer: A
Explanation: Ibsa Afaan Oromootiin...

Question2:
...`
							})]
						})
					})
				]
			}),
			step === "extracting" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-12 text-center space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "relative mx-auto size-20",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "absolute inset-0 rounded-full bg-primary/10 animate-ping" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "relative grid size-20 place-items-center rounded-full bg-primary/15",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "size-10 text-primary" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold",
							children: "AI Xiinxalaa Jira..."
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Maaloo eegi"
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "max-w-sm mx-auto space-y-2 text-left",
							children: [progress.map((p, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 shrink-0" }), p]
							}, i)), progress.length < 4 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2 text-sm text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "size-4 shrink-0 animate-spin" }), "Xiinxalaa jira..."]
							})]
						})
					]
				})
			}),
			step === "review" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-4 flex flex-wrap items-center gap-4",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg",
									children: drafts.length
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Gaaffii argame"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-xl bg-green-100 dark:bg-green-900/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-5 text-green-600" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg",
									children: approvedCount
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Mirkana'e"
								})] })]
							}),
							invalidCount > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/20",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-5 text-amber-600" })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "font-bold text-lg",
									children: invalidCount
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-muted-foreground",
									children: "Hatattamaan guuti"
								})] })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-auto flex gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: approveValid,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 mr-1.5" }), " Sirrii Hunda Mirkaneessi"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										onClick: approveAll,
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 mr-1.5" }), " Hunda Mirkaneessi"]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										onClick: () => void handleSave(),
										disabled: approvedCount === 0,
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-3.5 mr-1.5" }),
											approvedCount,
											" Olkaa'i"
										]
									})
								]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-3",
						children: drafts.map((d, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DraftCard, {
							draft: d,
							index: idx,
							courses,
							onUpdate: (patch) => updateDraft(d._id, patch),
							onDelete: () => deleteDraft(d._id),
							onToggleApprove: () => toggleApprove(d._id)
						}, d._id))
					}),
					drafts.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border border-dashed p-12 text-center text-muted-foreground",
						children: "Gaaffii hin jiru. Gaaffilee hunda balleessita moo?"
					}),
					drafts.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "sticky bottom-4 flex justify-end",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "lg",
							className: "gap-2 shadow-glow",
							onClick: () => void handleSave(),
							disabled: approvedCount === 0,
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Save, { className: "size-4" }),
								approvedCount,
								" Gaaffii Kuusaa Galchi"
							]
						})
					})
				]
			}),
			step === "saving" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-border/60",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-12 text-center space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LoaderCircle, { className: "mx-auto size-14 text-primary animate-spin" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-lg font-bold",
							children: "Olkaa'aa jira..."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm text-muted-foreground",
							children: [approvedCount, " gaaffii kuusaa gaaffilee galchaa jira"]
						})
					]
				})
			}),
			step === "done" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "py-12 text-center space-y-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-20 mx-auto place-items-center rounded-full bg-green-100 dark:bg-green-900/30",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-12 text-green-600" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "text-2xl font-bold",
							children: "Galchi Milkaa'e! 🎉"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-muted-foreground mt-2",
							children: [approvedCount, " gaaffii Kuusaa Gaaffilee seene."]
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-center gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								onClick: () => {
									setStep("input");
									setRawText("");
									setDrafts([]);
									setProgress([]);
								},
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1.5" }), " Ammas Galchi"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: "/admin/questions",
									children: "Kuusaa Gaaffilee Ilaali"
								})
							})]
						})
					]
				})
			})
		]
	});
}
function DraftCard({ draft, index, courses, onUpdate, onDelete, onToggleApprove }) {
	const [editing, setEditing] = (0, import_react.useState)(false);
	const hasIssues = draft.warnings.length > 0;
	const isApproved = draft._approved;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: cn("rounded-xl border transition-all", isApproved ? "border-green-300 dark:border-green-700" : hasIssues ? "border-amber-300 dark:border-amber-700" : "border-border/60"),
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: cn("flex items-center gap-3 px-4 py-3 rounded-t-xl", isApproved ? "bg-green-50 dark:bg-green-950/20" : hasIssues ? "bg-amber-50 dark:bg-amber-950/20" : "bg-muted/30"),
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onToggleApprove,
					className: cn("grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors", isApproved ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/40 hover:border-primary"),
					title: isApproved ? "Mirkanaa'ina kaasi" : "Mirkaneessi",
					children: isApproved && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-4" })
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 flex-wrap",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold text-muted-foreground",
							children: ["Q", index + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-medium text-sm truncate",
							children: draft.questionOm || "(Gaaffii hin jiru)"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex gap-1.5 mt-1 flex-wrap",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px] py-0 capitalize",
								children: draft.type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-[10px] py-0",
								children: draft.correctAnswer ? `✓ ${draft.correctAnswer}` : "⚠ Deebii hin jiru"
							}),
							hasIssues && !isApproved && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "secondary",
								className: "text-[10px] py-0 text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30",
								children: [draft.warnings.length, " dogoggora"]
							})
						]
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-7",
							onClick: () => setEditing((e) => !e),
							title: "Gulaali",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pen, { className: "size-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-7",
							onClick: () => onUpdate({ _expanded: !draft._expanded }),
							title: "Mul'isi/Dhoksi",
							children: draft._expanded ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronUp, { className: "size-3.5" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-3.5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "size-7 text-destructive hover:text-destructive",
							onClick: onDelete,
							title: "Balleessi",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
						})
					]
				})
			]
		}), (draft._expanded || editing) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "px-4 pb-4 pt-3 space-y-3",
			children: [hasIssues && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1",
				children: draft.warnings.map((w, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-3.5 shrink-0" }), w]
				}, i))
			}), editing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditForm, {
				draft,
				courses,
				onUpdate,
				onClose: () => setEditing(false)
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewContent, { draft })]
		})]
	});
}
function PreviewContent({ draft }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium",
				children: draft.questionOm
			}), draft.questionEn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted-foreground mt-0.5",
				children: draft.questionEn
			})] }),
			draft.type === "mcq" && draft.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-1.5",
				children: draft.options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-2 rounded-lg border px-3 py-2 text-sm", draft.correctAnswer === opt.key ? "border-green-400 bg-green-50 dark:bg-green-950/30 font-medium" : "border-border/60"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "font-bold text-xs w-4",
							children: [opt.key, "."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "flex-1",
							children: opt.textOm
						}),
						draft.correctAnswer === opt.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 text-green-600 shrink-0" })
					]
				}, opt.key))
			}),
			draft.type === "truefalse" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-2",
				children: ["true", "false"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: cn("rounded-lg px-4 py-2 text-sm font-medium capitalize", draft.correctAnswer?.toLowerCase() === v ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted"),
					children: [v === "true" ? "✅ Dhugaa" : "❌ Soba", draft.correctAnswer?.toLowerCase() === v && " ✓"]
				}, v))
			}),
			draft.explanationOm && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-lg bg-muted/40 p-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs font-semibold text-muted-foreground mb-1",
					children: "Ibsa:"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm",
					children: draft.explanationOm
				})]
			})
		]
	});
}
function EditForm({ draft, courses, onUpdate, onClose }) {
	const [local, setLocal] = (0, import_react.useState)({ ...draft });
	const opts = local.options;
	function setOpt(key, field, value) {
		const updated = opts.map((o) => o.key === key ? {
			...o,
			[field]: value
		} : o);
		setLocal((p) => ({
			...p,
			options: updated
		}));
	}
	function save() {
		const warnings = [];
		if (!local.questionOm.trim()) warnings.push("Question text is empty");
		if (local.type === "mcq" && !local.correctAnswer) warnings.push("Correct answer is missing");
		if (local.type === "mcq" && opts.some((o) => !o.textOm.trim())) warnings.push("Some options are empty");
		const valid = warnings.length === 0;
		onUpdate({
			...local,
			warnings,
			valid
		});
		onClose();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 border-t pt-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Koorsii"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
						value: local.courseId,
						onValueChange: (v) => setLocal((p) => ({
							...p,
							courseId: v
						})),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
							className: "h-8 text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent, { children: courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: c.id,
							children: c.titleOm || c.titleEn
						}, c.id)) })]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						className: "text-xs",
						children: "Mata duree"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						className: "h-8 text-xs",
						value: local.topic,
						onChange: (e) => setLocal((p) => ({
							...p,
							topic: e.target.value
						}))
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Gaaffii (Afaan Oromoo) *"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					className: "text-sm",
					value: local.questionOm,
					onChange: (e) => setLocal((p) => ({
						...p,
						questionOm: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Gaaffii (English)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					className: "text-sm",
					value: local.questionEn,
					onChange: (e) => setLocal((p) => ({
						...p,
						questionEn: e.target.value
					}))
				})]
			}),
			local.type === "mcq" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Filannoolee (deebii sirrii filadhu)"
				}), opts.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: cn("flex items-center gap-2 rounded-lg border px-3 py-2", local.correctAnswer === opt.key ? "border-green-400 bg-green-50 dark:bg-green-950/30" : "border-border/60"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => setLocal((p) => ({
								...p,
								correctAnswer: opt.key
							})),
							className: cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors", local.correctAnswer === opt.key ? "border-green-500 bg-green-500" : "border-muted-foreground/40 hover:border-primary"),
							children: local.correctAnswer === opt.key && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-white" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs font-bold w-4",
							children: [opt.key, "."]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "flex-1 h-7 text-sm border-0 bg-transparent p-0 shadow-none focus-visible:ring-0",
							value: opt.textOm,
							onChange: (e) => setOpt(opt.key, "textOm", e.target.value),
							placeholder: `Filannoo ${opt.key}`
						})
					]
				}, opt.key))]
			}),
			local.type === "truefalse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Deebii sirrii"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-2",
					children: [{
						v: "true",
						l: "✅ Dhugaa"
					}, {
						v: "false",
						l: "❌ Soba"
					}].map(({ v, l }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setLocal((p) => ({
							...p,
							correctAnswer: v
						})),
						className: cn("flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all", local.correctAnswer === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"),
						children: l
					}, v))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					className: "text-xs",
					children: "Ibsa (Afaan Oromoo)"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					rows: 2,
					className: "text-sm",
					value: local.explanationOm,
					onChange: (e) => setLocal((p) => ({
						...p,
						explanationOm: e.target.value
					}))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "outline",
					size: "sm",
					onClick: onClose,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-3.5 mr-1" }), " Dhiisi"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: save,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5 mr-1" }), " Olkaa'i"]
				})]
			})
		]
	});
}
function delay(ms) {
	return new Promise((r) => setTimeout(r, ms));
}
//#endregion
export { AiImportPage as component };
