import { useState } from "react";
import { TOPIC_TAGS } from "@/data/mockCards";
import type { Filters } from "@/lib/search";
import { cn } from "@/lib/utils";

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
}

export function FiltersBar({ filters, onChange, total }: FiltersBarProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 px-4 py-4 sm:px-6">
      <div className="flex items-center justify-end">
        <span className="text-xs text-muted-foreground opacity-70">Найдено: {total}</span>
      </div>

      <div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 overflow-hidden transition-[max-height] duration-300",
            tagsExpanded ? "max-h-[999px]" : "max-h-[68px]",
          )}
        >
          <button
            onClick={() => onChange({ ...filters, topic: "all" })}
            title="Показать все материалы"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors active:scale-[0.96]",
              filters.topic === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            Все
          </button>
          {TOPIC_TAGS.map((t) => {
            const active = filters.topic.toLowerCase() === t.label.toLowerCase();
            return (
              <button
                key={t.label}
                onClick={() => onChange({ ...filters, topic: t.label })}
                title={t.description}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors active:scale-[0.96]",
                  active
                    ? "border-primary bg-primary/10 font-semibold text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                )}
              >
                #{t.label}
              </button>
            );
          })}
        </div>
        <button
          onClick={() => setTagsExpanded((v) => !v)}
          className="mt-1.5 text-xs font-medium text-primary hover:underline"
        >
          {tagsExpanded ? "Свернуть" : "Ещё"}
        </button>
      </div>
    </div>
  );
}
