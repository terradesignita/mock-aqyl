import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Files, Lock, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import type { KnowledgeCardData } from "@/data/mockCards";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface KnowledgeCardProps {
  card: KnowledgeCardData & { matchScore?: number };
  index: number;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  isPrivate: boolean;
  onTogglePrivate: (id: string) => void;
}

type OverlayMode = "open" | "delete" | null;

export function KnowledgeCard({
  card,
  index,
  bookmarked,
  onToggleBookmark,
  onDelete,
  isPrivate,
  onTogglePrivate,
}: KnowledgeCardProps) {
  const isInternal = card.scope === "INTERNAL";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const articleRef = useRef<HTMLElement>(null);
  const openLinkRef = useRef<HTMLAnchorElement>(null);
  const cancelDeleteRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!overlayMode) return;
    if (overlayMode === "open") openLinkRef.current?.focus();
    else cancelDeleteRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlayMode(null);
        articleRef.current?.focus();
      }
    };
    const onPointerDown = (e: MouseEvent) => {
      if (articleRef.current && !articleRef.current.contains(e.target as Node)) {
        setOverlayMode(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
    };
  }, [overlayMode]);

  return (
    <motion.article
      ref={articleRef}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 9) * 0.05 }}
      role="button"
      tabIndex={0}
      aria-label={`Открыть кейс: ${card.title}`}
      onClick={() => setOverlayMode("open")}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setOverlayMode("open");
        }
      }}
      className="group relative flex h-full cursor-pointer flex-col rounded-card border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow] duration-300 hover:border-primary/40 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      {/* Card chrome: made inert while an overlay covers it, so Tab can't reach
          controls hidden behind the dimmed backdrop. */}
      <div inert={overlayMode !== null} className="flex h-full flex-col">
        {/* Header: visibility toggle & bookmark */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                aria-expanded={confirmOpen}
                onClick={(e) => e.stopPropagation()}
                className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold transition-colors active:scale-[0.96] ${
                  isPrivate
                    ? "border-warning/40 bg-warning/10 text-warning hover:bg-warning/16"
                    : "border-border bg-secondary text-muted-foreground hover:bg-secondary/70"
                }`}
              >
                {isPrivate ? <Lock className="h-2.5 w-2.5" /> : <Users className="h-2.5 w-2.5" />}
                {isPrivate ? "Приватный" : "Общий"}
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-72 space-y-3 p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-sm leading-relaxed text-card-foreground">
                {isPrivate
                  ? "Сделать общедоступным? Материалы кейса попадут в общую базу знаний для всех сотрудников."
                  : "Сделать приватным? Материалы кейса перестанут быть видны остальным сотрудникам."}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    onTogglePrivate(card.id);
                    setConfirmOpen(false);
                  }}
                >
                  {isPrivate ? "Да, сделать общедоступным" : "Да, сделать приватным"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>
                  Отмена
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(card.id);
            }}
            aria-label={bookmarked ? "Убрать из закладок" : "В закладки"}
            className={`-m-1 shrink-0 rounded-full p-1 transition-colors active:scale-[0.96] ${
              bookmarked ? "text-accent" : "text-muted-foreground hover:text-accent"
            }`}
          >
            <Bookmark
              className="h-[18px] w-[18px] transition-colors"
              fill={bookmarked ? "currentColor" : "none"}
            />
          </button>
        </div>

        {/* Title & summary */}
        <div className="mb-4">
          <p className="text-base font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary">
            {card.title}
          </p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {card.executive_summary}
          </p>
        </div>

        {/* Footer: scope, file count & delete */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                isInternal ? "bg-scope-internal" : "bg-scope-external"
              }`}
            />
            <span className="whitespace-nowrap">
              {isInternal ? "Внутренний опыт" : "Мировой опыт"}
            </span>
            <span aria-hidden>·</span>
            <Files className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{card.citations.length} файлов</span>
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setOverlayMode("delete");
            }}
            aria-label="Удалить кейс"
            title="Удалить кейс"
            className="-m-1 inline-flex items-center gap-1 rounded-md p-1 text-xs font-bold uppercase tracking-wide text-muted-foreground/50 transition-colors active:scale-[0.96] hover:text-destructive focus-visible:text-destructive group-hover:text-muted-foreground"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Open-confirmation overlay */}
      {overlayMode === "open" && (
        <div
          className="absolute inset-0 z-10 grid place-items-center rounded-card bg-foreground/55 backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setOverlayMode(null);
          }}
        >
          <Link
            ref={openLinkRef}
            to="/card/$id"
            params={{ id: card.id }}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-brand transition-transform active:scale-[0.96] hover:bg-primary-hover"
          >
            Открыть <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Delete-confirmation overlay */}
      {overlayMode === "delete" && (
        <div
          className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-card bg-foreground/55 p-5 text-center backdrop-blur-[2px] animate-in fade-in duration-150"
          onClick={(e) => {
            e.stopPropagation();
            setOverlayMode(null);
          }}
        >
          <p className="text-sm font-bold text-primary-foreground">Удалить кейс?</p>
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => {
                onDelete(card.id);
                setOverlayMode(null);
              }}
            >
              Да, удалить
            </Button>
            <Button size="sm" variant="secondary" ref={cancelDeleteRef} onClick={() => setOverlayMode(null)}>
              Отмена
            </Button>
          </div>
        </div>
      )}
    </motion.article>
  );
}
