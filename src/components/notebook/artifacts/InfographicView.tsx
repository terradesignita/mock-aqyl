import type { KnowledgeCardData } from "@/data/mockCards";
import { useT } from "@/lib/i18n";

export function InfographicView({
  card,
  fullscreen,
}: {
  card: KnowledgeCardData;
  fullscreen: boolean;
}) {
  const t = useT();
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const path = steps.length ? steps.join(" → ") : t.viewers.infoPathFallback;

  const stats = [
    { label: t.viewers.infoRelevance, value: `${card.relevance}%` },
    { label: t.artifactContent.infoSources, value: String(card.citations.length) },
    {
      label: t.artifactContent.infoSteps,
      value: steps.length ? String(steps.length) : "—",
    },
    { label: t.artifactContent.infoLanguage, value: card.language },
  ];

  return (
    <div className="space-y-3">
      <div className="relative overflow-hidden rounded-2xl border-2 border-art-infographic/35 bg-card shadow-xl">
        <div
          className={`grid aspect-video grid-cols-[1.4fr_1fr] gap-6 ${
            fullscreen ? "p-10" : "p-6 sm:p-8"
          }`}
        >
          <div className="flex min-w-0 flex-col justify-between border-r border-border pr-6">
            <div>
              <p className="text-xs font-bold text-art-infographic">{card.business_unit}</p>
              <h3
                className={`mt-2 font-extrabold leading-tight text-card-foreground ${
                  fullscreen ? "text-3xl" : "text-lg sm:text-xl"
                }`}
              >
                {card.title}
              </h3>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.infographic.mainInsight}</p>
              <p
                className={`mt-1 font-bold leading-snug text-art-infographic ${
                  fullscreen ? "text-2xl" : "text-base sm:text-lg"
                }`}
              >
                {card.core_insight}
              </p>
            </div>

            <div>
              <p className="text-xs font-bold text-muted-foreground">{t.infographic.rolloutPath}</p>
              <p
                className={`mt-1 truncate font-semibold text-card-foreground ${
                  fullscreen ? "text-base" : "text-xs sm:text-sm"
                }`}
              >
                {path}
              </p>
            </div>

            <p className="text-xs text-muted-foreground">
              {card.source} · {card.author} · {card.business_unit}
            </p>
          </div>

          <div className="grid grid-cols-2 content-start gap-3">
            {stats.map((s) => (
              <div key={s.label} className="rounded-xl border border-border bg-secondary/40 p-3">
                <p
                  className={`font-bold text-art-infographic ${fullscreen ? "text-2xl" : "text-lg"}`}
                >
                  {s.value}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{t.infographic.footer}</p>
    </div>
  );
}
