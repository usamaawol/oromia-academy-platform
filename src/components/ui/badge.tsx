import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[11px] font-semibold tracking-tight transition-all duration-160 ease-out focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-primary/25 bg-primary/[0.10] text-primary dark:border-primary/35 dark:bg-primary/15 hover:bg-primary/[0.15] dark:hover:bg-primary/20",
        secondary:
          "border-border/60 bg-secondary/70 text-secondary-foreground hover:bg-secondary",
        success:
          "border-success/25 bg-success/[0.10] text-success dark:border-success/35 dark:bg-success/15 hover:bg-success/[0.15] dark:hover:bg-success/20",
        warning:
          "border-warning/25 bg-warning/[0.10] text-warning-foreground dark:border-warning/35 dark:bg-warning/15 hover:bg-warning/[0.15]",
        danger:
          "border-destructive/25 bg-destructive/[0.10] text-destructive dark:border-destructive/35 dark:bg-destructive/15 hover:bg-destructive/[0.15] dark:hover:bg-destructive/20",
        info:
          "border-info/25 bg-info/[0.10] text-info dark:border-info/35 dark:bg-info/15 hover:bg-info/[0.15]",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-[0_1px_2px_color-mix(in_oklab,var(--color-destructive)_18%,transparent)] hover:brightness-105",
        outline:
          "text-foreground border-border/70 bg-transparent hover:bg-accent/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
