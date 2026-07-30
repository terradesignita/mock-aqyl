import { Download, Maximize2 } from "lucide-react";
import infographic from "@/assets/infographic-summary.jpg";
import type { KnowledgeCardData } from "@/data/mockCards";

export function InfographicView({
  card,
  fullscreen,
}: {
  card: KnowledgeCardData;
  fullscreen: boolean;
}) {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];

  return (
    <div className="space-y-3">
      <figure className="overflow-hidden rounded-2xl border border-border bg-secondary/30">
        <img
          src={infographic}
          alt={`Инфографика: визуальная сводка материала «${card.title}»`}
          loading="lazy"
          width={1024}
          height={1408}
          className={`mx-auto w-full object-contain ${fullscreen ? "max-h-[62vh]" : "max-h-[46vh]"}`}
        />
        <figcaption className="border-t border-border px-3 py-2 text-[11px] text-muted-foreground">
          {card.source} · {card.author} · {card.business_unit}
        </figcaption>
      </figure>

      <div className="grid grid-cols-3 gap-2">
        {[
          { label: "Релевантность", value: `${card.relevance}%` },
          { label: "Источников", value: String(card.citations.length) },
          { label: "Шагов внедрения", value: steps.length ? String(steps.length) : "—" },
        ].map((m) => (
          <div key={m.label} className="rounded-xl border border-border bg-secondary/40 p-3">
            <p className="text-base font-bold text-primary">{m.value}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>

      <p className="rounded-xl border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-card-foreground">
        <span className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-accent">
          Цифра-герой
        </span>
        {card.core_insight}
      </p>

      <p className="flex items-center gap-3 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Maximize2 className="h-3 w-3" /> F — полный экран
        </span>
        <a
          href={infographic}
          download={`infographic-${card.id}.jpg`}
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <Download className="h-3 w-3" /> Скачать картинку
        </a>
      </p>
    </div>
  );
}
