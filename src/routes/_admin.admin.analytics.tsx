/**
 * Admin — Analytics (premium redesign)
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Activity,
  Award,
  BarChart3,
  CheckCircle2,
  GraduationCap,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader, StatCard } from "@/components/page-header";
import { useI18n } from "@/i18n";
import { adminGetAnalytics } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/analytics")({
  component: AnalyticsPage,
});

type Analytics = Awaited<ReturnType<typeof adminGetAnalytics>>;

function AnalyticsPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void call(adminGetAnalytics, undefined)
      .then((d) => setData(d as Analytics))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("admin.analytics")}
        subtitle="Platform performance, student progress, and exam statistics."
      />

      {loading ? (
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-[88px] rounded-xl" />
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[72px] rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-[280px] rounded-xl" />
        </div>
      ) : data ? (
        <div className="space-y-5">
          {/* ── Primary KPI row ── */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Students"
              value={data.totalStudents}
              sub="Registered accounts"
              accent="default"
              icon={<Users className="size-3.5" />}
            />
            <StatCard
              label="Total Attempts"
              value={data.totalAttempts}
              sub="Submitted exams"
              accent="info"
              icon={<Activity className="size-3.5" />}
            />
            <StatCard
              label="Average Score"
              value={`${data.avgScore}%`}
              sub="Across all exams"
              accent={data.avgScore >= 60 ? "success" : "warning"}
              icon={<Target className="size-3.5" />}
            />
            <StatCard
              label="Pass Rate"
              value={`${data.passRate}%`}
              sub="Students passing"
              accent={data.passRate >= 60 ? "success" : "warning"}
              icon={<TrendingUp className="size-3.5" />}
            />
          </div>

          {/* ── Registration funnel ── */}
          <div>
            <h2 className="mb-2.5 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
              Registration Funnel
            </h2>
            <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { label: "Total",     value: (data as { totalStudents?: number }).totalStudents     ?? 0, accent: "default"  as const },
                { label: "Pending",   value: (data as { pendingStudents?: number }).pendingStudents   ?? 0, accent: "warning"  as const },
                { label: "Approved",  value: (data as { approvedStudents?: number }).approvedStudents  ?? 0, accent: "info"     as const },
                { label: "Activated", value: (data as { activatedStudents?: number }).activatedStudents ?? 0, accent: "success"  as const },
                { label: "Rejected",  value: (data as { rejectedStudents?: number }).rejectedStudents  ?? 0, accent: "danger"   as const },
              ].map(({ label, value, accent }) => (
                <StatCard key={label} label={label} value={value} accent={accent} />
              ))}
            </div>
          </div>

          {/* ── Charts ── */}
          {data.examStats.length > 0 && (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Pass Rate */}
              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px]">
                    <CheckCircle2 className="size-4 text-primary" />
                    Pass Rate by Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.examStats} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, "Pass rate"]}
                        contentStyle={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid oklch(var(--border))",
                          boxShadow: "var(--shadow-card)",
                        }}
                        cursor={{ fill: "oklch(var(--muted) / 0.5)" }}
                      />
                      <Bar dataKey="passRate" fill="oklch(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Avg Score */}
              <Card className="border-border/60 shadow-soft">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-[14px]">
                    <Award className="size-4 text-primary" />
                    Avg Score by Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={data.examStats} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="oklch(var(--border))" opacity={0.5} />
                      <XAxis
                        dataKey="title"
                        tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 11, fill: "oklch(var(--muted-foreground))" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v: number) => `${v}%`}
                      />
                      <Tooltip
                        formatter={(v: number) => [`${v}%`, "Avg score"]}
                        contentStyle={{
                          borderRadius: "10px",
                          fontSize: "12px",
                          border: "1px solid oklch(var(--border))",
                          boxShadow: "var(--shadow-card)",
                        }}
                        cursor={{ fill: "oklch(var(--muted) / 0.5)" }}
                      />
                      <Bar dataKey="avgScore" fill="oklch(var(--chart-2))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── Exam breakdown table ── */}
          {data.examStats.length > 0 && (
            <Card className="border-border/60 shadow-soft">
              <CardHeader className="pb-0">
                <CardTitle className="flex items-center gap-2 text-[14px]">
                  <GraduationCap className="size-4 text-primary" />
                  Exam Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/60">
                        <th className="pb-2.5 pr-4 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Exam
                        </th>
                        <th className="pb-2.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Attempts
                        </th>
                        <th className="pb-2.5 pr-4 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Avg Score
                        </th>
                        <th className="pb-2.5 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Pass Rate
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {data.examStats.map((es) => (
                        <tr key={es.id} className="hover:bg-muted/30 transition-colors">
                          <td className="py-2.5 pr-4 font-medium text-sm">{es.title}</td>
                          <td className="py-2.5 pr-4 text-right tabular-nums text-muted-foreground">
                            {es.attempts}
                          </td>
                          <td className="py-2.5 pr-4 text-right tabular-nums">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                es.avgScore >= 60
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {es.avgScore}%
                            </span>
                          </td>
                          <td className="py-2.5 text-right tabular-nums">
                            <span
                              className={cn(
                                "text-sm font-semibold",
                                es.passRate >= 60
                                  ? "text-emerald-600 dark:text-emerald-400"
                                  : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              {es.passRate}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {data.examStats.length === 0 && (
            <div className="flex flex-col items-center gap-3 py-16 text-center rounded-xl border border-dashed border-border/60">
              <BarChart3 className="size-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No exam data yet.</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
