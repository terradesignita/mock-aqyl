import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Bookmark, Link2, Pencil, PanelLeft, PanelRight, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SourcesPanel } from "@/components/notebook/SourcesPanel";
import { SourceReaderDialog } from "@/components/notebook/SourceReaderDialog";
import { buildNotebookSources, uploadedSource, type NotebookSource } from "@/lib/sources";
import { NotebookChat } from "@/components/notebook/NotebookChat";
import { StudioPanel } from "@/components/notebook/StudioPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getCardById, type KnowledgeCardData } from "@/data/mockCards";
import {
  useActivity,
  useBookmarks,
  useCardSources,
  useCardTitle,
  useDismissed,
  useFeedback,
  useNotes,
  useTheme,
  useUserCards,
} from "@/hooks/useAppState";
import { clampWidth, useResizablePanel } from "@/hooks/useResizablePanel";
import { cn } from "@/lib/utils";
import { useCard, useT } from "@/lib/i18n";

const PANEL_WIDTH_MIN = 220;
const PANEL_WIDTH_MAX = 520;

/** Keyboard step handler for a resize separator — Left/Right nudge, Home/End snap to bounds.
 *  `invert: true` for a separator on a panel's left edge (dragging/pressing left grows it). */
function resizeKeyDown(
  setWidth: (fn: (w: number) => number) => void,
  invert = false,
): React.KeyboardEventHandler {
  return (e) => {
    const step = e.shiftKey ? 40 : 16;
    const grow = invert ? "ArrowLeft" : "ArrowRight";
    const shrink = invert ? "ArrowRight" : "ArrowLeft";
    if (e.key === grow) {
      e.preventDefault();
      setWidth((w) => clampWidth(w + step, PANEL_WIDTH_MIN, PANEL_WIDTH_MAX));
    } else if (e.key === shrink) {
      e.preventDefault();
      setWidth((w) => clampWidth(w - step, PANEL_WIDTH_MIN, PANEL_WIDTH_MAX));
    } else if (e.key === "Home") {
      e.preventDefault();
      setWidth(() => PANEL_WIDTH_MIN);
    } else if (e.key === "End") {
      e.preventDefault();
      setWidth(() => PANEL_WIDTH_MAX);
    }
  };
}

export const Route = createFileRoute("/card/$id")({
  loader: ({ params }) => {
    // Загрузчик работает до React-контекста, поэтому берёт исходную карточку:
    // ему нужно только знать, что такая есть, и отдать метатеги.
    const card = getCardById(params.id);
    // Кейсы, созданные пользователем, лежат в localStorage — на этом этапе их не видно,
    // поэтому такой id пропускаем дальше, а разбирается он уже в компоненте.
    if (!card) {
      if (!params.id.startsWith("case_")) throw notFound();
      return { card: null };
    }
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData?.card) {
      return {
        // Кейс пользователя живёт в localStorage: до React его не видно, заголовок
        // вкладки ставит сам компонент. Поэтому здесь нейтральный, а не «не найдено».
        meta: [{ title: "BI AQYL" }, { name: "robots", content: "noindex" }],
      };
    }
    const { card } = loaderData;
    return {
      meta: [
        { title: `${card.title} — BI AQYL` },
        { name: "description", content: card.executive_summary.slice(0, 155) },
        { property: "og:title", content: card.title },
        { property: "og:description", content: card.executive_summary.slice(0, 155) },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CardWorkspace,
});

/** Кейс приходит либо из данных (загрузчик), либо из локальных, созданных пользователем. */
function CardWorkspace() {
  const t = useT();
  const { dark, toggle } = useTheme();
  const { id } = Route.useParams();
  const { card: routeCard } = Route.useLoaderData() as { card: KnowledgeCardData | null };
  const { cards: userCards, hydrated } = useUserCards();
  const card = routeCard ?? userCards.find((c) => c.id === id) ?? null;

  if (!card) {
    // До чтения localStorage не знаем, есть кейс или нет — не показываем ложное «не найдено».
    if (!hydrated) return null;
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header dark={dark} onToggleDark={toggle} />
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-xl font-bold text-foreground">{t.errors.notFoundTitle}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.errors.notFoundBody}
            </p>
            <Button asChild size="sm" className="mt-4">
              <Link to="/">{t.errors.toHome}</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <CardWorkspaceInner key={card.id} base={card} />;
}

function CardWorkspaceInner({ base }: { base: KnowledgeCardData }) {
  const t = useT();

  // Кейс, созданный пользователем, загрузчик не видел — заголовок вкладки ставим здесь.
  useEffect(() => {
    if (getCardById(base.id)) return;
    document.title = `${base.title} — BI AQYL`;
  }, [base.id, base.title]);
  // Текст карточки — в языке интерфейса; структура и id те же.
  const card = useCard(base.id) ?? base;
  const { title, rename } = useCardTitle(card.id, card.title);
  const displayCard = useMemo(() => ({ ...card, title }), [card, title]);

  const { dark, toggle } = useTheme();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { notes, add: addNote, remove: removeNote } = useNotes(card.id);
  const { record: recordFeedback } = useFeedback(card.id);
  const { log: logActivity } = useActivity();

  const baseSources = useMemo(() => buildNotebookSources(card, t), [card, t]);
  const { dismissed } = useDismissed();

  // Выбор источников, переименования, удаления и загрузки живут в хранилище —
  // иначе всё это теряется при перезагрузке страницы.
  const allBaseIds = useMemo(() => baseSources.map((s) => s.id), [baseSources]);
  const sourceState = useCardSources(card.id, allBaseIds);
  const sources = useMemo(
    () => [
      ...baseSources.filter((s) => !sourceState.removed.includes(s.id)),
      ...sourceState.uploads.map((u) => uploadedSource(u, t)),
    ],
    [baseSources, sourceState.removed, sourceState.uploads, t],
  );
  const selected = useMemo(
    () => sourceState.selected.filter((id) => sources.some((s) => s.id === id)),
    [sourceState.selected, sources],
  );

  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTitle) titleInputRef.current?.focus();
  }, [editingTitle]);

  const startEditingTitle = () => {
    setTitleDraft(title);
    setEditingTitle(true);
  };
  const commitTitle = () => {
    const next = titleDraft.trim();
    if (next) rename(next);
    setEditingTitle(false);
  };

  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(true);
  const [mobileSources, setMobileSources] = useState(false);
  const [mobileStudio, setMobileStudio] = useState(false);
  const {
    width: sourcesWidth,
    setWidth: setSourcesWidth,
    startResize: startSourcesResize,
  } = useResizablePanel(290, { min: PANEL_WIDTH_MIN, max: PANEL_WIDTH_MAX });
  const {
    width: studioWidth,
    setWidth: setStudioWidth,
    startResize: startStudioResize,
  } = useResizablePanel(320, { min: PANEL_WIDTH_MIN, max: PANEL_WIDTH_MAX });

  const [reader, setReader] = useState<NotebookSource | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<{ text: string; nonce: number } | null>(
    null,
  );

  const bookmarked = bookmarks.includes(card.id);
  const isInternal = card.scope === "INTERNAL";
  const selectedCitations = sources.filter((s) => selected.includes(s.id)).map((s) => s.anchor);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.workspace.linkCopied);
    } catch {
      toast.error(t.workspace.linkCopyFailed);
    }
  };

  // Кейс удалён: материалы недоступны и по прямой ссылке тоже. Без этого экрана
  // «удалённый» кейс продолжал открываться и отвечать в чате.
  if (dismissed.includes(card.id)) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header dark={dark} onToggleDark={toggle} />
        <div className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-destructive/12">
              <Trash2 className="h-5 w-5 text-destructive" />
            </span>
            <h1 className="mt-4 text-xl font-bold text-foreground">{t.workspace.deletedTitle}</h1>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {t.workspace.deletedBody(card.title)}
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center justify-center rounded-control bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
            >
              {t.workspace.backToList}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header dark={dark} onToggleDark={toggle} />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              {editingTitle ? (
                <input
                  ref={titleInputRef}
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTitle();
                    if (e.key === "Escape") setEditingTitle(false);
                  }}
                  onBlur={commitTitle}
                  aria-label={t.workspace.caseTitleLabel}
                  className="min-w-0 flex-1 rounded-md border border-primary bg-transparent px-1.5 py-0.5 text-lg font-bold text-card-foreground outline-none"
                />
              ) : (
                <button
                  type="button"
                  onClick={startEditingTitle}
                  title={title}
                  className="group flex min-w-0 items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left transition-colors hover:bg-secondary/50"
                >
                  <h1 className="truncate text-lg font-bold text-card-foreground">{title}</h1>
                  <Pencil className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              )}
              <Badge
                variant="secondary"
                className={cn(
                  "hidden gap-1.5 sm:inline-flex",
                  isInternal
                    ? "bg-scope-internal/15 text-scope-internal"
                    : "bg-scope-external/15 text-scope-external",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "h-1.5 w-1.5 rounded-full",
                    isInternal ? "bg-scope-internal" : "bg-scope-external",
                  )}
                />
                {isInternal ? t.card.internal : t.card.external}
              </Badge>
            </span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">
              {card.source} · {card.author} · {card.language} · {card.date} · {card.business_unit}
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {/* Ниже lg/xl десктопные aside-панели скрыты — без этих кнопок источники и
             артефакты были бы вообще недостижимы на телефоне/планшете. */}
          <button
            onClick={() => setMobileSources(true)}
            aria-label={t.workspace.sourcesPanel}
            title={t.workspace.sourcesPanel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileStudio(true)}
            aria-label={t.workspace.artifactsPanel}
            title={t.workspace.artifactsPanel}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary xl:hidden"
          >
            <PanelRight className="h-4 w-4" />
          </button>
          <button
            onClick={copyLink}
            aria-label={t.workspace.copyLink}
            title={t.workspace.copyLink}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <Link2 className="h-4 w-4" />
          </button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              toggleBookmark(card.id);
              toast.success(bookmarked ? t.card.bookmarkRemoved : t.card.bookmarkAdded);
            }}
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${bookmarked ? "text-accent" : ""}`}
              fill={bookmarked ? "currentColor" : "none"}
            />
            <span className="hidden sm:inline">
              {bookmarked ? t.card.removeBookmark : t.card.addBookmark}
            </span>
          </Button>
          <Link
            to="/"
            aria-label={t.workspace.closeCase}
            title={t.workspace.closeCase}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Link>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {showSources && (
          <aside
            style={{ width: sourcesWidth }}
            className="relative hidden shrink-0 border-r border-border bg-card lg:block"
          >
            <SourcesPanel
              card={card}
              sources={sources}
              selected={selected}
              renames={sourceState.renames}
              onToggle={sourceState.toggle}
              onToggleAll={sourceState.toggleAll}
              onRename={sourceState.rename}
              onRemove={sourceState.removeSource}
              onOpenSource={(s) => {
                setHighlight(null);
                setReader(s);
              }}
              notes={notes}
              onRemoveNote={removeNote}
              onCollapse={() => setShowSources(false)}
            />
            <div
              onMouseDown={startSourcesResize()}
              onKeyDown={resizeKeyDown(setSourcesWidth)}
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label={t.workspace.resizeSources}
              aria-valuenow={sourcesWidth}
              aria-valuemin={PANEL_WIDTH_MIN}
              aria-valuemax={PANEL_WIDTH_MAX}
              className="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-primary/25 focus-visible:bg-primary/25"
            />
          </aside>
        )}

        <Sheet open={mobileSources} onOpenChange={setMobileSources}>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 lg:hidden">
            <SheetTitle className="sr-only">{t.workspace.sourcesPanel}</SheetTitle>
            <SourcesPanel
              card={card}
              sources={sources}
              selected={selected}
              renames={sourceState.renames}
              onToggle={sourceState.toggle}
              onToggleAll={sourceState.toggleAll}
              onRename={sourceState.rename}
              onRemove={sourceState.removeSource}
              onOpenSource={(s) => {
                setHighlight(null);
                setReader(s);
                setMobileSources(false);
              }}
              notes={notes}
              onRemoveNote={removeNote}
            />
          </SheetContent>
        </Sheet>

        {!showSources && (
          <button
            onClick={() => setShowSources(true)}
            aria-label={t.workspace.showSources}
            title={t.workspace.showSources}
            className="absolute left-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary lg:grid"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <main className="min-w-0 flex-1">
          <NotebookChat
            card={displayCard}
            sources={sources}
            selectedCitations={selectedCitations}
            onOpenSource={(s, h) => {
              setHighlight(h ?? null);
              setReader(s);
            }}
            onFeedback={recordFeedback}
            onAsk={(question) => logActivity("question", question)}
            pendingQuestion={pendingQuestion}
            onSaveNote={(text) => {
              addNote(text);
              toast.success(t.workspace.savedToNotes);
            }}
          />
        </main>

        {!showStudio && (
          <button
            onClick={() => setShowStudio(true)}
            aria-label={t.workspace.showArtifacts}
            title={t.workspace.showArtifacts}
            className="absolute right-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-l-lg border border-r-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary xl:grid"
          >
            <PanelRight className="h-4 w-4" />
          </button>
        )}

        {showStudio && (
          <aside
            style={{ width: studioWidth }}
            className="relative hidden shrink-0 border-l border-border bg-card xl:block"
          >
            <div
              onMouseDown={startStudioResize(true)}
              onKeyDown={resizeKeyDown(setStudioWidth, true)}
              role="separator"
              tabIndex={0}
              aria-orientation="vertical"
              aria-label={t.workspace.resizeArtifacts}
              aria-valuenow={studioWidth}
              aria-valuemin={PANEL_WIDTH_MIN}
              aria-valuemax={PANEL_WIDTH_MAX}
              className="absolute inset-y-0 -left-1 z-20 w-2 cursor-col-resize hover:bg-primary/25 focus-visible:bg-primary/25"
            />
            <StudioPanel
              card={displayCard}
              selectedCount={selected.length}
              onGenerated={(title) => logActivity("artifact", title)}
              onSaveNote={(text) => {
                addNote(text);
                toast.success(t.workspace.artifactToNotes);
              }}
              onCollapse={() => setShowStudio(false)}
            />
          </aside>
        )}

        <Sheet open={mobileStudio} onOpenChange={setMobileStudio}>
          <SheetContent side="right" className="w-[85vw] max-w-sm p-0 xl:hidden">
            <SheetTitle className="sr-only">{t.workspace.artifactsPanel}</SheetTitle>
            <StudioPanel
              card={displayCard}
              selectedCount={selected.length}
              onGenerated={(title) => logActivity("artifact", title)}
              onSaveNote={(text) => {
                addNote(text);
                toast.success(t.workspace.artifactToNotes);
                setMobileStudio(false);
              }}
            />
          </SheetContent>
        </Sheet>
      </div>

      <SourceReaderDialog
        source={reader}
        highlight={highlight}
        open={reader !== null}
        onOpenChange={(open) => {
          if (!open) {
            setReader(null);
            setHighlight(null);
          }
        }}
        selected={reader ? selected.includes(reader.id) : false}
        onToggleSelected={() => {
          if (reader) sourceState.toggle(reader.id);
        }}
        onAskAbout={(source) => {
          setReader(null);
          if (!selected.includes(source.id)) sourceState.toggle(source.id);
          setPendingQuestion({
            text: t.reader.askAboutQuestion(source.title),
            nonce: Date.now(),
          });
        }}
      />
    </div>
  );
}
