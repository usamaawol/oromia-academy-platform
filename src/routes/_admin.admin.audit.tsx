/**
 * Admin — Audit Log (premium redesign)
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, RefreshCw, ShieldCheck } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/page-header";
import { useI18n } from "@/i18n";
import { adminListAudit } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { AuditEntry } from "@/lib/schema";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    void call(adminListAudit, undefined)
      .then((data) => setEntries(data as AuditEntry[]))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function fmt(ts: number) {
    return new Date(ts).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function actionMeta(action: string): { color: string; dot: string } {
    if (action.includes("delete") || action.includes("revoke"))
      return { color: "text-red-600 dark:text-red-400", dot: "bg-red-500" };
    if (action.includes("create") || action.includes("publish") || action.includes("approve"))
      return { color: "text-emerald-600 dark:text-emerald-400", dot: "bg-emerald-500" };
    if (action.includes("update") || action.includes("grade"))
      return { color: "text-blue-600 dark:text-blue-400", dot: "bg-blue-500" };
    return { color: "text-muted-foreground", dot: "bg-muted-foreground/40" };
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={t("admin.audit")}
        subtitle="Complete history of all admin and system actions."
        action={
          <Button variant="outline" size="sm" onClick={load} className="gap-1.5">
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="space-y-2 rounded-xl border border-border/60 bg-card p-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-12 rounded-lg" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-16 text-center">
          <div className="grid size-12 place-items-center rounded-2xl bg-muted/60">
            <History className="size-5 text-muted-foreground/40" />
          </div>
          <p className="text-sm font-medium">{t("common.notFound")}</p>
          <p className="text-xs text-muted-foreground">No audit entries yet.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/60 bg-card overflow-hidden shadow-soft">
          {/* Table header */}
          <div className="hidden sm:grid grid-cols-[160px_1fr_140px] gap-4 border-b border-border/60 bg-muted/30 px-4 py-2.5">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Time</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Action</span>
            <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">By</span>
          </div>

          <div className="divide-y divide-border/40">
            {entries.map((e) => {
              const meta = actionMeta(e.action);
              return (
                <div
                  key={e.id}
                  className="group flex flex-col gap-1 px-4 py-3 transition-colors hover:bg-muted/20 sm:grid sm:grid-cols-[160px_1fr_140px] sm:items-center sm:gap-4"
                >
                  {/* Timestamp */}
                  <div className="flex items-center gap-2">
                    <span className={cn("size-1.5 shrink-0 rounded-full", meta.dot)} />
                    <span className="text-[11px] tabular-nums text-muted-foreground">{fmt(e.createdAt)}</span>
                  </div>

                  {/* Action + target */}
                  <div className="min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className={cn("font-mono text-[12px] font-semibold", meta.color)}>
                        {e.action}
                      </span>
                      {e.target && (
                        <span className="text-[12px] text-muted-foreground">
                          → <span className="font-medium text-foreground/80">{e.target}</span>
                        </span>
                      )}
                    </div>
                    {e.details && (
                      <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{e.details}</p>
                    )}
                  </div>

                  {/* Actor */}
                  <div className="flex items-center gap-1.5">
                    <div className="grid size-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[9px] font-bold text-primary">
                      {(e.userName ?? "?")[0]?.toUpperCase()}
                    </div>
                    <span className="truncate text-[11px] text-muted-foreground">{e.userName}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-border/60 bg-muted/20 px-4 py-2.5">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="size-3.5 text-muted-foreground/50" />
              <span className="text-[11px] text-muted-foreground">
                Showing last {entries.length} actions
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
