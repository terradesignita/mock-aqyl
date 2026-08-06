import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Bookmark, Building2, Files, Globe, Lock, Trash2, Users } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { KnowledgeCardData } from "@/data/mockCards";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { HelpHint } from "@/components/HelpHint";
import { HoverRevealIconButton } from "@/components/HoverRevealIconButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface KnowledgeCardProps {
  card: KnowledgeCardData & { matchScore?: number };
  index: number;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
  isPrivate: boolean;
  onTogglePrivate: (id: string) => void;
  isNew?: boolean;
}

type OverlayMode = "open" | null;

export function KnowledgeCard({
  card,
  index,
  bookmarked,
  onToggleBookmark,
  onDelete,
  isPrivate,
  onTogglePrivate,
  isNew,
}: KnowledgeCardProps) {
  const isInternal = card.scope === "INTERNAL";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [overlayMode, setOverlayMode] = useState<OverlayMode>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const openLinkRef = useRef<HTMLAnchorElement>(null);
  const openTriggerRef = useRef<HTMLButtonElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    if (!overlayMode) return;
    openLinkRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOverlayMode(null);
        // The trigger sits inside the `inert` chrome while the overlay is open —
        // wait for the re-render that drops `inert` before focusing it, or the
        // browser silently refuses (inert elements can't take focus).
        requestAnimationFrame(() => openTriggerRef.current?.focus());
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
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.28, delay: Math.min(index, 9) * 0.05 }
      }
      onClick={() => setOverlayMode("open")}
      className="group relative flex h-full cursor-pointer flex-col rounded-card border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_45px_-10px_oklch(0.538_0.256_262.4/0.35)]"
    >
      {/* Card chrome: made inert while an overlay covers it, so Tab can't reach
          controls hidden behind the dimmed backdrop. */}
      <div inert={overlayMode !== null} className="flex h-full flex-col">
        {/* Header: visibility toggle & bookmark */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-1">
            <Popover open={confirmOpen} onOpenChange={setConfirmOpen}>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  aria-expanded={confirmOpen}
                  onClick={(e) => e.stopPropagation()}
                  className={cn(
                    badgeVariants({ variant: isPrivate ? "warning" : "secondary" }),
                    "transition-colors active:scale-[0.96]",
                    isPrivate ? "hover:bg-warning/16" : "hover:bg-secondary/70",
                  )}
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
            <span onClick={(e) => e.stopPropagation()}>
              <HelpHint
                side="bottom"
                text={
                  isPrivate
                    ? "Приватный: кейс виден только вам и скрыт из общей базы знаний для остальных сотрудников."
                    : "Общий: кейс виден всем сотрудникам и участвует в общем поиске по базе знаний."
                }
              />
            </span>
          </div>

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
            {isNew && (
              <span className="mr-1.5 inline-flex items-center gap-1 align-middle">
                <Badge variant="primary" className="font-bold">
                  Новый кейс
                </Badge>
                <span onClick={(e) => e.stopPropagation()}>
                  <HelpHint
                    side="bottom"
                    text="Кейс добавлен и распознан автоматически."
                    className="motion-safe:animate-pulse"
                  />
                </span>
              </span>
            )}
            {card.title}
          </p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {card.executive_summary}
          </p>
        </div>

        {/* Footer: scope, file count & delete */}
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
          <span className="flex min-w-0 flex-wrap items-center gap-x-1.5 gap-y-1 text-xs font-medium text-muted-foreground">
            {isInternal ? (
              <Building2 className="h-3.5 w-3.5 shrink-0 text-scope-internal" />
            ) : (
              <Globe className="h-3.5 w-3.5 shrink-0 text-scope-external" />
            )}
            <span
              className={`whitespace-nowrap ${isInternal ? "text-scope-internal" : "text-scope-external"}`}
            >
              {isInternal ? "Внутренний опыт" : "Мировой опыт"}
            </span>
            <span aria-hidden>·</span>
            <Files className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{card.citations.length} файлов</span>
          </span>

          <div className="flex shrink-0 items-center gap-1">
            {/* Настоящая, фокусируемая точка входа — сама карточка кликабельна только
               мышью (не role="button"), чтобы не вкладывать реальные кнопки внутрь
               элемента, объявленного скринридеру как кнопка. */}
            <button
              ref={openTriggerRef}
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setOverlayMode("open");
              }}
              aria-label={`Открыть кейс: ${card.title}`}
              className="-m-1 inline-flex items-center gap-1 rounded-md p-1 text-xs font-bold text-primary transition-colors hover:bg-primary/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              Открыть <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <HoverRevealIconButton
              tone="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmOpen(true);
              }}
              aria-label="Удалить кейс"
              title="Удалить кейс"
            >
              <Trash2 className="h-4 w-4" />
            </HoverRevealIconButton>
          </div>
        </div>
      </div>

      {/* Open-confirmation overlay */}
      {overlayMode === "open" && (
        <div
          className="absolute inset-0 z-10 grid place-items-center rounded-card bg-primary/70 backdrop-blur-[2px] animate-in fade-in duration-150"
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
            className="inline-flex items-center gap-1.5 rounded-full bg-card px-5 py-2.5 text-sm font-bold text-primary shadow-lg transition-transform active:scale-[0.96] hover:bg-card/90"
          >
            Открыть <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить кейс?</AlertDialogTitle>
            <AlertDialogDescription>
              «{card.title}» будет удалён из списка. Это действие нельзя отменить.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => onDelete(card.id)}
            >
              Да, удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.article>
  );
}
