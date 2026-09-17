/**
 * Admin — Students management
 */
import { createFileRoute } from "@tanstack/react-router";
import { Search, UserCheck, UserX } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { adminListStudents, adminSetRole, adminSetStatus } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { Profile, Role } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/students")({
  component: StudentsPage,
});

const ROLE_OPTIONS: Role[] = ["student", "instructor", "admin", "owner"];

function StudentsPage() {
  const { t } = useI18n();
  const { profile: myProfile } = useAuth();
  const call = useServerFn();

  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = await call(adminListStudents, undefined);
      setUsers(data as Profile[]);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesQuery && matchesRole;
  });

  async function changeRole(userId: string, role: Role) {
    try {
      await call(adminSetRole, { userId, role });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function toggleStatus(user: Profile) {
    const next = user.status === "active" ? "suspended" : "active";
    try {
      await call(adminSetStatus, { userId: user.id, status: next });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.students")}</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} {t("common.students")}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              placeholder={t("common.search")}
              className="w-56 pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              {ROLE_OPTIONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {t(`common.${r}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("common.name")}
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  {t("common.email")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("common.role")}
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {t("common.status")}
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  {t("common.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((user) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.fullName}</td>
                  <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                    {user.email}
                  </td>
                  <td className="px-4 py-3">
                    {myProfile?.role === "owner" ||
                    (myProfile?.role === "admin" && user.role !== "owner") ? (
                      <Select
                        value={user.role}
                        onValueChange={(v) => void changeRole(user.id, v as Role)}
                        disabled={user.id === myProfile?.id}
                      >
                        <SelectTrigger className="h-7 w-32 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLE_OPTIONS.map((r) => (
                            <SelectItem key={r} value={r}>
                              {t(`common.${r}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge variant="outline" className="capitalize">
                        {user.role}
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={user.status === "active" ? "default" : "destructive"}
                      className="capitalize"
                    >
                      {user.status ?? "active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {user.id !== myProfile?.id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => void toggleStatus(user)}
                        title={user.status === "active" ? "Suspend" : "Activate"}
                      >
                        {user.status === "active" ? (
                          <UserX className="size-4 text-destructive" />
                        ) : (
                          <UserCheck className="size-4 text-green-500" />
                        )}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
          )}
        </div>
      )}
    </div>
  );
}
