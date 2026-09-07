import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Bot, CheckCircle2, Clock3, Send, Sparkles, WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { localized, useI18n } from "@/i18n";
import { listCourses } from "@/lib/data";
import type { Course } from "@/lib/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Oromia Academy — Technology Education" },
      { name: "description", content: "Learn AI editing, Telegram earning and bot automation in Afaan Oromoo and English." },
      { property: "og:title", content: "Oromia Academy — Technology Education" },
      { property: "og:description", content: "Practical technology courses and secure digital examinations in Afaan Oromoo." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { t, lang } = useI18n();
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    void listCourses().then(setCourses).catch(() => setCourses([]));
  }, []);

  const icons = { sparkles: Sparkles, send: Send, bot: Bot };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <section className="surface-hero relative overflow-hidden">
          <div className="grid-glow absolute inset-0 opacity-40" />
          <div className="relative mx-auto grid min-h-[530px] w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.2fr_.8fr] md:py-20">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-3 py-1.5 text-sm font-medium">
                <Sparkles className="size-4" /> {t("landing.badge")}
              </div>
              <h1 className="text-4xl font-bold leading-tight md:text-6xl">
                {t("landing.heroTitle")}
              </h1>
              <p className="mt-6 max-w-2xl text-base leading-7 text-primary-foreground/80 md:text-lg">
                {t("landing.heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-background text-foreground hover:bg-background/90">
                  <Link to="/auth">{t("landing.ctaPrimary")} <ArrowRight /></Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-primary-foreground/30 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                  <a href="#courses">{t("landing.ctaSecondary")}</a>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="border-l border-primary-foreground/20 pl-8">
                <p className="text-sm font-semibold uppercase text-primary-foreground/65">Oromia Academy</p>
                <p className="mt-4 text-2xl font-semibold leading-snug">{t("landing.heroQuestion")}</p>
                <div className="mt-8 grid grid-cols-3 gap-3">
                  {[['3+', t("landing.statsCourses")], ['100+', t("landing.statsStudents")], ['3', t("landing.statsExams")]].map(([value, label]) => (
                    <div key={label} className="border-t border-primary-foreground/25 pt-3">
                      <div className="text-2xl font-bold">{value}</div><div className="mt-1 text-xs text-primary-foreground/65">{label}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="courses" className="mx-auto w-full max-w-6xl px-4 py-16">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-primary">{t("nav.courses")}</p>
            <h2 className="mt-2 text-3xl font-bold">{t("landing.coursesTitle")}</h2>
            <p className="mt-3 text-muted-foreground">{t("landing.coursesSubtitle")}</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {courses.map((course) => {
              const Icon = icons[course.icon as keyof typeof icons] ?? Sparkles;
              return (
                <article key={course.id} className="rounded-lg border bg-card p-6 shadow-soft transition-transform hover:-translate-y-1">
                  <div className="grid size-11 place-items-center rounded-md bg-accent text-accent-foreground"><Icon className="size-5" /></div>
                  <h3 className="mt-5 text-xl font-semibold">{localized(lang, course.titleOm, course.titleEn)}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{localized(lang, course.descOm, course.descEn)}</p>
                  <div className="mt-5 flex items-center justify-between border-t pt-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5"><Clock3 className="size-4" /> {course.lessons ?? 0} lessons</span>
                    <span className="capitalize">{course.level}</span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-y bg-muted/40">
          <div className="mx-auto grid w-full max-w-6xl gap-8 px-4 py-14 md:grid-cols-3">
            {[
              [CheckCircle2, t("landing.why1Title"), t("landing.why1Body")],
              [Clock3, t("landing.why2Title"), t("landing.why2Body")],
              [WifiOff, t("landing.why4Title"), t("landing.why4Body")],
            ].map(([Icon, title, body]) => {
              const FeatureIcon = Icon as typeof CheckCircle2;
              return <div key={String(title)}><FeatureIcon className="size-6 text-primary" /><h3 className="mt-4 font-semibold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{String(body)}</p></div>;
            })}
          </div>
        </section>
      </main>
      <footer className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 Oromia Academy</span><span>{t("landing.footerNote")}</span>
      </footer>
    </div>
  );
}
