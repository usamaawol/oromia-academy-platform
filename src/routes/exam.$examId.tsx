/**
 * Exam entry page — shows exam info, password input, then starts the exam.
 * After starting, renders the exam runner inline.
 */
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Flag,
  Lock,
  Maximize,
  Send,
  Wifi,
  WifiOff,
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
import { getExamInfo, startExam, saveAnswer, submitExam } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { AttemptView, PublicQuestion } from "@/lib/schema";
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
        onSubmitted={() => setPhase("submitted")}
        onTimeout={() => setPhase("submitted")}
      />
    );
  }

  if (phase === "submitted") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="max-w-md text-center">
          <CheckCircle2 className="mx-auto size-16 text-green-500" />
          <h1 className="mt-4 text-2xl font-bold">{t("exam.submitted")}</h1>
          <p className="mt-2 text-muted-foreground">{t("result.pending")}</p>
          <Button className="mt-6" onClick={() => void navigate({ to: "/dashboard" })}>
            {t("nav.dashboard")}
          </Button>
        </div>
      </div>
    );
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
    return (
      <RadioGroup value={answer} onValueChange={onChange} className="space-y-3">
        {question.options.map((opt) => {
          const label = lang === "om" ? opt.textOm : (opt.textEn ?? opt.textOm);
          return (
            <div
              key={opt.id}
              className={cn(
                "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                answer === opt.id ? "border-primary bg-primary/5" : "hover:bg-accent/50",
              )}
              onClick={() => onChange(opt.id)}
            >
              <RadioGroupItem value={opt.id} id={opt.id} />
              <Label htmlFor={opt.id} className="cursor-pointer flex-1">
                {label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    );
  }

  if (question.type === "truefalse") {
    return (
      <RadioGroup value={answer} onValueChange={onChange} className="flex gap-4">
        {[
          { value: "true", label: t("exam.true") },
          { value: "false", label: t("exam.false") },
        ].map(({ value, label }) => (
          <div
            key={value}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-lg border p-4 cursor-pointer transition-colors",
              answer === value ? "border-primary bg-primary/5" : "hover:bg-accent/50",
            )}
            onClick={() => onChange(value)}
          >
            <RadioGroupItem value={value} id={`tf-${value}`} />
            <Label htmlFor={`tf-${value}`} className="cursor-pointer text-base font-medium">
              {label}
            </Label>
          </div>
        ))}
      </RadioGroup>
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
