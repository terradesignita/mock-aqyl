import { describe, expect, it } from "vitest";
import { ru } from "./ru";
import { en } from "./en";
import { kk } from "./kk";
import { LOCALES, LOCALE_META, BCP47, isLocale } from "./locales";
import { pluralEn, pluralRu } from "./plural";

const CYRILLIC = /[А-Яа-яЁё]/;

/** Пути всех строковых листьев словаря — для сверки структуры между локалями. */
function stringPaths(value: unknown, prefix = ""): string[] {
  if (typeof value === "string") return [prefix];
  if (Array.isArray(value)) return value.flatMap((v, i) => stringPaths(v, `${prefix}[${i}]`));
  if (value && typeof value === "object" && !(value instanceof RegExp)) {
    return Object.entries(value).flatMap(([k, v]) => stringPaths(v, prefix ? `${prefix}.${k}` : k));
  }
  return [];
}

describe("словари локалей", () => {
  it("объявлены три локали с метаданными и тегами языка", () => {
    expect(LOCALES).toEqual(["ru", "en", "kk"]);
    for (const locale of LOCALES) {
      expect(LOCALE_META[locale].code).toMatch(/^[A-Z]{2}$/);
      expect(LOCALE_META[locale].nativeName.trim().length).toBeGreaterThan(0);
      expect(BCP47[locale]).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      expect(isLocale(locale)).toBe(true);
    }
    expect(isLocale("de")).toBe(false);
  });

  it("структура строк совпадает во всех локалях", () => {
    // Словари поисковых стем (classifyWords, lookupPrefixes) намеренно разной длины:
    // разным языкам нужно разное число корней. Сверяем всё остальное.
    const variable = /^(advisorText\.)?(classifyWords|lookupPrefixes)/;
    const paths = (dict: unknown) =>
      stringPaths(dict)
        .filter((path) => !variable.test(path))
        .sort();
    const base = paths(ru);
    expect(paths(en)).toEqual(base);
    expect(paths(kk)).toEqual(base);
  });

  it("нет пустых строк ни в одной локали", () => {
    for (const [name, dict] of [
      ["ru", ru],
      ["en", en],
      ["kk", kk],
    ] as const) {
      const empty = stringPaths(dict).filter((path) => {
        const value = path
          .replace(/\[(\d+)\]/g, ".$1")
          .split(".")
          .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], dict);
        return typeof value === "string" && value.trim().length === 0;
      });
      expect(empty, `${name}: пустые строки`).toEqual([]);
    }
  });

  it("в английском словаре нет кириллицы, кроме шаблонов поиска и ключей данных", () => {
    const allowed =
      /^(classifyWords|known\.patterns|followUp|councilTalk\.keywords|businessUnits|topicTags|cardTags|evidence|applicability|advisorText\.(classifyWords|known|followUp|evidence|applicability|sourceKinds|influence))/;
    const leaks = stringPaths(en).filter((path) => {
      if (allowed.test(path)) return false;
      const value = path
        .replace(/\[(\d+)\]/g, ".$1")
        .split(".")
        .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], en);
      return typeof value === "string" && CYRILLIC.test(value);
    });
    expect(leaks).toEqual([]);
  });
});

describe("правила плюрализации", () => {
  it("русский выбирает форму по последним разрядам", () => {
    const forms = (n: number) => pluralRu(n, "файл", "файла", "файлов");
    expect(forms(1)).toBe("файл");
    expect(forms(2)).toBe("файла");
    expect(forms(5)).toBe("файлов");
    expect(forms(11)).toBe("файлов");
    expect(forms(21)).toBe("файл");
    expect(forms(112)).toBe("файлов");
  });

  it("английский различает только единственное и множественное", () => {
    expect(pluralEn(1, "file", "files")).toBe("file");
    expect(pluralEn(0, "file", "files")).toBe("files");
    expect(pluralEn(21, "file", "files")).toBe("files");
  });

  it("казахский не изменяет существительное после числа", () => {
    expect(kk.card.filesCount(1)).toBe("1 файл");
    expect(kk.card.filesCount(5)).toBe("5 файл");
  });
});
