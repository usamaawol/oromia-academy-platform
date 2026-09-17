import { Download } from "lucide-react";

import { useAdminData } from "@/components/admin/context";
import { EmptyState, PanelHeader, downloadCsv, formatDateTime } from "@/components/admin/ui-bits";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useI18n } from "@/i18n";

export function AuditPanel() {
  const { t } = useI18n();
  const { audit } = useAdminData();

  return (
    <div className="space-y-5">
      <PanelHeader title={t("admin.audit")} subtitle={t("admin.auditSubtitle")}>
        <Button
          variant="outline"
          disabled={audit.length === 0}
          onClick={() =>
            downloadCsv("oromia-academy-audit.csv", [
              [t("common.date"), t("common.user"), t("admin.action"), t("admin.target")],
              ...audit.map((a) => [
                formatDateTime(a.createdAt),
                a.userName,
                a.action,
                a.target ?? "",
              ]),
            ])
          }
        >
          <Download /> {t("common.export")}
        </Button>
      </PanelHeader>

      {audit.length === 0 ? (
        <EmptyState message={t("admin.noData")} />
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("common.date")}</TableHead>
                <TableHead>{t("common.user")}</TableHead>
                <TableHead>{t("admin.action")}</TableHead>
                <TableHead>{t("admin.target")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {audit.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="whitespace-nowrap text-xs">
                    {formatDateTime(a.createdAt)}
                  </TableCell>
                  <TableCell>{a.userName}</TableCell>
                  <TableCell className="font-mono text-xs">{a.action}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {a.target ?? "—"}
                    {a.before || a.after ? (
                      <span className="block text-xs">
                        {a.before ?? "—"} → {a.after ?? "—"}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
