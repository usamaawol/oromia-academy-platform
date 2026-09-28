import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed [&_svg]:pointer-events-none [&_svg]:shrink-0 transition-all duration-180 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.975]",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[color-mix(in_oklab,var(--color-primary)_96%,white_6%)] to-[color:var(--color-primary)] text-primary-foreground shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_1px_2px_color-mix(in_oklab,var(--color-primary)_18%,transparent),0_6px_20px_-6px_color-mix(in_oklab,var(--color-primary)_32%,transparent)] hover:from-[color-mix(in_oklab,var(--color-primary)_90%,white_10%)] hover:to-[color:var(--color-primary)] hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_2px_4px_color-mix(in_oklab,var(--color-primary)_22%,transparent),0_10px_28px_-8px_color-mix(in_oklab,var(--color-primary)_40%,transparent)] dark:from-[color-mix(in_oklab,var(--color-primary)_92%,black_8%)] dark:to-[color:var(--color-primary)]",
        destructive:
          "bg-gradient-to-b from-[color-mix(in_oklab,var(--color-destructive)_92%,white_8%)] to-[color:var(--color-destructive)] text-destructive-foreground shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_1px_2px_color-mix(in_oklab,var(--color-destructive)_16%,transparent),0_6px_20px_-6px_color-mix(in_oklab,var(--color-destructive)_28%,transparent)] hover:brightness-105",
        outline:
          "border border-border/80 bg-background/60 backdrop-blur-sm text-foreground shadow-xs hover:bg-accent hover:text-accent-foreground hover:border-border active:bg-accent/80",
        secondary:
          "bg-secondary/80 text-secondary-foreground shadow-xs border border-transparent hover:bg-secondary hover:border-border/60",
        ghost:
          "text-foreground/80 hover:bg-accent/70 hover:text-accent-foreground",
        link:
          "text-primary underline-offset-4 hover:underline bg-transparent shadow-none hover:bg-transparent",
      },
      size: {
        default: "h-9 px-4 py-2 [&_svg]:size-4",
        sm: "h-8 rounded-lg px-3 text-xs [&_svg]:size-3.5",
        lg: "h-10 rounded-lg px-6 [&_svg]:size-4",
        icon: "h-9 w-9 rounded-lg [&_svg]:size-4",
        "icon-sm": "h-8 w-8 rounded-lg [&_svg]:size-3.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
