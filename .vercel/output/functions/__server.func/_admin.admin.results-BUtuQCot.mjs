import { o as __toESM } from "./_runtime.mjs";
import { u as require_react } from "./_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime } from "./_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n } from "./_ssr/utils-DJzCcaxX.mjs";
import { t as Button } from "./_ssr/button-Dlq7EbrN.mjs";
import { S as adminPublishResult, Y as useServerFn, _ as adminListQuestions, b as adminPublishAllResults, f as adminListAttempts, h as adminListExams, u as adminGradeAttempt } from "./_ssr/server-fns-BeozUQqq.mjs";
import { G as Globe, K as GlobeLock, ct as CircleCheck } from "./_libs/lucide-react.mjs";
import { t as Input } from "./_ssr/input-C66tOvwJ.mjs";
import { t as Label } from "./_ssr/label-DZshBjwu.mjs";
import { a as SelectValue, i as SelectTrigger, n as SelectContent, r as SelectItem, t as Select } from "./_ssr/select-_rVIUp5t.mjs";
import { a as DialogHeader, n as DialogContent, o as DialogTitle, t as Dialog } from "./_ssr/dialog-DXPbO9yP.mjs";
import { t as Skeleton } from "./_ssr/skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./_ssr/server-error-CKBGMntn.mjs";
import { n as toast } from "./_libs/sonner.mjs";
import { t as Badge } from "./_ssr/badge-DrvmNaCn.mjs";
import { t as Textarea } from "./_ssr/textarea-Q65f5Ihz.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/_admin.admin.results-BUtuQCot.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Admin — Results & Grading
*/
var toNum = (v) => v === "" ? 0 : Number(v);
function ResultsPage() {
	const { t } = useI18n();
	const call = useServerFn();
	const [attempts, setAttempts] = (0, import_react.useState)([]);
	const [exams, setExams] = (0, import_react.useState)([]);
	const [questions, setQuestions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [examFilter, setExamFilter] = (0, import_react.useState)("all");
	const [statusFilter, setStatusFilter] = (0, import_react.useState)("all");
	const [gradingAttempt, setGradingAttempt] = (0, import_react.useState)(null);
	const [feedback, setFeedback] = (0, import_react.useState)("");
	const [manualGrades, setManualGrades] = (0, import_react.useState)({});
	const [saving, setSaving] = (0, import_react.useState)(false);
	const refresh = async () => {
		setLoading(true);
		try {
			const [a, e, q] = await Promise.all([
				call(adminListAttempts, {}),
				call(adminListExams, void 0),
				call(adminListQuestions, {})
			]);
			setAttempts(a.filter((x) => x.status !== "in_progress").sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)));
			setExams(e);
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
	const filtered = attempts.filter((a) => {
		if (examFilter !== "all" && a.examId !== examFilter) return false;
		if (statusFilter === "pending" && !a.needsManualGrading) return false;
		if (statusFilter === "published" && !a.published) return false;
		if (statusFilter === "unpublished" && a.published) return false;
		return true;
	});
	function openGrade(attempt) {
		setGradingAttempt(attempt);
		setFeedback(attempt.feedback ?? "");
		setManualGrades({ ...attempt.manualGrades ?? {} });
	}
	function setManualPoints(qid, points) {
		setManualGrades((prev) => ({
			...prev,
			[qid]: {
				...prev[qid] ?? {},
				points
			}
		}));
	}
	function setManualNote(qid, note) {
		setManualGrades((prev) => ({
			...prev,
			[qid]: {
				points: prev[qid]?.points ?? 0,
				feedback: note
			}
		}));
	}
	async function saveGrade() {
		if (!gradingAttempt) return;
		setSaving(true);
		try {
			await call(adminGradeAttempt, {
				attemptId: gradingAttempt.id,
				manualGrades,
				feedback
			});
			toast.success(t("common.success"));
			setGradingAttempt(null);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSaving(false);
		}
	}
	async function togglePublish(attempt) {
		try {
			await call(adminPublishResult, {
				attemptId: attempt.id,
				published: !attempt.published
			});
			toast.success(t("common.success"));
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	async function publishAll(examId) {
		try {
			const res = await call(adminPublishAllResults, { examId });
			toast.success(`Published ${res.count} results`);
			await refresh();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		}
	}
	const examName = (id) => exams.find((e) => e.id === id)?.title ?? id;
	const manualQuestions = gradingAttempt ? gradingAttempt.questionOrder.map((qid) => questions.find((q) => q.id === qid)).filter((q) => Boolean(q && (q.type === "short" || q.type === "essay"))) : [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-2xl font-bold",
				children: t("admin.grading")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted-foreground",
				children: [filtered.length, " attempts"]
			})] }), examFilter !== "all" && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				size: "sm",
				onClick: () => void publishAll(examFilter),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4 mr-1" }),
					" ",
					t("admin.publishResults"),
					" All"
				]
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-4 flex flex-wrap gap-2",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: examFilter,
				onValueChange: setExamFilter,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-52",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, { placeholder: "All exams" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: "all",
					children: "All exams"
				}), exams.map((e) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
					value: e.id,
					children: e.title
				}, e.id))] })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
				value: statusFilter,
				onValueChange: setStatusFilter,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, {
					className: "w-40",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {})
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "all",
						children: "All"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "pending",
						children: "Needs grading"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "published",
						children: "Published"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
						value: "unpublished",
						children: "Unpublished"
					})
				] })]
			})]
		}),
		loading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: Array.from({ length: 4 }).map((_, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-20 rounded-lg" }, i))
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "divide-y rounded-lg border",
			children: [filtered.map((attempt) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-4 p-4 hover:bg-muted/30",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex-1 min-w-0",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "font-medium",
							children: attempt.studentName
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm text-muted-foreground",
							children: examName(attempt.examId)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-1 flex flex-wrap gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									variant: attempt.passed ? "default" : "destructive",
									className: "text-xs",
									children: [
										attempt.percentage,
										"% ·",
										" ",
										attempt.passed ? t("result.passed") : t("result.failed")
									]
								}),
								attempt.needsManualGrading && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: "secondary",
									className: "text-xs",
									children: "Needs grading"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
									variant: attempt.published ? "default" : "outline",
									className: "text-xs",
									children: attempt.published ? "Published" : "Unpublished"
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-1 shrink-0",
					children: [attempt.needsManualGrading && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						size: "sm",
						onClick: () => void openGrade(attempt),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 mr-1" }), " Grade"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "ghost",
						size: "icon",
						onClick: () => void togglePublish(attempt),
						children: attempt.published ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GlobeLock, { className: "size-4 text-muted-foreground" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "size-4 text-green-500" })
					})]
				})]
			}, attempt.id)), filtered.length === 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "py-10 text-center text-muted-foreground",
				children: t("common.notFound")
			})]
		}),
		/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
			open: Boolean(gradingAttempt),
			onOpenChange: (o) => !o && setGradingAttempt(null),
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, {
				className: "max-h-[90vh] overflow-y-auto sm:max-w-lg",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogTitle, { children: ["Grade: ", gradingAttempt?.studentName] }) }), gradingAttempt && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg bg-muted/50 p-3 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Auto score: ",
								gradingAttempt.autoScore,
								" / ",
								gradingAttempt.totalPoints
							] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
								"Percentage: ",
								gradingAttempt.percentage,
								"%"
							] })]
						}),
						manualQuestions.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "text-sm font-semibold",
								children: "Questions to grade"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Award points for each short-answer / essay question."
							})] }), manualQuestions.map((q, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-2 rounded-lg border p-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-sm font-medium",
										children: [
											i + 1,
											". ",
											q.textEn || q.textOm
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "text-xs text-muted-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											"Student answer:",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-foreground",
												children: gradingAttempt.answers[q.id] || "(blank)"
											})
										] }), (q.expectedAnswer || q.rubric) && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [
											"Expected/rubric:",
											" ",
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-foreground",
												children: q.expectedAnswer || q.rubric
											})
										] })]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex flex-wrap items-end gap-3",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs",
													children: "Points"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													type: "number",
													min: 0,
													max: q.points,
													value: manualGrades[q.id]?.points ?? 0,
													onChange: (e) => setManualPoints(q.id, toNum(e.target.value)),
													className: "w-24"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex-1 space-y-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
													className: "text-xs",
													children: "Feedback"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
													value: manualGrades[q.id]?.feedback ?? "",
													onChange: (e) => setManualNote(q.id, e.target.value),
													placeholder: "Optional per-question feedback"
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "text-xs text-muted-foreground",
												children: [
													"/ ",
													q.points,
													" pt"
												]
											})
										]
									})
								]
							}, q.id))]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("result.feedback") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								value: feedback,
								onChange: (e) => setFeedback(e.target.value),
								rows: 4,
								placeholder: "Overall feedback..."
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex justify-end gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "outline",
								onClick: () => setGradingAttempt(null),
								children: t("common.cancel")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								onClick: () => void saveGrade(),
								disabled: saving,
								children: saving ? t("common.saving") : t("admin.saveGrade")
							})]
						})
					]
				})]
			})
		})
	] });
}
//#endregion
export { ResultsPage as component };
