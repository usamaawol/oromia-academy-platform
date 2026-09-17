import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminData } from "@/components/admin/context";
import { ConfirmButton, EmptyState, Field, PanelHeader } from "@/components/admin/ui-bits";
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
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import { deleteQuestion, newId, saveQuestion } from "@/lib/data";
import type { Question, QuestionType } from "@/lib/types";

function emptyQuestion(courseId: string): Question {
  return {
    id: newId("q"),
    courseId,
    topic: "",
    type: "mcq",
    language: "both",
    difficulty: "easy",
    text: "",
    textEn: "",
    options: [
      { id: "o1", text: "" },
      { id: "o2", text: "" },
    ],
    correctOptionId: "o1",
    points: 1,
    tags: [],
    approved: false,
    source: "manual",
    createdAt: Date.now(),
  };
}

export function QuestionsPanel() {
  const { t } = useI18n();
  const { questions, courses, reload, record } = useAdminData();
  const [editing, setEditing] = useState<Question | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [approvalFilter, setApprovalFilter] = useState("all");

  const filtered = useMemo(
    () =>
      questions.filter((q) => {
        if (courseFilter !== "all" && q.courseId !== courseFilter) return false;
        if (typeFilter !== "all" && q.type !== typeFilter) return false;
        if (approvalFilter === "approved" && !q.approved) return false;
        if (approvalFilter === "pending" && q.approved) return false;
        const needle = search.trim().toLowerCase();
        if (!needle) return true;
        return (
          q.text.toLowerCase().includes(needle) ||
          (q.textEn ?? "").toLowerCase().includes(needle) ||
          q.topic.toLowerCase().includes(needle) ||
          q.tags.some((tag) => tag.toLowerCase().includes(needle))
        );
      }),
    [questions, courseFilter, typeFilter, approvalFilter, search],
  );

  async function persist() {
    if (!editing) return;
    if (!editing.text.trim()) {
      toast.error(t("admin.questionTextRequired"));
      return;
    }
    if (!editing.courseId) {
      toast.error(t("admin.courseRequired"));
      return;
    }
    if (editing.type === "mcq") {
      const filled = editing.options.filter((o) => o.text.trim());
      if (filled.length < 2) {
        toast.error(t("admin.twoOptionsRequired"));
        return;
      }
      if (!editing.correctOptionId || !filled.some((o) => o.id === editing.correctOptionId)) {
        toast.error(t("admin.correctAnswerRequired"));
        return;
      }
    }
    setSaving(true);
    try {
      await saveQuestion(editing);
      await record("question.save", editing.text.slice(0, 60));
      await reload();
      setEditing(null);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function toggleApproval(q: Question) {
    await saveQuestion({ ...q, approved: !q.approved });
    await record(q.approved ? "question.unapprove" : "question.approve", q.text.slice(0, 60));
    await reload();
    toast.success(t("common.success"));
  }

  async function remove(q: Question) {
    await deleteQuestion(q.id);
    await record("question.delete", q.text.slice(0, 60));
    await reload();
    toast.success(t("common.success"));
  }

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.questions")} subtitle={t("admin.questionsSubtitle")}>
        <Button
          onClick={() => setEditing(emptyQuestion(courses[0]?.id ?? ""))}
          disabled={courses.length === 0}
        >
          <Plus /> {t("admin.newQuestion")}
        </Button>
      </PanelHeader>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.titleOm || c.titleEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="mcq">{t("qtype.mcq")}</SelectItem>
            <SelectItem value="truefalse">{t("qtype.truefalse")}</SelectItem>
            <SelectItem value="short">{t("qtype.short")}</SelectItem>
            <SelectItem value="essay">{t("qtype.essay")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={approvalFilter} onValueChange={setApprovalFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="approved">{t("admin.approved")}</SelectItem>
            <SelectItem value="pending">{t("admin.pendingReview")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="space-y-3">
          {filtered.map((q) => {
            const course = courses.find((c) => c.id === q.courseId);
            return (
              <article key={q.id} className="rounded-lg border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{t(`qtype.${q.type}` as const)}</Badge>
                  <Badge variant="secondary">{t(`difficulty.${q.difficulty}` as const)}</Badge>
                  {course ? (
                    <span className="text-xs text-muted-foreground">
                      {course.titleOm || course.titleEn}
                    </span>
                  ) : null}
                  {q.topic ? (
                    <span className="text-xs text-muted-foreground">· {q.topic}</span>
                  ) : null}
                  <span className="text-xs text-muted-foreground">
                    · {q.points} {t("common.points")}
                  </span>
                  <Badge className="ml-auto" variant={q.approved ? "default" : "secondary"}>
                    {q.approved ? t("admin.approved") : t("admin.pendingReview")}
                  </Badge>
                </div>
                <p className="mt-3 font-medium">{q.text}</p>
                {q.textEn ? <p className="text-sm text-muted-foreground">{q.textEn}</p> : null}
                {q.type === "mcq" ? (
                  <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                    {q.options.map((o) => (
                      <li
                        key={o.id}
                        className={
                          o.id === q.correctOptionId
                            ? "font-medium text-primary"
                            : "text-muted-foreground"
                        }
                      >
                        {o.id === q.correctOptionId ? "✓ " : "• "}
                        {o.text}
                      </li>
                    ))}
                  </ul>
                ) : null}
                {q.type === "truefalse" ? (
                  <p className="mt-2 text-sm text-primary">
                    {t("admin.correctAnswer")}: {q.correctBool ? t("exam.true") : t("exam.false")}
                  </p>
                ) : null}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(q)}>
                    <Pencil /> {t("common.edit")}
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => void toggleApproval(q)}>
                    {q.approved ? <X /> : <Check />}
                    {q.approved ? t("admin.unapprove") : t("admin.approve")}
                  </Button>
                  <ConfirmButton
                    title={t("admin.confirmDeleteTitle")}
                    description={t("admin.confirmDeleteQuestion")}
                    confirmLabel={t("common.delete")}
                    onConfirm={() => remove(q)}
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
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.newQuestion")}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("common.course")}>
                <Select
                  value={editing.courseId}
                  onValueChange={(v) => setEditing({ ...editing, courseId: v })}
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
                  value={editing.topic}
                  onChange={(e) => setEditing({ ...editing, topic: e.target.value })}
                />
              </Field>
              <Field label={t("admin.questionType")}>
                <Select
                  value={editing.type}
                  onValueChange={(v) =>
                    setEditing({
                      ...editing,
                      type: v as QuestionType,
                      ...(v === "truefalse" ? { correctBool: editing.correctBool ?? true } : {}),
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mcq">{t("qtype.mcq")}</SelectItem>
                    <SelectItem value="truefalse">{t("qtype.truefalse")}</SelectItem>
                    <SelectItem value="short">{t("qtype.short")}</SelectItem>
                    <SelectItem value="essay">{t("qtype.essay")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("admin.difficulty")}>
                <Select
                  value={editing.difficulty}
                  onValueChange={(v) =>
                    setEditing({ ...editing, difficulty: v as Question["difficulty"] })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">{t("difficulty.easy")}</SelectItem>
                    <SelectItem value="medium">{t("difficulty.medium")}</SelectItem>
                    <SelectItem value="hard">{t("difficulty.hard")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={`${t("common.question")} (OM)`} className="sm:col-span-2">
                <Textarea
                  value={editing.text}
                  onChange={(e) => setEditing({ ...editing, text: e.target.value })}
                />
              </Field>
              <Field label={`${t("common.question")} (EN)`} className="sm:col-span-2">
                <Textarea
                  value={editing.textEn ?? ""}
                  onChange={(e) => setEditing({ ...editing, textEn: e.target.value })}
                />
              </Field>

              {editing.type === "mcq" ? (
                <div className="sm:col-span-2">
                  <Field label={t("admin.options")}>
                    <div className="space-y-2">
                      {editing.options.map((o, i) => (
                        <div key={o.id} className="flex items-center gap-2">
                          <input
                            type="radio"
                            className="size-4"
                            checked={editing.correctOptionId === o.id}
                            onChange={() => setEditing({ ...editing, correctOptionId: o.id })}
                            aria-label={t("admin.correctAnswer")}
                          />
                          <Input
                            value={o.text}
                            placeholder={`${t("admin.options")} ${i + 1}`}
                            onChange={(e) =>
                              setEditing({
                                ...editing,
                                options: editing.options.map((x) =>
                                  x.id === o.id ? { ...x, text: e.target.value } : x,
                                ),
                              })
                            }
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() =>
                              setEditing({
                                ...editing,
                                options: editing.options.filter((x) => x.id !== o.id),
                              })
                            }
                          >
                            <Trash2 />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setEditing({
                            ...editing,
                            options: [
                              ...editing.options,
                              { id: `o${editing.options.length + 1}`, text: "" },
                            ],
                          })
                        }
                      >
                        <Plus /> {t("admin.addOption")}
                      </Button>
                    </div>
                  </Field>
                </div>
              ) : null}

              {editing.type === "truefalse" ? (
                <Field label={t("admin.correctAnswer")}>
                  <Select
                    value={String(editing.correctBool ?? true)}
                    onValueChange={(v) => setEditing({ ...editing, correctBool: v === "true" })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">{t("exam.true")}</SelectItem>
                      <SelectItem value="false">{t("exam.false")}</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              ) : null}

              {editing.type === "short" || editing.type === "essay" ? (
                <>
                  <Field label={t("admin.expectedAnswer")} className="sm:col-span-2">
                    <Textarea
                      value={editing.expectedAnswer ?? ""}
                      onChange={(e) => setEditing({ ...editing, expectedAnswer: e.target.value })}
                    />
                  </Field>
                  <Field label={t("admin.rubric")} className="sm:col-span-2">
                    <Textarea
                      value={editing.rubric ?? ""}
                      onChange={(e) => setEditing({ ...editing, rubric: e.target.value })}
                    />
                  </Field>
                </>
              ) : null}

              <Field label={t("common.points")}>
                <Input
                  type="number"
                  min={1}
                  value={editing.points}
                  onChange={(e) => setEditing({ ...editing, points: Number(e.target.value) })}
                />
              </Field>
              <Field label={t("admin.tags")} hint={t("admin.tagsHint")}>
                <Input
                  value={editing.tags.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <Field label={t("admin.examLanguage")}>
                <Select
                  value={editing.language}
                  onValueChange={(v) =>
                    setEditing({ ...editing, language: v as Question["language"] })
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
              <Field label={t("admin.approved")}>
                <Select
                  value={String(editing.approved)}
                  onValueChange={(v) => setEditing({ ...editing, approved: v === "true" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">{t("admin.approved")}</SelectItem>
                    <SelectItem value="false">{t("admin.pendingReview")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button disabled={saving} onClick={() => void persist()}>
              {saving ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
