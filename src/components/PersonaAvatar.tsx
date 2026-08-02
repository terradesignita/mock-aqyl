import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "h-6 w-6 text-[11px]",
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-xs",
  lg: "h-14 w-14 text-sm",
} as const;

export interface PersonaAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: keyof typeof SIZE_CLASS;
  /** border-2 border-card — для стека перекрывающихся аватаров. */
  ring?: boolean;
}

export function PersonaAvatar({
  initials,
  size = "md",
  ring,
  className,
  ...rest
}: PersonaAvatarProps) {
  return (
    <span
      {...rest}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-bold text-white",
        SIZE_CLASS[size],
        ring && "border-2 border-card",
        className,
      )}
    >
      {initials}
    </span>
  );
}
