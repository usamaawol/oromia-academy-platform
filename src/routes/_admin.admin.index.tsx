/**
 * Admin overview dashboard — shown at /admin exactly.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  Plus,
  RefreshCw,
  Trophy,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { adminGetAnalytics } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Oromia Academy" }] }),
  component: AdminOverview,
});

type Analytics = Awaited<ReturnType<typeof adminGetAnalytics>>;

const QUICK_ACTIONS = [
  {
    label: "New Exam",
    description: "Create and schedule a new exam",
    icon: GraduationCap,
    to: "/admin/exams" as const,
    search: { new: "1" as const },
    color: "from-violet-500 to-purple-600",
    glow: "shadow-[0_8px_30px_-6px_rgba(139,92,246,0.5)]",
  },
  {
    label: "New Question",
    description: "Add a question to the bank",
    icon: ClipboardList,
    to: "/admin/questions" as const,
    search: { new: "1" as const },
    color: "from-teal-500 to-emerald-600",
    glow: "shadow-[0_8px_30px_-6px_rgba(20,184,166,0.5)]",
  },
  {
    label: "New Course",
    description: "Set up a new course",
    icon: BookOpen,
    to: "/admin/courses" as const,
    search: { new: "1" as const },
    color: "from-blue-500 to-cyan-600",
    glow: "shadow-[0_8px_30px_-6px_rgba(59,130,246,0.5)]",
  },
  {
    label: "Grade Results",
    description: "Review pending submissions",
    icon: Trophy,
    to: "/admin/results" as const,
    search: {},
    color: "from-amber-500 to-orange-600",
    glow: "shadow-[0_8px_30px_-6px_rgba(245,158,11,0.5)]",
  },
] as const;

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  loading,
  to,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number | undefined;
  color: string;
  loading: boolean;
  to: string;
}) {
  return (
    <Link to={to as "/admin/students"} className="group block">
      <Card className="transition-all duration-200 hover:-translate-y-1 hover:shadow-soft border-border/60 overflow-hidden">
        <CardContent className="p-5">
          <div className="flex items-start justify-between">
            <div className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br shadow-sm", color)}>
              <Icon className="size-5 text-white" />
            </div>
            <ArrowRight className="size-4 text-muted-foreground/40 transition-all group-hover:translate-x-1 group-hover:text-primary" />
          </div>
          <div className="mt-4">
            {loading ? (
              <Skeleton className="h-8 w-20" />
            ) : (
              <div className="text-3xl font-bold tracking-tight">{value ?? "—"}</div>
            )}
            <div className="mt-1 text-sm text-muted-foreground font-medium">{label}</div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

function AdminOverview() {
  const { t } = useI18n();
  const { profile } = useAuth();
  const call = useServerFn();
  const navigate = useNavigate();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const d = await call(adminGetAnalytics, undefined);
      setData(d as Analytics);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = [
    { icon: Users,        label: t("admin.totalStudents"), value: data?.totalStudents, color: "from-blue-500 to-indigo-600",   to: "/admin/students" },
    { icon: BookOpen,     label: t("admin.totalCourses"),  value: data?.totalCourses,  color: "from-emerald-500 to-teal-600", to: "/admin/courses"  },
    { icon: GraduationCap,label: t("admin.activeExams"),   value: data?.activeExams,   color: "from-violet-500 to-purple-600",to: "/admin/exams"    },
    { icon: ClipboardList,label: t("admin.attempts"),      value: data?.totalAttempts, color: "from-pink-500 to-rose-600",    to: "/admin/results"  },
    { icon: BarChart3,    label: t("admin.avgScore"),      value: data ? `${data.avgScore}%`  : undefined, color: "from-orange-500 to-amber-600", to: "/admin/analytics" },
    { icon: TrendingUp,   label: t("admin.passRate"),      value: data ? `${data.passRate}%`  : undefined, color: "from-teal-500 to-cyan-600",   to: "/admin/analytics" },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Hero header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/90 via-primary to-primary/80 p-6 md:p-8 text-primary-foreground">
        <div className="absolute inset-0 grid-glow opacity-20 pointer-events-none" />
        <div className="absolute -right-10 -top-10 size-48 rounded-full bg-primary-foreground/5 pointer-events-none" />
        <div className="absolute -right-4 top-16 size-24 rounded-full bg-primary-foreground/5 pointer-events-none" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Zap className="size-4 text-primary-foreground/70" />
              <span className="text-sm font-medium text-primary-foreground/70">
                {greeting}, {profile?.fullName?.split(" ")[0] ?? "Admin"}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{t("admin.title")}</h1>
            <p className="mt-1 text-sm text-primary-foreground/70">
              {t("admin.overview")} · {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              size="sm"
              variant="secondary"
              className="bg-primary-foreground/15 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/25"
              onClick={() => void load(true)}
              disabled={refreshing}
            >
              <RefreshCw className={cn("size-3.5 mr-1.5", refreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button
              size="sm"
              className="bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
              onClick={() => void navigate({ to: "/admin/exams", search: { new: "1" } })}
            >
              <Plus className="size-3.5 mr-1.5" />
              {t("admin.newExam")}
            </Button>
          </div>
        </div>

        {/* Mini stats */}
        <div className="relative mt-6 grid grid-cols-3 gap-3">
          {loading
            ? [0, 1, 2].map((i) => <Skeleton key={i} className="h-16 rounded-xl bg-primary-foreground/10" />)
            : data
              ? [
                  { label: "Total Students", value: data.totalStudents, icon: Users },
                  { label: "Total Exams",    value: data.totalExams,    icon: GraduationCap },
                  { label: "Total Attempts", value: data.totalAttempts, icon: Activity },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-xl bg-primary-foreground/10 backdrop-blur-sm px-3 py-2.5 border border-primary-foreground/10">
                    <div className="flex items-center gap-1.5 text-primary-foreground/70 mb-1">
                      <Icon className="size-3" />
                      <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
                    </div>
                    <div className="text-xl font-bold">{value}</div>
                  </div>
                ))
              : null}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          <h2 className="font-semibold text-sm">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {QUICK_ACTIONS.map(({ label, description, icon: Icon, to, search, color, glow }) => (
            <button
              key={label}
              onClick={() => void navigate({ to, search })}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <div className={cn("grid size-10 place-items-center rounded-xl bg-gradient-to-br mb-3 transition-all duration-200 group-hover:scale-110", color, glow)}>
                <Icon className="size-5 text-white" />
              </div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{description}</p>
              <ArrowRight className="absolute right-3 top-3 size-3.5 text-muted-foreground/30 transition-all group-hover:text-primary group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-4 text-primary" />
          <h2 className="font-semibold text-sm">Performance Overview</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map(({ icon, label, value, color, to }) => (
            <StatCard key={label} icon={icon} label={label} value={value} color={color} loading={loading} to={to} />
          ))}
        </div>
      </div>

      {/* Exam breakdown table */}
      {!loading && data && data.examStats.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <GraduationCap className="size-4 text-primary" />
                {t("common.exams")} — Breakdown
              </CardTitle>
              <Button asChild variant="ghost" size="sm" className="text-xs gap-1">
                <Link to="/admin/analytics">View analytics <ArrowRight className="size-3" /></Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left">
                    {["Exam", "Attempts", "Avg Score", "Pass Rate"].map((h) => (
                      <th key={h} className="pb-3 pr-4 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {data.examStats.map((es) => (
                    <tr key={es.id} className="hover:bg-muted/30 transition-colors">
                      <td className="py-3 pr-4 font-medium">
                        <Link to="/admin/exams" className="hover:text-primary transition-colors">{es.title}</Link>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">{es.attempts}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(es.avgScore, 100)}%` }} />
                          </div>
                          <span className="tabular-nums">{es.avgScore}%</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <Badge variant={es.passRate >= 50 ? "default" : "destructive"} className="text-xs font-semibold">
                          {es.passRate}%
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && data && data.examStats.length === 0 && (
        <Card className="border-border/60 border-dashed">
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="grid size-14 place-items-center rounded-2xl bg-muted">
              <GraduationCap className="size-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold">No exams yet</p>
              <p className="text-sm text-muted-foreground mt-1">Create your first exam to start tracking student performance.</p>
            </div>
            <Button size="sm" onClick={() => void navigate({ to: "/admin/exams", search: { new: "1" } })}>
              <Plus className="size-3.5 mr-1.5" />
              {t("admin.newExam")}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
