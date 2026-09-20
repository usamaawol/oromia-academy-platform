/**
 * Admin layout — sidebar navigation + staff-only guard.
 */
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Trophy,
  Users,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin/students", label: "admin.students", icon: Users },
  { to: "/admin/rankings", label: "common.rankings", icon: Trophy },
  { to: "/admin/courses", label: "admin.courses", icon: BookOpen },
  { to: "/admin/questions", label: "admin.questions", icon: ClipboardList },
  { to: "/admin/exams", label: "admin.exams", icon: GraduationCap },
  { to: "/admin/results", label: "admin.grading", icon: Award },
  { to: "/admin/analytics", label: "admin.analytics", icon: BarChart3 },
  { to: "/admin/audit", label: "admin.audit", icon: History },
  { to: "/admin/settings", label: "common.settings", icon: Settings },
] as const;

function AdminLayout() {
  const { t } = useI18n();
  const { user, profile, loading, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      void navigate({ to: user ? "/dashboard" : "/auth" });
    }
  }, [user, loading, isStaff, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="grid size-12 place-items-center rounded-2xl bg-primary/10">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="size-6 object-contain animate-pulse"
            />
          </div>
          <div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[slide_1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) return null;

  const roleColor: Record<string, string> = {
    owner: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
    admin: "bg-primary/10 text-primary",
    instructor: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border/60 bg-card transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-border/60 px-5">
          <img
            src="/favicon.ico"
            alt="Logo"
            className="size-9 shrink-0 rounded-xl object-contain shadow-glow"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-sm leading-tight">{t("common.academy")}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Zap className="size-2.5 text-primary" />
              <span className="text-xs text-muted-foreground">Admin Panel</span>
            </div>
          </div>
          <button
            className="ml-auto rounded-lg p-1.5 hover:bg-accent transition-colors lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
            Navigation
          </p>
          <div className="space-y-0.5">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <div
                    className={cn(
                      "grid size-7 shrink-0 place-items-center rounded-lg transition-colors",
                      active
                        ? "bg-primary-foreground/15"
                        : "bg-muted group-hover:bg-accent-foreground/10",
                    )}
                  >
                    <Icon className="size-3.5" />
                  </div>
                  {t(label)}
                  {active && (
                    <span className="ml-auto size-1.5 rounded-full bg-primary-foreground/70" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User + actions */}
        <div className="border-t border-border/60 p-3 space-y-1">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {theme === "dark"
              ? <Sun className="size-3.5 shrink-0" />
              : <Moon className="size-3.5 shrink-0" />}
            <span>{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </button>

          {/* Profile card */}
          <div className="flex items-center gap-3 rounded-xl bg-muted/50 px-3 py-2.5">
            <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              {(profile?.fullName ?? "A")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">{profile?.fullName}</p>
              <span
                className={cn(
                  "inline-flex items-center rounded-md px-1.5 py-0.5 text-[10px] font-medium capitalize",
                  roleColor[profile?.role ?? "admin"] ?? "bg-muted text-muted-foreground",
                )}
              >
                {profile?.role}
              </span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            onClick={() => void logout()}
          >
            <LogOut className="size-3.5" />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="flex h-14 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-sm lg:hidden sticky top-0 z-30">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img
              src="/favicon.ico"
              alt="Logo"
              className="size-7 rounded-lg object-contain"
            />
            <span className="font-semibold text-sm">{t("admin.title")}</span>
          </div>
        </div>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
