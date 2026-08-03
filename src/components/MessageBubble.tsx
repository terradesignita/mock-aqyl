// src/components/MessageBubble.tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MessageBubbleBaseProps {
  /** Merges onto the base classes via cn() — doesn't fully replace them. A base `p-3` isn't evicted by only passing `pt-2`; pass a `p-*` value to override padding fully. */
  bubbleClassName?: string;
  className?: string;
  children: ReactNode;
}

interface MessageBubbleUserProps extends MessageBubbleBaseProps {
  variant: "user";
}

interface MessageBubbleEntityProps extends MessageBubbleBaseProps {
  variant: "entity";
  /** Только entity — аватар слева. */
  avatar?: ReactNode;
  /** Только entity — строка имени/роли над текстом. */
  title?: ReactNode;
  /** Только entity — например "border-l-4 border-l-emerald-700". */
  accentClassName?: string;
  /** Merges onto the base classes via cn() — doesn't fully replace them. A base `p-3` isn't evicted by only passing `pt-2`; pass a `p-*` value to override padding fully. */
  bodyClassName?: string;
  /** Цитаты/действия — остаются целиком на стороне вызывающей фичи. */
  footer?: ReactNode;
}

export type MessageBubbleProps = MessageBubbleUserProps | MessageBubbleEntityProps;

export function MessageBubble(props: MessageBubbleProps) {
  const { variant, bubbleClassName, className, children } = props;

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

  const { avatar, title, accentClassName, bodyClassName, footer } = props;

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
