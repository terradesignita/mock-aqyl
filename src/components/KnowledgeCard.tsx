import { Link } from "@tanstack/react-router";
import { Bookmark, Files, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import type { KnowledgeCardData } from "@/data/mockCards";

interface KnowledgeCardProps {
  card: KnowledgeCardData & { matchScore?: number };
  index: number;
  bookmarked: boolean;
  onToggleBookmark: (id: string) => void;
  onDelete: (id: string) => void;
}

export function KnowledgeCard({
  card,
  index,
  bookmarked,
  onToggleBookmark,
  onDelete,
}: KnowledgeCardProps) {
  const isInternal = card.scope === "INTERNAL";

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index, 9) * 0.05 }}
      className="group relative flex h-full flex-col rounded-card border border-border bg-card p-5 shadow-sm transition-all duration-300 hover:border-primary/40 hover:shadow-md"
    >
      {/* Header: scope badge & bookmark */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <span
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
            isInternal
              ? "border-scope-internal/25 bg-scope-internal/10 text-scope-internal"
              : "border-scope-external/25 bg-scope-external/10 text-scope-external"
          }`}
        >
          <span
            aria-hidden
            className={`h-1.5 w-1.5 rounded-full ${
              isInternal ? "bg-scope-internal" : "bg-scope-external"
            }`}
          />
          {isInternal ? "Общий" : "Приватный"}
        </span>
        <button
          onClick={() => onToggleBookmark(card.id)}
          aria-label={bookmarked ? "Убрать из закладок" : "В закладки"}
          className={`shrink-0 transition-colors active:scale-[0.96] ${
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
        <Link
          to="/card/$id"
          params={{ id: card.id }}
          className="text-base font-bold leading-snug text-card-foreground transition-colors group-hover:text-primary"
        >
          {card.title}
        </Link>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {card.executive_summary}
        </p>
      </div>

      {/* Footer: file count & delete-on-hover */}
      <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-4">
        <span className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
          <Files className="h-4 w-4" />
          {card.citations.length} файлов
        </span>

        <button
          onClick={(e) => {
            e.preventDefault();
            onDelete(card.id);
          }}
          aria-label="Удалить кейс"
          title="Удалить кейс"
          className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground opacity-0 transition-[opacity,color] active:scale-[0.96] hover:text-destructive focus-visible:opacity-100 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </motion.article>
  );
}
