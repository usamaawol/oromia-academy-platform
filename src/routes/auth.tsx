import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { GraduationCap, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n, localized } from "@/i18n";
import { authErrorKey, useAuth } from "@/lib/auth";
import { listCourses } from "@/lib/data";
import { DEPARTMENTS } from "@/lib/departments";
import type { Course } from "@/lib/types";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Seeni / Galmaa'i — Oromia Academy" },
      {
        name: "description",
        content:
          "Create your Oromia Academy account or sign in to take Afaan Oromoo technology exams.",
      },
      { property: "og:title", content: "Sign in — Oromia Academy" },
      {
        property: "og:description",
        content: "Access courses and digital examinations at Oromia Academy.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "reset";

function GoogleMark() {
  return (
    <svg viewBox="0 0 48 48" className="size-4" aria-hidden="true">
      <path
        fill="#EA4335"
        d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.6 2.4 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.2C12.4 13.4 17.7 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.6 5.9c4.4-4.1 7-10.2 7-17.6z"
      />
      <path
        fill="#FBBC05"
        d="M10.5 28.6a14.6 14.6 0 0 1 0-9.2l-7.9-6.2a24 24 0 0 0 0 21.6l7.9-6.2z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.6-5.9c-2.1 1.4-4.8 2.3-8.3 2.3-6.3 0-11.6-3.9-13.5-9.4l-7.9 6.2C6.5 42.6 14.6 48 24 48z"
      />
    </svg>
  );
}

function AuthPage() {
  const { t, lang } = useI18n();
  const { login, register, resetPassword, loginWithGoogle, user, profile, isStaff, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [courses, setCourses] = useState<Course[]>([]);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("");
  const [courseId, setCourseId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    void listCourses()
      .then(setCourses)
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loading && user) {
      const target = isStaff ? "/admin" : "/dashboard";
      void navigate({ to: target as "/admin" | "/dashboard" });
    }
  }, [user, profile, isStaff, loading, navigate]);

  function postAuthRedirect() {
    const target = isStaff ? "/admin" : "/dashboard";
    return navigate({ to: target as "/admin" | "/dashboard" });
  }

  async function google() {
    setBusy(true);
    try {
      await loginWithGoogle();
      toast.success(t("common.success"));
      await postAuthRedirect();
    } catch (err) {
      toast.error(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success(t("common.success"));
        await postAuthRedirect();
      } else if (mode === "register") {
        if (!department) {
          toast.error(t("auth.departmentRequired"));
          return;
        }
        if (password !== confirm) {
          toast.error(t("auth.passwordMismatch"));
          return;
        }
        await register({
          fullName,
          email,
          password,
          department,
          ...(phone ? { phone } : {}),
          ...(courseId ? { courseId } : {}),
        });
        toast.success(t("common.success"));
        await postAuthRedirect();
      } else {
        await resetPassword(email);
        toast.success(t("auth.resetSent"));
        setMode("login");
      }
    } catch (err) {
      toast.error(t(authErrorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="relative overflow-hidden">
        <div className="grid-glow pointer-events-none absolute inset-0 opacity-[0.35]" />
        <div className="relative mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_460px] lg:py-16">
          <section className="hidden lg:block">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground">
              <Sparkles className="size-4 text-primary" /> {t("landing.badge")}
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-tight">{t("landing.heroTitle")}</h1>
            <p className="mt-4 max-w-xl leading-7 text-muted-foreground">
              {t("landing.heroSubtitle")}
            </p>
            <ul className="mt-8 grid gap-4">
              {[
                [GraduationCap, t("landing.why1Title"), t("landing.why1Body")],
                [ShieldCheck, t("landing.why2Title"), t("landing.why2Body")],
              ].map(([Icon, title, body]) => {
                const FeatureIcon = Icon as typeof GraduationCap;
                return (
                  <li key={String(title)} className="flex gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground">
                      <FeatureIcon className="size-5" />
                    </span>
                    <span>
                      <span className="block font-semibold">{String(title)}</span>
                      <span className="block text-sm text-muted-foreground">{String(body)}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          <Card className="border-border/80 bg-card/90 shadow-glow backdrop-blur">
            <CardHeader>
              <CardTitle className="text-2xl">
                {mode === "login"
                  ? t("auth.loginTitle")
                  : mode === "register"
                    ? t("auth.registerTitle")
                    : t("auth.resetTitle")}
              </CardTitle>
              <CardDescription>
                {mode === "login"
                  ? t("auth.loginSubtitle")
                  : mode === "register"
                    ? t("auth.emailNote")
                    : t("auth.resetBody")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {mode !== "reset" && (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full gap-2"
                    disabled={busy}
                    onClick={() => void google()}
                  >
                    <GoogleMark />
                    {t("auth.google")}
                  </Button>
                  <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wide text-muted-foreground">
                    <span className="h-px flex-1 bg-border" />
                    {t("auth.or")}
                    <span className="h-px flex-1 bg-border" />
                  </div>
                </>
              )}

              <form className="flex flex-col gap-4" onSubmit={submit}>
                {mode === "register" && (
                  <div className="grid gap-2">
                    <Label htmlFor="fullName">{t("auth.fullName")}</Label>
                    <Input
                      id="fullName"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="email">{t("auth.email")}</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                {mode === "register" && (
                  <>
                    <div className="grid gap-2">
                      <Label>{t("auth.department")}</Label>
                      <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("auth.selectDepartment")} />
                        </SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (
                            <SelectItem key={d.id} value={d.id}>
                              {lang === "om" ? d.om : d.en}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="phone">
                        {t("auth.phone")}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="grid gap-2">
                      <Label>
                        {t("auth.selectCourse")}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({t("common.optional")})
                        </span>
                      </Label>
                      <Select value={courseId} onValueChange={setCourseId}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("auth.selectCourse")} />
                        </SelectTrigger>
                        <SelectContent>
                          {courses.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {localized(lang, c.titleOm, c.titleEn)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {mode !== "reset" && (
                  <div className="grid gap-2">
                    <Label htmlFor="password">{t("auth.password")}</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}

                {mode === "register" && (
                  <div className="grid gap-2">
                    <Label htmlFor="confirm">{t("auth.confirmPassword")}</Label>
                    <Input
                      id="confirm"
                      type="password"
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      required
                    />
                  </div>
                )}

                <Button type="submit" disabled={busy} className="w-full">
                  {busy
                    ? t("common.loading")
                    : mode === "login"
                      ? t("auth.login")
                      : mode === "register"
                        ? t("auth.register")
                        : t("auth.resetSend")}
                </Button>
              </form>

              <div className="mt-5 flex flex-col gap-2 text-sm text-muted-foreground">
                {mode === "login" && (
                  <>
                    <button
                      type="button"
                      className="text-left underline-offset-4 hover:underline"
                      onClick={() => setMode("reset")}
                    >
                      {t("auth.forgot")}
                    </button>
                    <button
                      type="button"
                      className="text-left font-medium text-primary underline-offset-4 hover:underline"
                      onClick={() => setMode("register")}
                    >
                      {t("auth.noAccount")}
                    </button>
                  </>
                )}
                {mode !== "login" && (
                  <button
                    type="button"
                    className="text-left underline-offset-4 hover:underline"
                    onClick={() => setMode("login")}
                  >
                    {t("auth.haveAccount")}
                  </button>
                )}
                <Link to="/" className="underline-offset-4 hover:underline">
                  {t("common.back")}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
