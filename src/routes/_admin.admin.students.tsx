/**
 * Admin — Students management with Approval Queue + Activation Control
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  KeyRound,
  Search,
  UserCheck,
  UserX,
  CheckCircle2,
  Clock,
  ShieldOff,
  AlertCircle,
  XCircle,
  RotateCcw,
  Users,
  ClipboardList,
} from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import {
  adminListStudents,
  adminSetRole,
  adminSetStatus,
  adminManualActivateStudent,
  adminSetActivationStatus,
  adminListCourses,
  adminApproveStudent,
  adminRejectStudent,
  adminReApproveStudent,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { ActivationStatus, Course, Profile, Role } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/students")({
  component: StudentsPage,
});

const ROLE_OPTIONS: Role[] = ["student", "instructor", "admin", "owner"];

const ACTIVATION_BADGE: Record<
  ActivationStatus,
  { labelOm: string; className: string; icon: React.FC<{ className?: string }> }
> = {
  active: {
    labelOm: "Hojiirra jira",
    className:
      "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    icon: CheckCircle2,
  },
  pending: {
    labelOm: "Eeggachaa",
    className:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    icon: Clock,
  },
  approved: {
    labelOm: "Eeyyamame",
    className:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    icon: CheckCircle2,
  },
  rejected: {
    labelOm: "Didame",
    className:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    icon: XCircle,
  },
  suspended: {
    labelOm: "Dhaabbateera",
    className:
      "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    icon: ShieldOff,
  },
  expired: {
    labelOm: "Darbeera",
    className:
      "bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700",
    icon: AlertCircle,
  },
};

function ActivationBadge({ status }: { status: ActivationStatus | undefined }) {
  const s = status ?? "pending";
  const cfg = ACTIVATION_BADGE[s] ?? ACTIVATION_BADGE["pending"];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-xs font-semibold",
        cfg.className,
      )}
    >
      <Icon className="size-3 shrink-0" />
      {cfg.labelOm}
    </span>
  );
}

function StudentsPage() {
  const { t } = useI18n();
  const { profile: myProfile } = useAuth();
  const call = useServerFn();

  const [users, setUsers] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [activationFilter, setActivationFilter] = useState<string>("all");

  // Manual activation dialog
  const [activateTarget, setActivateTarget] = useState<Profile | null>(null);
  const [activateCourseIds, setActivateCourseIds] = useState<string[]>([]);
  const [activateExpiry, setActivateExpiry] = useState<string>("");
  const [activateNote, setActivateNote] = useState<string>("");
  const [activating, setActivating] = useState(false);

  // Reject dialog
  const [rejectTarget, setRejectTarget] = useState<Profile | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [rejecting, setRejecting] = useState(false);

  // Review dialog
  const [reviewTarget, setReviewTarget] = useState<Profile | null>(null);
  const [approving, setApproving] = useState(false);

  const refresh = async () => {
    setLoading(true);
    try {
      const [usersData, coursesData] = await Promise.all([
        call(adminListStudents, undefined),
        call(adminListCourses, undefined),
      ]);
      setUsers(usersData as Profile[]);
      setCourses((coursesData as Course[]).filter((c) => c.status === "active"));
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = users.filter((u) => {
    const matchesQuery =
      !query ||
      u.fullName.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesActivation =
      activationFilter === "all" || (u.activationStatus ?? "pending") === activationFilter;
    return matchesQuery && matchesRole && matchesActivation;
  });

  const pendingQueue = users
    .filter((u) => u.role === "student" && (u.activationStatus ?? "pending") === "pending")
    .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));

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

  async function setActivationStatusFn(userId: string, status: ActivationStatus) {
    try {
      await call(adminSetActivationStatus, { userId, activationStatus: status });
      toast.success(t("common.success"));
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function handleApprove(user: Profile) {
    setApproving(true);
    try {
      await call(adminApproveStudent, { userId: user.id });
      toast.success(`${user.fullName} — eeyyamame. Koodii activation uumame.`);
      setReviewTarget(null);
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setApproving(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setRejecting(true);
    try {
      await call(adminRejectStudent, {
        userId: rejectTarget.id,
        reason: rejectReason || undefined,
      });
      toast.success(`${rejectTarget.fullName} — didame.`);
      setRejectTarget(null);
      setRejectReason("");
      setReviewTarget(null);
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setRejecting(false);
    }
  }

  async function handleReApprove(user: Profile) {
    try {
      await call(adminReApproveStudent, { userId: user.id });
      toast.success(`${user.fullName} — irra deebi'ee eeyyamame.`);
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    }
  }

  async function handleManualActivate() {
    if (!activateTarget) return;
    setActivating(true);
    try {
      const expiresAt = activateExpiry ? new Date(activateExpiry).getTime() : null;
      await call(adminManualActivateStudent, {
        userId: activateTarget.id,
        courseIds: activateCourseIds,
        expiresAt,
        note: activateNote || undefined,
      });
      toast.success(`${activateTarget.fullName} — hojiirra kaafame.`);
      setActivateTarget(null);
      setActivateCourseIds([]);
      setActivateExpiry("");
      setActivateNote("");
      await refresh();
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setActivating(false);
    }
  }

  const pendingCount = users.filter(
    (u) => u.role === "student" && (u.activationStatus ?? "pending") === "pending",
  ).length;
  const approvedCount = users.filter(
    (u) => u.role === "student" && u.activationStatus === "approved",
  ).length;
  const activeCount = users.filter(
    (u) => u.role === "student" && u.activationStatus === "active",
  ).length;
  const rejectedCount = users.filter(
    (u) => u.role === "student" && u.activationStatus === "rejected",
  ).length;
  const totalStudents = users.filter((u) => u.role === "student").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.students")}</h1>
          <p className="text-sm text-muted-foreground">
            {totalStudents} {t("common.students")}
          </p>
        </div>
        <Link to="/admin/activation-codes">
          <Button size="sm" variant="outline">
            <KeyRound className="size-4 mr-1" />
            {t("admin.activationCodes")}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { label: "Waliigala", value: totalStudents, color: "text-foreground" },
            { label: "Eeggachaa", value: pendingCount, color: "text-yellow-600 dark:text-yellow-400" },
            { label: "Eeyyamame", value: approvedCount, color: "text-blue-600 dark:text-blue-400" },
            { label: "Hojiirra jira", value: activeCount, color: "text-emerald-600 dark:text-emerald-400" },
            { label: "Didame", value: rejectedCount, color: "text-red-500" },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl border border-border/60 bg-card p-3 text-center">
              <p className={cn("text-xl font-bold", color)}>{value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue={pendingCount > 0 ? "waiting" : "all"}>
        <TabsList className="mb-4">
          <TabsTrigger value="waiting" className="gap-2">
            <ClipboardList className="size-3.5" />
            Gaaffii Eeggatanii
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
                {pendingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="gap-2">
            <Users className="size-3.5" />
            Barattoota Hunda
          </TabsTrigger>
        </TabsList>

        {/* ===== WAITING LIST ===== */}
        <TabsContent value="waiting" className="space-y-4">
          <div>
            <h2 className="text-base font-semibold">Gaaffii Galmee Barattoota</h2>
            <p className="text-sm text-muted-foreground">Eeyyama eegaa jiran</p>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : pendingQueue.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/60 py-12 text-center">
              <CheckCircle2 className="mx-auto size-10 text-muted-foreground/40" />
              <p className="mt-3 text-muted-foreground">Eeggachaa hin jiru</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingQueue.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col gap-4 rounded-xl border border-border/60 bg-card p-4 sm:flex-row sm:items-center"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {user.fullName[0]?.toUpperCase() ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold">{user.fullName}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                    </p>
                  </div>
                  <ActivationBadge status={user.activationStatus} />
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-muted-foreground"
                      onClick={() => setReviewTarget(user)}
                    >
                      Ilaaluu
                    </Button>
                    <Button
                      size="sm"
                      className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => void handleApprove(user)}
                      disabled={approving}
                    >
                      <CheckCircle2 className="size-3.5" />
                      Eeyyami
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                      onClick={() => { setRejectTarget(user); setRejectReason(""); }}
                    >
                      <XCircle className="size-3.5" />
                      Diidi
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== ALL STUDENTS ===== */}
        <TabsContent value="all" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder={t("common.search")}
                className="pl-9"
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
                  <SelectItem key={r} value={r}>{t(`common.${r}`)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={activationFilter} onValueChange={setActivationFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Activation status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Activation — Hunda</SelectItem>
                <SelectItem value="pending">Eeggachaa</SelectItem>
                <SelectItem value="approved">Eeyyamame</SelectItem>
                <SelectItem value="active">Hojiirra jira</SelectItem>
                <SelectItem value="rejected">Didame</SelectItem>
                <SelectItem value="suspended">Dhaabbateera</SelectItem>
                <SelectItem value="expired">Darbeera</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-border/60 bg-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b border-border/60 bg-muted/30">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        {t("common.name")}
                      </th>
                      <th className="hidden px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide md:table-cell">
                        {t("common.email")}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        {t("common.role")}
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        Activation
                      </th>
                      <th className="px-4 py-3 text-right font-semibold text-muted-foreground text-xs uppercase tracking-wide">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filtered.map((user) => {
                      const activStatus = user.activationStatus ?? "pending";
                      return (
                        <tr key={user.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3">
                            <div className="font-medium">{user.fullName}</div>
                            <div className="text-xs text-muted-foreground md:hidden">{user.email}</div>
                            {user.courseIds && user.courseIds.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                {user.courseIds.length} koorsii
                              </div>
                            )}
                          </td>
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
                                    <SelectItem key={r} value={r}>{t(`common.${r}`)}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge variant="outline" className="capitalize">{user.role}</Badge>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <ActivationBadge status={activStatus} />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {user.id !== myProfile?.id && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => void toggleStatus(user)}
                                  title={user.status === "active" ? "Suspend" : "Unsuspend"}
                                  className="h-7 w-7 p-0"
                                >
                                  {user.status === "active" ? (
                                    <UserX className="size-3.5 text-destructive" />
                                  ) : (
                                    <UserCheck className="size-3.5 text-emerald-500" />
                                  )}
                                </Button>
                              )}
                              {user.role === "student" && user.id !== myProfile?.id && (
                                <>
                                  {activStatus === "pending" && (
                                    <>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-700 dark:hover:bg-emerald-900/20"
                                        onClick={() => void handleApprove(user)}
                                        disabled={approving}
                                      >
                                        <CheckCircle2 className="size-3" />
                                        Eeyyami
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                        onClick={() => { setRejectTarget(user); setRejectReason(""); }}
                                      >
                                        <XCircle className="size-3" />
                                        Diidi
                                      </Button>
                                    </>
                                  )}
                                  {activStatus === "approved" && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7 text-xs gap-1 text-blue-700 border-blue-300 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-700 dark:hover:bg-blue-900/20"
                                      onClick={() => setActivateTarget(user)}
                                    >
                                      <CheckCircle2 className="size-3" />
                                      Harkaan Hojiirra Kaasi
                                    </Button>
                                  )}
                                  {activStatus === "active" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1 text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/20"
                                      onClick={() => void setActivationStatusFn(user.id, "suspended")}
                                    >
                                      <ShieldOff className="size-3" />
                                      Dhaabi
                                    </Button>
                                  )}
                                  {activStatus === "rejected" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                      onClick={() => void handleReApprove(user)}
                                    >
                                      <RotateCcw className="size-3" />
                                      Irra Deebi'ee Eeyyami
                                    </Button>
                                  )}
                                  {(activStatus === "suspended" || activStatus === "expired") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs gap-1 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-900/20"
                                      onClick={() => void setActivationStatusFn(user.id, "active")}
                                    >
                                      <CheckCircle2 className="size-3" />
                                      Irra Deebisiisi
                                    </Button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {filtered.length === 0 && (
                <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* REVIEW DIALOG */}
      <Dialog open={!!reviewTarget} onOpenChange={(v) => { if (!v) setReviewTarget(null); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Galmee Barataa Ilaaluu</DialogTitle>
            <DialogDescription>Barataan kun eeyyama eegaa jira.</DialogDescription>
          </DialogHeader>
          {reviewTarget && (
            <div className="space-y-4">
              <div className="rounded-xl bg-muted/40 px-4 py-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maqaa</span>
                  <span className="font-semibold">{reviewTarget.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Imeelii</span>
                  <span className="font-medium">{reviewTarget.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Guyyaa</span>
                  <span>{reviewTarget.createdAt ? new Date(reviewTarget.createdAt).toLocaleDateString() : "—"}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Haala</span>
                  <ActivationBadge status={reviewTarget.activationStatus} />
                </div>
                {reviewTarget.department && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Damee</span>
                    <span>{reviewTarget.department}</span>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                "Eeyyami" yoo cuqaastu, koodii activation dafee uumama.
              </p>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              className="flex-1 gap-1.5 text-red-600 border-red-300 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
              onClick={() => {
                if (reviewTarget) { setRejectTarget(reviewTarget); setRejectReason(""); }
              }}
            >
              <XCircle className="size-3.5" />
              Diidi
            </Button>
            <Button
              className="flex-1 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => reviewTarget && void handleApprove(reviewTarget)}
              disabled={approving}
            >
              <CheckCircle2 className="size-3.5" />
              {approving ? "Hojiirraa kaafamaa..." : "Eeyyami"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* REJECT DIALOG */}
      <Dialog
        open={!!rejectTarget}
        onOpenChange={(v) => { if (!v) { setRejectTarget(null); setRejectReason(""); } }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <XCircle className="size-5 text-red-600" />
              Galmee Diiduu
            </DialogTitle>
            <DialogDescription>
              <strong>{rejectTarget?.fullName}</strong> — galmee isaanii ni diiduuf jirta.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Label>Sababa (Filannoo)</Label>
            <Textarea
              placeholder="fkn: Odeeffannoon galmee sirrii miti"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Sababi yoo galte, barataan argachuu danda'a.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectTarget(null)}>Haquu</Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => void handleReject()}
              disabled={rejecting}
            >
              {rejecting ? "Diddamaa jira..." : "Diidi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MANUAL ACTIVATE DIALOG */}
      <Dialog
        open={!!activateTarget}
        onOpenChange={(v) => {
          if (!v) {
            setActivateTarget(null);
            setActivateCourseIds([]);
            setActivateExpiry("");
            setActivateNote("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-600" />
              Barataa Harkaan Hojiirra Kaasi
            </DialogTitle>
            <DialogDescription>
              <strong>{activateTarget?.fullName}</strong> — koodii activation osoo hin fayyadamiin
              herrega isaanii harkaan hojiirra kaastuu.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Koorsiiwwan (Filannoo)</Label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto rounded-lg border border-border/60 p-2">
                {courses.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted/50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={activateCourseIds.includes(c.id)}
                      onChange={(e) => {
                        setActivateCourseIds((prev) =>
                          e.target.checked ? [...prev, c.id] : prev.filter((id) => id !== c.id),
                        );
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">{c.titleOm || c.titleEn}</p>
                      {c.titleEn && c.titleOm !== c.titleEn && (
                        <p className="text-xs text-muted-foreground">{c.titleEn}</p>
                      )}
                    </div>
                  </label>
                ))}
                {courses.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2 text-center">
                    Koorsiin hojirra jiru hin jiru
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Guyyaa dhumaa (Filannoo)</Label>
              <Input
                type="date"
                value={activateExpiry}
                onChange={(e) => setActivateExpiry(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Yaadadhu (Filannoo)</Label>
              <Input
                placeholder="fkn: Admin harkaan hojiirra kaase"
                value={activateNote}
                onChange={(e) => setActivateNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setActivateTarget(null); setActivateCourseIds([]); }}
            >
              Haquu
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => void handleManualActivate()}
              disabled={activating}
            >
              {activating ? "Hojiirra kaafamaa jira..." : "Hojiirra Kaasi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
