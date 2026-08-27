/**
 * Мок-слой того, что в продукте отдаёт бэкенд: профиль пользователя из SSO,
 * состав базы знаний и агрегаты активности. Здесь нет сети — цифры считаются
 * из реальных данных прототипа и реальных действий пользователя, чтобы экран
 * метрик не показывал нули при непустой базе.
 */
import { BUSINESS_UNITS, mockCards, type Lang, type MediaType } from "@/data/mockCards";

/** Профиль из корпоративного SSO (BILife / Keycloak). */
export interface UserProfile {
  /** Сырой логин из каталога — показываем только там, где он уместен.
   *  Имя и инициалы живут в словаре: в разных языках они транслитерируются. */
  login: string;
  email: string;
  /** Ключ должности в словаре — сама подпись зависит от языка. */
  position: "developmentDirector";
  /** Индекс направления в BUSINESS_UNITS — подпись берётся из словаря. */
  businessUnitIndex: number;
  /** Роль доступа: viewer / editor / owner / admin. */
  role: "viewer" | "editor" | "owner" | "admin";
}

export const CURRENT_USER: UserProfile = {
  login: "Abenov_m",
  email: "abenov_m@bi.group",
  position: "developmentDirector",
  businessUnitIndex: 3,
  role: "editor",
};

/** Состав базы знаний — считается из карточек, а не задаётся числом. */
export interface LibraryStats {
  cases: number;
  materials: number;
  businessUnits: number;
  internal: number;
  external: number;
  byMedia: { type: MediaType; count: number }[];
  byLanguage: { lang: Lang; count: number }[];
  byBusinessUnit: { unit: string; count: number }[];
  topTags: { tag: string; count: number }[];
  /** Самая свежая дата актуализации материала в базе. */
  freshest: string;
}

export function libraryStats(): LibraryStats {
  const media = new Map<MediaType, number>();
  const langs = new Map<Lang, number>();
  const units = new Map<string, number>();
  const tags = new Map<string, number>();

  for (const card of mockCards) {
    media.set(card.media_type, (media.get(card.media_type) ?? 0) + 1);
    langs.set(card.language, (langs.get(card.language) ?? 0) + 1);
    units.set(card.business_unit, (units.get(card.business_unit) ?? 0) + 1);
    for (const tag of card.tags) tags.set(tag, (tags.get(tag) ?? 0) + 1);
  }

  return {
    cases: mockCards.length,
    materials: mockCards.reduce((sum, c) => sum + c.citations.length, 0),
    businessUnits: units.size,
    internal: mockCards.filter((c) => c.scope === "INTERNAL").length,
    external: mockCards.filter((c) => c.scope === "EXTERNAL").length,
    byMedia: [...media.entries()]
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count),
    byLanguage: [...langs.entries()]
      .map(([lang, count]) => ({ lang, count }))
      .sort((a, b) => b.count - a.count),
    byBusinessUnit: BUSINESS_UNITS.map((unit) => ({ unit, count: units.get(unit) ?? 0 })).sort(
      (a, b) => b.count - a.count,
    ),
    topTags: [...tags.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
      .slice(0, 8),
    freshest:
      mockCards
        .map((c) => c.date)
        .sort()
        .at(-1) ?? "—",
  };
}
