import { describe, expect, it } from "vitest";
import { COUNCIL_PERSONAS, SEED_COUNCIL_SESSIONS, suggestPersonas } from "./council";

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
});
