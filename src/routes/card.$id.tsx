import { useEffect, useMemo, useRef, useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Bookmark, Pencil, PanelLeft, PanelRight, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SourcesPanel } from "@/components/notebook/SourcesPanel";
import { SourceReaderDialog } from "@/components/notebook/SourceReaderDialog";
import { buildNotebookSources, type NotebookSource } from "@/lib/sources";
import { NotebookChat } from "@/components/notebook/NotebookChat";
import { StudioPanel } from "@/components/notebook/StudioPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { getCardById, type KnowledgeCardData } from "@/data/mockCards";
import { useBookmarks, useCardTitle, useFeedback, useNotes, useTheme } from "@/hooks/useAppState";
import { clampWidth, useResizablePanel } from "@/hooks/useResizablePanel";
import { cn } from "@/lib/utils";

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
    const card = getCardById(params.id);
    if (!card) throw notFound();
    return { card };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Карточка не найдена — BI AQYL" }, { name: "robots", content: "noindex" }],
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

function CardWorkspace() {
  const { card } = Route.useLoaderData() as { card: KnowledgeCardData };
  const { title, rename } = useCardTitle(card.id, card.title);
  const displayCard = useMemo(() => ({ ...card, title }), [card, title]);

  const { dark, toggle } = useTheme();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { notes, add: addNote, remove: removeNote } = useNotes(card.id);
  const { record: recordFeedback } = useFeedback(card.id);

  const sources = useMemo(() => buildNotebookSources(card), [card]);

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

  const [selected, setSelected] = useState<string[]>(() => sources.map((s) => s.id));
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
                  aria-label="Название кейса"
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
                {isInternal ? "Внутренний опыт" : "Мировой опыт"}
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
            aria-label="Источники"
            title="Источники"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:hidden"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setMobileStudio(true)}
            aria-label="Артефакты"
            title="Артефакты"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary xl:hidden"
          >
            <PanelRight className="h-4 w-4" />
          </button>
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5"
            onClick={() => {
              toggleBookmark(card.id);
              toast.success(bookmarked ? "Убрано из закладок" : "Добавлено в закладки");
            }}
          >
            <Bookmark
              className={`h-4 w-4 transition-colors ${bookmarked ? "text-accent" : ""}`}
              fill={bookmarked ? "currentColor" : "none"}
            />
            <span className="hidden sm:inline">{bookmarked ? "В закладках" : "В закладки"}</span>
          </Button>
          <Link
            to="/"
            aria-label="Закрыть кейс"
            title="Закрыть кейс"
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
              onToggle={(id) =>
                setSelected((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              onToggleAll={() =>
                setSelected((prev) =>
                  prev.length === sources.length ? [] : sources.map((s) => s.id),
                )
              }
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
              aria-label="Изменить ширину панели источников"
              aria-valuenow={sourcesWidth}
              aria-valuemin={PANEL_WIDTH_MIN}
              aria-valuemax={PANEL_WIDTH_MAX}
              className="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-primary/25 focus-visible:bg-primary/25"
            />
          </aside>
        )}

        <Sheet open={mobileSources} onOpenChange={setMobileSources}>
          <SheetContent side="left" className="w-[85vw] max-w-sm p-0 lg:hidden">
            <SheetTitle className="sr-only">Источники</SheetTitle>
            <SourcesPanel
              card={card}
              sources={sources}
              selected={selected}
              onToggle={(id) =>
                setSelected((prev) =>
                  prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                )
              }
              onToggleAll={() =>
                setSelected((prev) =>
                  prev.length === sources.length ? [] : sources.map((s) => s.id),
                )
              }
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
            aria-label="Показать источники"
            title="Показать источники"
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
            pendingQuestion={pendingQuestion}
            onSaveNote={(text) => {
              addNote(text);
              toast.success("Сохранено в заметки");
            }}
          />
        </main>

        {!showStudio && (
          <button
            onClick={() => setShowStudio(true)}
            aria-label="Показать артефакты"
            title="Показать артефакты"
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
              aria-label="Изменить ширину панели артефактов"
              aria-valuenow={studioWidth}
              aria-valuemin={PANEL_WIDTH_MIN}
              aria-valuemax={PANEL_WIDTH_MAX}
              className="absolute inset-y-0 -left-1 z-20 w-2 cursor-col-resize hover:bg-primary/25 focus-visible:bg-primary/25"
            />
            <StudioPanel
              card={displayCard}
              onSaveNote={(text) => {
                addNote(text);
                toast.success("Артефакт сохранён в заметки");
              }}
              onCollapse={() => setShowStudio(false)}
            />
          </aside>
        )}

        <Sheet open={mobileStudio} onOpenChange={setMobileStudio}>
          <SheetContent side="right" className="w-[85vw] max-w-sm p-0 xl:hidden">
            <SheetTitle className="sr-only">Артефакты</SheetTitle>
            <StudioPanel
              card={displayCard}
              onSaveNote={(text) => {
                addNote(text);
                toast.success("Артефакт сохранён в заметки");
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
          if (!reader) return;
          setSelected((prev) =>
            prev.includes(reader.id) ? prev.filter((x) => x !== reader.id) : [...prev, reader.id],
          );
        }}
        onAskAbout={(source) => {
          setReader(null);
          setSelected((prev) => (prev.includes(source.id) ? prev : [...prev, source.id]));
          setPendingQuestion({
            text: `Что важного в источнике «${source.title}»?`,
            nonce: Date.now(),
          });
        }}
      />
    </div>
  );
}
