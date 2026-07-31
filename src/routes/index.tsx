import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Sparkles, SearchX } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { SearchPanel } from "@/components/SearchPanel";
import { FiltersBar } from "@/components/FiltersBar";
import { KnowledgeCard } from "@/components/KnowledgeCard";
import { CardSkeleton } from "@/components/CardSkeleton";
import { Footer } from "@/components/Footer";
import { emptyFilters, searchCards, type Filters } from "@/lib/search";
import { useBookmarks, useDismissed, useHistory, useScope, useTheme } from "@/hooks/useAppState";
import { AdvisorFlow } from "@/components/advisor/AdvisorFlow";
import { ADVISOR_EXAMPLES } from "@/data/advisor";


export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BI AQYL — поиск по корпоративным знаниям" },
      {
        name: "description",
        content:
          "Семантический поиск по внутреннему опыту BI и мировым бизнес-кейсам: карточки инсайтов со ссылками на источники.",
      },
      { property: "og:title", content: "BI AQYL — Knowledge Discovery Platform" },
      {
        property: "og:description",
        content:
          "Два режима поиска: внутренний опыт компании и мировая библиотека кейсов. Карточки инсайтов с цитатами.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { dark, toggle } = useTheme();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { dismissed, dismiss } = useDismissed();
  const [scope, setScope] = useScope();
  const { history, push, clear } = useHistory();

  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advisor, setAdvisor] = useState(true);
  const [advisorQuery, setAdvisorQuery] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const firstRender = useRef(true);

  const focusOnAdvisor = advisor && (searchFocused || query.trim().length > 0);

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 120);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), 260);
    return () => window.clearTimeout(t);
  }, [debounced, scope, filters, onlyBookmarks]);

  useEffect(() => {
    if (debounced.trim()) push(debounced);
  }, [debounced, push]);

  const results = useMemo(
    () =>
      searchCards(debounced, scope, filters, onlyBookmarks ? bookmarks : null).filter(
        (c) => !dismissed.includes(c.id),
      ),
    [debounced, scope, filters, onlyBookmarks, bookmarks, dismissed],
  );

  const submit = () => {
    if (!advisor) return;
    const q = query.trim();
    if (q) setAdvisorQuery(q);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div className={cn("transition-opacity duration-300", focusOnAdvisor && "opacity-70")}>
        <Header
          dark={dark}
          onToggleDark={toggle}
          bookmarkCount={bookmarks.length}
          onOpenBookmarks={() => setOnlyBookmarks((v) => !v)}
        />
      </div>

      <main className="flex-1">
        <SearchPanel
          scope={scope}
          onScopeChange={setScope}
          query={query}
          onQueryChange={(q) => {
            setQuery(q);
            if (advisorQuery) setAdvisorQuery(null);
          }}
          history={history}
          onClearHistory={clear}
          advisor={advisor}
          onAdvisorChange={(v) => {
            setAdvisor(v);
            setAdvisorQuery(null);
          }}
          onSubmit={submit}
          filters={filters}
          onFiltersChange={setFilters}
          onFocusChange={setSearchFocused}
          totalLabel={
            advisor
              ? "Режим AI-советника: рекомендация по вашей ситуации со ссылками на опыт"
              : `${results.length} материалов · ${new Set(results.map((r) => r.business_unit)).size} направлений`
          }
        />

        {advisor && (
          <div className="mx-auto max-w-[1600px] px-4 pt-4 pb-6 sm:px-6">
            {advisorQuery ? (
              <AdvisorFlow
                query={advisorQuery}
                onReset={() => {
                  setAdvisorQuery(null);
                  setQuery("");
                }}
                onFollowUp={(q) => {
                  setQuery(q);
                  setAdvisorQuery(q);
                }}
              />
            ) : (
              <div className="rounded-card border border-dashed border-primary/25 bg-primary/[0.03] p-6 text-center sm:p-8">
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/12">
                  <Sparkles className="h-5 w-5 text-primary" />
                </span>
                <p className="mt-3 text-base font-bold text-foreground">
                  Опишите управленческую ситуацию обычным языком
                </p>
                <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  Советник определит тип решения, задаст 3–4 уточняющих вопроса, найдёт похожие
                  кейсы и предложит рекомендацию с рисками, условиями и источниками.
                </p>
                <p className="mt-5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Например
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {ADVISOR_EXAMPLES.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setQuery(e);
                        setAdvisorQuery(e);
                      }}
                      className="max-w-md rounded-control border border-border bg-card px-3.5 py-2 text-left text-xs leading-relaxed text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className={cn("transition-opacity duration-300", focusOnAdvisor && "opacity-70")}>
          <FiltersBar filters={filters} onChange={setFilters} total={results.length} />

          <div className="mx-auto max-w-[1600px] px-4 pb-8 sm:px-6">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-20 text-center">
              <SearchX className="h-8 w-8 text-muted-foreground" />
              <p className="mt-4 text-sm font-semibold text-foreground">
                {debounced ? "Ничего не нашлось" : "Введите вопрос, чтобы начать поиск"}
              </p>
              <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                {debounced
                  ? "Попробуйте другую формулировку или сбросьте фильтры."
                  : "Или выберите одну из популярных тем выше."}
              </p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {results.map((card, i) => (
                <KnowledgeCard
                  key={card.id}
                  card={card}
                  index={i}
                  bookmarked={bookmarks.includes(card.id)}
                  onToggleBookmark={toggleBookmark}
                  onDelete={dismiss}
                />
              ))}
            </div>
          )}
          </div>
        </div>
      </main>


      <div className={cn("transition-opacity duration-300", focusOnAdvisor && "opacity-70")}>
        <Footer />
      </div>
    </div>
  );
}
