import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, BookOpen, ClipboardCheck, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";

import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useI18n, localized } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { listAttemptsForStudent, listCourses, listExams, listNotifications } from "@/lib/data";
import { isExamOpenForStudents } from "@/lib/exam-engine";
import type { AppNotification, Attempt, Course, Exam } from "@/lib/types";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Oromia Academy" },
      {
        name: "description",
        content: "View your courses, available exams and results at Oromia Academy.",
      },
      { property: "og:title", content: "Student Dashboard — Oromia Academy" },
      { property: "og:description", content: "Your Oromia Academy courses, exams and results." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { t, lang } = useI18n();
  const { profile, loading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  useEffect(() => {
    void listExams()
      .then(setExams)
      .catch(() => setExams([]));
    void listCourses()
      .then(setCourses)
      .catch(() => setCourses([]));
  }, []);

  useEffect(() => {
    if (!profile) return;
    void listAttemptsForStudent(profile.id)
      .then(setAttempts)
      .catch(() => setAttempts([]));
    void listNotifications(profile.id)
      .then(setNotifications)
      .catch(() => setNotifications([]));
  }, [profile]);

  const myCourses = profile ? courses.filter((c) => profile.enrolledCourseIds.includes(c.id)) : [];
  const openExams = exams.filter(
    (e) =>
      isExamOpenForStudents(e, Date.now()) &&
      (!profile || profile.role !== "student" || profile.enrolledCourseIds.includes(e.courseId)),
  );
  const results = attempts.filter((a) => a.status !== "in_progress");

  if (!loading && !profile) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto w-full max-w-md px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">{t("auth.loginTitle")}</h1>
          <p className="mt-2 text-muted-foreground">{t("auth.loginSubtitle")}</p>
          <Button asChild className="mt-6">
            <Link to="/auth">{t("nav.login")}</Link>
          </Button>
        </main>
      </div>
    );
  }

  const stats = [
    { icon: BookOpen, label: t("dash.myCourses"), value: myCourses.length },
    { icon: ClipboardCheck, label: t("dash.availableExams"), value: openExams.length },
    { icon: Bell, label: t("dash.notifications"), value: notifications.length },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-primary">{t("common.academy")}</p>
            <h1 className="mt-1 text-3xl font-bold">
              {t("dash.greeting")}
              {profile ? `, ${profile.fullName}` : ""}
            </h1>
          </div>
          <Button asChild variant="outline">
            <Link to="/">{t("common.back")}</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {stats.map(({ icon: Icon, label, value }) => (
            <div key={label} className="rounded-lg border bg-card p-5 shadow-soft">
              <Icon className="size-5 text-primary" />
              <div className="mt-5 text-3xl font-bold">{value}</div>
              <div className="mt-1 text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("dash.myCourses")}</h2>
          {myCourses.length === 0 ? (
            <p className="mt-3 text-muted-foreground">{t("dash.noCourses")}</p>
          ) : (
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {myCourses.map((c) => (
                <article key={c.id} className="rounded-lg border bg-card p-5">
                  <h3 className="font-semibold">{localized(lang, c.titleOm, c.titleEn)}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {localized(lang, c.descOm, c.descEn)}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("dash.availableExams")}</h2>
          {openExams.length === 0 ? (
            <p className="mt-3 text-muted-foreground">{t("dash.noExams")}</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {openExams.map((exam) => {
                const used = attempts.filter(
                  (a) => a.examId === exam.id && a.status !== "in_progress",
                ).length;
                const resumable = attempts.some(
                  (a) => a.examId === exam.id && a.status === "in_progress",
                );
                const exhausted = exam.maxAttempts > 0 && used >= exam.maxAttempts && !resumable;
                return (
                  <article
                    key={exam.id}
                    className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"
                  >
                    <div className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                      <ClipboardCheck className="size-5" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{exam.title}</h3>
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Clock3 className="size-4" />
                        {exam.durationMin} {t("common.minutes")} ·{" "}
                        {exam.poolSize > 0 ? exam.poolSize : exam.questionIds.length}{" "}
                        {t("common.questions")} · {t("dash.attemptsUsed")}: {used}
                        {exam.maxAttempts > 0 ? `/${exam.maxAttempts}` : ""}
                      </p>
                    </div>
                    <Button asChild disabled={exhausted}>
                      <Link
                        to="/exam/$examId"
                        params={{ examId: exam.id }}
                        search={{ preview: false }}
                      >
                        {resumable ? t("exam.resume") : t("dash.startExam")}
                      </Link>
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("dash.results")}</h2>
          {results.length === 0 ? (
            <p className="mt-3 text-muted-foreground">{t("dash.noResults")}</p>
          ) : (
            <div className="mt-4 grid gap-3">
              {results.map((a) => {
                const exam = exams.find((e) => e.id === a.examId);
                const visible = a.published || exam?.resultsPublished;
                return (
                  <article
                    key={a.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-5"
                  >
                    <div>
                      <h3 className="font-semibold">{a.examTitle}</h3>
                      <p className="text-sm text-muted-foreground">
                        {new Date(a.submittedAt ?? a.startedAt).toLocaleString()}
                      </p>
                    </div>
                    {visible ? (
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{a.percentage}%</span>
                        <Badge variant={a.passed ? "default" : "secondary"}>
                          {a.passed ? t("result.passed") : t("result.failed")}
                        </Badge>
                      </div>
                    ) : (
                      <Badge variant="outline">{t("result.notPublished")}</Badge>
                    )}
                  </article>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-10">
          <h2 className="text-xl font-semibold">{t("dash.notifications")}</h2>
          {notifications.length === 0 ? (
            <p className="mt-3 text-muted-foreground">{t("dash.noNotifications")}</p>
          ) : (
            <div className="mt-4 space-y-2">
              {notifications.slice(0, 10).map((n) => (
                <div key={n.id} className="rounded-lg border bg-card p-4">
                  <p className="font-medium">{localized(lang, n.titleOm, n.titleEn)}</p>
                  <p className="text-sm text-muted-foreground">
                    {localized(lang, n.bodyOm, n.bodyEn)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
