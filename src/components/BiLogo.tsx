import { cn } from "@/lib/utils";

interface BiLogoProps {
  className?: string;
  /** Height of the mark in px */
  size?: number;
  /** Inverted rendering for dark surfaces */
  inverted?: boolean;
  /** Show the AQYL wordmark next to the mark */
  withWordmark?: boolean;
}

/**
 * BI AQYL lockup: blue squircle "BI" mark + "AQYL" wordmark in brand blue.
 */
export function BiLogo({ className, size = 34, inverted = false, withWordmark = true }: BiLogoProps) {
  return (
    <span className={cn("inline-flex select-none items-center gap-2", className)} aria-label="BI AQYL">
      <BiMark size={size} />
      {withWordmark && (
        <span
          className={cn(
            "font-extrabold leading-none tracking-tight",
            inverted ? "text-primary-foreground" : "text-primary",
          )}
          style={{ fontSize: size * 0.82, letterSpacing: "-0.03em" }}
        >
          AQYL
        </span>
      )}
    </span>
  );
}

/** Square brand mark used for avatars / favicons / compact spots. */
export function BiMark({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-xl bg-primary font-extrabold text-primary-foreground",
        className,
      )}
      style={{ height: size, width: size, fontSize: size * 0.46, letterSpacing: "-0.04em" }}
      aria-hidden
    >
      BI
    </span>
  );
}
