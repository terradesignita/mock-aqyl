import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import type { Locale } from "@/lib/i18n/locales";
import { cardsEn } from "./en";
import { cardsKk } from "./kk";
import { cardsRu } from "./ru";
import { localizeCard, type CardTexts } from "./types";

export type { CardText, CardTexts } from "./types";
export { localizeCard } from "./types";
export { cardsEn } from "./en";
export { cardsKk } from "./kk";
export { cardsRu } from "./ru";

const TEXTS: Record<Locale, CardTexts> = { ru: cardsRu, en: cardsEn, kk: cardsKk };

/** Карточки базы знаний в выбранном языке. Структура одна, меняется только текст. */
export function cardsFor(locale: Locale): KnowledgeCardData[] {
  const texts = TEXTS[locale];
  return mockCards.map((card) => localizeCard(card, texts));
}

export function cardByIdFor(locale: Locale, id: string): KnowledgeCardData | undefined {
  const card = mockCards.find((c) => c.id === id);
  return card ? localizeCard(card, TEXTS[locale]) : undefined;
}
