import { BookOpen, ClipboardList, FileQuestion, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { useAdminData } from "@/components/admin/context";
import {
  EmptyState,
  ExamStatusBadge,
  PanelHeader,
  formatDateTime,
} from "@/components/admin/ui-bits";
import { useI18n } from "@/i18n";

function Stat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" /> {label}
      </div>
      <div className="mt-2 text-3xl font-bold">{value}</div>
    </div>
  );
}

export function OverviewPanel() {
  const { t } = useI18n();
  const { courses, questions, exams, attempts, users, audit } = useAdminData();

  const graded = attempts.filter((a) => a.status !== "in_progress");
  const avg = graded.length
    ? Math.round(graded.reduce((s, a) => s + a.percentage, 0) / graded.length)
    : 0;
  const passRate = graded.length
    ? Math.round((graded.filter((a) => a.passed).length / graded.length) * 100)
    : 0;
  const pendingGrading = attempts.filter(
    (a) => a.needsManualGrading && a.status === "submitted",
  ).length;

  return (
    <div className="space-y-6">
      <PanelHeader title={t("admin.overview")} subtitle={t("admin.overviewSubtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={BookOpen} label={t("admin.courses")} value={String(courses.length)} />
        <Stat icon={FileQuestion} label={t("admin.questions")} value={String(questions.length)} />
        <Stat icon={ClipboardList} label={t("admin.exams")} value={String(exams.length)} />
        <Stat icon={Users} label={t("admin.students")} value={String(users.length)} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border bg-card p-5">
          <div className="text-sm text-muted-foreground">{t("admin.avgScore")}</div>
          <div className="mt-1 text-2xl font-bold">{avg}%</div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="text-sm text-muted-foreground">{t("admin.passRate")}</div>
          <div className="mt-1 text-2xl font-bold">{passRate}%</div>
        </div>
        <div className="rounded-lg border bg-card p-5">
          <div className="text-sm text-muted-foreground">{t("admin.pendingGrading")}</div>
          <div className="mt-1 text-2xl font-bold">{pendingGrading}</div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold">{t("admin.recentExams")}</h3>
          <div className="mt-3 space-y-3">
            {exams.length === 0 ? (
              <EmptyState message={t("admin.noData")} />
            ) : (
              exams.slice(0, 5).map((e) => (
                <div key={e.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate">{e.title}</span>
                  <ExamStatusBadge status={e.status} />
                </div>
              ))
            )}
          </div>
        </section>
        <section className="rounded-lg border bg-card p-5">
          <h3 className="font-semibold">{t("admin.recentActivity")}</h3>
          <div className="mt-3 space-y-2">
            {audit.length === 0 ? (
              <EmptyState message={t("admin.noData")} />
            ) : (
              audit.slice(0, 6).map((a) => (
                <div key={a.id} className="text-sm">
                  <span className="font-mono text-xs">{a.action}</span>{" "}
                  <span className="text-muted-foreground">
                    {a.target ?? ""} · {formatDateTime(a.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
