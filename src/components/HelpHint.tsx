import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  /** Текст подсказки: что делает неочевидная функция */
  text: string;
  side?: "top" | "right" | "bottom" | "left";
  className?: string;
  label?: string;
}

/** Иконка «?» с всплывающей подсказкой для неочевидных функций. */
export function HelpHint({ text, side = "top", className = "", label }: Props) {
  return (
    <TooltipProvider delayDuration={120}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.preventDefault()}
            aria-label={label ?? "Подсказка"}
            className={`inline-grid h-4 w-4 shrink-0 place-items-center rounded-full text-muted-foreground/60 outline-none transition-colors hover:text-primary focus-visible:text-primary ${className}`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-[260px] text-xs leading-relaxed">
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
