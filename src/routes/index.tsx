import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Sparkles, SearchX, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Header } from "@/components/Header";
import { SearchPanel } from "@/components/SearchPanel";
import { FiltersBar, type VisibilityFilter } from "@/components/FiltersBar";
import { KnowledgeCard } from "@/components/KnowledgeCard";
import { CardSkeleton } from "@/components/CardSkeleton";
import { Footer } from "@/components/Footer";
import { emptyFilters, searchCards, type Filters } from "@/lib/search";
import {
  useBookmarks,
  useDismissed,
  useHistory,
  usePrivateCards,
  useScope,
  useTheme,
} from "@/hooks/useAppState";
import { AdvisorFlow } from "@/components/advisor/AdvisorFlow";
import { ADVISOR_EXAMPLES } from "@/data/advisor";

const PAGE_SIZE = 12;


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
  const { privateIds, toggle: togglePrivate } = usePrivateCards();
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
  const [hintDismissed, setHintDismissed] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(0);
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

  useEffect(() => {
    setPage(0);
  }, [debounced, scope, filters, onlyBookmarks, visibility]);

  const results = useMemo(
    () =>
      searchCards(debounced, scope, filters, onlyBookmarks ? bookmarks : null).filter(
        (c) =>
          !dismissed.includes(c.id) &&
          (visibility === "all" ||
            (visibility === "private") === privateIds.includes(c.id)),
      ),
    [debounced, scope, filters, onlyBookmarks, bookmarks, dismissed, visibility, privateIds],
  );

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageResults = results.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const submit = () => {
    if (!advisor) return;
    const q = query.trim();
    if (q) setAdvisorQuery(q);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header
        dark={dark}
        onToggleDark={toggle}
        className={cn("transition-opacity duration-300", focusOnAdvisor && "opacity-70")}
      />

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
          advisorQueryActive={advisorQuery !== null}
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
              />
            ) : !hintDismissed ? (
              <div className="relative rounded-card border border-dashed border-primary/25 bg-primary/[0.03] p-6 text-center sm:p-8">
                <button
                  onClick={() => setHintDismissed(true)}
                  aria-label="Закрыть подсказку"
                  className="absolute right-3 top-3 -m-1 rounded-full p-1 text-muted-foreground transition-colors active:scale-[0.96] hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
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
            ) : null}
          </div>
        )}

        <div className={cn("transition-opacity duration-300", focusOnAdvisor && "opacity-70")}>
          <FiltersBar
            filters={filters}
            onChange={setFilters}
            total={results.length}
            visibility={visibility}
            onVisibilityChange={setVisibility}
            bookmarkCount={bookmarks.length}
            onlyBookmarks={onlyBookmarks}
            onToggleOnlyBookmarks={() => setOnlyBookmarks((v) => !v)}
          />

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
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {pageResults.map((card, i) => (
                  <KnowledgeCard
                    key={card.id}
                    card={card}
                    index={i}
                    bookmarked={bookmarks.includes(card.id)}
                    onToggleBookmark={toggleBookmark}
                    onDelete={dismiss}
                    isPrivate={privateIds.includes(card.id)}
                    onTogglePrivate={togglePrivate}
                  />
                ))}
              </div>

              {pageCount > 1 && (
                <nav
                  aria-label="Страницы результатов"
                  className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
                >
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    aria-label="Предыдущая страница"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors active:scale-[0.96] hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      aria-current={i === currentPage ? "page" : undefined}
                      className={cn(
                        "h-9 min-w-9 rounded-xl border px-3 text-sm font-semibold transition-colors active:scale-[0.96]",
                        i === currentPage
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary",
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                    disabled={currentPage === pageCount - 1}
                    aria-label="Следующая страница"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card text-muted-foreground transition-colors active:scale-[0.96] hover:border-primary hover:text-primary disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
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
