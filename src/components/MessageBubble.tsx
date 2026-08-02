// src/components/MessageBubble.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface MessageBubbleProps {
  variant: "user" | "entity";
  /** Только entity — аватар слева. */
  avatar?: ReactNode;
  /** Только entity — строка имени/роли над текстом. */
  title?: ReactNode;
  /** Только entity — например "border-l-4 border-l-emerald-700". */
  accentClassName?: string;
  /** Переопределяет фон/паддинг самой карточки (мёржится через cn/tailwind-merge). */
  bubbleClassName?: string;
  /** Переопределяет типографику текста тела (leading, whitespace и т.д.). */
  bodyClassName?: string;
  /** Цитаты/действия — остаются целиком на стороне вызывающей фичи. */
  footer?: ReactNode;
  className?: string;
  children: ReactNode;
}

export function MessageBubble({
  variant,
  avatar,
  title,
  accentClassName,
  bubbleClassName,
  bodyClassName,
  footer,
  className,
  children,
}: MessageBubbleProps) {
  if (variant === "user") {
    return (
      <div
        className={cn(
          "rounded-2xl rounded-tr-sm border border-primary/30 bg-primary/6 px-3 py-2 text-sm text-card-foreground",
          bubbleClassName,
          className,
        )}
      >
        {children}
      </div>
    );
  }

  return (
    <div className={cn("flex gap-3", className)}>
      {avatar}
      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border bg-card p-3",
          accentClassName,
          bubbleClassName,
        )}
      >
        {title && <p className="text-xs font-bold text-card-foreground">{title}</p>}
        <div
          className={cn(
            "text-sm leading-relaxed text-card-foreground",
            title && "mt-1",
            bodyClassName,
          )}
        >
          {children}
        </div>
        {footer}
      </div>
    </div>
  );
}
