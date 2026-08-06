import { useState } from "react";
import { ChevronLeft, ChevronRight, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { KnowledgeCardData } from "@/data/mockCards";

export interface Slide {
  kicker: string;
  title: string;
  bullets?: string[];
  big?: string;
  note: string;
}

export function buildSlides(card: KnowledgeCardData): Slide[] {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const descriptions = card.framework?.map((f) => f.description) ?? [];

  return [
    {
      kicker: card.business_unit,
      title: card.title,
      bullets: [
        `${card.source} · ${card.author}`,
        `${card.date} · релевантность ${card.relevance}%`,
      ],
      note: "Начать с боли текущего процесса — 40 секунд, без цифр.",
    },
    {
      kicker: "Контекст",
      title: "Что происходит сейчас",
      bullets: card.executive_summary.split(/(?<=\.)\s+/).slice(0, 4),
      note: "Дать аудитории узнать себя в описании. Спросить: «у вас так же?»",
    },
    {
      kicker: "Ключевой инсайт",
      title: "Главный вывод",
      big: card.core_insight,
      note: "Пауза после цифры. Не комментировать 3 секунды.",
    },
    ...steps.map((s, i) => ({
      kicker: `Шаг ${i + 1} из ${steps.length}`,
      title: s,
      bullets: [descriptions[i] ?? "Фиксируем результат и передаём владельцу процесса."],
      note: `Пример из практики «${card.business_unit}» — 30 секунд.`,
    })),
    {
      kicker: "Next steps",
      title: "Пилот на 6 недель",
      bullets: [
        `Владелец: ${card.author}`,
        `Периметр: ${card.business_unit}, один объект`,
        "Чек-поинт: через 30 дней",
        "Бюджет: в рамках текущего OPEX",
      ],
      note: "Закрыть договорённостью о дате чек-поинта прямо на встрече.",
    },
  ];
}

export function DeckViewer({ slides, fullscreen }: { slides: Slide[]; fullscreen: boolean }) {
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
          <ChevronLeft className="h-3.5 w-3.5" /> Назад
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="gap-1.5 text-xs"
          onClick={() => setNotes((v) => !v)}
        >
          <Play className="h-3 w-3" /> {notes ? "Скрыть заметки" : "Спикер-ноты"}
        </Button>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => go(1)}>
          Далее <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {notes && (
        <p className="rounded-xl border border-dashed border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
          <span className="font-semibold text-card-foreground">Спикер-нота: </span>
          {s.note}
        </p>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {slides.map((sl, idx) => (
          <button
            key={sl.title + idx}
            onClick={() => setI(idx)}
            aria-label={`Слайд ${idx + 1}`}
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
