import { o as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { N as require_jsx_runtime, a as Overlay2, c as Title2, i as Description2, n as Cancel, o as Portal2, r as Content2, s as Root2, t as Action } from "../_libs/@radix-ui/react-alert-dialog+[...].mjs";
import { i as useI18n, n as cn } from "./utils-DJzCcaxX.mjs";
import { n as buttonVariants, t as Button } from "./button-Dlq7EbrN.mjs";
import { _ as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { B as getMyResult, G as saveAnswer, K as startExam, L as getExamInfo, Y as useServerFn, q as submitExam } from "./server-fns-BeozUQqq.mjs";
import { I as Lock, J as FileText, N as Maximize, Z as Download, b as Send, ct as CircleCheck, dt as ChevronRight, ft as ChevronLeft, i as WifiOff, lt as CircleAlert, nt as Clock3, ot as CircleX, q as Flag, r as Wifi, u as Trophy } from "../_libs/lucide-react.mjs";
import { t as Input } from "./input-C66tOvwJ.mjs";
import { t as Label } from "./label-DZshBjwu.mjs";
import { t as Skeleton } from "./skeleton-ku0SeAj6.mjs";
import { t as serverErrorMessage } from "./server-error-CKBGMntn.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as Badge } from "./badge-DrvmNaCn.mjs";
import { a as CardTitle, i as CardHeader, n as CardContent, t as Card } from "./card-6xbYZB6Z.mjs";
import { t as Textarea } from "./textarea-Q65f5Ihz.mjs";
import { t as Separator } from "./separator-xtkvXYpu.mjs";
import { t as SiteHeader } from "./site-header-r2TkZ-J4.mjs";
import { r as formatClock } from "./exam-engine-C-iWJGOh.mjs";
import { t as Route } from "./exam._examId-BZvAsGvM.mjs";
import { t as Progress } from "./progress-BIYMjxT2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/exam._examId-DsYA8LHw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var AlertDialog = Root2;
var AlertDialogPortal = Portal2;
var AlertDialogOverlay = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Overlay2, {
	className: cn("fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
	...props,
	ref
}));
AlertDialogOverlay.displayName = Overlay2.displayName;
var AlertDialogContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Content2, {
	ref,
	className: cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg", className),
	...props
})] }));
AlertDialogContent.displayName = Content2.displayName;
var AlertDialogHeader = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col space-y-2 text-center sm:text-left", className),
	...props
});
AlertDialogHeader.displayName = "AlertDialogHeader";
var AlertDialogFooter = ({ className, ...props }) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	className: cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className),
	...props
});
AlertDialogFooter.displayName = "AlertDialogFooter";
var AlertDialogTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Title2, {
	ref,
	className: cn("text-lg font-semibold", className),
	...props
}));
AlertDialogTitle.displayName = Title2.displayName;
var AlertDialogDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Description2, {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
AlertDialogDescription.displayName = Description2.displayName;
var AlertDialogAction = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Action, {
	ref,
	className: cn(buttonVariants(), className),
	...props
}));
AlertDialogAction.displayName = Action.displayName;
var AlertDialogCancel = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Cancel, {
	ref,
	className: cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className),
	...props
}));
AlertDialogCancel.displayName = Cancel.displayName;
/**
* Exam entry page — shows exam info, password input, then starts the exam.
* After starting, renders the exam runner inline.
*/
function ExamEntryPage() {
	const { examId } = Route.useParams();
	const { t, lang } = useI18n();
	const navigate = useNavigate();
	const call = useServerFn();
	const [phase, setPhase] = (0, import_react.useState)("info");
	const [examInfo, setExamInfo] = (0, import_react.useState)(null);
	const [infoLoading, setInfoLoading] = (0, import_react.useState)(true);
	const [password, setPassword] = (0, import_react.useState)("");
	const [starting, setStarting] = (0, import_react.useState)(false);
	const [view, setView] = (0, import_react.useState)(null);
	const [submittedAttemptId, setSubmittedAttemptId] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		call(getExamInfo, { examId }).then((info) => setExamInfo(info)).catch((e) => toast.error(serverErrorMessage(e, t))).finally(() => setInfoLoading(false));
	}, [examId]);
	async function handleStart() {
		setStarting(true);
		try {
			const v = await call(startExam, {
				examId,
				password
			});
			setView(v);
			setPhase("running");
		} catch (err) {
			const code = err?.message ?? "";
			if (code.includes("wrong-password")) toast.error(t("exam.wrongPassword"));
			else if (code.includes("no-attempts-left")) toast.error(t("exam.noAttemptsLeft"));
			else if (code.includes("not-open")) toast.error(t("exam.notOpen"));
			else toast.error(serverErrorMessage(err, t));
		} finally {
			setStarting(false);
		}
	}
	if (phase === "running" && view) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExamRunner, {
		view,
		onSubmitted: () => {
			setSubmittedAttemptId(view.attempt.id);
			setPhase("submitted");
		},
		onTimeout: () => {
			setSubmittedAttemptId(view.attempt.id);
			setPhase("submitted");
		}
	});
	if (phase === "submitted") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SubmittedScreen, {
		attemptId: submittedAttemptId,
		navigate
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
			className: "mx-auto w-full max-w-2xl px-4 py-12",
			children: infoLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-2/3" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-32 w-full" })]
			}) : examInfo ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardHeader, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					variant: "outline",
					className: "w-fit",
					children: t("common.exam")
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CardTitle, {
					className: "mt-2 text-2xl",
					children: examInfo.title
				}),
				examInfo.description && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-muted-foreground",
					children: examInfo.description
				})
			] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(CardContent, {
				className: "space-y-6",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: t("exam.duration")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [
									examInfo.durationMin,
									" ",
									t("common.minutes")
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: t("common.questions")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: examInfo.questionCount
							})] }),
							examInfo.maxAttempts > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: t("exam.attempts")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: examInfo.maxAttempts
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-muted-foreground",
								children: t("admin.passMark")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-medium",
								children: [examInfo.passMark, "%"]
							})] })
						]
					}),
					examInfo.instructions && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
						className: "mb-2 font-semibold",
						children: t("exam.instructions")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "whitespace-pre-line text-sm text-muted-foreground",
						children: examInfo.instructions
					})] }),
					examInfo.pdfUrl && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "rounded-xl border bg-muted/40 p-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-start gap-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(FileText, { className: "size-5 text-primary" })
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex-1 min-w-0",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-semibold text-sm",
										children: "Exam Paper PDF"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-muted-foreground mt-0.5 truncate",
										children: examInfo.pdfName ?? "exam-paper.pdf"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
									href: examInfo.pdfUrl,
									download: examInfo.pdfName ?? "exam-paper.pdf",
									target: "_blank",
									rel: "noopener noreferrer",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										variant: "outline",
										size: "sm",
										className: "gap-1.5",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4" }), "Download"]
									})
								})
							]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Separator, {}),
					examInfo.hasPassword && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, {
							htmlFor: "pw",
							className: "flex items-center gap-1.5",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "size-4" }),
								" ",
								t("exam.password")
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							id: "pw",
							type: "password",
							placeholder: t("exam.passwordPrompt"),
							value: password,
							onChange: (e) => setPassword(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "w-full",
						size: "lg",
						disabled: starting || examInfo.hasPassword && !password,
						onClick: () => void handleStart(),
						children: starting ? t("common.loading") : t("exam.start")
					})
				]
			})] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleAlert, { className: "size-12 text-destructive" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: t("common.notFound") })]
			})
		})]
	});
}
function ExamRunner({ view, onSubmitted, onTimeout }) {
	const { t, lang } = useI18n();
	const call = useServerFn();
	const [currentIdx, setCurrentIdx] = (0, import_react.useState)(0);
	const [answers, setAnswers] = (0, import_react.useState)({ ...view.attempt.answers });
	const [flagged, setFlagged] = (0, import_react.useState)(/* @__PURE__ */ new Set());
	const [showSubmitDialog, setShowSubmitDialog] = (0, import_react.useState)(false);
	const [submitting, setSubmitting] = (0, import_react.useState)(false);
	const [saving, setSaving] = (0, import_react.useState)(false);
	const [isOnline, setIsOnline] = (0, import_react.useState)(navigator.onLine);
	const [isFullscreen, setIsFullscreen] = (0, import_react.useState)(!!document.fullscreenElement);
	const saveQueue = (0, import_react.useRef)(/* @__PURE__ */ new Map());
	const saveTimer = (0, import_react.useRef)(null);
	const serverNow = view.serverNow;
	view.attempt.startedAt;
	const expiresAt = view.attempt.expiresAt;
	const drift = Date.now() - serverNow;
	const [remaining, setRemaining] = (0, import_react.useState)(expiresAt - (Date.now() - drift));
	(0, import_react.useEffect)(() => {
		const id = setInterval(() => {
			const r = expiresAt - (Date.now() - drift);
			setRemaining(r);
			if (r <= 0) {
				clearInterval(id);
				handleAutoSubmit();
			}
		}, 500);
		return () => clearInterval(id);
	}, [expiresAt, drift]);
	(0, import_react.useEffect)(() => {
		const on = () => {
			setIsOnline(true);
			toast.success(t("exam.online"));
		};
		const off = () => {
			setIsOnline(false);
			toast.warning(t("exam.offline"));
		};
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, [t]);
	(0, import_react.useEffect)(() => {
		const handler = () => setIsFullscreen(!!document.fullscreenElement);
		document.addEventListener("fullscreenchange", handler);
		return () => document.removeEventListener("fullscreenchange", handler);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!view.attempt.requireFullscreen) return;
		const handler = () => {
			if (document.hidden) toast.warning(t("exam.tabWarning"));
		};
		document.addEventListener("visibilitychange", handler);
		return () => document.removeEventListener("visibilitychange", handler);
	}, [view.attempt.requireFullscreen, t]);
	const currentQuestion = view.questions[currentIdx];
	const questionCount = view.questions.length;
	const scheduleAutoSave = (0, import_react.useCallback)((questionId, answer) => {
		saveQueue.current.set(questionId, answer);
		if (saveTimer.current) clearTimeout(saveTimer.current);
		saveTimer.current = setTimeout(async () => {
			if (!isOnline) return;
			const entries = [...saveQueue.current.entries()];
			saveQueue.current.clear();
			setSaving(true);
			for (const [qid, ans] of entries) try {
				await call(saveAnswer, {
					attemptId: view.attempt.id,
					questionId: qid,
					answer: ans
				});
			} catch {}
			setSaving(false);
		}, 1500);
	}, [isOnline, view.attempt.id]);
	function handleAnswer(questionId, answer) {
		setAnswers((prev) => ({
			...prev,
			[questionId]: answer
		}));
		scheduleAutoSave(questionId, answer);
		const q = view.questions.find((x) => x.questionId === questionId);
		if (q && (q.type === "mcq" || q.type === "truefalse")) {
			if (currentIdx < questionCount - 1) setTimeout(() => setCurrentIdx((i) => i + 1), 350);
		}
	}
	async function handleAutoSubmit() {
		try {
			await call(submitExam, { attemptId: view.attempt.id });
		} catch {}
		onTimeout();
	}
	async function handleSubmit() {
		setSubmitting(true);
		try {
			await call(submitExam, { attemptId: view.attempt.id });
			onSubmitted();
		} catch (e) {
			toast.error(serverErrorMessage(e, t));
		} finally {
			setSubmitting(false);
		}
	}
	function toggleFlag() {
		const qid = currentQuestion.questionId;
		setFlagged((prev) => {
			const next = new Set(prev);
			if (next.has(qid)) next.delete(qid);
			else next.add(qid);
			return next;
		});
	}
	const answeredCount = view.questions.filter((q) => answers[q.questionId] !== void 0 && answers[q.questionId] !== "").length;
	const progressPct = Math.round(answeredCount / questionCount * 100);
	const isLowTime = remaining < 3e5;
	const qLabel = lang === "om" ? currentQuestion.textOm : currentQuestion.textEn ?? currentQuestion.textOm;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "sticky top-0 z-40 border-b bg-background/95 backdrop-blur",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm font-medium text-muted-foreground",
						children: view.attempt.examTitle
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ml-auto flex items-center gap-3",
						children: [
							saving && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs text-muted-foreground animate-pulse",
								children: t("exam.saved")
							}),
							!isOnline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(WifiOff, { className: "size-4 text-yellow-500" }),
							isOnline && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Wifi, { className: "size-4 text-green-500" }),
							view.attempt.requireFullscreen && !isFullscreen && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								variant: "outline",
								size: "sm",
								onClick: () => void document.documentElement.requestFullscreen(),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Maximize, { className: "size-4 mr-1" }), t("exam.enterFullscreen")]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: cn("flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-mono font-semibold", isLowTime ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400" : "border-border bg-muted"),
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock3, { className: "size-3.5" }), formatClock(remaining)]
							})
						]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Progress, {
					value: progressPct,
					className: "h-1 rounded-none"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
				className: "mx-auto w-full max-w-4xl flex-1 px-4 py-8",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "grid gap-6 lg:grid-cols-[1fr_240px]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-6",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-muted-foreground",
									children: t("exam.questionOf").replace("{a}", String(currentIdx + 1)).replace("{b}", String(questionCount))
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										children: [
											currentQuestion.points,
											" ",
											t("common.points")
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
										variant: flagged.has(currentQuestion.questionId) ? "secondary" : "ghost",
										size: "sm",
										onClick: toggleFlag,
										"aria-label": t("exam.flag"),
										children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, { className: "size-4" })
									})]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-lg font-medium leading-7 whitespace-pre-line",
								children: qLabel
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(QuestionInput, {
								question: currentQuestion,
								answer: answers[currentQuestion.questionId] ?? "",
								onChange: (ans) => handleAnswer(currentQuestion.questionId, ans),
								lang,
								t
							})
						]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-lg border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-xs font-semibold uppercase text-muted-foreground",
								children: [
									t("exam.answered"),
									" ",
									answeredCount,
									"/",
									questionCount
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-3 grid grid-cols-5 gap-1.5",
								children: view.questions.map((q, i) => {
									const answered = !!(answers[q.questionId] !== void 0 && answers[q.questionId] !== "");
									const isFlag = flagged.has(q.questionId);
									return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										onClick: () => setCurrentIdx(i),
										className: cn("grid size-8 place-items-center rounded text-xs font-medium transition-colors", i === currentIdx ? "bg-primary text-primary-foreground" : answered ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : isFlag ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" : "bg-muted text-muted-foreground hover:bg-accent"),
										"aria-label": `Question ${i + 1}`,
										children: i + 1
									}, q.questionId);
								})
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							variant: "destructive",
							className: "w-full",
							onClick: () => setShowSubmitDialog(true),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, { className: "size-4 mr-2" }), t("exam.submitExam")]
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex items-center justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						disabled: currentIdx === 0 || !view.attempt.allowBackward,
						onClick: () => setCurrentIdx((i) => i - 1),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronLeft, { className: "size-4 mr-1" }), t("common.previous")]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						disabled: currentIdx === questionCount - 1,
						onClick: () => setCurrentIdx((i) => i + 1),
						children: [t("common.next"), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-4 ml-1" })]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialog, {
				open: showSubmitDialog,
				onOpenChange: setShowSubmitDialog,
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogTitle, { children: t("exam.submitExam") }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogDescription, { children: [t("exam.submitConfirm"), answeredCount < questionCount && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "mt-2 block font-medium text-yellow-600 dark:text-yellow-400",
					children: [
						questionCount - answeredCount,
						" ",
						t("exam.unanswered")
					]
				})] })] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(AlertDialogFooter, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogCancel, { children: t("common.cancel") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(AlertDialogAction, {
					onClick: () => void handleSubmit(),
					disabled: submitting,
					children: submitting ? t("common.loading") : t("common.confirm")
				})] })] })
			})
		]
	});
}
function SubmittedScreen({ attemptId, navigate }) {
	const call = useServerFn();
	const [result, setResult] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const { lang } = useI18n();
	const { isStaff } = useAuth();
	(0, import_react.useEffect)(() => {
		if (!attemptId) {
			setLoading(false);
			return;
		}
		const poll = async () => {
			try {
				const r = await call(getMyResult, { attemptId });
				setResult(r);
			} catch {} finally {
				setLoading(false);
			}
		};
		poll();
		const id = setInterval(() => {
			poll();
		}, 1e4);
		return () => clearInterval(id);
	}, [attemptId]);
	const downloadResult = (r) => {
		const lines = [
			"======================================",
			"     OROMIA ACADEMY — EXAM RESULT     ",
			"======================================",
			`Exam      : ${r.examTitle}`,
			`Date      : ${new Date(r.submittedAt ?? Date.now()).toLocaleString()}`,
			"",
			`Score     : ${r.score} / ${r.totalPoints}  (${r.percentage}%)`,
			`Result    : ${r.passed ? "✅ PASSED" : "❌ FAILED"}`,
			"",
			`✓ Correct   : ${r.correctCount}`,
			`✗ Wrong     : ${r.wrongCount}`,
			`- Unanswered: ${r.unansweredCount}`
		];
		if (r.questionReview?.length) {
			lines.push("", "--------------------------------------", "  QUESTION REVIEW", "--------------------------------------");
			r.questionReview.forEach((q, i) => {
				lines.push(``, `Q${i + 1}. ${q.textOm}`);
				lines.push(`   Your answer: ${q.yourAnswer || "—"}`);
				if (q.type === "mcq" || q.type === "truefalse") lines.push(`   Correct:     ${q.correctAnswer}`);
				lines.push(`   Result: ${q.result.toUpperCase()} (${q.earned}/${q.points} pts)`);
			});
		}
		lines.push("", "======================================");
		const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `Result-${r.examTitle.replace(/\s+/g, "_")}-${(attemptId ?? "").slice(0, 8)}.txt`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};
	if (loading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "text-center space-y-4",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "mx-auto size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-muted-foreground",
				children: "Loading your result..."
			})]
		})
	});
	const isPublished = result && "passed" in result;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SiteHeader, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-2xl px-4 py-12",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: cn("rounded-2xl p-8 text-center mb-6", isPublished ? result.passed ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800" : "bg-muted border"),
					children: isPublished ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						result.passed ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trophy, { className: "mx-auto size-16 text-green-500 mb-4" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "mx-auto size-16 text-red-500 mb-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: result.passed ? "🎉 You Passed!" : "Better luck next time"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-4xl font-bold tabular-nums",
							children: [result.percentage, "%"]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: [
								result.score,
								" / ",
								result.totalPoints,
								" points"
							]
						})
					] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "mx-auto size-16 text-primary mb-4" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl font-bold",
							children: "Exam Submitted!"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-muted-foreground",
							children: "Your exam has been received. Results will be published when the instructor is ready."
						})
					] })
				}),
				isPublished && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-3 gap-3 mb-6",
					children: [
						{
							label: "Correct",
							value: result.correctCount,
							color: "text-green-600"
						},
						{
							label: "Wrong",
							value: result.wrongCount,
							color: "text-red-600"
						},
						{
							label: "Unanswered",
							value: result.unansweredCount,
							color: "text-yellow-600"
						}
					].map(({ label, value, color }) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "rounded-xl border bg-card p-4 text-center",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: cn("text-2xl font-bold", color),
							children: value
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground mt-1",
							children: label
						})]
					}, label))
				}),
				isPublished && result.feedback && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 rounded-xl border bg-card p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-semibold mb-1",
						children: "Instructor Feedback"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted-foreground",
						children: result.feedback
					})]
				}),
				isPublished && result.questionReview?.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mb-6 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
						className: "font-semibold text-base flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-4 text-primary" }), "Question Review"]
					}), result.questionReview.map((qr, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: cn("rounded-xl border p-4 space-y-2", qr.result === "correct" ? "border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-800" : qr.result === "wrong" ? "border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-800" : qr.result === "partial" ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800" : "border-muted"),
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-start gap-2",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs text-muted-foreground font-mono shrink-0 mt-1",
										children: [
											"Q",
											i + 1,
											"."
										]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium flex-1",
										children: lang === "om" ? qr.textOm : qr.textEn ?? qr.textOm
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: cn("text-xs font-semibold shrink-0", qr.result === "correct" ? "text-green-600" : qr.result === "wrong" ? "text-red-600" : qr.result === "partial" ? "text-amber-600" : "text-muted-foreground"),
										children: [
											qr.earned,
											"/",
											qr.points,
											"pt"
										]
									})
								]
							}),
							qr.type === "mcq" && qr.options.length > 0 && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-5 space-y-1",
								children: qr.options.map((opt) => {
									const isYours = qr.yourAnswer === opt.id;
									const isCorrect = qr.correctAnswer === opt.id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm", isCorrect ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium" : isYours ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : "text-muted-foreground"),
										children: [
											isCorrect ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-3.5 text-green-600 shrink-0" }) : isYours ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "size-3.5 text-red-600 shrink-0" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "size-3.5 shrink-0" }),
											lang === "om" ? opt.textOm : opt.textEn ?? opt.textOm,
											isYours && !isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-auto text-xs",
												children: "← your answer"
											}),
											isCorrect && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-auto text-xs",
												children: "✓ correct"
											})
										]
									}, opt.id);
								})
							}),
							qr.type === "truefalse" && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "ml-5 flex gap-3 text-sm",
								children: ["true", "false"].map((v) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: cn("rounded-lg px-3 py-1 capitalize", qr.correctAnswer === v ? "bg-green-100 dark:bg-green-900/30 text-green-800 font-medium" : qr.yourAnswer === v ? "bg-red-100 dark:bg-red-900/30 text-red-800" : "bg-muted"),
									children: [
										v,
										qr.correctAnswer === v && " ✓",
										qr.yourAnswer === v && qr.correctAnswer !== v && " ✗"
									]
								}, v))
							}),
							(qr.type === "short" || qr.type === "essay") && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "ml-5 space-y-1.5 text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Your answer: "
								}), qr.yourAnswer || "—"] }), qr.correctAnswer && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted-foreground",
									children: "Expected: "
								}), qr.correctAnswer] })]
							})
						]
					}, qr.questionId))]
				}) : null,
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap gap-3 justify-center",
					children: [isPublished && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						variant: "outline",
						onClick: () => downloadResult(result),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Download, { className: "size-4 mr-2" }), "Download Result"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => void navigate({ to: isStaff ? "/admin" : "/dashboard" }),
						children: isStaff ? "Back to Admin Panel" : "Back to Dashboard"
					})]
				})
			]
		})]
	});
}
function QuestionInput({ question, answer, onChange, lang, t }) {
	if (question.type === "mcq") {
		const letters = [
			"A",
			"B",
			"C",
			"D",
			"E",
			"F"
		];
		return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-3",
			children: question.options.map((opt, i) => {
				const label = lang === "om" ? opt.textOm : opt.textEn ?? opt.textOm;
				const selected = answer === opt.id;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => onChange(opt.id),
					className: cn("w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", selected ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/40"),
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold transition-colors", selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"),
							children: letters[i] ?? String(i + 1)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: cn("flex-1 text-base leading-snug", selected && "font-medium"),
							children: label
						}),
						selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary shrink-0" })
					]
				}, opt.id);
			})
		});
	}
	if (question.type === "truefalse") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex gap-4",
		children: [{
			value: "true",
			label: t("exam.true"),
			emoji: "✅"
		}, {
			value: "false",
			label: t("exam.false"),
			emoji: "❌"
		}].map(({ value, label, emoji }) => {
			const selected = answer === value;
			return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => onChange(value),
				className: cn("flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary", selected ? "border-primary bg-primary/10 shadow-md scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-accent/40"),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-3xl",
						children: emoji
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: cn("text-base font-semibold", selected && "text-primary"),
						children: label
					}),
					selected && /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "size-5 text-primary" })
				]
			}, value);
		})
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
		value: answer,
		onChange: (e) => onChange(e.target.value),
		placeholder: t("exam.typeAnswer"),
		className: "min-h-32 resize-y",
		rows: question.type === "essay" ? 8 : 3
	});
}
//#endregion
export { ExamEntryPage as component };
