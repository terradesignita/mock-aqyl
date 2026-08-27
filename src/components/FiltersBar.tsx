import { useState } from "react";
import { Bookmark, Hash, X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { TOPIC_TAGS } from "@/data/mockCards";
import type { Filters } from "@/lib/search";
import { cn } from "@/lib/utils";
import { topicDescription, topicLabel, useT } from "@/lib/i18n";

export type VisibilityFilter = "all" | "private" | "shared";

const VISIBILITY_MODES: VisibilityFilter[] = ["all", "private", "shared"];

interface FiltersBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  total: number;
  visibility: VisibilityFilter;
  onVisibilityChange: (v: VisibilityFilter) => void;
  bookmarkCount: number;
  onlyBookmarks: boolean;
  onToggleOnlyBookmarks: () => void;
}

// ponytail: 8-color cycle, not one class per tag — literal Tailwind classes so the JIT scanner picks them up
const TAG_COLORS = [
  {
    text: "text-rose-700 dark:text-rose-300",
    border: "border-rose-200 dark:border-rose-800",
    activeBorder: "border-rose-500 dark:border-rose-400",
    activeBg: "bg-rose-500/10 dark:bg-rose-400/10",
  },
  {
    text: "text-amber-700 dark:text-amber-300",
    border: "border-amber-200 dark:border-amber-800",
    activeBorder: "border-amber-500 dark:border-amber-400",
    activeBg: "bg-amber-500/10 dark:bg-amber-400/10",
  },
  {
    text: "text-emerald-700 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-800",
    activeBorder: "border-emerald-500 dark:border-emerald-400",
    activeBg: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  {
    text: "text-sky-700 dark:text-sky-300",
    border: "border-sky-200 dark:border-sky-800",
    activeBorder: "border-sky-500 dark:border-sky-400",
    activeBg: "bg-sky-500/10 dark:bg-sky-400/10",
  },
  {
    text: "text-violet-700 dark:text-violet-300",
    border: "border-violet-200 dark:border-violet-800",
    activeBorder: "border-violet-500 dark:border-violet-400",
    activeBg: "bg-violet-500/10 dark:bg-violet-400/10",
  },
  {
    text: "text-orange-700 dark:text-orange-300",
    border: "border-orange-200 dark:border-orange-800",
    activeBorder: "border-orange-500 dark:border-orange-400",
    activeBg: "bg-orange-500/10 dark:bg-orange-400/10",
  },
  {
    text: "text-teal-700 dark:text-teal-300",
    border: "border-teal-200 dark:border-teal-800",
    activeBorder: "border-teal-500 dark:border-teal-400",
    activeBg: "bg-teal-500/10 dark:bg-teal-400/10",
  },
  {
    text: "text-fuchsia-700 dark:text-fuchsia-300",
    border: "border-fuchsia-200 dark:border-fuchsia-800",
    activeBorder: "border-fuchsia-500 dark:border-fuchsia-400",
    activeBg: "bg-fuchsia-500/10 dark:bg-fuchsia-400/10",
  },
];

export function FiltersBar({
  filters,
  onChange,
  total,
  visibility,
  onVisibilityChange,
  bookmarkCount,
  onlyBookmarks,
  onToggleOnlyBookmarks,
}: FiltersBarProps) {
  const t = useT();
  const [topicsOpen, setTopicsOpen] = useState(false);

  function toggleTopic(label: string) {
    const has = filters.topics.some((t) => t.toLowerCase() === label.toLowerCase());
    onChange({
      ...filters,
      topics: has
        ? filters.topics.filter((t) => t.toLowerCase() !== label.toLowerCase())
        : [...filters.topics, label],
    });
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-3 px-4 py-4 sm:px-6">
      <div className="flex items-end justify-between">
        <h2 className="text-xl font-extrabold tracking-tight text-foreground">
          {t.dashboard.casesHeading}
        </h2>
        <span aria-live="polite" className="text-xs text-muted-foreground opacity-70">
          {t.dashboard.found(total)}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {/* Стена из 20+ тегов раньше жила прямо на экране — теперь одна кнопка,
            а выбранные темы остаются видны чипами рядом. */}
        <Popover open={topicsOpen} onOpenChange={setTopicsOpen}>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex h-9 items-center gap-1.5 rounded-2xl border px-3 text-sm font-semibold shadow-soft transition-colors active:scale-[0.96]",
                filters.topics.length > 0
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <Hash className="h-4 w-4" />
              {t.dashboard.topics}
              {filters.topics.length > 0 && (
                <span className="grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-xs font-bold text-primary-foreground">
                  {filters.topics.length}
                </span>
              )}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-[min(92vw,26rem)] p-3">
            <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto">
              {TOPIC_TAGS.map((topic, i) => {
                const active = filters.topics.some(
                  (x) => x.toLowerCase() === topic.label.toLowerCase(),
                );
                const c = TAG_COLORS[i % TAG_COLORS.length];
                return (
                  <button
                    key={topic.label}
                    onClick={() => toggleTopic(topic.label)}
                    title={topicDescription(topic.label, t)}
                    aria-pressed={active}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs transition-colors active:scale-[0.96]",
                      active
                        ? cn("font-semibold", c.activeBorder, c.activeBg, c.text)
                        : cn("bg-card", c.border, c.text, "hover:opacity-70"),
                    )}
                  >
                    #{topicLabel(topic.label, t)}
                  </button>
                );
              })}
            </div>
            {filters.topics.length > 0 && (
              <button
                onClick={() => onChange({ ...filters, topics: [] })}
                className="mt-3 w-full rounded-control border border-border py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
              >
                {t.dashboard.resetTopics(filters.topics.length)}
              </button>
            )}
          </PopoverContent>
        </Popover>

        {filters.topics.map((label) => (
          <button
            key={label}
            onClick={() => toggleTopic(label)}
            className="inline-flex items-center gap-1 rounded-full border border-primary bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary transition-colors hover:bg-primary/16"
          >
            #{topicLabel(label, t)}
            <X className="h-3 w-3" />
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <div className="flex w-fit items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
            {VISIBILITY_MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onVisibilityChange(mode)}
                aria-pressed={visibility === mode}
                className={cn(
                  "h-8 rounded-xl px-3 text-xs font-semibold transition-colors active:scale-[0.96]",
                  visibility === mode
                    ? "bg-primary text-primary-foreground shadow-brand"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {mode === "all"
                  ? t.dashboard.visibilityAll
                  : mode === "private"
                    ? t.dashboard.visibilityPrivate
                    : t.dashboard.visibilityShared}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onToggleOnlyBookmarks}
          aria-pressed={onlyBookmarks}
          className={cn(
            "flex h-10 items-center gap-1.5 rounded-2xl border px-3 text-xs font-semibold transition-colors active:scale-[0.96]",
            onlyBookmarks
              ? "border-primary bg-primary text-primary-foreground shadow-brand"
              : "border-border bg-card text-muted-foreground shadow-soft hover:bg-secondary hover:text-foreground",
          )}
        >
          <Bookmark className="h-4 w-4" fill={onlyBookmarks ? "currentColor" : "none"} />
          {t.dashboard.bookmarks}
          {bookmarkCount > 0 && (
            <span
              className={cn(
                "rounded-full px-1.5 text-xs font-bold tabular-nums",
                onlyBookmarks ? "bg-primary-foreground/20" : "bg-secondary text-foreground",
              )}
            >
              {bookmarkCount}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
