/**
 * Admin — Student Rankings / Leaderboard
 */
import { createFileRoute } from "@tanstack/react-router";
import {
  Trophy,
  Medal,
  Crown,
  TrendingUp,
  Eye,
  EyeOff,
  Search,
  RefreshCw,
  Users,
  Award,
  ClipboardCheck,
  Mail,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import {
  adminPublishRankings,
  adminUnpublishRankings,
  getRankings,
} from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/rankings")({
  component: AdminRankingsPage,
});

type AdminRankingItem = {
  id: string;
  fullName: string;
  email: string;
  nickname: string;
  avgScore: number;
  examCount: number;
  totalScore: number;
  rank: number;
};

type AdminRankingsResponse = {
  all: AdminRankingItem[];
  rankingsPublished: boolean;
  isStaff: boolean;
  myRank: AdminRankingItem | null;
};

function AdminRankingsPage() {
  const { t } = useI18n();
  const { profile: myProfile } = useAuth();
  const call = useServerFn();

  const [rankings, setRankings] = useState<AdminRankingItem[]>([]);
  const [rankingsPublished, setRankingsPublished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [query, setQuery] = useState("");

  const refresh = async () => {
    setLoading(true);
    try {
      const data = (await call(getRankings, undefined)) as AdminRankingsResponse;
      setRankings(data.all);
      setRankingsPublished(data.rankingsPublished);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = rankings.filter((r) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      r.fullName.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.nickname.toLowerCase().includes(q) ||
      String(r.rank).includes(q)
    );
  });

  const handlePublish = async (publish: boolean) => {
    setPublishing(true);
    try {
      if (publish) {
        await call(adminPublishRankings, undefined);
        toast.success("Rankings published! Students can now view the leaderboard.");
      } else {
        await call(adminUnpublishRankings, undefined);
        toast.success("Rankings unpublished. Only students' personal ranks are visible.");
      }
      setRankingsPublished(publish);
    } catch (e) {
      toast.error(serverErrorMessage(e, t));
    } finally {
      setPublishing(false);
    }
  };

  const totalStudents = rankings.length;
  const withScores = rankings.filter((r) => r.examCount > 0).length;
  const avgAcrossBoard =
    withScores > 0
      ? Math.round(rankings.reduce((s, r) => s + r.avgScore, 0) / withScores)
      : 0;
  const topScore = rankings[0]?.avgScore ?? 0;

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <Trophy className="size-6 text-primary" />
            {t("common.leaderboard")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Full view of student rankings with real names. Use the publish toggle to share a
            nickname-only leaderboard with students.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant={rankingsPublished ? "default" : "secondary"}
            className="flex items-center gap-1 px-3 py-1"
          >
            {rankingsPublished ? (
              <>
                <Eye className="size-3.5" /> Published to students
              </>
            ) : (
              <>
                <EyeOff className="size-3.5" /> Visible to staff only
              </>
            )}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => void refresh()} disabled={loading}>
            <RefreshCw className={cn("size-4 mr-1.5", loading && "animate-spin")} />
            Refresh
          </Button>
          {rankingsPublished ? (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => void handlePublish(false)}
              disabled={publishing}
            >
              <EyeOff className="mr-1.5 size-4" />
              {publishing ? "Unpublishing..." : "Unpublish Rankings"}
            </Button>
          ) : (
            <Button
              size="sm"
              onClick={() => void handlePublish(true)}
              disabled={publishing}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Eye className="mr-1.5 size-4" />
              {publishing ? "Publishing..." : "Publish Rankings"}
            </Button>
          )}
        </div>
      </div>

      {rankingsPublished && (
        <div className="mb-6 rounded-xl border border-green-300 bg-green-50 dark:border-green-800/60 dark:bg-green-950/20 p-4">
          <div className="flex items-start gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-green-100 dark:bg-green-900/50">
              <Eye className="size-4 text-green-700 dark:text-green-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-green-900 dark:text-green-300">
                Leaderboard is live
              </p>
              <p className="mt-0.5 text-sm text-green-800/90 dark:text-green-300/90">
                Students can now compare rankings anonymously. Only nicknames are visible — no real
                names or emails are shared. You can revoke access at any time.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        {[
          [Users, "Total students", totalStudents, "text-blue-500"],
          [ClipboardCheck, "With completed exams", withScores, "text-green-500"],
          [Award, "Class average", `${avgAcrossBoard}%`, "text-purple-500"],
          [Trophy, "Top score", `${topScore}%`, "text-amber-500"],
        ].map(([Icon, label, value, color]) => {
          const Ic = Icon as typeof Users;
          return (
            <Card key={String(label)}>
              <CardContent className="p-5">
                <Ic className={`size-5 mb-3 ${color as string}`} />
                <div className="text-3xl font-bold tracking-tight">
                  {loading ? "—" : String(value)}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">{String(label)}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {rankings.length > 0 && rankings[0] && (
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          {rankings.slice(0, 3).map((r, idx) => {
            const medals = [
              {
                bg: "from-yellow-400 to-amber-500",
                fg: "text-yellow-950",
                ring: "ring-yellow-300",
                icon: Crown,
              },
              {
                bg: "from-slate-300 to-slate-400",
                fg: "text-slate-900",
                ring: "ring-slate-300",
                icon: Medal,
              },
              {
                bg: "from-orange-400 to-amber-600",
                fg: "text-orange-950",
                ring: "ring-orange-300",
                icon: Medal,
              },
            ];
            const m = medals[idx]!;
            const Icon = m.icon;
            return (
              <Card
                key={r.id}
                className={cn(
                  "overflow-hidden",
                  idx === 0 && "md:scale-[1.02] md:z-10 ring-2 ring-offset-2",
                  idx === 0 && `ring-amber-300 dark:ring-amber-700`,
                )}
              >
                <CardContent className={`bg-gradient-to-br ${m.bg} p-6 ${m.fg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-80">
                      #{idx + 1} Place
                    </span>
                    <Icon className="size-7" />
                  </div>
                  <div className="mt-6 flex items-center gap-4">
                    <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/30 backdrop-blur-sm text-xl font-black ring-2 ring-white/40">
                      {r.fullName[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-lg font-bold leading-tight">{r.fullName}</p>
                      <p className="truncate text-xs opacity-80 flex items-center gap-1 mt-0.5">
                        <Mail className="size-3" /> {r.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-white/25 px-3 py-2 ring-1 ring-white/30 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase opacity-75">Average</p>
                      <p className="text-2xl font-black leading-tight">{r.avgScore}%</p>
                    </div>
                    <div className="rounded-xl bg-white/25 px-3 py-2 ring-1 ring-white/30 backdrop-blur-sm">
                      <p className="text-[10px] font-bold uppercase opacity-75">Exams</p>
                      <p className="text-2xl font-black leading-tight">{r.examCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, nickname or rank..."
            className="w-full sm:w-80 pl-9"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <span className="ml-auto text-sm text-muted-foreground">
          Showing {filtered.length} of {rankings.length} students
        </span>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-hidden rounded-lg border">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="w-20 px-4 py-3 text-left font-medium text-muted-foreground">
                      Rank
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Student
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Nickname
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                      Email
                    </th>
                    <th className="w-24 px-4 py-3 text-center font-medium text-muted-foreground">
                      Exams
                    </th>
                    <th className="w-32 px-4 py-3 text-right font-medium text-muted-foreground">
                      Avg Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filtered.map((r) => (
                    <tr
                      key={r.id}
                      className={cn(
                        "hover:bg-muted/30",
                        r.id === myProfile?.id && "bg-primary/5 dark:bg-primary/10",
                      )}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "grid size-8 place-items-center rounded-lg text-sm font-black",
                              r.rank === 1
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400"
                                : r.rank === 2
                                  ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  : r.rank === 3
                                    ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                                    : "bg-muted text-muted-foreground",
                            )}
                          >
                            {r.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                              r.rank <= 3
                                ? "bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-soft"
                                : "bg-muted text-muted-foreground",
                            )}
                          >
                            {r.fullName[0]?.toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold leading-tight truncate">
                              {r.fullName}
                              {r.id === myProfile?.id && (
                                <Badge variant="outline" className="ml-2 h-5 border-primary/50 text-primary text-[10px]">
                                  YOU
                                </Badge>
                              )}
                            </p>
                            <p className="md:hidden truncate text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Mail className="size-3" /> {r.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 md:table-cell">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-accent/60 px-2.5 py-1 text-xs font-medium text-accent-foreground">
                          <TrendingUp className="size-3 text-primary" />
                          {r.nickname}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="size-3.5 opacity-60" />
                          {r.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-md bg-muted px-2 py-1 text-xs font-semibold min-w-[2.5rem]">
                          {r.examCount}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span
                            className={cn(
                              "text-lg font-black tracking-tight tabular-nums",
                              r.avgScore >= 80
                                ? "text-green-600 dark:text-green-400"
                                : r.avgScore >= 50
                                  ? "text-amber-600 dark:text-amber-400"
                                  : r.avgScore > 0
                                    ? "text-red-600 dark:text-red-400"
                                    : "text-muted-foreground",
                            )}
                          >
                            {r.avgScore}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && (
                <div className="py-16 text-center">
                  <Trophy className="mx-auto size-10 text-muted-foreground/30" />
                  <p className="mt-3 text-sm font-medium text-muted-foreground">
                    {query ? "No students match your search." : "No ranking data yet."}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    Once students complete published exams, their rankings will appear here.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
