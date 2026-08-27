import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import type { KnowledgeCardData } from "@/data/mockCards";
import { useT, type Dictionary } from "@/lib/i18n";

export interface InsightCard {
  tag: string;
  title: string;
  text: string;
  /** Откуда взята мысль: фрагменты источника, фреймворк автора или оценка модели.
   *  Раньше здесь стояли `relevance` и язык оригинала — числа, которые ничего не измеряли. */
  origin: string;
}

export function buildInsightCards(card: KnowledgeCardData, t: Dictionary): InsightCard[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const descriptions = card.framework?.map((f) => f.description) ?? [];
  const v = t.viewers;

  return [
    {
      tag: v.cardsTagInsight,
      title: v.cardsTitleInsight,
      text: card.core_insight,
      origin: v.cardsOriginCited(card.citations.length),
    },
    {
      tag: v.cardsTagContext,
      title: v.cardsTitleContext,
      text: card.executive_summary,
      origin: v.cardsOriginSource(card.source),
    },
    ...steps.slice(0, 4).map((step, i) => ({
      tag: v.cardsTagStep(i + 1),
      title: step,
      text: descriptions[i] ?? v.cardsStepFallback,
      origin: v.cardsOriginFramework,
    })),
    {
      tag: v.cardsTagRisk,
      title: v.cardsTitleRisk,
      text: v.cardsTextRisk,
      origin: v.cardsOriginModel,
    },
    {
      tag: v.cardsTagAction,
      title: v.cardsTitleAction,
      text: v.cardsTextAction(card.business_unit),
      origin: v.cardsOriginModel,
    },
  ];
}

const TONES = [
  "from-primary to-primary/70",
  "from-accent to-accent/70",
  "from-primary/90 to-accent/80",
];

export function CardsDeck({ cards }: { cards: InsightCard[] }) {
  const t = useT();
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  const scrollBy = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        onScroll={(e) => {
          const el = e.currentTarget;
          const w = el.scrollWidth / cards.length;
          setActive(Math.round(el.scrollLeft / w));
        }}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ perspective: "1200px" }}
      >
        {cards.map((c, i) => (
          <article
            key={c.title + i}
            className={`group relative flex h-64 w-[260px] shrink-0 snap-center flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br p-4 text-primary-foreground shadow-xl transition-[transform,box-shadow,opacity] duration-500 hover:-translate-y-1.5 hover:shadow-2xl ${
              TONES[i % TONES.length]
            } ${i === active ? "scale-100" : "scale-[0.94] opacity-80"}`}
          >
            <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary-foreground/10 blur-xl transition-transform duration-700 group-hover:scale-150" />
            <span className="pointer-events-none absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-primary-foreground/25 to-transparent transition-transform duration-[1100ms] group-hover:translate-x-[120%]" />
            <div className="relative">
              <p className="text-xs font-bold text-primary-foreground/70">{c.tag}</p>
              <h4 className="mt-2 text-base font-bold leading-tight">{c.title}</h4>
            </div>
            <p className="relative line-clamp-5 text-xs leading-relaxed text-primary-foreground/90">
              {c.text}
            </p>
            <div className="relative flex items-end gap-2">
              <Quote className="h-4 w-4 shrink-0 text-primary-foreground/50" />
              <span className="min-w-0 truncate rounded-full bg-primary-foreground/18 px-2 py-1 text-[11px] font-semibold leading-none text-primary-foreground/90">
                {c.origin}
              </span>
            </div>
          </article>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1.5">
          {cards.map((c, i) => (
            <span
              key={c.title + i}
              className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                i === active ? "w-6 bg-primary" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => scrollBy(-1)}
            aria-label={t.viewers.cardsPrev}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors active:scale-[0.96] hover:border-primary hover:text-primary"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label={t.viewers.cardsNext}
            className="rounded-full border border-border p-1.5 text-muted-foreground transition-colors active:scale-[0.96] hover:border-primary hover:text-primary"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{t.viewerExtra.cardsHint(cards.length)}</p>
    </div>
  );
}
