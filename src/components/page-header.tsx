/**
 * Reusable premium page header component.
 * Usage:
 *   <PageHeader title="Students" subtitle="Manage student accounts." action={<Button>Add</Button>} />
 */
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  actions?: ReactNode;
  icon?: ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, action, actions, icon, className }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "relative",
        "mb-6 pb-6 border-b border-border/40",
        "animate-fade-in-up",
        className,
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={cn(
                  "hidden sm:grid shrink-0 size-11 place-items-center rounded-xl",
                  "bg-primary/[0.08] text-primary dark:bg-primary/15",
                  "border border-primary/20 dark:border-primary/25",
                )}
              >
                {icon}
              </div>
            )}
            <div className="min-w-0">
              <h1
                className={cn(
                  "text-[1.375rem] sm:text-[1.625rem] font-bold leading-[1.15]",
                  "tracking-tight text-foreground",
                  "sm:tracking-[-0.028em]",
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    "mt-1.5 text-[0.84375rem] text-muted-foreground",
                    "leading-relaxed max-w-2xl",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
        {(action || actions) && (
          <div
            className={cn(
              "flex shrink-0 items-center gap-2 flex-wrap",
              "animate-slide-in-right",
            )}
          >
            {action}
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Premium stat card for dashboard-style metrics — v2.
 */
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: {
    value: number | string;
    positive?: boolean;
  };
  accent?: "default" | "success" | "warning" | "danger" | "info";
  icon?: ReactNode;
  className?: string;
  onClick?: () => void;
}

const accentText = {
  default:  "text-foreground",
  success:  "text-success dark:text-success",
  warning:  "text-warning dark:text-warning",
  danger:   "text-destructive dark:text-destructive",
  info:     "text-info dark:text-info",
};

const accentBgSoft = {
  default:  "bg-primary/[0.08] dark:bg-primary/12",
  success:  "bg-success/[0.10] dark:bg-success/15",
  warning:  "bg-warning/[0.10] dark:bg-warning/15",
  danger:   "bg-destructive/[0.10] dark:bg-destructive/15",
  info:     "bg-info/[0.10] dark:bg-info/15",
};

const accentBorder = {
  default:  "border-primary/20 dark:border-primary/25",
  success:  "border-success/20 dark:border-success/25",
  warning:  "border-warning/20 dark:border-warning/25",
  danger:   "border-destructive/20 dark:border-destructive/25",
  info:     "border-info/20 dark:border-info/25",
};

const accentBar = {
  default:  "bg-primary",
  success:  "bg-success",
  warning:  "bg-warning",
  danger:   "bg-destructive",
  info:     "bg-info",
};

export function StatCard({
  label,
  value,
  sub,
  trend,
  accent = "default",
  icon,
  className,
  onClick,
}: StatCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative overflow-hidden rounded-xl",
        "bg-card text-card-foreground",
        "border border-border/60",
        "shadow-soft",
        "p-4 sm:p-5",
        "transition-all duration-220 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "hover:shadow-card hover:border-border/80 hover:-translate-y-0.5",
        onClick && "cursor-pointer select-none",
        className,
      )}
    >
      {/* Accent bar */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-200",
          accentBar[accent],
        )}
      />

      {/* Subtle top-right glow */}
      <div
        className={cn(
          "absolute -right-8 -top-8 size-24 rounded-full blur-2xl opacity-[0.08] transition-opacity group-hover:opacity-[0.15]",
          accentBar[accent],
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "text-[0.6875rem] font-semibold uppercase tracking-[0.08em]",
              "text-muted-foreground/80 leading-tight",
            )}
          >
            {label}
          </p>

          <p
            className={cn(
              "mt-2 text-[1.625rem] sm:text-[1.875rem]",
              "font-bold leading-none tabular-nums tracking-tight",
              accentText[accent],
            )}
          >
            {value}
          </p>

          <div className="mt-2.5 flex items-center gap-2">
            {trend && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[0.6875rem] font-semibold rounded-md px-1.5 py-0.5",
                  trend.positive
                    ? "text-success bg-success/10"
                    : "text-destructive bg-destructive/10",
                )}
              >
                <span className="text-[0.5rem]">
                  {trend.positive ? "▲" : "▼"}
                </span>
                {trend.value}
              </span>
            )}
            {sub && (
              <p className="text-[0.75rem] text-muted-foreground leading-tight">{sub}</p>
            )}
          </div>
        </div>

        {icon && (
          <div
            className={cn(
              "grid shrink-0 size-10 sm:size-11 place-items-center rounded-xl",
              accentBgSoft[accent],
              accentBorder[accent],
              "border",
              "transition-all duration-200 group-hover:scale-105",
            )}
          >
            <div className={cn("size-4 sm:size-[1.125rem]", accentText[accent])}>
              {icon}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Premium empty state — v2.
 */
interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  body?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, body, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center",
        "py-14 sm:py-20 px-6",
        "rounded-xl border border-dashed border-border/70",
        "bg-muted/20 dark:bg-muted/25",
        className,
      )}
    >
      {/* Subtle dotted backdrop */}
      <div className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06] rounded-xl pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, currentColor 1px, transparent 1px)",
          backgroundSize: "16px 16px",
        }}
      />

      <div className="relative flex flex-col items-center gap-4 text-center">
        {icon && (
          <div
            className={cn(
              "grid size-14 sm:size-16 place-items-center rounded-2xl",
              "bg-card dark:bg-background",
              "border border-border/60",
              "text-muted-foreground/60",
              "shadow-soft",
              "animate-fade-in-up",
            )}
          >
            <div className="size-7 sm:size-8">{icon}</div>
          </div>
        )}
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <p className="text-[0.9375rem] font-semibold text-foreground leading-tight">
            {title}
          </p>
          {body && (
            <p
              className={cn(
                "mt-1.5 text-[0.8125rem] text-muted-foreground max-w-sm mx-auto",
                "leading-relaxed",
              )}
            >
              {body}
            </p>
          )}
        </div>
        {action && (
          <div
            className="mt-2 animate-fade-in-up"
            style={{ animationDelay: "120ms" }}
          >
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
