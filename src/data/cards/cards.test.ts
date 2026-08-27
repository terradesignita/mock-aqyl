import { describe, expect, it } from "vitest";
import { mockCards } from "@/data/mockCards";
import { cardsEn, cardsKk, cardsFor, cardByIdFor } from "@/data/cards";
import { LOCALES } from "@/lib/i18n/locales";

const CYRILLIC = /[А-Яа-яЁё]/;

describe("переводы карточек", () => {
  it("у каждой карточки есть английский и казахский текст", () => {
    const missingEn = mockCards.filter((c) => !cardsEn[c.id]).map((c) => c.id);
    const missingKk = mockCards.filter((c) => !cardsKk[c.id]).map((c) => c.id);
    expect(missingEn).toEqual([]);
    expect(missingKk).toEqual([]);
  });

  it("в переводах нет лишних id, которых нет в базе", () => {
    const ids = new Set(mockCards.map((c) => c.id));
    expect(Object.keys(cardsEn).filter((id) => !ids.has(id))).toEqual([]);
    expect(Object.keys(cardsKk).filter((id) => !ids.has(id))).toEqual([]);
  });

  it("количество подписей цитат совпадает с количеством цитат", () => {
    for (const card of mockCards) {
      for (const texts of [cardsEn, cardsKk]) {
        const anchors = texts[card.id]?.anchors;
        if (anchors) expect(anchors).toHaveLength(card.citations.length);
      }
    }
  });

  it("шаги фреймворка переведены целиком, а не частично", () => {
    for (const card of mockCards) {
      if (!card.framework) continue;
      for (const texts of [cardsEn, cardsKk]) {
        const framework = texts[card.id]?.framework;
        if (framework) expect(framework).toHaveLength(card.framework.length);
      }
    }
  });

  it("английский текст карточек не содержит кириллицы", () => {
    for (const [id, text] of Object.entries(cardsEn)) {
      const blob = [
        text.title,
        text.executive_summary,
        text.core_insight,
        ...(text.framework?.flatMap((f) => [f.step, f.description]) ?? []),
      ].join(" ");
      expect(CYRILLIC.test(blob), `${id} содержит кириллицу`).toBe(false);
    }
  });

  it("каждая локаль отдаёт полный набор карточек", () => {
    for (const locale of LOCALES) {
      const cards = cardsFor(locale);
      expect(cards).toHaveLength(mockCards.length);
      expect(cards.every((c) => c.title.trim().length > 0)).toBe(true);
    }
  });

  it("карточка по id приходит в языке локали", () => {
    expect(cardByIdFor("en", "card_002")?.title).toBe(
      "Lessons from rolling out BIM on large sites",
    );
    expect(cardByIdFor("ru", "card_002")?.title).toBe("Уроки внедрения BIM на крупных объектах");
    expect(cardByIdFor("kk", "card_002")?.title).toBe("Ірі нысандарда BIM енгізу сабақтары");
  });

  it("карточки с нерусским оригиналом переведены на русский", () => {
    for (const id of ["card_007", "card_012", "card_016"]) {
      expect(CYRILLIC.test(cardByIdFor("ru", id)!.title)).toBe(true);
    }
  });
});
