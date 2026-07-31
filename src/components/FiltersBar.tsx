import { useState } from "react";
import { BUSINESS_UNITS, TOPIC_TAGS } from "@/data/mockCards";
import type { Filters } from "@/lib/search";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type VisibilityFilter = "all" | "private" | "shared";

const VISIBILITY_MODES: { key: VisibilityFilter; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "private", label: "Приватные" },
  { key: "shared", label: "Общие" },
];

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
  visibility: VisibilityFilter;
  onVisibilityChange: (v: VisibilityFilter) => void;
}

// ponytail: 8-color cycle, not one class per tag — literal Tailwind classes so the JIT scanner picks them up
const TAG_COLORS = [
  { text: "text-rose-700 dark:text-rose-300", border: "border-rose-200 dark:border-rose-800", activeBorder: "border-rose-500 dark:border-rose-400", activeBg: "bg-rose-500/10 dark:bg-rose-400/10" },
  { text: "text-amber-700 dark:text-amber-300", border: "border-amber-200 dark:border-amber-800", activeBorder: "border-amber-500 dark:border-amber-400", activeBg: "bg-amber-500/10 dark:bg-amber-400/10" },
  { text: "text-emerald-700 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-800", activeBorder: "border-emerald-500 dark:border-emerald-400", activeBg: "bg-emerald-500/10 dark:bg-emerald-400/10" },
  { text: "text-sky-700 dark:text-sky-300", border: "border-sky-200 dark:border-sky-800", activeBorder: "border-sky-500 dark:border-sky-400", activeBg: "bg-sky-500/10 dark:bg-sky-400/10" },
  { text: "text-violet-700 dark:text-violet-300", border: "border-violet-200 dark:border-violet-800", activeBorder: "border-violet-500 dark:border-violet-400", activeBg: "bg-violet-500/10 dark:bg-violet-400/10" },
  { text: "text-orange-700 dark:text-orange-300", border: "border-orange-200 dark:border-orange-800", activeBorder: "border-orange-500 dark:border-orange-400", activeBg: "bg-orange-500/10 dark:bg-orange-400/10" },
  { text: "text-teal-700 dark:text-teal-300", border: "border-teal-200 dark:border-teal-800", activeBorder: "border-teal-500 dark:border-teal-400", activeBg: "bg-teal-500/10 dark:bg-teal-400/10" },
  { text: "text-fuchsia-700 dark:text-fuchsia-300", border: "border-fuchsia-200 dark:border-fuchsia-800", activeBorder: "border-fuchsia-500 dark:border-fuchsia-400", activeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-400/10" },
];

export function FiltersBar({
  filters,
  onChange,
  total,
  visibility,
  onVisibilityChange,
}: FiltersBarProps) {
  const [tagsExpanded, setTagsExpanded] = useState(false);

  function toggleTopic(label: string) {
    const has = filters.topics.some((t) => t.toLowerCase() === label.toLowerCase());
    onChange({
      ...filters,
      topics: has ? filters.topics.filter((t) => t.toLowerCase() !== label.toLowerCase()) : [...filters.topics, label],
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 px-4 py-4 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">Кейсы</h2>
        <span className="text-xs text-muted-foreground opacity-70">Найдено: {total}</span>
      </div>

      <div>
        <div
          className={cn(
            "flex flex-wrap items-center gap-2 overflow-hidden transition-[max-height] duration-300",
            tagsExpanded ? "max-h-[999px]" : "max-h-[30px]",
          )}
        >
          <button
            onClick={() => onChange({ ...filters, topics: [] })}
            title="Показать все материалы"
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-semibold transition-colors active:scale-[0.96]",
              filters.topics.length === 0
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            Все
          </button>
          {TOPIC_TAGS.map((t, i) => {
            const active = filters.topics.some((x) => x.toLowerCase() === t.label.toLowerCase());
            const c = TAG_COLORS[i % TAG_COLORS.length];
            return (
              <button
                key={t.label}
                onClick={() => toggleTopic(t.label)}
                title={t.description}
                aria-pressed={active}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs transition-colors active:scale-[0.96]",
                  active ? cn("font-semibold", c.activeBorder, c.activeBg, c.text) : cn("bg-card", c.border, c.text, "hover:opacity-70"),
                )}
              >
                #{t.label}
              </button>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center gap-3">
          <button onClick={() => setTagsExpanded((v) => !v)} className="text-xs font-medium text-primary hover:underline">
            {tagsExpanded ? "Свернуть" : "Ещё"}
          </button>
          {filters.topics.length > 0 && (
            <button
              onClick={() => onChange({ ...filters, topics: [] })}
              className="text-xs font-medium text-muted-foreground hover:text-destructive hover:underline"
            >
              Сбросить темы ({filters.topics.length})
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex w-fit items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
          {VISIBILITY_MODES.map((m) => (
            <button
              key={m.key}
              onClick={() => onVisibilityChange(m.key)}
              aria-pressed={visibility === m.key}
              className={cn(
                "h-8 rounded-xl px-3 text-xs font-semibold transition-colors active:scale-[0.96]",
                visibility === m.key
                  ? "bg-primary text-primary-foreground shadow-brand"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Select
          value={filters.businessUnit}
          onValueChange={(v) => onChange({ ...filters, businessUnit: v })}
        >
          <SelectTrigger className="h-10 w-fit min-w-[180px] rounded-2xl border-border bg-card text-xs font-semibold shadow-soft">
            <SelectValue placeholder="Все направления" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все направления</SelectItem>
            {BUSINESS_UNITS.map((b) => (
              <SelectItem key={b} value={b}>
                {b}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
