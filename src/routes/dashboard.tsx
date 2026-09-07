import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BookOpen, ClipboardCheck, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { listExams } from "@/lib/data";
import type { Exam } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [
    { title: "Student Dashboard — Oromia Academy" },
    { name: "description", content: "View your courses, available exams and results at Oromia Academy." },
    { property: "og:title", content: "Student Dashboard — Oromia Academy" },
    { property: "og:description", content: "Your Oromia Academy courses, exams and results." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t } = useI18n();
  const [exams, setExams] = useState<Exam[]>([]);
  useEffect(() => { void listExams().then(setExams).catch(() => setExams([])); }, []);
  return <div className="min-h-screen bg-background"><SiteHeader /><main className="mx-auto w-full max-w-6xl px-4 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold text-primary">{t("common.academy")}</p><h1 className="mt-1 text-3xl font-bold">{t("dash.title")}</h1></div><Button asChild variant="outline"><Link to="/">{t("common.back")}</Link></Button></div>
    <div className="mt-8 grid gap-4 sm:grid-cols-3">{[[BookOpen, t("dash.myCourses"), '3'], [ClipboardCheck, t("dash.availableExams"), String(exams.filter(e => e.status === 'active').length)], [Bell, t("dash.notifications"), '1']].map(([Icon, label, value]) => { const StatIcon = Icon as typeof BookOpen; return <div key={String(label)} className="rounded-lg border bg-card p-5 shadow-soft"><StatIcon className="size-5 text-primary"/><div className="mt-5 text-3xl font-bold">{String(value)}</div><div className="mt-1 text-sm text-muted-foreground">{String(label)}</div></div>; })}</div>
    <section className="mt-10"><h2 className="text-xl font-semibold">{t("dash.availableExams")}</h2><div className="mt-4 grid gap-3">{exams.map(exam => <article key={exam.id} className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"><div className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground"><ClipboardCheck className="size-5"/></div><div className="flex-1"><h3 className="font-semibold">{exam.title}</h3><p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground"><Clock3 className="size-4"/>{exam.durationMin} {t("common.minutes")} · {exam.questionIds.length} {t("common.questions")}</p></div><Button>{t("dash.startExam")}</Button></article>)}</div></section>
  </main></div>;
}