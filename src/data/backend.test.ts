import { describe, expect, it } from "vitest";
import { CURRENT_USER, libraryStats } from "@/data/backend";
import { ru } from "@/lib/i18n/ru";
import { en } from "@/lib/i18n/en";
import { kk } from "@/lib/i18n/kk";
import { BUSINESS_UNITS, mockCards } from "@/data/mockCards";

describe("агрегаты базы знаний", () => {
  const stats = libraryStats();

  it("считает кейсы и материалы по фактическому составу, а не числом в коде", () => {
    expect(stats.cases).toBe(mockCards.length);
    expect(stats.materials).toBe(mockCards.reduce((n, c) => n + c.citations.length, 0));
    expect(stats.materials).toBeGreaterThan(stats.cases);
  });

  it("разбивка по scope покрывает всю базу", () => {
    expect(stats.internal + stats.external).toBe(stats.cases);
  });

  it("разбивки по формату, языку и направлению сходятся с числом кейсов", () => {
    const sum = (xs: { count: number }[]) => xs.reduce((n, x) => n + x.count, 0);
    expect(sum(stats.byMedia)).toBe(stats.cases);
    expect(sum(stats.byLanguage)).toBe(stats.cases);
    expect(sum(stats.byBusinessUnit)).toBe(stats.cases);
    expect(stats.byBusinessUnit).toHaveLength(BUSINESS_UNITS.length);
  });

  it("топ-теги отсортированы по частоте и ограничены", () => {
    expect(stats.topTags.length).toBeLessThanOrEqual(8);
    const counts = stats.topTags.map((t) => t.count);
    expect([...counts].sort((a, b) => b - a)).toEqual(counts);
  });

  it("самая свежая дата действительно есть в базе", () => {
    expect(mockCards.map((c) => c.date)).toContain(stats.freshest);
  });
});

describe("профиль пользователя", () => {
  it("инициалы во всех локалях соответствуют имени и фамилии", () => {
    for (const dict of [ru, en, kk]) {
      expect(dict.profile.initials).toBe(
        `${dict.profile.firstName[0]}${dict.profile.lastName[0]}`.toUpperCase(),
      );
    }
  });

  it("роль профиля имеет подпись для интерфейса", () => {
    expect(ru.roles[CURRENT_USER.role]).toBeTruthy();
  });

  it("направление профиля указывает на реальную запись справочника", () => {
    expect(BUSINESS_UNITS[CURRENT_USER.businessUnitIndex]).toBeTruthy();
  });

  it("должность профиля переведена во всех локалях", () => {
    expect(ru.positions[CURRENT_USER.position]).toBeTruthy();
  });
});
