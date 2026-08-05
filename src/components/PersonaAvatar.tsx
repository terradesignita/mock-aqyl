import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const SIZE_CLASS = {
  xs: "h-6 w-6",
  sm: "h-7 w-7",
  md: "h-9 w-9",
  lg: "h-14 w-14",
} as const;

export interface PersonaAvatarProps extends HTMLAttributes<HTMLSpanElement> {
  initials: string;
  size?: keyof typeof SIZE_CLASS;
  /** border-2 border-card — для стека перекрывающихся аватаров. */
  ring?: boolean;
  /** Кольцо цвета персоны — border-2 в цвете, заданном через CSS-переменные
   *  в `style` (см. personaColorVars/personaAvatarStyle в council.tsx).
   *  Отдельно от `ring` — оба применяются одновременно, если заданы оба. */
  ringClassName?: string;
}

/** Обобщённый силуэт бюста — намеренно без черт лица, пола, этничности.
 *  Персоны в этом проекте вымышленные: фото реального узнаваемого человека
 *  под чужим именем создавало бы риск того, что вымышленные высказывания
 *  свяжут с конкретным живым человеком (см. обсуждение в чате). */
export function PersonaSilhouette({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className ?? "h-[58%] w-[58%]"}
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4.2" />
      <path d="M4 20.5c0-4.7 3.6-7.5 8-7.5s8 2.8 8 7.5c0 .8-.6 1.5-1.4 1.5H5.4c-.8 0-1.4-.7-1.4-1.5Z" />
    </svg>
  );
}

export function PersonaAvatar({
  initials,
  size = "md",
  ring,
  ringClassName,
  className,
  ...rest
}: PersonaAvatarProps) {
  return (
    <span
      role="img"
      aria-label={initials}
      {...rest}
      className={cn(
        "grid shrink-0 place-items-center rounded-full text-white/90",
        SIZE_CLASS[size],
        ring && "border-2 border-card",
        ringClassName && "border-2",
        ringClassName,
        className,
      )}
    >
      <PersonaSilhouette />
    </span>
  );
}
