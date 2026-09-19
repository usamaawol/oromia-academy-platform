/**
 * Student dashboard — real Firebase data via server functions.
 */
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  BookOpen,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Lock,
  Trophy,
  LayoutDashboard,
  FileText,
  Award,
  User,
  Medal,
  Download,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SiteHeader } from "@/components/site-header";
import { ClaimOwnerBanner } from "@/components/claim-owner-banner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useI18n, localized } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { availableExams, myAttempts, getRankings, updateMyProfile } from "@/lib/server-fns";
import { serverErrorMessage } from "@/lib/server-error";
import { useServerFn } from "@/hooks/use-server-fn";
import { saveUserProfile } from "@/lib/db";
import type { Exam, Attempt } from "@/lib/schema";
import { listNotifications } from "@/lib/data";
import type { AppNotification } from "@/lib/types";
import { getFirebaseAuth, firebaseReady } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({
    meta: [
      { title: "Student Dashboard — Oromia Academy" },
      { name: "description", content: "Your courses, exams and results at Oromia Academy." },
    ],
  }),
  component: DashboardPage,
});

type Tab = "overview" | "exams" | "attempts" | "results" | "profile";

type RankingItem = {
  id: string;
  fullName: string;
  email: string;
  avgScore: number;
  examCount: number;
  totalScore: number;
  rank: number;
};

function DashboardPage() {
  const { t, lang } = useI18n();
  const { profile, user, changePassword } = useAuth();
  const navigate = useNavigate();
  const call = useServerFn();

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [exams, setExams] = useState<Exam[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [rankings, setRankings] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    fullName: profile?.fullName ?? "",
    nickname: (profile as (typeof profile & { nickname?: string }))?.nickname ?? "",
    department: profile?.department ?? "",
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (!user) return;
    void (async () => {
      try {
        // Wait for Firebase auth to fully hydrate (token available) before
        // issuing server calls — prevents "session expired" on fresh signup.
        if (firebaseReady) {
          const auth = getFirebaseAuth();
          if (!auth.currentUser) {
            await new Promise<void>((resolve) => {
              const unsub = onAuthStateChanged(auth, (u) => {
                if (u) { unsub(); resolve(); }
              });
              setTimeout(() => { resolve(); }, 4000); // safety timeout
            });
          }
        }

        const [e, a, n, r] = await Promise.all([
          call(availableExams, undefined),
          call(myAttempts, undefined),
          listNotifications(user.uid),
          call(getRankings, undefined),
        ]);
        setExams(e as Exam[]);
        setAttempts(a as Attempt[]);
        setNotifications(n as AppNotification[]);
        setRankings(r as RankingItem[]);
      } catch (err) {
        console.error(err);
        // Suppress session-expired toasts on first load — token may still be
        // refreshing. Only show the error if it's genuinely unexpected.
        const msg = String((err as { message?: string })?.message ?? "");
        if (!msg.includes("auth/required") && !msg.includes("session")) {
          toast.error(serverErrorMessage(err, t));
        }
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const completedAttempts = attempts.filter((a) => a.status !== "in_progress");
  const publishedResults = attempts.filter((a) => a.published);
  const myRank = rankings.find((r) => r.id === user?.uid);

  const handleSaveProfile = async () => {
    try {
      if (!profile) return;
      if (!profileForm.fullName.trim()) { toast.error("Full name is required"); return; }
      await call(updateMyProfile, {
        fullName: profileForm.fullName,
        nickname: profileForm.nickname,
        department: profileForm.department,
      });
      toast.success("Profile updated successfully");
      setEditingProfile(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!changePassword) return;
    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setChangingPassword(true);
    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      toast.success("Password changed successfully");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      const code = (err as { code?: string })?.code ?? "";
      if (code.includes("wrong-password") || code.includes("invalid-credential")) {
        toast.error("Current password is incorrect");
      } else if (code.includes("weak-password")) {
        toast.error("New password is too weak");
      } else {
        toast.error("Failed to change password");
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDownloadResult = (attempt: Attempt) => {
    const lines: string[] = [
      "======================================",
      "       OROMIA ACADEMY — EXAM RESULT   ",
      "======================================",
      "",
      `Student   : ${attempt.studentName}`,
      `Exam      : ${attempt.examTitle}`,
      `Attempt # : ${attempt.attemptNumber}`,
      `Date      : ${new Date(attempt.submittedAt ?? Date.now()).toLocaleString()}`,
      "",
      "--------------------------------------",
      "  SCORE SUMMARY",
      "--------------------------------------",
      `  Total Points : ${attempt.totalPoints}`,
      `  Your Score   : ${attempt.autoScore + attempt.manualScore}`,
      `  Percentage   : ${attempt.percentage}%`,
      `  Result       : ${attempt.passed ? "✅ PASSED" : "❌ FAILED"}`,
      "",
      "  Breakdown:",
      `  ✓ Correct    : ${attempt.correctCount}`,
      `  ✗ Wrong      : ${attempt.wrongCount}`,
      `  - Unanswered : ${attempt.unansweredCount}`,
      "",
      "--------------------------------------",
      "  Oromia Academy — oromiaacademy.com  ",
      "======================================",
    ];

    const content = lines.join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `OromiaAcademy-Result-${attempt.examTitle.replace(/\s+/g, "_")}-${attempt.id.slice(0, 8)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <div className="flex">
          <Sidebar>
            <SidebarHeader className="border-b border-sidebar-border">
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <BookOpen className="size-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">Oromia Academy</span>
                  <span className="text-xs text-muted-foreground">Student Portal</span>
                </div>
              </div>
            </SidebarHeader>
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Menu</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "overview"}
                        onClick={() => setActiveTab("overview")}
                      >
                        <LayoutDashboard />
                        <span>Overview</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "exams"}
                        onClick={() => setActiveTab("exams")}
                      >
                        <ClipboardCheck />
                        <span>Available Exams</span>
                        {exams.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {exams.length}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "attempts"}
                        onClick={() => setActiveTab("attempts")}
                      >
                        <FileText />
                        <span>My Exams</span>
                        {attempts.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {attempts.length}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "results"}
                        onClick={() => setActiveTab("results")}
                      >
                        <Award />
                        <span>My Results</span>
                        {publishedResults.length > 0 && (
                          <Badge variant="secondary" className="ml-auto">
                            {publishedResults.length}
                          </Badge>
                        )}
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={activeTab === "profile"}
                        onClick={() => setActiveTab("profile")}
                      >
                        <User />
                        <span>My Info</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
              <SidebarGroup>
                <SidebarGroupLabel>Rankings</SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-2 py-2">
                    {myRank && (
                      <div className="flex items-center gap-2 rounded-lg bg-accent p-2">
                        <Medal className="size-4 text-yellow-500" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">Your Rank</span>
                          <span className="text-lg font-bold">#{myRank.rank}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
            <SidebarFooter className="border-t border-sidebar-border">
              <div className="flex items-center gap-2 px-2 py-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-muted">
                  <User className="size-4" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-medium">{profile?.fullName}</span>
                  <span className="text-xs text-muted-foreground">{profile?.email}</span>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>
          <main className="flex-1 px-4 py-6 md:px-8 md:py-10">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">{t("common.academy")}</p>
                <h1 className="mt-1 text-3xl font-bold">
                  {t("dash.greeting")}, {profile?.fullName?.split(" ")[0] ?? ""}
                </h1>
                <p className="mt-1 text-muted-foreground">{t("dash.title")}</p>
              </div>
              <SidebarTrigger className="md:hidden" />
            </div>

            <ClaimOwnerBanner />

            {activeTab === "overview" && (
              <>
                {/* Stats */}
                <div className="grid gap-4 sm:grid-cols-4">
                  {[
                    [
                      BookOpen,
                      t("dash.myCourses"),
                      profile?.enrolledCourseIds?.length ?? 0,
                      "text-blue-500",
                    ],
                    [ClipboardCheck, t("dash.availableExams"), exams.length, "text-green-500"],
                    [Trophy, t("dash.completedExams"), completedAttempts.length, "text-yellow-500"],
                    [Bell, t("dash.notifications"), notifications.length, "text-purple-500"],
                  ].map(([Icon, label, value, color]) => {
                    const Ic = Icon as typeof BookOpen;
                    return (
                      <Card key={String(label)}>
                        <CardContent className="p-5">
                          <Ic className={`size-5 ${color as string}`} />
                          <div className="mt-4 text-3xl font-bold">
                            {loading ? "—" : String(value)}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">{String(label)}</div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Available Exams */}
                <section className="mt-10">
                  <h2 className="text-xl font-semibold">{t("dash.availableExams")}</h2>
                  <div className="mt-4 grid gap-3">
                    {loading ? (
                      Array.from({ length: 2 }).map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full rounded-lg" />
                      ))
                    ) : exams.length === 0 ? (
                      <p className="text-muted-foreground">{t("dash.noExams")}</p>
                    ) : (
                      exams.map((exam) => {
                        const prevAttempts = attempts.filter((a) => a.examId === exam.id);
                        const inProgress = prevAttempts.find((a) => a.status === "in_progress");
                        const attemptsUsed = prevAttempts.length;
                        const attemptsLeft =
                          exam.maxAttempts > 0 ? exam.maxAttempts - attemptsUsed : null;
                        const canTake = attemptsLeft === null || attemptsLeft > 0;

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
                              <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Clock3 className="size-3.5" />
                                  {exam.durationMin} {t("common.minutes")}
                                </span>
                                {exam.hasPassword && (
                                  <span className="flex items-center gap-1">
                                    <Lock className="size-3.5" /> {t("exam.password")}
                                  </span>
                                )}
                                {attemptsLeft !== null && (
                                  <span>
                                    {attemptsLeft} {t("exam.attemptsLeft")}
                                  </span>
                                )}
                              </p>
                            </div>
                            {canTake ? (
                              <Button asChild>
                                <Link to="/exam/$examId" params={{ examId: exam.id }}>
                                  {inProgress ? t("exam.resume") : t("dash.startExam")}
                                </Link>
                              </Button>
                            ) : (
                              <Badge variant="secondary">{t("exam.noAttemptsLeft")}</Badge>
                            )}
                          </article>
                        );
                      })
                    )}
                  </div>
                </section>

                {/* Results */}
                {publishedResults.length > 0 && (
                  <section className="mt-10">
                    <h2 className="text-xl font-semibold">{t("dash.results")}</h2>
                    <div className="mt-4 grid gap-3">
                      {publishedResults.map((attempt) => (
                        <article
                          key={attempt.id}
                          className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"
                        >
                          <div className="flex-1">
                            <h3 className="font-semibold">{attempt.examTitle}</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                              {attempt.percentage}% ·{" "}
                              <span
                                className={
                                  attempt.passed
                                    ? "text-green-600 dark:text-green-400"
                                    : "text-red-600 dark:text-red-400"
                                }
                              >
                                {attempt.passed ? t("result.passed") : t("result.failed")}
                              </span>
                            </p>
                          </div>
                          <Button variant="outline" asChild>
                            <Link to="/result/$attemptId" params={{ attemptId: attempt.id }}>
                              {t("dash.viewResult")}
                            </Link>
                          </Button>
                        </article>
                      ))}
                    </div>
                  </section>
                )}

                {/* Notifications */}
                {notifications.length > 0 && (
                  <section className="mt-10">
                    <h2 className="text-xl font-semibold">{t("common.notifications")}</h2>
                    <div className="mt-4 grid gap-3">
                      {notifications.map((n) => (
                        <div key={n.id} className="rounded-lg border bg-card p-4">
                          <p className="font-medium">{lang === "om" ? n.titleOm : n.titleEn}</p>
                          {(lang === "om" ? n.bodyOm : n.bodyEn) && (
                            <p className="mt-1 text-sm text-muted-foreground">
                              {lang === "om" ? n.bodyOm : n.bodyEn}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </>
            )}

            {activeTab === "exams" && (
              <section>
                <h2 className="text-xl font-semibold">Available Exams</h2>
                <div className="mt-4 grid gap-3">
                  {loading ? (
                    <Skeleton className="h-24 w-full rounded-lg" />
                  ) : exams.length === 0 ? (
                    <p className="text-muted-foreground">{t("dash.noExams")}</p>
                  ) : (
                    exams.map((exam) => (
                      <article
                        key={exam.id}
                        className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"
                      >
                        <div className="grid size-10 shrink-0 place-items-center rounded-md bg-accent text-accent-foreground">
                          <ClipboardCheck className="size-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{exam.title}</h3>
                          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock3 className="size-3.5" />
                              {exam.durationMin} {t("common.minutes")}
                            </span>
                          </p>
                        </div>
                        <Button asChild>
                          <Link to="/exam/$examId" params={{ examId: exam.id }}>
                            {t("dash.startExam")}
                          </Link>
                        </Button>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "attempts" && (
              <section>
                <h2 className="text-xl font-semibold">My Exam Attempts</h2>
                <div className="mt-4 grid gap-3">
                  {loading ? (
                    <Skeleton className="h-24 w-full rounded-lg" />
                  ) : attempts.length === 0 ? (
                    <p className="text-muted-foreground">No exam attempts yet.</p>
                  ) : (
                    attempts.map((attempt) => (
                      <article
                        key={attempt.id}
                        className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{attempt.examTitle}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Status: {attempt.status} · Attempt #{attempt.attemptNumber}
                          </p>
                        </div>
                        <Badge variant={attempt.status === "in_progress" ? "default" : "secondary"}>
                          {attempt.status}
                        </Badge>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "results" && (
              <section>
                <h2 className="text-xl font-semibold">My Results</h2>
                <div className="mt-4 grid gap-3">
                  {loading ? (
                    <Skeleton className="h-24 w-full rounded-lg" />
                  ) : publishedResults.length === 0 ? (
                    <p className="text-muted-foreground">No published results yet.</p>
                  ) : (
                    publishedResults.map((attempt) => (
                      <article
                        key={attempt.id}
                        className="flex flex-col gap-4 rounded-lg border bg-card p-5 sm:flex-row sm:items-center"
                      >
                        <div className="flex-1">
                          <h3 className="font-semibold">{attempt.examTitle}</h3>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {attempt.percentage}% ·{" "}
                            <span
                              className={
                                attempt.passed
                                  ? "text-green-600 dark:text-green-400"
                                  : "text-red-600 dark:text-red-400"
                              }
                            >
                              {attempt.passed ? t("result.passed") : t("result.failed")}
                            </span>
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" onClick={() => handleDownloadResult(attempt)}>
                            <Download className="mr-2 size-4" />
                            Download
                          </Button>
                          <Button variant="outline" asChild>
                            <Link to="/result/$attemptId" params={{ attemptId: attempt.id }}>
                              {t("dash.viewResult")}
                            </Link>
                          </Button>
                        </div>
                      </article>
                    ))
                  )}
                </div>
              </section>
            )}

            {activeTab === "profile" && (
              <section>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">My Info</h2>
                  {!editingProfile ? (
                    <Button
                      onClick={() => {
                        setProfileForm({
                          fullName: profile?.fullName ?? "",
                          nickname: (profile as (typeof profile & { nickname?: string }))?.nickname ?? "",
                          department: profile?.department ?? "",
                        });
                        setEditingProfile(true);
                      }}
                    >
                      Edit
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setEditingProfile(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSaveProfile}>
                        <Save className="mr-2 size-4" />
                        Save
                      </Button>
                    </div>
                  )}
                </div>

                {/* Nickname setup prompt */}
                {!(profile as (typeof profile & { nickname?: string }))?.nickname && !editingProfile && (
                  <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20 p-4 flex items-start gap-3">
                    <span className="text-lg shrink-0">🎭</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">Set your anonymous nickname</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Your nickname is shown on public exam leaderboards instead of your real name. It keeps your identity private while still showing your rank.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setProfileForm({
                          fullName: profile?.fullName ?? "",
                          nickname: "",
                          department: profile?.department ?? "",
                        });
                        setEditingProfile(true);
                      }}
                    >
                      Set nickname
                    </Button>
                  </div>
                )}

                <Card className="mt-4">
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="fullName">Full Name</Label>
                        {editingProfile ? (
                          <Input
                            id="fullName"
                            value={profileForm.fullName}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, fullName: e.target.value })
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">{profile?.fullName}</p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="nickname">
                          Anonymous Nickname{" "}
                          <span className="text-xs text-muted-foreground font-normal">(shown on leaderboards)</span>
                        </Label>
                        {editingProfile ? (
                          <Input
                            id="nickname"
                            value={profileForm.nickname}
                            placeholder="e.g. StarCoder99, TechWiz, ProLearner"
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, nickname: e.target.value })
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {(profile as (typeof profile & { nickname?: string }))?.nickname || (
                              <span className="italic text-amber-600">Not set — your rank will show as &quot;StudentXXX&quot;</span>
                            )}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="department">Department</Label>
                        {editingProfile ? (
                          <Input
                            id="department"
                            value={profileForm.department}
                            onChange={(e) =>
                              setProfileForm({ ...profileForm, department: e.target.value })
                            }
                            className="mt-1"
                          />
                        ) : (
                          <p className="mt-1 text-sm text-muted-foreground">
                            {profile?.department || "Not set"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label>Email</Label>
                        <p className="mt-1 text-sm text-muted-foreground">{profile?.email}</p>
                        <p className="text-xs text-muted-foreground/60">Email cannot be changed</p>
                      </div>
                      <div>
                        <Label>Role</Label>
                        <p className="mt-1 text-sm text-muted-foreground capitalize">
                          {profile?.role}
                        </p>
                      </div>
                      <div>
                        <Label>Enrolled Courses</Label>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {profile?.enrolledCourseIds?.length ?? 0} course(s)
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="size-4" />
                      Change Password
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="currentPassword">Current Password</Label>
                        <Input
                          id="currentPassword"
                          type="password"
                          value={passwordForm.currentPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                          }
                          className="mt-1"
                          autoComplete="current-password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          value={passwordForm.newPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                          }
                          className="mt-1"
                          autoComplete="new-password"
                        />
                      </div>
                      <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          value={passwordForm.confirmPassword}
                          onChange={(e) =>
                            setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                          }
                          className="mt-1"
                          autoComplete="new-password"
                        />
                      </div>
                      <Button
                        onClick={handleChangePassword}
                        disabled={
                          changingPassword ||
                          !passwordForm.currentPassword ||
                          !passwordForm.newPassword ||
                          !passwordForm.confirmPassword
                        }
                        className="mt-2 w-fit"
                      >
                        <Lock className="mr-2 size-4" />
                        {changingPassword ? "Changing..." : "Change Password"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
