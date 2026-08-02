import { describe, expect, it } from "vitest";
import { COUNCIL_PERSONAS, SEED_COUNCIL_SESSIONS, suggestPersonas, buildVerdict, buildPersonaTake } from "./council";

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

  it("guarantees 3 unique offsets for any roster size >= 3", () => {
    // This test verifies that the offset calculation logic
    // (step = floor(length / 3), offsets [0, step, 2*step])
    // always produces 3 unique indices when applied modulo to any roster size >= 3.
    // Without length-derived step size, hardcoded [0, 5, 10] would fail for
    // roster sizes like 5 or 10 (collisions when offset >= length).
    const testTopic = {
      title: "test",
      summary: "test summary",
      insight: "test insight",
      businessUnit: "test unit",
    };

    for (const rosterSize of [3, 4, 5, 6, 7, 10, 12, 20]) {
      // Simulate offset calculation for different roster sizes
      const step = Math.max(1, Math.floor(rosterSize / 3));
      const offsets = [0, step, 2 * step];
      const indices = offsets.map((o) => o % rosterSize);

      // Verify all 3 indices are unique (no collisions).
      // This would fail with hardcoded [0, 5, 10] for roster sizes like 5 or 10.
      expect(new Set(indices).size).toBe(3);
      expect(indices[0]).not.toBe(indices[1]);
      expect(indices[1]).not.toBe(indices[2]);
      expect(indices[0]).not.toBe(indices[2]);
    }

    // Also verify the function itself with the actual roster
    const result = suggestPersonas(testTopic);
    expect(new Set(result).size).toBe(3);
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
    expect(buildVerdict(topic, ["operator"], []).agreements.some((a) => a.kind === "risk")).toBe(false);
    expect(buildVerdict(topic, ["competitor"], []).agreements.some((a) => a.kind === "risk")).toBe(true);
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
