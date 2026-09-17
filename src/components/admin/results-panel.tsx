import { Download, RefreshCw, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminData } from "@/components/admin/context";
import {
  ConfirmButton,
  EmptyState,
  Field,
  PanelHeader,
  downloadCsv,
  formatDateTime,
} from "@/components/admin/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { deleteAttempt, pushNotification, updateAttempt } from "@/lib/data";
import { autoGrade, finalizeScores } from "@/lib/exam-engine";
import type { Attempt, Exam, Question } from "@/lib/types";

/** Recompute an attempt from the current answer key and grading input. */
function recompute(attempt: Attempt, exam: Exam | undefined, questions: Question[]): Attempt {
  const graded = autoGrade(attempt.presented, questions, attempt.answers);
  const next: Attempt = { ...attempt, ...graded };
  const { percentage, passed, manualScore } = finalizeScores(next, exam?.passMark ?? 50);
  return {
    ...next,
    manualScore,
    percentage,
    passed,
    status: graded.needsManualGrading && manualScore === 0 ? "submitted" : "graded",
  };
}

export function ResultsPanel() {
  const { t } = useI18n();
  const { attempts, exams, questions, reload, record } = useAdminData();
  const [examFilter, setExamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [grading, setGrading] = useState<Attempt | null>(null);
  const [saving, setSaving] = useState(false);

  const rows = useMemo(
    () =>
      attempts
        .filter((a) => {
          if (examFilter !== "all" && a.examId !== examFilter) return false;
          if (statusFilter !== "all" && a.status !== statusFilter) return false;
          const needle = search.trim().toLowerCase();
          if (!needle) return true;
          return (
            a.studentName.toLowerCase().includes(needle) ||
            a.examTitle.toLowerCase().includes(needle)
          );
        })
        .sort((a, b) => b.startedAt - a.startedAt),
    [attempts, examFilter, statusFilter, search],
  );

  async function saveGrades(attempt: Attempt) {
    setSaving(true);
    try {
      const exam = exams.find((e) => e.id === attempt.examId);
      const next = recompute(attempt, exam, questions);
      await updateAttempt(attempt.id, {
        manualGrades: next.manualGrades ?? {},
        manualScore: next.manualScore,
        percentage: next.percentage,
        passed: next.passed,
        status: "graded",
        ...(next.feedback !== undefined ? { feedback: next.feedback } : {}),
      });
      await record("attempt.grade", `${attempt.studentName} — ${attempt.examTitle}`);
      await reload();
      setGrading(null);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function publishOne(attempt: Attempt) {
    await updateAttempt(attempt.id, { published: true });
    await pushNotification({
      userId: attempt.studentId,
      titleOm: "Bu'aan kee maxxanfameera",
      titleEn: "Your result is published",
      bodyOm: attempt.examTitle,
      bodyEn: attempt.examTitle,
      createdAt: Date.now(),
    }).catch(() => undefined);
    await record("attempt.publish", `${attempt.studentName} — ${attempt.examTitle}`);
    await reload();
    toast.success(t("common.success"));
  }

  async function regradeExam(examId: string) {
    const exam = exams.find((e) => e.id === examId);
    const affected = attempts.filter((a) => a.examId === examId && a.status !== "in_progress");
    for (const attempt of affected) {
      const next = recompute(attempt, exam, questions);
      await updateAttempt(attempt.id, {
        autoScore: next.autoScore,
        totalPoints: next.totalPoints,
        correctCount: next.correctCount,
        wrongCount: next.wrongCount,
        unansweredCount: next.unansweredCount,
        percentage: next.percentage,
        passed: next.passed,
      });
    }
    await record("exam.regrade", exam?.title ?? examId, undefined, `${affected.length} attempts`);
    await reload();
    toast.success(t("admin.regradeDone", { n: affected.length }));
  }

  function exportCsv() {
    downloadCsv("oromia-academy-results.csv", [
      [
        t("common.student"),
        t("common.exam"),
        t("admin.attempts"),
        t("result.score"),
        t("common.total"),
        t("result.percentage"),
        t("common.status"),
        t("common.date"),
      ],
      ...rows.map((a) => [
        a.studentName,
        a.examTitle,
        a.attemptNumber,
        a.autoScore + a.manualScore,
        a.totalPoints,
        `${a.percentage}%`,
        a.passed ? t("result.passed") : t("result.failed"),
        formatDateTime(a.submittedAt ?? a.startedAt),
      ]),
    ]);
  }

  const gradingQuestions = grading
    ? grading.presented
        .map((p) => questions.find((q) => q.id === p.questionId))
        .filter((q): q is Question => Boolean(q))
        .filter((q) => q.type === "short" || q.type === "essay")
    : [];

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.grading")} subtitle={t("admin.gradingSubtitle")}>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download /> {t("common.export")}
        </Button>
        {examFilter !== "all" ? (
          <Button variant="secondary" onClick={() => void regradeExam(examFilter)}>
            <RefreshCw /> {t("admin.regrade")}
          </Button>
        ) : null}
      </PanelHeader>

      <div className="grid gap-2 sm:grid-cols-3">
        <Input
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="in_progress">{t("admin.inProgress")}</SelectItem>
            <SelectItem value="submitted">{t("admin.submitted")}</SelectItem>
            <SelectItem value="graded">{t("admin.graded")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.student")}</TableHead>
                <TableHead>{t("common.exam")}</TableHead>
                <TableHead>{t("result.score")}</TableHead>
                <TableHead>{t("result.percentage")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("admin.tabSwitches")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.studentName}</TableCell>
                  <TableCell>
                    {a.examTitle}
                    <span className="block text-xs text-muted-foreground">
                      #{a.attemptNumber} · {formatDateTime(a.submittedAt ?? a.startedAt)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {a.autoScore + a.manualScore}/{a.totalPoints}
                  </TableCell>
                  <TableCell>
                    <Badge variant={a.passed ? "default" : "secondary"}>{a.percentage}%</Badge>
                  </TableCell>
                  <TableCell>
                    {a.status === "in_progress"
                      ? t("admin.inProgress")
                      : a.needsManualGrading && a.status !== "graded"
                        ? t("result.pending")
                        : t("admin.graded")}
                    {a.published ? (
                      <Badge className="ml-2" variant="outline">
                        {t("admin.publishedShort")}
                      </Badge>
                    ) : null}
                  </TableCell>
                  <TableCell>{a.events.filter((e) => e.type === "tab").length}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => setGrading(a)}>
                        {t("admin.gradeAnswer")}
                      </Button>
                      {!a.published ? (
                        <Button size="sm" variant="secondary" onClick={() => void publishOne(a)}>
                          {t("admin.publish")}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={async () => {
                            await updateAttempt(a.id, { published: false });
                            await record("attempt.unpublish", a.studentName);
                            await reload();
                          }}
                        >
                          {t("admin.unpublish")}
                        </Button>
                      )}
                      <ConfirmButton
                        title={t("admin.confirmDeleteTitle")}
                        description={t("admin.confirmDeleteAttempt")}
                        confirmLabel={t("common.delete")}
                        onConfirm={async () => {
                          await deleteAttempt(a.id);
                          await record("attempt.delete", `${a.studentName} — ${a.examTitle}`);
                          await reload();
                        }}
                      >
                        <Button size="sm" variant="ghost">
                          <Trash2 />
                        </Button>
                      </ConfirmButton>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={grading !== null} onOpenChange={(o) => !o && setGrading(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {grading ? `${grading.studentName} — ${grading.examTitle}` : ""}
            </DialogTitle>
          </DialogHeader>
          {grading ? (
            <div className="space-y-5">
              <div className="grid grid-cols-3 gap-3 rounded-lg border p-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">{t("result.correct")}</div>
                  <div className="text-lg font-semibold">{grading.correctCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("result.wrong")}</div>
                  <div className="text-lg font-semibold">{grading.wrongCount}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">{t("result.unanswered")}</div>
                  <div className="text-lg font-semibold">{grading.unansweredCount}</div>
                </div>
              </div>

              {gradingQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">{t("admin.noManualQuestions")}</p>
              ) : (
                gradingQuestions.map((q) => {
                  const grade = grading.manualGrades?.[q.id];
                  return (
                    <div key={q.id} className="rounded-lg border p-4">
                      <p className="font-medium">{q.text}</p>
                      <p className="mt-2 rounded-md bg-muted p-3 text-sm">
                        {grading.answers[q.id] || t("result.unanswered")}
                      </p>
                      {q.expectedAnswer ? (
                        <p className="mt-2 text-xs text-muted-foreground">
                          {t("admin.expectedAnswer")}: {q.expectedAnswer}
                        </p>
                      ) : null}
                      {q.rubric ? (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t("admin.rubric")}: {q.rubric}
                        </p>
                      ) : null}
                      <div className="mt-3 grid gap-3 sm:grid-cols-[120px_1fr]">
                        <Field label={`${t("admin.pointsAwarded")} / ${q.points}`}>
                          <Input
                            type="number"
                            min={0}
                            max={q.points}
                            value={grade?.points ?? 0}
                            onChange={(e) =>
                              setGrading({
                                ...grading,
                                manualGrades: {
                                  ...(grading.manualGrades ?? {}),
                                  [q.id]: {
                                    points: Math.min(q.points, Number(e.target.value) || 0),
                                    ...(grade?.feedback ? { feedback: grade.feedback } : {}),
                                  },
                                },
                              })
                            }
                          />
                        </Field>
                        <Field label={t("result.feedback")}>
                          <Input
                            value={grade?.feedback ?? ""}
                            onChange={(e) =>
                              setGrading({
                                ...grading,
                                manualGrades: {
                                  ...(grading.manualGrades ?? {}),
                                  [q.id]: {
                                    points: grade?.points ?? 0,
                                    feedback: e.target.value,
                                  },
                                },
                              })
                            }
                          />
                        </Field>
                      </div>
                    </div>
                  );
                })
              )}

              <Field label={t("result.feedback")}>
                <Textarea
                  value={grading.feedback ?? ""}
                  onChange={(e) => setGrading({ ...grading, feedback: e.target.value })}
                />
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setGrading(null)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={saving} onClick={() => grading && void saveGrades(grading)}>
              {saving ? t("common.saving") : t("admin.saveGrade")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
