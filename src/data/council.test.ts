import { describe, expect, it } from "vitest";
import {
  COUNCIL_PERSONAS,
  SEED_COUNCIL_SESSIONS,
  buildPersonaTake,
  buildOpeningMessages,
  buildFollowUpReplies,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
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
      buildPersonaTake(p.id, topic).forEach(assertClean);
    }
  });

  it("buildOpeningMessages never attributes the disagreement reaction to a real leader", () => {
    buildOpeningMessages(["founder", "contrarian"], topic).forEach((m) => assertClean(m.text));
  });

  it("buildFollowUpReplies never attributes any keyword-rule reply to a real leader", () => {
    buildFollowUpReplies(["resilience"], topic, "Какие риски?").forEach((m) => assertClean(m.text));
    buildFollowUpReplies(["operator"], topic, "Дайте план").forEach((m) => assertClean(m.text));
    buildFollowUpReplies(["contrarian"], topic, "Вы согласны друг с другом?").forEach((m) =>
      assertClean(m.text),
    );
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

  it("has at least one opening message per persona in the session", () => {
    for (const session of SEED_COUNCIL_SESSIONS) {
      const authors = new Set(session.messages.map((m) => m.author));
      for (const id of session.personaIds) {
        expect(authors.has(id)).toBe(true);
      }
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
      const messages = buildPersonaTake(p.id, topic);
      expect(messages.length).toBeGreaterThan(0);
      expect(messages.join(" ")).not.toBe(topic.insight);
    }
  });
});

describe("buildOpeningMessages", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("includes at least one message per selected persona", () => {
    const messages = buildOpeningMessages(["founder", "operator"], topic);
    const authors = new Set(messages.map((m) => m.author));
    expect(authors.has("founder")).toBe(true);
    expect(authors.has("operator")).toBe(true);
  });

  it("adds a disagreement reaction when a bullish and skeptical persona are both present", () => {
    const messages = buildOpeningMessages(["founder", "contrarian"], topic);
    const reaction = messages.find((m) => m.replyTo === "founder");
    expect(reaction).toBeDefined();
    expect(reaction?.author).toBe("contrarian");
  });

  it("adds no disagreement reaction without a bullish/skeptical pair", () => {
    const messages = buildOpeningMessages(["operator", "engineer"], topic);
    expect(messages.some((m) => m.replyTo)).toBe(false);
  });

  it("every message has a non-empty time string", () => {
    const messages = buildOpeningMessages(["founder", "contrarian"], topic);
    for (const m of messages) expect(m.time.length).toBeGreaterThan(0);
  });
});

describe("buildFollowUpReplies", () => {
  const topic = {
    title: "SpinBrush",
    summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
    insight: "Переговорная сила растёт после подтверждения спроса.",
    businessUnit: "Товары для дома",
  };

  it("matches a persona by keyword when present in the council", () => {
    const messages = buildFollowUpReplies(["resilience", "operator"], topic, "Какие тут риски?");
    expect(messages.some((m) => m.author === "resilience")).toBe(true);
  });

  it("falls back to the first persona with an honest reply when nothing matches", () => {
    const messages = buildFollowUpReplies(["operator", "engineer"], topic, "асдфасдф");
    expect(messages).toHaveLength(1);
    expect(messages[0].author).toBe("operator");
    expect(messages[0].text.length).toBeGreaterThan(0);
  });
});

describe("hasLikelyDisagreement", () => {
  it("is true only when a bullish and skeptical persona are both present", () => {
    expect(hasLikelyDisagreement(["founder", "contrarian"])).toBe(true);
    expect(hasLikelyDisagreement(["founder", "product"])).toBe(false);
  });
});

describe("pickDefaultTrio", () => {
  it("returns unique valid ids spanning bullish/skeptical/neutral", () => {
    const ids = pickDefaultTrio();
    expect(new Set(ids).size).toBe(ids.length);
    expect(hasLikelyDisagreement(ids)).toBe(true);
  });
});

describe("QUICK_REPLIES", () => {
  it("every quick reply matches a keyword rule when its persona is present", () => {
    const personaIds = ["resilience", "operator", "contrarian"];
    const topic = {
      title: "SpinBrush",
      summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
      insight: "Переговорная сила растёт после подтверждения спроса.",
      businessUnit: "Товары для дома",
    };
    const fallbackText = "По этому конкретному вопросу мне нечего добавить сверх уже сказанного.";
    for (const reply of QUICK_REPLIES) {
      const messages = buildFollowUpReplies(personaIds, topic, reply);
      expect(messages.some((m) => m.text !== fallbackText)).toBe(true);
    }
  });
});
