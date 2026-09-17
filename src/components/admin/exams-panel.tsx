import { Link } from "@tanstack/react-router";
import { Copy, Eye, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminData } from "@/components/admin/context";
import {
  ConfirmButton,
  EmptyState,
  ExamStatusBadge,
  Field,
  PanelHeader,
  formatDateTime,
  fromLocalInput,
  toLocalInput,
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { deleteExam, newId, pushNotification, saveExam } from "@/lib/data";
import { validateExam } from "@/lib/exam-engine";
import type { Exam, ExamStatus } from "@/lib/types";

function emptyExam(courseId: string): Exam {
  return {
    id: newId("e"),
    title: "",
    courseId,
    topic: "",
    description: "",
    instructions: "",
    language: "both",
    instructor: "",
    startAt: null,
    endAt: null,
    durationMin: 30,
    maxAttempts: 1,
    password: "",
    passMark: 50,
    questionIds: [],
    poolSize: 0,
    shuffleQuestions: true,
    shuffleOptions: true,
    allowBackward: true,
    oneAtATime: false,
    requireFullscreen: false,
    trackTabs: true,
    resultPolicy: "immediate",
    resultsPublished: false,
    showAnswersAfter: false,
    status: "draft",
    createdAt: Date.now(),
  };
}

export function ExamsPanel() {
  const { t } = useI18n();
  const { exams, courses, questions, attempts, reload, record } = useAdminData();
  const [editing, setEditing] = useState<Exam | null>(null);
  const [saving, setSaving] = useState(false);
  const [questionSearch, setQuestionSearch] = useState("");

  const selectableQuestions = useMemo(
    () =>
      questions.filter((q) => {
        if (!editing) return false;
        if (editing.courseId && q.courseId !== editing.courseId) return false;
        const needle = questionSearch.trim().toLowerCase();
        if (!needle) return true;
        return q.text.toLowerCase().includes(needle) || q.topic.toLowerCase().includes(needle);
      }),
    [questions, editing, questionSearch],
  );

  async function persist(next?: Exam) {
    const exam = next ?? editing;
    if (!exam) return;
    if (!exam.title.trim()) {
      toast.error(t("admin.titleRequired"));
      return;
    }
    setSaving(true);
    try {
      await saveExam(exam);
      await record("exam.save", exam.title);
      await reload();
      if (!next) setEditing(null);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  function issuesFor(exam: Exam) {
    return validateExam(exam, questions);
  }

  async function setStatus(exam: Exam, status: ExamStatus) {
    if (status === "active" || status === "scheduled") {
      const errors = issuesFor(exam).filter((i) => i.level === "error");
      if (errors.length > 0) {
        toast.error(errors[0]!.message);
        return;
      }
    }
    await saveExam({ ...exam, status });
    await record("exam.status", exam.title, exam.status, status);
    await reload();
    if (status === "active") {
      await pushNotification({
        userId: "all",
        titleOm: "Qormaanni haaraan banameera",
        titleEn: "A new exam is open",
        bodyOm: exam.title,
        bodyEn: exam.title,
        createdAt: Date.now(),
      }).catch(() => undefined);
    }
    toast.success(t("common.success"));
  }

  async function publishResults(exam: Exam) {
    await saveExam({ ...exam, resultsPublished: true, status: "resultsPublished" });
    await record("exam.publishResults", exam.title);
    await pushNotification({
      userId: "all",
      titleOm: "Bu'aan qormaataa maxxanfameera",
      titleEn: "Exam results published",
      bodyOm: exam.title,
      bodyEn: exam.title,
      createdAt: Date.now(),
    }).catch(() => undefined);
    await reload();
    toast.success(t("common.success"));
  }

  async function duplicate(exam: Exam) {
    const copy: Exam = {
      ...exam,
      id: newId("e"),
      title: `${exam.title} (copy)`,
      status: "draft",
      resultsPublished: false,
      createdAt: Date.now(),
    };
    await saveExam(copy);
    await record("exam.duplicate", exam.title);
    await reload();
    toast.success(t("common.success"));
  }

  async function remove(exam: Exam) {
    await deleteExam(exam.id);
    await record("exam.delete", exam.title);
    await reload();
    toast.success(t("common.success"));
  }

  function validateNow(exam: Exam) {
    const issues = issuesFor(exam);
    if (issues.length === 0) {
      toast.success(t("admin.validationOk"));
      return;
    }
    for (const issue of issues.slice(0, 4)) {
      if (issue.level === "error") toast.error(issue.message);
      else toast.warning(issue.message);
    }
  }

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.exams")} subtitle={t("admin.examsSubtitle")}>
        <Button
          onClick={() => setEditing(emptyExam(courses[0]?.id ?? ""))}
          disabled={courses.length === 0}
        >
          <Plus /> {t("admin.newExam")}
        </Button>
      </PanelHeader>

      {exams.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => {
            const course = courses.find((c) => c.id === exam.courseId);
            const examAttempts = attempts.filter((a) => a.examId === exam.id);
            return (
              <article key={exam.id} className="rounded-lg border bg-card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-semibold">{exam.title}</h3>
                  <ExamStatusBadge status={exam.status} />
                  {exam.resultsPublished ? (
                    <Badge variant="outline">{t("status.resultsPublished")}</Badge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {course?.titleOm || course?.titleEn || "—"} · {exam.questionIds.length}{" "}
                  {t("common.questions")} · {exam.durationMin} {t("common.minutes")} ·{" "}
                  {examAttempts.length} {t("admin.attempts")}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {t("admin.startAt")}: {formatDateTime(exam.startAt)} · {t("admin.endAt")}:{" "}
                  {formatDateTime(exam.endAt)}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(exam)}>
                    <Pencil /> {t("common.edit")}
                  </Button>
                  <Button size="sm" variant="outline" asChild>
                    <Link
                      to="/exam/$examId"
                      params={{ examId: exam.id }}
                      search={{ preview: true }}
                    >
                      <Eye /> {t("exam.preview")}
                    </Link>
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => validateNow(exam)}>
                    <ShieldCheck /> {t("admin.validate")}
                  </Button>
                  {exam.status === "active" ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => void setStatus(exam, "closed")}
                    >
                      {t("admin.closeExam")}
                    </Button>
                  ) : (
                    <Button size="sm" onClick={() => void setStatus(exam, "active")}>
                      {t("admin.publish")}
                    </Button>
                  )}
                  {exam.status !== "draft" ? (
                    <Button size="sm" variant="ghost" onClick={() => void setStatus(exam, "draft")}>
                      {t("admin.unpublish")}
                    </Button>
                  ) : null}
                  {!exam.resultsPublished ? (
                    <Button size="sm" variant="secondary" onClick={() => void publishResults(exam)}>
                      {t("admin.publishResults")}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        await saveExam({ ...exam, resultsPublished: false });
                        await record("exam.hideResults", exam.title);
                        await reload();
                      }}
                    >
                      {t("admin.hideResults")}
                    </Button>
                  )}
                  <Button size="sm" variant="ghost" onClick={() => void duplicate(exam)}>
                    <Copy /> {t("admin.duplicate")}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => void setStatus(exam, "archived")}
                  >
                    {t("admin.archive")}
                  </Button>
                  <ConfirmButton
                    title={t("admin.confirmDeleteTitle")}
                    description={t("admin.confirmDeleteExam")}
                    confirmLabel={t("common.delete")}
                    onConfirm={() => remove(exam)}
                  >
                    <Button size="sm" variant="ghost">
                      <Trash2 /> {t("common.delete")}
                    </Button>
                  </ConfirmButton>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editing?.title || t("admin.newExam")}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label={t("admin.examTitle")} className="sm:col-span-2">
                  <Input
                    value={editing.title}
                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  />
                </Field>
                <Field label={t("common.course")}>
                  <Select
                    value={editing.courseId}
                    onValueChange={(v) => setEditing({ ...editing, courseId: v, questionIds: [] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.titleOm || c.titleEn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("admin.topic")}>
                  <Input
                    value={editing.topic ?? ""}
                    onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                  />
                </Field>
                <Field label={t("admin.examDescription")} className="sm:col-span-2">
                  <Textarea
                    value={editing.description ?? ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  />
                </Field>
                <Field label={t("admin.examInstructions")} className="sm:col-span-2">
                  <Textarea
                    value={editing.instructions ?? ""}
                    onChange={(e) => setEditing({ ...editing, instructions: e.target.value })}
                  />
                </Field>
                <Field label={t("admin.examLanguage")}>
                  <Select
                    value={editing.language}
                    onValueChange={(v) =>
                      setEditing({ ...editing, language: v as Exam["language"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="om">Afaan Oromoo</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="both">OM + EN</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={t("common.instructor")}>
                  <Input
                    value={editing.instructor ?? ""}
                    onChange={(e) => setEditing({ ...editing, instructor: e.target.value })}
                  />
                </Field>
                <Field label={t("admin.startAt")}>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(editing.startAt)}
                    onChange={(e) =>
                      setEditing({ ...editing, startAt: fromLocalInput(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("admin.endAt")}>
                  <Input
                    type="datetime-local"
                    value={toLocalInput(editing.endAt)}
                    onChange={(e) =>
                      setEditing({ ...editing, endAt: fromLocalInput(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("admin.durationMin")}>
                  <Input
                    type="number"
                    min={1}
                    value={editing.durationMin}
                    onChange={(e) =>
                      setEditing({ ...editing, durationMin: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("admin.maxAttempts")} hint={t("admin.unlimitedHint")}>
                  <Input
                    type="number"
                    min={0}
                    value={editing.maxAttempts}
                    onChange={(e) =>
                      setEditing({ ...editing, maxAttempts: Number(e.target.value) })
                    }
                  />
                </Field>
                <Field label={t("exam.password")}>
                  <Input
                    value={editing.password}
                    onChange={(e) => setEditing({ ...editing, password: e.target.value })}
                  />
                </Field>
                <Field label={t("admin.passMark")}>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={editing.passMark}
                    onChange={(e) => setEditing({ ...editing, passMark: Number(e.target.value) })}
                  />
                </Field>
                <Field label={t("admin.poolSize")} hint={t("admin.poolHint")}>
                  <Input
                    type="number"
                    min={0}
                    value={editing.poolSize}
                    onChange={(e) => setEditing({ ...editing, poolSize: Number(e.target.value) })}
                  />
                </Field>
                <Field label={t("admin.resultPolicy")}>
                  <Select
                    value={editing.resultPolicy}
                    onValueChange={(v) =>
                      setEditing({ ...editing, resultPolicy: v as Exam["resultPolicy"] })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">{t("admin.resultImmediate")}</SelectItem>
                      <SelectItem value="manual">{t("admin.resultManual")}</SelectItem>
                      <SelectItem value="scheduled">{t("admin.resultScheduled")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                {editing.resultPolicy === "scheduled" ? (
                  <Field label={t("admin.resultsPublishAt")}>
                    <Input
                      type="datetime-local"
                      value={toLocalInput(editing.resultsPublishAt ?? null)}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          resultsPublishAt: fromLocalInput(e.target.value),
                        })
                      }
                    />
                  </Field>
                ) : null}
              </div>

              <div className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
                {(
                  [
                    ["shuffleQuestions", t("admin.shuffleQuestions")],
                    ["shuffleOptions", t("admin.shuffleOptions")],
                    ["allowBackward", t("admin.allowBackward")],
                    ["oneAtATime", t("admin.oneAtATime")],
                    ["requireFullscreen", t("admin.requireFullscreen")],
                    ["trackTabs", t("admin.trackTabs")],
                    ["showAnswersAfter", t("admin.showAnswersAfter")],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="flex items-center justify-between gap-3 text-sm">
                    <span>{label}</span>
                    <Switch
                      checked={Boolean(editing[key])}
                      onCheckedChange={(checked) => setEditing({ ...editing, [key]: checked })}
                    />
                  </label>
                ))}
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h4 className="font-semibold">
                    {t("admin.selectQuestions")} ({editing.questionIds.length})
                  </h4>
                  <Input
                    className="w-full sm:w-64"
                    placeholder={t("common.search")}
                    value={questionSearch}
                    onChange={(e) => setQuestionSearch(e.target.value)}
                  />
                </div>
                <div className="mt-3 max-h-72 space-y-2 overflow-y-auto rounded-lg border p-3">
                  {selectableQuestions.length === 0 ? (
                    <p className="p-4 text-center text-sm text-muted-foreground">
                      {t("admin.noData")}
                    </p>
                  ) : (
                    selectableQuestions.map((q) => {
                      const checked = editing.questionIds.includes(q.id);
                      return (
                        <label
                          key={q.id}
                          className="flex cursor-pointer items-start gap-3 rounded-md p-2 text-sm hover:bg-accent"
                        >
                          <input
                            type="checkbox"
                            className="mt-1 size-4"
                            checked={checked}
                            onChange={() =>
                              setEditing({
                                ...editing,
                                questionIds: checked
                                  ? editing.questionIds.filter((id) => id !== q.id)
                                  : [...editing.questionIds, q.id],
                              })
                            }
                          />
                          <span className="flex-1">
                            <span className="font-medium">{q.text}</span>
                            <span className="ml-2 text-xs text-muted-foreground">
                              {t(`qtype.${q.type}` as const)} · {q.points} {t("common.points")}
                              {q.approved ? "" : ` · ${t("admin.pendingReview")}`}
                            </span>
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            {editing ? (
              <Button variant="secondary" onClick={() => validateNow(editing)}>
                {t("admin.validate")}
              </Button>
            ) : null}
            <Button disabled={saving} onClick={() => void persist()}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
