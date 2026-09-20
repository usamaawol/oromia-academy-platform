/**
 * Admin — Question bank
 */
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { CheckCircle2, ClipboardPaste, Pencil, Plus, Sparkles, Trash2, XCircle } from "lucide-react";
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courseFilter, setCourseFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"paste" | "form">("paste");
  const [editing, setEditing] = useState<Question>({ ...BLANK });
  const [courseInput, setCourseInput] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [qs, cs] = await Promise.all([
        call(adminListQuestions, {}),
        call(adminListCourses, undefined),
      ]);
      setQuestions(qs as Question[]);
      setCourses(cs as Course[]);
    } catch (e) {
      const msg = serverErrorMessage(e, t);
      setLoadError(msg);
      const errStr = String((e as { message?: string })?.message ?? "");
      // Don't nag the user with a toast for transient session / hydration errors
      // the user can already see the inline error banner and the "Retry" button.
      if (!errStr.includes("auth/required") && !errStr.includes("session")) {
        toast.error(msg);
      }
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
    setDialogMode("paste"); // always open in paste mode for new questions
    setDialogOpen(true);
  }

  function openEdit(q: Question) {
    setEditing({ ...q, options: q.options.length > 0 ? q.options : [BLANK_OPT(), BLANK_OPT()] });
    const existing = courses.find((c) => c.id === q.courseId);
    setCourseInput(existing?.titleOm || existing?.titleEn || "");
    setDialogMode("form"); // edit always goes straight to form
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

  async function saveAllParsed(blocks: ParsedBlock[], courseIdOrNew: string) {
    setSaving(true);
    let saved = 0;
    try {
      // Resolve courseId — may need to create a new course
      let courseId = courseIdOrNew;
      if (courseIdOrNew.startsWith("__new__:")) {
        const courseName = courseIdOrNew.slice("__new__:".length);
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

      for (const parsed of blocks) {
        const newOpts = parsed.options.map((text) => ({
          id: crypto.randomUUID(),
          textOm: text,
          textEn: "",
        }));
        const letterIdx = ["A", "B", "C", "D", "E", "F"].indexOf(parsed.correctLetter);
        const correctOptionId = letterIdx >= 0 && newOpts[letterIdx]
          ? newOpts[letterIdx]!.id
          : undefined;

        const q: Question = {
          id: crypto.randomUUID(),
          courseId,
          topic: "",
          type: parsed.type,
          language: "om",
          difficulty: "medium",
          textOm: parsed.questionText,
          textEn: "",
          options: newOpts.length >= 2 ? newOpts : [BLANK_OPT(), BLANK_OPT(), BLANK_OPT(), BLANK_OPT()],
          ...(correctOptionId ? { correctOptionId } : {}),
          ...(parsed.type === "truefalse" ? { correctBool: parsed.correctLetter === "TRUE" } : {}),
          ...(parsed.explanation ? { rubric: parsed.explanation } : {}),
          expectedAnswer: "",
          points: 1,
          tags: ["paste-import"],
          approved: true,
        };
        await call(adminSaveQuestion, { question: q });
        saved++;
      }
      toast.success(`${saved} gaaffii milkaa'inaan galame ✓`);
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
      ) : loadError ? (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-6 text-center">
          <p className="font-semibold text-destructive mb-2">{t("common.error")}</p>
          <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words mb-4 max-w-2xl mx-auto">
            {loadError}
          </p>
          <Button onClick={() => void refresh()} size="sm">
            {t("common.retry") ?? "Retry"}
          </Button>
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
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between pr-6">
              <span>
                {editing.id && questions.some((q) => q.id === editing.id)
                  ? "Gaaffii gulaali"
                  : t("admin.newQuestion")}
              </span>
              {/* Mode toggle pills */}
              <div className="flex items-center gap-1 rounded-lg border bg-muted p-0.5 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setDialogMode("paste")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors",
                    dialogMode === "paste"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <ClipboardPaste className="size-3" /> Paste
                </button>
                <button
                  type="button"
                  onClick={() => setDialogMode("form")}
                  className={cn(
                    "flex items-center gap-1.5 rounded-md px-2.5 py-1 transition-colors",
                    dialogMode === "form"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Pencil className="size-3" /> Manual
                </button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {dialogMode === "paste" ? (
            <PasteMode
              courses={courses}
              saving={saving}
              onParsed={(parsed) => {
                const newOpts = parsed.options.map((text) => ({
                  id: crypto.randomUUID(),
                  textOm: text,
                  textEn: "",
                }));
                const letterIdx = ["A", "B", "C", "D", "E", "F"].indexOf(parsed.correctLetter);
                const correctOptionId =
                  letterIdx >= 0 && newOpts[letterIdx] ? newOpts[letterIdx]!.id : undefined;
                const patch: Partial<Question> = {
                  textOm: parsed.questionText,
                  type: parsed.type,
                  options:
                    newOpts.length >= 2
                      ? newOpts
                      : [BLANK_OPT(), BLANK_OPT(), BLANK_OPT(), BLANK_OPT()],
                };
                if (parsed.explanation) patch.rubric = parsed.explanation;
                if (correctOptionId) patch.correctOptionId = correctOptionId;
                if (parsed.type === "truefalse")
                  patch.correctBool = parsed.correctLetter === "TRUE";
                setEditing((prev) => ({ ...prev, ...patch }));
                setDialogMode("form");
              }}
              onSaveAll={(blocks, courseId) => void saveAllParsed(blocks, courseId)}
              onManual={() => setDialogMode("form")}
            />
          ) : (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Multi-question parser — splits pasted text into blocks then parses each one
// Handles: Gaaffii 1/Question 1/Q1/numbered, any case, with or without prefix
// ---------------------------------------------------------------------------

interface ParsedBlock {
  questionText: string;
  options: string[];       // text of each option (index = A=0, B=1, …)
  correctLetter: string;   // "A" | "B" | "C" | "D" | "TRUE" | "FALSE" | ""
  explanation: string;
  type: "mcq" | "truefalse" | "short";
}

/** Split raw text into individual question blocks */
function splitIntoBlocks(raw: string): string[] {
  // Split on lines that look like "Question 1:", "Gaaffii 1:", "Q1.", "1.", "1)"
  // but only when they appear at the start of a line
  const splitRe = /(?=^\s*(?:gaaffii\s*\d+\s*[:.)\s]|question\s*\d+\s*[:.)\s]|q\s*\d+\s*[:.)\s]|\d+[.):\s]\s+\S))/im;
  const blocks = raw.split(splitRe).map((b) => b.trim()).filter((b) => b.length > 5);
  // If no split markers found, treat entire text as one block
  return blocks.length > 0 ? blocks : [raw.trim()];
}

/** Parse a single question block */
function parseBlock(block: string): ParsedBlock | null {
  const allLines = block.split("\n").map((l) => l.trim()).filter(Boolean);
  if (allLines.length < 2) return null;

  // ---------------------------------------------------------------
  // Step 1: Identify the question text line.
  //   - Skip leading "Question N:", "Gaaffii N:", "N." header lines
  //   - The question text is the FIRST substantive line that is NOT an option
  // ---------------------------------------------------------------
  const isOptionLine = (l: string) => /^[\(\[]?[A-Da-d][\.\)\]\s]\s*.{1,}/i.test(l);
  const isAnswerLine = (l: string) =>
    /^(?:correct\s*answer|answer|ans|key|deebii\s*sirrii|deebii|correct)[:\s\-–]/i.test(l) ||
    /^✅/.test(l);
  const isExplanationLine = (l: string) =>
    /^(?:explanation|ibsa\s*gabaabaa?|ibsa|note|why|reason)[:\s\-–]/i.test(l);

  let questionText = "";
  let bodyStart = 0;

  for (let i = 0; i < allLines.length; i++) {
    const l = allLines[i]!;
    // Strip any leading "Question N:", "Gaaffii N:", "Q N.", "N." prefix
    const stripped = l.replace(
      /^(?:gaaffii\s*\d+\s*[:.\s]?|question\s*\d+\s*[:.\s]?|q\s*\d+\s*[:.\s]?|\d+\s*[.):]\s*)/i,
      "",
    ).trim();

    // Skip if it looks like an option, answer, or explanation line
    if (isOptionLine(stripped) || isAnswerLine(stripped) || isExplanationLine(stripped)) continue;
    // Skip very short non-question lines (like just "AI" or a number)
    if (stripped.length < 5) continue;

    questionText = stripped;
    bodyStart = i + 1;
    break;
  }

  if (!questionText) return null;

  // ---------------------------------------------------------------
  // Step 2: Parse the remaining lines for options, answer, explanation
  // ---------------------------------------------------------------
  const remaining = allLines.slice(bodyStart);
  const options: string[] = [];
  const optionLetters: string[] = []; // which letters we've seen (A, B, C, D…)
  let correctLetter = "";
  let explanation = "";
  let type: ParsedBlock["type"] = "short";

  // We only collect option lines while we're in the "options section"
  // (i.e. before an answer/explanation line). This prevents stray lines
  // from being picked up as options.
  let inOptions = true;

  for (let i = 0; i < remaining.length; i++) {
    const line = remaining[i]!;

    // Option line: "A. ...", "A) ...", "(A) ...", "A - ..."
    const optMatch = line.match(/^[\(\[]?([A-Da-d])[\.\)\]\s\-]\s*(.+)/i);
    if (optMatch && optMatch[1] && optMatch[2] && inOptions) {
      const letter = optMatch[1].toUpperCase();
      // Only accept if this letter is the expected next one (A→B→C→D order)
      // This prevents random lines starting with a letter from being treated as options
      const expectedLetter = String.fromCharCode(65 + options.length); // A, B, C, D...
      if (letter === expectedLetter || options.length === 0) {
        options.push(optMatch[2].trim());
        optionLetters.push(letter);
        type = "mcq";
      }
      continue;
    }

    // Answer line — many formats
    const ansMatch = line.match(
      /^(?:correct\s*answer|answer|ans|key|deebii\s*sirrii|deebii|correct)[:\s\-–—=]*✅?\s*([A-Da-dTtFf][a-z]*)/i,
    );
    // Also handle bare "✅ B" or "✅B"
    const emojiAns = line.match(/^✅\s*([A-Da-d])/i);
    const ansSource = ansMatch?.[1] ?? emojiAns?.[1];
    if (ansSource) {
      inOptions = false;
      const up = ansSource.toUpperCase();
      if (up === "TRUE" || up === "T") { correctLetter = "TRUE"; type = "truefalse"; }
      else if (up === "FALSE" || up === "F") { correctLetter = "FALSE"; type = "truefalse"; }
      else correctLetter = up.charAt(0);
      continue;
    }

    // Explanation line
    if (isExplanationLine(line)) {
      inOptions = false;
      const expMatch = line.match(
        /^(?:explanation|ibsa\s*gabaabaa?|ibsa|note|why|reason)[:\s\-–]*(.+)/i,
      );
      explanation = expMatch?.[1]?.trim() ?? "";
      // grab continuation lines until the next structural marker
      let j = i + 1;
      while (j < remaining.length) {
        const next = remaining[j]!;
        if (isOptionLine(next) || isAnswerLine(next) || isExplanationLine(next)) break;
        explanation += " " + next;
        j++;
      }
      i = j - 1;
      continue;
    }

    // Once we see a non-option, non-answer, non-explanation line after options,
    // stop collecting options
    if (options.length > 0) inOptions = false;
  }

  // Trim options to max 6 and only keep the standard A-D set
  const finalOptions = options.slice(0, 6);

  // If only true/false markers in options, treat as truefalse
  if (finalOptions.length === 0 && type === "short") {
    if (/\b(dhugaa|soba|true|false)\b/i.test(questionText)) type = "truefalse";
  }

  return { questionText, options: finalOptions, correctLetter, explanation, type };
}

/** Parse all questions from a multi-question paste */
function parseAllQuestions(raw: string): ParsedBlock[] {
  const blocks = splitIntoBlocks(raw);
  return blocks
    .map((b) => parseBlock(b))
    .filter((b): b is ParsedBlock => b !== null && b.questionText.length > 3);
}

// ---------------------------------------------------------------------------
// PasteMode — full-screen paste UI that handles MULTIPLE questions at once
// ---------------------------------------------------------------------------

function PasteMode({
  courses,
  saving,
  onParsed,
  onSaveAll,
  onManual,
}: {
  courses: Course[];
  saving: boolean;
  onParsed: (result: ParsedBlock) => void;
  onSaveAll: (blocks: ParsedBlock[], courseId: string) => void;
  onManual: () => void;
}) {
  const [raw, setRaw] = useState("");
  const [parsed, setParsed] = useState<ParsedBlock[]>([]);
  const [error, setError] = useState("");
  const [bulkCourseInput, setBulkCourseInput] = useState("");
  const [showCourseSug, setShowCourseSug] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  const letters = ["A", "B", "C", "D", "E", "F"];

  const courseSuggestions = bulkCourseInput.trim()
    ? courses.filter(
        (c) =>
          c.titleOm.toLowerCase().includes(bulkCourseInput.toLowerCase()) ||
          c.titleEn.toLowerCase().includes(bulkCourseInput.toLowerCase()),
      )
    : courses.slice(0, 6);

  function handleChange(val: string) {
    setRaw(val);
    setError("");
    if (val.trim().length > 10) {
      const results = parseAllQuestions(val);
      setParsed(results);
    } else {
      setParsed([]);
    }
  }

  function handleSaveAll() {
    if (parsed.length === 0) return;
    if (!selectedCourseId && !bulkCourseInput.trim()) {
      setError("Maqaa koorsii galchi"); return;
    }
    // Resolve course: use selectedCourseId if set, otherwise pass a sentinel
    // that saveAllParsed will create as a new course
    const courseId = selectedCourseId || `__new__:${bulkCourseInput.trim()}`;
    onSaveAll(parsed, courseId);
  }

  return (
    <div className="space-y-4 pt-1">
      {/* Header */}
      <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
        <p className="font-semibold text-sm flex items-center gap-2 text-primary">
          <ClipboardPaste className="size-4" />
          Gaaffilee guutuu paste godhi
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Gaaffii tokko ykn hedduuyyuu paste godhi — sirreeffamni ofumaan ta'a, gaaffiilee hunda agarsiisa.
        </p>
      </div>

      {/* Paste area */}
      <Textarea
        autoFocus
        value={raw}
        onChange={(e) => handleChange(e.target.value)}
        rows={10}
        className="font-mono text-sm resize-y bg-background"
        placeholder={`Gaaffii 1:
AI jechuun maal jechuudha?
A. Sammuu Nam-tolchee
B. Interneetii Saffisaa
C. Sagantaa Kompliitaraa
D. Kuusaa Odeeffannoo

Deebii sirrii: A
Ibsa: AI jechuun...

Gaaffii 2:
Machine Learning jechuun maal?
A. ...
B. ...`}
      />

      {error && (
        <p className="text-xs text-destructive">⚠ {error}</p>
      )}

      {/* Live preview of ALL detected questions */}
      {parsed.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5" />
            {parsed.length} gaaffii argame — gaaffii filachuudhaan galchi
          </p>
          <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
            {parsed.map((q, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card p-3 space-y-2"
              >
                {/* Question header */}
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium flex-1">{q.questionText}</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="shrink-0 h-7 px-3 text-xs gap-1"
                    onClick={() => onParsed(q)}
                  >
                    <Pencil className="size-3" /> Edit
                  </Button>
                </div>

                {/* Options */}
                {q.type === "mcq" && q.options.length > 0 && (
                  <div className="grid grid-cols-2 gap-1">
                    {q.options.map((opt, i) => (
                      <div
                        key={i}
                        className={cn(
                          "flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs",
                          q.correctLetter === letters[i]
                            ? "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 font-semibold"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        <span className={cn(
                          "grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-bold",
                          q.correctLetter === letters[i]
                            ? "bg-green-500 text-white"
                            : "bg-muted text-muted-foreground",
                        )}>
                          {letters[i]}
                        </span>
                        <span className="line-clamp-1">{opt}</span>
                      </div>
                    ))}
                  </div>
                )}

                {q.type === "truefalse" && (
                  <div className="flex gap-2 text-xs">
                    {["TRUE", "FALSE"].map((v) => (
                      <span key={v} className={cn(
                        "rounded-lg border px-3 py-1 font-medium",
                        q.correctLetter === v
                          ? "border-green-400 bg-green-50 text-green-800"
                          : "border-border text-muted-foreground",
                      )}>
                        {v === "TRUE" ? "✅ Dhugaa" : "❌ Soba"}
                      </span>
                    ))}
                  </div>
                )}

                {q.explanation && (
                  <p className="text-[11px] text-muted-foreground border-t pt-1.5 line-clamp-2">
                    <span className="font-semibold">Ibsa:</span> {q.explanation}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* ── COURSE PICKER + SAVE ALL ── */}
          <div className="rounded-xl border-2 border-primary/30 bg-primary/5 p-4 space-y-3">
            <p className="text-sm font-semibold">
              Gaaffilee hunda olkaa'i — koorsii filadhu
            </p>

            {/* Course free-text picker */}
            <div className="relative">
              <Input
                placeholder="Maqaa koorsii barreessi ykn filadhu..."
                value={bulkCourseInput}
                autoComplete="off"
                onChange={(e) => {
                  setBulkCourseInput(e.target.value);
                  setSelectedCourseId("");
                  setShowCourseSug(true);
                  setError("");
                }}
                onFocus={() => setShowCourseSug(true)}
                onBlur={() => setTimeout(() => setShowCourseSug(false), 150)}
                className="bg-background"
              />
              {showCourseSug && courseSuggestions.length > 0 && (
                <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-40 overflow-y-auto">
                  {courseSuggestions.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onMouseDown={() => {
                        setBulkCourseInput(c.titleOm || c.titleEn);
                        setSelectedCourseId(c.id);
                        setShowCourseSug(false);
                      }}
                      className="w-full flex items-center px-3 py-2.5 text-sm text-left hover:bg-accent"
                    >
                      {c.titleOm || c.titleEn}
                    </button>
                  ))}
                  {bulkCourseInput.trim() && !courses.some(
                    (c) =>
                      c.titleEn.toLowerCase() === bulkCourseInput.trim().toLowerCase() ||
                      c.titleOm.toLowerCase() === bulkCourseInput.trim().toLowerCase(),
                  ) && (
                    <div className="px-3 py-2 border-t text-xs text-amber-700 dark:text-amber-400">
                      "{bulkCourseInput.trim()}" — koorsii haaraa uumama
                    </div>
                  )}
                </div>
              )}
            </div>

            <Button
              className="w-full gap-2 text-base h-11"
              disabled={saving || !bulkCourseInput.trim()}
              onClick={handleSaveAll}
            >
              {saving ? (
                <><span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Olkaa'aa jira...</>
              ) : (
                <><CheckCircle2 className="size-5" /> Gaaffilee {parsed.length} hunda olkaa'i</>
              )}
            </Button>
          </div>
        </div>
      )}

      {raw.trim().length > 10 && parsed.length === 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          ⚠ Gaaffii argachuu hin dandeenye. Mirkaneessi: gaaffii, filannoolee (A. B. C. D.), fi deebii sirrii of-keessatti qabatee paste godhi.
        </div>
      )}

      {/* Manual link */}
      <div className="flex justify-between items-center border-t pt-3">
        <button
          type="button"
          onClick={onManual}
          className="text-xs text-muted-foreground hover:text-foreground underline-offset-2 hover:underline"
        >
          Harkaan galchi →
        </button>
        <p className="text-xs text-muted-foreground">
          Gaaffii tokko filatteen booda fooramii guutuu ni agarsiisu
        </p>
      </div>
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