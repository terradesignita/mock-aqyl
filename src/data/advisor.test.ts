import { describe, expect, it } from "vitest";
import {
  buildAnswer,
  buildFollowUpReply,
  buildNegotiationQuestions,
  DILEMMAS,
  type AdvisorSelection,
} from "./advisor";

const empty: AdvisorSelection = { choices: {}, own: {} };

describe("buildAnswer dispatches by dilemma type", () => {
  it("partnership: confident recommendation when terms are known", () => {
    const sel: AdvisorSelection = {
      choices: { proof: ["external"], partner_wants: ["share"], priority: ["speed"] },
      own: {},
    };
    const answer = buildAnswer(DILEMMAS.partnership, sel);
    expect(answer.evidenceLevel).not.toBe("недостаточно данных");
    expect(answer.caseRef.id).toBe("case_dr_johns");
  });

  it("partnership: honest refusal when key terms are unknown, never adds a recommendation afterward", () => {
    const sel: AdvisorSelection = { choices: { proof: ["__unknown"] }, own: {} };
    const answer = buildAnswer(DILEMMAS.partnership, sel);
    expect(answer.evidenceLevel).toBe("недостаточно данных");
    expect(answer.verdict).toBe("Я не могу дать доказательную рекомендацию.");
    expect(answer.verdictDetail).not.toContain("Тем не менее");
    expect(answer.insight).not.toContain("Тем не менее");
    // §15 ТЗ: отказ не отменяет структуру — риски и недостающие данные остаются.
    expect(answer.risks.length).toBeGreaterThan(0);
    expect(answer.missing.length).toBeGreaterThan(0);
  });

  it("sale: uses a distinct verdict, not partnership wording", () => {
    const answer = buildAnswer(DILEMMAS.sale, empty);
    expect(answer.verdict).not.toContain("партнёрство");
  });

  it("unmatched types (scaling, investment, org_model) get an honest weak-analogy answer", () => {
    for (const type of ["scaling", "investment", "org_model"] as const) {
      const answer = buildAnswer(DILEMMAS[type], empty);
      expect(answer.evidenceLevel).toBe("недостаточно данных");
      expect(answer.caseRef.applicability).toBe("Слабая аналогия");
    }
  });
});

describe("follow-up flags recalculate the answer, not just the chat text", () => {
  it("guaranteed volume removes the matching risk from the list", () => {
    const before = buildAnswer(DILEMMAS.partnership, empty);
    expect(before.risks).toContain("партнёр не обеспечит заявленный канал");

    const reply = buildFollowUpReply("А если партнёр гарантирует объём?", before);
    expect(reply.flags?.volumeGuaranteed).toBe(true);

    const after = buildAnswer(DILEMMAS.partnership, empty, reply.flags);
    expect(after.risks).not.toContain("партнёр не обеспечит заявленный канал");
  });

  it("limited exclusivity lowers the risk rating of the exclusive-partnership scenario", () => {
    const before = buildAnswer(DILEMMAS.partnership, empty);
    const scenarioBefore = before.scenarios.find((s) => s.name === "Эксклюзивное партнёрство");
    expect(scenarioBefore?.risk).toBe("Высокий");

    const reply = buildFollowUpReply("Что если эксклюзивность только на один сегмент?", before);
    const after = buildAnswer(DILEMMAS.partnership, empty, reply.flags);
    const scenarioAfter = after.scenarios.find((s) => s.name === "Эксклюзивное партнёрство");
    expect(scenarioAfter?.risk).toBe("Средний");
  });
});

describe("buildNegotiationQuestions covers every dilemma type without crashing", () => {
  for (const type of Object.keys(DILEMMAS) as (keyof typeof DILEMMAS)[]) {
    it(`returns at least one question group for "${type}"`, () => {
      const result = buildNegotiationQuestions(DILEMMAS[type]);
      expect(result.groups.length).toBeGreaterThan(0);
      expect(result.groups[0].questions.length).toBeGreaterThan(0);
    });
  }
});
