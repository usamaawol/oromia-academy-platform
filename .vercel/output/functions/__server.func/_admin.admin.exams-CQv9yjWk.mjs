import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { v as useSearch } from "./_libs/@tanstack/react-router+[...].mjs";
import { D as adminSaveExam, E as adminSaveCourse, O as adminSaveQuestion, R as getExamLeaderboard, Y as useServerFn, _ as adminListQuestions, a as adminDeleteExam, h as adminListExams, m as adminListCourses, t as adminAiExtractQuestions } from "./_ssr/server-fns-BeozUQqq.mjs";
import { E as Pencil, I as Lock, J as FileText, T as Plus, W as GraduationCap, Y as Eye, _t as BookOpen, a as Users, ct as CircleCheck, dt as ChevronRight, f as Trash2, ft as ChevronLeft, l as Upload, mt as Check, ot as CircleX, t as Zap, y as Settings2 } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { n as CheckboxIndicator, t as Checkbox$1 } from "./_libs/@radix-ui/react-checkbox+[...].mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, r as DialogDescription, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { n as CardContent, t as Card } from "./_ssr/card-6xbYZB6Z.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
import { t as Separator } from "./_ssr/separator-xtkvXYpu.mjs";
import { t as Switch } from "./_ssr/switch-B7vSEhN9.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.exams-CQv9yjWk.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var Checkbox = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox$1, {
	ref,
	className: cn("grid place-content-center peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground", className),
	...props,
	children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CheckboxIndicator, {
		className: cn("grid place-content-center text-current"),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "h-4 w-4" })
	})
}));
Checkbox.displayName = Checkbox$1.displayName;
/**
* Admin — Exams management
* Full-featured exam creation wizard with PDF import, question bank, leaderboard controls.
*/
var BLANK_EXAM = {
	id: "",
	title: "",
	courseId: "",
	topic: "",
	description: "",
	instructions: "",
	language: "om",
	startAt: null,
	endAt: null,
	durationMin: 60,
	maxAttempts: 1,
	passMark: 50,
	questionIds: [],
	poolSize: 0,
	shuffleQuestions: true,
	shuffleOptions: true,
	allowBackward: true,
	requireFullscreen: false,
	resultPolicy: "immediate",
	resultsPublishAt: null,
	status: "draft",
	hasPassword: false,
	showAnswersAfter: false,
	anonymous: true,
	pdfUrl: void 0,
	pdfName: void 0
};
function statusVariant(s) {
	if (s === "active") return "default";
	if (s === "closed") return "secondary";
	if (s === "archived") return "destructive";
	return "outline";
}
function toLocalInput(ms) {
	if (!ms) return "";
	const d = new Date(ms);
	const pad = (n) => String(n).padStart(2, "0");
	return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
var toNum = (v) => v === "" ? 0 : Number(v);
function ExamsPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const newParam = useSearch({ from: "/_admin/admin/exams" })["new"];
	const [exams, setExams] = (0, import_react.useState)([]);
	const [courses, setCourses] = (0, import_react.useState)([]);
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [dialogOpen, setDialogOpen] = (0, import_react.useState)(false);
	const [editing, setEditing] = (0, import_react.useState)({ ...BLANK_EXAM });
	const [courseInput, setCourseInput] = (0, import_react.useState)("");
	const [showCourseSuggestions, setShowCourseSuggestions] = (0, import_react.useState)(false);
	const [password, setPassword] = (0, import_react.useState)("");
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [wizardTab, setWizardTab] = (0, import_react.useState)("basics");
	const [qSearch, setQSearch] = (0, import_react.useState)("");
	const [pdfQuestions, setPdfQuestions] = (0, import_react.useState)([]);
	const [pdfImporting, setPdfImporting] = (0, import_react.useState)(false);
	const [aiExtracting, setAiExtracting] = (0, import_react.useState)(false);
	const [selectedPdfQs, setSelectedPdfQs] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const fileRef = (0, import_react.useRef)(null);
	const examPdfRef = (0, import_react.useRef)(null);
	const [examPdfUploading, setExamPdfUploading] = (0, import_react.useState)(false);
	const [lbExamId, setLbExamId] = (0, import_react.useState)(null);
	const [lbData, setLbData] = (0, import_react.useState)([]);
	const [lbLoading, setLbLoading] = (0, import_react.useState)(false);
	const refresh = async () => {
		setLoading(true);
		try {
			const [e, c, q] = await Promise.all([
				call(adminListExams, void 0),
				call(adminListCourses, void 0),
				call(adminListQuestions, {})
			]);
			setExams(e);
			setCourses(c);
			setQuestions(q);
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setLoading(false);
		}
	};
	(0, import_react.useEffect)(() => {
		refresh();
	}, []);
	(0, import_react.useEffect)(() => {
		if (newParam === "1" && !loading) openNew();
	}, [newParam, loading]);
	function openNew() {
		setEditing({
			...BLANK_EXAM,
			id: crypto.randomUUID()
		});
		setCourseInput("");
		setPassword("");
		setWizardTab("basics");
		setPdfQuestions([]);
		setSelectedPdfQs(/* @__PURE__ */ new Set());
		setDialogOpen(true);
	}
	function openEdit(e) {
		setEditing({ ...e });
		const existing = courses.find((c) => c.id === e.courseId);
		setCourseInput(existing?.titleEn || existing?.titleOm || "");
		setPassword("");
		setWizardTab("basics");
		setPdfQuestions([]);
		setSelectedPdfQs(/* @__PURE__ */ new Set());
		setDialogOpen(true);
	}
	async function openLeaderboard(examId) {
		setLbExamId(examId);
		setLbLoading(true);
		try {
			const data = await call(getExamLeaderboard, { examId });
			setLbData(data);
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setLbLoading(false);
		}
	}
	async function save() {
		if (!editing.title.trim()) {
			toast.error("Title required");
			return;
		}
		if (!courseInput.trim()) {
			toast.error("Course name required");
			return;
		}
		if (editing.durationMin < 1) {
			toast.error("Duration must be at least 1 minute");
			return;
		}
		if (editing.passMark < 0 || editing.passMark > 100) {
			toast.error("Pass mark must be 0–100");
			return;
		}
		if (editing.poolSize && editing.poolSize > editing.questionIds.length) {
			toast.error("Pool size cannot exceed selected question count");
			return;
		}
		const editingExisting = exams.some((e) => e.id === editing.id);
		if (editing.hasPassword && !password && !editingExisting) {
			toast.error("Set a password for this exam");
			return;
		}
		setSaving(true);
		try {
			const name = courseInput.trim();
			let courseId = editing.courseId;
			const match = courses.find((c) => c.titleEn.toLowerCase() === name.toLowerCase() || c.titleOm.toLowerCase() === name.toLowerCase());
			if (match) courseId = match.id;
			else {
				const newId = crypto.randomUUID();
				await call(adminSaveCourse, { course: {
					id: newId,
					titleOm: name,
					titleEn: name,
					descOm: "",
					descEn: "",
					icon: "graduation-cap",
					level: "medium",
					status: "active",
					order: courses.length
				} });
				courseId = newId;
				const freshCourses = await call(adminListCourses, void 0);
				setCourses(freshCourses);
			}
			await call(adminSaveExam, {
				exam: {
					...editing,
					courseId
				},
				...password ? { password } : {}
			});
			toast.success(t("common.success"));
			setDialogOpen(false);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function remove(id) {
		if (!confirm("Delete this exam? This cannot be undone.")) return;
		try {
			await call(adminDeleteExam, { id });
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function togglePublish(exam) {
		const newStatus = exam.status === "active" ? "draft" : "active";
		try {
			await call(adminSaveExam, { exam: {
				...exam,
				status: newStatus
			} });
			toast.success(newStatus === "active" ? "Exam published" : "Exam unpublished");
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	function toggleQuestion(qid) {
		setEditing((prev) => ({
			...prev,
			questionIds: prev.questionIds.includes(qid) ? prev.questionIds.filter((id) => id !== qid) : [...prev.questionIds, qid]
		}));
	}
	const set = (k, v) => setEditing((p) => ({
		...p,
		[k]: v
	}));
	async function handleAiExtract(text) {
		if (!text.trim()) return;
		setAiExtracting(true);
		setPdfQuestions([]);
		setSelectedPdfQs(/* @__PURE__ */ new Set());
		try {
			const parsed = (await call(adminAiExtractQuestions, { text })).questions.map((q) => ({
				text: q.questionOm,
				options: q.options.map((o) => o.textOm),
				answerIdx: q.correctAnswer ? [
					"A",
					"B",
					"C",
					"D"
				].indexOf(q.correctAnswer) : null,
				type: q.type === "truefalse" ? "truefalse" : q.type === "mcq" ? "mcq" : "essay",
				_ai: q
			}));
			setPdfQuestions(parsed);
			setSelectedPdfQs(new Set(parsed.map((_, i) => i)));
			toast.success(`AI found ${parsed.length} question${parsed.length !== 1 ? "s" : ""}`);
		} catch (err) {
			toast.error(serverErrorMessage(err, t));
		} finally {
			setAiExtracting(false);
		}
	}
	async function handlePdfFile(file) {
		if (!file) return;
		setPdfImporting(true);
		try {
			await handleAiExtract(await file.text());
		} catch {
			toast.error("Could not read file");
		} finally {
			setPdfImporting(false);
		}
	}
	async function importPdfQuestions() {
		if (selectedPdfQs.size === 0) {
			toast.error("Select at least one question");
			return;
		}
		const toImport = pdfQuestions.filter((_, i) => selectedPdfQs.has(i));
		setSaving(true);
		try {
			const newIds = [];
			for (const pq of toImport) {
				const qid = crypto.randomUUID();
				const ai = pq._ai;
				const optObjs = ai ? ai.options.map((o) => ({
					id: crypto.randomUUID(),
					textOm: o.textOm,
					textEn: o.textEn || ""
				})) : pq.options.map((txt) => ({
					id: crypto.randomUUID(),
					textOm: txt,
					textEn: ""
				}));
				const correctIdx = ai ? [
					"A",
					"B",
					"C",
					"D"
				].indexOf(ai.correctAnswer ?? "") : pq.answerIdx;
				const q = {
					id: qid,
					courseId: editing.courseId || courses[0]?.id || "",
					topic: editing.topic ?? "",
					type: pq.type,
					language: ai?.questionEn ? "both" : "om",
					difficulty: "medium",
					textOm: ai?.questionOm ?? pq.text,
					textEn: ai?.questionEn ?? "",
					options: optObjs,
					correctOptionId: correctIdx !== null && correctIdx >= 0 ? optObjs[correctIdx]?.id : void 0,
					correctBool: pq.type === "truefalse" ? ai?.correctAnswer?.toLowerCase() === "true" : void 0,
					expectedAnswer: "",
					rubric: ai?.explanationOm ?? "",
					points: 1,
					tags: ["ai-import"],
					approved: true
				};
				await call(adminSaveQuestion, { question: q });
				newIds.push(qid);
			}
			const freshQs = await call(adminListQuestions, {});
			setQuestions(freshQs);
			setEditing((prev) => ({
				...prev,
				questionIds: [.../* @__PURE__ */ new Set([...prev.questionIds, ...newIds])]
			}));
			setPdfQuestions([]);
			setSelectedPdfQs(/* @__PURE__ */ new Set());
			toast.success(`Imported ${newIds.length} questions`);
			setWizardTab("questions");
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function handleExamPdfUpload(file) {
		if (!file) return;
		if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
			toast.error("Please upload a PDF file");
			return;
		}
		setExamPdfUploading(true);
		try {
			const reader = new FileReader();
			const dataUrl = await new Promise((resolve, reject) => {
				reader.onload = () => resolve(reader.result);
				reader.onerror = () => reject(reader.error);
				reader.readAsDataURL(file);
			});
			setEditing((prev) => ({
				...prev,
				pdfUrl: dataUrl,
				pdfName: file.name
			}));
			toast.success(`PDF attached: ${file.name}`);
		} catch {
			toast.error("Could not read PDF file");
		} finally {
			setExamPdfUploading(false);
		}
	}
	function removeExamPdf() {
		setEditing((prev) => ({
			...prev,
			pdfUrl: void 0,
			pdfName: void 0
		}));
		if (examPdfRef.current) examPdfRef.current.value = "";
	}
	const filteredQ = questions.filter((q) => (!editing.courseId || q.courseId === editing.courseId) && (!qSearch || q.textOm.toLowerCase().includes(qSearch.toLowerCase()) || (q.textEn ?? "").toLowerCase().includes(qSearch.toLowerCase())));
	const courseName = (id) => courses.find((c) => c.id === id)?.titleEn ?? id;
	const WIZARD_TABS = [
		{
			id: "basics",
			label: "Basics",
			icon: BookOpen
		},
		{
			id: "questions",
			label: "Questions",
			icon: CircleCheck
		},
		{
			id: "pdf",
			label: "PDF Import",
			icon: FileText
		},
		{
			id: "settings",
			label: "Settings",
			icon: Settings2
		},
		{
			id: "preview",
			label: "Preview",
			icon: Eye
		}
	];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "max-w-5xl",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mb-6 flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-2xl font-bold",
					children: t("admin.exams")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted-foreground mt-0.5",
					children: [
						exams.length,
						" exam",
						exams.length !== 1 ? "s" : ""
					]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					size: "sm",
					onClick: openNew,
					className: "gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4" }),
						" ",
						t("admin.newExam")
					]
				})]
			}),
			loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: [
					0,
					1,
					2
				].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-24 rounded-xl" }, i))
			}) : exams.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "border-dashed",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
					className: "flex flex-col items-center gap-4 py-16 text-center",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid size-14 place-items-center rounded-2xl bg-muted",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-7 text-muted-foreground" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-semibold",
							children: "No exams yet"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground mt-1",
							children: "Create your first exam to get started."
						})] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							onClick: openNew,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-4 mr-1" }), " New Exam"]
						})
					]
				})
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: exams.map((exam) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
					className: "border-border/60 hover:border-primary/30 transition-colors",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardContent, {
						className: "p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GraduationCap, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 flex-wrap",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
												className: "font-semibold",
												children: exam.title
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
												variant: statusVariant(exam.status),
												className: "capitalize text-xs",
												children: exam.status
											}),
											exam.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
												variant: "outline",
												className: "text-xs gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-2.5" }), " Password"]
											})
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: courseName(exam.courseId) }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [exam.durationMin, " min"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [exam.questionIds.length, " questions"] }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: exam.maxAttempts === 0 ? "Unlimited attempts" : `${exam.maxAttempts} attempt${exam.maxAttempts !== 1 ? "s" : ""}` }),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
												"Pass: ",
												exam.passMark,
												"%"
											] }),
											exam.showAnswersAfter && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-green-600",
												children: "Shows answers"
											}),
											exam.pdfUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-primary",
												children: "📄 PDF attached"
											})
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex gap-1 shrink-0",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											variant: "ghost",
											size: "sm",
											className: "gap-1.5 text-xs",
											onClick: () => void openLeaderboard(exam.id),
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-3.5" }), " Board"]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: exam.status === "active" ? "secondary" : "default",
											size: "sm",
											className: "gap-1.5 text-xs",
											onClick: () => void togglePublish(exam),
											children: exam.status === "active" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5" }), " Unpublish"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-3.5" }), " Publish"] })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											onClick: () => openEdit(exam),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Pencil, { className: "size-4" })
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
											variant: "ghost",
											size: "icon",
											onClick: () => void remove(exam.id),
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4 text-destructive" })
										})
									]
								})
							]
						})
					})
				}, exam.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: dialogOpen,
				onOpenChange: setDialogOpen,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "max-h-[92vh] overflow-hidden flex flex-col sm:max-w-3xl p-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, {
							className: "px-6 pt-6 pb-0 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
								className: "flex items-center gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "size-4 text-primary" }), editing.title || t("admin.newExam")]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, {
								className: "text-xs",
								children: "Fill in all tabs then click Save to publish your exam."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "px-6 pt-4 shrink-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "flex gap-1 overflow-x-auto pb-1",
								children: WIZARD_TABS.map(({ id, label, icon: Icon }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									onClick: () => setWizardTab(id),
									className: cn("flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors", wizardTab === id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-accent"),
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "size-3.5 shrink-0" }),
										" ",
										label,
										id === "questions" && editing.questionIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: cn("ml-1 rounded-full px-1.5 text-[10px] font-bold", wizardTab === id ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"),
											children: editing.questionIds.length
										})
									]
								}, id))
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex-1 overflow-y-auto px-6 py-4",
							children: [
								wizardTab === "basics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Exam Title *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
												placeholder: "e.g. Mid-term Exam — Web Development",
												value: editing.title,
												onChange: (e) => set("title", e.target.value)
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "relative space-y-1.5",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Course *" }),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "relative",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															placeholder: "Type or select a course...",
															value: courseInput,
															autoComplete: "off",
															onChange: (e) => {
																setCourseInput(e.target.value);
																set("courseId", "");
																setShowCourseSuggestions(true);
															},
															onFocus: () => setShowCourseSuggestions(true),
															onBlur: () => setTimeout(() => setShowCourseSuggestions(false), 150)
														}), courseInput.trim() && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: cn("absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none", !courses.some((c) => c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() || c.titleOm.toLowerCase() === courseInput.trim().toLowerCase()) ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"),
															children: !courses.some((c) => c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() || c.titleOm.toLowerCase() === courseInput.trim().toLowerCase()) ? "new ✦" : "✓ exists"
														})]
													}),
													showCourseSuggestions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-48 overflow-y-auto",
														children: [(courseInput.trim() ? courses.filter((c) => c.titleEn.toLowerCase().includes(courseInput.toLowerCase()) || c.titleOm.toLowerCase().includes(courseInput.toLowerCase())) : courses.slice(0, 6)).map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
															type: "button",
															onMouseDown: () => {
																setCourseInput(c.titleEn || c.titleOm);
																set("courseId", c.id);
																setShowCourseSuggestions(false);
															},
															className: "w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "flex-1 font-medium",
																children: c.titleEn || c.titleOm
															}), c.titleOm && c.titleEn && c.titleOm !== c.titleEn && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																className: "text-xs text-muted-foreground shrink-0",
																children: c.titleOm
															})]
														}, c.id)), courseInput.trim() && !courses.some((c) => c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() || c.titleOm.toLowerCase() === courseInput.trim().toLowerCase()) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "px-3 py-2 border-t bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "size-3 shrink-0" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
																"\"",
																courseInput.trim(),
																"\" — will be created as a new course"
															] })]
														})]
													})
												]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: editing.status,
													onValueChange: (v) => set("status", v),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "draft",
															children: "📝 Draft (hidden)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "active",
															children: "✅ Active (visible)"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "closed",
															children: "🔒 Closed"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "archived",
															children: "📦 Archived"
														})
													] })]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Topic / Subject" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: editing.topic ?? "",
													onChange: (e) => set("topic", e.target.value),
													placeholder: "e.g. Chapter 3 — Variables"
												})]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Language" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
													value: editing.language,
													onValueChange: (v) => set("language", v),
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "om",
															children: "Afaan Oromoo"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "en",
															children: "English"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
															value: "both",
															children: "Both"
														})
													] })]
												})]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Description (shown to students before they start)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: editing.description ?? "",
												onChange: (e) => set("description", e.target.value),
												rows: 2,
												placeholder: "Brief overview of this exam..."
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Instructions (shown on exam start screen)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
												value: editing.instructions ?? "",
												onChange: (e) => set("instructions", e.target.value),
												rows: 3,
												placeholder: "Read each question carefully. No external resources allowed..."
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-1.5",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Exam Paper PDF (optional)" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "text-xs text-muted-foreground mb-2",
													children: "Upload a PDF version of the exam paper that students can download/view before or during the exam."
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													ref: examPdfRef,
													type: "file",
													accept: "application/pdf,.pdf",
													className: "hidden",
													onChange: (e) => {
														const f = e.target.files?.[0];
														if (f) handleExamPdfUpload(f);
													}
												}),
												editing.pdfUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3 rounded-xl border bg-muted/40 p-3",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
															className: "grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10",
															children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-primary" })
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-sm font-medium truncate",
																children: editing.pdfName
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-xs text-muted-foreground",
																children: "PDF attached — students can download"
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex gap-1 shrink-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																variant: "ghost",
																size: "sm",
																onClick: () => window.open(editing.pdfUrl, "_blank"),
																className: "gap-1 text-xs",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3.5" }), " View"]
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
																variant: "ghost",
																size: "sm",
																onClick: removeExamPdf,
																className: "gap-1 text-xs text-destructive hover:text-destructive",
																children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-3.5" }), " Remove"]
															})]
														})
													]
												}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-xl border-2 border-dashed border-border p-4 text-center",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mx-auto size-8 text-muted-foreground mb-2" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-sm font-medium",
															children: "No PDF attached"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-xs text-muted-foreground mt-1 mb-3",
															children: "Upload the exam paper as a PDF file"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "outline",
															size: "sm",
															onClick: () => examPdfRef.current?.click(),
															disabled: examPdfUploading,
															className: "gap-1.5",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), examPdfUploading ? "Uploading..." : "Upload PDF"]
														})
													]
												})
											]
										})
									]
								}),
								wizardTab === "questions" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-3",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex items-center justify-between",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "font-medium text-sm",
												children: [editing.questionIds.length, " questions selected"]
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "text-xs text-muted-foreground",
												children: ["Filtered to ", editing.courseId ? courseName(editing.courseId) : "all courses"]
											})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
												variant: "outline",
												size: "sm",
												onClick: () => {
													const allIds = filteredQ.map((q) => q.id);
													if (allIds.every((id) => editing.questionIds.includes(id))) setEditing((p) => ({
														...p,
														questionIds: p.questionIds.filter((id) => !allIds.includes(id))
													}));
													else setEditing((p) => ({
														...p,
														questionIds: [.../* @__PURE__ */ new Set([...p.questionIds, ...allIds])]
													}));
												},
												children: filteredQ.every((q) => editing.questionIds.includes(q.id)) ? "Deselect All" : "Select All"
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Search questions...",
											value: qSearch,
											onChange: (e) => setQSearch(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "max-h-[380px] overflow-y-auto divide-y rounded-xl border",
											children: filteredQ.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "py-10 text-center text-sm text-muted-foreground",
												children: "No questions found. Add questions to the bank first or use PDF Import."
											}) : filteredQ.map((q) => {
												const selected = editing.questionIds.includes(q.id);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
													className: cn("flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors", selected ? "bg-primary/5" : "hover:bg-muted/40"),
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
															checked: selected,
															onCheckedChange: () => toggleQuestion(q.id),
															className: "mt-0.5 shrink-0"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1 min-w-0",
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																className: "text-sm line-clamp-2",
																children: q.textOm
															}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
																className: "mt-1 flex flex-wrap gap-1.5",
																children: [
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																		variant: "outline",
																		className: "text-[10px] py-0",
																		children: q.type
																	}),
																	/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																		variant: "outline",
																		className: "text-[10px] py-0 capitalize",
																		children: q.difficulty
																	}),
																	q.approved ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-green-600",
																		children: "✓ Approved"
																	}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
																		className: "text-[10px] text-amber-600",
																		children: "⚠ Pending"
																	})
																]
															})]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "shrink-0 text-xs text-muted-foreground font-mono",
															children: [q.points, "pt"]
														})
													]
												}, q.id);
											})
										})
									]
								}),
								wizardTab === "pdf" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border-2 border-dashed border-border p-6 text-center",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "mx-auto size-10 text-muted-foreground mb-3" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "font-medium",
													children: "AI Question Extraction"
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm text-muted-foreground mt-1 mb-4",
													children: [
														"Upload a ",
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: ".txt" }),
														" file or paste questions below — the AI will extract and structure them automatically."
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
													ref: fileRef,
													type: "file",
													accept: ".txt,.text,.pdf",
													className: "hidden",
													onChange: (e) => {
														const f = e.target.files?.[0];
														if (f) handlePdfFile(f);
													}
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
													variant: "outline",
													onClick: () => fileRef.current?.click(),
													disabled: pdfImporting || aiExtracting,
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4 mr-2" }), pdfImporting ? "Reading file..." : "Choose File"]
												})
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Or paste your questions directly" }),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
													id: "pdf-paste",
													rows: 8,
													placeholder: `Gaaffii 1:\nArtificial Intelligence (AI) jechuun maal jechuudha?\nA. Kompiitara suuraa qofa kaasu\nB. Sirna kompiitaraa hojii sammuu namaa fakkaatu\nC. Kompiitara cimsanii ibsaa isaa dabalu\nD. Internet qofa fayyadamu\n\nDeebii sirrii: ✅ B\nIbsa: AI jechuun teeknooloojii...`,
													className: "font-mono text-sm",
													disabled: aiExtracting
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: "Supports Afaan Oromoo, English, and mixed-language questions with any answer format."
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
														onClick: () => {
															handleAiExtract(document.getElementById("pdf-paste")?.value ?? "");
														},
														disabled: aiExtracting || pdfImporting,
														className: "gap-2 shrink-0",
														children: aiExtracting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-4 animate-spin rounded-full border-2 border-current border-t-transparent" }), " Extracting..."] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Upload, { className: "size-4" }), " AI'n Baasi"] })
													})]
												})
											]
										}),
										pdfQuestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
														className: "font-medium text-sm",
														children: [pdfQuestions.length, " questions detected"]
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex gap-2",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "outline",
															size: "sm",
															onClick: () => setSelectedPdfQs(new Set(pdfQuestions.map((_, i) => i))),
															children: "Select All"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
															variant: "outline",
															size: "sm",
															onClick: () => setSelectedPdfQs(/* @__PURE__ */ new Set()),
															children: "None"
														})]
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "max-h-72 overflow-y-auto space-y-2 rounded-xl border p-2",
													children: pdfQuestions.map((pq, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
														className: "flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/40",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Checkbox, {
															checked: selectedPdfQs.has(i),
															onCheckedChange: (v) => {
																setSelectedPdfQs((prev) => {
																	const next = new Set(prev);
																	v ? next.add(i) : next.delete(i);
																	return next;
																});
															},
															className: "mt-0.5 shrink-0"
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
															className: "flex-1",
															children: [
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
																	className: "text-sm font-medium",
																	children: pq.text
																}),
																pq.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
																	className: "mt-1 space-y-0.5",
																	children: pq.options.map((opt, oi) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
																		className: cn("text-xs", pq.answerIdx === oi ? "text-green-600 font-semibold" : "text-muted-foreground"),
																		children: [
																			String.fromCharCode(65 + oi),
																			". ",
																			opt,
																			pq.answerIdx === oi && " ✓"
																		]
																	}, oi))
																}),
																/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
																	variant: "outline",
																	className: "text-[10px] mt-1",
																	children: pq.type
																})
															]
														})]
													}, i))
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
													onClick: () => void importPdfQuestions(),
													disabled: saving || selectedPdfQs.size === 0,
													className: "w-full",
													children: saving ? "Importing..." : `Add ${selectedPdfQs.size} question${selectedPdfQs.size !== 1 ? "s" : ""} to Exam`
												})
											]
										})
									]
								}),
								wizardTab === "settings" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-5",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "text-sm font-semibold mb-3 flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs",
													children: "⏱"
												}), "Timing & Attempts"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-3 gap-3",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Duration (minutes) *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: 1,
															value: editing.durationMin,
															onChange: (e) => set("durationMin", toNum(e.target.value))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Max Attempts (0 = unlimited)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: 0,
															value: editing.maxAttempts,
															onChange: (e) => set("maxAttempts", toNum(e.target.value))
														})]
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "space-y-1.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Pass Mark (%)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
															type: "number",
															min: 0,
															max: 100,
															value: editing.passMark,
															onChange: (e) => set("passMark", toNum(e.target.value))
														})]
													})
												]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "grid grid-cols-2 gap-3 mt-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Start Time (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "datetime-local",
														value: toLocalInput(editing.startAt),
														onChange: (e) => set("startAt", e.target.value ? new Date(e.target.value).getTime() : null)
													})]
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "End Time (optional)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "datetime-local",
														value: toLocalInput(editing.endAt),
														onChange: (e) => set("endAt", e.target.value ? new Date(e.target.value).getTime() : null)
													})]
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Questions per student (pool, 0 = all selected)" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 0,
													value: editing.poolSize,
													onChange: (e) => set("poolSize", toNum(e.target.value)),
													className: "max-w-xs"
												})]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
												className: "text-sm font-semibold mb-3 flex items-center gap-2",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs",
													children: "🔒"
												}), "Access Control"]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 rounded-xl border p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													id: "has-pw",
													checked: editing.hasPassword ?? false,
													onCheckedChange: (v) => set("hasPassword", v)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex-1",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "has-pw",
														className: "font-medium",
														children: "Require exam password"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: "Students must enter a password before starting"
													})]
												})]
											}),
											editing.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-3 space-y-1.5",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: exams.some((e) => e.id === editing.id) ? "New password (leave blank to keep existing)" : "Exam password *" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "password",
													placeholder: "Enter password",
													value: password,
													onChange: (e) => setPassword(e.target.value)
												})]
											})
										] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "text-sm font-semibold mb-3 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs",
												children: "⚙"
											}), "Exam Behaviour"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "grid grid-cols-2 gap-3",
											children: [
												["shuffleQuestions", "Shuffle question order"],
												["shuffleOptions", "Shuffle answer options"],
												["allowBackward", "Allow going back to prev questions"],
												["requireFullscreen", "Require fullscreen mode"]
											].map(([key, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-3 rounded-xl border p-3",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
													id: key,
													checked: Boolean(editing[key]),
													onCheckedChange: (v) => set(key, v)
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													htmlFor: key,
													className: "text-sm leading-snug cursor-pointer",
													children: label
												})]
											}, key))
										})] }),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
											className: "text-sm font-semibold mb-3 flex items-center gap-2",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs",
												children: "📊"
											}), "Result Publication"]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "When to publish results to students" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
														value: editing.resultPolicy,
														onValueChange: (v) => set("resultPolicy", v),
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "immediate",
																children: "⚡ Immediate — right after submission"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "manual",
																children: "✋ Manual — you publish when ready"
															}),
															/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
																value: "scheduled",
																children: "📅 Scheduled — at a specific date/time"
															})
														] })]
													})]
												}),
												editing.resultPolicy === "scheduled" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "space-y-1.5",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Publish results at" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
														type: "datetime-local",
														value: toLocalInput(editing.resultsPublishAt),
														onChange: (e) => set("resultsPublishAt", e.target.value ? new Date(e.target.value).getTime() : null)
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3 rounded-xl border p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
														id: "show-answers",
														checked: editing.showAnswersAfter ?? false,
														onCheckedChange: (v) => set("showAnswersAfter", v)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "show-answers",
														className: "font-medium",
														children: "Show correct / wrong answers after result"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: "Students can review which questions they got right or wrong"
													})] })]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-3 rounded-xl border p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
														id: "anonymous",
														checked: editing.anonymous ?? true,
														onCheckedChange: (v) => set("anonymous", v)
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
														htmlFor: "anonymous",
														className: "font-medium",
														children: "Anonymous leaderboard"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs text-muted-foreground",
														children: "Show nicknames instead of real names on the score board"
													})] })]
												})
											]
										})] })
									]
								}),
								wizardTab === "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "space-y-4",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "rounded-xl border bg-muted/30 p-5 space-y-3",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start justify-between",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
														className: "text-lg font-bold",
														children: editing.title || "Untitled Exam"
													}), editing.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm text-muted-foreground mt-1",
														children: editing.description
													})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
														variant: statusVariant(editing.status),
														className: "capitalize shrink-0",
														children: editing.status
													})]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
													className: "grid grid-cols-2 gap-3 text-sm",
													children: [
														["Course", courseName(editing.courseId) || "—"],
														["Duration", `${editing.durationMin} min`],
														["Questions", `${editing.questionIds.length} (pool: ${editing.poolSize || "all"})`],
														["Max Attempts", editing.maxAttempts === 0 ? "Unlimited" : String(editing.maxAttempts)],
														["Pass Mark", `${editing.passMark}%`],
														["Result Policy", editing.resultPolicy],
														["Password", editing.hasPassword ? "Yes" : "No"],
														["Show Answers", editing.showAnswersAfter ? "Yes" : "No"],
														["Exam PDF", editing.pdfName ? `📄 ${editing.pdfName}` : "None"]
													].map(([k, v]) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
														className: "flex justify-between rounded-lg bg-background p-2.5",
														children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-muted-foreground text-xs",
															children: k
														}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "font-medium text-xs truncate max-w-[60%]",
															children: v
														})]
													}, k))
												}),
												editing.pdfUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-center gap-2 rounded-lg bg-primary/5 p-2.5",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-4 text-primary shrink-0" }),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
															className: "text-xs font-medium flex-1 truncate",
															children: editing.pdfName
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
															variant: "outline",
															size: "sm",
															className: "h-7 gap-1 text-[11px]",
															onClick: () => window.open(editing.pdfUrl, "_blank"),
															children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Eye, { className: "size-3" }), " View"]
														})
													]
												}),
												editing.instructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "rounded-lg bg-background p-3",
													children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-xs font-semibold text-muted-foreground mb-1",
														children: "Instructions"
													}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
														className: "text-sm whitespace-pre-line",
														children: editing.instructions
													})]
												})
											]
										}),
										editing.questionIds.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm font-medium mb-2",
											children: [
												"Selected Questions (",
												editing.questionIds.length,
												")"
											]
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "space-y-1.5 max-h-48 overflow-y-auto",
											children: editing.questionIds.map((qid, i) => {
												const q = questions.find((x) => x.id === qid);
												return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
													className: "flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2",
													children: [
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
															className: "text-xs text-muted-foreground font-mono shrink-0 mt-0.5",
															children: [i + 1, "."]
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
															className: "text-sm line-clamp-1",
															children: q?.textOm ?? "Unknown question"
														}),
														/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
															variant: "outline",
															className: "text-[10px] shrink-0 ml-auto",
															children: [q?.points ?? 1, "pt"]
														})
													]
												}, qid);
											})
										})] }),
										editing.questionIds.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground",
											children: "No questions selected yet. Go to the Questions tab to add them."
										})
									]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-6 py-4 shrink-0",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [wizardTab !== "basics" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => {
										const idx = WIZARD_TABS.findIndex((t) => t.id === wizardTab);
										const prev = WIZARD_TABS[idx - 1];
										if (prev) setWizardTab(prev.id);
									},
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 mr-1" }), " Back"]
								}), wizardTab !== "preview" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									variant: "outline",
									size: "sm",
									onClick: () => {
										const idx = WIZARD_TABS.findIndex((t) => t.id === wizardTab);
										const next = WIZARD_TABS[idx + 1];
										if (next) setWizardTab(next.id);
									},
									children: ["Next ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 ml-1" })]
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									variant: "ghost",
									size: "sm",
									onClick: () => setDialogOpen(false),
									children: "Cancel"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									size: "sm",
									onClick: () => void save(),
									disabled: saving,
									children: saving ? "Saving..." : "Save Exam"
								})]
							})]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
				open: !!lbExamId,
				onOpenChange: (open) => {
					if (!open) setLbExamId(null);
				},
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
					className: "sm:max-w-md",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-4 text-primary" }), " Leaderboard"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: "Anonymous rankings for this exam." })] }), lbLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 py-4",
						children: [
							0,
							1,
							2,
							3,
							4
						].map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-10 rounded-lg" }, i))
					}) : lbData.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "py-10 text-center text-sm text-muted-foreground",
						children: "No published results yet for this exam."
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "space-y-2 py-2 max-h-80 overflow-y-auto",
						children: lbData.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: cn("flex items-center gap-3 rounded-xl px-4 py-2.5", entry.rank === 1 ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" : entry.rank === 2 ? "bg-slate-50 dark:bg-slate-900/30 border" : entry.rank === 3 ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800" : "bg-muted/40"),
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: cn("w-7 text-center text-sm font-bold shrink-0", entry.rank === 1 ? "text-amber-600" : entry.rank === 2 ? "text-slate-500" : entry.rank === 3 ? "text-orange-600" : "text-muted-foreground"),
									children: entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "flex-1 font-medium text-sm",
									children: entry.nickname
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-sm font-semibold tabular-nums",
									children: [entry.percentage, "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: entry.passed ? "default" : "destructive",
									className: "text-xs",
									children: entry.passed ? "Pass" : "Fail"
								})
							]
						}, entry.rank))
					})]
				})
			})
		]
	});
}
//#endregion
export { ExamsPage as component };
