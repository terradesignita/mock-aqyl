import { describe, expect, it } from "vitest";
import { advisorRu } from "./text.ru";
import { advisorEn } from "./text.en";
import { advisorKk } from "./text.kk";
import { buildAnswer, buildNegotiationQuestions, dilemmasFor } from "@/data/advisor";
import type { AdvisorText } from "./text";

const LOCALES: [string, AdvisorText][] = [
  ["ru", advisorRu],
  ["en", advisorEn],
  ["kk", advisorKk],
];

const CYRILLIC = /[А-Яа-яЁё]/;
const EMPTY_SELECTION = { choices: {}, own: {} };

describe("переводы AI-советника", () => {
  it("во всех локалях описаны одни и те же наборы вопросов", () => {
    const keys = Object.keys(advisorRu.questions).sort();
    for (const [name, t] of LOCALES) {
      expect(Object.keys(t.questions).sort(), name).toEqual(keys);
    }
  });

  it("у каждого вопроса переведены все варианты ответа", () => {
    for (const [name, t] of LOCALES) {
      for (const [key, question] of Object.entries(advisorRu.questions)) {
        const localized = t.questions[key];
        expect(Object.keys(localized.options).sort(), `${name}/${key}`).toEqual(
          Object.keys(question.options).sort(),
        );
        expect(localized.title.trim().length, `${name}/${key}`).toBeGreaterThan(0);
        expect(localized.ownPlaceholder.trim().length, `${name}/${key}`).toBeGreaterThan(0);
      }
    }
  });

  it("ответ собирается во всех локалях и без пустых полей", () => {
    for (const [name, t] of LOCALES) {
      const dilemmas = dilemmasFor(t);
      for (const dilemma of Object.values(dilemmas)) {
        const answer = buildAnswer(dilemma, EMPTY_SELECTION, t);
        expect(answer.verdict.trim().length, `${name}/${dilemma.type}`).toBeGreaterThan(0);
        expect(answer.verdictDetail.trim().length, `${name}/${dilemma.type}`).toBeGreaterThan(0);
        expect(answer.insight.trim().length, `${name}/${dilemma.type}`).toBeGreaterThan(0);
        expect(
          answer.arguments.every((x) => x.trim()),
          `${name}/${dilemma.type}`,
        ).toBe(true);
        expect(answer.scenarios.every((s) => s.name.trim() && s.when.trim())).toBe(true);
      }
    }
  });

  it("вопросы к переговорам покрывают все типы решений", () => {
    for (const [name, t] of LOCALES) {
      const dilemmas = dilemmasFor(t);
      for (const dilemma of Object.values(dilemmas)) {
        const groups = buildNegotiationQuestions(dilemma, t).groups;
        expect(groups.length, `${name}/${dilemma.type}`).toBeGreaterThan(0);
        expect(groups.every((g) => g.title.trim() && g.questions.length > 0)).toBe(true);
      }
    }
  });

  it("в английском тексте советника нет кириллицы", () => {
    const dilemmas = dilemmasFor(advisorEn);
    for (const dilemma of Object.values(dilemmas)) {
      const answer = buildAnswer(dilemma, EMPTY_SELECTION, advisorEn);
      const blob = [
        answer.verdict,
        answer.verdictDetail,
        answer.insight,
        answer.recommendation,
        ...answer.arguments,
        ...answer.risks,
        ...answer.terms,
        ...answer.scenarios.flatMap((s) => [s.name, s.speed, s.control, s.risk, s.when]),
      ].join(" ");
      expect(CYRILLIC.test(blob), dilemma.type).toBe(false);
    }
    for (const question of Object.values(advisorEn.questions)) {
      const blob = [
        question.title,
        question.ownPlaceholder,
        ...Object.values(question.options),
      ].join(" ");
      expect(CYRILLIC.test(blob)).toBe(false);
    }
  });

  it("шаги анализа и примеры переведены во всех локалях", () => {
    for (const [name, t] of LOCALES) {
      expect(t.thinkingSteps, name).toHaveLength(advisorRu.thinkingSteps.length);
      expect(t.examples, name).toHaveLength(advisorRu.examples.length);
      expect(
        t.thinkingSteps.every((x) => x.trim()),
        name,
      ).toBe(true);
      expect(
        t.examples.every((x) => x.trim()),
        name,
      ).toBe(true);
    }
  });

  it("риск, снимаемый гарантией объёма, реально есть в списке рисков", () => {
    for (const [name, t] of LOCALES) {
      expect(t.partnership.risks, name).toContain(t.partnership.riskChannelNotDelivered);
    }
  });
});
