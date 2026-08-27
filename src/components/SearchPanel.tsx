import { HelpHint } from "@/components/HelpHint";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  History,
  Loader2,
  Mic,
  MicOff,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import type { Filters, ScopeFilter } from "@/lib/search";
import { LANGUAGES, emptyFilters } from "@/lib/search";
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
import { useVoiceInput } from "@/lib/speech";
import { useT, type Dictionary } from "@/lib/i18n";

interface SearchPanelProps {
  scope: ScopeFilter;
  onScopeChange: (s: ScopeFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  history: string[];
  onClearHistory: () => void;
  totalLabel?: string;
  advisor: boolean;
  advisorQueryActive: boolean;
  onAdvisorChange: (v: boolean) => void;
  onSubmit: () => void;
  filters: Filters;
  onFiltersChange: (f: Filters) => void;
  onFocusChange?: (focused: boolean) => void;
}

/** Приветствие по времени суток. Считается после монтирования: часовой пояс сервера
 *  и браузера различаются, и на SSR это дало бы расхождение при гидратации. */
function useGreeting(t: Dictionary) {
  const [greeting, setGreeting] = useState(t.greeting.day);
  useEffect(() => {
    const hour = new Date().getHours();
    setGreeting(
      hour < 6
        ? t.greeting.night
        : hour < 12
          ? t.greeting.morning
          : hour < 18
            ? t.greeting.day
            : t.greeting.evening,
    );
  }, [t]);
  return greeting;
}

const MODES: ScopeFilter[] = ["ALL", "INTERNAL", "EXTERNAL"];

export function SearchPanel({
  scope,
  onScopeChange,
  query,
  onQueryChange,
  history,
  onClearHistory,
  totalLabel,
  advisor,
  advisorQueryActive,
  onAdvisorChange,
  onSubmit,
  filters,
  onFiltersChange,
  onFocusChange,
}: SearchPanelProps) {
  const activeFilterCount = [filters.businessUnit, filters.language].filter(
    (v) => v !== "all",
  ).length;

  const t = useT();
  const greeting = useGreeting(t);
  const voice = useVoiceInput({
    messages: t.voice,
    onText: onQueryChange,
    onError: (message) => toast.error(message),
    onStart: () => toast.info(t.chat.voiceStarted),
  });

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 pb-2 pt-6 sm:px-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
        <h1 className="truncate text-2xl font-extrabold tracking-tight text-foreground sm:text-[28px]">
          {greeting}, {t.profile.firstName}
        </h1>
        {totalLabel && (
          <p
            className={cn(
              "text-sm",
              advisor ? "font-semibold text-primary" : "text-muted-foreground",
            )}
          >
            {totalLabel}
          </p>
        )}
      </div>

      <div className="mt-4 grid gap-3">
        <div className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft transition-shadow focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--primary)_14%,transparent)]">
          <div className="flex items-center gap-1.5 border-r border-border py-1 pr-3">
            <button
              type="button"
              role="switch"
              aria-checked={advisor}
              aria-label={t.dashboard.advisorSwitchLabel}
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
                    advisor ? "translate-x-4 bg-primary-foreground" : "translate-x-0 bg-card",
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
                {advisor ? t.dashboard.advisorMode : t.dashboard.searchMode}
              </span>
            </button>
            <HelpHint
              side="bottom"
              text={advisor ? t.dashboard.advisorHintOn : t.dashboard.advisorHintOff}
            />
          </div>

          <label htmlFor="main-search-query" className="sr-only">
            {advisor ? t.dashboard.advisorLabel : t.dashboard.searchLabel}
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
            placeholder={advisor ? t.dashboard.advisorPlaceholder : t.dashboard.searchPlaceholder}
            className="h-11 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/70 sm:text-sm"
          />
          <span className="flex items-center gap-1">
            {query && (
              <button
                onClick={() => onQueryChange("")}
                aria-label={t.dashboard.clear}
                className="grid h-8 w-8 place-items-center rounded-full text-muted-foreground transition-colors active:scale-[0.96] hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={voice.toggle}
              disabled={voice.state === "unsupported"}
              aria-label={voice.active ? t.dashboard.voiceStop : t.dashboard.voiceInput}
              title={
                voice.state === "unsupported"
                  ? t.dashboard.voiceUnsupported
                  : voice.state === "requesting"
                    ? t.dashboard.voiceRequesting
                    : voice.active
                      ? t.dashboard.voiceStop
                      : t.dashboard.voiceInput
              }
              className={cn(
                "grid h-8 w-8 shrink-0 place-items-center rounded-full transition-colors active:scale-[0.96] disabled:opacity-40",
                voice.active
                  ? "animate-pulse text-destructive"
                  : "text-muted-foreground hover:text-primary",
              )}
            >
              {voice.state === "requesting" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : voice.active ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onSubmit}
              aria-label={t.dashboard.submit}
              className="grid h-9 w-9 place-items-center rounded-full border border-primary/40 text-primary transition-colors active:scale-[0.96] hover:bg-primary hover:text-primary-foreground group-focus-within:bg-primary group-focus-within:text-primary-foreground"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </span>
        </div>
      </div>

      {advisor && !advisorQueryActive && history.length > 0 && (
        <div className="mt-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
          <p className="flex items-center gap-1.5 pb-2 text-xs font-semibold text-muted-foreground">
            <History className="h-3.5 w-3.5" /> {t.dashboard.recentQuestions}
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 px-2 text-xs font-normal"
              onClick={onClearHistory}
            >
              {t.dashboard.clearHistory}
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
                      i === 0
                        ? "mt-0.5 h-4 w-4 text-primary"
                        : "mt-0.5 h-3 w-3 text-muted-foreground/60",
                    )}
                  />
                  <span className="min-w-0 truncate" title={h}>
                    {h}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!advisor && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex min-w-0 max-w-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-card p-1 shadow-soft">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => onScopeChange(mode)}
                className={cn(
                  "h-9 shrink-0 whitespace-nowrap rounded-xl px-3 text-sm font-semibold transition-colors active:scale-[0.96]",
                  scope === mode
                    ? "bg-primary text-primary-foreground shadow-brand"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {mode === "ALL"
                  ? t.dashboard.scopeAll
                  : mode === "INTERNAL"
                    ? t.dashboard.scopeInternal
                    : t.dashboard.scopeExternal}
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
                  {t.dashboard.filters}
                  {activeFilterCount > 0 && (
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 space-y-2 p-3">
                <Select
                  value={filters.businessUnit}
                  onValueChange={(v) => onFiltersChange({ ...filters, businessUnit: v })}
                >
                  <SelectTrigger className="h-9 w-full text-xs">
                    <SelectValue placeholder={t.dashboard.unitPlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.dashboard.allUnits}</SelectItem>
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
                    <SelectValue placeholder={t.dashboard.languagePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t.dashboard.allLanguages}</SelectItem>
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
                        businessUnit: emptyFilters.businessUnit,
                        language: emptyFilters.language,
                      })
                    }
                  >
                    {t.common.reset}
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
