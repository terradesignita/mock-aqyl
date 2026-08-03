import { describe, expect, it } from "vitest";
import {
  COUNCIL_PERSONAS,
  SEED_COUNCIL_SESSIONS,
  suggestPersonas,
  buildVerdict,
  buildPersonaTake,
} from "./council";

describe("real leader names never leak into generated text", () => {
  // "Джек Ма" is deliberately excluded from this stem list — "Ма" is too short
  // a substring to test in Russian text without false positives (it appears
  // inside unrelated words). Manually verified clean during code review instead.
  const LEADER_SURNAME_STEMS = [
    "Маск",
    "Кук",
    "Возняк",
    "Сорос",
    "Баффет",
    "Безос",
    "Брэнсон",
    "Наделл",
    "Эллисон",
    "Уолтон",
    "Барра",
  ];
  const topic = {
    title: "T",
    summary: "S",
    insight: "I",
    businessUnit: "B",
  };

  function assertClean(text: string) {
    for (const stem of LEADER_SURNAME_STEMS) {
      expect(text).not.toContain(stem);
    }
  }

  it("buildPersonaTake never attributes a quote to a real leader", () => {
    for (const p of COUNCIL_PERSONAS) {
      assertClean(buildPersonaTake(p.id, topic));
    }
  });

  it("buildVerdict never attributes synthesis, questions, or tags to a real leader", () => {
    const allIds = COUNCIL_PERSONAS.map((p) => p.id);
    const verdict = buildVerdict(topic, allIds, ["follow-up?"]);
    assertClean(verdict.synthesis);
    verdict.openQuestions.forEach(assertClean);
    verdict.agreements.forEach((a) => assertClean(a.label));
  });
});

describe("COUNCIL_PERSONAS", () => {
  it("has 12 personas with unique ids", () => {
    expect(COUNCIL_PERSONAS).toHaveLength(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.id)).size).toBe(12);
  });

  it("has unique colors and initials", () => {
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.color)).size).toBe(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.initials)).size).toBe(12);
  });

  it("every persona names a real-world style reference", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(p.inspiredBy.length).toBeGreaterThan(0);
    }
  });
});

describe("SEED_COUNCIL_SESSIONS", () => {
  it("references only valid persona ids", () => {
    const validIds = new Set(COUNCIL_PERSONAS.map((p) => p.id));
    for (const session of SEED_COUNCIL_SESSIONS) {
      for (const id of session.personaIds) {
        expect(validIds.has(id)).toBe(true);
      }
    }
  });
});

describe("suggestPersonas", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("is deterministic for the same topic", () => {
    expect(suggestPersonas(topic)).toEqual(suggestPersonas(topic));
  });

  it("returns 3 unique valid persona ids", () => {
    const ids = suggestPersonas(topic);
    const validIds = new Set(COUNCIL_PERSONAS.map((p) => p.id));
    expect(ids).toHaveLength(3);
    expect(new Set(ids).size).toBe(3);
    for (const id of ids) expect(validIds.has(id)).toBe(true);
  });

  it("returns 3 unique valid ids across a variety of topics", () => {
    const topics = [
      { title: "A", summary: "s", insight: "i", businessUnit: "u1" },
      { title: "B", summary: "s", insight: "i", businessUnit: "u2" },
      { title: "SpinBrush", summary: "s", insight: "i", businessUnit: "Товары для дома" },
      { title: "Iz Lynn Chan", summary: "s", insight: "i", businessUnit: "Дальний Восток" },
    ];
    const validIds = new Set(COUNCIL_PERSONAS.map((p) => p.id));
    for (const t of topics) {
      const ids = suggestPersonas(t);
      expect(new Set(ids).size).toBe(3);
      for (const id of ids) expect(validIds.has(id)).toBe(true);
    }
  });
});

describe("buildVerdict", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("uses the topic insight as synthesis before any follow-up", () => {
    expect(buildVerdict(topic, ["operator"], []).synthesis).toBe(topic.insight);
  });

  it("folds the latest follow-up into the synthesis", () => {
    const verdict = buildVerdict(topic, ["operator"], ["А если спрос не подтвердится?"]);
    expect(verdict.synthesis).toContain("А если спрос не подтвердится?");
  });

  it("returns one open question per persona", () => {
    const verdict = buildVerdict(topic, ["operator", "competitor"], []);
    expect(verdict.openQuestions).toHaveLength(2);
  });

  it("adds a risk tag only when a risk-voiced persona is present", () => {
    expect(buildVerdict(topic, ["operator"], []).agreements.some((a) => a.kind === "risk")).toBe(
      false,
    );
    expect(buildVerdict(topic, ["competitor"], []).agreements.some((a) => a.kind === "risk")).toBe(
      true,
    );
  });

  it("has a mapped open question for every persona (no silent insight fallback)", () => {
    for (const p of COUNCIL_PERSONAS) {
      const verdict = buildVerdict(topic, [p.id], []);
      expect(verdict.openQuestions[0]).not.toBe(topic.insight);
    }
  });
});

describe("buildPersonaTake", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("has a distinct case for every persona (no silent default fallback)", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(buildPersonaTake(p.id, topic)).not.toBe(topic.insight);
    }
  });
});
