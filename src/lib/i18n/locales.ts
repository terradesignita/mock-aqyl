export const LOCALES = ["ru", "en", "kk"] as const;

export type Locale = (typeof LOCALES)[number];

export const LOCALE_META: Record<Locale, { code: string; name: string; nativeName: string }> = {
  ru: { code: "RU", name: "Русский", nativeName: "Русский" },
  en: { code: "EN", name: "Английский", nativeName: "English" },
  kk: { code: "KK", name: "Казахский", nativeName: "Қазақша" },
};

/** Тег языка для `<html lang>`, `Intl` и `toLocaleDateString`. */
export const BCP47: Record<Locale, string> = {
  ru: "ru-RU",
  en: "en-US",
  kk: "kk-KZ",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
