import { describe, expect, it } from "vitest";
import { COUNCIL_PERSONAS, SEED_COUNCIL_SESSIONS } from "./council";

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
