/**
 * Admin — Analytics
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { adminGetAnalytics } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";

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
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("admin.analytics")}</h1>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      ) : data ? (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Total Students", data.totalStudents],
              ["Total Attempts", data.totalAttempts],
              ["Average Score", `${data.avgScore}%`],
              ["Pass Rate", `${data.passRate}%`],
            ].map(([label, value]) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="mt-1 text-3xl font-bold">{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Chart */}
          {data.examStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pass Rate by Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.examStats}
                    margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, "Pass rate"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                    />
                    <Bar dataKey="passRate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Avg score chart */}
          {data.examStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Avg Score by Exam</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart
                    data={data.examStats}
                    margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis
                      dataKey="title"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v: number) => `${v}%`}
                    />
                    <Tooltip
                      formatter={(v: number) => [`${v}%`, "Avg score"]}
                      contentStyle={{ borderRadius: "8px", fontSize: "13px" }}
                    />
                    <Bar dataKey="avgScore" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Table */}
          <Card>
            <CardHeader>
              <CardTitle>Exam breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Exam</th>
                    <th className="pb-3 pr-4 font-medium">Attempts</th>
                    <th className="pb-3 pr-4 font-medium">Avg Score</th>
                    <th className="pb-3 font-medium">Pass Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.examStats.map((es) => (
                    <tr key={es.id}>
                      <td className="py-3 pr-4">{es.title}</td>
                      <td className="py-3 pr-4">{es.attempts}</td>
                      <td className="py-3 pr-4">{es.avgScore}%</td>
                      <td className="py-3">{es.passRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
