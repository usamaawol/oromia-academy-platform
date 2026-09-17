/**
 * Admin — Question bank
 */
import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n, type TranslationKey } from "@/i18n";
import {
  adminListCourses,
  adminListQuestions,
  adminSaveQuestion,
  adminDeleteQuestion,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Course, Question, QuestionOption, QuestionType, Difficulty } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/questions")({
  component: QuestionsPage,
});

const BLANK_OPT = (): QuestionOption => ({
  id: crypto.randomUUID(),
  textOm: "",
  textEn: "",
});

const BLANK: Question = {
  id: "",
  courseId: "",
  topic: "",
  type: "mcq",
  language: "om",
  difficulty: "medium",
  textOm: "",
  textEn: "",
  options: [BLANK_OPT(), BLANK_OPT(), BLANK_OPT(), BLANK_OPT()],
  expectedAnswer: "",
  rubric: "",
  points: 1,
  tags: [],
  approved: false,
};

function QuestionsPage() {
  const { t } = useI18n();
  const call = useServerFn();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question>({ ...BLANK });
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [qs, cs] = await Promise.all([
        call(adminListQuestions, {}),
        call(adminListCourses, undefined),
      ]);
      setQuestions(qs as Question[]);
      setCourses(cs as Course[]);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = questions.filter((q) => {
    if (courseFilter !== "all" && q.courseId !== courseFilter) return false;
    if (typeFilter !== "all" && q.type !== typeFilter) return false;
    return true;
  });

  function openNew() {
    setEditing({
      ...BLANK,
      id: crypto.randomUUID(),
      options: [BLANK_OPT(), BLANK_OPT(), BLANK_OPT(), BLANK_OPT()],
    });
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditing({ ...q, options: q.options.length > 0 ? q.options : [BLANK_OPT(), BLANK_OPT()] });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing.textOm.trim()) {
      toast.error("Question text (Oromoo) required");
      return;
    }
    if (!editing.courseId) {
      toast.error("Select a course");
      return;
    }
    if (editing.type === "mcq" && !editing.correctOptionId) {
      toast.error("Select correct answer");
      return;
    }
    setSaving(true);
    try {
      await call(adminSaveQuestion, { question: editing });
      toast.success(t("common.success"));
      setDialogOpen(false);
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this question?")) return;
    try {
      await call(adminDeleteQuestion, { id });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function toggleApprove(q: Question) {
    try {
      await call(adminSaveQuestion, { question: { ...q, approved: !q.approved } });
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  const courseName = (id: string) => courses.find((c) => c.id === id)?.titleEn ?? id;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t("admin.questions")}</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4 mr-1" /> {t("admin.newQuestion")}
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("common.course")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t("common.all")} {t("common.courses")}
            </SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.titleEn}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="mcq">{t("qtype.mcq")}</SelectItem>
            <SelectItem value="truefalse">{t("qtype.truefalse")}</SelectItem>
            <SelectItem value="short">{t("qtype.short")}</SelectItem>
            <SelectItem value="essay">{t("qtype.essay")}</SelectItem>
          </SelectContent>
        </Select>
        <span className="self-center text-sm text-muted-foreground">
          {filtered.length} {t("common.questions")}
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {filtered.map((q) => (
            <div key={q.id} className="flex items-start gap-3 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{q.textOm}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">
                    {courseName(q.courseId)}
                  </Badge>
                  <Badge variant="secondary" className="text-xs capitalize">
                    {q.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs capitalize">
                    {q.difficulty}
                  </Badge>
                  <Badge variant={q.approved ? "default" : "secondary"} className="text-xs">
                    {q.approved ? t("admin.approved") : t("admin.pendingReview")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {q.points} {t("common.points")}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => void toggleApprove(q)}
                  title={q.approved ? "Unapprove" : "Approve"}
                >
                  {q.approved ? (
                    <CheckCircle2 className="size-4 text-green-500" />
                  ) : (
                    <XCircle className="size-4 text-muted-foreground" />
                  )}
                </Button>
                <Button variant="ghost" size="icon" onClick={() => openEdit(q)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => void remove(q.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
          )}
        </div>
      )}

      {/* Question Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.newQuestion")}</DialogTitle>
          </DialogHeader>
          <QuestionForm
            q={editing}
            courses={courses}
            onChange={setEditing}
            onSave={() => void save()}
            onCancel={() => setDialogOpen(false)}
            saving={saving}
            t={t}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QuestionForm({
  q,
  courses,
  onChange,
  onSave,
  onCancel,
  saving,
  t,
}: {
  q: Question;
  courses: Course[];
  onChange: (q: Question) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  t: (k: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const set = <K extends keyof Question>(k: K, v: Question[K]) => onChange({ ...q, [k]: v });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>{t("common.course")} *</Label>
          <Select value={q.courseId} onValueChange={(v) => set("courseId", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.titleEn}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.topic")}</Label>
          <Input value={q.topic} onChange={(e) => set("topic", e.target.value)} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Type</Label>
          <Select value={q.type} onValueChange={(v: QuestionType) => set("type", v)}>
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
        </div>
        <div className="space-y-1.5">
          <Label>{t("admin.difficulty")}</Label>
          <Select value={q.difficulty} onValueChange={(v: Difficulty) => set("difficulty", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">{t("difficulty.easy")}</SelectItem>
              <SelectItem value="medium">{t("difficulty.medium")}</SelectItem>
              <SelectItem value="hard">{t("difficulty.hard")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>{t("common.points")}</Label>
          <Input
            type="number"
            min={1}
            value={q.points}
            onChange={(e) => set("points", Number(e.target.value))}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Question (Afaan Oromoo) *</Label>
        <Textarea value={q.textOm} onChange={(e) => set("textOm", e.target.value)} rows={3} />
      </div>
      <div className="space-y-1.5">
        <Label>Question (English)</Label>
        <Textarea value={q.textEn ?? ""} onChange={(e) => set("textEn", e.target.value)} rows={2} />
      </div>

      {/* MCQ options */}
      {q.type === "mcq" && (
        <div className="space-y-3">
          <Label>{t("common.answer")} options (select correct)</Label>
          {q.options.map((opt, i) => (
            <div
              key={opt.id}
              className={cn(
                "flex gap-2 rounded-lg border p-3",
                q.correctOptionId === opt.id && "border-green-400 bg-green-50 dark:bg-green-950",
              )}
            >
              <input
                type="radio"
                name="correct"
                checked={q.correctOptionId === opt.id}
                onChange={() => set("correctOptionId", opt.id)}
                className="mt-1 shrink-0"
              />
              <div className="flex-1 space-y-1.5">
                <Input
                  placeholder={`Option ${i + 1} (Oromoo)`}
                  value={opt.textOm}
                  onChange={(e) => {
                    const opts = q.options.map((o) =>
                      o.id === opt.id ? { ...o, textOm: e.target.value } : o,
                    );
                    set("options", opts);
                  }}
                />
                <Input
                  placeholder={`Option ${i + 1} (English)`}
                  value={opt.textEn ?? ""}
                  onChange={(e) => {
                    const opts = q.options.map((o) =>
                      o.id === opt.id ? { ...o, textEn: e.target.value } : o,
                    );
                    set("options", opts);
                  }}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() =>
                  set(
                    "options",
                    q.options.filter((o) => o.id !== opt.id),
                  )
                }
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => set("options", [...q.options, BLANK_OPT()])}
          >
            <Plus className="size-4 mr-1" /> Add option
          </Button>
        </div>
      )}

      {/* True/False */}
      {q.type === "truefalse" && (
        <div className="space-y-1.5">
          <Label>Correct answer</Label>
          <Select
            value={q.correctBool === true ? "true" : q.correctBool === false ? "false" : ""}
            onValueChange={(v) => set("correctBool", v === "true")}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">{t("exam.true")}</SelectItem>
              <SelectItem value="false">{t("exam.false")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Short/Essay */}
      {(q.type === "short" || q.type === "essay") && (
        <>
          <div className="space-y-1.5">
            <Label>Expected answer / rubric</Label>
            <Textarea
              value={q.rubric ?? ""}
              onChange={(e) => set("rubric", e.target.value)}
              rows={3}
            />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <Switch id="approved" checked={q.approved} onCheckedChange={(v) => set("approved", v)} />
        <Label htmlFor="approved">{t("admin.approved")}</Label>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
