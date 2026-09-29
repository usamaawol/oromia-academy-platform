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
  TrendingUp,
  UserPlus,
  Ban,
  UserCog,
  MoreHorizontal,
  ChevronRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, StatCard, EmptyState } from "@/components/page-header";
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

const ROLE_OPTIONS: Role[] = ["student", "instructor", "admin"];

type BadgeVariant = "default" | "success" | "warning" | "danger" | "info" | "secondary";

const ACTIVATION_BADGE: Record<
  ActivationStatus,
  {
    labelOm: string;
    labelEn: string;
    variant: BadgeVariant;
    icon: React.FC<{ className?: string; strokeWidth?: number }>;
    dotColor: string;
  }
> = {
  active: {
    labelOm: "Hojiirra jira",
    labelEn: "Active",
    variant: "success",
    icon: CheckCircle2,
    dotColor: "bg-success",
  },
  pending: {
    labelOm: "Eeggachaa",
    labelEn: "Pending",
    variant: "warning",
    icon: Clock,
    dotColor: "bg-warning animate-pulse-subtle",
  },
  approved: {
    labelOm: "Eeyyamame",
    labelEn: "Approved",
    variant: "info",
    icon: CheckCircle2,
    dotColor: "bg-info",
  },
  rejected: {
    labelOm: "Didame",
    labelEn: "Rejected",
    variant: "danger",
    icon: XCircle,
    dotColor: "bg-destructive",
  },
  suspended: {
    labelOm: "Dhaabbateera",
    labelEn: "Suspended",
    variant: "warning",
    icon: ShieldOff,
    dotColor: "bg-warning",
  },
  expired: {
    labelOm: "Darbeera",
    labelEn: "Expired",
    variant: "secondary",
    icon: AlertCircle,
    dotColor: "bg-muted-foreground",
  },
};

function ActivationBadge({ status }: { status: ActivationStatus | undefined }) {
  const s = status ?? "pending";
  const cfg = ACTIVATION_BADGE[s] ?? ACTIVATION_BADGE["pending"];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-tight",
        cfg.variant === "success" &&
          "border-success/25 bg-success/[0.10] text-success dark:border-success/35 dark:bg-success/15",
        cfg.variant === "warning" &&
          "border-warning/25 bg-warning/[0.10] text-warning-foreground dark:border-warning/35 dark:bg-warning/15",
        cfg.variant === "danger" &&
          "border-destructive/25 bg-destructive/[0.10] text-destructive dark:border-destructive/35 dark:bg-destructive/15",
        cfg.variant === "info" &&
          "border-info/25 bg-info/[0.10] text-info dark:border-info/35 dark:bg-info/15",
        cfg.variant === "secondary" &&
          "border-border/70 bg-muted/60 text-muted-foreground",
      )}
    >
      <span className={cn("size-1.5 rounded-full", cfg.dotColor)} />
      <Icon className="size-[13px] shrink-0" strokeWidth={2} />
      <span className="leading-none">{cfg.labelOm}</span>
    </span>
  );
}

/* Premium avatar component for students */
function Avatar({
  name,
  email,
  size = "md",
}: {
  name: string;
  email?: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const sizeClasses = {
    sm: "size-8 text-[11px]",
    md: "size-10 text-[13px]",
    lg: "size-12 text-[15px]",
  };

  const colors = [
    "from-primary/25 via-primary/15 to-primary/5 text-primary ring-primary/25",
    "from-info/25 via-info/15 to-info/5 text-info ring-info/25",
    "from-success/25 via-success/15 to-success/5 text-success ring-success/25",
    "from-warning/28 via-warning/16 to-warning/5 text-warning-foreground ring-warning/25",
  ];

  const hash = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const colorSet = colors[hash % colors.length];

  return (
    <div
      className={cn(
        "relative grid shrink-0 place-items-center rounded-xl",
        "bg-gradient-to-br",
        colorSet,
        sizeClasses[size],
        "font-bold tracking-tight",
        "ring-1",
        "shadow-xs",
      )}
      title={email || name}
    >
      {initials || "?"}
    </div>
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
    <div className="space-y-6 sm:space-y-7">
      {/* Header — premium */}
      <PageHeader
        title={t("admin.students")}
        subtitle="Manage student accounts, approvals, roles, and academy access."
        icon={<Users className="size-5" strokeWidth={1.9} />}
        action={
          <Link to="/admin/activation-codes">
            <Button size="sm" variant="outline" className="gap-2 h-9">
              <KeyRound className="size-4" strokeWidth={1.9} />
              <span className="font-medium">{t("admin.activationCodes")}</span>
            </Button>
          </Link>
        }
      />

      {/* Stats — premium stat cards */}
      {!loading && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5 animate-fade-in-up">
          <StatCard
            label="Total"
            value={totalStudents}
            sub="All registered users"
            accent="default"
            icon={<Users className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Pending"
            value={pendingCount}
            sub="Awaiting review"
            accent="warning"
            icon={<Clock className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Approved"
            value={approvedCount}
            sub="Accounts approved"
            accent="info"
            icon={<UserCheck className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Activated"
            value={activeCount}
            sub="Fully active"
            accent="success"
            icon={<CheckCircle2 className="size-4" strokeWidth={1.9} />}
          />
          <StatCard
            label="Rejected"
            value={rejectedCount}
            sub="Registrations denied"
            accent="danger"
            icon={<XCircle className="size-4" strokeWidth={1.9} />}
          />
        </div>
      )}

      {/* Loading skeletons for stats */}
      {loading && (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="skeleton-shimmer h-[88px] sm:h-[96px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Tabs — premium */}
      <Tabs defaultValue={pendingCount > 0 ? "waiting" : "all"}>
        <TabsList
          className={cn(
            "mb-5 p-1 rounded-xl",
            "bg-muted/50 border border-border/60",
            "shadow-xs",
          )}
        >
          <TabsTrigger
            value="waiting"
            className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:ring-1 data-[state=active]:ring-border/60"
          >
            <ClipboardList className="size-4" strokeWidth={1.9} />
            <span className="font-medium tracking-tight">Gaaffii Eeggatanii</span>
            {pendingCount > 0 && (
              <span
                className={cn(
                  "inline-flex items-center justify-center rounded-full px-2 h-[18px]",
                  "bg-warning/[0.18] text-warning-foreground ring-1 ring-warning/25",
                  "text-[10.5px] font-bold tabular-nums",
                )}
              >
                {pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="all"
            className="gap-2 rounded-lg px-4 py-2 data-[state=active]:bg-card data-[state=active]:shadow-soft data-[state=active]:ring-1 data-[state=active]:ring-border/60"
          >
            <Users className="size-4" strokeWidth={1.9} />
            <span className="font-medium tracking-tight">Barattoota Hunda</span>
          </TabsTrigger>
        </TabsList>

        {/* ===== WAITING LIST — premium card design ===== */}
        <TabsContent value="waiting" className="space-y-5 mt-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-[15px] font-semibold leading-tight tracking-tight flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-warning animate-pulse-subtle" />
                Gaaffii Galmee Barattoota
              </h2>
              <p className="text-[13px] text-muted-foreground mt-0.5">
                Eeyyama eegaa jiran — review and action pending registrations
              </p>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="skeleton-shimmer h-[96px] sm:h-[80px] rounded-xl"
                />
              ))}
            </div>
          ) : pendingQueue.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="size-7" strokeWidth={1.8} />}
              title="All caught up!"
              body="No pending registration requests. New sign-ups will appear here for your review."
            />
          ) : (
            <div className="space-y-2.5 sm:space-y-3">
              {pendingQueue.map((user, idx) => (
                <div
                  key={user.id}
                  className={cn(
                    "group relative flex flex-col gap-4 rounded-xl border border-border/70 bg-card p-4 sm:p-4.5",
                    "shadow-soft hover:shadow-card hover:border-border/90",
                    "transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    "sm:flex-row sm:items-center sm:gap-4",
                    "animate-fade-in-up",
                  )}
                  style={{ animationDelay: `${idx * 40}ms` }}
                >
                  {/* Subtle left accent for pending items */}
                  <span className="absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full bg-warning/60" />

                  {/* Avatar */}
                  <Avatar name={user.fullName} email={user.email} size="lg" />

                  {/* Info */}
                  <div className="flex-1 min-w-0 pl-0 sm:pl-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[14px] tracking-tight leading-tight">
                        {user.fullName}
                      </p>
                    </div>
                    <p className="text-[13px] text-muted-foreground mt-0.5 truncate">
                      {user.email}
                    </p>
                    {user.department && (
                      <p className="text-[12px] text-muted-foreground mt-1 flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-muted-foreground/40" />
                        {user.department}
                      </p>
                    )}
                    {user.desiredCourse && (
                      <p className="text-[12px] text-muted-foreground mt-0.5 flex items-center gap-1.5">
                        <span className="size-1 rounded-full bg-primary/50" />
                        Course interest: {user.desiredCourse}
                      </p>
                    )}
                  </div>

                  {/* Date + meta */}
                  <div className="hidden md:flex flex-col items-end shrink-0 gap-1">
                    <span className="text-[12px] font-medium text-foreground/80 tabular-nums">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </span>
                    <ActivationBadge status={user.activationStatus} />
                  </div>

                  {/* Mobile status */}
                  <div className="md:hidden">
                    <ActivationBadge status={user.activationStatus} />
                  </div>

                  {/* Actions */}
                  <div
                    className={cn(
                      "flex gap-2 flex-wrap shrink-0",
                      "sm:flex-col sm:items-stretch md:flex-row md:items-center",
                    )}
                  >
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-9 text-[12px] gap-1.5 font-medium"
                      onClick={() => setReviewTarget(user)}
                    >
                      <UserCog className="size-3.5" strokeWidth={1.9} />
                      Review
                    </Button>
                    <Button
                      size="sm"
                      className="h-9 text-[12px] gap-1.5 font-medium"
                      onClick={() => void handleApprove(user)}
                      disabled={approving}
                    >
                      <CheckCircle2 className="size-3.5" strokeWidth={1.9} />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={cn(
                        "h-9 text-[12px] gap-1.5 font-medium",
                        "text-destructive border-destructive/30 hover:bg-destructive/[0.08]",
                      )}
                      onClick={() => {
                        setRejectTarget(user);
                        setRejectReason("");
                      }}
                    >
                      <XCircle className="size-3.5" strokeWidth={1.9} />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ===== ALL STUDENTS — premium table design ===== */}
        <TabsContent value="all" className="space-y-5 mt-1">
          {/* Filters row — premium */}
          <div
            className={cn(
              "flex flex-col sm:flex-row sm:flex-wrap gap-2.5 sm:gap-3",
              "p-3 sm:p-3.5 rounded-xl",
              "bg-card border border-border/60",
              "shadow-soft",
            )}
          >
            <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/70"
                strokeWidth={1.9}
              />
              <Input
                placeholder={`${t("common.search")} by name or email...`}
                className="pl-10 h-10 text-[13px] bg-background/50"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap shrink-0">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="h-10 w-32 sm:w-36 text-[13px] px-3 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("common.all")} roles</SelectItem>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r} className="capitalize">
                      {t(`common.${r}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={activationFilter} onValueChange={setActivationFilter}>
                <SelectTrigger className="h-10 w-40 sm:w-48 text-[13px] px-3 bg-background/50">
                  <SelectValue placeholder="Activation status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Activation — Hunda</SelectItem>
                  <SelectItem value="pending">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-warning" />
                      Eeggachaa
                    </span>
                  </SelectItem>
                  <SelectItem value="approved">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-info" />
                      Eeyyamame
                    </span>
                  </SelectItem>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-success" />
                      Hojiirra jira
                    </span>
                  </SelectItem>
                  <SelectItem value="rejected">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-destructive" />
                      Didame
                    </span>
                  </SelectItem>
                  <SelectItem value="suspended">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-warning" />
                      Dhaabbateera
                    </span>
                  </SelectItem>
                  <SelectItem value="expired">
                    <span className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-muted-foreground" />
                      Darbeera
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            /* Realistic skeleton rows for loading state */
            <div
              className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft"
            >
              <div className="space-y-0">
                <div className="h-12 bg-muted/40 border-b border-border/50" />
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="px-4 sm:px-5 py-3.5 border-b border-border/30 last:border-0 flex items-center gap-3 sm:gap-4"
                  >
                    <div className="skeleton-shimmer size-10 rounded-xl shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="skeleton-shimmer h-3.5 w-32 sm:w-44 rounded-md" />
                      <div className="skeleton-shimmer h-3 w-40 sm:w-60 rounded-md hidden sm:block" />
                    </div>
                    <div className="skeleton-shimmer h-6 w-16 sm:w-20 rounded-lg shrink-0" />
                    <div className="skeleton-shimmer h-6 w-20 sm:w-24 rounded-lg shrink-0 hidden sm:block" />
                    <div className="skeleton-shimmer h-7 w-7 rounded-lg shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={<Users className="size-7" strokeWidth={1.8} />}
              title={t("common.notFound")}
              body="No students match your current filters. Try adjusting the search query or clearing filters."
            />
          ) : (
            <div
              className={cn(
                "rounded-xl border border-border/70 bg-card overflow-hidden",
                "shadow-card",
              )}
            >
              <div className="overflow-x-auto">
                <table className="w-full text-[13.5px]">
                  <thead
                    className={cn(
                      "border-b border-border/60",
                      "bg-gradient-to-b from-muted/50 to-muted/30",
                    )}
                  >
                    <tr>
                      <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                        {t("common.name")}
                      </th>
                      <th className="hidden lg:table-cell px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                        {t("common.email")}
                      </th>
                      <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                        {t("common.role")}
                      </th>
                      <th className="px-4 sm:px-5 py-3.5 text-left font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                        Activation
                      </th>
                      <th className="px-4 sm:px-5 py-3.5 text-right font-semibold text-muted-foreground/80 text-[11px] uppercase tracking-[0.08em]">
                        {t("common.actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filtered.map((user, idx) => {
                      const activStatus = user.activationStatus ?? "pending";
                      return (
                        <tr
                          key={user.id}
                          className={cn(
                            "group transition-all duration-180 ease-out",
                            "hover:bg-muted/[0.06] dark:hover:bg-muted/[0.12]",
                            "animate-fade-in-up",
                          )}
                          style={{ animationDelay: `${idx * 20}ms` }}
                        >
                          <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                            <div className="flex items-center gap-3 min-w-0">
                              <Avatar name={user.fullName} email={user.email} size="md" />
                              <div className="min-w-0">
                                <div
                                  className={cn(
                                    "font-semibold text-[13.5px] tracking-tight leading-tight truncate",
                                    "text-foreground",
                                  )}
                                >
                                  {user.fullName}
                                </div>
                                <div className="text-[12px] text-muted-foreground lg:hidden truncate mt-0.5">
                                  {user.email}
                                </div>
                                {user.courseIds && user.courseIds.length > 0 && (
                                  <div
                                    className={cn(
                                      "text-[11.5px] mt-0.5 flex items-center gap-1.5",
                                      "text-muted-foreground/80",
                                    )}
                                  >
                                    <span className="size-1 rounded-full bg-primary/50" />
                                    {user.courseIds.length} koorsii
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="hidden lg:table-cell px-4 sm:px-5 py-3 sm:py-3.5 text-muted-foreground/90 min-w-0">
                            <span className="truncate text-[13px]">{user.email}</span>
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                            {myProfile?.role === "admin" ? (
                              <Select
                                value={user.role}
                                onValueChange={(v) => void changeRole(user.id, v as Role)}
                                disabled={user.id === myProfile?.id}
                              >
                                <SelectTrigger className="h-8 w-28 sm:w-32 text-[12px] px-2.5 bg-background/60">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ROLE_OPTIONS.map((r) => (
                                    <SelectItem key={r} value={r} className="capitalize text-[13px]">
                                      {t(`common.${r}`)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <Badge
                                variant="secondary"
                                className="capitalize text-[11px]"
                              >
                                {user.role}
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                            <ActivationBadge status={activStatus} />
                          </td>
                          <td className="px-4 sm:px-5 py-3 sm:py-3.5">
                            <div className="flex items-center justify-end gap-1 flex-wrap">
                              {user.id !== myProfile?.id && (
                                <Button
                                  variant="ghost"
                                  size="icon-sm"
                                  onClick={() => void toggleStatus(user)}
                                  title={user.status === "active" ? "Suspend" : "Unsuspend"}
                                  className="size-8 rounded-lg hover:bg-muted/70"
                                >
                                  {user.status === "active" ? (
                                    <UserX
                                      className="size-[15px] text-destructive"
                                      strokeWidth={1.9}
                                    />
                                  ) : (
                                    <UserCheck
                                      className="size-[15px] text-success"
                                      strokeWidth={1.9}
                                    />
                                  )}
                                </Button>
                              )}
                              {user.role === "student" && user.id !== myProfile?.id && (
                                <>
                                  {activStatus === "pending" && (
                                    <>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className={cn(
                                          "h-8 text-[11.5px] gap-1.5 font-medium",
                                          "text-success border-success/30 bg-success/[0.04]",
                                          "hover:bg-success/[0.09] hover:border-success/50",
                                        )}
                                        onClick={() => void handleApprove(user)}
                                        disabled={approving}
                                      >
                                        <CheckCircle2 className="size-3.5" strokeWidth={2} />
                                        Eeyyami
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className={cn(
                                          "h-8 text-[11.5px] gap-1.5 font-medium",
                                          "text-destructive hover:bg-destructive/[0.08]",
                                        )}
                                        onClick={() => {
                                          setRejectTarget(user);
                                          setRejectReason("");
                                        }}
                                      >
                                        <XCircle className="size-3.5" strokeWidth={2} />
                                        Diidi
                                      </Button>
                                    </>
                                  )}
                                  {activStatus === "approved" && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className={cn(
                                        "h-8 text-[11.5px] gap-1.5 font-medium",
                                        "text-info border-info/30 bg-info/[0.04]",
                                        "hover:bg-info/[0.09] hover:border-info/50",
                                      )}
                                      onClick={() => setActivateTarget(user)}
                                    >
                                      <CheckCircle2 className="size-3.5" strokeWidth={2} />
                                      Hojiirra Kaasi
                                    </Button>
                                  )}
                                  {activStatus === "active" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-8 text-[11.5px] gap-1.5 font-medium",
                                        "text-warning hover:bg-warning/[0.08]",
                                      )}
                                      onClick={() =>
                                        void setActivationStatusFn(user.id, "suspended")
                                      }
                                    >
                                      <ShieldOff className="size-3.5" strokeWidth={2} />
                                      Dhaabi
                                    </Button>
                                  )}
                                  {activStatus === "rejected" && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-8 text-[11.5px] gap-1.5 font-medium",
                                        "text-success hover:bg-success/[0.08]",
                                      )}
                                      onClick={() => void handleReApprove(user)}
                                    >
                                      <RotateCcw className="size-3.5" strokeWidth={2} />
                                      Eeyyami
                                    </Button>
                                  )}
                                  {(activStatus === "suspended" || activStatus === "expired") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={cn(
                                        "h-8 text-[11.5px] gap-1.5 font-medium",
                                        "text-success hover:bg-success/[0.08]",
                                      )}
                                      onClick={() =>
                                        void setActivationStatusFn(user.id, "active")
                                      }
                                    >
                                      <CheckCircle2 className="size-3.5" strokeWidth={2} />
                                      Deebisi
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
              {/* Table footer — count summary */}
              <div
                className={cn(
                  "flex items-center justify-between px-4 sm:px-5 py-3",
                  "border-t border-border/50 bg-muted/20",
                  "text-[12px] text-muted-foreground",
                )}
              >
                <span className="tabular-nums">
                  Showing <span className="font-semibold text-foreground">{filtered.length}</span>{" "}
                  of {users.length} users
                </span>
                <span className="hidden sm:block">
                  Total: {totalStudents} students · {pendingCount} pending
                </span>
              </div>
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
                {reviewTarget.desiredCourse && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground shrink-0">Barnoota</span>
                    <span className="text-right font-medium">{reviewTarget.desiredCourse}</span>
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
