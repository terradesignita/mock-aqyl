import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeCardData } from "@/data/mockCards";
import { useT, type Dictionary } from "@/lib/i18n";

export interface Slide {
  kicker: string;
  title: string;
  bullets?: string[];
  big?: string;
  note: string;
}

export function buildSlides(card: KnowledgeCardData, t: Dictionary): Slide[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const descriptions = card.framework?.map((f) => f.description) ?? [];
  const v = t.viewers;

  return [
    {
      kicker: card.business_unit,
      title: card.title,
      bullets: [`${card.source} · ${card.author}`, v.deckMeta(card.date, t.media[card.media_type])],
      note: v.deckNote1,
    },
    {
      kicker: v.deckKickerContext,
      title: v.deckTitleNow,
      bullets: card.executive_summary.split(/(?<=\.)\s+/).slice(0, 4),
      note: v.deckNote2,
    },
    {
      kicker: v.deckKickerInsight,
      title: v.deckTitleInsight,
      big: card.core_insight,
      note: v.deckNote3,
    },
    ...steps.map((step, i) => ({
      kicker: v.deckStepKicker(i + 1, steps.length),
      title: step,
      bullets: [descriptions[i] ?? v.deckStepFallback],
      note: v.deckStepNote(card.business_unit),
    })),
    {
      kicker: v.deckKickerNext,
      title: v.deckTitlePilot,
      bullets: [
        v.deckOwner(card.author),
        v.deckScope(card.business_unit),
        v.deckCheckpoint,
        v.deckBudget,
      ],
      note: v.deckNoteLast,
    },
  ];
}

export function DeckViewer({ slides, fullscreen }: { slides: Slide[]; fullscreen: boolean }) {
  const t = useT();
  const [i, setI] = useState(0);
  const [notes, setNotes] = useState(true);
  const s = slides[i];
  const go = (d: number) => setI((v) => (v + d + slides.length) % slides.length);

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border border-border bg-primary text-primary-foreground shadow-xl">
        <div className="aspect-video p-6 sm:p-10">
          <p className="text-xs font-bold text-primary-foreground/60">{s.kicker}</p>
          <h3
            className={`mt-3 font-bold leading-tight ${
              fullscreen ? "text-4xl" : "text-xl sm:text-2xl"
            }`}
          >
            {s.title}
          </h3>
          {s.big && (
            <p
              className={`mt-6 font-bold leading-snug text-accent ${
                fullscreen ? "text-3xl" : "text-lg sm:text-xl"
              }`}
            >
              {s.big}
            </p>
          )}
          {s.bullets && (
            <ul className={`mt-5 space-y-2.5 ${fullscreen ? "text-lg" : "text-xs sm:text-sm"}`}>
              {s.bullets.map((b) => (
                <li key={b} className="flex gap-2.5 leading-relaxed text-primary-foreground/90">
                  <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          )}
          <p className="absolute bottom-4 right-6 text-xs font-semibold text-primary-foreground/80">
            {i + 1} / {slides.length}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => go(-1)}>
          <ChevronLeft className="h-3.5 w-3.5" /> {t.viewers.deckBack}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onClick={() => setNotes((v) => !v)}
        >
          <Play className="h-3 w-3" /> {notes ? t.viewers.deckHideNotes : t.viewers.deckShowNotes}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => go(1)}>
          {t.viewers.deckNext} <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {notes && (
        <p className="rounded-xl border border-dashed border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-card-foreground">{t.viewers.deckSpeakerNote}</span>
          {s.note}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {slides.map((sl, idx) => (
          <button
            key={sl.title + idx}
            onClick={() => setI(idx)}
            aria-label={t.viewers.deckSlideN(idx + 1)}
            className={`h-14 w-24 shrink-0 rounded-lg border p-1.5 text-left text-[9px] leading-tight transition-[color,border-color,background-color,box-shadow] ${
              idx === i
                ? "border-primary bg-primary/10 text-card-foreground ring-2 ring-primary/30"
                : "border-border bg-secondary/40 text-muted-foreground hover:border-primary/40"
            }`}
          >
            <span className="line-clamp-3">{sl.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
