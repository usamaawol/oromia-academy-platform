/**
 * Admin — Question bank
 */
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Pencil, Plus, Sparkles, Trash2, XCircle } from "lucide-react";
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
import { useI18n, type TranslationKey } from "@/i18n";
import {
  adminListCourses,
  adminListQuestions,
  adminSaveQuestion,
  adminDeleteQuestion,
  adminSaveCourse,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Course, Question, QuestionOption, QuestionType, Difficulty } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/questions")({
  validateSearch: (s: Record<string, unknown>): { new?: string } => ({
    ...(s["new"] === "1" ? { new: "1" as const } : {}),
  }),
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

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function QuestionsPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const search = useSearch({ from: "/_admin/admin/questions" });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Question>({ ...BLANK });
  const [courseInput, setCourseInput] = useState("");
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

  useEffect(() => {
    const newParam = (search as Record<string, string | undefined>)["new"];
    if (newParam === "1" && !loading) openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

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
    setCourseInput("");
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditing({ ...q, options: q.options.length > 0 ? q.options : [BLANK_OPT(), BLANK_OPT()] });
    const existing = courses.find((c) => c.id === q.courseId);
    setCourseInput(existing?.titleOm || existing?.titleEn || "");
    setDialogOpen(true);
  }

  async function save() {
    const courseName = courseInput.trim();
    if (!courseName) { toast.error("Maqaa koorsii galchi"); return; }
    if (!editing.textOm.trim()) { toast.error("Gaaffii (Afaan Oromoo) barreessi"); return; }
    if (editing.type === "mcq" && !editing.correctOptionId) { toast.error("Deebii sirrii filadhu"); return; }
    if (editing.type === "mcq" && editing.options.some((o) => !o.textOm.trim())) {
      toast.error("Filannoolee hunda guuti"); return;
    }

    setSaving(true);
    try {
      let courseId = editing.courseId;
      const match = courses.find(
        (c) =>
          c.titleOm.toLowerCase() === courseName.toLowerCase() ||
          c.titleEn.toLowerCase() === courseName.toLowerCase(),
      );

      if (match) {
        courseId = match.id;
      } else {
        const newId = crypto.randomUUID();
        await call(adminSaveCourse, {
          course: {
            id: newId,
            titleOm: courseName,
            titleEn: courseName,
            descOm: "",
            descEn: "",
            icon: "sparkles",
            level: "medium",
            status: "active",
            order: courses.length,
          },
        });
        courseId = newId;
        const freshCourses = await call(adminListCourses, undefined);
        setCourses(freshCourses as Course[]);
      }

      await call(adminSaveQuestion, { question: { ...editing, courseId, approved: true } });
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

  const cName = (id: string) => {
    const c = courses.find((x) => x.id === id);
    return c?.titleOm || c?.titleEn || id;
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">{t("admin.questions")}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <a href="/admin/ai-import">
              <Sparkles className="size-4 mr-1.5" />
              AI'n Galchi
            </a>
          </Button>
          <Button size="sm" onClick={openNew}>
            <Plus className="size-4 mr-1" /> {t("admin.newQuestion")}
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder={t("common.course")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")} {t("common.courses")}</SelectItem>
            {courses.map((c) => (
              <SelectItem key={c.id} value={c.id}>{c.titleOm || c.titleEn}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Gosa" />
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
          {filtered.length} gaaffii
        </span>
      </div>

      {/* Question list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-xl border">
          {filtered.map((q) => (
            <div key={q.id} className="flex items-start gap-3 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <p className="font-medium line-clamp-2">{q.textOm}</p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant="outline" className="text-xs">{cName(q.courseId)}</Badge>
                  <Badge variant="secondary" className="text-xs capitalize">{q.type}</Badge>
                  <Badge variant="outline" className="text-xs capitalize">{q.difficulty}</Badge>
                  <Badge variant={q.approved ? "default" : "secondary"} className="text-xs">
                    {q.approved ? t("admin.approved") : t("admin.pendingReview")}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{q.points} pt</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button
                  variant="ghost" size="icon"
                  onClick={() => void toggleApprove(q)}
                  title={q.approved ? "Unapprove" : "Approve"}
                >
                  {q.approved
                    ? <CheckCircle2 className="size-4 text-green-500" />
                    : <XCircle className="size-4 text-muted-foreground" />}
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editing.id && questions.some((q) => q.id === editing.id)
                ? "Gaaffii gulaali"
                : t("admin.newQuestion")}
            </DialogTitle>
          </DialogHeader>
          <QuestionForm
            q={editing}
            courses={courses}
            courseInput={courseInput}
            onCourseChange={setCourseInput}
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

// ---------------------------------------------------------------------------
// Form
// ---------------------------------------------------------------------------

function QuestionForm({
  q,
  courses,
  courseInput,
  onCourseChange,
  onChange,
  onSave,
  onCancel,
  saving,
  t,
}: {
  q: Question;
  courses: Course[];
  courseInput: string;
  onCourseChange: (v: string) => void;
  onChange: (q: Question) => void;
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
  t: (k: TranslationKey, vars?: Record<string, string | number>) => string;
}) {
  const set = <K extends keyof Question>(k: K, v: Question[K]) => onChange({ ...q, [k]: v });
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = courseInput.trim()
    ? courses.filter(
        (c) =>
          c.titleOm.toLowerCase().includes(courseInput.toLowerCase()) ||
          c.titleEn.toLowerCase().includes(courseInput.toLowerCase()),
      )
    : courses.slice(0, 6);

  const isNewCourse =
    courseInput.trim().length > 0 &&
    !courses.some(
      (c) =>
        c.titleOm.toLowerCase() === courseInput.trim().toLowerCase() ||
        c.titleEn.toLowerCase() === courseInput.trim().toLowerCase(),
    );

  return (
    <div className="space-y-4">
      {/* Course (free text) + Topic */}
      <div className="grid grid-cols-2 gap-3">
        <div className="relative space-y-1.5">
          <Label>
            Koorsii <span className="text-destructive">*</span>
          </Label>
          <div className="relative">
            <Input
              placeholder="Maqaa koorsii barreessi..."
              value={courseInput}
              autoComplete="off"
              onChange={(e) => { onCourseChange(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
            />
            {courseInput.trim() && (
              <span className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none",
                isNewCourse
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                  : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
              )}>
                {isNewCourse ? "haaraa ✦" : "✓ jira"}
              </span>
            )}
          </div>
          {/* Suggestions dropdown */}
          {showSuggestions && (suggestions.length > 0 || isNewCourse) && (
            <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
              {suggestions.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={() => { onCourseChange(c.titleOm || c.titleEn); setShowSuggestions(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors"
                >
                  <span className="flex-1 font-medium">{c.titleOm || c.titleEn}</span>
                  {c.titleEn && c.titleOm && c.titleEn !== c.titleOm && (
                    <span className="text-xs text-muted-foreground shrink-0">{c.titleEn}</span>
                  )}
                </button>
              ))}
              {isNewCourse && (
                <div className="px-3 py-2 border-t bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                  <Plus className="size-3 shrink-0" />
                  <span>"{courseInput.trim()}" — koorsii haaraa uumama</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-1.5">
          <Label>{t("admin.topic")}</Label>
          <Input
            placeholder="Mata duree (fakk. Boqonnaa 3)"
            value={q.topic}
            onChange={(e) => set("topic", e.target.value)}
          />
        </div>
      </div>

      {/* Type + Difficulty + Points */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label>Gosa gaaffii</Label>
          <Select value={q.type} onValueChange={(v: QuestionType) => set("type", v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            <SelectTrigger><SelectValue /></SelectTrigger>
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
            type="number" min={1}
            value={q.points}
            onChange={(e) => set("points", Number(e.target.value))}
          />
        </div>
      </div>

      {/* Question — Afaan Oromoo only */}
      <div className="space-y-1.5">
        <Label>
          Gaaffii (Afaan Oromoo) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          placeholder="Gaaffii kee asitti barreessi..."
          value={q.textOm}
          onChange={(e) => set("textOm", e.target.value)}
          rows={3}
          className="resize-y"
        />
      </div>

      {/* MCQ options */}
      {q.type === "mcq" && (
        <div className="space-y-2">
          <Label>
            Filannoolee deebii{" "}
            <span className="text-xs text-muted-foreground font-normal">(deebii sirrii filadhu)</span>
          </Label>
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              const isCorrect = q.correctOptionId === opt.id;
              return (
                <div
                  key={opt.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors",
                    isCorrect
                      ? "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-950/30"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => set("correctOptionId", opt.id)}
                    className={cn(
                      "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                      isCorrect
                        ? "border-green-500 bg-green-500"
                        : "border-muted-foreground/40 hover:border-primary",
                    )}
                  >
                    {isCorrect && <span className="size-2 rounded-full bg-white" />}
                  </button>
                  <span className={cn(
                    "shrink-0 text-sm font-bold w-5 text-center",
                    isCorrect ? "text-green-700 dark:text-green-400" : "text-muted-foreground",
                  )}>
                    {String.fromCharCode(65 + i)}.
                  </span>
                  <Input
                    placeholder={`Filannoo ${i + 1}`}
                    value={opt.textOm}
                    onChange={(e) => {
                      set("options", q.options.map((o) =>
                        o.id === opt.id ? { ...o, textOm: e.target.value } : o,
                      ));
                    }}
                    className="flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  {q.options.length > 2 && (
                    <Button
                      variant="ghost" size="icon"
                      className="size-7 shrink-0 text-muted-foreground/50 hover:text-destructive"
                      onClick={() => set("options", q.options.filter((o) => o.id !== opt.id))}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
          {q.options.length < 6 && (
            <Button
              variant="outline" size="sm"
              className="w-full gap-1.5 border-dashed"
              onClick={() => set("options", [...q.options, BLANK_OPT()])}
            >
              <Plus className="size-3.5" /> Filannoo dabaluu
            </Button>
          )}
          {!q.correctOptionId && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠ Deebii sirrii filuu hin dagatin
            </p>
          )}
        </div>
      )}

      {/* True/False */}
      {q.type === "truefalse" && (
        <div className="space-y-1.5">
          <Label>Deebii sirrii</Label>
          <div className="flex gap-3">
            {[
              { value: "true",  label: "✅ Dhugaa" },
              { value: "false", label: "❌ Soba"   },
            ].map(({ value, label }) => {
              const selected =
                (value === "true"  && q.correctBool === true) ||
                (value === "false" && q.correctBool === false);
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => set("correctBool", value === "true")}
                  className={cn(
                    "flex-1 rounded-xl border-2 py-3 text-sm font-semibold transition-all",
                    selected
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Short / Essay */}
      {(q.type === "short" || q.type === "essay") && (
        <div className="space-y-1.5">
          <Label>
            Deebii eegamu{" "}
            <span className="text-xs text-muted-foreground font-normal">(barsiisaaf qofa)</span>
          </Label>
          <Textarea
            placeholder="Deebii sirrii ykn yaada sakatta'iinsaaf..."
            value={q.rubric ?? ""}
            onChange={(e) => set("rubric", e.target.value)}
            rows={3}
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button variant="outline" onClick={onCancel}>{t("common.cancel")}</Button>
        <Button onClick={onSave} disabled={saving}>
          {saving ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}