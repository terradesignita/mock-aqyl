import type { FrameworkStep, KnowledgeCardData } from "@/data/mockCards";

/**
 * Перевод текстовой части карточки. Структурные поля (id, scope, даты, теги,
 * chunk_id цитат) живут в `mockCards` и не дублируются — переводится только текст.
 */
export interface CardText {
  title: string;
  executive_summary: string;
  core_insight: string;
  framework?: FrameworkStep[];
  /** Подписи цитат по порядку `citations`. */
  anchors?: string[];
  source?: string;
  author?: string;
}

export type CardTexts = Record<string, CardText>;

/** Накладывает перевод на карточку. Без перевода возвращает исходную (язык оригинала). */
export function localizeCard(card: KnowledgeCardData, texts: CardTexts): KnowledgeCardData {
  const text = texts[card.id];
  if (!text) return card;
  return {
    ...card,
    title: text.title,
    executive_summary: text.executive_summary,
    core_insight: text.core_insight,
    framework: text.framework ?? card.framework,
    source: text.source ?? card.source,
    author: text.author ?? card.author,
    citations: text.anchors
      ? card.citations.map((c, i) => ({
          ...c,
          source_anchor: text.anchors?.[i] ?? c.source_anchor,
        }))
      : card.citations,
  };
}
