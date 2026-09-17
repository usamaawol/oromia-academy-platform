import { Download, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { useAdminData } from "@/components/admin/context";
import {
  ConfirmButton,
  EmptyState,
  Field,
  PanelHeader,
  downloadCsv,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { deleteUser, saveUser } from "@/lib/data";
import type { Role, UserProfile } from "@/lib/types";

export function StudentsPanel() {
  const { t } = useI18n();
  const { users, courses, attempts, reload, record } = useAdminData();
  const { isOwner, profile } = useAuth();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [editing, setEditing] = useState<UserProfile | null>(null);

  const rows = useMemo(
    () =>
      users.filter((u) => {
        if (roleFilter !== "all" && u.role !== roleFilter) return false;
        const needle = search.trim().toLowerCase();
        if (!needle) return true;
        return u.fullName.toLowerCase().includes(needle) || u.email.toLowerCase().includes(needle);
      }),
    [users, roleFilter, search],
  );

  async function setRole(user: UserProfile, role: Role) {
    if (!isOwner) {
      toast.error(t("admin.noPermission"));
      return;
    }
    await saveUser({ ...user, role });
    await record("user.role", user.email, user.role, role);
    await reload();
    toast.success(t("common.success"));
  }

  async function saveEnrollments() {
    if (!editing) return;
    await saveUser(editing);
    await record("user.enrollments", editing.email);
    await reload();
    setEditing(null);
    toast.success(t("common.success"));
  }

  function exportCsv() {
    downloadCsv("oromia-academy-students.csv", [
      [
        t("common.name"),
        t("common.email"),
        t("common.phone"),
        t("common.role"),
        t("admin.enrollments"),
        t("admin.attempts"),
      ],
      ...rows.map((u) => [
        u.fullName,
        u.email,
        u.phone ?? "",
        u.role,
        u.enrolledCourseIds.length,
        attempts.filter((a) => a.studentId === u.id).length,
      ]),
    ]);
  }

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.students")} subtitle={t("admin.studentsSubtitle")}>
        <Button variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
          <Download /> {t("common.export")}
        </Button>
      </PanelHeader>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          placeholder={t("common.search")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("common.all")}</SelectItem>
            <SelectItem value="student">{t("common.student")}</SelectItem>
            <SelectItem value="instructor">{t("common.instructor")}</SelectItem>
            <SelectItem value="owner">{t("common.owner")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {rows.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.name")}</TableHead>
                <TableHead>{t("common.role")}</TableHead>
                <TableHead>{t("admin.enrollments")}</TableHead>
                <TableHead>{t("admin.attempts")}</TableHead>
                <TableHead className="text-right">{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((u) => {
                const done = attempts.filter((a) => a.studentId === u.id);
                const avg = done.length
                  ? Math.round(done.reduce((s, a) => s + a.percentage, 0) / done.length)
                  : 0;
                return (
                  <TableRow key={u.id}>
                    <TableCell>
                      <span className="font-medium">{u.fullName}</span>
                      <span className="block text-xs text-muted-foreground">{u.email}</span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.role === "student" ? "secondary" : "default"}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{u.enrolledCourseIds.length}</TableCell>
                    <TableCell>
                      {done.length}
                      {done.length ? (
                        <span className="block text-xs text-muted-foreground">
                          {t("admin.avgScore")}: {avg}%
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => setEditing(u)}>
                          {t("admin.enroll")}
                        </Button>
                        {u.role === "student" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void setRole(u, "instructor")}
                          >
                            {t("admin.makeInstructor")}
                          </Button>
                        ) : u.role === "instructor" ? (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => void setRole(u, "student")}
                          >
                            {t("admin.makeStudent")}
                          </Button>
                        ) : null}
                        {isOwner && u.id !== profile?.id ? (
                          <ConfirmButton
                            title={t("admin.confirmDeleteTitle")}
                            description={t("admin.confirmDeleteUser")}
                            confirmLabel={t("common.delete")}
                            onConfirm={async () => {
                              await deleteUser(u.id);
                              await record("user.delete", u.email);
                              await reload();
                            }}
                          >
                            <Button size="sm" variant="ghost">
                              <Trash2 />
                            </Button>
                          </ConfirmButton>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.fullName}</DialogTitle>
          </DialogHeader>
          {editing ? (
            <Field label={t("admin.enrollments")}>
              <div className="space-y-2">
                {courses.map((c) => {
                  const checked = editing.enrolledCourseIds.includes(c.id);
                  return (
                    <label key={c.id} className="flex items-center gap-3 text-sm">
                      <input
                        type="checkbox"
                        className="size-4"
                        checked={checked}
                        onChange={() =>
                          setEditing({
                            ...editing,
                            enrolledCourseIds: checked
                              ? editing.enrolledCourseIds.filter((id) => id !== c.id)
                              : [...editing.enrolledCourseIds, c.id],
                          })
                        }
                      />
                      {c.titleOm || c.titleEn}
                    </label>
                  );
                })}
              </div>
            </Field>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              {t("common.cancel")}
            </Button>
            <Button onClick={() => void saveEnrollments()}>{t("common.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
