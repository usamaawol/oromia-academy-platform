/**
 * Admin — Audit Log
 */
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n } from "@/i18n";
import { adminListAudit } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import type { AuditEntry } from "@/lib/schema";

export const Route = createFileRoute("/_admin/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  const { t } = useI18n();
  const call = useServerFn();
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void call(adminListAudit, undefined)
      .then((data) => setEntries(data as AuditEntry[]))
      .catch((e) => toast.error(serverErrorMessage(e, t)))
      .finally(() => setLoading(false));
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

  function actionColor(action: string) {
    if (action.includes("delete")) return "text-red-600 dark:text-red-400";
    if (action.includes("create") || action.includes("publish"))
      return "text-green-600 dark:text-green-400";
    return "text-muted-foreground";
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{t("admin.audit")}</h1>
        <p className="text-sm text-muted-foreground">Last 300 actions</p>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 rounded" />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {entries.map((e) => (
                <div key={e.id} className="flex items-start gap-4 px-4 py-3">
                  <div className="min-w-[120px] text-xs text-muted-foreground">
                    {fmt(e.createdAt)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-mono font-medium ${actionColor(e.action)}`}>
                      {e.action}
                    </span>
                    {e.target && (
                      <span className="ml-2 text-sm text-muted-foreground">→ {e.target}</span>
                    )}
                    {e.details && (
                      <p className="text-xs text-muted-foreground truncate">{e.details}</p>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0">{e.userName}</div>
                </div>
              ))}
              {entries.length === 0 && (
                <p className="py-10 text-center text-muted-foreground">{t("common.notFound")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
