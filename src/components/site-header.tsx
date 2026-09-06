import { Link, useRouterState } from "@tanstack/react-router";
import { GraduationCap, Languages, LogOut, Moon, Sun, Menu } from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/components/theme";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const { t, lang, setLang } = useI18n();
  const { theme, toggle } = useTheme();
  const { user, profile, isStaff, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const links: { to: string; label: string }[] = [
    { to: "/", label: t("nav.home") },
    ...(user ? [{ to: "/dashboard", label: t("nav.dashboard") }] : []),
    ...(isStaff ? [{ to: "/admin", label: t("nav.admin") }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-glow">
            <GraduationCap className="size-5" />
          </span>
          <span className="text-base font-bold tracking-tight">{t("common.academy")}</span>
        </Link>

        <nav className="ml-4 hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === l.to && "bg-accent text-accent-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLang(lang === "om" ? "en" : "om")}
            aria-label={t("common.language")}
          >
            <Languages className="size-4" />
            <span className="ml-1 text-xs font-semibold uppercase">{lang}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("common.theme")}>
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="max-w-[10rem] truncate text-sm text-muted-foreground">
                {profile?.fullName || user.email}
              </span>
              <Button variant="outline" size="sm" onClick={() => void logout()}>
                <LogOut className="size-4" />
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Button asChild variant="ghost" size="sm">
                <Link to="/auth">{t("nav.login")}</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/auth" search={{ mode: "register" }}>
                  {t("nav.register")}
                </Link>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
          >
            <Menu className="size-4" />
          </Button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-background px-4 py-3 md:hidden">
          <div className="flex flex-col gap-1">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent"
              >
                {l.label}
              </Link>
            ))}
            {user ? (
              <Button variant="outline" size="sm" className="mt-2" onClick={() => void logout()}>
                {t("nav.logout")}
              </Button>
            ) : (
              <Button asChild size="sm" className="mt-2">
                <Link to="/auth" onClick={() => setOpen(false)}>
                  {t("nav.login")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
