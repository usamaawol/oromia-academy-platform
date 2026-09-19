/**
 * Admin — AI Question Import
 * Full workflow: paste text → AI extract → validate → review/edit → approve → save to Question Bank
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  AlertCircle,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ClipboardPaste,
  Edit2,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Sparkles,
  Trash2,
  X,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useI18n } from "@/i18n";
import {
  adminListCourses,
  adminSaveCourse,
  adminAiExtractQuestions,
  adminBulkSaveQuestions,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Course } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { AiExtractionResult, AiExtractedQuestion } from "@/lib/ai-import.server";

export const Route = createFileRoute("/_admin/admin/ai-import")({
  component: AiImportPage,
});

// ---------------------------------------------------------------------------
// Types for our editable draft questions
// ---------------------------------------------------------------------------
type DraftOption = { key: "A" | "B" | "C" | "D"; textOm: string; textEn: string };

type DraftQuestion = AiExtractedQuestion & {
  _id: string; // local UUID for React key
  _approved: boolean;
  _expanded: boolean;
  // import metadata (applied from the settings form)
  courseId: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  points: number;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const EXAMPLE_TEXT = `Question1:
AI jechuun maal jechuudha?
A. Sammuu Nam-tolchee
B. Interneetii Ofumaan Hojjetu
C. Odeeffannoo Sadarkaa Ol'aanaa
D. Appilikeeshinii Interneetii

Correct Answer: A
Explanation: AI jechuun Sammuu Nam-tolchee jechuudha. Inni hojiiwwan yeroo baay'ee sammuu namaatiin hojjetaman kompiitaraan akka raawwataman gargaaru.

Question2:
Telegram Bot jechuun maalidha?
A. Sagantaa hojiiwwan ofumaan raawwatu
B. Nama Telegram fayyadamu
C. Simkaartii haaraa
D. Computer game

Correct Answer: A
Explanation: Telegram Bot sagantaa hojiiwwan murtaa'an ofumaan raawwatuudha.

Question3:
Automation jechuun maal jechuudha?
A. Hojiiwwan tokko tokko ofumaan akka raawwataman gochuu
B. Hojii hunda harkaan hojjechuu
C. Computer cufuu
D. Internet balleessuu

Correct Answer: A
Explanation: Automation jechuun hojiiwwan tokko tokko nama irraa hirkachuu xiqqeessuun ofumaan akka raawwataman gochuudha.`;

const STEPS = ["input", "extracting", "review", "saving", "done"] as const;
type Step = (typeof STEPS)[number];

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
function AiImportPage() {
  const { t } = useI18n();
  const call = useServerFn();

  const [step, setStep] = useState<Step>("input");
  const [rawText, setRawText] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Import settings (applied to all questions by default)
  const [courseInput, setCourseInput] = useState("");
  const [courseId, setCourseId] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [points, setPoints] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Extraction state
  const [progress, setProgress] = useState<string[]>([]);
  const [extractError, setExtractError] = useState("");
  const [drafts, setDrafts] = useState<DraftQuestion[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load courses on mount
  useEffect(() => {
    void call(adminListCourses, undefined)
      .then((c) => setCourses(c as Course[]))
      .catch(() => {})
      .finally(() => setCoursesLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------------------
  // Course autocomplete helpers
  // ---------------------------------------------------------------------------
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

  function selectCourse(c: Course) {
    setCourseInput(c.titleOm || c.titleEn);
    setCourseId(c.id);
    setShowSuggestions(false);
  }

  async function resolveOrCreateCourse(): Promise<string> {
    const name = courseInput.trim();
    if (!name) throw new Error("Maqaa koorsii galchi");
    const match = courses.find(
      (c) =>
        c.titleOm.toLowerCase() === name.toLowerCase() ||
        c.titleEn.toLowerCase() === name.toLowerCase(),
    );
    if (match) return match.id;
    // Create new course
    const newId = crypto.randomUUID();
    await call(adminSaveCourse, {
      course: {
        id: newId, titleOm: name, titleEn: name,
        descOm: "", descEn: "", icon: "sparkles",
        level: "medium", status: "active", order: courses.length,
      },
    });
    const fresh = await call(adminListCourses, undefined);
    setCourses(fresh as Course[]);
    return newId;
  }

  // ---------------------------------------------------------------------------
  // Step 1 → Extract
  // ---------------------------------------------------------------------------
  async function handleExtract() {
    if (!rawText.trim()) { toast.error("Gaaffilee paste godhi"); return; }
    if (!courseInput.trim()) { toast.error("Koorsii barreessi"); return; }

    setExtractError("");
    setProgress([]);
    setStep("extracting");

    const steps = [
      "✓ Barreeffama dubbisaa jira...",
      "✓ Gaaffilee adda baasaa jira...",
      "✓ AI'n xiinxalaa jira...",
      "✓ Deebii mirkaneessaa jira...",
    ];

    // Animate progress messages
    for (let i = 0; i < steps.length - 1; i++) {
      await delay(400);
      setProgress((p) => [...p, steps[i]!]);
    }

    try {
      const result = await call(adminAiExtractQuestions, { text: rawText });
      const data = result as AiExtractionResult;

      setProgress((p) => [...p, steps[steps.length - 1]!, `✓ Gaaffii ${data.totalDetected} argame`]);

      // Resolve course
      let resolvedCourseId = courseId;
      try {
        resolvedCourseId = await resolveOrCreateCourse();
        setCourseId(resolvedCourseId);
      } catch {
        resolvedCourseId = courseId || crypto.randomUUID();
      }

      // Convert to draft questions
      const draftList: DraftQuestion[] = data.questions.map((q) => ({
        ...q,
        _id: crypto.randomUUID(),
        _approved: q.valid,
        _expanded: !q.valid, // auto-expand invalid ones so admin can fix them
        courseId: resolvedCourseId,
        topic,
        difficulty,
        points,
      }));

      setDrafts(draftList);
      await delay(300);
      setStep("review");
    } catch (err) {
      setExtractError(serverErrorMessage(err, t));
      setStep("input");
    }
  }

  // ---------------------------------------------------------------------------
  // Draft editing helpers
  // ---------------------------------------------------------------------------
  function updateDraft(id: string, patch: Partial<DraftQuestion>) {
    setDrafts((prev) => prev.map((d) => (d._id === id ? { ...d, ...patch } : d)));
  }

  function deleteDraft(id: string) {
    setDrafts((prev) => prev.filter((d) => d._id !== id));
  }

  function toggleApprove(id: string) {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d._id !== id) return d;
        return { ...d, _approved: !d._approved };
      }),
    );
  }

  function approveAll() {
    setDrafts((prev) => prev.map((d) => ({ ...d, _approved: true })));
  }

  function approveValid() {
    setDrafts((prev) => prev.map((d) => ({ ...d, _approved: d.valid })));
  }

  // ---------------------------------------------------------------------------
  // Step 3 → Save approved to Question Bank
  // ---------------------------------------------------------------------------
  async function handleSave() {
    const approved = drafts.filter((d) => d._approved);
    if (approved.length === 0) { toast.error("Gaaffilee mirkaneessuu filadhu"); return; }

    setStep("saving");

    try {
      // Build proper Question records
      const questions = approved.map((d) => {
        const opts = (d.options as DraftOption[]).map((o) => ({
          id: crypto.randomUUID(),
          textOm: o.textOm,
          textEn: o.textEn || undefined,
        }));

        // Find the correct option ID from the correctAnswer key (A/B/C/D)
        const correctIdx = ["A", "B", "C", "D"].indexOf(d.correctAnswer ?? "");
        const correctOptionId = correctIdx >= 0 ? opts[correctIdx]?.id : undefined;

        return {
          id: crypto.randomUUID(),
          courseId: d.courseId,
          topic: d.topic || "",
          type: d.type as "mcq" | "truefalse" | "short" | "essay",
          language: (d.questionEn ? "both" : "om") as "om" | "en" | "both",
          difficulty: d.difficulty,
          textOm: d.questionOm,
          textEn: d.questionEn || undefined,
          options: opts,
          correctOptionId: d.type === "mcq" ? correctOptionId : undefined,
          correctBool:
            d.type === "truefalse"
              ? d.correctAnswer?.toLowerCase() === "true"
              : undefined,
          expectedAnswer: d.type === "short" || d.type === "essay" ? d.explanationOm : undefined,
          rubric: d.explanationOm || "",
          explanationOm: d.explanationOm,
          explanationEn: d.explanationEn || undefined,
          points: d.points,
          tags: ["ai-import"],
          approved: true,
        };
      });

      const result = await call(adminBulkSaveQuestions, { questions });
      const saved = (result as { saved: number }).saved;
      toast.success(`${saved} gaaffii kuusaa gaaffilee galche`);
      setStep("done");
    } catch (err) {
      toast.error(serverErrorMessage(err, t));
      setStep("review");
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  const approvedCount = drafts.filter((d) => d._approved).length;
  const invalidCount = drafts.filter((d) => !d.valid).length;

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bot className="size-6 text-primary" />
            AI'n Gaaffilee Galchi
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gaaffilee paste godhi → AI xiinxala → mirkaneessi → Kuusaa Gaaffilee galchi
          </p>
        </div>
        {step === "review" && (
          <div className="flex gap-2 shrink-0">
            <Button variant="outline" size="sm" onClick={() => setStep("input")}>
              <RefreshCw className="size-3.5 mr-1.5" /> Haaraa
            </Button>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {[
            { id: "input", label: "1. Galchi" },
            { id: "extracting", label: "2. Xiinxali" },
            { id: "review", label: "3. Ilaali" },
            { id: "saving", label: "4. Olkaa'i" },
            { id: "done", label: "5. Xumurame" },
          ].map((s, i, arr) => {
            const stepIdx = STEPS.indexOf(step);
            const thisIdx = STEPS.indexOf(s.id as Step);
            const done = stepIdx > thisIdx;
            const active = stepIdx === thisIdx;
            return (
              <div key={s.id} className="flex items-center min-w-0">
                <div className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" :
                  done ? "bg-primary/20 text-primary" :
                  "text-muted-foreground",
                )}>
                  {done && <Check className="size-3 shrink-0" />}
                  <span className="hidden sm:inline">{s.label}</span>
                  <span className="sm:hidden">{i + 1}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={cn("h-px flex-1 min-w-4 mx-1", done || active ? "bg-primary/40" : "bg-border")} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* STEP: INPUT                                                         */}
      {/* ------------------------------------------------------------------ */}
      {(step === "input") && (
        <div className="space-y-6">
          {/* Extract error */}
          {extractError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 flex items-start gap-3">
              <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm text-destructive">AI xiinxalli kufe</p>
                <p className="text-sm text-muted-foreground mt-0.5">{extractError}</p>
                <p className="text-xs text-muted-foreground mt-1">Barreeffamni kee olitti argama. Irra deebi'ii yaalii.</p>
              </div>
            </div>
          )}

          {/* Import settings */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                Qindaa'ina Galchii
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Course free-text */}
                <div className="relative space-y-1.5">
                  <Label>Koorsii <span className="text-destructive">*</span></Label>
                  <div className="relative">
                    <Input
                      placeholder="Maqaa koorsii barreessi..."
                      value={courseInput}
                      autoComplete="off"
                      onChange={(e) => { setCourseInput(e.target.value); setCourseId(""); setShowSuggestions(true); }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    />
                    {courseInput.trim() && (
                      <span className={cn(
                        "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none",
                        isNewCourse ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                      )}>
                        {isNewCourse ? "haaraa ✦" : "✓ jira"}
                      </span>
                    )}
                  </div>
                  {showSuggestions && (suggestions.length > 0 || isNewCourse) && (
                    <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
                      {suggestions.map((c) => (
                        <button key={c.id} type="button" onMouseDown={() => selectCourse(c)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors">
                          <span className="flex-1 font-medium">{c.titleOm || c.titleEn}</span>
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
                {/* Topic */}
                <div className="space-y-1.5">
                  <Label>Mata duree</Label>
                  <Input placeholder="Mata duree (fakk. AI Fundamentals)" value={topic} onChange={(e) => setTopic(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Ulfaatina</Label>
                  <Select value={difficulty} onValueChange={(v: typeof difficulty) => setDifficulty(v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Salphaa</SelectItem>
                      <SelectItem value="medium">Giddugaleessa</SelectItem>
                      <SelectItem value="hard">Cimaa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Qabxii gaaffii tokkoof</Label>
                  <Input type="number" min={1} value={points} onChange={(e) => setPoints(Number(e.target.value))} />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Text input */}
          <Card className="border-border/60">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <ClipboardPaste className="size-4 text-primary" />
                  Gaaffilee Paste Godhi
                </CardTitle>
                <Button
                  variant="ghost" size="sm"
                  className="text-xs gap-1.5 text-muted-foreground"
                  onClick={() => setRawText(EXAMPLE_TEXT)}
                >
                  <Eye className="size-3" /> Fakkeenyaa ilaali
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                ref={textareaRef}
                placeholder={`Gaaffilee kee asitti paste godhi...\n\nFakkeenyaaf:\nQuestion1:\nAI jechuun maal jechuudha?\nA. Sammuu Nam-tolchee\nB. Interneetii\nC. Odeeffannoo\nD. Appilikeeshinii\n\nCorrect Answer: A\nExplanation: AI jechuun Sammuu Nam-tolchee jechuudha.`}
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={14}
                className="font-mono text-sm resize-y"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground">
                  {rawText.trim() ? `~${rawText.split(/Question\s*\d+/i).length - 1 || 1} gaaffii argame` : "Gaaffilee paste godhi"}
                </p>
                <Button
                  onClick={() => void handleExtract()}
                  disabled={!rawText.trim() || !courseInput.trim()}
                  className="gap-2"
                >
                  <Bot className="size-4" />
                  AI'n Gaaffilee Baasi
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Format guide */}
          <Card className="border-border/40 bg-muted/30">
            <CardContent className="p-4">
              <p className="text-xs font-semibold text-muted-foreground mb-2">📋 FORMAT FAYYADAMAA:</p>
              <pre className="text-xs text-muted-foreground whitespace-pre-wrap leading-relaxed">{`Question1:
Gaaffii kee asitti barreessi
A. Filannoo duraa
B. Filannoo lammaffaa
C. Filannoo sadaffaa
D. Filannoo afraffaa

Correct Answer: A
Explanation: Ibsa Afaan Oromootiin...

Question2:
...`}</pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP: EXTRACTING                                                    */}
      {/* ------------------------------------------------------------------ */}
      {step === "extracting" && (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center space-y-6">
            <div className="relative mx-auto size-20">
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
              <div className="relative grid size-20 place-items-center rounded-full bg-primary/15">
                <Bot className="size-10 text-primary" />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-bold">AI Xiinxalaa Jira...</h2>
              <p className="text-sm text-muted-foreground mt-1">Maaloo eegi</p>
            </div>
            <div className="max-w-sm mx-auto space-y-2 text-left">
              {progress.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 animate-in fade-in">
                  <CheckCircle2 className="size-4 shrink-0" />
                  {p}
                </div>
              ))}
              {progress.length < 4 && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 shrink-0 animate-spin" />
                  Xiinxalaa jira...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP: REVIEW                                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="rounded-xl border bg-card p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-primary/10">
                <CheckCircle2 className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-bold text-lg">{drafts.length}</p>
                <p className="text-xs text-muted-foreground">Gaaffii argame</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="grid size-10 place-items-center rounded-xl bg-green-100 dark:bg-green-900/20">
                <Check className="size-5 text-green-600" />
              </div>
              <div>
                <p className="font-bold text-lg">{approvedCount}</p>
                <p className="text-xs text-muted-foreground">Mirkana'e</p>
              </div>
            </div>
            {invalidCount > 0 && (
              <div className="flex items-center gap-2">
                <div className="grid size-10 place-items-center rounded-xl bg-amber-100 dark:bg-amber-900/20">
                  <AlertCircle className="size-5 text-amber-600" />
                </div>
                <div>
                  <p className="font-bold text-lg">{invalidCount}</p>
                  <p className="text-xs text-muted-foreground">Hatattamaan guuti</p>
                </div>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm" onClick={approveValid}>
                <Check className="size-3.5 mr-1.5" /> Sirrii Hunda Mirkaneessi
              </Button>
              <Button variant="outline" size="sm" onClick={approveAll}>
                <CheckCircle2 className="size-3.5 mr-1.5" /> Hunda Mirkaneessi
              </Button>
              <Button size="sm" onClick={() => void handleSave()} disabled={approvedCount === 0}>
                <Save className="size-3.5 mr-1.5" />
                {approvedCount} Olkaa'i
              </Button>
            </div>
          </div>

          {/* Question cards */}
          <div className="space-y-3">
            {drafts.map((d, idx) => (
              <DraftCard
                key={d._id}
                draft={d}
                index={idx}
                courses={courses}
                onUpdate={(patch) => updateDraft(d._id, patch)}
                onDelete={() => deleteDraft(d._id)}
                onToggleApprove={() => toggleApprove(d._id)}
              />
            ))}
          </div>

          {drafts.length === 0 && (
            <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
              Gaaffii hin jiru. Gaaffilee hunda balleessita moo?
            </div>
          )}

          {/* Bottom save bar */}
          {drafts.length > 0 && (
            <div className="sticky bottom-4 flex justify-end">
              <Button
                size="lg"
                className="gap-2 shadow-glow"
                onClick={() => void handleSave()}
                disabled={approvedCount === 0}
              >
                <Save className="size-4" />
                {approvedCount} Gaaffii Kuusaa Galchi
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP: SAVING                                                        */}
      {/* ------------------------------------------------------------------ */}
      {step === "saving" && (
        <Card className="border-border/60">
          <CardContent className="py-12 text-center space-y-4">
            <Loader2 className="mx-auto size-14 text-primary animate-spin" />
            <h2 className="text-lg font-bold">Olkaa'aa jira...</h2>
            <p className="text-sm text-muted-foreground">{approvedCount} gaaffii kuusaa gaaffilee galchaa jira</p>
          </CardContent>
        </Card>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* STEP: DONE                                                          */}
      {/* ------------------------------------------------------------------ */}
      {step === "done" && (
        <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/10">
          <CardContent className="py-12 text-center space-y-6">
            <div className="grid size-20 mx-auto place-items-center rounded-full bg-green-100 dark:bg-green-900/30">
              <CheckCircle2 className="size-12 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Galchi Milkaa'e! 🎉</h2>
              <p className="text-muted-foreground mt-2">
                {approvedCount} gaaffii Kuusaa Gaaffilee seene.
              </p>
            </div>
            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={() => { setStep("input"); setRawText(""); setDrafts([]); setProgress([]); }}
              >
                <Plus className="size-4 mr-1.5" /> Ammas Galchi
              </Button>
              <Button asChild>
                <a href="/admin/questions">Kuusaa Gaaffilee Ilaali</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Draft question card component
// ---------------------------------------------------------------------------
function DraftCard({
  draft,
  index,
  courses,
  onUpdate,
  onDelete,
  onToggleApprove,
}: {
  draft: DraftQuestion;
  index: number;
  courses: Course[];
  onUpdate: (patch: Partial<DraftQuestion>) => void;
  onDelete: () => void;
  onToggleApprove: () => void;
}) {
  const [editing, setEditing] = useState(false);

  const hasIssues = draft.warnings.length > 0;
  const isApproved = draft._approved;

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      isApproved ? "border-green-300 dark:border-green-700" :
      hasIssues ? "border-amber-300 dark:border-amber-700" :
      "border-border/60",
    )}>
      {/* Card header */}
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-t-xl",
        isApproved ? "bg-green-50 dark:bg-green-950/20" :
        hasIssues ? "bg-amber-50 dark:bg-amber-950/20" :
        "bg-muted/30",
      )}>
        {/* Approve toggle */}
        <button
          type="button"
          onClick={onToggleApprove}
          className={cn(
            "grid size-7 shrink-0 place-items-center rounded-full border-2 transition-colors",
            isApproved ? "border-green-500 bg-green-500 text-white" : "border-muted-foreground/40 hover:border-primary",
          )}
          title={isApproved ? "Mirkanaa'ina kaasi" : "Mirkaneessi"}
        >
          {isApproved && <Check className="size-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-muted-foreground">Q{index + 1}</span>
            <span className="font-medium text-sm truncate">{draft.questionOm || "(Gaaffii hin jiru)"}</span>
          </div>
          <div className="flex gap-1.5 mt-1 flex-wrap">
            <Badge variant="outline" className="text-[10px] py-0 capitalize">{draft.type}</Badge>
            <Badge variant="outline" className="text-[10px] py-0">
              {draft.correctAnswer ? `✓ ${draft.correctAnswer}` : "⚠ Deebii hin jiru"}
            </Badge>
            {hasIssues && !isApproved && (
              <Badge variant="secondary" className="text-[10px] py-0 text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30">
                {draft.warnings.length} dogoggora
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost" size="icon" className="size-7"
            onClick={() => setEditing((e) => !e)}
            title="Gulaali"
          >
            <Edit2 className="size-3.5" />
          </Button>
          <Button
            variant="ghost" size="icon" className="size-7"
            onClick={() => onUpdate({ _expanded: !draft._expanded })}
            title="Mul'isi/Dhoksi"
          >
            {draft._expanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
          </Button>
          <Button
            variant="ghost" size="icon" className="size-7 text-destructive hover:text-destructive"
            onClick={onDelete}
            title="Balleessi"
          >
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>

      {/* Expanded / edit view */}
      {(draft._expanded || editing) && (
        <div className="px-4 pb-4 pt-3 space-y-3">
          {/* Warnings */}
          {hasIssues && (
            <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 p-3 space-y-1">
              {draft.warnings.map((w, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-400">
                  <AlertCircle className="size-3.5 shrink-0" />
                  {w}
                </div>
              ))}
            </div>
          )}

          {editing ? (
            <EditForm draft={draft} courses={courses} onUpdate={onUpdate} onClose={() => setEditing(false)} />
          ) : (
            <PreviewContent draft={draft} />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Preview (read-only) content
// ---------------------------------------------------------------------------
function PreviewContent({ draft }: { draft: DraftQuestion }) {
  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{draft.questionOm}</p>
        {draft.questionEn && <p className="text-sm text-muted-foreground mt-0.5">{draft.questionEn}</p>}
      </div>
      {draft.type === "mcq" && draft.options.length > 0 && (
        <div className="grid grid-cols-2 gap-1.5">
          {(draft.options as DraftOption[]).map((opt) => (
            <div key={opt.key} className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
              draft.correctAnswer === opt.key
                ? "border-green-400 bg-green-50 dark:bg-green-950/30 font-medium"
                : "border-border/60",
            )}>
              <span className="font-bold text-xs w-4">{opt.key}.</span>
              <span className="flex-1">{opt.textOm}</span>
              {draft.correctAnswer === opt.key && <Check className="size-3.5 text-green-600 shrink-0" />}
            </div>
          ))}
        </div>
      )}
      {draft.type === "truefalse" && (
        <div className="flex gap-2">
          {["true", "false"].map((v) => (
            <span key={v} className={cn(
              "rounded-lg px-4 py-2 text-sm font-medium capitalize",
              draft.correctAnswer?.toLowerCase() === v ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300" : "bg-muted",
            )}>
              {v === "true" ? "✅ Dhugaa" : "❌ Soba"}
              {draft.correctAnswer?.toLowerCase() === v && " ✓"}
            </span>
          ))}
        </div>
      )}
      {draft.explanationOm && (
        <div className="rounded-lg bg-muted/40 p-3">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Ibsa:</p>
          <p className="text-sm">{draft.explanationOm}</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit form
// ---------------------------------------------------------------------------
function EditForm({
  draft,
  courses,
  onUpdate,
  onClose,
}: {
  draft: DraftQuestion;
  courses: Course[];
  onUpdate: (patch: Partial<DraftQuestion>) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState<DraftQuestion>({ ...draft });
  const opts = local.options as DraftOption[];

  function setOpt(key: "A" | "B" | "C" | "D", field: "textOm" | "textEn", value: string) {
    const updated = opts.map((o) => (o.key === key ? { ...o, [field]: value } : o));
    setLocal((p) => ({ ...p, options: updated }));
  }

  function save() {
    // Re-run basic validation
    const warnings: string[] = [];
    if (!local.questionOm.trim()) warnings.push("Question text is empty");
    if (local.type === "mcq" && !local.correctAnswer) warnings.push("Correct answer is missing");
    if (local.type === "mcq" && opts.some((o) => !o.textOm.trim())) warnings.push("Some options are empty");
    const valid = warnings.length === 0;
    onUpdate({ ...local, warnings, valid });
    onClose();
  }

  return (
    <div className="space-y-4 border-t pt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Koorsii</Label>
          <Select value={local.courseId} onValueChange={(v) => setLocal((p) => ({ ...p, courseId: v }))}>
            <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {courses.map((c) => <SelectItem key={c.id} value={c.id}>{c.titleOm || c.titleEn}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Mata duree</Label>
          <Input className="h-8 text-xs" value={local.topic} onChange={(e) => setLocal((p) => ({ ...p, topic: e.target.value }))} />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="text-xs">Gaaffii (Afaan Oromoo) *</Label>
        <Textarea rows={2} className="text-sm" value={local.questionOm} onChange={(e) => setLocal((p) => ({ ...p, questionOm: e.target.value }))} />
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Gaaffii (English)</Label>
        <Textarea rows={2} className="text-sm" value={local.questionEn} onChange={(e) => setLocal((p) => ({ ...p, questionEn: e.target.value }))} />
      </div>

      {local.type === "mcq" && (
        <div className="space-y-2">
          <Label className="text-xs">Filannoolee (deebii sirrii filadhu)</Label>
          {opts.map((opt) => (
            <div key={opt.key} className={cn(
              "flex items-center gap-2 rounded-lg border px-3 py-2",
              local.correctAnswer === opt.key ? "border-green-400 bg-green-50 dark:bg-green-950/30" : "border-border/60",
            )}>
              <button
                type="button"
                onClick={() => setLocal((p) => ({ ...p, correctAnswer: opt.key }))}
                className={cn(
                  "grid size-5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  local.correctAnswer === opt.key ? "border-green-500 bg-green-500" : "border-muted-foreground/40 hover:border-primary",
                )}
              >
                {local.correctAnswer === opt.key && <span className="size-2 rounded-full bg-white" />}
              </button>
              <span className="text-xs font-bold w-4">{opt.key}.</span>
              <Input className="flex-1 h-7 text-sm border-0 bg-transparent p-0 shadow-none focus-visible:ring-0" value={opt.textOm} onChange={(e) => setOpt(opt.key, "textOm", e.target.value)} placeholder={`Filannoo ${opt.key}`} />
            </div>
          ))}
        </div>
      )}

      {local.type === "truefalse" && (
        <div className="space-y-1.5">
          <Label className="text-xs">Deebii sirrii</Label>
          <div className="flex gap-2">
            {[{ v: "true", l: "✅ Dhugaa" }, { v: "false", l: "❌ Soba" }].map(({ v, l }) => (
              <button key={v} type="button"
                onClick={() => setLocal((p) => ({ ...p, correctAnswer: v }))}
                className={cn("flex-1 rounded-xl border-2 py-2 text-sm font-semibold transition-all",
                  local.correctAnswer === v ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40",
                )}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs">Ibsa (Afaan Oromoo)</Label>
        <Textarea rows={2} className="text-sm" value={local.explanationOm} onChange={(e) => setLocal((p) => ({ ...p, explanationOm: e.target.value }))} />
      </div>

      <Separator />
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm" onClick={onClose}><X className="size-3.5 mr-1" /> Dhiisi</Button>
        <Button size="sm" onClick={save}><Check className="size-3.5 mr-1" /> Olkaa'i</Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------
function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
