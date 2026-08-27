import { createContext, useContext, useMemo } from "react";
import { cardByIdFor, cardsFor } from "@/data/cards";
import { COUNCIL_PERSONAS, type CouncilPersona } from "@/data/council";
import { ru, type Dictionary } from "./ru";
import { en } from "./en";
import { kk } from "./kk";
import { BCP47, type Locale } from "./locales";

export { LOCALES, LOCALE_META, BCP47, isLocale, type Locale } from "./locales";
export type { Dictionary } from "./ru";

const DICTIONARIES: Record<Locale, Dictionary> = { ru, en, kk };

export function dictionaryFor(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

interface I18nValue {
  locale: Locale;
  t: Dictionary;
  setLocale: (locale: Locale) => void;
  /** Форматирование дат и чисел в выбранной локали. */
  formatDate: (value: Date | number | string) => string;
  formatDateTime: (value: Date | number | string) => string;
}

/** По умолчанию русский — им же отрисовывается серверный HTML до гидратации. */
export const I18nContext = createContext<I18nValue>({
  locale: "ru",
  t: ru,
  setLocale: () => {},
  formatDate: (value) => new Date(value).toLocaleDateString(BCP47.ru),
  formatDateTime: (value) => new Date(value).toLocaleString(BCP47.ru),
});

/** Словарь текущей локали. Обращение — по свойствам, поэтому опечатка не соберётся. */
export function useT(): Dictionary {
  return useContext(I18nContext).t;
}

export function useI18n(): I18nValue {
  return useContext(I18nContext);
}

/** Подпись направления бизнеса в текущей локали. Данные хранят русское значение. */
export function unitLabel(unit: string, t: Dictionary): string {
  return t.businessUnits[unit] ?? unit;
}

/** Карточки базы знаний в текущей локали. */
export function useCards() {
  const { locale } = useI18n();
  return useMemo(() => cardsFor(locale), [locale]);
}

/** Одна карточка в текущей локали. */
export function useCard(id: string) {
  const { locale } = useI18n();
  return useMemo(() => cardByIdFor(locale, id), [locale, id]);
}

/** Подпись тематического тега в текущей локали (ключ — каноническая русская метка). */
export function topicLabel(label: string, t: Dictionary): string {
  return t.topicTags[label]?.label ?? label;
}

export function topicDescription(label: string, t: Dictionary): string {
  return t.topicTags[label]?.description ?? "";
}

/** Подпись тега карточки в текущей локали. */
export function tagLabel(tag: string, t: Dictionary): string {
  return t.cardTags[tag] ?? tag;
}

/** Персона консилиума с подписями в текущей локали. */
export type LocalizedPersona = CouncilPersona & {
  name: string;
  role: string;
  tag: string;
  description: string;
};

export function localizePersona(persona: CouncilPersona, t: Dictionary): LocalizedPersona {
  return { ...persona, ...t.personas[persona.id] };
}

/** Все персоны в текущей локали + точечный доступ по id. */
export function usePersonas() {
  const t = useT();
  return useMemo(() => {
    const list = COUNCIL_PERSONAS.map((p) => localizePersona(p, t));
    const byId = new Map(list.map((p) => [p.id, p]));
    return {
      list,
      /** Неизвестный id — осознанный фолбэк на первую персону, как и раньше. */
      get: (id: string) => byId.get(id) ?? list[0],
    };
  }, [t]);
}
