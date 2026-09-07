import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, ClipboardList, GraduationCap, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { listCourses, listExams, listUsers } from "@/lib/data";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [
    { title: "Academy Administration — Oromia Academy" },
    { name: "description", content: "Manage Oromia Academy courses, exams and students." },
    { property: "og:title", content: "Academy Administration — Oromia Academy" },
    { property: "og:description", content: "Manage academy courses, exams and students." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: AdminPage,
});

function AdminPage() {
  const { t } = useI18n();
  const [counts, setCounts] = useState({ courses: 0, exams: 0, users: 0 });
  useEffect(() => { void Promise.all([listCourses(), listExams(), listUsers()]).then(([courses, exams, users]) => setCounts({ courses: courses.length, exams: exams.length, users: users.length })).catch(() => undefined); }, []);
  const stats = [[BookOpen, t("admin.totalCourses"), counts.courses], [ClipboardList, t("admin.totalExams"), counts.exams], [Users, t("admin.totalStudents"), counts.users]] as const;
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto w-full max-w-6xl px-4 py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{t("common.academy")}</p><h1 className="mt-1 text-3xl font-bold">{t("admin.title")}</h1></div><Button asChild variant="outline"><Link to="/">{t("common.back")}</Link></Button></div><div className="mt-8 grid gap-4 sm:grid-cols-3">{stats.map(([Icon, label, value]) => <div key={label} className="rounded-lg border bg-card p-5 shadow-soft"><Icon className="size-5 text-primary"/><div className="mt-5 text-3xl font-bold">{value}</div><div className="mt-1 text-sm text-muted-foreground">{label}</div></div>)}</div><section className="mt-10 rounded-lg border bg-card p-6"><GraduationCap className="size-8 text-primary"/><h2 className="mt-4 text-xl font-semibold">{t("admin.overview")}</h2><p className="mt-2 text-muted-foreground">{t("admin.contentSettings")}, {t("admin.questions")}, {t("admin.grading")}.</p></section></main></div>;
}