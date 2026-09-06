import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
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
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "register" | "reset";

function AuthPage() {
  const { t, lang } = useI18n();
  const { login, register, resetPassword, user, loading } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [courses, setCourses] = useState<Course[]>([]);
  const [busy, setBusy] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseId, setCourseId] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  useEffect(() => {
    void listCourses().then(setCourses).catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/dashboard" });
  }, [user, loading, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success(t("common.success"));
        await navigate({ to: "/dashboard" });
      } else if (mode === "register") {
        if (password !== confirm) {
          toast.error(t("auth.passwordMismatch"));
          return;
        }
        await register({
          fullName,
          email,
          password,
          ...(phone ? { phone } : {}),
          ...(courseId ? { courseId } : {}),
        });
        toast.success(t("common.success"));
        await navigate({ to: "/dashboard" });
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
      <main className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-10">
        <Card className="shadow-soft">
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
                  ? t("auth.registerSubtitle")
                  : t("auth.resetBody")}
            </CardDescription>
          </CardHeader>
          <CardContent>
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
                    <Label htmlFor="phone">
                      {t("auth.phone")}{" "}
                      <span className="text-xs text-muted-foreground">({t("common.optional")})</span>
                    </Label>
                    <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label>{t("auth.selectCourse")}</Label>
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

            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground">
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
                    className="text-left underline-offset-4 hover:underline"
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
      </main>
    </div>
  );
}
