import type { KnowledgeCardData } from "@/data/mockCards";
import type { Dictionary } from "@/lib/i18n";

export type SourceKind = "file" | "link";

export interface NotebookSource {
  id: string;
  title: string;
  /** Short one-line meta: type · size / domain · date */
  meta: string;
  kind: SourceKind;
  /** File extension for files, hostname for links */
  format: string;
  size?: string;
  url?: string;
  /** Original citation anchor used in chat citation chips */
  anchor: string;
  /** Reader content: paragraphs / sections */
  sections: { heading: string; body: string }[];
  pages?: number;
  /** Теги, проставленные автоматически при построении вики-страницы. */
  autoTags?: string[];
  /** Факты, выделенные из материала: цифра/тезис + пояснение. */
  facts?: { value: string; label: string }[];
  /** Когда собрана вики-страница и из какого файла. */
  wiki?: { builtAt: string; origin: string; chunks: number };
  /** Фрагмент, который показывается во всплывающей цитате чата. */
  quote?: string;
}

/** Размер задаётся числом байт, чтобы подпись собиралась в языке интерфейса. */
const FILE_FORMAT: Record<KnowledgeCardData["media_type"], { ext: string; bytes: number }> = {
  document: { ext: "PDF", bytes: 2_517_000 },
  video: { ext: "MP4", bytes: 134_218_000 },
  podcast: { ext: "MP3", bytes: 37_749_000 },
  presentation: { ext: "PPTX", bytes: 8_493_000 },
};

function slug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-zа-я0-9]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 38);
}

/**
 * Builds a compact, mixed list of notebook sources: uploaded files plus
 * external links to the underlying materials.
 */
export function buildNotebookSources(card: KnowledgeCardData, t: Dictionary): NotebookSource[] {
  const fmt = FILE_FORMAT[card.media_type];
  const size = formatBytes(fmt.bytes, t);

  return card.citations.map((c, index) => {
    const isLink =
      card.scope === "EXTERNAL" ? index % 2 === 1 : index === card.citations.length - 1;
    const host = card.scope === "EXTERNAL" ? "hbr.org" : "wiki.bi.group";

    const fragment = t.reader.citedFragmentBody(
      c.source_anchor,
      card.author,
      card.business_unit,
      card.language,
      card.date,
    );

    const sections = [
      { heading: t.reader.annotation, body: card.executive_summary },
      { heading: t.reader.keyTakeaway, body: card.core_insight },
      { heading: t.reader.citedFragment, body: fragment },
      ...(card.framework
        ? [
            {
              heading: t.reader.practicalPart,
              body: card.framework
                .map((f, i) => `${i + 1}. ${f.step.replace(/^\d+\.\s*/, "")} — ${f.description}`)
                .join("\n"),
            },
          ]
        : []),
      {
        heading: t.reader.howToApply,
        body: t.reader.howToApplyBody(card.business_unit),
      },
    ];

    const facts: { value: string; label: string }[] = [
      { value: card.date, label: t.reader.factDate },
      { value: card.language, label: t.reader.factLanguage },
      { value: t.media[card.media_type], label: t.reader.factMediaType },
      ...(card.framework
        ? [{ value: String(card.framework.length), label: t.reader.factSteps }]
        : []),
    ];

    return {
      id: c.chunk_id,
      title: c.source_anchor,
      kind: isLink ? "link" : "file",
      autoTags: [...card.tags, card.business_unit],
      facts,
      wiki: {
        builtAt: card.date,
        origin: isLink
          ? `${host}/${slug(card.title)}`
          : `${slug(card.title)}.${fmt.ext.toLowerCase()}`,
        chunks: card.citations.length,
      },
      format: isLink ? host : fmt.ext,
      size: isLink ? undefined : size,
      url: isLink ? `https://${host}/${slug(card.title)}#${c.chunk_id}` : undefined,
      anchor: c.source_anchor,
      pages: isLink ? undefined : 12 + index * 7,
      meta: isLink
        ? `${t.sources.linkLabel} · ${host} · ${card.date}`
        : `${fmt.ext} · ${size} · ${t.media[card.media_type]}`,
      sections,
      quote: fragment,
    } satisfies NotebookSource;
  });
}

/** Форматы, которые платформа принимает. Всё остальное отклоняется на месте (BUG-04).
 *  PPTX и видео — основные форматы тренингов, поэтому принимаются с конвертацией. */
export const ACCEPTED_FORMATS = [
  "pdf",
  "docx",
  "pptx",
  "txt",
  "md",
  "mp3",
  "ogg",
  "wav",
  "m4a",
  "mp4",
  "mov",
] as const;

export const ACCEPTED_ATTR = ACCEPTED_FORMATS.map((f) => `.${f}`).join(",");

const TEXT_FORMATS = ["txt", "md"];
const AUDIO_FORMATS = ["mp3", "ogg", "wav", "m4a"];
const VIDEO_FORMATS = ["mp4", "mov"];

export type SourceFamily = "text" | "document" | "slides" | "audio" | "video";

export function familyOf(name: string): SourceFamily {
  const ext = extensionOf(name);
  if (TEXT_FORMATS.includes(ext)) return "text";
  if (ext === "pptx") return "slides";
  if (AUDIO_FORMATS.includes(ext)) return "audio";
  if (VIDEO_FORMATS.includes(ext)) return "video";
  return "document";
}

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot + 1).toLowerCase();
}

export function isAcceptedFormat(name: string): boolean {
  return (ACCEPTED_FORMATS as readonly string[]).includes(extensionOf(name));
}

export function formatBytes(bytes: number, t: Dictionary): string {
  if (bytes < 1024) return `${bytes} ${t.units.bytes}`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} ${t.units.kilobytes}`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} ${t.units.megabytes}`;
}

/** Разделяет выбранные файлы на принятые и отклонённые — без молчаливых отказов. */
export function triageFiles(files: File[]): { accepted: File[]; rejected: File[] } {
  const accepted: File[] = [];
  const rejected: File[] = [];
  for (const file of files) (isAcceptedFormat(file.name) ? accepted : rejected).push(file);
  return { accepted, rejected };
}

/**
 * Источник из файла, добавленного пользователем. В прототипе содержимое не разбирается —
 * читалка честно об этом говорит вместо выдуманного текста.
 */
export interface UploadRecord {
  id: string;
  title: string;
  format: string;
  size: string;
  date: string;
  /** Имя исходного файла — показываем в мета-строке вики-страницы. */
  fileName?: string;
  /** Что удалось извлечь из содержимого. Пусто для форматов, которые прототип не читает. */
  excerpt?: string;
}

export function uploadedSource(upload: UploadRecord, t: Dictionary): NotebookSource {
  const family = familyOf(upload.fileName ?? `x.${upload.format.toLowerCase()}`);
  const sections = upload.excerpt
    ? [
        { heading: t.reader.sectionStart, body: upload.excerpt },
        { heading: t.reader.sectionHowBuilt, body: t.reader.howBuiltText },
      ]
    : [
        {
          heading: t.reader.sectionContent,
          body: t.reader.notParsed(
            ingestStages(upload.fileName ?? upload.format, t)
              .map((st) => st.label.toLowerCase())
              .join(" → "),
            family === "audio" || family === "video" ? t.reader.kindSpeech : t.reader.kindContent,
          ),
        },
      ];

  return {
    id: upload.id,
    title: upload.title,
    kind: "file",
    format: upload.format,
    size: upload.size,
    anchor: upload.title,
    meta: `${upload.format} · ${upload.size} · ${t.sources.uploadedAt(upload.date)}`,
    autoTags: [t.reader.tagUploadedByYou, t.upload.family[family]],
    facts: [
      { value: upload.format, label: t.reader.format },
      { value: upload.size, label: t.reader.size },
      { value: upload.date, label: t.reader.uploaded },
    ],
    wiki: {
      builtAt: upload.date,
      origin: upload.fileName ?? upload.title,
      chunks: upload.excerpt ? 1 : 0,
    },
    sections,
  };
}

/** Markdown-выгрузка источника — честный файл вместо тоста «загрузка начата» (BUG-23). */
export function sourceToMarkdown(source: NotebookSource, title = source.title): string {
  return [
    `# ${title}`,
    "",
    source.meta,
    ...(source.url ? ["", source.url] : []),
    "",
    ...source.sections.flatMap((s) => [`## ${s.heading}`, "", s.body, ""]),
  ].join("\n");
}

/** Этап обработки материала. В продукте статусы приходят по SSE от ingestion-сервиса. */
export interface IngestStage {
  id: string;
  label: string;
  detail: string;
}

export type StageId =
  | "queued"
  | "converting"
  | "extracting"
  | "parsing"
  | "transcribing"
  | "embedding"
  | "wiki";

/** Цепочка этапов зависит от формата — у аудио своя, у слайдов своя. */
export function stageIdsFor(name: string): StageId[] {
  switch (familyOf(name)) {
    case "audio":
      return ["queued", "transcribing", "embedding", "wiki"];
    case "video":
      return ["queued", "extracting", "transcribing", "embedding", "wiki"];
    case "slides":
      return ["queued", "converting", "parsing", "embedding", "wiki"];
    case "text":
      return ["queued", "embedding", "wiki"];
    default:
      return ["queued", "parsing", "embedding", "wiki"];
  }
}

const STAGE_TEXT: Record<StageId, (t: Dictionary) => { label: string; detail: string }> = {
  queued: (t) => ({ label: t.ingest.queued, detail: t.ingest.queuedDetail }),
  converting: (t) => ({ label: t.ingest.converting, detail: t.ingest.convertingDetail }),
  extracting: (t) => ({ label: t.ingest.extracting, detail: t.ingest.extractingDetail }),
  parsing: (t) => ({ label: t.ingest.parsing, detail: t.ingest.parsingDetail }),
  transcribing: (t) => ({ label: t.ingest.transcribing, detail: t.ingest.transcribingDetail }),
  embedding: (t) => ({ label: t.ingest.embedding, detail: t.ingest.embeddingDetail }),
  wiki: (t) => ({ label: t.ingest.wiki, detail: t.ingest.wikiDetail }),
};

export function ingestStages(name: string, t: Dictionary): IngestStage[] {
  return stageIdsFor(name).map((id) => ({ id, ...STAGE_TEXT[id](t) }));
}

/** `audio_2026-04-07_14-24-15.mp3` → «Аудиозапись от 7 апреля 2026, 14:24» в языке интерфейса. */
function nameFromTimestamp(fileName: string, t: Dictionary, bcp47: string): string | null {
  const match = /(\d{4})-(\d{2})-(\d{2})[_ T-]+(\d{2})[-:.](\d{2})/.exec(fileName);
  if (!match) return null;
  const [, year, month, day, hour, minute] = match;
  const date = new Date(Number(year), Number(month) - 1, Number(day));
  if (Number.isNaN(date.getTime())) return null;
  const when = date.toLocaleDateString(bcp47, { day: "numeric", month: "long", year: "numeric" });
  return t.upload.namedFrom(t.upload.family[familyOf(fileName)], when, `${hour}:${minute}`);
}

/** Человекочитаемое имя из технического: убирает расширение, разделители и служебные префиксы. */
function humanizeFileName(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, "");
  const words = base.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
  if (!words) return fileName;
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Первый заголовок или первое предложение — так называет материал бэкенд после разбора. */
function nameFromContent(text: string): string | null {
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/^#{1,6}\s*/, "").trim();
    if (line.length < 4) continue;
    const sentence = line.split(/(?<=[.!?])\s/)[0].trim();
    const title = sentence.length > 90 ? `${sentence.slice(0, 87)}…` : sentence;
    return title.replace(/[*_`]/g, "");
  }
  return null;
}

/**
 * Название материала по содержимому, а не по имени файла. Текст читаем и берём
 * заголовок; для остального выводим из таймстемпа или причёсываем имя файла.
 * Закрывает наблюдение отчёта про `audio_2026-04-07_14-24-15` в качестве названия.
 */
export async function deriveTitle(file: File, t: Dictionary, bcp47: string): Promise<string> {
  if (TEXT_FORMATS.includes(extensionOf(file.name))) {
    try {
      const fromContent = nameFromContent(await file.text());
      if (fromContent) return fromContent;
    } catch {
      /* не смогли прочитать — падаём в имя файла */
    }
  }
  return nameFromTimestamp(file.name, t, bcp47) ?? humanizeFileName(file.name);
}
