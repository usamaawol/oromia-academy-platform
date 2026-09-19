/**
 * Admin — Courses management
 */
import { createFileRoute, useSearch } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { adminListCourses, adminSaveCourse, adminDeleteCourse } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Course } from "@/lib/schema";

export const Route = createFileRoute("/_admin/admin/courses")({
  validateSearch: (s: Record<string, unknown>) => ({
    new: s.new === "1" ? "1" : undefined,
  }),
  component: CoursesPage,
});

const BLANK_COURSE: Course = {
  id: "",
  titleOm: "",
  titleEn: "",
  descOm: "",
  descEn: "",
  icon: "sparkles",
  level: "medium",
  status: "draft",
  order: 0,
};

function CoursesPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const search = useSearch({ from: "/_admin/admin/courses" });

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Course>(BLANK_COURSE);
  const [saving, setSaving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await call(adminListCourses, undefined);
      setCourses((data as Course[]).sort((a, b) => (a.order ?? 99) - (b.order ?? 99)));
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-open new dialog when ?new=1 is in the URL
  useEffect(() => {
    if (search.new === "1" && !loading) {
      openNew();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search.new, loading]);

  function openNew() {
    setEditing({ ...BLANK_COURSE, id: crypto.randomUUID() });
    setDialogOpen(true);
  }

  function openEdit(c: Course) {
    setEditing({ ...c });
    setDialogOpen(true);
  }

  async function save() {
    if (!editing.titleEn.trim() || !editing.titleOm.trim()) {
      toast.error("Title is required");
      return;
    }
    setSaving(true);
    try {
      await call(adminSaveCourse, { course: editing });
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
    if (!confirm("Delete this course?")) return;
    try {
      await call(adminDeleteCourse, { id });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t("admin.courses")}</h1>
        <Button size="sm" onClick={openNew}>
          <Plus className="size-4 mr-1" /> {t("admin.newCourse")}
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base leading-snug">{c.titleEn}</CardTitle>
                  <Badge
                    variant={c.status === "active" ? "default" : "secondary"}
                    className="shrink-0 capitalize text-xs"
                  >
                    {c.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{c.titleOm}</p>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">{c.descEn}</p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className="capitalize">
                    {c.level}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(c)}>
                      <Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => void remove(c.id)}>
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editing.id && courses.find((c) => c.id === editing.id)
                ? t("common.edit")
                : t("admin.newCourse")}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Title (English) *</Label>
                <Input
                  value={editing.titleEn}
                  onChange={(e) => setEditing((p) => ({ ...p, titleEn: e.target.value }))}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Mata duree (Oromoo) *</Label>
                <Input
                  value={editing.titleOm}
                  onChange={(e) => setEditing((p) => ({ ...p, titleOm: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Description (English)</Label>
                <Textarea
                  value={editing.descEn}
                  onChange={(e) => setEditing((p) => ({ ...p, descEn: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Ibsa (Oromoo)</Label>
                <Textarea
                  value={editing.descOm}
                  onChange={(e) => setEditing((p) => ({ ...p, descOm: e.target.value }))}
                  rows={3}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t("difficulty.easy")} / Level</Label>
                <Select
                  value={editing.level}
                  onValueChange={(v: Course["level"]) => setEditing((p) => ({ ...p, level: v }))}
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
              </div>
              <div className="space-y-1.5">
                <Label>{t("common.status")}</Label>
                <Select
                  value={editing.status}
                  onValueChange={(v: Course["status"]) => setEditing((p) => ({ ...p, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">{t("status.draft")}</SelectItem>
                    <SelectItem value="active">{t("status.active")}</SelectItem>
                    <SelectItem value="archived">{t("status.archived")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Order</Label>
                <Input
                  type="number"
                  value={editing.order ?? 0}
                  onChange={(e) => setEditing((p) => ({ ...p, order: Number(e.target.value) }))}
                />
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
