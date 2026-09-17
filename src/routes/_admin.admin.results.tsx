/**
 * Admin — Results & Grading
 */
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Globe, GlobeLock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import {
  adminListAttempts,
  adminListExams,
  adminListQuestions,
  adminGradeAttempt,
  adminPublishResult,
  adminPublishAllResults,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Attempt, Exam, Question } from "@/lib/schema";

export const Route = createFileRoute("/_admin/admin/results")({
  component: ResultsPage,
});

const toNum = (v: string) => (v === "" ? 0 : Number(v));

function ResultsPage() {
  const { t } = useI18n();
  const call = useServerFn();

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradingAttempt, setGradingAttempt] = useState<Attempt | null>(null);
  const [feedback, setFeedback] = useState("");
  const [manualGrades, setManualGrades] = useState<
    Record<string, { points: number; feedback?: string }>
  >({});
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [a, e, q] = await Promise.all([
        call(adminListAttempts, {}),
        call(adminListExams, undefined),
        call(adminListQuestions, {}),
      ]);
      setAttempts(
        (a as Attempt[])
          .filter((x) => x.status !== "in_progress")
          .sort((a, b) => (b.submittedAt ?? 0) - (a.submittedAt ?? 0)),
      );
      setExams(e as Exam[]);
      setQuestions(q as Question[]);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = attempts.filter((a) => {
    if (examFilter !== "all" && a.examId !== examFilter) return false;
    if (statusFilter === "pending" && !a.needsManualGrading) return false;
    if (statusFilter === "published" && !a.published) return false;
    if (statusFilter === "unpublished" && a.published) return false;
    return true;
  });

  function openGrade(attempt: Attempt) {
    setGradingAttempt(attempt);
    setFeedback(attempt.feedback ?? "");
    setManualGrades({ ...(attempt.manualGrades ?? {}) });
  }

  function setManualPoints(qid: string, points: number) {
    setManualGrades((prev) => ({ ...prev, [qid]: { ...(prev[qid] ?? {}), points } }));
  }

  function setManualNote(qid: string, note: string) {
    setManualGrades((prev) => ({
      ...prev,
      [qid]: { points: prev[qid]?.points ?? 0, feedback: note },
    }));
  }

  async function saveGrade() {
    if (!gradingAttempt) return;
    setSaving(true);
    try {
      await call(adminGradeAttempt, {
        attemptId: gradingAttempt.id,
        manualGrades,
        feedback,
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

  async function togglePublish(attempt: Attempt) {
    try {
      await call(adminPublishResult, { attemptId: attempt.id, published: !attempt.published });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function publishAll(examId: string) {
    try {
      const res = await call(adminPublishAllResults, { examId });
      toast.success(`Published ${(res as { count: number }).count} results`);
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  const examName = (id: string) => exams.find((e) => e.id === id)?.title ?? id;

  const manualQuestions = gradingAttempt
    ? gradingAttempt.questionOrder
        .map((qid) => questions.find((q) => q.id === qid))
        .filter((q): q is Question => Boolean(q && (q.type === "short" || q.type === "essay")))
    : [];

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.grading")}</h1>
          <p className="text-sm text-muted-foreground">{filtered.length} attempts</p>
        </div>
        {examFilter !== "all" && (
          <Button size="sm" onClick={() => void publishAll(examFilter)}>
            <Globe className="size-4 mr-1" /> {t("admin.publishResults")} All
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-52">
            <SelectValue placeholder="All exams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All exams</SelectItem>
            {exams.map((e) => (
              <SelectItem key={e.id} value={e.id}>
                {e.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Needs grading</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="unpublished">Unpublished</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {filtered.map((attempt) => (
            <div key={attempt.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="font-medium">{attempt.studentName}</p>
                <p className="text-sm text-muted-foreground">{examName(attempt.examId)}</p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  <Badge variant={attempt.passed ? "default" : "destructive"} className="text-xs">
                    {attempt.percentage}% ·{" "}
                    {attempt.passed ? t("result.passed") : t("result.failed")}
                  </Badge>
                  {attempt.needsManualGrading && (
                    <Badge variant="secondary" className="text-xs">
                      Needs grading
                    </Badge>
                  )}
                  <Badge variant={attempt.published ? "default" : "outline"} className="text-xs">
                    {attempt.published ? "Published" : "Unpublished"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                {attempt.needsManualGrading && (
                  <Button variant="outline" size="sm" onClick={() => void openGrade(attempt)}>
                    <CheckCircle2 className="size-4 mr-1" /> Grade
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => void togglePublish(attempt)}>
                  {attempt.published ? (
                    <GlobeLock className="size-4 text-muted-foreground" />
                  ) : (
                    <Globe className="size-4 text-green-500" />
                  )}
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
          )}
        </div>
      )}

      {/* Grading dialog */}
      <Dialog open={Boolean(gradingAttempt)} onOpenChange={(o) => !o && setGradingAttempt(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Grade: {gradingAttempt?.studentName}</DialogTitle>
          </DialogHeader>
          {gradingAttempt && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3 text-sm">
                <p>
                  Auto score: {gradingAttempt.autoScore} / {gradingAttempt.totalPoints}
                </p>
                <p>Percentage: {gradingAttempt.percentage}%</p>
              </div>

              {manualQuestions.length > 0 && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Questions to grade</h3>
                    <p className="text-xs text-muted-foreground">
                      Award points for each short-answer / essay question.
                    </p>
                  </div>
                  {manualQuestions.map((q, i) => (
                    <div key={q.id} className="space-y-2 rounded-lg border p-3">
                      <div className="text-sm font-medium">
                        {i + 1}. {q.textEn || q.textOm}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        <p>
                          Student answer:{" "}
                          <span className="text-foreground">
                            {gradingAttempt.answers[q.id] || "(blank)"}
                          </span>
                        </p>
                        {(q.expectedAnswer || q.rubric) && (
                          <p>
                            Expected/rubric:{" "}
                            <span className="text-foreground">
                              {q.expectedAnswer || q.rubric}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="flex flex-wrap items-end gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Points</Label>
                          <Input
                            type="number"
                            min={0}
                            max={q.points}
                            value={manualGrades[q.id]?.points ?? 0}
                            onChange={(e) => setManualPoints(q.id, toNum(e.target.value))}
                            className="w-24"
                          />
                        </div>
                        <div className="flex-1 space-y-1">
                          <Label className="text-xs">Feedback</Label>
                          <Input
                            value={manualGrades[q.id]?.feedback ?? ""}
                            onChange={(e) => setManualNote(q.id, e.target.value)}
                            placeholder="Optional per-question feedback"
                          />
                        </div>
                        <span className="text-xs text-muted-foreground">/ {q.points} pt</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-1.5">
                <Label>{t("result.feedback")}</Label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={4}
                  placeholder="Overall feedback..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setGradingAttempt(null)}>
                  {t("common.cancel")}
                </Button>
                <Button onClick={() => void saveGrade()} disabled={saving}>
                  {saving ? t("common.saving") : t("admin.saveGrade")}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
