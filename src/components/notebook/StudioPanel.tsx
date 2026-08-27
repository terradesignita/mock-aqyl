import { useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Copy,
  Download,
  FileDown,
  FileText,
  HelpCircle,
  LayoutGrid,
  Loader2,
  PanelRightClose,
  Maximize2,
  MoreVertical,
  Presentation,
  Radio,
  RefreshCw,
  Sparkle,
  StickyNote,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import type { KnowledgeCardData } from "@/data/mockCards";
import { downloadFile, safeFileName } from "@/lib/utils";
import { BCP47, useI18n, useT, type Dictionary } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ArtifactDialog, type ArtifactContent } from "@/components/notebook/ArtifactDialog";
import { DeckViewer, buildSlides } from "@/components/notebook/artifacts/DeckViewer";
import { PodcastPlayer, buildTranscript } from "@/components/notebook/artifacts/PodcastPlayer";
import { QuizView, buildQuiz } from "@/components/notebook/artifacts/QuizView";
import { CardsDeck, buildInsightCards } from "@/components/notebook/artifacts/CardsDeck";
import { InfographicView } from "@/components/notebook/artifacts/InfographicView";

export interface Note {
  id: string;
  text: string;
  date: string;
}

interface Props {
  card: KnowledgeCardData;
  /** Сколько источников отмечено. 0 — генерировать не из чего. */
  selectedCount: number;
  onSaveNote?: (text: string) => void;
  /** Артефакт собран — попадает в журнал активности. */
  onGenerated?: (title: string) => void;
  onCollapse?: () => void;
}

/** Шаги генерации — показываются, пока артефакт собирается. */
function generationSteps(t: Dictionary) {
  return [t.studio.stepReading, t.studio.stepExtracting, t.studio.stepAssembling];
}

/** Число шагов прогресса — от языка не зависит. */
const GENERATION_STEP_COUNT = 3;

type ArtifactId = "quiz" | "deck" | "report" | "cards" | "podcast" | "infographic";

const ARTIFACTS: {
  id: ArtifactId;
  icon: typeof FileText;
  chip: string;
  edge: string;
  ring: string;
}[] = [
  {
    id: "quiz",
    icon: HelpCircle,
    chip: "bg-art-quiz/12 text-art-quiz",
    edge: "border-art-quiz/45",
    ring: "hover:border-art-quiz/70 hover:bg-art-quiz/6",
  },
  {
    id: "deck",
    icon: Presentation,
    chip: "bg-art-deck/12 text-art-deck",
    edge: "border-art-deck/45",
    ring: "hover:border-art-deck/70 hover:bg-art-deck/6",
  },
  {
    id: "report",
    icon: FileText,
    chip: "bg-art-report/12 text-art-report",
    edge: "border-art-report/45",
    ring: "hover:border-art-report/70 hover:bg-art-report/6",
  },
  {
    id: "cards",
    icon: LayoutGrid,
    chip: "bg-art-cards/12 text-art-cards",
    edge: "border-art-cards/45",
    ring: "hover:border-art-cards/70 hover:bg-art-cards/6",
  },
  {
    id: "podcast",
    icon: Radio,
    chip: "bg-art-podcast/12 text-art-podcast",
    edge: "border-art-podcast/45",
    ring: "hover:border-art-podcast/70 hover:bg-art-podcast/6",
  },
  {
    id: "infographic",
    icon: BarChart3,
    chip: "bg-art-infographic/12 text-art-infographic",
    edge: "border-art-infographic/45",
    ring: "hover:border-art-infographic/70 hover:bg-art-infographic/6",
  },
];

/** Название и подпись артефакта — из словаря локали. */
function artifactMeta(id: ArtifactId, t: Dictionary): { title: string; subtitle: string } {
  switch (id) {
    case "quiz":
      return { title: t.studio.quiz, subtitle: t.studio.quizSubtitle };
    case "deck":
      return { title: t.studio.deck, subtitle: t.studio.deckSubtitle };
    case "report":
      return { title: t.studio.report, subtitle: t.studio.reportSubtitle };
    case "cards":
      return { title: t.studio.cards, subtitle: t.studio.cardsSubtitle };
    case "podcast":
      return { title: t.studio.podcast, subtitle: t.studio.podcastSubtitle };
    case "infographic":
      return { title: t.studio.infographic, subtitle: t.studio.infographicSubtitle };
  }
}

function buildArtifact(id: ArtifactId, card: KnowledgeCardData, t: Dictionary): ArtifactContent {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const descriptions = card.framework?.map((f) => f.description) ?? [];
  const cites = card.citations.map((c) => c.source_anchor);
  const readMin = Math.max(3, Math.round(card.executive_summary.length / 40));
  const a = t.artifactContent;

  switch (id) {
    case "quiz": {
      const questions = 4;
      return {
        intro: a.quizIntro(questions, cites.length),
        metrics: [
          { label: a.quizQuestions, value: String(questions) },
          { label: a.quizPassScore, value: "70%" },
          { label: a.quizFragments, value: String(cites.length) },
        ],
        items: [
          {
            label: a.quizQ1Label,
            text: a.quizQ1(card.title, card.core_insight, cites[0] ?? card.source),
          },
          {
            label: a.quizQ2Label,
            text: a.quizQ2(card.business_unit, card.source, card.author, card.date),
          },
          {
            label: a.quizQ3Label,
            text: steps.length
              ? a.quizQ3Steps(steps.map((step, i) => `${i + 1}. ${step}`).join("\n"))
              : a.quizQ3Fallback,
          },
          { label: a.quizQ4Label, text: a.quizQ4 },
        ],
      };
    }
    case "deck":
      return {
        intro: a.deckIntro(steps.length + 4),
        metrics: [
          { label: a.deckSlides, value: String(steps.length + 4) },
          { label: a.deckDuration, value: a.deckMinutes },
          { label: a.deckAudience, value: card.business_unit },
        ],
        items: [
          { label: a.deckS1Label, text: a.deckS1(card.executive_summary) },
          { label: a.deckS2Label, text: a.deckS2(card.core_insight) },
          ...steps.map((step, i) => ({
            label: a.deckStepLabel(i + 3, i + 1),
            text: `${step}\n${descriptions[i] ?? ""}`.trim(),
          })),
          {
            label: a.deckNextLabel(steps.length + 3 || 5),
            text: a.deckNext(card.business_unit, card.author),
          },
        ],
      };
    case "report":
      return {
        intro: a.reportIntro(card.language, readMin),
        metrics: [
          { label: a.reportSections, value: "5" },
          { label: a.reportSources, value: String(cites.length) },
          { label: a.reportSteps, value: String(steps.length || 3) },
        ],
        items: [
          { label: a.reportSummary, text: card.executive_summary },
          { label: a.reportKey, text: card.core_insight },
          { label: a.reportRisks, text: a.reportRisksBody },
          {
            label: a.reportRecommendations,
            text: steps.length
              ? steps
                  .map(
                    (step, i) => `${i + 1}. ${step} — ${descriptions[i] ?? a.reportOwnerFallback}`,
                  )
                  .join("\n")
              : a.reportRecommendationsFallback,
          },
          {
            label: a.reportSourcesLabel,
            text: cites.length
              ? cites.map((c, i) => `[${i + 1}] ${c}`).join("\n")
              : `${card.source} · ${card.author} · ${card.date}`,
          },
        ],
      };
    case "cards":
      return {
        intro: a.cardsIntro,
        items: [
          { label: a.cardsLabel(1), text: a.cardsQ1(card.core_insight) },
          ...steps.slice(0, 4).map((step, i) => ({
            label: a.cardsLabel(i + 2),
            text: a.cardsQStep(step, descriptions[i] ?? a.cardsStepFallback),
          })),
        ],
      };
    case "podcast":
      return {
        intro: a.podcastIntro,
        metrics: [
          { label: a.podcastChapters, value: "4" },
          { label: a.podcastHosts, value: "2" },
          { label: a.podcastSources, value: String(cites.length) },
        ],
        items: [
          { label: a.podcastIntroLabel, text: a.podcastIntroBody(card.business_unit) },
          { label: a.podcastCaseLabel, text: card.executive_summary },
          { label: a.podcastDebateLabel, text: a.podcastDebate },
          {
            label: a.podcastOutroLabel,
            text: a.podcastOutro(card.core_insight, card.source, card.author, card.date),
          },
        ],
      };
    case "infographic":
      return {
        intro: a.infographicIntro,
        metrics: [
          { label: a.infoSources, value: String(card.citations.length) },
          { label: a.infoSteps, value: steps.length ? String(steps.length) : "—" },
          { label: a.infoLanguage, value: card.language },
          { label: a.infoType, value: t.media[card.media_type] },
          { label: a.infoYear, value: card.date.slice(0, 4) },
        ],
        items: [
          { label: a.infoBlock1, text: card.title },
          { label: a.infoBlock2, text: card.core_insight },
          {
            label: a.infoBlock3,
            text: steps.length ? steps.join(" → ") : a.infoBlock3Fallback,
          },
          {
            label: a.infoBlock4,
            text: `${card.source} · ${card.author} · ${card.business_unit}`,
          },
        ],
      };
  }
}

function toPlainText(title: string, c: ArtifactContent) {
  return [
    title,
    "",
    c.intro ?? "",
    ...(c.metrics?.map((m) => `${m.label}: ${m.value}`) ?? []),
    "",
    ...c.items.map((i) => `• ${i.label ? `${i.label} — ` : ""}${i.text}`),
  ]
    .filter((l, idx, arr) => !(l === "" && arr[idx - 1] === ""))
    .join("\n");
}

export function StudioPanel({ card, selectedCount, onSaveNote, onGenerated, onCollapse }: Props) {
  const [open, setOpen] = useState<ArtifactId | null>(null);
  const [loading, setLoading] = useState<ArtifactId | null>(null);
  const [step, setStep] = useState(0);
  const [regenerating, setRegenerating] = useState(false);
  const [openFullscreen, setOpenFullscreen] = useState(false);
  const [generated, setGenerated] = useState<ArtifactId[]>([]);
  const timersRef = useRef<number[]>([]);
  const t = useT();
  const { locale } = useI18n();
  const bcp47 = BCP47[locale];
  const stageLabels = generationSteps(t);
  const active = ARTIFACTS.find((a) => a.id === open);
  const noContext = selectedCount === 0;
  const busy = loading !== null || regenerating;

  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, []);

  // Пересоздание сбрасывает готовые артефакты: состав контекста изменился.
  useEffect(() => {
    setGenerated([]);
  }, [card.id]);

  const track = (timer: number) => {
    timersRef.current.push(timer);
    return timer;
  };

  const generate = (id: ArtifactId, opts?: { fullscreen?: boolean; regenerate?: boolean }) => {
    // Одна генерация за раз: повторный клик по любой плитке не запускает второй прогон.
    if (busy) return;
    if (noContext) {
      toast.error(t.studio.noContextToast);
      return;
    }
    setOpen(null);
    setLoading(id);
    setStep(0);
    setOpenFullscreen(Boolean(opts?.fullscreen));
    stageLabels.forEach((_, i) => track(window.setTimeout(() => setStep(i), i * 320)));
    track(
      window.setTimeout(() => {
        setLoading(null);
        setGenerated((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setOpen(id);
        onGenerated?.(`${artifactMeta(id, t).title} · ${card.title}`);
        if (opts?.regenerate) toast.success(t.studio.regenerated);
      }, GENERATION_STEP_COUNT * 320),
    );
  };

  /** Пересоздание из просмотрщика: пока идёт — новый запрос не уходит (BUG-22). */
  const regenerate = () => {
    if (regenerating || loading !== null) return;
    setRegenerating(true);
    track(
      window.setTimeout(() => {
        setRegenerating(false);
        toast.success(t.studio.regeneratedByContext);
      }, 900),
    );
  };

  const plainOf = (id: ArtifactId) =>
    toPlainText(`${artifactMeta(id, t).title} — ${card.title}`, buildArtifact(id, card, t));

  const copyArtifact = async (id: ArtifactId) => {
    await navigator.clipboard.writeText(plainOf(id));
    toast.success(t.studio.copiedToast);
  };

  /** Единственная выгрузка: markdown с реальным содержимым артефакта.
   *  Раньше подкаст и презентация отдавали текст под MIME audio/mpeg и pptx —
   *  файлы получались битыми (BUG-23). Аудио и OpenXML собирает бэкенд, его здесь нет. */
  const downloadArtifact = (id: ArtifactId) => {
    const title = artifactMeta(id, t).title;
    downloadFile(plainOf(id), `${safeFileName(`${title}-${card.title}`, id)}.md`);
    toast.success(t.studio.downloadedMd);
  };

  const printArtifact = (id: ArtifactId) => {
    const meta = artifactMeta(id, t);
    const content = buildArtifact(id, card, t);
    const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8">
<title>${esc(meta.title)} — ${esc(card.title)}</title>
<style>
  @page { margin: 18mm; }
  body { font-family: "Golos Text", system-ui, sans-serif; color: #101b2c; line-height: 1.6; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .sub { font-size: 12px; color: #6b7280; margin-bottom: 16px; }
  .intro { font-size: 13px; margin-bottom: 14px; }
  .metrics { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 18px; }
  .metric { border: 1px solid #e5e7eb; border-radius: 10px; padding: 8px 12px; min-width: 110px; }
  .metric b { display: block; font-size: 15px; }
  .metric span { font-size: 11px; color: #6b7280; }
  section { margin-bottom: 14px; page-break-inside: avoid; }
  section h2 { font-size: 12px; color: #0058ff; margin: 0 0 4px; }
  section p { font-size: 13px; white-space: pre-line; margin: 0; }
  footer { margin-top: 24px; font-size: 11px; color: #9ca3af; }
</style></head><body>
<h1>${esc(meta.title)} — ${esc(card.title)}</h1>
<p class="sub">${esc(card.source)} · ${esc(card.author)} · ${esc(card.date)} · ${esc(card.business_unit)}</p>
${content.intro ? `<p class="intro">${esc(content.intro)}</p>` : ""}
${
  content.metrics?.length
    ? `<div class="metrics">${content.metrics
        .map((m) => `<div class="metric"><b>${esc(m.value)}</b><span>${esc(m.label)}</span></div>`)
        .join("")}</div>`
    : ""
}
${content.items
  .map(
    (i) => `<section>${i.label ? `<h2>${esc(i.label)}</h2>` : ""}<p>${esc(i.text)}</p></section>`,
  )
  .join("")}
<footer>BI AQYL · ${esc(t.studio.generatedByAi)} · ${esc(new Date().toLocaleDateString(bcp47))}</footer>
</body></html>`;

    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(html);
    doc.close();
    window.setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => frame.remove(), 1000);
    }, 250);
    toast.success(t.studio.printDialog);
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-4 pb-1 pt-4">
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label={t.studio.collapse}
            title={t.sources.collapseTitle}
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}
        <span className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5 truncate text-base font-bold tracking-tight text-card-foreground">
            {t.studio.title}
          </p>
          <p className="text-xs text-muted-foreground">
            {t.studio.readyOf(generated.length, ARTIFACTS.length)} ·{" "}
            {t.studio.contextCount(selectedCount)}
          </p>
        </span>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto px-3 pb-3">
        {noContext && (
          <p
            role="status"
            className="flex items-start gap-1.5 rounded-xl border border-warning/40 bg-warning/10 px-2.5 py-2 text-xs leading-relaxed text-card-foreground"
          >
            <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-warning" />
            {t.studio.noContext}
          </p>
        )}

        {loading !== null && (
          <div
            aria-live="polite"
            className="rounded-xl border border-primary/40 bg-primary/6 px-3 py-2.5"
          >
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {t.studio.generating(artifactMeta(loading, t).title)}
            </p>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${((step + 1) / GENERATION_STEP_COUNT) * 100}%` }}
              />
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">{stageLabels[step]}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          {ARTIFACTS.map((a) => {
            const Icon = a.icon;
            const isReady = generated.includes(a.id);
            const meta = artifactMeta(a.id, t);
            return (
              <div
                key={a.id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-card transition-colors ${a.edge} ${a.ring}`}
              >
                <button
                  onClick={() => generate(a.id)}
                  disabled={busy || (noContext && !isReady)}
                  title={
                    noContext && !isReady
                      ? t.studio.noContextTitle
                      : busy
                        ? t.studio.busyTitle
                        : meta.title
                  }
                  className="flex flex-1 flex-col items-start gap-2 p-3 pr-8 text-left disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${a.chip}`}>
                    {loading === a.id ? (
                      <Loader2 className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <Icon className="h-4.5 w-4.5" />
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="flex min-w-0 items-center gap-1.5">
                      <span className="truncate text-sm font-semibold text-card-foreground">
                        {meta.title}
                      </span>
                      {isReady && (
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-success"
                        />
                      )}
                    </span>
                    <span
                      className={`block text-xs leading-snug ${
                        loading === a.id
                          ? "font-medium text-primary"
                          : isReady
                            ? "font-medium text-success"
                            : "text-muted-foreground"
                      }`}
                    >
                      {loading === a.id
                        ? t.studio.generatingShort
                        : isReady
                          ? t.studio.ready
                          : meta.subtitle}
                    </span>
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={t.studio.actionsFor(meta.title)}
                      className="absolute right-1.5 top-1.5 rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {meta.title}
                    </DropdownMenuLabel>
                    <DropdownMenuItem
                      disabled={busy || (noContext && !isReady)}
                      onSelect={() => generate(a.id)}
                    >
                      <Wand2 className="h-4 w-4" />
                      {isReady ? t.common.open : t.studio.generate}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={busy || noContext}
                      onSelect={() => generate(a.id, { regenerate: true })}
                    >
                      <RefreshCw className="h-4 w-4" />
                      {t.studio.regenerateMenu}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={busy || (noContext && !isReady)}
                      onSelect={() => generate(a.id, { fullscreen: true })}
                    >
                      <Maximize2 className="h-4 w-4" />
                      {t.studio.openFullscreen}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void copyArtifact(a.id)}>
                      <Copy className="h-4 w-4" />
                      {t.studio.copyText}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => downloadArtifact(a.id)}>
                      <Download className="h-4 w-4" />
                      {t.sources.downloadMd}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => printArtifact(a.id)}>
                      <FileDown className="h-4 w-4" />
                      {t.studio.downloadPdf}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        onSaveNote?.(plainOf(a.id));
                        toast.success(t.workspace.artifactToNotes);
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      {t.studio.saveToNotes}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>

        {active && (
          <ArtifactDialog
            open
            onOpenChange={(v) => !v && setOpen(null)}
            title={artifactMeta(active.id, t).title}
            subtitle={`${artifactMeta(active.id, t).subtitle} · ${card.title}`}
            icon={active.icon}
            content={buildArtifact(active.id, card, t)}
            custom={
              active.id === "report"
                ? undefined
                : (fs) => {
                    switch (active.id) {
                      case "deck":
                        return <DeckViewer slides={buildSlides(card, t)} fullscreen={fs} />;
                      case "podcast":
                        return <PodcastPlayer lines={buildTranscript(card, t)} fullscreen={fs} />;
                      case "quiz":
                        return <QuizView questions={buildQuiz(card, t)} />;
                      case "cards":
                        return <CardsDeck cards={buildInsightCards(card, t)} />;
                      case "infographic":
                        return <InfographicView card={card} fullscreen={fs} />;
                      default:
                        return null;
                    }
                  }
            }
            onSaveNote={onSaveNote}
            onRegenerate={regenerate}
            regenerating={regenerating}
            initialFullscreen={openFullscreen}
            size={active.id === "deck" || active.id === "infographic" ? "wide" : "default"}
          />
        )}
      </div>

      <div className="border-t border-border p-3">
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <Sparkle className="mt-0.5 h-3 w-3 shrink-0 text-accent" />
          {t.studio.aiFooter}
        </p>
      </div>
    </div>
  );
}
