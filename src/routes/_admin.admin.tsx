/**
 * Admin overview dashboard
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { BarChart3, BookOpen, ClipboardList, GraduationCap, TrendingUp, Users } from "lucide-react";
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

export const Route = createFileRoute("/_admin/admin")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Oromia Academy" }] }),
  component: AdminOverview,
});

type Analytics = Awaited<ReturnType<typeof adminGetAnalytics>>;

function AdminOverview() {
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

  const stats = [
    [Users, t("admin.totalStudents"), data?.totalStudents, "text-blue-500"],
    [BookOpen, t("admin.totalCourses"), data?.totalCourses, "text-green-500"],
    [GraduationCap, t("admin.activeExams"), data?.activeExams, "text-yellow-500"],
    [ClipboardList, t("admin.attempts"), data?.totalAttempts, "text-purple-500"],
    [BarChart3, t("admin.avgScore"), data ? `${data.avgScore}%` : "—", "text-orange-500"],
    [TrendingUp, t("admin.passRate"), data ? `${data.passRate}%` : "—", "text-teal-500"],
  ] as const;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{t("admin.title")}</h1>
          <p className="text-muted-foreground">{t("admin.overview")}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline">
            <Link to="/admin/exams">{t("admin.newExam")}</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/admin/questions">{t("admin.newQuestion")}</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map(([Icon, label, value, color]) => {
          const Ic = Icon as typeof Users;
          return (
            <Card key={String(label)}>
              <CardContent className="p-5">
                <Ic className={`size-5 ${color as string}`} />
                <div className="mt-4 text-3xl font-bold">
                  {loading ? <Skeleton className="h-8 w-16" /> : String(value ?? "—")}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{String(label)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Per-exam table */}
      {!loading && data && data.examStats.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>{t("common.exams")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">{t("admin.examTitle")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("admin.attempts")}</th>
                    <th className="pb-3 pr-4 font-medium">{t("admin.avgScore")}</th>
                    <th className="pb-3 font-medium">{t("admin.passRate")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.examStats.map((es) => (
                    <tr key={es.id}>
                      <td className="py-3 pr-4 font-medium">{es.title}</td>
                      <td className="py-3 pr-4">{es.attempts}</td>
                      <td className="py-3 pr-4">{es.avgScore}%</td>
                      <td className="py-3">
                        <Badge
                          variant={es.passRate >= 50 ? "default" : "destructive"}
                          className="text-xs"
                        >
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
    </div>
  );
}
