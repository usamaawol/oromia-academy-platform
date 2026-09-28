/**
 * Admin layout — premium collapsible sidebar + staff-only guard.
 */
import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Award,
  BarChart3,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  GraduationCap,
  History,
  KeyRound,
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
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { adminListPendingStudents } from "@/lib/server-fns";
import { useServerFn } from "@/hooks/use-server-fn";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

const NAV_ITEMS = [
  { to: "/admin/students",         label: "admin.students",        icon: Users,         badgeKey: "pending" },
  { to: "/admin/activation-codes", label: "admin.activationCodes", icon: KeyRound },
  { to: "/admin/rankings",         label: "common.rankings",        icon: Trophy },
  { to: "/admin/courses",          label: "admin.courses",          icon: BookOpen },
  { to: "/admin/questions",        label: "admin.questions",        icon: ClipboardList },
  { to: "/admin/exams",            label: "admin.exams",            icon: GraduationCap },
  { to: "/admin/results",          label: "admin.grading",          icon: Award },
  { to: "/admin/analytics",        label: "admin.analytics",        icon: BarChart3 },
  { to: "/admin/audit",            label: "admin.audit",            icon: History },
  { to: "/admin/settings",         label: "common.settings",        icon: Settings },
] as const;

const ROLE_LABEL: Record<string, string> = {
  admin: "Administrator",
  instructor: "Instructor",
  student: "Student",
};

const ROLE_DOT: Record<string, string> = {
  admin:      "bg-primary",
  instructor: "bg-blue-400",
  student:    "bg-muted-foreground",
};

/* ─────────────────────────────────────────
   Sidebar nav item — premium edition
───────────────────────────────────────── */
function NavItem({
  to,
  label,
  icon: Icon,
  active,
  collapsed,
  badge,
  onClick,
}: {
  to: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  collapsed: boolean;
  badge?: number;
  onClick?: (() => void) | undefined;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={cn(
        "sidebar-nav-item relative flex items-center group",
        "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
        collapsed ? "justify-center px-0 py-2 mx-auto w-11" : "gap-3 px-2.5 py-2",
        collapsed ? "rounded-xl" : "rounded-xl",
        active
          ? "text-sidebar-primary"
          : "text-sidebar-foreground/70 hover:text-sidebar-accent-foreground",
      )}
      style={{ minHeight: 42 }}
    >
      {/* Active indicator — premium subtle pill + accent */}
      {active && (
        <>
          {/* Background subtle highlight */}
          <span
            className={cn(
              "absolute inset-0 rounded-xl",
              "bg-primary/[0.10] dark:bg-primary/[0.14]",
              "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset]",
            )}
          />
          {/* Left accent bar */}
          <span
            className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-[3px] rounded-r-full bg-primary animate-indicator-glow"
            style={{ left: collapsed ? "4px" : "0" }}
          />
        </>
      )}
      {/* Hover background */}
      {!active && (
        <span
          className={cn(
            "absolute inset-0 rounded-xl",
            "bg-sidebar-accent opacity-0 group-hover:opacity-100",
            "transition-opacity duration-200 ease-out",
          )}
        />
      )}

      {/* Icon container */}
      <span
        className={cn(
          "relative z-10 flex shrink-0 items-center justify-center rounded-lg",
          "transition-all duration-200 ease-out",
          collapsed ? "size-9" : "size-8",
          active
            ? "bg-primary/[0.18] text-primary dark:bg-primary/[0.24]"
            : "bg-transparent text-current group-hover:bg-sidebar-accent-foreground/6",
        )}
      >
        <Icon
          className={cn(
            "shrink-0 transition-transform duration-150 ease-out group-hover:scale-[1.06]",
            collapsed ? "size-[18px]" : "size-[17px]",
          )}
          strokeWidth={active ? 2.1 : 1.8}
        />
        {/* Badge on icon when collapsed */}
        {collapsed && badge && badge > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground shadow-sm">
            {badge > 9 ? "9+" : badge}
          </span>
        )}
      </span>

      {/* Label + badge — only when expanded */}
      {!collapsed && (
        <>
          <span className={cn(
            "relative z-10 flex-1 truncate text-[13px] transition-all duration-150 leading-tight",
            active
              ? "font-semibold text-sidebar-primary tracking-tight"
              : "font-medium tracking-[-0.005em]",
          )}>
            {label}
          </span>
          {badge && badge > 0 && (
            <span className={cn(
              "relative z-10 flex h-[20px] min-w-[20px] items-center justify-center rounded-full px-[7px] text-[10px] font-bold tracking-tight",
              active
                ? "bg-primary/20 text-primary"
                : "bg-destructive/95 text-destructive-foreground shadow-sm",
            )}>
              {badge > 99 ? "99+" : badge}
            </span>
          )}
        </>
      )}

      {/* Tooltip when collapsed */}
      {collapsed && (
        <span className="sidebar-tooltip">{label}</span>
      )}
    </Link>
  );
}

/* ─────────────────────────────────────────
   Main layout
───────────────────────────────────────── */
function AdminLayout() {
  const { t } = useI18n();
  const { user, profile, loading, isStaff, logout } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const { theme, setTheme } = useTheme();
  const call = useServerFn();

  // Desktop sidebar collapse
  const [collapsed, setCollapsed] = useState(false);
  // Mobile drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    // ── CRITICAL: never redirect while Firebase/auth init is still loading.
    if (loading) return;

    // No user → log in page.
    if (!user) {
      void navigate({ to: "/auth", replace: true });
      return;
    }
    // Authenticated user but not staff → student portal.
    if (!isStaff) {
      void navigate({ to: "/dashboard", replace: true });
      return;
    }
  }, [user, loading, isStaff, navigate]);

  useEffect(() => {
    if (!user || !isStaff) return;
    void call(adminListPendingStudents, undefined)
      .then((s) =>
        setPendingCount(
          (s as { activationStatus?: string }[]).filter(
            (u) => (u.activationStatus ?? "pending") === "pending",
          ).length,
        ),
      )
      .catch(() => undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isStaff]);

  // Close drawer on route change
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-5">
          <div className="relative grid size-14 place-items-center rounded-2xl bg-primary/10 shadow-glow">
            <img src="/favicon.ico" alt="Logo" className="size-8 object-contain animate-pulse" />
          </div>
          <div className="h-1 w-28 overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 animate-[slide_1.1s_ease-in-out_infinite] rounded-full bg-primary" />
          </div>
        </div>
      </div>
    );
  }

  if (!user || !isStaff) return null;

  const initials = (profile?.fullName ?? "A").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();

  /* Sidebar content (shared between desktop + mobile drawer) */
  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">

      {/* ── Logo area — premium ── */}
      <div className={cn(
        "flex h-16 shrink-0 items-center border-b border-sidebar-border/80",
        collapsed && !isMobile ? "justify-center px-0" : "gap-3 px-4 sm:px-5",
        "bg-gradient-to-b from-sidebar to-sidebar/95",
      )}>
        <div className="relative shrink-0">
          <div
            className={cn(
              "grid place-items-center rounded-xl bg-gradient-to-br from-primary/[0.18] via-primary/[0.10] to-transparent transition-all duration-200",
              collapsed && !isMobile ? "size-10" : "size-10",
              "ring-1 ring-primary/20 dark:ring-primary/25",
            )}
          >
            <img
              src="/favicon.ico"
              alt="Oromia Academy"
              className={cn(
                "rounded-lg object-contain transition-all duration-200",
                collapsed && !isMobile ? "size-7" : "size-7",
              )}
            />
          </div>
          {/* Status indicator dot */}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full bg-primary ring-2 ring-sidebar animate-indicator-glow"
          />
        </div>

        {(!collapsed || isMobile) && (
          <div className="min-w-0 flex-1 animate-fade-in">
            <p className="truncate text-[15px] font-bold leading-tight tracking-[-0.02em] text-sidebar-foreground">
              Oromia Academy
            </p>
            <div className="mt-0.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-1">
                <Zap className="size-[11px] shrink-0 text-primary" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.06em] text-primary/80">
                  Admin
                </span>
              </span>
              <span className="text-[10px] font-medium text-sidebar-foreground/40">
                · Technology & Digital Learning
              </span>
            </div>
          </div>
        )}

        {/* Mobile close */}
        {isMobile && (
          <button
            onClick={() => setDrawerOpen(false)}
            className="ml-auto rounded-lg p-2 text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-all duration-150"
          >
            <X className="size-4.5" />
          </button>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn(
        "flex-1 overflow-y-auto py-4",
        collapsed && !isMobile ? "px-1.5" : "px-2.5 sm:px-3",
        "scrollbar-thin",
      )}>
        {(!collapsed || isMobile) && (
          <div className="mb-3 flex items-center gap-2 px-3">
            <span className="h-px flex-1 bg-sidebar-border/60" />
            <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-sidebar-foreground/35">
              Navigation
            </p>
            <span className="h-px flex-1 bg-sidebar-border/60" />
          </div>
        )}

        <div className={cn(
          "space-y-0.5",
          (!collapsed || isMobile) ? "space-y-1" : "space-y-1",
        )}>
          {NAV_ITEMS.map(({ to, label, icon: Icon, ...rest }) => {
            const active = pathname === to || pathname.startsWith(to + "/");
            const badge = "badgeKey" in rest && rest.badgeKey === "pending" ? pendingCount : 0;
            return (
              <div key={to} className="animate-fade-in-up" style={{ animationDelay: `${0.03}s` }}>
                <NavItem
                  to={to}
                  label={t(label)}
                  icon={Icon}
                  active={active}
                  collapsed={collapsed && !isMobile}
                  badge={badge}
                  onClick={isMobile ? () => setDrawerOpen(false) : undefined}
                />
              </div>
            );
          })}
        </div>
      </nav>

      {/* ── Bottom section — premium ── */}
      <div className={cn(
        "shrink-0 border-t border-sidebar-border/80 pb-3.5 pt-3 space-y-1.5",
        "bg-gradient-to-t from-sidebar to-transparent",
        collapsed && !isMobile ? "px-1.5" : "px-2.5 sm:px-3",
      )}>

        {/* Theme toggle */}
        {collapsed && !isMobile ? (
          <div className="relative group">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "flex w-full items-center justify-center rounded-xl py-2.5",
                "text-sidebar-foreground/55 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                "transition-all duration-200 ease-out",
                "hover:scale-[1.02]",
              )}
              style={{ minHeight: 42 }}
            >
              <div className="grid size-9 place-items-center rounded-lg bg-sidebar-accent/50 group-hover:bg-sidebar-accent">
                {theme === "dark"
                  ? <Sun className="size-4" />
                  : <Moon className="size-4" />}
              </div>
            </button>
            <span className="sidebar-tooltip">{theme === "dark" ? "Light mode" : "Dark mode"}</span>
          </div>
        ) : (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-2.5",
              "text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              "transition-all duration-200 ease-out",
            )}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-sidebar-accent/60 group-hover:bg-sidebar-accent">
              {theme === "dark"
                ? <Sun className="size-4" />
                : <Moon className="size-4" />}
            </div>
            <div className="flex-1 text-left">
              <p className="text-[12.5px] font-medium leading-tight">
                {theme === "dark" ? "Light mode" : "Dark mode"}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 mt-0.5">
                {theme === "dark" ? "Switch to bright interface" : "Switch to dark interface"}
              </p>
            </div>
          </button>
        )}

        {/* Profile card */}
        {collapsed && !isMobile ? (
          <div className="relative group">
            <div className="flex items-center justify-center py-1.5">
              <div
                className={cn(
                  "relative grid size-10 shrink-0 place-items-center rounded-xl",
                  "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5",
                  "text-[13px] font-bold text-primary ring-1 ring-primary/30",
                  "transition-transform duration-150 group-hover:scale-[1.04]",
                )}
              >
                {initials}
                <span className={cn(
                  "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-sidebar",
                  ROLE_DOT[profile?.role ?? "admin"] ?? "bg-primary",
                )} />
              </div>
            </div>
            <span className="sidebar-tooltip">{profile?.fullName}</span>
          </div>
        ) : (
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3",
              "bg-sidebar-accent/40 hover:bg-sidebar-accent/70",
              "border border-sidebar-border/50",
              "transition-all duration-200 ease-out",
            )}
          >
            <div
              className={cn(
                "relative grid size-10 shrink-0 place-items-center rounded-xl",
                "bg-gradient-to-br from-primary/25 via-primary/15 to-primary/5",
                "text-[13px] font-bold text-primary ring-1 ring-primary/25",
              )}
            >
              {initials}
              <span className={cn(
                "absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full ring-2 ring-sidebar",
                ROLE_DOT[profile?.role ?? "admin"] ?? "bg-primary",
              )} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-semibold leading-tight text-sidebar-foreground tracking-tight">
                {profile?.fullName}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-[10.5px] font-medium text-sidebar-foreground/45">
                <span className="size-1.5 rounded-full bg-primary/60" />
                <span className="capitalize">
                  {ROLE_LABEL[profile?.role ?? "admin"] ?? profile?.role}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* Logout */}
        {collapsed && !isMobile ? (
          <div className="relative group">
            <button
              onClick={() => void logout()}
              className={cn(
                "flex w-full items-center justify-center rounded-xl py-2.5",
                "text-sidebar-foreground/45 hover:bg-destructive/10 hover:text-destructive",
                "transition-all duration-200 ease-out",
              )}
              style={{ minHeight: 42 }}
            >
              <div className="grid size-9 place-items-center rounded-lg bg-transparent group-hover:bg-destructive/8 transition-colors">
                <LogOut className="size-4" />
              </div>
            </button>
            <span className="sidebar-tooltip">{t("auth.logout")}</span>
          </div>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "w-full justify-start gap-3 px-3 py-2.5 h-auto",
              "text-sidebar-foreground/50 hover:text-destructive hover:bg-destructive/8",
              "transition-all duration-200 ease-out",
            )}
            onClick={() => void logout()}
          >
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-destructive/[0.06] group-hover:bg-destructive/12">
              <LogOut className="size-4 text-current" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-[12.5px] font-medium leading-tight">
                {t("auth.logout")}
              </span>
            </div>
          </Button>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">

      {/* ────────────────────────────────────────
          Mobile drawer backdrop — premium
      ──────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden",
            "bg-black/45 backdrop-blur-[3px]",
            "animate-fade-in",
          )}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ────────────────────────────────────────
          Mobile drawer — premium
      ──────────────────────────────────────── */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 sm:w-80 flex-col",
          "border-r border-sidebar-border/80 bg-sidebar",
          "shadow-elevated",
          "transition-transform duration-[280ms] ease-[cubic-bezier(0.22,1,0.36,1)]",
          drawerOpen
            ? "translate-x-0"
            : "-translate-x-full",
        )}
      >
        <SidebarContent isMobile />
      </aside>

      {/* ────────────────────────────────────────
          Desktop sidebar — premium
      ──────────────────────────────────────── */}
      <aside
        className={cn(
          "sidebar-transition hidden lg:flex flex-col shrink-0 sticky top-0 h-screen",
          "border-r border-sidebar-border/70 bg-sidebar",
          "shadow-[0_0_0_1px_color-mix(in_oklab,var(--color-sidebar-border)_40%,transparent)]",
          collapsed ? "sidebar-collapsed" : "sidebar-expanded",
        )}
      >
        <SidebarContent />
      </aside>

      {/* ────────────────────────────────────────
          Desktop collapse toggle (premium)
      ──────────────────────────────────────── */}
      <button
        className={cn(
          "lg:fixed z-30 hidden lg:grid items-center justify-center",
          "size-7 rounded-full grid place-items-center",
          "bg-card dark:bg-popover",
          "border border-border/80",
          "shadow-soft",
          "text-muted-foreground hover:text-foreground hover:border-primary/40 hover:shadow-card",
          "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          "hover:scale-[1.12] active:scale-[0.95]",
          "backdrop-blur-sm bg-background/80",
          collapsed ? "left-[58px]" : "left-[250px]",
          "top-[28px]",
        )}
        style={{
          transition:
            "left 240ms cubic-bezier(0.4,0,0.2,1), transform 150ms ease, box-shadow 200ms ease",
        }}
        onClick={() => setCollapsed((c) => !c)}
        title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed
          ? <ChevronRight className="size-[15px]" strokeWidth={2.2} />
          : <ChevronLeft className="size-[15px]" strokeWidth={2.2} />}
      </button>

      {/* ────────────────────────────────────────
          Main content area — premium responsive
      ──────────────────────────────────────── */}
      <div className="flex min-w-0 flex-1 flex-col">

        {/* ── Mobile top bar — premium ── */}
        <header
          className={cn(
            "sticky top-0 z-30 flex h-14 sm:h-16 shrink-0 items-center gap-3",
            "border-b border-border/60",
            "bg-background/80 backdrop-blur-xl",
            "px-3 sm:px-5 lg:hidden",
          )}
        >
          <Button
            variant="ghost"
            size="icon"
            className="size-10 -ml-1"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu className="size-5" strokeWidth={1.9} />
          </Button>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-primary/[0.10] ring-1 ring-primary/20">
              <img src="/favicon.ico" alt="Logo" className="size-5 rounded-md object-contain" />
            </div>
            <span className="font-semibold text-[14px] tracking-[-0.015em] truncate">
              {t("admin.title")}
            </span>
          </div>
          {/* Pending badge on mobile */}
          {pendingCount > 0 && (
            <span className="ml-auto flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 ring-1 ring-destructive/20">
              <span className="size-1.5 rounded-full bg-destructive animate-pulse-subtle" />
              <span className="text-[11px] font-bold text-destructive tabular-nums">
                {pendingCount}
              </span>
            </span>
          )}
        </header>

        {/* ── Page content — premium responsive ── */}
        <main
          className={cn(
            "flex-1 overflow-x-hidden",
            "p-4 sm:p-6 md:p-7 lg:p-8 xl:p-10",
            "animate-fade-in-up",
          )}
        >
          <div className="content-container w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
