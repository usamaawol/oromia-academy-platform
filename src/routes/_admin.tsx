/**
 * Admin layout — sidebar navigation + staff-only guard.
 */
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BookOpen,
  ClipboardList,
  GraduationCap,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Trophy,
  Users,
  X,
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
  { to: "/admin", label: "admin.overview", icon: LayoutDashboard, end: true },
  { to: "/admin/students", label: "admin.students", icon: Users },
  { to: "/admin/courses", label: "admin.courses", icon: BookOpen },
  { to: "/admin/questions", label: "admin.questions", icon: ClipboardList },
  { to: "/admin/exams", label: "admin.exams", icon: GraduationCap },
  { to: "/admin/results", label: "admin.grading", icon: Trophy },
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

  useEffect(() => {
    if (!loading && (!user || !isStaff)) {
      void navigate({ to: user ? "/dashboard" : "/auth" });
    }
  }, [user, loading, isStaff, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user || !isStaff) return null;

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-60 flex-col border-r bg-card transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <span className="grid size-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4" />
          </span>
          <span className="font-bold">{t("common.academy")}</span>
          <button
            className="ml-auto rounded p-1 hover:bg-accent lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
              const active = to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="size-4 shrink-0" />
                  {t(label)}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User */}
        <div className="border-t p-3">
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              {(profile?.fullName ?? "A")[0]?.toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{profile?.fullName}</p>
              <Badge variant="outline" className="text-xs capitalize">
                {profile?.role}
              </Badge>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-1 w-full justify-start gap-2 text-muted-foreground"
            onClick={() => void logout()}
          >
            <LogOut className="size-4" />
            {t("auth.logout")}
          </Button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar (mobile) */}
        <div className="flex h-14 items-center gap-3 border-b bg-background px-4 lg:hidden">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(true)}>
            <Menu className="size-5" />
          </Button>
          <span className="font-semibold">{t("admin.title")}</span>
        </div>

        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
