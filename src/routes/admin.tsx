import { createFileRoute, Link } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { AdminDataProvider, useAdminData } from "@/components/admin/context";
import { AuditPanel } from "@/components/admin/audit-panel";
import { CoursesPanel } from "@/components/admin/courses-panel";
import { ExamsPanel } from "@/components/admin/exams-panel";
import { OverviewPanel } from "@/components/admin/overview-panel";
import { QuestionsPanel } from "@/components/admin/questions-panel";
import { ResultsPanel } from "@/components/admin/results-panel";
import { SettingsPanel } from "@/components/admin/settings-panel";
import { StudentsPanel } from "@/components/admin/students-panel";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Academy Administration — Oromia Academy" },
      { name: "description", content: "Manage Oromia Academy courses, exams and students." },
      { property: "og:title", content: "Academy Administration — Oromia Academy" },
      { property: "og:description", content: "Manage academy courses, exams and students." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AdminPage,
});

const TABS = [
  "overview",
  "courses",
  "questions",
  "exams",
  "grading",
  "students",
  "settings",
  "audit",
] as const;
type Tab = (typeof TABS)[number];

function AdminShell() {
  const { t } = useI18n();
  const { loading, reload } = useAdminData();
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-primary">{t("common.academy")}</p>
          <h1 className="mt-1 text-3xl font-bold">{t("admin.title")}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={loading} onClick={() => void reload()}>
            <RefreshCw className={loading ? "animate-spin" : undefined} /> {t("common.refresh")}
          </Button>
          <Button asChild variant="outline">
            <Link to="/">{t("common.back")}</Link>
          </Button>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 border-b pb-3">
        {TABS.map((key) => (
          <Button
            key={key}
            size="sm"
            variant={tab === key ? "default" : "ghost"}
            onClick={() => setTab(key)}
          >
            {t(`admin.${key}` as const)}
          </Button>
        ))}
      </nav>

      <div className="mt-8">
        {tab === "overview" ? <OverviewPanel /> : null}
        {tab === "courses" ? <CoursesPanel /> : null}
        {tab === "questions" ? <QuestionsPanel /> : null}
        {tab === "exams" ? <ExamsPanel /> : null}
        {tab === "grading" ? <ResultsPanel /> : null}
        {tab === "students" ? <StudentsPanel /> : null}
        {tab === "settings" ? <SettingsPanel /> : null}
        {tab === "audit" ? <AuditPanel /> : null}
      </div>
    </main>
  );
}

function AdminPage() {
  const { t } = useI18n();
  const { isStaff, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <p className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground">
          {t("common.loading")}
        </p>
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">{t("admin.noPermission")}</h1>
          <p className="mt-2 text-muted-foreground">{t("admin.staffOnly")}</p>
          <div className="mt-6 flex justify-center gap-2">
            <Button asChild>
              <Link to="/auth">{t("nav.login")}</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">{t("common.back")}</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <AdminDataProvider>
        <AdminShell />
      </AdminDataProvider>
    </div>
  );
}
