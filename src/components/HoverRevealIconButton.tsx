import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface HoverRevealIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Text color on hover/focus — "destructive" for delete-type actions. */
  tone?: "default" | "destructive";
}

/** Small icon-only button that's invisible until the ancestor `.group` is hovered/focused
 *  (or the button itself gets keyboard focus or a tap) — the shared shape behind every
 *  "reveal on card hover" action button (delete, more-actions, ...). */
export const HoverRevealIconButton = forwardRef<HTMLButtonElement, HoverRevealIconButtonProps>(
  ({ className, tone = "default", type = "button", ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={cn(
        "grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground opacity-0 transition-opacity active:scale-[0.96] hover:bg-secondary focus-visible:opacity-100 group-hover:opacity-100 group-focus-within:opacity-100 active:opacity-100 data-[state=open]:opacity-100",
        tone === "destructive" && "hover:text-destructive focus-visible:text-destructive",
        className,
      )}
      {...props}
    />
  ),
);
HoverRevealIconButton.displayName = "HoverRevealIconButton";
