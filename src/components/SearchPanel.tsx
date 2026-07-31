import { HelpHint } from "@/components/HelpHint";
import { ArrowRight, History, Search, SlidersHorizontal, Sparkles, X } from "lucide-react";
import type { Filters, ScopeFilter } from "@/lib/search";
import { LANGUAGES, MEDIA_LABELS, emptyFilters } from "@/lib/search";
import { BUSINESS_UNITS } from "@/data/mockCards";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SearchPanelProps {
  scope: ScopeFilter;
  onScopeChange: (s: ScopeFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  history: string[];
  onClearHistory: () => void;
  totalLabel?: string;
  advisor: boolean;
  onAdvisorChange: (v: boolean) => void;
  onSubmit: () => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onFocusChange?: (focused: boolean) => void;
}

const MODES: { key: ScopeFilter; label: string }[] = [
  { key: "ALL", label: "Все" },
  { key: "INTERNAL", label: "Внутренний опыт BI" },
  { key: "EXTERNAL", label: "Мировой опыт" },
];

export function SearchPanel({
  scope,
  onScopeChange,
  query,
  onQueryChange,
  history,
  onClearHistory,
  totalLabel,
  advisor,
  onAdvisorChange,
  onSubmit,
  filters,
  onFiltersChange,
  onFocusChange,
}: SearchPanelProps) {
  const activeFilterCount = [filters.mediaType, filters.businessUnit, filters.language].filter(
    (v) => v !== "all",
  ).length;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-2 pt-6 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px]">
          Добрый день, Марат
        </h1>
        {totalLabel && <p className="text-sm text-muted-foreground">{totalLabel}</p>}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft transition-shadow focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]">
          <div className="flex items-center gap-1.5 border-r border-border py-1 pr-3">
          <button
            type="button"
            role="switch"
            aria-checked={advisor}
            aria-label="Режим AI-советника"
            onClick={() => onAdvisorChange(!advisor)}
            className="flex items-center gap-2"
          >
            <span
              className={cn(
                "grid h-7 w-11 place-items-start rounded-full p-1 transition-colors",
                advisor ? "bg-primary" : "bg-secondary",
              )}
            >
              <span
                className={cn(
                  "grid h-5 w-5 place-items-center rounded-full transition-transform",
                  advisor
                    ? "translate-x-4 bg-primary-foreground"
                    : "translate-x-0 bg-card",
                )}
              >
                <Sparkles
                  className={cn("h-3 w-3", advisor ? "text-primary" : "text-muted-foreground")}
                />
              </span>
            </span>
            <span
              className={cn(
                "hidden text-sm font-bold sm:inline",
                advisor ? "text-primary" : "text-muted-foreground",
              )}
            >
              AI-советник
            </span>
          </button>
          <HelpHint
            side="bottom"
            text="Включите, если нужно принять решение: советник задаст уточняющие вопросы и даст рекомендацию со сценариями. Выключено — обычный поиск материалов."
          />
          </div>


          <label htmlFor="main-search-query" className="sr-only">
            {advisor ? "Опишите бизнес-ситуацию для AI-советника" : "Поиск по материалам BI AQYL"}
          </label>
          <input
            id="main-search-query"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            onFocus={() => onFocusChange?.(true)}
            onBlur={() => onFocusChange?.(false)}
            placeholder={
              advisor
                ? "Опишите бизнес-ситуацию или решение, которое нужно принять — советник разберётся и предложит рекомендацию"
                : "Спросите BI AQYL: найдите материалы, кейсы и презентации"
            }
            className="h-11 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
          />
          <span className="flex items-center gap-1">
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label="Очистить"
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors active:scale-[0.96] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onSubmit}
              aria-label="Отправить запрос"
              className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 text-primary transition-colors active:scale-[0.96] hover:bg-primary hover:text-primary-foreground group-focus-within:bg-primary group-focus-within:text-primary-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>



      {advisor && history.length > 0 && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="flex items-center gap-1.5 pb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <History className="h-3.5 w-3.5" /> Недавние вопросы
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 px-2 text-xs font-normal"
              onClick={onClearHistory}
            >
              очистить
            </Button>
          </p>
          <ul className="space-y-0.5">
            {history.map((h, i) => (
              <li key={h}>
                <button
                  onClick={() => onQueryChange(h)}
                  className={cn(
                    "grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-xl px-2 text-left transition-colors hover:bg-secondary",
                    i === 0
                      ? "py-2 text-sm font-semibold text-card-foreground"
                      : "py-1 text-xs text-muted-foreground",
                  )}
                >
                  <Search
                    className={cn(
                      "shrink-0",
                      i === 0 ? "mt-0.5 h-4 w-4 text-primary" : "mt-0.5 h-3 w-3 text-muted-foreground/60",
                    )}
                  />
                  <span className="min-w-0 truncate">{h}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!advisor && (
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex w-fit items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
            {MODES.map((m) => (
              <button
                key={m.key}
                onClick={() => onScopeChange(m.key)}
                className={cn(
                  "h-9 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.96]",
                  scope === m.key
                    ? "bg-primary text-primary-foreground shadow-brand"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-2xl border border-border bg-card p-1 shadow-soft">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className={cn(
                    "relative flex h-9 items-center gap-1.5 rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.96]",
                    activeFilterCount > 0
                      ? "text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Фильтры
                  {activeFilterCount > 0 && (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 space-y-2 p-3">
                <Select
                  value={filters.mediaType}
                  onValueChange={(v) =>
                    onFiltersChange({ ...filters, mediaType: v as Filters["mediaType"] })
                  }
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder="Тип" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все типы</SelectItem>
                    {Object.entries(MEDIA_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select
                  value={filters.businessUnit}
                  onValueChange={(v) => onFiltersChange({ ...filters, businessUnit: v })}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder="Направление" />
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

                <Select
                  value={filters.language}
                  onValueChange={(v) =>
                    onFiltersChange({ ...filters, language: v as Filters["language"] })
                  }
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder="Язык" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все языки</SelectItem>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l} value={l}>
                        {l}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() =>
                      onFiltersChange({
                        ...filters,
                        mediaType: emptyFilters.mediaType,
                        businessUnit: emptyFilters.businessUnit,
                        language: emptyFilters.language,
                      })
                    }
                  >
                    Сбросить
                  </Button>
                )}
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}


    </section>
  );
}
