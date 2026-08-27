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
import { emptyFilters, searchCards, type Filters, type ScopeFilter } from "@/lib/search";
import {
  useActivity,
  useAdvisorSessions,
  useBookmarks,
  useDismissed,
  useHistory,
  useOnboardingSeen,
  usePrivateCards,
  useScope,
  useTheme,
  useUserCards,
  type AdvisorSession,
} from "@/hooks/useAppState";
import { AdvisorFlow } from "@/components/advisor/AdvisorFlow";
import { NewCaseDialog } from "@/components/NewCaseDialog";
import { BUSINESS_UNITS } from "@/data/mockCards";
import { CURRENT_USER } from "@/data/backend";
import { OnboardingModals } from "@/components/OnboardingModals";
import { Button } from "@/components/ui/button";
import { useCards, useT } from "@/lib/i18n";

const PAGE_SIZE = 12;

/** Состояние дашборда, которое живёт в адресе: ссылку можно переслать, F5 не теряет экран. */
interface DashboardSearch {
  q?: string;
  scope?: ScopeFilter;
  advisor?: boolean;
  /** Запрос, по которому уже идёт консультация советника. */
  ask?: string;
}

const SCOPES: ScopeFilter[] = ["ALL", "INTERNAL", "EXTERNAL"];

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): DashboardSearch => {
    const scope = SCOPES.find((s) => s === search.scope);
    return {
      q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
      scope,
      advisor: search.advisor === true || search.advisor === "true" ? true : undefined,
      ask: typeof search.ask === "string" && search.ask.trim() ? search.ask : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "BI AQYL — corporate knowledge search" },
      {
        name: "description",
        content:
          "Search BI internal experience and global business cases: insight cards with links to their sources.",
      },
      { property: "og:title", content: "BI AQYL — Knowledge Discovery Platform" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const t = useT();
  const seedCards = useCards();
  // Кейсы, созданные пользователем, живут в общей сетке — сверху, как самые свежие.
  const { cards: userCards } = useUserCards();
  const cards = useMemo(() => [...userCards, ...seedCards], [userCards, seedCards]);
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  const { dark, toggle } = useTheme();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { dismissed, dismiss } = useDismissed();
  const { privateIds, toggle: togglePrivate } = usePrivateCards();
  const [onboardingSeen, setOnboardingSeen] = useOnboardingSeen();
  const [storedScope, setStoredScope] = useScope();
  // Адрес важнее сохранённого выбора: по присланной ссылке открывается именно тот режим.
  const scope = search.scope ?? storedScope;
  const setScope = (next: ScopeFilter) => {
    setStoredScope(next);
    void navigate({ search: (prev) => ({ ...prev, scope: next }), replace: true });
  };
  const { history, push, clear } = useHistory();
  const { log: logActivity } = useActivity();
  const {
    sessions: advisorSessions,
    save: saveAdvisorSession,
    remove: removeAdvisorSession,
  } = useAdvisorSessions();

  const [query, setQuery] = useState(search.q ?? search.ask ?? "");
  const [debounced, setDebounced] = useState(search.q ?? search.ask ?? "");
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [onlyBookmarks, setOnlyBookmarks] = useState(false);
  const [loading, setLoading] = useState(false);
  const [advisor, setAdvisor] = useState(search.advisor === true);
  const [advisorQuery, setAdvisorQuery] = useState<string | null>(search.ask ?? null);
  const [resumeSession, setResumeSession] = useState<AdvisorSession | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [visibility, setVisibility] = useState<VisibilityFilter>("all");
  const [page, setPage] = useState(0);
  const [onboardingClosed, setOnboardingClosed] = useState(false);
  const [newCaseOpen, setNewCaseOpen] = useState(false);
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

  // Экран → адрес. Перезагрузка и пересланная ссылка восстанавливают то же состояние.
  useEffect(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: debounced.trim() ? debounced : undefined,
        advisor: advisor ? true : undefined,
        ask: advisorQuery ?? undefined,
      }),
      replace: true,
    });
    // navigate стабилен в рамках маршрута; в зависимостях только реальное состояние экрана
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, advisor, advisorQuery]);

  useEffect(() => {
    setPage(0);
  }, [debounced, scope, filters, onlyBookmarks, visibility]);

  const results = useMemo(
    () =>
      searchCards(cards, debounced, scope, filters, onlyBookmarks ? bookmarks : null).filter(
        (c) =>
          !dismissed.includes(c.id) &&
          (visibility === "all" || (visibility === "private") === privateIds.includes(c.id)),
      ),
    [cards, debounced, scope, filters, onlyBookmarks, bookmarks, dismissed, visibility, privateIds],
  );

  // Есть ли вообще что сбрасывать — от этого зависит текст и кнопки пустого состояния.
  const hasNarrowing =
    debounced.trim().length > 0 ||
    scope !== "ALL" ||
    onlyBookmarks ||
    visibility !== "all" ||
    filters.topics.length > 0 ||
    filters.businessUnit !== "all" ||
    filters.language !== "all" ||
    filters.mediaType !== "all";

  const resetNarrowing = () => {
    setQuery("");
    setFilters(emptyFilters);
    setOnlyBookmarks(false);
    setVisibility("all");
    setScope("ALL");
  };

  const pageCount = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const pageResults = results.slice(currentPage * PAGE_SIZE, currentPage * PAGE_SIZE + PAGE_SIZE);

  const submit = () => {
    if (!advisor) return;
    const q = query.trim();
    if (!q) return;
    setAdvisorQuery(q);
    logActivity("advisor", q);
  };

  const openSavedSession = (s: AdvisorSession) => {
    setQuery(s.query);
    setAdvisorQuery(s.query);
    setResumeSession(s);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {!onboardingSeen && !onboardingClosed && (
        <OnboardingModals
          onClose={(dontShowAgain) => {
            if (dontShowAgain) setOnboardingSeen(true);
            setOnboardingClosed(true);
          }}
        />
      )}
      <NewCaseDialog
        open={newCaseOpen}
        onOpenChange={setNewCaseOpen}
        defaultUnit={BUSINESS_UNITS[CURRENT_USER.businessUnitIndex] ?? BUSINESS_UNITS[0]}
      />

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
          onQueryChange={setQuery}
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
          onNewCase={() => setNewCaseOpen(true)}
          totalLabel={
            advisor
              ? t.dashboard.advisorIntroTitle
              : t.dashboard.materialsAndUnits(
                  results.length,
                  new Set(results.map((r) => r.business_unit)).size,
                )
          }
        />

        {advisor && (
          <div className="mx-auto max-w-[1600px] px-4 pt-4 pb-6 sm:px-6">
            {advisorQuery ? (
              <AdvisorFlow
                key={advisorQuery}
                query={advisorQuery}
                initialSession={resumeSession?.query === advisorQuery ? resumeSession : undefined}
                onSave={saveAdvisorSession}
                onReset={() => {
                  setAdvisorQuery(null);
                  setQuery("");
                  setResumeSession(null);
                }}
              />
            ) : !hintDismissed ? (
              <div className="relative rounded-card border border-dashed border-primary/25 bg-primary/[0.03] p-6 text-center sm:p-8">
                <button
                  onClick={() => setHintDismissed(true)}
                  aria-label={t.dashboard.closeHint}
                  className="absolute right-3 top-3 -m-1 rounded-full p-1 text-muted-foreground transition-colors active:scale-[0.96] hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
                <span className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/12">
                  <Sparkles className="h-5 w-5 text-primary" />
                </span>
                <p className="mt-3 text-base font-bold text-foreground">
                  {t.viewerExtra.advisorPromptTitle}
                </p>
                <p className="mx-auto mt-1.5 max-w-xl text-sm leading-relaxed text-muted-foreground">
                  {t.dashboard.advisorIntroBody}
                </p>
                {advisorSessions.length > 0 && (
                  <div className="mx-auto mt-5 max-w-xl text-left">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {t.viewerExtra.savedSessions}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {advisorSessions.map((s) => (
                        <li
                          key={s.id}
                          className="flex items-center gap-2 rounded-control border border-border bg-card px-3 py-2"
                        >
                          <button
                            onClick={() => openSavedSession(s)}
                            className="min-w-0 flex-1 truncate text-left text-xs text-card-foreground hover:text-primary"
                          >
                            {s.title}
                            <span className="ml-2 text-muted-foreground/60">{s.date}</span>
                          </button>
                          <button
                            onClick={() => removeAdvisorSession(s.id)}
                            aria-label={t.dashboard.deleteSession}
                            className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <p className="mt-5 text-xs font-semibold text-muted-foreground">
                  {t.dashboard.advisorExamplesTitle}
                </p>
                <div className="mt-2 flex flex-wrap justify-center gap-2">
                  {t.advisorText.examples.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        setQuery(e);
                        setAdvisorQuery(e);
                        logActivity("advisor", e);
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
                {Array.from({ length: pageResults.length || 6 }).map((_, i) => (
                  <CardSkeleton key={i} />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border px-4 py-20 text-center">
                <SearchX className="h-8 w-8 text-muted-foreground" />
                <p className="mt-4 text-sm font-semibold text-foreground">
                  {hasNarrowing ? t.dashboard.emptyNarrowedTitle : t.dashboard.emptyTitle}
                </p>
                <p className="mt-1 max-w-sm text-xs leading-relaxed text-muted-foreground">
                  {hasNarrowing ? t.dashboard.emptyNarrowedBody : t.dashboard.emptyBody}
                </p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  {hasNarrowing ? (
                    <>
                      <Button size="sm" variant="outline" onClick={resetNarrowing}>
                        {t.dashboard.resetAll}
                      </Button>
                      {debounced && (
                        <Button size="sm" variant="ghost" onClick={() => setQuery("")}>
                          {t.dashboard.clearQuery}
                        </Button>
                      )}
                    </>
                  ) : (
                    // База пуста и ничего не сужено — единственное осмысленное действие здесь
                    // это создать кейс, а не сбрасывать фильтры.
                    <Button size="sm" onClick={() => setNewCaseOpen(true)}>
                      {t.newCase.cta}
                    </Button>
                  )}
                </div>
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
                      isNew={card.isNew === true}
                    />
                  ))}
                </div>

                {pageCount > 1 && (
                  <nav
                    aria-label={t.dashboard.resultPages}
                    className="mt-6 flex flex-wrap items-center justify-center gap-1.5"
                  >
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={currentPage === 0}
                      aria-label={t.dashboard.prevPage}
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
                      aria-label={t.dashboard.nextPage}
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
