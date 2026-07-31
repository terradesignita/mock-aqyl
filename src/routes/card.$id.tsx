import { useMemo, useState } from "react";
import { Link, createFileRoute, notFound } from "@tanstack/react-router";
import { Bookmark, PanelLeft, PanelRight, X } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { SourcesPanel } from "@/components/notebook/SourcesPanel";
import { SourceReaderDialog } from "@/components/notebook/SourceReaderDialog";
import { buildNotebookSources, type NotebookSource } from "@/lib/sources";
import { NotebookChat } from "@/components/notebook/NotebookChat";
import { StudioPanel } from "@/components/notebook/StudioPanel";
import { Button } from "@/components/ui/button";
import { getCardById, type KnowledgeCardData } from "@/data/mockCards";
import { useBookmarks, useFeedback, useNotes, useTheme } from "@/hooks/useAppState";

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

  const { dark, toggle } = useTheme();
  const { bookmarks, toggle: toggleBookmark } = useBookmarks();
  const { notes, add: addNote, remove: removeNote } = useNotes(card.id);
  const { record: recordFeedback } = useFeedback(card.id);

  const sources = useMemo(() => buildNotebookSources(card), [card]);

  const [selected, setSelected] = useState<string[]>(() => sources.map((s) => s.id));
  const [showSources, setShowSources] = useState(true);
  const [showStudio, setShowStudio] = useState(true);
  const [sourcesWidth, setSourcesWidth] = useState(290);
  const [studioWidth, setStudioWidth] = useState(320);

  const [reader, setReader] = useState<NotebookSource | null>(null);
  const [highlight, setHighlight] = useState<string | null>(null);
  const [pendingQuestion, setPendingQuestion] = useState<{ text: string; nonce: number } | null>(
    null,
  );

  const bookmarked = bookmarks.includes(card.id);
  const isInternal = card.scope === "INTERNAL";
  const selectedCitations = sources.filter((s) => selected.includes(s.id)).map((s) => s.anchor);

  const startResize = (side: "left" | "right") => (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startW = side === "left" ? sourcesWidth : studioWidth;
    const onMove = (ev: MouseEvent) => {
      const delta = side === "left" ? ev.clientX - startX : startX - ev.clientX;
      const next = Math.min(520, Math.max(220, startW + delta));
      if (side === "left") setSourcesWidth(next);
      else setStudioWidth(next);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      <Header dark={dark} onToggleDark={toggle} bookmarkCount={bookmarks.length} />

      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-card px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <h1 className="truncate text-sm font-bold text-card-foreground">{card.title}</h1>
              <span
                className={`hidden shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold sm:inline-flex ${
                  isInternal
                    ? "bg-scope-internal/15 text-scope-internal"
                    : "bg-scope-external/15 text-scope-external"
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1.5 w-1.5 rounded-full ${
                    isInternal ? "bg-scope-internal" : "bg-scope-external"
                  }`}
                />
                {isInternal ? "Внутренний опыт" : "Мировой опыт"}
              </span>
            </span>
            <span className="hidden truncate text-xs text-muted-foreground sm:block">
              {card.source} · {card.author} · {card.language} · {card.date} · {card.business_unit}
            </span>
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
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
              onMouseDown={startResize("left")}
              role="separator"
              aria-orientation="vertical"
              aria-label="Изменить ширину панели источников"
              className="absolute inset-y-0 -right-1 z-20 w-2 cursor-col-resize hover:bg-primary/25"
            />
          </aside>
        )}

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
            card={card}
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
              onMouseDown={startResize("right")}
              role="separator"
              aria-orientation="vertical"
              aria-label="Изменить ширину панели артефактов"
              className="absolute inset-y-0 -left-1 z-20 w-2 cursor-col-resize hover:bg-primary/25"
            />
            <StudioPanel
              card={card}
              onSaveNote={(text) => {
                addNote(text);
                toast.success("Артефакт сохранён в заметки");
              }}
              onCollapse={() => setShowStudio(false)}
            />
          </aside>
        )}
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
