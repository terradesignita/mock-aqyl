import { HelpHint } from "@/components/HelpHint";
import { ArrowRight, History, Search, Sparkles, X } from "lucide-react";
import type { ScopeFilter } from "@/lib/search";
import { Button } from "@/components/ui/button";
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
}: SearchPanelProps) {
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


          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onSubmit();
            }}
            placeholder={
              advisor
                ? "Опишите бизнес-ситуацию или решение, которое нужно принять — советник разберётся и предложит рекомендацию"
                : "Спросите BI AQYL: найдите материалы, кейсы и презентации"
            }
            className="h-11 w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
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
          <p className="flex items-center gap-1.5 pb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
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
          <ul className="space-y-1">
            {history.map((h) => (
              <li key={h}>
                <button
                  onClick={() => onQueryChange(h)}
                  className="grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-2 rounded-xl px-2 py-1.5 text-left text-sm text-card-foreground transition-colors hover:bg-secondary"
                >
                  <Search className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 truncate">{h}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!advisor && (
        <>
          <div className="mt-3 flex w-fit items-center gap-1 rounded-2xl border border-border bg-card p-1 shadow-soft">
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
        </>
      )}


    </section>
  );
}
