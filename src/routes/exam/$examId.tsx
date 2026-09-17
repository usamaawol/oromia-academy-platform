import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, Clock3, Loader2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, localized } from "@/i18n";
import { useAuth } from "@/lib/auth";
import {
  createAttempt,
  getExam,
  getQuestionsByIds,
  listAttemptsForStudent,
  serverNow,
  updateAttempt,
} from "@/lib/data";
import {
  autoGrade,
  buildPresentation,
  finalizeScores,
  formatClock,
  isExamOpenForStudents,
} from "@/lib/exam-engine";
import type { Attempt, Exam, Question } from "@/lib/types";

export const Route = createFileRoute("/exam/$examId")({
  validateSearch: (search: Record<string, unknown>) => ({
    preview: search["preview"] === true || search["preview"] === "true",
  }),
  component: ExamPage,
});

function ExamPage() {
  const { t, lang } = useI18n();
  const { examId } = Route.useParams();
  const { preview } = Route.useSearch();
  const { profile, loading: authLoading, isStaff } = useAuth();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [myAttempts, setMyAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState("");
  const [starting, setStarting] = useState(false);
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [index, setIndex] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [submitting, setSubmitting] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submittedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const e = await getExam(examId).catch(() => null);
      if (cancelled) return;
      setExam(e);
      if (e) setQuestions(await getQuestionsByIds(e.questionIds).catch(() => []));
      if (profile) {
        const attempts = await listAttemptsForStudent(profile.id).catch(() => [] as Attempt[]);
        if (cancelled) return;
        setMyAttempts(attempts.filter((a) => a.examId === examId));
      }
      setLoading(false);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [examId, profile]);

  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [attempt]);

  const submit = useCallback(
    async (auto = false) => {
      if (!attempt || submittedRef.current) return;
      submittedRef.current = true;
      setSubmitting(true);
      try {
        const graded = autoGrade(attempt.presented, questions, answers);
        const base: Attempt = {
          ...attempt,
          answers,
          ...graded,
          submittedAt: Date.now(),
          status: "submitted",
        };
        const { percentage, passed } = finalizeScores(base, exam?.passMark ?? 50);
        const published =
          exam?.resultPolicy === "immediate" && !graded.needsManualGrading ? true : false;
        const finalAttempt: Attempt = { ...base, percentage, passed, published };
        if (!preview) {
          await updateAttempt(attempt.id, {
            answers,
            autoScore: graded.autoScore,
            totalPoints: graded.totalPoints,
            correctCount: graded.correctCount,
            wrongCount: graded.wrongCount,
            unansweredCount: graded.unansweredCount,
            needsManualGrading: graded.needsManualGrading,
            submittedAt: finalAttempt.submittedAt as number,
            status: "submitted",
            percentage,
            passed,
            published,
          });
        }
        setAttempt(finalAttempt);
        toast.success(auto ? t("exam.autoSubmitted") : t("exam.submitted"));
      } catch {
        submittedRef.current = false;
        toast.error(t("common.error"));
      } finally {
        setSubmitting(false);
      }
    },
    [attempt, answers, questions, exam, preview, t],
  );

  // auto-submit when the timer runs out
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress") return;
    if (now >= attempt.expiresAt) void submit(true);
  }, [now, attempt, submit]);

  // debounced auto-save
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || preview) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void updateAttempt(attempt.id, { answers }).catch(() => undefined);
    }, 1200);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [answers, attempt, preview]);

  // tab-switch tracking
  useEffect(() => {
    if (!attempt || attempt.status !== "in_progress" || preview || !exam?.trackTabs) return;
    function onHide() {
      if (document.visibilityState !== "hidden" || !attempt) return;
      const event = { type: "tab" as const, at: Date.now() };
      const events = [...attempt.events, event];
      setAttempt({ ...attempt, events });
      void updateAttempt(attempt.id, { events }).catch(() => undefined);
      toast.warning(t("exam.tabWarning"));
    }
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [attempt, exam, preview, t]);

  const attemptsUsed = myAttempts.filter((a) => a.status !== "in_progress").length;
  const inProgress = myAttempts.find((a) => a.status === "in_progress") ?? null;
  const attemptsLeft =
    exam && exam.maxAttempts > 0 ? Math.max(0, exam.maxAttempts - attemptsUsed) : Infinity;

  async function start(resume: Attempt | null) {
    if (!exam) return;
    if (!preview && exam.password && password.trim() !== exam.password) {
      toast.error(t("exam.wrongPassword"));
      return;
    }
    setStarting(true);
    try {
      if (resume) {
        setAttempt(resume);
        setAnswers(resume.answers);
        return;
      }
      const startedAt = await serverNow();
      const seed = `${exam.id}:${profile?.id ?? "preview"}:${attemptsUsed + 1}`;
      const presented = buildPresentation(exam, questions, seed);
      const draft: Omit<Attempt, "id"> = {
        examId: exam.id,
        examTitle: exam.title,
        courseId: exam.courseId,
        studentId: profile?.id ?? "preview",
        studentName: profile?.fullName ?? "Preview",
        attemptNumber: attemptsUsed + 1,
        startedAt,
        serverStartedAt: startedAt,
        expiresAt: startedAt + exam.durationMin * 60_000,
        presented,
        answers: {},
        status: "in_progress",
        autoScore: 0,
        manualScore: 0,
        totalPoints: 0,
        correctCount: 0,
        wrongCount: 0,
        unansweredCount: 0,
        percentage: 0,
        passed: false,
        needsManualGrading: false,
        events: [],
        published: false,
      };
      const id = preview ? "preview" : await createAttempt(draft);
      setAttempt({ ...draft, id });
      setAnswers({});
      setIndex(0);
      submittedRef.current = false;
    } catch {
      toast.error(t("common.error"));
    } finally {
      setStarting(false);
    }
  }

  const byId = useMemo(() => new Map(questions.map((q) => [q.id, q])), [questions]);

  if (authLoading || loading) {
    return (
      <Shell>
        <p className="py-20 text-center text-muted-foreground">
          <Loader2 className="mx-auto mb-2 size-5 animate-spin" />
          {t("common.loading")}
        </p>
      </Shell>
    );
  }

  if (!exam) {
    return (
      <Shell>
        <Notice title={t("common.notFound")} />
      </Shell>
    );
  }

  if (!profile && !preview) {
    return (
      <Shell>
        <Notice title={t("auth.loginTitle")}>
          <Button asChild>
            <Link to="/auth">{t("nav.login")}</Link>
          </Button>
        </Notice>
      </Shell>
    );
  }

  if (preview && !isStaff) {
    return (
      <Shell>
        <Notice title={t("admin.noPermission")} />
      </Shell>
    );
  }

  // ----- exam finished -----
  if (attempt && attempt.status !== "in_progress") {
    const visible = preview || attempt.published || exam.resultsPublished;
    return (
      <Shell>
        <div className="mx-auto max-w-lg rounded-lg border bg-card p-8 text-center">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          {visible ? (
            <>
              <p className="mt-6 text-5xl font-bold">{attempt.percentage}%</p>
              <p className="mt-2 text-muted-foreground">
                {attempt.autoScore + attempt.manualScore} / {attempt.totalPoints}{" "}
                {t("common.points")}
              </p>
              <p className="mt-2 font-semibold">
                {attempt.passed ? t("result.passed") : t("result.failed")}
              </p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
                <Stat label={t("result.correct")} value={attempt.correctCount} />
                <Stat label={t("result.wrong")} value={attempt.wrongCount} />
                <Stat label={t("result.unanswered")} value={attempt.unansweredCount} />
              </div>
              {attempt.needsManualGrading ? (
                <p className="mt-4 text-sm text-muted-foreground">{t("result.pending")}</p>
              ) : null}
            </>
          ) : (
            <p className="mt-6 text-muted-foreground">{t("result.notPublished")}</p>
          )}
          <Button className="mt-8" onClick={() => void navigate({ to: "/dashboard" })}>
            {t("common.dashboard")}
          </Button>
        </div>
      </Shell>
    );
  }

  // ----- access gate -----
  if (!attempt) {
    const open = preview || isExamOpenForStudents(exam, Date.now());
    const enrolled =
      preview || !profile || profile.role !== "student"
        ? true
        : profile.enrolledCourseIds.includes(exam.courseId);
    const canStart = open && enrolled && (attemptsLeft > 0 || inProgress !== null);

    return (
      <Shell>
        <div className="mx-auto max-w-xl rounded-lg border bg-card p-8">
          <h1 className="text-2xl font-bold">{exam.title}</h1>
          {exam.description ? (
            <p className="mt-2 text-muted-foreground">{exam.description}</p>
          ) : null}
          {preview ? (
            <p className="mt-3 rounded-md bg-muted p-3 text-sm">{t("exam.previewNote")}</p>
          ) : null}
          <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("exam.duration")}</dt>
              <dd className="font-semibold">
                {exam.durationMin} {t("common.minutes")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("common.questions")}</dt>
              <dd className="font-semibold">
                {exam.poolSize > 0 ? exam.poolSize : exam.questionIds.length}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("admin.passMark")}</dt>
              <dd className="font-semibold">{exam.passMark}%</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("exam.attemptsLeft")}</dt>
              <dd className="font-semibold">{exam.maxAttempts > 0 ? attemptsLeft : "∞"}</dd>
            </div>
          </dl>
          {exam.instructions ? (
            <div className="mt-6">
              <h2 className="font-semibold">{t("exam.instructions")}</h2>
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">
                {exam.instructions}
              </p>
            </div>
          ) : null}

          {!open ? (
            <Notice title={t("exam.notOpen")} />
          ) : !enrolled ? (
            <Notice title={t("exam.notEnrolled")} />
          ) : attemptsLeft <= 0 && !inProgress ? (
            <Notice title={t("exam.noAttemptsLeft")} />
          ) : (
            <div className="mt-6 space-y-3">
              {!preview && exam.password ? (
                <>
                  <label className="text-sm font-medium">{t("exam.password")}</label>
                  <Input
                    type="password"
                    placeholder={t("exam.passwordPrompt")}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </>
              ) : null}
              <Button
                className="w-full"
                disabled={!canStart || starting}
                onClick={() => void start(inProgress)}
              >
                {starting ? t("common.loading") : inProgress ? t("exam.resume") : t("exam.start")}
              </Button>
            </div>
          )}
        </div>
      </Shell>
    );
  }

  // ----- runner -----
  const presented = attempt.presented;
  const current = presented[index];
  const question = current ? byId.get(current.questionId) : undefined;
  const remaining = attempt.expiresAt - now;
  const answeredCount = presented.filter((p) => (answers[p.questionId] ?? "") !== "").length;

  return (
    <Shell>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-4">
        <div>
          <h1 className="font-semibold">{exam.title}</h1>
          <p className="text-sm text-muted-foreground">
            {t("exam.answered")}: {answeredCount}/{presented.length}
          </p>
        </div>
        <div
          className={`flex items-center gap-2 rounded-md px-3 py-2 font-mono text-lg ${
            remaining < 60_000 ? "bg-destructive/10 text-destructive" : "bg-muted"
          }`}
        >
          <Clock3 className="size-4" /> {formatClock(remaining)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">
            {t("exam.questionOf", { a: index + 1, b: presented.length })}
          </p>
          {question ? (
            <>
              <h2 className="mt-2 text-lg font-semibold">
                {localized(lang, question.text, question.textEn)}
              </h2>
              <div className="mt-5 space-y-3">
                {question.type === "mcq"
                  ? current!.optionOrder.map((optionId) => {
                      const option = question.options.find((o) => o.id === optionId);
                      if (!option) return null;
                      return (
                        <label
                          key={option.id}
                          className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-accent"
                        >
                          <input
                            type="radio"
                            name={question.id}
                            className="size-4"
                            checked={answers[question.id] === option.id}
                            onChange={() => setAnswers((a) => ({ ...a, [question.id]: option.id }))}
                          />
                          {option.text}
                        </label>
                      );
                    })
                  : null}
                {question.type === "truefalse"
                  ? (["true", "false"] as const).map((value) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm hover:bg-accent"
                      >
                        <input
                          type="radio"
                          name={question.id}
                          className="size-4"
                          checked={answers[question.id] === value}
                          onChange={() => setAnswers((a) => ({ ...a, [question.id]: value }))}
                        />
                        {value === "true" ? t("exam.true") : t("exam.false")}
                      </label>
                    ))
                  : null}
                {question.type === "short" || question.type === "essay" ? (
                  <Textarea
                    rows={question.type === "essay" ? 8 : 3}
                    placeholder={t("exam.typeAnswer")}
                    value={answers[question.id] ?? ""}
                    onChange={(e) => setAnswers((a) => ({ ...a, [question.id]: e.target.value }))}
                  />
                ) : null}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">{t("common.notFound")}</p>
          )}

          <div className="mt-8 flex flex-wrap justify-between gap-2">
            <Button
              variant="outline"
              disabled={index === 0 || !exam.allowBackward}
              onClick={() => setIndex((i) => Math.max(0, i - 1))}
            >
              {t("common.previous")}
            </Button>
            {index < presented.length - 1 ? (
              <Button onClick={() => setIndex((i) => Math.min(presented.length - 1, i + 1))}>
                {t("common.next")}
              </Button>
            ) : (
              <Button disabled={submitting} onClick={() => void submit(false)}>
                {submitting ? t("common.saving") : t("exam.submitExam")}
              </Button>
            )}
          </div>
        </div>

        <aside className="rounded-lg border bg-card p-4">
          <h3 className="text-sm font-semibold">{t("exam.review")}</h3>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {presented.map((p, i) => {
              const done = (answers[p.questionId] ?? "") !== "";
              return (
                <button
                  key={p.questionId}
                  type="button"
                  onClick={() => (exam.allowBackward || i >= index ? setIndex(i) : undefined)}
                  className={`size-8 rounded-md border text-xs ${
                    i === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : done
                        ? "bg-accent"
                        : ""
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <Button
            className="mt-5 w-full"
            variant="secondary"
            disabled={submitting}
            onClick={() => {
              if (window.confirm(t("exam.submitConfirm"))) void submit(false);
            }}
          >
            {t("exam.submitExam")}
          </Button>
        </aside>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-4xl px-4 py-10">{children}</main>
    </div>
  );
}

function Notice({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mt-6 flex flex-col items-center gap-3 rounded-lg border border-dashed p-8 text-center">
      <AlertTriangle className="size-6 text-muted-foreground" />
      <p className="font-medium">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold">{value}</div>
    </div>
  );
}
