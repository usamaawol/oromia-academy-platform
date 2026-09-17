import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { deleteCourse, newId, saveCourse } from "@/lib/data";
import type { Course } from "@/lib/types";

const ICONS = ["sparkles", "send", "bot", "code", "video", "image"];

function emptyCourse(order: number): Course {
  return {
    id: newId("c"),
    titleOm: "",
    titleEn: "",
    descOm: "",
    descEn: "",
    icon: "sparkles",
    level: "easy",
    status: "draft",
    instructor: "",
    lessons: 0,
    order,
    createdAt: Date.now(),
  };
}

export function CoursesPanel() {
  const { t } = useI18n();
  const { courses, exams, reload, record } = useAdminData();
  const [editing, setEditing] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);

  async function persist() {
    if (!editing) return;
    if (!editing.titleOm.trim() && !editing.titleEn.trim()) {
      toast.error(t("admin.titleRequired"));
      return;
    }
    setSaving(true);
    try {
      await saveCourse(editing);
      await record("course.save", editing.titleEn || editing.titleOm);
      await reload();
      setEditing(null);
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  async function remove(course: Course) {
    try {
      await deleteCourse(course.id);
      await record("course.delete", course.titleEn || course.titleOm);
      await reload();
      toast.success(t("common.success"));
    } catch {
      toast.error(t("common.error"));
    }
  }

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.courses")} subtitle={t("admin.coursesSubtitle")}>
        <Button onClick={() => setEditing(emptyCourse(courses.length + 1))}>
          <Plus /> {t("admin.newCourse")}
        </Button>
      </PanelHeader>

      {courses.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {courses.map((course) => (
            <article key={course.id} className="rounded-lg border bg-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-semibold">{course.titleOm || course.titleEn}</h3>
                  <p className="text-sm text-muted-foreground">{course.titleEn}</p>
                </div>
                <Badge variant={course.status === "active" ? "default" : "secondary"}>
                  {course.status}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{course.descOm || course.descEn}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4 text-xs text-muted-foreground">
                <span className="capitalize">{course.level}</span>
                <span>·</span>
                <span>
                  {course.lessons ?? 0} {t("admin.lessons")}
                </span>
                <span>·</span>
                <span>
                  {exams.filter((e) => e.courseId === course.id).length} {t("common.exams")}
                </span>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(course)}>
                  <Pencil /> {t("common.edit")}
                </Button>
                <ConfirmButton
                  title={t("admin.confirmDeleteTitle")}
                  description={t("admin.confirmDeleteCourse")}
                  confirmLabel={t("common.delete")}
                  onConfirm={() => remove(course)}
                >
                  <Button size="sm" variant="ghost">
                    <Trash2 /> {t("common.delete")}
                  </Button>
                </ConfirmButton>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("admin.newCourse")}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={`${t("admin.courseTitle")} (OM)`}>
                <Input
                  value={editing.titleOm}
                  onChange={(e) => setEditing({ ...editing, titleOm: e.target.value })}
                />
              </Field>
              <Field label={`${t("admin.courseTitle")} (EN)`}>
                <Input
                  value={editing.titleEn}
                  onChange={(e) => setEditing({ ...editing, titleEn: e.target.value })}
                />
              </Field>
              <Field label={`${t("admin.description")} (OM)`} className="sm:col-span-2">
                <Textarea
                  value={editing.descOm}
                  onChange={(e) => setEditing({ ...editing, descOm: e.target.value })}
                />
              </Field>
              <Field label={`${t("admin.description")} (EN)`} className="sm:col-span-2">
                <Textarea
                  value={editing.descEn}
                  onChange={(e) => setEditing({ ...editing, descEn: e.target.value })}
                />
              </Field>
              <Field label={t("admin.icon")}>
                <Select
                  value={editing.icon}
                  onValueChange={(v) => setEditing({ ...editing, icon: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ICONS.map((i) => (
                      <SelectItem key={i} value={i}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("admin.difficulty")}>
                <Select
                  value={editing.level}
                  onValueChange={(v) => setEditing({ ...editing, level: v as Course["level"] })}
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
              <Field label={t("common.status")}>
                <Select
                  value={editing.status}
                  onValueChange={(v) => setEditing({ ...editing, status: v as Course["status"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="draft">{t("status.draft")}</SelectItem>
                    <SelectItem value="archived">{t("status.archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t("common.instructor")}>
                <Input
                  value={editing.instructor ?? ""}
                  onChange={(e) => setEditing({ ...editing, instructor: e.target.value })}
                />
              </Field>
              <Field label={t("admin.lessons")}>
                <Input
                  type="number"
                  min={0}
                  value={editing.lessons ?? 0}
                  onChange={(e) => setEditing({ ...editing, lessons: Number(e.target.value) })}
                />
              </Field>
              <Field label={t("admin.order")}>
                <Input
                  type="number"
                  min={1}
                  value={editing.order ?? 1}
                  onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })}
                />
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
