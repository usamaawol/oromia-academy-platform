/**
 * Admin — Exams management
 */
import { createFileRoute } from "@tanstack/react-router";
import { CheckSquare, ChevronDown, ChevronUp, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useI18n } from "@/i18n";
import {
  adminListExams,
  adminSaveExam,
  adminDeleteExam,
  adminListCourses,
  adminListQuestions,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Course, Exam, Question } from "@/lib/schema";

export const Route = createFileRoute("/_admin/admin/exams")({
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
};

function statusVariant(s: string): "default" | "secondary" | "outline" | "destructive" {
  if (s === "active") return "default";
  if (s === "closed") return "secondary";
  if (s === "archived") return "destructive";
  return "outline";
}

/** Format a timestamp for a `<input type="datetime-local">` (local time, not UTC). */
function toLocalInput(ms: number | null): string {
  if (!ms) return "";
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(
    d.getMinutes(),
  )}`;
}

const toNum = (v: string) => (v === "" ? 0 : Number(v));

function ExamsPage() {
  const { t } = useI18n();
  const call = useServerFn();

  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Exam>({ ...BLANK_EXAM });
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [qSearch, setQSearch] = useState("");

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

  function openNew() {
    setEditing({ ...BLANK_EXAM, id: crypto.randomUUID() });
    setPassword("");
    setDialogOpen(true);
  }

  function openEdit(e: Exam) {
    setEditing({ ...e });
    setPassword("");
    setDialogOpen(true);
  }

  async function save() {
    if (!editing.title.trim()) {
      toast.error("Title required");
      return;
    }
    if (!editing.courseId) {
      toast.error("Select a course");
      return;
    }
    if (editing.durationMin < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }
    if (editing.passMark < 0 || editing.passMark > 100) {
      toast.error("Pass mark must be between 0 and 100");
      return;
    }
    if (editing.poolSize && editing.poolSize > editing.questionIds.length) {
      toast.error("Pool size cannot be larger than the number of selected questions");
      return;
    }
    const editingExisting = exams.some((e) => e.id === editing.id);
    if (editing.hasPassword && !password && !editingExisting) {
      toast.error("Set a password for this exam");
      return;
    }
    setSaving(true);
    try {
      await call(adminSaveExam, { exam: editing, ...(password ? { password } : {}) });
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
    if (!confirm("Delete this exam?")) return;
    try {
      await call(adminDeleteExam, { id });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  function toggleQuestion(qid: string) {
    setEditing((prev) => {
      const ids = prev.questionIds.includes(qid)
        ? prev.questionIds.filter((id) => id !== qid)
        : [...prev.questionIds, qid];
      return { ...prev, questionIds: ids };
    });
  }

  const set = <K extends keyof Exam>(k: K, v: Exam[K]) => setEditing((p) => ({ ...p, [k]: v }));

  const filteredQ = questions.filter(
    (q) =>
      (!editing.courseId || q.courseId === editing.courseId) &&
      (!qSearch || q.textOm.toLowerCase().includes(qSearch.toLowerCase())),
  );

  const courseName = (id: string) => courses.find((c) => c.id === id)?.titleEn ?? id;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.exams")}</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4 mr-1" /> {t("admin.newExam")}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="divide-y rounded-lg border">
          {exams.map((exam) => (
            <div key={exam.id} className="flex items-start gap-4 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold">{exam.title}</h3>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  <Badge variant={statusVariant(exam.status)} className="capitalize text-xs">
                    {exam.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{courseName(exam.courseId)}</span>
                  <span className="text-xs text-muted-foreground">
                    {exam.durationMin} min · {exam.questionIds.length} {t("common.questions")}
                  </span>
                  {exam.hasPassword && (
                    <Badge variant="outline" className="text-xs">
                      Password
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" onClick={() => openEdit(exam)}>
                  <Pencil className="size-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => void remove(exam.id)}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
          {exams.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
          )}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing.title || t("admin.newExam")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* Basic */}
            <div className="space-y-1.5">
              <Label>{t("admin.examTitle")} *</Label>
              <Input value={editing.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>{t("common.course")} *</Label>
                <Select value={editing.courseId} onValueChange={(v) => set("courseId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
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
                <Label>{t("common.status")}</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v: Exam["status"]) => set("status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("status.draft")}</SelectItem>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="closed">{t("status.closed")}</SelectItem>
                    <SelectItem value="archived">{t("status.archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>{t("admin.examDescription")}</Label>
              <Textarea
                value={editing.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("admin.examInstructions")}</Label>
              <Textarea
                value={editing.instructions ?? ""}
                onChange={(e) => set("instructions", e.target.value)}
                rows={2}
              />
            </div>

            {/* Timing */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t("admin.durationMin")} *</Label>
                <Input
                  type="number"
                  min={1}
                  value={editing.durationMin}
                  onChange={(e) => set("durationMin", toNum(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.startAt")}</Label>
                <Input
                  type="datetime-local"
                  value={toLocalInput(editing.startAt)}
                  onChange={(e) =>
                    set("startAt", e.target.value ? new Date(e.target.value).getTime() : null)
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.endAt")}</Label>
                <Input
                  type="datetime-local"
                  value={toLocalInput(editing.endAt)}
                  onChange={(e) =>
                    set("endAt", e.target.value ? new Date(e.target.value).getTime() : null)
                  }
                />
              </div>
            </div>

            {/* Config */}
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t("admin.maxAttempts")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.maxAttempts}
                  onChange={(e) => set("maxAttempts", toNum(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.passMark")}</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={editing.passMark}
                  onChange={(e) => set("passMark", toNum(e.target.value))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t("admin.poolSize")}</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.poolSize}
                  onChange={(e) => set("poolSize", toNum(e.target.value))}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Switch
                  id="has-pw"
                  checked={editing.hasPassword ?? false}
                  onCheckedChange={(v) => set("hasPassword", v)}
                />
                <Label htmlFor="has-pw">Require password</Label>
              </div>
              {editing.hasPassword && (
                <Input
                  type="password"
                  placeholder="New password (leave blank to keep existing)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              )}
            </div>

            {/* Toggles */}
            <div className="grid grid-cols-2 gap-3">
              {[
                ["shuffleQuestions", t("admin.shuffleQuestions")],
                ["shuffleOptions", t("admin.shuffleOptions")],
                ["allowBackward", t("admin.allowBackward")],
                ["requireFullscreen", t("admin.requireFullscreen")],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <Switch
                    id={key}
                    checked={Boolean(editing[key as keyof Exam])}
                    onCheckedChange={(v) => set(key as keyof Exam, v as Exam[keyof Exam])}
                  />
                  <Label htmlFor={key} className="text-sm">
                    {label}
                  </Label>
                </div>
              ))}
            </div>

            {/* Result policy */}
            <div className="space-y-1.5">
              <Label>{t("admin.resultPolicy")}</Label>
              <Select
                value={editing.resultPolicy}
                onValueChange={(v: Exam["resultPolicy"]) => set("resultPolicy", v)}
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
            </div>

            {/* Question selector */}
            <div className="space-y-2">
              <Label>
                {t("admin.selectQuestions")} ({editing.questionIds.length} selected)
              </Label>
              <Input
                placeholder={t("common.search")}
                value={qSearch}
                onChange={(e) => setQSearch(e.target.value)}
              />
              <div className="max-h-56 overflow-y-auto divide-y rounded-lg border">
                {filteredQ.map((q) => (
                  <label
                    key={q.id}
                    className="flex cursor-pointer items-start gap-2.5 px-3 py-2.5 hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={editing.questionIds.includes(q.id)}
                      onCheckedChange={() => toggleQuestion(q.id)}
                    />
                    <span className="flex-1 text-sm line-clamp-2">{q.textOm}</span>
                    <span className="shrink-0 text-xs text-muted-foreground">{q.points}pt</span>
                  </label>
                ))}
                {filteredQ.length === 0 && (
                  <p className="py-6 text-center text-sm text-muted-foreground">
                    {t("common.notFound")}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? t("common.saving") : t("common.save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
