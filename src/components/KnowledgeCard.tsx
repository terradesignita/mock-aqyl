import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Bookmark,
  Building2,
  Files,
  Globe,
  Loader2,
  Lock,
  Trash2,
  Users,
} from "lucide-react";
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
import { badgeVariants } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { HoverRevealIconButton } from "@/components/HoverRevealIconButton";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useT } from "@/lib/i18n";
import { useIngest } from "@/lib/ingest";
import { useCardFileCounts } from "@/hooks/useAppState";

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
  const t = useT();
  const { jobFor } = useIngest();
  const fileCount = useCardFileCounts();
  // Файл кейса ещё разбирается — показываем это на самой карточке (рис. 41).
  const job = jobFor(card.id);
  const isInternal = card.scope === "INTERNAL";
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.article
      initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={
        prefersReducedMotion
          ? { duration: 0 }
          : { duration: 0.28, delay: Math.min(index, 9) * 0.05 }
      }
      className="group relative flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[0_20px_45px_-10px_oklch(0.538_0.256_262.4/0.35)]"
    >
      {/* Ссылка-подложка: карточка открывается одним кликом в любом месте и остаётся
          единственной точкой входа для клавиатуры. Кнопки поверх — с `relative z-10`. */}
      <Link
        to="/card/$id"
        params={{ id: card.id }}
        aria-label={t.card.openCase(card.title)}
        className="absolute inset-0 rounded-card focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      />

      <div className="flex h-full flex-col">
        {/* Header: visibility toggle & bookmark */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="relative z-10 flex min-w-0 items-center gap-1">
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
                  {isPrivate ? t.card.private : t.card.shared}
                </button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                className="w-72 space-y-3 p-4"
                onClick={(e) => e.stopPropagation()}
              >
                <p className="text-sm leading-relaxed text-card-foreground">
                  {isPrivate ? t.card.makeSharedQuestion : t.card.makePrivateQuestion}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    onClick={() => {
                      onTogglePrivate(card.id);
                      setConfirmOpen(false);
                    }}
                  >
                    {isPrivate ? t.card.makeSharedConfirm : t.card.makePrivateConfirm}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setConfirmOpen(false)}>
                    {t.common.cancel}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleBookmark(card.id);
            }}
            aria-label={bookmarked ? t.card.removeBookmark : t.card.addBookmark}
            className={`relative z-10 -m-1 shrink-0 rounded-full p-1 transition-colors active:scale-[0.96] ${
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
              <span
                aria-hidden
                title={t.card.unreadDot}
                className="mr-2 inline-block h-2 w-2 shrink-0 rounded-full bg-primary align-middle"
              />
            )}
            {card.title}
            {isNew && <span className="sr-only"> — {t.card.unreadSr}</span>}
          </p>
          {job ? (
            <div className="mt-2">
              <div className="h-1 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{ width: `${((job.step + 1) / job.stages.length) * 100}%` }}
                />
              </div>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-primary" />
                <span className="min-w-0 truncate font-semibold text-primary">
                  {job.stages[job.step]?.label}
                </span>
                <span className="ml-auto shrink-0 tabular-nums">
                  {Math.round(((job.step + 1) / job.stages.length) * 100)} %
                </span>
              </p>
            </div>
          ) : (
            <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
              {card.executive_summary}
            </p>
          )}
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
              {isInternal ? t.card.internal : t.card.external}
            </span>
            <span aria-hidden>·</span>
            <Files className="h-3.5 w-3.5 shrink-0" />
            <span className="whitespace-nowrap">{t.card.filesCount(fileCount(card))}</span>
          </span>

          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <span
              aria-hidden
              className="inline-flex items-center gap-1 text-xs font-bold text-primary opacity-0 transition-opacity group-hover:opacity-100"
            >
              {t.common.open} <ArrowRight className="h-3.5 w-3.5" />
            </span>
            <HoverRevealIconButton
              tone="destructive"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmOpen(true);
              }}
              aria-label={t.card.deleteCase}
              title={t.card.deleteCase}
            >
              <Trash2 className="h-4 w-4" />
            </HoverRevealIconButton>
          </div>
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.card.deleteTitle}</AlertDialogTitle>
            <AlertDialogDescription>{t.card.deleteBody(card.title)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.common.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className={buttonVariants({ variant: "destructive" })}
              onClick={() => onDelete(card.id)}
            >
              {t.card.deleteConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.article>
  );
}
