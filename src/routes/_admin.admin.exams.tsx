/**
 * Admin — Exams management
 * Full-featured exam creation wizard with PDF import, question bank, leaderboard controls.
 */
import { createFileRoute, useSearch } from "@tanstack/react-router";
import {
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  GraduationCap,
  Lock,
  Pencil,
  Plus,
  Settings2,
  Trash2,
  Upload,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n";
import {
  adminListExams,
  adminSaveExam,
  adminDeleteExam,
  adminListCourses,
  adminSaveCourse,
  adminListQuestions,
  adminSaveQuestion,
  adminAiExtractQuestions,
  getExamLeaderboard,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { cn } from "@/lib/utils";
import type { Course, Exam, Question } from "@/lib/schema";
import type { AiExtractionResult } from "@/lib/ai-import.server";

export const Route = createFileRoute("/_admin/admin/exams")({
  validateSearch: (s: Record<string, unknown>): { new?: string } => ({
    ...(s["new"] === "1" ? { new: "1" as const } : {}),
  }),
  component: ExamsPage,
});

const BLANK_EXAM: Exam = {
  id: "",
  title: "",
  courseId: "",
  topic: "",
  description: "",
  instructions: "",
  language: "om",
  startAt: null,
  endAt: null,
  durationMin: 60,
  maxAttempts: 1,
  passMark: 50,
  questionIds: [],
  poolSize: 0,
  shuffleQuestions: true,
  shuffleOptions: true,
  allowBackward: true,
  requireFullscreen: false,
  resultPolicy: "immediate",
  resultsPublishAt: null,
  status: "draft",
  hasPassword: false,
  showAnswersAfter: false,
  anonymous: true,
  pdfUrl: undefined,
  pdfName: undefined,
};

function statusVariant(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (s === "active") return "default";
  if (s === "closed") return "secondary";
  if (s === "archived") return "destructive";
  return "outline";
}

function toLocalInput(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const toNum = (v: string) => (v === "" ? 0 : Number(v));

// ---------------------------------------------------------------------------
// PDF question parser — extracts questions from plain text
// ---------------------------------------------------------------------------
type ParsedQuestion = {
  text: string;
  options: string[];
  answerIdx: number | null; // 0-based index of correct option, null = unknown
  type: "mcq" | "truefalse" | "essay";
};

function parsePdfText(raw: string): ParsedQuestion[] {
  const questions: ParsedQuestion[] = [];
  // Split by numbered question patterns like "1." "1)" "Q1."
  const blocks = raw.split(/\n(?=\s*(?:Q?\d+[\.\)]\s))/i).filter((b) => b.trim().length > 10);

  for (const block of blocks) {
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
    if (!lines.length) continue;

    // First line is the question text (strip leading number)
    const firstLine = lines[0] ?? "";
    const qText = firstLine.replace(/^Q?\d+[\.\)]\s*/i, "").trim();
    if (!qText || qText.length < 5) continue;

    const optLines = lines.slice(1);
    const options: string[] = [];
    let answerIdx: number | null = null;

    // Detect answer markers: "Answer: B", "Ans: 2", "* B", correct option marked with *
    let answerKey = "";
    const ansLine = optLines.find((l) => /^(answer|ans|key)\s*[:=]/i.test(l));
    if (ansLine) {
      answerKey = ansLine.replace(/^(answer|ans|key)\s*[:=]\s*/i, "").trim().toUpperCase();
    }

    for (const line of optLines) {
      if (/^(answer|ans|key)\s*[:=]/i.test(line)) continue;
      // Option lines: "A. ...", "a) ...", "(a) ...", "1. ...", "- ..."
      const m = line.match(/^[\(\[]?([A-Da-d1-4])[\.\)\]]\s*(.+)/);
      if (m && m[1] && m[2]) {
        const marker = m[1].toUpperCase();
        const text = m[2].trim();
        // Check if marked as correct with * prefix
        const isMarked = text.startsWith("*");
        options.push(isMarked ? text.slice(1).trim() : text);
        if (isMarked) answerIdx = options.length - 1;
        if (answerKey === marker || answerKey === String(options.length)) {
          answerIdx = options.length - 1;
        }
      }
    }

    // Detect true/false
    const tfRegex = /\b(true|false|t\/f|yes|no)\b/i;
    if (options.length === 0 && tfRegex.test(qText)) {
      questions.push({ text: qText, options: [], answerIdx: null, type: "truefalse" });
      continue;
    }

    if (options.length >= 2) {
      questions.push({ text: qText, options, answerIdx, type: "mcq" });
    } else {
      questions.push({ text: qText, options: [], answerIdx: null, type: "essay" });
    }
  }

  return questions;
}

// ---------------------------------------------------------------------------
// ExamsPage
// ---------------------------------------------------------------------------

function ExamsPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const search = useSearch({ from: "/_admin/admin/exams" });

  // ...rest of the state
  const newParam = (search as Record<string, string | undefined>)["new"];

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Exam>({ ...BLANK_EXAM });
  const [courseInput, setCourseInput] = useState("");
  const [showCourseSuggestions, setShowCourseSuggestions] = useState(false);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [wizardTab, setWizardTab] = useState("basics");
  const [qSearch, setQSearch] = useState("");

  // PDF import state
  const [pdfQuestions, setPdfQuestions] = useState<ParsedQuestion[]>([]);
  const [pdfImporting, setPdfImporting] = useState(false);
  const [aiExtracting, setAiExtracting] = useState(false);
  const [selectedPdfQs, setSelectedPdfQs] = useState<Set<number>>(new Set());
  const fileRef = useRef<HTMLInputElement>(null);
  const examPdfRef = useRef<HTMLInputElement>(null);
  const [examPdfUploading, setExamPdfUploading] = useState(false);

  // Leaderboard state
  const [lbExamId, setLbExamId] = useState<string | null>(null);
  const [lbData, setLbData] = useState<{ rank: number; nickname: string; percentage: number; passed: boolean }[]>([]);
  const [lbLoading, setLbLoading] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [e, c, q] = await Promise.all([
        call(adminListExams, undefined),
        call(adminListCourses, undefined),
        call(adminListQuestions, {}),
      ]);
      setExams(e as Exam[]);
      setCourses(c as Course[]);
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

  useEffect(() => {
    if (newParam === "1" && !loading) openNew();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newParam, loading]);

  function openNew() {
    setEditing({ ...BLANK_EXAM, id: crypto.randomUUID() });
    setCourseInput("");
    setPassword("");
    setWizardTab("basics");
    setPdfQuestions([]);
    setSelectedPdfQs(new Set());
    setDialogOpen(true);
  }

  function openEdit(e: Exam) {
    setEditing({ ...e });
    const existing = courses.find((c) => c.id === e.courseId);
    setCourseInput(existing?.titleEn || existing?.titleOm || "");
    setPassword("");
    setWizardTab("basics");
    setPdfQuestions([]);
    setSelectedPdfQs(new Set());
    setDialogOpen(true);
  }

  async function openLeaderboard(examId: string) {
    setLbExamId(examId);
    setLbLoading(true);
    try {
      const data = await call(getExamLeaderboard, { examId });
      setLbData(data as typeof lbData);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLbLoading(false);
    }
  }

  async function save() {
    if (!editing.title.trim()) { toast.error("Title required"); return; }
    if (!courseInput.trim()) { toast.error("Course name required"); return; }
    if (editing.durationMin < 1) { toast.error("Duration must be at least 1 minute"); return; }
    if (editing.passMark < 0 || editing.passMark > 100) { toast.error("Pass mark must be 0–100"); return; }
    if (editing.poolSize && editing.poolSize > editing.questionIds.length) {
      toast.error("Pool size cannot exceed selected question count"); return;
    }
    const editingExisting = exams.some((e) => e.id === editing.id);
    if (editing.hasPassword && !password && !editingExisting) {
      toast.error("Set a password for this exam"); return;
    }
    setSaving(true);
    try {
      // Resolve or create course from free-text input
      const name = courseInput.trim();
      let courseId = editing.courseId;
      const match = courses.find(
        (c) =>
          c.titleEn.toLowerCase() === name.toLowerCase() ||
          c.titleOm.toLowerCase() === name.toLowerCase(),
      );
      if (match) {
        courseId = match.id;
      } else {
        const newId = crypto.randomUUID();
        await call(adminSaveCourse, {
          course: {
            id: newId, titleOm: name, titleEn: name,
            descOm: "", descEn: "", icon: "graduation-cap",
            level: "medium", status: "active", order: courses.length,
          },
        });
        courseId = newId;
        const freshCourses = await call(adminListCourses, undefined);
        setCourses(freshCourses as Course[]);
      }
      await call(adminSaveExam, { exam: { ...editing, courseId }, ...(password ? { password } : {}) });
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
    if (!confirm("Delete this exam? This cannot be undone.")) return;
    try {
      await call(adminDeleteExam, { id });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function togglePublish(exam: Exam) {
    const newStatus = exam.status === "active" ? "draft" : "active";
    try {
      await call(adminSaveExam, { exam: { ...exam, status: newStatus } });
      toast.success(newStatus === "active" ? "Exam published" : "Exam unpublished");
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  function toggleQuestion(qid: string) {
    setEditing((prev) => ({
      ...prev,
      questionIds: prev.questionIds.includes(qid)
        ? prev.questionIds.filter((id) => id !== qid)
        : [...prev.questionIds, qid],
    }));
  }

  const set = <K extends keyof Exam>(k: K, v: Exam[K]) => setEditing((p) => ({ ...p, [k]: v }));

  // AI-powered extraction from text or uploaded file
  async function handleAiExtract(text: string) {
    if (!text.trim()) return;
    setAiExtracting(true);
    setPdfQuestions([]);
    setSelectedPdfQs(new Set());
    try {
      const result = await call(adminAiExtractQuestions, { text });
      const data = result as AiExtractionResult;
      // Convert AI questions to ParsedQuestion format for preview/selection
      const parsed: ParsedQuestion[] = data.questions.map((q) => ({
        text: q.questionOm,
        options: q.options.map((o) => o.textOm),
        answerIdx: q.correctAnswer
          ? ["A", "B", "C", "D"].indexOf(q.correctAnswer)
          : null,
        type: q.type === "truefalse" ? "truefalse" : q.type === "mcq" ? "mcq" : "essay",
        // keep extra AI data for saving
        _ai: q,
      } as ParsedQuestion & { _ai: typeof q }));
      setPdfQuestions(parsed);
      setSelectedPdfQs(new Set(parsed.map((_, i) => i)));
      toast.success(`AI found ${parsed.length} question${parsed.length !== 1 ? "s" : ""}`);
    } catch (err) {
      toast.error(serverErrorMessage(err, t));
    } finally {
      setAiExtracting(false);
    }
  }

  async function handlePdfFile(file: File) {
    if (!file) return;
    setPdfImporting(true);
    try {
      const text = await file.text();
      await handleAiExtract(text);
    } catch {
      toast.error("Could not read file");
    } finally {
      setPdfImporting(false);
    }
  }

  async function importPdfQuestions() {
    if (selectedPdfQs.size === 0) { toast.error("Select at least one question"); return; }
    const toImport = pdfQuestions.filter((_, i) => selectedPdfQs.has(i));
    setSaving(true);
    try {
      const newIds: string[] = [];
      for (const pq of toImport) {
        const qid = crypto.randomUUID();
        // Use AI enriched data if available, otherwise fall back to parsed text
        const ai = (pq as ParsedQuestion & { _ai?: AiExtractionResult["questions"][0] })._ai;
        const optObjs = ai
          ? ai.options.map((o) => ({ id: crypto.randomUUID(), textOm: o.textOm, textEn: o.textEn || "" }))
          : pq.options.map((txt) => ({ id: crypto.randomUUID(), textOm: txt, textEn: "" }));
        const correctIdx = ai
          ? ["A", "B", "C", "D"].indexOf(ai.correctAnswer ?? "")
          : pq.answerIdx;
        const resolvedCourseId = editing.courseId || courses[0]?.id || "";
        const q = {
          id: qid,
          courseId: resolvedCourseId,
          topic: editing.topic ?? "",
          type: pq.type,
          language: (ai?.questionEn ? "both" : "om") as "om" | "en" | "both",
          difficulty: "medium" as const,
          textOm: ai?.questionOm ?? pq.text,
          textEn: ai?.questionEn ?? "",
          options: optObjs,
          correctOptionId: correctIdx !== null && correctIdx >= 0 ? optObjs[correctIdx]?.id : undefined,
          correctBool: pq.type === "truefalse"
            ? (ai?.correctAnswer?.toLowerCase() === "true")
            : undefined,
          expectedAnswer: "",
          rubric: ai?.explanationOm ?? "",
          points: 1,
          tags: ["ai-import"],
          approved: true,
        };
        await call(adminSaveQuestion, { question: q });
        newIds.push(qid);
      }
      const freshQs = await call(adminListQuestions, {});
      setQuestions(freshQs as Question[]);
      setEditing((prev) => ({ ...prev, questionIds: [...new Set([...prev.questionIds, ...newIds])] }));
      setPdfQuestions([]);
      setSelectedPdfQs(new Set());
      toast.success(`Imported ${newIds.length} questions`);
      setWizardTab("questions");
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setSaving(false);
    }
  }

  async function handleExamPdfUpload(file: File) {
    if (!file) return;
    if (!file.type.includes("pdf") && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Please upload a PDF file");
      return;
    }
    setExamPdfUploading(true);
    try {
      const reader = new FileReader();
      const dataUrl = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      setEditing((prev) => ({
        ...prev,
        pdfUrl: dataUrl,
        pdfName: file.name,
      }));
      toast.success(`PDF attached: ${file.name}`);
    } catch {
      toast.error("Could not read PDF file");
    } finally {
      setExamPdfUploading(false);
    }
  }

  function removeExamPdf() {
    setEditing((prev) => ({
      ...prev,
      pdfUrl: undefined,
      pdfName: undefined,
    }));
    if (examPdfRef.current) examPdfRef.current.value = "";
  }

  const filteredQ = questions.filter(
    (q) =>
      (!editing.courseId || q.courseId === editing.courseId) &&
      (!qSearch ||
        q.textOm.toLowerCase().includes(qSearch.toLowerCase()) ||
        (q.textEn ?? "").toLowerCase().includes(qSearch.toLowerCase())),
  );
  const courseName = (id: string) => courses.find((c) => c.id === id)?.titleEn ?? id;

  const WIZARD_TABS = [
    { id: "basics", label: "Basics", icon: BookOpen },
    { id: "questions", label: "Questions", icon: CheckCircle2 },
    { id: "pdf", label: "PDF Import", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings2 },
    { id: "preview", label: "Preview", icon: Eye },
  ];

  return (
    <div className="max-w-5xl">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.exams")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {exams.length} exam{exams.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button size="sm" onClick={openNew} className="gap-1.5">
          <Plus className="size-4" /> {t("admin.newExam")}
        </Button>
      </div>

      {/* Exam list */}
      {loading ? (
        <div className="space-y-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : exams.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-muted">
              <GraduationCap className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No exams yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first exam to get started.</p>
            </div>
            <Button size="sm" onClick={openNew}><Plus className="size-4 mr-1" /> New Exam</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {exams.map((exam) => (
            <Card key={exam.id} className="border-border/60 hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10">
                    <GraduationCap className="size-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <Badge variant={statusVariant(exam.status)} className="capitalize text-xs">
                        {exam.status}
                      </Badge>
                      {exam.hasPassword && (
                        <Badge variant="outline" className="text-xs gap-1">
                          <Lock className="size-2.5" /> Password
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span>{courseName(exam.courseId)}</span>
                      <span>{exam.durationMin} min</span>
                      <span>{exam.questionIds.length} questions</span>
                      <span>{exam.maxAttempts === 0 ? "Unlimited attempts" : `${exam.maxAttempts} attempt${exam.maxAttempts !== 1 ? "s" : ""}`}</span>
                      <span>Pass: {exam.passMark}%</span>
                      {exam.showAnswersAfter && <span className="text-green-600">Shows answers</span>}
                      {exam.pdfUrl && <span className="text-primary">📄 PDF attached</span>}
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost" size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => void openLeaderboard(exam.id)}
                    >
                      <Users className="size-3.5" /> Board
                    </Button>
                    <Button
                      variant={exam.status === "active" ? "secondary" : "default"}
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => void togglePublish(exam)}
                    >
                      {exam.status === "active" ? (
                        <><XCircle className="size-3.5" /> Unpublish</>
                      ) : (
                        <><Zap className="size-3.5" /> Publish</>
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(exam)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void remove(exam.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Exam wizard dialog                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] overflow-hidden flex flex-col sm:max-w-3xl p-0">
          <DialogHeader className="px-6 pt-6 pb-0 shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-4 text-primary" />
              {editing.title || t("admin.newExam")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Fill in all tabs then click Save to publish your exam.
            </DialogDescription>
          </DialogHeader>

          {/* Tab nav */}
          <div className="px-6 pt-4 shrink-0">
            <div className="flex gap-1 overflow-x-auto pb-1">
              {WIZARD_TABS.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setWizardTab(id)}
                  className={cn(
                    "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                    wizardTab === id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent",
                  )}
                >
                  <Icon className="size-3.5 shrink-0" /> {label}
                  {id === "questions" && editing.questionIds.length > 0 && (
                    <span className={cn("ml-1 rounded-full px-1.5 text-[10px] font-bold",
                      wizardTab === id ? "bg-primary-foreground/20" : "bg-primary/10 text-primary"
                    )}>
                      {editing.questionIds.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {/* ---- BASICS ---- */}
            {wizardTab === "basics" && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Exam Title *</Label>
                  <Input
                    placeholder="e.g. Mid-term Exam — Web Development"
                    value={editing.title}
                    onChange={(e) => set("title", e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative space-y-1.5">
                    <Label>Course *</Label>
                    <div className="relative">
                      <Input
                        placeholder="Type or select a course..."
                        value={courseInput}
                        autoComplete="off"
                        onChange={(e) => {
                          setCourseInput(e.target.value);
                          set("courseId", "");
                          setShowCourseSuggestions(true);
                        }}
                        onFocus={() => setShowCourseSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowCourseSuggestions(false), 150)}
                      />
                      {courseInput.trim() && (
                        <span className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold px-1.5 py-0.5 rounded pointer-events-none",
                          !courses.some(
                            (c) =>
                              c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() ||
                              c.titleOm.toLowerCase() === courseInput.trim().toLowerCase(),
                          )
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                            : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
                        )}>
                          {!courses.some(
                            (c) =>
                              c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() ||
                              c.titleOm.toLowerCase() === courseInput.trim().toLowerCase(),
                          ) ? "new ✦" : "✓ exists"}
                        </span>
                      )}
                    </div>
                    {showCourseSuggestions && (
                      <div className="absolute z-50 left-0 right-0 top-full mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden max-h-48 overflow-y-auto">
                        {(courseInput.trim()
                          ? courses.filter(
                              (c) =>
                                c.titleEn.toLowerCase().includes(courseInput.toLowerCase()) ||
                                c.titleOm.toLowerCase().includes(courseInput.toLowerCase()),
                            )
                          : courses.slice(0, 6)
                        ).map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onMouseDown={() => {
                              setCourseInput(c.titleEn || c.titleOm);
                              set("courseId", c.id);
                              setShowCourseSuggestions(false);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left hover:bg-accent transition-colors"
                          >
                            <span className="flex-1 font-medium">{c.titleEn || c.titleOm}</span>
                            {c.titleOm && c.titleEn && c.titleOm !== c.titleEn && (
                              <span className="text-xs text-muted-foreground shrink-0">{c.titleOm}</span>
                            )}
                          </button>
                        ))}
                        {courseInput.trim() && !courses.some(
                          (c) =>
                            c.titleEn.toLowerCase() === courseInput.trim().toLowerCase() ||
                            c.titleOm.toLowerCase() === courseInput.trim().toLowerCase(),
                        ) && (
                          <div className="px-3 py-2 border-t bg-amber-50/50 dark:bg-amber-950/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                            <Plus className="size-3 shrink-0" />
                            <span>"{courseInput.trim()}" — will be created as a new course</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Status</Label>
                    <Select value={editing.status} onValueChange={(v: Exam["status"]) => set("status", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">📝 Draft (hidden)</SelectItem>
                        <SelectItem value="active">✅ Active (visible)</SelectItem>
                        <SelectItem value="closed">🔒 Closed</SelectItem>
                        <SelectItem value="archived">📦 Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label>Topic / Subject</Label>
                    <Input value={editing.topic ?? ""} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Chapter 3 — Variables" />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Language</Label>
                    <Select value={editing.language} onValueChange={(v: Exam["language"]) => set("language", v)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="om">Afaan Oromoo</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="both">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Description (shown to students before they start)</Label>
                  <Textarea value={editing.description ?? ""} onChange={(e) => set("description", e.target.value)} rows={2} placeholder="Brief overview of this exam..." />
                </div>
                <div className="space-y-1.5">
                  <Label>Instructions (shown on exam start screen)</Label>
                  <Textarea value={editing.instructions ?? ""} onChange={(e) => set("instructions", e.target.value)} rows={3} placeholder="Read each question carefully. No external resources allowed..." />
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label>Exam Paper PDF (optional)</Label>
                  <p className="text-xs text-muted-foreground mb-2">
                    Upload a PDF version of the exam paper that students can download/view before or during the exam.
                  </p>
                  <input
                    ref={examPdfRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handleExamPdfUpload(f);
                    }}
                  />
                  {editing.pdfUrl ? (
                    <div className="flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10">
                        <FileText className="size-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{editing.pdfName}</p>
                        <p className="text-xs text-muted-foreground">PDF attached — students can download</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(editing.pdfUrl, "_blank")}
                          className="gap-1 text-xs"
                        >
                          <Eye className="size-3.5" /> View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={removeExamPdf}
                          className="gap-1 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-3.5" /> Remove
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
                      <FileText className="mx-auto size-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">No PDF attached</p>
                      <p className="text-xs text-muted-foreground mt-1 mb-3">
                        Upload the exam paper as a PDF file
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => examPdfRef.current?.click()}
                        disabled={examPdfUploading}
                        className="gap-1.5"
                      >
                        <Upload className="size-4" />
                        {examPdfUploading ? "Uploading..." : "Upload PDF"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---- QUESTIONS ---- */}
            {wizardTab === "questions" && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{editing.questionIds.length} questions selected</p>
                    <p className="text-xs text-muted-foreground">Filtered to {editing.courseId ? courseName(editing.courseId) : "all courses"}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => {
                    const allIds = filteredQ.map((q) => q.id);
                    const allSelected = allIds.every((id) => editing.questionIds.includes(id));
                    if (allSelected) {
                      setEditing((p) => ({ ...p, questionIds: p.questionIds.filter((id) => !allIds.includes(id)) }));
                    } else {
                      setEditing((p) => ({ ...p, questionIds: [...new Set([...p.questionIds, ...allIds])] }));
                    }
                  }}>
                    {filteredQ.every((q) => editing.questionIds.includes(q.id)) ? "Deselect All" : "Select All"}
                  </Button>
                </div>
                <Input
                  placeholder="Search questions..."
                  value={qSearch}
                  onChange={(e) => setQSearch(e.target.value)}
                />
                <div className="max-h-[380px] overflow-y-auto divide-y rounded-xl border">
                  {filteredQ.length === 0 ? (
                    <div className="py-10 text-center text-sm text-muted-foreground">
                      No questions found. Add questions to the bank first or use PDF Import.
                    </div>
                  ) : (
                    filteredQ.map((q) => {
                      const selected = editing.questionIds.includes(q.id);
                      return (
                        <label key={q.id} className={cn(
                          "flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors",
                          selected ? "bg-primary/5" : "hover:bg-muted/40",
                        )}>
                          <Checkbox
                            checked={selected}
                            onCheckedChange={() => toggleQuestion(q.id)}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm line-clamp-2">{q.textOm}</p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                              <Badge variant="outline" className="text-[10px] py-0">{q.type}</Badge>
                              <Badge variant="outline" className="text-[10px] py-0 capitalize">{q.difficulty}</Badge>
                              {q.approved ? (
                                <span className="text-[10px] text-green-600">✓ Approved</span>
                              ) : (
                                <span className="text-[10px] text-amber-600">⚠ Pending</span>
                              )}
                            </div>
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground font-mono">{q.points}pt</span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* ---- PDF IMPORT ---- */}
            {wizardTab === "pdf" && (
              <div className="space-y-4">
                {/* File upload — AI extracts from text files */}
                <div className="rounded-xl border-2 border-dashed border-border p-6 text-center">
                  <FileText className="mx-auto size-10 text-muted-foreground mb-3" />
                  <p className="font-medium">AI Question Extraction</p>
                  <p className="text-sm text-muted-foreground mt-1 mb-4">
                    Upload a <strong>.txt</strong> file or paste questions below — the AI will extract and structure them automatically.
                  </p>
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".txt,.text,.pdf"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void handlePdfFile(f);
                    }}
                  />
                  <Button
                    variant="outline"
                    onClick={() => fileRef.current?.click()}
                    disabled={pdfImporting || aiExtracting}
                  >
                    <Upload className="size-4 mr-2" />
                    {pdfImporting ? "Reading file..." : "Choose File"}
                  </Button>
                </div>

                {/* Paste area with AI extract button */}
                <div className="space-y-2">
                  <Label>Or paste your questions directly</Label>
                  <Textarea
                    id="pdf-paste"
                    rows={8}
                    placeholder={`Gaaffii 1:\nArtificial Intelligence (AI) jechuun maal jechuudha?\nA. Kompiitara suuraa qofa kaasu\nB. Sirna kompiitaraa hojii sammuu namaa fakkaatu\nC. Kompiitara cimsanii ibsaa isaa dabalu\nD. Internet qofa fayyadamu\n\nDeebii sirrii: ✅ B\nIbsa: AI jechuun teeknooloojii...`}
                    className="font-mono text-sm"
                    disabled={aiExtracting}
                  />
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      Supports Afaan Oromoo, English, and mixed-language questions with any answer format.
                    </p>
                    <Button
                      onClick={() => {
                        const ta = document.getElementById("pdf-paste") as HTMLTextAreaElement | null;
                        void handleAiExtract(ta?.value ?? "");
                      }}
                      disabled={aiExtracting || pdfImporting}
                      className="gap-2 shrink-0"
                    >
                      {aiExtracting ? (
                        <><span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> Extracting...</>
                      ) : (
                        <><Upload className="size-4" /> AI'n Baasi</>
                      )}
                    </Button>
                  </div>
                </div>

                {pdfQuestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{pdfQuestions.length} questions detected</p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedPdfQs(new Set(pdfQuestions.map((_, i) => i)))}>Select All</Button>
                        <Button variant="outline" size="sm" onClick={() => setSelectedPdfQs(new Set())}>None</Button>
                      </div>
                    </div>
                    <div className="max-h-72 overflow-y-auto space-y-2 rounded-xl border p-2">
                      {pdfQuestions.map((pq, i) => (
                        <label key={i} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-muted/40">
                          <Checkbox
                            checked={selectedPdfQs.has(i)}
                            onCheckedChange={(v) => {
                              setSelectedPdfQs((prev) => {
                                const next = new Set(prev);
                                v ? next.add(i) : next.delete(i);
                                return next;
                              });
                            }}
                            className="mt-0.5 shrink-0"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{pq.text}</p>
                            {pq.options.length > 0 && (
                              <ul className="mt-1 space-y-0.5">
                                {pq.options.map((opt, oi) => (
                                  <li key={oi} className={cn("text-xs",
                                    pq.answerIdx === oi ? "text-green-600 font-semibold" : "text-muted-foreground"
                                  )}>
                                    {String.fromCharCode(65 + oi)}. {opt}
                                    {pq.answerIdx === oi && " ✓"}
                                  </li>
                                ))}
                              </ul>
                            )}
                            <Badge variant="outline" className="text-[10px] mt-1">{pq.type}</Badge>
                          </div>
                        </label>
                      ))}
                    </div>
                    <Button
                      onClick={() => void importPdfQuestions()}
                      disabled={saving || selectedPdfQs.size === 0}
                      className="w-full"
                    >
                      {saving ? "Importing..." : `Add ${selectedPdfQs.size} question${selectedPdfQs.size !== 1 ? "s" : ""} to Exam`}
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* ---- SETTINGS ---- */}
            {wizardTab === "settings" && (
              <div className="space-y-5">
                {/* Timing */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs">⏱</span>
                    Timing & Attempts
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label>Duration (minutes) *</Label>
                      <Input type="number" min={1} value={editing.durationMin} onChange={(e) => set("durationMin", toNum(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Max Attempts (0 = unlimited)</Label>
                      <Input type="number" min={0} value={editing.maxAttempts} onChange={(e) => set("maxAttempts", toNum(e.target.value))} />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Pass Mark (%)</Label>
                      <Input type="number" min={0} max={100} value={editing.passMark} onChange={(e) => set("passMark", toNum(e.target.value))} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div className="space-y-1.5">
                      <Label>Start Time (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={toLocalInput(editing.startAt)}
                        onChange={(e) => set("startAt", e.target.value ? new Date(e.target.value).getTime() : null)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>End Time (optional)</Label>
                      <Input
                        type="datetime-local"
                        value={toLocalInput(editing.endAt)}
                        onChange={(e) => set("endAt", e.target.value ? new Date(e.target.value).getTime() : null)}
                      />
                    </div>
                  </div>
                  <div className="mt-3 space-y-1.5">
                    <Label>Questions per student (pool, 0 = all selected)</Label>
                    <Input type="number" min={0} value={editing.poolSize} onChange={(e) => set("poolSize", toNum(e.target.value))} className="max-w-xs" />
                  </div>
                </div>

                <Separator />

                {/* Password */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs">🔒</span>
                    Access Control
                  </h3>
                  <div className="flex items-center gap-3 rounded-xl border p-3">
                    <Switch
                      id="has-pw"
                      checked={editing.hasPassword ?? false}
                      onCheckedChange={(v) => set("hasPassword", v)}
                    />
                    <div className="flex-1">
                      <Label htmlFor="has-pw" className="font-medium">Require exam password</Label>
                      <p className="text-xs text-muted-foreground">Students must enter a password before starting</p>
                    </div>
                  </div>
                  {editing.hasPassword && (
                    <div className="mt-3 space-y-1.5">
                      <Label>
                        {exams.some((e) => e.id === editing.id)
                          ? "New password (leave blank to keep existing)"
                          : "Exam password *"}
                      </Label>
                      <Input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  )}
                </div>

                <Separator />

                {/* Behaviour toggles */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs">⚙</span>
                    Exam Behaviour
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["shuffleQuestions", "Shuffle question order"],
                      ["shuffleOptions", "Shuffle answer options"],
                      ["allowBackward", "Allow going back to prev questions"],
                      ["requireFullscreen", "Require fullscreen mode"],
                    ] as const).map(([key, label]) => (
                      <div key={key} className="flex items-center gap-3 rounded-xl border p-3">
                        <Switch
                          id={key}
                          checked={Boolean(editing[key as keyof Exam])}
                          onCheckedChange={(v) => set(key as keyof Exam, v as Exam[keyof Exam])}
                        />
                        <Label htmlFor={key} className="text-sm leading-snug cursor-pointer">{label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Result policy */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <span className="grid size-5 place-items-center rounded bg-primary/10 text-primary text-xs">📊</span>
                    Result Publication
                  </h3>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>When to publish results to students</Label>
                      <Select value={editing.resultPolicy} onValueChange={(v: Exam["resultPolicy"]) => set("resultPolicy", v)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="immediate">⚡ Immediate — right after submission</SelectItem>
                          <SelectItem value="manual">✋ Manual — you publish when ready</SelectItem>
                          <SelectItem value="scheduled">📅 Scheduled — at a specific date/time</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    {editing.resultPolicy === "scheduled" && (
                      <div className="space-y-1.5">
                        <Label>Publish results at</Label>
                        <Input
                          type="datetime-local"
                          value={toLocalInput(editing.resultsPublishAt)}
                          onChange={(e) => set("resultsPublishAt", e.target.value ? new Date(e.target.value).getTime() : null)}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-3 rounded-xl border p-3">
                      <Switch
                        id="show-answers"
                        checked={editing.showAnswersAfter ?? false}
                        onCheckedChange={(v) => set("showAnswersAfter", v)}
                      />
                      <div>
                        <Label htmlFor="show-answers" className="font-medium">Show correct / wrong answers after result</Label>
                        <p className="text-xs text-muted-foreground">Students can review which questions they got right or wrong</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border p-3">
                      <Switch
                        id="anonymous"
                        checked={editing.anonymous ?? true}
                        onCheckedChange={(v) => set("anonymous", v)}
                      />
                      <div>
                        <Label htmlFor="anonymous" className="font-medium">Anonymous leaderboard</Label>
                        <p className="text-xs text-muted-foreground">Show nicknames instead of real names on the score board</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ---- PREVIEW ---- */}
            {wizardTab === "preview" && (
              <div className="space-y-4">
                <div className="rounded-xl border bg-muted/30 p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-bold">{editing.title || "Untitled Exam"}</h2>
                      {editing.description && <p className="text-sm text-muted-foreground mt-1">{editing.description}</p>}
                    </div>
                    <Badge variant={statusVariant(editing.status)} className="capitalize shrink-0">{editing.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      ["Course", courseName(editing.courseId) || "—"],
                      ["Duration", `${editing.durationMin} min`],
                      ["Questions", `${editing.questionIds.length} (pool: ${editing.poolSize || "all"})`],
                      ["Max Attempts", editing.maxAttempts === 0 ? "Unlimited" : String(editing.maxAttempts)],
                      ["Pass Mark", `${editing.passMark}%`],
                      ["Result Policy", editing.resultPolicy],
                      ["Password", editing.hasPassword ? "Yes" : "No"],
                      ["Show Answers", editing.showAnswersAfter ? "Yes" : "No"],
                      ["Exam PDF", editing.pdfName ? `📄 ${editing.pdfName}` : "None"],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between rounded-lg bg-background p-2.5">
                        <span className="text-muted-foreground text-xs">{k}</span>
                        <span className="font-medium text-xs truncate max-w-[60%]">{v}</span>
                      </div>
                    ))}
                  </div>
                  {editing.pdfUrl && (
                    <div className="flex items-center gap-2 rounded-lg bg-primary/5 p-2.5">
                      <FileText className="size-4 text-primary shrink-0" />
                      <span className="text-xs font-medium flex-1 truncate">{editing.pdfName}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1 text-[11px]"
                        onClick={() => window.open(editing.pdfUrl, "_blank")}
                      >
                        <Eye className="size-3" /> View
                      </Button>
                    </div>
                  )}
                  {editing.instructions && (
                    <div className="rounded-lg bg-background p-3">
                      <p className="text-xs font-semibold text-muted-foreground mb-1">Instructions</p>
                      <p className="text-sm whitespace-pre-line">{editing.instructions}</p>
                    </div>
                  )}
                </div>

                {/* Selected questions preview */}
                {editing.questionIds.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Selected Questions ({editing.questionIds.length})</p>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {editing.questionIds.map((qid, i) => {
                        const q = questions.find((x) => x.id === qid);
                        return (
                          <div key={qid} className="flex items-start gap-2.5 rounded-lg bg-muted/40 px-3 py-2">
                            <span className="text-xs text-muted-foreground font-mono shrink-0 mt-0.5">{i + 1}.</span>
                            <p className="text-sm line-clamp-1">{q?.textOm ?? "Unknown question"}</p>
                            <Badge variant="outline" className="text-[10px] shrink-0 ml-auto">{q?.points ?? 1}pt</Badge>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {editing.questionIds.length === 0 && (
                  <div className="rounded-xl border-2 border-dashed p-6 text-center text-sm text-muted-foreground">
                    No questions selected yet. Go to the Questions tab to add them.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <Separator />
          <div className="flex items-center justify-between px-6 py-4 shrink-0">
            <div className="flex gap-2">
              {wizardTab !== "basics" && (
                <Button variant="outline" size="sm" onClick={() => {
                  const idx = WIZARD_TABS.findIndex((t) => t.id === wizardTab);
                  const prev = WIZARD_TABS[idx - 1];
                  if (prev) setWizardTab(prev.id);
                }}>
                  <ChevronLeft className="size-4 mr-1" /> Back
                </Button>
              )}
              {wizardTab !== "preview" && (
                <Button variant="outline" size="sm" onClick={() => {
                  const idx = WIZARD_TABS.findIndex((t) => t.id === wizardTab);
                  const next = WIZARD_TABS[idx + 1];
                  if (next) setWizardTab(next.id);
                }}>
                  Next <ChevronRight className="size-4 ml-1" />
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={() => void save()} disabled={saving}>
                {saving ? "Saving..." : "Save Exam"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ------------------------------------------------------------------ */}
      {/* Leaderboard dialog                                                  */}
      {/* ------------------------------------------------------------------ */}
      <Dialog open={!!lbExamId} onOpenChange={(open) => { if (!open) setLbExamId(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="size-4 text-primary" /> Leaderboard
            </DialogTitle>
            <DialogDescription>Anonymous rankings for this exam.</DialogDescription>
          </DialogHeader>
          {lbLoading ? (
            <div className="space-y-2 py-4">
              {[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-10 rounded-lg" />)}
            </div>
          ) : lbData.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No published results yet for this exam.
            </div>
          ) : (
            <div className="space-y-2 py-2 max-h-80 overflow-y-auto">
              {lbData.map((entry) => (
                <div key={entry.rank} className={cn(
                  "flex items-center gap-3 rounded-xl px-4 py-2.5",
                  entry.rank === 1 ? "bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800" :
                  entry.rank === 2 ? "bg-slate-50 dark:bg-slate-900/30 border" :
                  entry.rank === 3 ? "bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800" :
                  "bg-muted/40",
                )}>
                  <span className={cn("w-7 text-center text-sm font-bold shrink-0",
                    entry.rank === 1 ? "text-amber-600" :
                    entry.rank === 2 ? "text-slate-500" :
                    entry.rank === 3 ? "text-orange-600" : "text-muted-foreground",
                  )}>
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : entry.rank === 3 ? "🥉" : `#${entry.rank}`}
                  </span>
                  <span className="flex-1 font-medium text-sm">{entry.nickname}</span>
                  <span className="text-sm font-semibold tabular-nums">{entry.percentage}%</span>
                  <Badge variant={entry.passed ? "default" : "destructive"} className="text-xs">
                    {entry.passed ? "Pass" : "Fail"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
