/**
 * Student result page — shows score, pass/fail, question breakdown.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Clock3, HelpCircle, Trophy, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n, type TranslationKey } from "@/i18n";
import { getMyResult } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { ResultView } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/result/$attemptId")({
  component: ResultPage,
});

function ResultPage() {
  const { attemptId } = Route.useParams();
  const { t } = useI18n();
  const call = useServerFn();

  const [result, setResult] = useState<ResultView | { published: false } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void call(getMyResult, { attemptId })
      .then((r) => setResult(r as Parameters<typeof setResult>[0] | null))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attemptId]);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-2xl px-4 py-12">
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : !result ? (
          <p className="text-muted-foreground">{t("common.error")}</p>
        ) : "published" in result && !result.published ? (
          <Card className="text-center">
            <CardContent className="pt-10 pb-10">
              <Clock3 className="mx-auto size-12 text-muted-foreground" />
              <h1 className="mt-4 text-xl font-semibold">{t("result.notPublished")}</h1>
              <p className="mt-2 text-muted-foreground">{t("result.pending")}</p>
              <Button asChild className="mt-6">
                <Link to="/dashboard">{t("nav.dashboard")}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ResultView result={result as ResultView} t={t} />
        )}
      </main>
    </div>
  );
}

function ResultView({ result, t }: { result: ResultView; t: (k: TranslationKey, vars?: Record<string, string | number>) => string }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div
          className={cn(
            "mx-auto grid size-20 place-items-center rounded-full",
            result.passed
              ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400"
              : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400",
          )}
        >
          {result.passed ? <Trophy className="size-10" /> : <XCircle className="size-10" />}
        </div>
        <h1 className="mt-4 text-2xl font-bold">
          {result.passed ? t("result.passed") : t("result.failed")}
        </h1>
        <p className="mt-1 text-muted-foreground">{result.examTitle}</p>
      </div>

      {/* Score card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("result.score")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <span className="text-5xl font-bold">{result.percentage}%</span>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.score} / {result.totalPoints} {t("common.points")}
            </p>
          </div>
          <Progress value={result.percentage} className="h-3" />

          <div className="grid grid-cols-3 gap-4 pt-2">
            <div className="text-center">
              <CheckCircle2 className="mx-auto size-5 text-green-500" />
              <div className="mt-1 text-xl font-bold">{result.correctCount}</div>
              <p className="text-xs text-muted-foreground">{t("result.correct")}</p>
            </div>
            <div className="text-center">
              <XCircle className="mx-auto size-5 text-red-500" />
              <div className="mt-1 text-xl font-bold">{result.wrongCount}</div>
              <p className="text-xs text-muted-foreground">{t("result.wrong")}</p>
            </div>
            <div className="text-center">
              <HelpCircle className="mx-auto size-5 text-yellow-500" />
              <div className="mt-1 text-xl font-bold">{result.unansweredCount}</div>
              <p className="text-xs text-muted-foreground">{t("result.unanswered")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Manual grading notice */}
      {result.needsManualGrading && (
        <Card className="border-yellow-300 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="pt-4 pb-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">{t("result.pending")}</p>
          </CardContent>
        </Card>
      )}

      {/* Feedback */}
      {result.feedback && (
        <Card>
          <CardHeader>
            <CardTitle>{t("result.feedback")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line text-sm">{result.feedback}</p>
          </CardContent>
        </Card>
      )}

      <Button asChild className="w-full">
        <Link to="/dashboard">{t("nav.dashboard")}</Link>
      </Button>
    </div>
  );
}
