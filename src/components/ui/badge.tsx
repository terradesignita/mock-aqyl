import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/**
 * Shared shape for every status/tag pill in the app (previously hand-rolled per call site).
 * `variant` covers the common tones; for a one-off tone, use `variant="secondary"` (transparent
 * border, no bg/text opinion baked in) and override `bg-*`/`text-*` via `className` — tailwind-merge
 * resolves the conflict so your override wins.
 */
const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center gap-1 whitespace-nowrap rounded-full border text-xs font-semibold",
  {
    variants: {
      variant: {
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        primary: "border-transparent bg-primary text-primary-foreground",
        tint: "border-transparent bg-primary/12 text-primary",
        warning: "border-warning/40 bg-warning/10 text-warning",
        outline: "border-border text-foreground",
      },
      size: {
        default: "px-2.5 py-0.5",
        sm: "px-2 py-0.5",
        xs: "px-1.5 py-px text-[10px]",
        counter: "h-5 min-w-5 justify-center px-1 tabular-nums",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant, size }), className)} {...props} />;
}

export { Badge, badgeVariants };
