/**
 * Exam entry page — shows exam info, password input, then starts the exam.
 * After starting, renders the exam runner inline.
 */
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Download,
  FileText,
  Flag,
  Lock,
  Maximize,
  Send,
  Trophy,
  Wifi,
  WifiOff,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, type TranslationKey } from "@/i18n";
import { formatClock } from "@/lib/exam-engine";
import { getExamInfo, startExam, saveAnswer, submitExam, getMyResult } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { AttemptView, PublicQuestion, ResultView } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/exam/$examId")({
  component: ExamEntryPage,
});

type Phase = "info" | "running" | "submitted";

function ExamEntryPage() {
  const { examId } = Route.useParams();
  const { t, lang } = useI18n();
  const navigate = useNavigate();
  const call = useServerFn();

  const [phase, setPhase] = useState<Phase>("info");
  const [examInfo, setExamInfo] = useState<Awaited<ReturnType<typeof getExamInfo>> | null>(null);
  const [infoLoading, setInfoLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [starting, setStarting] = useState(false);
  const [view, setView] = useState<AttemptView | null>(null);
  const [submittedAttemptId, setSubmittedAttemptId] = useState<string | null>(null);

  useEffect(() => {
    void call(getExamInfo, { examId })
      .then((info) => setExamInfo(info as Parameters<typeof setExamInfo>[0] | null))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setInfoLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [examId]);

  async function handleStart() {
    setStarting(true);
    try {
      const v = await call(startExam, { examId, password });
      setView(v as AttemptView);
      setPhase("running");
    } catch (err: unknown) {
      const code = (err as { message?: string })?.message ?? "";
      if (code.includes("wrong-password")) toast.error(t("exam.wrongPassword"));
      else if (code.includes("no-attempts-left")) toast.error(t("exam.noAttemptsLeft"));
      else if (code.includes("not-open")) toast.error(t("exam.notOpen"));
      else toast.error(serverErrorMessage(err, t));
    } finally {
      setStarting(false);
    }
  }

  if (phase === "running" && view) {
    return (
      <ExamRunner
        view={view}
        onSubmitted={() => { setSubmittedAttemptId(view.attempt.id); setPhase("submitted"); }}
        onTimeout={() => { setSubmittedAttemptId(view.attempt.id); setPhase("submitted"); }}
      />
    );
  }

  if (phase === "submitted") {
    return <SubmittedScreen attemptId={submittedAttemptId} navigate={navigate} />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        {infoLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : examInfo ? (
          <Card>
            <CardHeader>
              <Badge variant="outline" className="w-fit">
                {t("common.exam")}
              </Badge>
              <CardTitle className="mt-2 text-2xl">{examInfo.title}</CardTitle>
              {examInfo.description && (
                <p className="text-muted-foreground">{examInfo.description}</p>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4 text-sm">
                <div>
                  <span className="text-muted-foreground">{t("exam.duration")}</span>
                  <p className="font-medium">
                    {examInfo.durationMin} {t("common.minutes")}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">{t("common.questions")}</span>
                  <p className="font-medium">{examInfo.questionCount}</p>
                </div>
                {examInfo.maxAttempts > 0 && (
                  <div>
                    <span className="text-muted-foreground">{t("exam.attempts")}</span>
                    <p className="font-medium">{examInfo.maxAttempts}</p>
                  </div>
                )}
                <div>
                  <span className="text-muted-foreground">{t("admin.passMark")}</span>
                  <p className="font-medium">{examInfo.passMark}%</p>
                </div>
              </div>

              {/* Instructions */}
              {examInfo.instructions && (
                <div>
                  <h3 className="mb-2 font-semibold">{t("exam.instructions")}</h3>
                  <p className="whitespace-pre-line text-sm text-muted-foreground">
                    {examInfo.instructions}
                  </p>
                </div>
              )}

              {/* Exam Paper PDF */}
              {(examInfo as { pdfUrl?: string; pdfName?: string }).pdfUrl && (
                <div className="rounded-xl border bg-muted/40 p-4">
                  <div className="flex items-start gap-3">
                    <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                      <FileText className="size-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm">Exam Paper PDF</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {(examInfo as { pdfUrl?: string; pdfName?: string }).pdfName ?? "exam-paper.pdf"}
                      </p>
                    </div>
                    <a
                      href={(examInfo as { pdfUrl?: string; pdfName?: string }).pdfUrl}
                      download={(examInfo as { pdfUrl?: string; pdfName?: string }).pdfName ?? "exam-paper.pdf"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <Download className="size-4" />
                        Download
                      </Button>
                    </a>
                  </div>
                </div>
              )}

              <Separator />

              {/* Password */}
              {examInfo.hasPassword && (
                <div className="space-y-2">
                  <Label htmlFor="pw" className="flex items-center gap-1.5">
                    <Lock className="size-4" /> {t("exam.password")}
                  </Label>
                  <Input
                    id="pw"
                    type="password"
                    placeholder={t("exam.passwordPrompt")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                disabled={starting || (examInfo.hasPassword && !password)}
                onClick={() => void handleStart()}
              >
                {starting ? t("common.loading") : t("exam.start")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <AlertCircle className="size-12 text-destructive" />
            <p>{t("common.notFound")}</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Exam Runner
// ---------------------------------------------------------------------------

function ExamRunner({
  view,
  onSubmitted,
  onTimeout,
}: {
  view: AttemptView;
  onSubmitted: () => void;
  onTimeout: () => void;
}) {
  const { t, lang } = useI18n();
  const call = useServerFn();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({ ...view.attempt.answers });
  const [flagged, setFlagged] = useState<Set<string>>(new Set());
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isFullscreen, setIsFullscreen] = useState(!!document.fullscreenElement);
  const saveQueue = useRef<Map<string, string>>(new Map());
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const serverNow = view.serverNow;
  const startedAt = view.attempt.startedAt;
  const expiresAt = view.attempt.expiresAt;
  const drift = Date.now() - serverNow;
  const [remaining, setRemaining] = useState(expiresAt - (Date.now() - drift));

  // Countdown
  useEffect(() => {
    const id = setInterval(() => {
      const r = expiresAt - (Date.now() - drift);
      setRemaining(r);
      if (r <= 0) {
        clearInterval(id);
        void handleAutoSubmit();
      }
    }, 500);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expiresAt, drift]);

  // Online/offline tracking
  useEffect(() => {
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

  // Fullscreen change
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  // Tab visibility
  useEffect(() => {
    if (!view.attempt.requireFullscreen) return;
    const handler = () => {
      if (document.hidden) toast.warning(t("exam.tabWarning"));
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [view.attempt.requireFullscreen, t]);

  const currentQuestion: PublicQuestion = view.questions[currentIdx]!;
  const questionCount = view.questions.length;

  // Debounced auto-save
  const scheduleAutoSave = useCallback(
    (questionId: string, answer: string) => {
      saveQueue.current.set(questionId, answer);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(async () => {
        if (!isOnline) return;
        const entries = [...saveQueue.current.entries()];
        saveQueue.current.clear();
        setSaving(true);
        for (const [qid, ans] of entries) {
          try {
            await call(saveAnswer, {
              attemptId: view.attempt.id,
              questionId: qid,
              answer: ans,
            });
          } catch {
            /* offline — answer stays local */
          }
        }
        setSaving(false);
      }, 1500);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOnline, view.attempt.id],
  );

  function handleAnswer(questionId: string, answer: string) {
    setAnswers((prev: Record<string, string>) => ({ ...prev, [questionId]: answer }));
    scheduleAutoSave(questionId, answer);
    // Auto-advance for MCQ and true/false after a short delay so the
    // selection highlight is visible before moving on.
    const q = view.questions.find((x) => x.questionId === questionId);
    if (q && (q.type === "mcq" || q.type === "truefalse")) {
      if (currentIdx < questionCount - 1) {
        setTimeout(() => setCurrentIdx((i: number) => i + 1), 350);
      }
    }
  }

  async function handleAutoSubmit() {
    try {
      await call(submitExam, { attemptId: view.attempt.id });
    } catch {
      /* ignore — expired on server too */
    }
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
    setFlagged((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(qid)) next.delete(qid);
      else next.add(qid);
      return next;
    });
  }

  const answeredCount = view.questions.filter(
    (q) => answers[q.questionId] !== undefined && answers[q.questionId] !== "",
  ).length;
  const progressPct = Math.round((answeredCount / questionCount) * 100);
  const isLowTime = remaining < 5 * 60 * 1000;

  const qLabel =
    lang === "om" ? currentQuestion.textOm : (currentQuestion.textEn ?? currentQuestion.textOm);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header bar */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-3 px-4">
          <span className="text-sm font-medium text-muted-foreground">
            {view.attempt.examTitle}
          </span>
          <div className="ml-auto flex items-center gap-3">
            {saving && (
              <span className="text-xs text-muted-foreground animate-pulse">{t("exam.saved")}</span>
            )}
            {!isOnline && <WifiOff className="size-4 text-yellow-500" />}
            {isOnline && <Wifi className="size-4 text-green-500" />}
            {view.attempt.requireFullscreen && !isFullscreen && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => void document.documentElement.requestFullscreen()}
              >
                <Maximize className="size-4 mr-1" />
                {t("exam.enterFullscreen")}
              </Button>
            )}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-mono font-semibold",
                isLowTime
                  ? "border-red-300 bg-red-50 text-red-600 dark:border-red-800 dark:bg-red-950 dark:text-red-400"
                  : "border-border bg-muted",
              )}
            >
              <Clock3 className="size-3.5" />
              {formatClock(remaining)}
            </div>
          </div>
        </div>
        <Progress value={progressPct} className="h-1 rounded-none" />
      </div>

      {/* Main */}
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          {/* Question card */}
          <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                {t("exam.questionOf")
                  .replace("{a}", String(currentIdx + 1))
                  .replace("{b}", String(questionCount))}
              </p>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {currentQuestion.points} {t("common.points")}
                </Badge>
                <Button
                  variant={flagged.has(currentQuestion.questionId) ? "secondary" : "ghost"}
                  size="sm"
                  onClick={toggleFlag}
                  aria-label={t("exam.flag")}
                >
                  <Flag className="size-4" />
                </Button>
              </div>
            </div>

            <p className="text-lg font-medium leading-7 whitespace-pre-line">{qLabel}</p>

            <QuestionInput
              question={currentQuestion}
              answer={answers[currentQuestion.questionId] ?? ""}
              onChange={(ans) => handleAnswer(currentQuestion.questionId, ans)}
              lang={lang}
              t={t}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                {t("exam.answered")} {answeredCount}/{questionCount}
              </p>
              <div className="mt-3 grid grid-cols-5 gap-1.5">
                {view.questions.map((q, i) => {
                  const answered = !!(
                    answers[q.questionId] !== undefined && answers[q.questionId] !== ""
                  );
                  const isFlag = flagged.has(q.questionId);
                  const isCurrent = i === currentIdx;
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => setCurrentIdx(i)}
                      className={cn(
                        "grid size-8 place-items-center rounded text-xs font-medium transition-colors",
                        isCurrent
                          ? "bg-primary text-primary-foreground"
                          : answered
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : isFlag
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-muted text-muted-foreground hover:bg-accent",
                      )}
                      aria-label={`Question ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              variant="destructive"
              className="w-full"
              onClick={() => setShowSubmitDialog(true)}
            >
              <Send className="size-4 mr-2" />
              {t("exam.submitExam")}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="outline"
            disabled={currentIdx === 0 || !view.attempt.allowBackward}
            onClick={() => setCurrentIdx((i: number) => i - 1)}
          >
            <ChevronLeft className="size-4 mr-1" />
            {t("common.previous")}
          </Button>
          <Button
            disabled={currentIdx === questionCount - 1}
            onClick={() => setCurrentIdx((i: number) => i + 1)}
          >
            {t("common.next")}
            <ChevronRight className="size-4 ml-1" />
          </Button>
        </div>
      </main>

      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("exam.submitExam")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("exam.submitConfirm")}
              {answeredCount < questionCount && (
                <span className="mt-2 block font-medium text-yellow-600 dark:text-yellow-400">
                  {questionCount - answeredCount} {t("exam.unanswered")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => void handleSubmit()} disabled={submitting}>
              {submitting ? t("common.loading") : t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Submitted / Result screen
// ---------------------------------------------------------------------------

function SubmittedScreen({
  attemptId,
  navigate,
}: {
  attemptId: string | null;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const call = useServerFn();
  const [result, setResult] = useState<ResultView | { published: false } | null>(null);
  const [loading, setLoading] = useState(true);
  const { lang } = useI18n();
  const { isStaff } = useAuth();

  useEffect(() => {
    if (!attemptId) { setLoading(false); return; }
    const poll = async () => {
      try {
        const r = await call(getMyResult, { attemptId });
        setResult(r as ResultView | { published: false });
      } catch {
        // not yet available
      } finally {
        setLoading(false);
      }
    };
    void poll();
    // Poll every 10s in case results are pending
    const id = setInterval(() => { void poll(); }, 10000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  const downloadResult = (r: ResultView) => {
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
      `- Unanswered: ${r.unansweredCount}`,
    ];

    if (r.questionReview?.length) {
      lines.push("", "--------------------------------------", "  QUESTION REVIEW", "--------------------------------------");
      r.questionReview.forEach((q, i) => {
        lines.push(``, `Q${i + 1}. ${q.textOm}`);
        lines.push(`   Your answer: ${q.yourAnswer || "—"}`);
        if (q.type === "mcq" || q.type === "truefalse") {
          lines.push(`   Correct:     ${q.correctAnswer}`);
        }
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="mx-auto size-16 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your result...</p>
        </div>
      </div>
    );
  }

  const isPublished = result && "passed" in result;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        {/* Hero */}
        <div className={cn(
          "rounded-2xl p-8 text-center mb-6",
          isPublished
            ? ((result as ResultView).passed ? "bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800" : "bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800")
            : "bg-muted border",
        )}>
          {isPublished ? (
            <>
              {(result as ResultView).passed ? (
                <Trophy className="mx-auto size-16 text-green-500 mb-4" />
              ) : (
                <XCircle className="mx-auto size-16 text-red-500 mb-4" />
              )}
              <h1 className="text-2xl font-bold">
                {(result as ResultView).passed ? "🎉 You Passed!" : "Better luck next time"}
              </h1>
              <p className="mt-1 text-4xl font-bold tabular-nums">
                {(result as ResultView).percentage}%
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {(result as ResultView).score} / {(result as ResultView).totalPoints} points
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="mx-auto size-16 text-primary mb-4" />
              <h1 className="text-2xl font-bold">Exam Submitted!</h1>
              <p className="mt-2 text-muted-foreground">
                Your exam has been received. Results will be published when the instructor is ready.
              </p>
            </>
          )}
        </div>

        {/* Stats cards */}
        {isPublished && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Correct", value: (result as ResultView).correctCount, color: "text-green-600" },
              { label: "Wrong", value: (result as ResultView).wrongCount, color: "text-red-600" },
              { label: "Unanswered", value: (result as ResultView).unansweredCount, color: "text-yellow-600" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl border bg-card p-4 text-center">
                <p className={cn("text-2xl font-bold", color)}>{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Feedback */}
        {isPublished && (result as ResultView).feedback && (
          <div className="mb-6 rounded-xl border bg-card p-4">
            <p className="text-sm font-semibold mb-1">Instructor Feedback</p>
            <p className="text-sm text-muted-foreground">{(result as ResultView).feedback}</p>
          </div>
        )}

        {/* Question review */}
        {isPublished && (result as ResultView).questionReview?.length ? (
          <div className="mb-6 space-y-3">
            <h2 className="font-semibold text-base flex items-center gap-2">
              <CheckCircle2 className="size-4 text-primary" />
              Question Review
            </h2>
            {(result as ResultView).questionReview!.map((qr, i) => (
              <div key={qr.questionId} className={cn(
                "rounded-xl border p-4 space-y-2",
                qr.result === "correct" ? "border-green-200 bg-green-50/50 dark:bg-green-950/10 dark:border-green-800" :
                qr.result === "wrong" ? "border-red-200 bg-red-50/50 dark:bg-red-950/10 dark:border-red-800" :
                qr.result === "partial" ? "border-amber-200 bg-amber-50/50 dark:bg-amber-950/10 dark:border-amber-800" :
                "border-muted",
              )}>
                <div className="flex items-start gap-2">
                  <span className="text-xs text-muted-foreground font-mono shrink-0 mt-1">Q{i + 1}.</span>
                  <p className="text-sm font-medium flex-1">
                    {lang === "om" ? qr.textOm : (qr.textEn ?? qr.textOm)}
                  </p>
                  <span className={cn("text-xs font-semibold shrink-0",
                    qr.result === "correct" ? "text-green-600" :
                    qr.result === "wrong" ? "text-red-600" :
                    qr.result === "partial" ? "text-amber-600" : "text-muted-foreground",
                  )}>
                    {qr.earned}/{qr.points}pt
                  </span>
                </div>
                {qr.type === "mcq" && qr.options.length > 0 && (
                  <div className="ml-5 space-y-1">
                    {qr.options.map((opt) => {
                      const isYours = qr.yourAnswer === opt.id;
                      const isCorrect = qr.correctAnswer === opt.id;
                      return (
                        <div key={opt.id} className={cn("flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm",
                          isCorrect ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium" :
                          isYours ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" :
                          "text-muted-foreground",
                        )}>
                          {isCorrect ? <CheckCircle2 className="size-3.5 text-green-600 shrink-0" /> :
                           isYours ? <XCircle className="size-3.5 text-red-600 shrink-0" /> :
                           <span className="size-3.5 shrink-0" />}
                          {lang === "om" ? opt.textOm : (opt.textEn ?? opt.textOm)}
                          {isYours && !isCorrect && <span className="ml-auto text-xs">← your answer</span>}
                          {isCorrect && <span className="ml-auto text-xs">✓ correct</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
                {qr.type === "truefalse" && (
                  <div className="ml-5 flex gap-3 text-sm">
                    {["true", "false"].map((v) => (
                      <span key={v} className={cn("rounded-lg px-3 py-1 capitalize",
                        qr.correctAnswer === v ? "bg-green-100 dark:bg-green-900/30 text-green-800 font-medium" :
                        qr.yourAnswer === v ? "bg-red-100 dark:bg-red-900/30 text-red-800" : "bg-muted",
                      )}>
                        {v}
                        {qr.correctAnswer === v && " ✓"}
                        {qr.yourAnswer === v && qr.correctAnswer !== v && " ✗"}
                      </span>
                    ))}
                  </div>
                )}
                {(qr.type === "short" || qr.type === "essay") && (
                  <div className="ml-5 space-y-1.5 text-sm">
                    <p><span className="text-muted-foreground">Your answer: </span>{qr.yourAnswer || "—"}</p>
                    {qr.correctAnswer && <p><span className="text-muted-foreground">Expected: </span>{qr.correctAnswer}</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {/* Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          {isPublished && (
            <Button variant="outline" onClick={() => downloadResult(result as ResultView)}>
              <Download className="size-4 mr-2" />
              Download Result
            </Button>
          )}
          <Button onClick={() => void navigate({ to: isStaff ? "/admin" : "/dashboard" } as { to: "/admin" | "/dashboard" })}>
            {isStaff ? "Back to Admin Panel" : "Back to Dashboard"}
          </Button>
        </div>
      </main>
    </div>
  );
}

function QuestionInput({
  question,
  answer,
  onChange,
  lang,
  t,
}: {
  question: PublicQuestion;
  answer: string;
  onChange: (a: string) => void;
  lang: "om" | "en";
  t: (k: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  if (question.type === "mcq") {
    const letters = ["A", "B", "C", "D", "E", "F"];
    return (
      <div className="space-y-3">
        {question.options.map((opt, i) => {
          const label = lang === "om" ? opt.textOm : (opt.textEn ?? opt.textOm);
          const selected = answer === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.id)}
              className={cn(
                "w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-accent/40",
              )}
            >
              <span className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl text-sm font-bold transition-colors",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}>
                {letters[i] ?? String(i + 1)}
              </span>
              <span className={cn("flex-1 text-base leading-snug", selected && "font-medium")}>
                {label}
              </span>
              {selected && (
                <CheckCircle2 className="size-5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (question.type === "truefalse") {
    return (
      <div className="flex gap-4">
        {[
          { value: "true",  label: t("exam.true"),  emoji: "✅" },
          { value: "false", label: t("exam.false"), emoji: "❌" },
        ].map(({ value, label, emoji }) => {
          const selected = answer === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-2 rounded-2xl border-2 py-6 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected
                  ? "border-primary bg-primary/10 shadow-md scale-[1.01]"
                  : "border-border hover:border-primary/50 hover:bg-accent/40",
              )}
            >
              <span className="text-3xl">{emoji}</span>
              <span className={cn("text-base font-semibold", selected && "text-primary")}>{label}</span>
              {selected && <CheckCircle2 className="size-5 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  // Short / Essay
  return (
    <Textarea
      value={answer}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t("exam.typeAnswer")}
      className="min-h-32 resize-y"
      rows={question.type === "essay" ? 8 : 3}
    />
  );
}
