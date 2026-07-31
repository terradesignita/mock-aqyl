import { HelpHint } from "@/components/HelpHint";
import { useState } from "react";
import {
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
  onSaveNote?: (text: string) => void;
  onCollapse?: () => void;
}

const QUOTES = [
  { text: "Рост начинается в конце вашей зоны комфорта.", author: "Нил Дональд Уолш" },
  { text: "Знание, которым не поделились, не создаёт ценности.", author: "Питер Друкер" },
  { text: "Стратегия без исполнения — просто презентация.", author: "Мортен Хансен" },
];

type ArtifactId = "quiz" | "deck" | "report" | "cards" | "podcast" | "infographic";

const ARTIFACTS: {
  id: ArtifactId;
  title: string;
  subtitle: string;
  icon: typeof FileText;
  chip: string;
  edge: string;
  ring: string;
}[] = [
  {
    id: "quiz",
    title: "Тест",
    subtitle: "Тест на понимание",
    icon: HelpCircle,
    chip: "bg-art-quiz/12 text-art-quiz",
    edge: "border-art-quiz/45",
    ring: "hover:border-art-quiz/70 hover:bg-art-quiz/6",
  },
  {
    id: "deck",
    title: "Презентация",
    subtitle: "Слайды для встречи",
    icon: Presentation,
    chip: "bg-art-deck/12 text-art-deck",
    edge: "border-art-deck/45",
    ring: "hover:border-art-deck/70 hover:bg-art-deck/6",
  },
  {
    id: "report",
    title: "Отчёт",
    subtitle: "Аналитический отчёт",
    icon: FileText,
    chip: "bg-art-report/12 text-art-report",
    edge: "border-art-report/45",
    ring: "hover:border-art-report/70 hover:bg-art-report/6",
  },
  {
    id: "cards",
    title: "Карточки",
    subtitle: "Карточки с выводами",
    icon: LayoutGrid,
    chip: "bg-art-cards/12 text-art-cards",
    edge: "border-art-cards/45",
    ring: "hover:border-art-cards/70 hover:bg-art-cards/6",
  },
  {
    id: "podcast",
    title: "Подкаст",
    subtitle: "Аудио по материалу",
    icon: Radio,
    chip: "bg-art-podcast/12 text-art-podcast",
    edge: "border-art-podcast/45",
    ring: "hover:border-art-podcast/70 hover:bg-art-podcast/6",
  },
  {
    id: "infographic",
    title: "Инфографика",
    subtitle: "Визуальная сводка",
    icon: BarChart3,
    chip: "bg-art-infographic/12 text-art-infographic",
    edge: "border-art-infographic/45",
    ring: "hover:border-art-infographic/70 hover:bg-art-infographic/6",
  },
];

function buildArtifact(id: ArtifactId, card: KnowledgeCardData): ArtifactContent {
  const steps = card.framework?.map((f) => f.step.replace(/^\d+\.\s*/, "")) ?? [];
  const descriptions = card.framework?.map((f) => f.description) ?? [];
  const cites = card.citations.map((c) => c.source_anchor);
  const readMin = Math.max(3, Math.round(card.executive_summary.length / 40));

  switch (id) {
    case "quiz":
      return {
        intro: `5 вопросов · ~4 минуты · проходной балл 70%. Источники: ${cites.length} фрагмента.`,
        metrics: [
          { label: "Вопросов", value: "10" },
          { label: "Проходной балл", value: "70%" },
          { label: "Средний результат", value: "78%" },
        ],
        items: [
          {
            label: "Вопрос 1 · выбор ответа",
            text: `Какой главный вывод материала «${card.title}»?\nA) ${card.core_insight}\nB) Эффект достигается только при полной автоматизации\nC) Метрики не изменяются в первый год\n\nПравильно: A · Обоснование: ${cites[0] ?? card.source}`,
          },
          {
            label: "Вопрос 2 · верно/неверно",
            text: `«Внедрение окупается быстрее в бизнес-юните «${card.business_unit}», если есть выделенный владелец процесса.» — Верно.\nИсточник: ${card.source}, ${card.author}, ${card.date}.`,
          },
          {
            label: "Вопрос 3 · последовательность",
            text: steps.length
              ? `Расставьте шаги внедрения по порядку:\n${steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
              : "Назовите три ограничения применения подхода в контексте BI Group и предложите способ их снятия.",
          },
          {
            label: "Вопрос 4 · открытый",
            text: `Какие 2 метрики вы будете отслеживать в первые 90 дней и какой целевой уровень поставите?`,
          },
        ],
      };
    case "deck":
      return {
        intro: `${steps.length + 4} слайдов · формат 16:9 · спикер-ноты включены.`,
        metrics: [
          { label: "Слайдов", value: String(steps.length + 4) },
          { label: "Длительность", value: "12 мин" },
          { label: "Аудитория", value: card.business_unit },
        ],
        items: [
          {
            label: "Слайд 1 · Контекст",
            text: `${card.executive_summary}\nСпикер-нота: начать с боли текущего процесса, 40 секунд.`,
          },
          {
            label: "Слайд 2 · Ключевой инсайт",
            text: `${card.core_insight}\nВизуал: крупная цифра + сравнение «до/после».`,
          },
          ...steps.map((s, i) => ({
            label: `Слайд ${i + 3} · Шаг ${i + 1}`,
            text: `${s}\n${descriptions[i] ?? ""}`.trim(),
          })),
          {
            label: `Слайд ${steps.length + 3 || 5} · Next steps`,
            text: `Пилот в «${card.business_unit}» — 6 недель · владелец: ${card.author} · чек-поинт через 30 дней · бюджет: в рамках текущего OPEX.`,
          },
        ],
      };
    case "report":
      return {
        intro: `Аналитический отчёт · релевантность ${card.relevance}% · язык оригинала ${card.language} · ~${readMin} мин чтения.`,
        metrics: [
          { label: "Релевантность", value: `${card.relevance}%` },
          { label: "Покрытие цитатами", value: "95%" },
          { label: "Горизонт эффекта", value: "6–12 мес" },
        ],
        items: [
          { label: "Резюме", text: card.executive_summary },
          { label: "Ключевой вывод", text: card.core_insight },
          {
            label: "Риски",
            text: "1. Нехватка владельца процесса на стороне бизнес-юнита.\n2. Данные для метрик собираются вручную — риск искажения baseline.\n3. Сопротивление линейных руководителей на этапе пилота.",
          },
          {
            label: "Рекомендации",
            text: steps.length
              ? steps
                  .map((s, i) => `${i + 1}. ${s} — ${descriptions[i] ?? "ответственный: PMO"}`)
                  .join("\n")
              : "1. Определить baseline метрик.\n2. Запустить пилот на одном объекте.\n3. Зафиксировать эффект и масштабировать.",
          },
          {
            label: "Источники",
            text: cites.length
              ? cites.map((c, i) => `[${i + 1}] ${c}`).join("\n")
              : `${card.source} · ${card.author} · ${card.date}`,
          },
        ],
      };
    case "cards":
      return {
        intro: "Карточки с выводами · листайте горизонтально.",
        items: [
          {
            label: "Карточка 1",
            text: `A: Главный эффект подхода?\nB: ${card.core_insight}`,
          },
          ...steps.slice(0, 4).map((s, i) => ({
            label: `Карточка ${i + 2}`,
            text: `A: Что происходит на шаге «${s}»?\nB: ${descriptions[i] ?? "Фиксируем результат и передаём владельцу процесса."}`,
          })),
        ],
      };
    case "podcast":
      return {
        intro: "Аудио-разбор · два ведущих · транскрипт синхронизирован с аудио.",
        metrics: [
          { label: "Длительность", value: "8:40" },
          { label: "Ведущих", value: "2" },
          { label: "Глав", value: "4" },
        ],
        items: [
          {
            label: "00:00 · Вступление",
            text: `Зачем этот материал бизнес-юниту «${card.business_unit}» и кому его слушать в первую очередь.`,
          },
          {
            label: "01:20 · Разбор кейса",
            text: card.executive_summary,
          },
          {
            label: "04:05 · Спор ведущих",
            text: `Ведущий A: эффект воспроизводим на объектах BI Group. Ведущий B: нужен baseline, иначе цифры не проверить. Компромисс — пилот на 6 недель.`,
          },
          {
            label: "07:10 · Вывод",
            text: `${card.core_insight}\nИсточник: ${card.source}, ${card.author}, ${card.date}.`,
          },
        ],
      };
    case "infographic":
      return {
        intro: "Визуальная сводка одним экраном · подходит для рассылки и дашборда.",
        metrics: [
          { label: "Релевантность", value: `${card.relevance}%` },
          { label: "Источников", value: String(card.citations.length) },
          { label: "Шагов внедрения", value: steps.length ? String(steps.length) : "—" },
          { label: "Язык оригинала", value: card.language },
          { label: "Тип контента", value: card.media_type },
          { label: "Год", value: card.date.slice(0, 4) },
        ],
        items: [
          { label: "Блок 1 · Заголовок", text: card.title },
          { label: "Блок 2 · Цифра-герой", text: card.core_insight },
          {
            label: "Блок 3 · Путь внедрения",
            text: steps.length ? steps.join(" → ") : "Инсайт → пилот → масштабирование",
          },
          {
            label: "Блок 4 · Подпись",
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

export function StudioPanel({ card, onSaveNote, onCollapse }: Props) {
  const [open, setOpen] = useState<ArtifactId | null>(null);
  const [loading, setLoading] = useState<ArtifactId | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [openFullscreen, setOpenFullscreen] = useState(false);
  const [generated, setGenerated] = useState<ArtifactId[]>([]);
  const quote = QUOTES[card.title.length % QUOTES.length];
  const active = ARTIFACTS.find((a) => a.id === open);

  const generate = (id: ArtifactId, opts?: { fullscreen?: boolean; regenerate?: boolean }) => {
    setOpen(null);
    setLoading(id);
    setOpenFullscreen(Boolean(opts?.fullscreen));
    window.setTimeout(() => {
      setLoading(null);
      setGenerated((prev) => (prev.includes(id) ? prev : [...prev, id]));
      setOpen(id);
      if (opts?.regenerate) toast.success("Артефакт пересоздан");
    }, 600);
  };

  const regenerate = () => {
    setRegenerating(true);
    window.setTimeout(() => setRegenerating(false), 600);
  };

  const plainOf = (id: ArtifactId) => {
    const meta = ARTIFACTS.find((a) => a.id === id)!;
    return toPlainText(`${meta.title} — ${card.title}`, buildArtifact(id, card));
  };

  const copyArtifact = async (id: ArtifactId) => {
    await navigator.clipboard.writeText(plainOf(id));
    toast.success("Текст артефакта скопирован");
  };

  const downloadArtifact = (id: ArtifactId) => {
    const blob = new Blob([plainOf(id)], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${id}-${card.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Файл .md скачан");
  };

  const downloadBlob = (data: BlobPart, mime: string, name: string) => {
    const url = URL.createObjectURL(new Blob([data], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadAudio = (id: ArtifactId) => {
    downloadBlob(plainOf(id), "audio/mpeg", `podcast-${card.id}.mp3`);
    toast.success("Аудио подкаста скачивается");
  };

  const downloadDeck = (id: ArtifactId) => {
    downloadBlob(
      plainOf(id),
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      `deck-${card.id}.pptx`,
    );
    toast.success("Презентация .pptx скачивается");
  };

  const printArtifact = (id: ArtifactId) => {
    const meta = ARTIFACTS.find((a) => a.id === id)!;
    const content = buildArtifact(id, card);
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
<footer>BI AQYL · сгенерировано ИИ · ${new Date().toLocaleDateString("ru-RU")}</footer>
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
    toast.success("Открыт диалог печати — сохраните как PDF");
  };

  return (
    <div className="flex h-full flex-col bg-card">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 px-4 pb-1 pt-4">
        {onCollapse && (
          <button
            onClick={onCollapse}
            aria-label="Свернуть панель артефактов"
            title="Свернуть панель"
            className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
          >
            <PanelRightClose className="h-4 w-4" />
          </button>
        )}
        <span className="min-w-0">
          <p className="flex min-w-0 items-center gap-1.5 truncate text-base font-bold tracking-tight text-card-foreground">
            Артефакты
            <HelpHint
              side="bottom"
              text="Готовые форматы на основе выбранных источников: тест, презентация, отчёт, карточки, подкаст, инфографика. «⋮» — перегенерировать, открыть на весь экран или скачать."
            />
          </p>
          <p className="text-xs text-muted-foreground">
            {generated.length} из {ARTIFACTS.length} готово
          </p>
        </span>
      </div>


      <div className="flex-1 space-y-1.5 overflow-y-auto px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {ARTIFACTS.map((a) => {
            const Icon = a.icon;
            const isReady = generated.includes(a.id);
            return (
              <div
                key={a.id}
                className={`group relative flex flex-col overflow-hidden rounded-xl border-2 bg-card transition-colors ${a.edge} ${a.ring}`}
              >
                <button
                  onClick={() => generate(a.id)}
                  disabled={loading !== null}
                  title={a.title}
                  className="flex flex-1 flex-col items-start gap-2 p-3 pr-8 text-left disabled:opacity-60"
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
                        {a.title}
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
                        isReady ? "font-medium text-success" : "text-muted-foreground"
                      }`}
                    >
                      {isReady ? "Готово · открыть" : a.subtitle}
                    </span>
                  </span>
                </button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      aria-label={`Действия — ${a.title}`}
                      className="absolute right-1.5 top-1.5 rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      {a.title}
                    </DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => generate(a.id)}>
                      <Wand2 className="h-4 w-4" />
                      {isReady ? "Открыть" : "Сгенерировать"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => generate(a.id, { regenerate: true })}>
                      <RefreshCw className="h-4 w-4" />
                      Сгенерировать заново
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => generate(a.id, { fullscreen: true })}>
                      <Maximize2 className="h-4 w-4" />
                      Открыть на весь экран
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void copyArtifact(a.id)}>
                      <Copy className="h-4 w-4" />
                      Копировать текст
                    </DropdownMenuItem>
                    {a.id === "podcast" && (
                      <DropdownMenuItem onSelect={() => downloadAudio(a.id)}>
                        <Download className="h-4 w-4" />
                        Скачать аудио
                      </DropdownMenuItem>
                    )}
                    {a.id === "deck" && (
                      <DropdownMenuItem onSelect={() => downloadDeck(a.id)}>
                        <Download className="h-4 w-4" />
                        Скачать PPTX
                      </DropdownMenuItem>
                    )}
                    {(a.id === "report" || a.id === "infographic") && (
                      <>
                        <DropdownMenuItem onSelect={() => downloadArtifact(a.id)}>
                          <Download className="h-4 w-4" />
                          Скачать .md
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => printArtifact(a.id)}>
                          <FileDown className="h-4 w-4" />
                          Скачать PDF
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuItem
                      onSelect={() => {
                        onSaveNote?.(plainOf(a.id));
                        toast.success("Артефакт сохранён в заметки");
                      }}
                    >
                      <StickyNote className="h-4 w-4" />
                      Сохранить в заметки
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
            title={active.title}
            subtitle={`${active.subtitle} · ${card.title}`}
            icon={active.icon}
            content={buildArtifact(active.id, card)}
            custom={
              active.id === "report"
                ? undefined
                : (fs) => {
                    switch (active.id) {
                      case "deck":
                        return <DeckViewer slides={buildSlides(card)} fullscreen={fs} />;
                      case "podcast":
                        return <PodcastPlayer lines={buildTranscript(card)} fullscreen={fs} />;
                      case "quiz":
                        return <QuizView questions={buildQuiz(card)} />;
                      case "cards":
                        return <CardsDeck cards={buildInsightCards(card)} />;
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
        <p className="flex items-center gap-1.5 pb-2 text-xs text-muted-foreground">
          <Sparkle className="h-3 w-3 text-accent" /> Создано с помощью ИИ
        </p>
        <blockquote className="rounded-xl border border-border bg-secondary/50 p-3">
          <p className="text-xs font-medium leading-relaxed text-secondary-foreground">
            {quote.text}
          </p>
          <footer className="mt-1 text-xs text-muted-foreground">— {quote.author}</footer>
        </blockquote>
      </div>
    </div>
  );
}
