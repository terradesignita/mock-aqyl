import type { KnowledgeCardData } from "@/data/mockCards";
import { MEDIA_LABELS } from "@/lib/search";

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
}

const FILE_FORMAT: Record<KnowledgeCardData["media_type"], { ext: string; size: string }> = {
  document: { ext: "PDF", size: "2.4 МБ" },
  video: { ext: "MP4", size: "128 МБ" },
  podcast: { ext: "MP3", size: "36 МБ" },
  presentation: { ext: "PPTX", size: "8.1 МБ" },
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
export function buildNotebookSources(card: KnowledgeCardData): NotebookSource[] {
  const fmt = FILE_FORMAT[card.media_type];

  return card.citations.map((c, index) => {
    const isLink = card.scope === "EXTERNAL" ? index % 2 === 1 : index === card.citations.length - 1;
    const host = card.scope === "EXTERNAL" ? "hbr.org" : "wiki.bi.group";

    const sections = [
      {
        heading: "Аннотация",
        body: card.executive_summary,
      },
      {
        heading: "Ключевой вывод",
        body: card.core_insight,
      },
      {
        heading: "Фрагмент, на который ссылается ассистент",
        body: `«${c.source_anchor}». Материал подготовлен: ${card.author}. Направление: ${card.business_unit}. Язык оригинала: ${card.language}. Дата актуализации: ${card.date}.`,
      },
      ...(card.framework
        ? [
            {
              heading: "Практическая часть",
              body: card.framework
                .map((f, i) => `${i + 1}. ${f.step.replace(/^\d+\.\s*/, "")} — ${f.description}`)
                .join("\n"),
            },
          ]
        : []),
      {
        heading: "Как применять в BI Group",
        body: `Материал используется командами направления «${card.business_unit}» при подготовке решений. Рекомендуется сверять выводы с внутренними регламентами и данными по объектам, прежде чем переносить практику на площадку.`,
      },
    ];

    return {
      id: c.chunk_id,
      title: c.source_anchor,
      kind: isLink ? "link" : "file",
      format: isLink ? host : fmt.ext,
      size: isLink ? undefined : fmt.size,
      url: isLink ? `https://${host}/${slug(card.title)}#${c.chunk_id}` : undefined,
      anchor: c.source_anchor,
      pages: isLink ? undefined : 12 + index * 7,
      meta: isLink
        ? `Ссылка · ${host} · ${card.date}`
        : `${fmt.ext} · ${fmt.size} · ${MEDIA_LABELS[card.media_type]}`,
      sections,
    } satisfies NotebookSource;
  });
}
