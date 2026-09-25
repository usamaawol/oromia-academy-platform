import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { v as useSearch } from "./_libs/@tanstack/react-router+[...].mjs";
import { E as adminSaveCourse, O as adminSaveQuestion, Y as useServerFn, _ as adminListQuestions, m as adminListCourses, o as adminDeleteQuestion } from "./_ssr/server-fns-BeozUQqq.mjs";
import { E as Pencil, T as Plus, ct as CircleCheck, f as Trash2, h as Sparkles, ot as CircleX, rt as ClipboardPaste } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.questions-CbHlwoXO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Question bank
*/
var BLANK_OPT = () => ({
	id: crypto.randomUUID(),
	textOm: "",
	textEn: ""
});
var BLANK = {
	id: "",
	courseId: "",
	topic: "",
	type: "mcq",
	language: "om",
	difficulty: "medium",
	textOm: "",
	textEn: "",
	options: [
		BLANK_OPT(),
		BLANK_OPT(),
		BLANK_OPT(),
		BLANK_OPT()
	],
	expectedAnswer: "",
	rubric: "",
	points: 1,
	tags: [],
	approved: false
};
function QuestionsPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const search = useSearch({ from: "/_admin/admin/questions" });
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [loadError, setLoadError] = (0, import_react.useState)(null);
	const [courseFilter, setCourseFilter] = (0, import_react.useState)("all");
	const [typeFilter, setTypeFilter] = (0, import_react.useState)("all");
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [dialogMode, setDialogMode] = (0, import_react.useState)("paste");
	const [editing, setEditing] = (0, import_react.useState)({ ...BLANK });
	const [courseInput, setCourseInput] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const refresh = async () => {
		setLoading(true);
		setLoadError(null);
		try {
			const [qs, cs] = await Promise.all([call(adminListQuestions, {}), call(adminListCourses, void 0)]);
			setQuestions(qs);
			setCourses(cs);
		} catch (e) {
			const msg = serverErrorMessage(e, t);
			setLoadError(msg);
			const errStr = String(e?.message ?? "");
			if (!errStr.includes("auth/required") && !errStr.includes("session")) toast.error(msg);
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	(0, import_react.useEffect)(() => {
		if (search["new"] === "1" && !loading) openNew();
	}, [loading]);
	const filtered = questions.filter((q) => {
		if (courseFilter !== "all" && q.courseId !== courseFilter) return false;
		if (typeFilter !== "all" && q.type !== typeFilter) return false;
		return true;
	});
	function openNew() {
		setEditing({
			...BLANK,
			id: crypto.randomUUID(),
			options: [
				BLANK_OPT(),
				BLANK_OPT(),
				BLANK_OPT(),
				BLANK_OPT()
			]
		});
		setCourseInput("");
		setDialogMode("paste");
		setDialogOpen(true);
	}
	function openEdit(q) {
		setEditing({
			...q,
			options: q.options.length > 0 ? q.options : [BLANK_OPT(), BLANK_OPT()]
		});
		const existing = courses.find((c) => c.id === q.courseId);
		setCourseInput(existing?.titleOm || existing?.titleEn || "");
		setDialogMode("form");
		setDialogOpen(true);
	}
	async function save() {
		const courseName = courseInput.trim();
		if (!courseName) {
			toast.error("Maqaa koorsii galchi");
			return;
		}
		if (!editing.textOm.trim()) {
			toast.error("Gaaffii (Afaan Oromoo) barreessi");
			return;
		}
		if (editing.type === "mcq" && !editing.correctOptionId) {
			toast.error("Deebii sirrii filadhu");
			return;
		}
		if (editing.type === "mcq" && editing.options.some((o) => !o.textOm.trim())) {
			toast.error("Filannoolee hunda guuti");
			return;
		}
		setSaving(true);
		try {
			let courseId = editing.courseId;
			const match = courses.find((c) => c.titleOm.toLowerCase() === courseName.toLowerCase() || c.titleEn.toLowerCase() === courseName.toLowerCase());
			if (match) courseId = match.id;
			else {
				const newId = crypto.randomUUID();
				await call(adminSaveCourse, { course: {
					id: newId,
					titleOm: courseName,
					titleEn: courseName,
					descOm: "",
					descEn: "",
					icon: "sparkles",
					level: "medium",
					status: "active",
					order: courses.length
				} });
				courseId = newId;
				const freshCourses = await call(adminListCourses, void 0);
				setCourses(freshCourses);
			}
			await call(adminSaveQuestion, { question: {
				...editing,
				courseId,
				approved: true
			} });
			toast.success(t("common.success"));
			setDialogOpen(false);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function saveAllParsed(blocks, courseIdOrNew) {
		setSaving(true);
		let saved = 0;
		try {
			let courseId = courseIdOrNew;
			if (courseIdOrNew.startsWith("__new__:")) {
				const courseName = courseIdOrNew.slice(8);
				const newId = crypto.randomUUID();
				await call(adminSaveCourse, { course: {
					id: newId,
					titleOm: courseName,
					titleEn: courseName,
					descOm: "",
					descEn: "",
					icon: "sparkles",
					level: "medium",
					status: "active",
					order: courses.length
				} });
				courseId = newId;
				const freshCourses = await call(adminListCourses, void 0);
				setCourses(freshCourses);
			}
			for (const parsed of blocks) {
				const newOpts = parsed.options.map((text) => ({
					id: crypto.randomUUID(),
					textOm: text,
					textEn: ""
				}));
				const letterIdx = [
					"A",
					"B",
					"C",
					"D",
					"E",
					"F"
				].indexOf(parsed.correctLetter);
				const correctOptionId = letterIdx >= 0 && newOpts[letterIdx] ? newOpts[letterIdx].id : void 0;
				const q = {
					id: crypto.randomUUID(),
					courseId,
					topic: "",
					type: parsed.type,
					language: "om",
					difficulty: "medium",
					textOm: parsed.questionText,
					textEn: "",
					options: newOpts.length >= 2 ? newOpts : [
						BLANK_OPT(),
						BLANK_OPT(),
						BLANK_OPT(),
						BLANK_OPT()
					],
					...correctOptionId ? { correctOptionId } : {},
					...parsed.type === "truefalse" ? { correctBool: parsed.correctLetter === "TRUE" } : {},
					...parsed.explanation ? { rubric: parsed.explanation } : {},
					expectedAnswer: "",
					points: 1,
					tags: ["paste-import"],
					approved: true
				};
				await call(adminSaveQuestion, { question: q });
				saved++;
			}
			toast.success(`${saved} gaaffii milkaa'inaan galame ✓`);
			setDialogOpen(false);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function remove(id) {
		if (!confirm("Delete this question?")) return;
		try {
			await call(adminDeleteQuestion, { id });
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function toggleApprove(q) {
		try {
			await call(adminSaveQuestion, { question: {
				...q,
				approved: !q.approved
			} });
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	const cName = (id) => {
		const c = courses.find((x) => x.id === id);
		return c?.titleOm || c?.titleEn || id;
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: t("admin.questions")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					variant: "outline",
					size: "sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "/admin/ai-import",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "size-4 mr-1.5" }), "AI'n Galchi"]
					})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: openNew,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }),
						" ",
						t("admin.newQuestion")
					]
				})]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: courseFilter,
					onValueChange: setCourseFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-44",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: t("common.course") })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
						value: "all",
						children: [
							t("common.all"),
							" ",
							t("common.courses")
						]
					}), courses.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: c.id,
						children: c.titleOm || c.titleEn
					}, c.id))] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
					value: typeFilter,
					onValueChange: setTypeFilter,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
						className: "w-40",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "Gosa" })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "all",
							children: t("common.all")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "mcq",
							children: t("qtype.mcq")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "truefalse",
							children: t("qtype.truefalse")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "short",
							children: t("qtype.short")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
							value: "essay",
							children: t("qtype.essay")
						})
					] })]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "self-center text-sm text-muted-foreground",
					children: [filtered.length, " gaaffii"]
				})
			]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }, i))
		}) : loadError ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-semibold text-destructive mb-2",
					children: t("common.error")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted-foreground whitespace-pre-wrap break-words mb-4 max-w-2xl mx-auto",
					children: loadError
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void refresh(),
					size: "sm",
					children: t("common.retry") ?? "Retry"
				})
			]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "divide-y rounded-xl border",
			children: [filtered.map((q) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-start gap-3 p-4 hover:bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium line-clamp-2",
						children: q.textOm
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-1.5 flex flex-wrap gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs",
								children: cName(q.courseId)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "secondary",
								className: "text-xs capitalize",
								children: q.type
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: "outline",
								className: "text-xs capitalize",
								children: q.difficulty
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								variant: q.approved ? "default" : "secondary",
								className: "text-xs",
								children: q.approved ? t("admin.approved") : t("admin.pendingReview")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs text-muted-foreground",
								children: [q.points, " pt"]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-1 shrink-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => void toggleApprove(q),
							title: q.approved ? "Unapprove" : "Approve",
							children: q.approved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-green-500" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-4 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => openEdit(q),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							onClick: () => void remove(q.id),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
						})
					]
				})]
			}, q.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-muted-foreground",
				children: t("common.notFound")
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: dialogOpen,
			onOpenChange: setDialogOpen,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[92vh] overflow-y-auto sm:max-w-2xl",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
					className: "flex items-center justify-between pr-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: editing.id && questions.some((q) => q.id === editing.id) ? "Gaaffii gulaali" : t("admin.newQuestion") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-1 rounded-lg border bg-muted p-0.5 text-xs font-medium",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setDialogMode("paste"),
							className: cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors", dialogMode === "paste" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, { className: "size-3" }), " Paste"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							type: "button",
							onClick: () => setDialogMode("form"),
							className: cn("flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors", dialogMode === "form" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" }), " Manual"]
						})]
					})]
				}) }), dialogMode === "paste" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PasteMode, {
					courses,
					saving,
					onParsed: (parsed) => {
						const newOpts = parsed.options.map((text) => ({
							id: crypto.randomUUID(),
							textOm: text,
							textEn: ""
						}));
						const letterIdx = [
							"A",
							"B",
							"C",
							"D",
							"E",
							"F"
						].indexOf(parsed.correctLetter);
						const correctOptionId = letterIdx >= 0 && newOpts[letterIdx] ? newOpts[letterIdx].id : void 0;
						const patch = {
							textOm: parsed.questionText,
							type: parsed.type,
							options: newOpts.length >= 2 ? newOpts : [
								BLANK_OPT(),
								BLANK_OPT(),
								BLANK_OPT(),
								BLANK_OPT()
							]
						};
						if (parsed.explanation) patch.rubric = parsed.explanation;
						if (correctOptionId) patch.correctOptionId = correctOptionId;
						if (parsed.type === "truefalse") patch.correctBool = parsed.correctLetter === "TRUE";
						setEditing((prev) => ({
							...prev,
							...patch
						}));
						setDialogMode("form");
					},
					onSaveAll: (blocks, courseId) => void saveAllParsed(blocks, courseId),
					onManual: () => setDialogMode("form")
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionForm, {
					q: editing,
					courses,
					courseInput,
					onCourseChange: setCourseInput,
					onChange: setEditing,
					onSave: () => void save(),
					onCancel: () => setDialogOpen(false),
					saving,
					t
				})]
			})
		})
	] });
}
/** Split raw text into individual question blocks */
function splitIntoBlocks(raw) {
	const blocks = raw.split(/(?=^\s*(?:gaaffii\s*\d+\s*[:.)\s]|question\s*\d+\s*[:.)\s]|q\s*\d+\s*[:.)\s]|\d+[.):\s]\s+\S))/im).map((b) => b.trim()).filter((b) => b.length > 5);
	return blocks.length > 0 ? blocks : [raw.trim()];
}
/** Parse a single question block */
function parseBlock(block) {
	const allLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
	if (allLines.length < 2) return null;
	const isOptionLine = (l) => /^[\(\[]?[A-Da-d][\.\)\]\s]\s*.{1,}/i.test(l);
	const isAnswerLine = (l) => /^(?:correct\s*answer|answer|ans|key|deebii\s*sirrii|deebii|correct)[:\s\-–]/i.test(l) || /^✅/.test(l);
	const isExplanationLine = (l) => /^(?:explanation|ibsa\s*gabaabaa?|ibsa|note|why|reason)[:\s\-–]/i.test(l);
	let questionText = "";
	let bodyStart = 0;
	for (let i = 0; i < allLines.length; i++) {
		const stripped = allLines[i].replace(/^(?:gaaffii\s*\d+\s*[:.\s]?|question\s*\d+\s*[:.\s]?|q\s*\d+\s*[:.\s]?|\d+\s*[.):]\s*)/i, "").trim();
		if (isOptionLine(stripped) || isAnswerLine(stripped) || isExplanationLine(stripped)) continue;
		if (stripped.length < 5) continue;
		questionText = stripped;
		bodyStart = i + 1;
		break;
	}
	if (!questionText) return null;
	const remaining = allLines.slice(bodyStart);
	const options = [];
	const optionLetters = [];
	let correctLetter = "";
	let explanation = "";
	let type = "short";
	let inOptions = true;
	for (let i = 0; i < remaining.length; i++) {
		const line = remaining[i];
		const optMatch = line.match(/^[\(\[]?([A-Da-d])[\.\)\]\s\-]\s*(.+)/i);
		if (optMatch && optMatch[1] && optMatch[2] && inOptions) {
			const letter = optMatch[1].toUpperCase();
			if (letter === String.fromCharCode(65 + options.length) || options.length === 0) {
				options.push(optMatch[2].trim());
				optionLetters.push(letter);
				type = "mcq";
			}
			continue;
		}
		const ansMatch = line.match(/^(?:correct\s*answer|answer|ans|key|deebii\s*sirrii|deebii|correct)[:\s\-–—=]*✅?\s*([A-Da-dTtFf][a-z]*)/i);
		const emojiAns = line.match(/^✅\s*([A-Da-d])/i);
		const ansSource = ansMatch?.[1] ?? emojiAns?.[1];
		if (ansSource) {
			inOptions = false;
			const up = ansSource.toUpperCase();
			if (up === "TRUE" || up === "T") {
				correctLetter = "TRUE";
				type = "truefalse";
			} else if (up === "FALSE" || up === "F") {
				correctLetter = "FALSE";
				type = "truefalse";
			} else correctLetter = up.charAt(0);
			continue;
		}
		if (isExplanationLine(line)) {
			inOptions = false;
			explanation = line.match(/^(?:explanation|ibsa\s*gabaabaa?|ibsa|note|why|reason)[:\s\-–]*(.+)/i)?.[1]?.trim() ?? "";
			let j = i + 1;
			while (j < remaining.length) {
				const next = remaining[j];
				if (isOptionLine(next) || isAnswerLine(next) || isExplanationLine(next)) break;
				explanation += " " + next;
				j++;
			}
			i = j - 1;
			continue;
		}
		if (options.length > 0) inOptions = false;
	}
	const finalOptions = options.slice(0, 6);
	if (finalOptions.length === 0 && type === "short") {
		if (/\b(dhugaa|soba|true|false)\b/i.test(questionText)) type = "truefalse";
	}
	return {
		questionText,
		options: finalOptions,
		correctLetter,
		explanation,
		type
	};
}
/** Parse all questions from a multi-question paste */
function parseAllQuestions(raw) {
	return splitIntoBlocks(raw).map((b) => parseBlock(b)).filter((b) => b !== null && b.questionText.length > 3);
}
function PasteMode({ courses, saving, onParsed, onSaveAll, onManual }) {
	const [raw, setRaw] = (0, import_react.useState)("");
	const [parsed, setParsed] = (0, import_react.useState)([]);
	const [error, setError] = (0, import_react.useState)("");
	const [bulkCourseInput, setBulkCourseInput] = (0, import_react.useState)("");
	const [showCourseSug, setShowCourseSug] = (0, import_react.useState)(false);
	const [selectedCourseId, setSelectedCourseId] = (0, import_react.useState)("");
	const letters = [
		"A",
		"B",
		"C",
		"D",
		"E",
		"F"
	];
	const courseSuggestions = bulkCourseInput.trim() ? courses.filter((c) => c.titleOm.toLowerCase().includes(bulkCourseInput.toLowerCase()) || c.titleEn.toLowerCase().includes(bulkCourseInput.toLowerCase())) : courses.slice(0, 6);
	function handleChange(val) {
		setRaw(val);
		setError("");
		if (val.trim().length > 10) {
			const results = parseAllQuestions(val);
			setParsed(results);
		} else setParsed([]);
	}
	function handleSaveAll() {
		if (parsed.length === 0) return;
		if (!selectedCourseId && !bulkCourseInput.trim()) {
			setError("Maqaa koorsii galchi");
			return;
		}
		const courseId = selectedCourseId || `__new__:${bulkCourseInput.trim()}`;
		onSaveAll(parsed, courseId);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 pt-1",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-xl border border-primary/25 bg-primary/5 px-4 py-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "font-semibold text-sm flex items-center gap-2 text-primary",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ClipboardPaste, { className: "size-4" }), "Gaaffilee guutuu paste godhi"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground mt-0.5",
					children: "Gaaffii tokko ykn hedduuyyuu paste godhi — sirreeffamni ofumaan ta'a, gaaffiilee hunda agarsiisa."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
				autoFocus: true,
				value: raw,
				onChange: (e) => handleChange(e.target.value),
				rows: 10,
				className: "font-mono text-sm resize-y bg-background",
				placeholder: `Gaaffii 1:
AI jechuun maal jechuudha?
A. Sammuu Nam-tolchee
B. Interneetii Saffisaa
C. Sagantaa Kompliitaraa
D. Kuusaa Odeeffannoo

Deebii sirrii: A
Ibsa: AI jechuun...

Gaaffii 2:
Machine Learning jechuun maal?
A. ...
B. ...`
			}),
			error && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-xs text-destructive",
				children: ["⚠ ", error]
			}),
			parsed.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs font-semibold text-primary flex items-center gap-1.5",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5" }),
							parsed.length,
							" gaaffii argame — gaaffii filachuudhaan galchi"
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "max-h-72 overflow-y-auto space-y-2 pr-1",
						children: parsed.map((q, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-xl border border-border bg-card p-3 space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-start justify-between gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium flex-1",
										children: q.questionText
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										size: "sm",
										variant: "outline",
										className: "shrink-0 h-7 px-3 text-xs gap-1",
										onClick: () => onParsed(q),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-3" }), " Edit"]
									})]
								}),
								q.type === "mcq" && q.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid grid-cols-2 gap-1",
									children: q.options.map((opt, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs", q.correctLetter === letters[i] ? "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 font-semibold" : "border-border text-muted-foreground"),
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold", q.correctLetter === letters[i] ? "bg-green-500 text-white" : "bg-muted text-muted-foreground"),
											children: letters[i]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "line-clamp-1",
											children: opt
										})]
									}, i))
								}),
								q.type === "truefalse" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex gap-2 text-xs",
									children: ["TRUE", "FALSE"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: cn("rounded-lg border px-3 py-1 font-medium", q.correctLetter === v ? "border-green-400 bg-green-50 text-green-800" : "border-border text-muted-foreground"),
										children: v === "TRUE" ? "✅ Dhugaa" : "❌ Soba"
									}, v))
								}),
								q.explanation && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "text-[11px] text-muted-foreground border-t pt-1.5 line-clamp-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-semibold",
											children: "Ibsa:"
										}),
										" ",
										q.explanation
									]
								})
							]
						}, idx))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-semibold",
								children: "Gaaffilee hunda olkaa'i — koorsii filadhu"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "relative",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
									placeholder: "Maqaa koorsii barreessi ykn filadhu...",
									value: bulkCourseInput,
									autoComplete: "off",
									onChange: (e) => {
										setBulkCourseInput(e.target.value);
										setSelectedCourseId("");
										setShowCourseSug(true);
										setError("");
									},
									onFocus: () => setShowCourseSug(true),
									onBlur: () => setTimeout(() => setShowCourseSug(false), 150),
									className: "bg-background"
								}), showCourseSug && courseSuggestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-40 overflow-y-auto",
									children: [courseSuggestions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onMouseDown: () => {
											setBulkCourseInput(c.titleOm || c.titleEn);
											setSelectedCourseId(c.id);
											setShowCourseSug(false);
										},
										className: "w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-accent",
										children: c.titleOm || c.titleEn
									}, c.id)), bulkCourseInput.trim() && !courses.some((c) => c.titleEn.toLowerCase() === bulkCourseInput.trim().toLowerCase() || c.titleOm.toLowerCase() === bulkCourseInput.trim().toLowerCase()) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "px-3 py-2 border-t text-xs text-amber-700 dark:text-amber-400",
										children: [
											"\"",
											bulkCourseInput.trim(),
											"\" — koorsii haaraa uumama"
										]
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								className: "w-full gap-2 text-base h-11",
								disabled: saving || !bulkCourseInput.trim(),
								onClick: handleSaveAll,
								children: saving ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-current border-t-transparent" }), " Olkaa'aa jira..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5" }),
									" Gaaffilee ",
									parsed.length,
									" hunda olkaa'i"
								] })
							})
						]
					})
				]
			}),
			raw.trim().length > 10 && parsed.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400",
				children: "⚠ Gaaffii argachuu hin dandeenye. Mirkaneessi: gaaffii, filannoolee (A. B. C. D.), fi deebii sirrii of-keessatti qabatee paste godhi."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-between items-center border-t pt-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: onManual,
					className: "text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline",
					children: "Harkaan galchi →"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Gaaffii tokko filatteen booda fooramii guutuu ni agarsiisu"
				})]
			})
		]
	});
}
function QuestionForm({ q, courses, courseInput, onCourseChange, onChange, onSave, onCancel, saving, t }) {
	const set = (k, v) => onChange({
		...q,
		[k]: v
	});
	const [showSuggestions, setShowSuggestions] = (0, import_react.useState)(false);
	const suggestions = courseInput.trim() ? courses.filter((c) => c.titleOm.toLowerCase().includes(courseInput.toLowerCase()) || c.titleEn.toLowerCase().includes(courseInput.toLowerCase())) : courses.slice(0, 6);
	const isNewCourse = courseInput.trim().length > 0 && !courses.some((c) => c.titleOm.toLowerCase() === courseInput.trim().toLowerCase() || c.titleEn.toLowerCase() === courseInput.trim().toLowerCase());
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-2 gap-3",
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
									onCourseChange(e.target.value);
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
							children: [suggestions.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								type: "button",
								onMouseDown: () => {
									onCourseChange(c.titleOm || c.titleEn);
									setShowSuggestions(false);
								},
								className: "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 font-medium",
									children: c.titleOm || c.titleEn
								}), c.titleEn && c.titleOm && c.titleEn !== c.titleOm && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs text-muted-foreground shrink-0",
									children: c.titleEn
								})]
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
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("admin.topic") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						placeholder: "Mata duree (fakk. Boqonnaa 3)",
						value: q.topic,
						onChange: (e) => set("topic", e.target.value)
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-3 gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Gosa gaaffii" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: q.type,
							onValueChange: (v) => set("type", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "mcq",
									children: t("qtype.mcq")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "truefalse",
									children: t("qtype.truefalse")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "short",
									children: t("qtype.short")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "essay",
									children: t("qtype.essay")
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("admin.difficulty") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: q.difficulty,
							onValueChange: (v) => set("difficulty", v),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "easy",
									children: t("difficulty.easy")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "medium",
									children: t("difficulty.medium")
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: "hard",
									children: t("difficulty.hard")
								})
							] })]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("common.points") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							min: 1,
							value: q.points,
							onChange: (e) => set("points", Number(e.target.value))
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Gaaffii (Afaan Oromoo) ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-destructive",
					children: "*"
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Gaaffii kee asitti barreessi...",
					value: q.textOm,
					onChange: (e) => set("textOm", e.target.value),
					rows: 3,
					className: "resize-y"
				})]
			}),
			q.type === "mcq" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-2",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						"Filannoolee deebii",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-muted-foreground font-normal",
							children: "(deebii sirrii filadhu)"
						})
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2",
						children: q.options.map((opt, i) => {
							const isCorrect = q.correctOptionId === opt.id;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors", isCorrect ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/30" : "border-border hover:border-primary/40"),
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => set("correctOptionId", opt.id),
										className: cn("grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors", isCorrect ? "border-green-500 bg-green-500" : "border-muted-foreground/40 hover:border-primary"),
										children: isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-2 rounded-full bg-white" })
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("shrink-0 text-sm font-bold w-5 text-center", isCorrect ? "text-green-700 dark:text-green-400" : "text-muted-foreground"),
										children: [String.fromCharCode(65 + i), "."]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										placeholder: `Filannoo ${i + 1}`,
										value: opt.textOm,
										onChange: (e) => {
											set("options", q.options.map((o) => o.id === opt.id ? {
												...o,
												textOm: e.target.value
											} : o));
										},
										className: "flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
									}),
									q.options.length > 2 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: "ghost",
										size: "icon",
										className: "size-7 shrink-0 text-muted-foreground/50 hover:text-destructive",
										onClick: () => set("options", q.options.filter((o) => o.id !== opt.id)),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" })
									})
								]
							}, opt.id);
						})
					}),
					q.options.length < 6 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						className: "w-full gap-1.5 border-dashed",
						onClick: () => set("options", [...q.options, BLANK_OPT()]),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3.5" }), " Filannoo dabaluu"]
					}),
					!q.correctOptionId && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-amber-600 dark:text-amber-400",
						children: "⚠ Deebii sirrii filuu hin dagatin"
					})
				]
			}),
			q.type === "truefalse" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Deebii sirrii" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex gap-3",
					children: [{
						value: "true",
						label: "✅ Dhugaa"
					}, {
						value: "false",
						label: "❌ Soba"
					}].map(({ value, label }) => {
						const selected = value === "true" && q.correctBool === true || value === "false" && q.correctBool === false;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: () => set("correctBool", value === "true"),
							className: cn("flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all", selected ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"),
							children: label
						}, value);
					})
				})]
			}),
			(q.type === "short" || q.type === "essay") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1.5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
					"Deebii eegamu",
					" ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-xs text-muted-foreground font-normal",
						children: "(barsiisaaf qofa)"
					})
				] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					placeholder: "Deebii sirrii ykn yaada sakatta'iinsaaf...",
					value: q.rubric ?? "",
					onChange: (e) => set("rubric", e.target.value),
					rows: 3
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex justify-end gap-2 pt-2 border-t",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "outline",
					onClick: onCancel,
					children: t("common.cancel")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: onSave,
					disabled: saving,
					children: saving ? t("common.saving") : t("common.save")
				})]
			})
		]
	});
}
//#endregion
export { QuestionsPage as component };
