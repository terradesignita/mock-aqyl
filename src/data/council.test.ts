import { describe, expect, it } from "vitest";
import {
  COUNCIL_PERSONAS,
  SEED_COUNCIL_SESSIONS,
  buildPersonaTake,
  buildOpeningMessages,
  buildFollowUpReplies,
  hasLikelyDisagreement,
  resolveTopic,
  pickDefaultTrio,
  REACTION_EMOJIS,
} from "./council";
import { ru } from "@/lib/i18n/ru";
import { en } from "@/lib/i18n/en";
import { kk } from "@/lib/i18n/kk";

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
      buildPersonaTake(p.id, topic, ru).forEach(assertClean);
    }
  });

  it("buildOpeningMessages never attributes the disagreement reaction to a real leader", () => {
    buildOpeningMessages(["founder", "contrarian"], topic, ru).forEach((m) => assertClean(m.text));
  });

  it("buildFollowUpReplies never attributes any keyword-rule reply to a real leader", () => {
    buildFollowUpReplies(["resilience"], topic, "Какие риски?", ru).forEach((m) =>
      assertClean(m.text),
    );
    buildFollowUpReplies(["operator"], topic, "Дайте план", ru).forEach((m) => assertClean(m.text));
    buildFollowUpReplies(["contrarian"], topic, "Вы согласны друг с другом?", ru).forEach((m) =>
      assertClean(m.text),
    );
  });
});

describe("COUNCIL_PERSONAS", () => {
  const EXPECTED_REAL_LEADERS = [
    "Илон Маск",
    "Стив Джобс",
    "Джефф Безос",
    "Дженсен Хуанг",
    "Сатья Наделла",
    "Уоррен Баффет",
    "Рэй Далио",
    "Питер Тиль",
    "Эндрю Ын",
    "Демис Хассабис",
    "Сэм Альтман",
    "Айдын Рахимбаев",
  ];

  const FICTIONAL_NAMES = [
    "Артур Ким",
    "Роза Ниязова",
    "Виктор Тен",
    "Лейла Асанова",
    "Данияр Оспанов",
    "Мила Ержанова",
    "Николь Багрова",
    "Самат Ержигитов",
    "Алина Достаева",
    "Тимур Нурланов",
    "Диана Рахимова",
    "Ержан Тулегенов",
  ];

  const EXPECTED_TAGS_BY_ID = {
    founder: "Первые принципы",
    product: "Продукт",
    operator: "Клиент",
    platform: "Полный стек",
    transform: "Трансформация",
    industrialist: "Ценность",
    resilience: "Принципы",
    contrarian: "Контрарианец",
    scale: "AI-практик",
    engineer: "Наука",
    competitor: "Стартап",
    brand: "Девелопмент",
  };

  it("has 12 personas with unique ids", () => {
    expect(COUNCIL_PERSONAS).toHaveLength(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.id)).size).toBe(12);
  });

  it("has unique colors and initials", () => {
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.hex)).size).toBe(12);
    expect(new Set(COUNCIL_PERSONAS.map((p) => p.initials)).size).toBe(12);
  });

  it("uses the approved 12 real-world leader profiles", () => {
    const names = COUNCIL_PERSONAS.map((persona) => ru.personas[persona.id].name);
    expect(names).toEqual(expect.arrayContaining(EXPECTED_REAL_LEADERS));
    expect(names).toHaveLength(12);
    for (const name of FICTIONAL_NAMES) {
      expect(names).not.toContain(name);
    }
  });

  it("gives every leader a unique project-local WebP portrait", () => {
    const images = COUNCIL_PERSONAS.map((persona) => persona.image);
    expect(new Set(images).size).toBe(12);
    for (const image of images) {
      expect(image).toMatch(/^\/personas\/[a-z0-9-]+\.webp$/);
    }
  });

  it("uses the approved tag for every stable persona id", () => {
    expect(Object.fromEntries(COUNCIL_PERSONAS.map((p) => [p.id, ru.personas[p.id].tag]))).toEqual(
      EXPECTED_TAGS_BY_ID,
    );
  });

  it("does not retain the obsolete inspiredBy presentation field", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect("inspiredBy" in p).toBe(false);
    }
  });

  it("exposes the approved public-approach disclaimer", () => {
    expect(ru.personaDisclaimer).toBe(
      "Цифровые модели публично известных подходов. Это не реальные люди и не их текущие или частные мнения.",
    );
  });
});

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  return [
    parseInt(clean.slice(0, 2), 16),
    parseInt(clean.slice(2, 4), 16),
    parseInt(clean.slice(4, 6), 16),
  ];
}

function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((c) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hexA: string, hexB: string): number {
  const a = relativeLuminance(hexA);
  const b = relativeLuminance(hexB);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

// Same sRGB value as oklch(0.221 0.037 258.8) — the dark-theme --card token
// in src/styles.css. Hardcoded here so this test doesn't depend on parsing CSS.
const DARK_CARD_HEX = "#101b2c";

describe("persona color contrast", () => {
  it("every persona hex/darkHex is a valid #rrggbb string", () => {
    const hexPattern = /^#[0-9a-f]{6}$/i;
    for (const p of COUNCIL_PERSONAS) {
      expect(p.hex).toMatch(hexPattern);
      if (p.darkHex) expect(p.darkHex).toMatch(hexPattern);
    }
  });

  it("every persona has a non-empty tag", () => {
    for (const dict of [ru, en, kk]) {
      for (const p of COUNCIL_PERSONAS) {
        expect(dict.personas[p.id].tag.length).toBeGreaterThan(0);
        expect(dict.personas[p.id].name.length).toBeGreaterThan(0);
        expect(dict.personas[p.id].role.length).toBeGreaterThan(0);
        expect(dict.personas[p.id].description.length).toBeGreaterThan(0);
      }
    }
  });

  it("white text on every persona hex clears WCAG AA (4.5:1)", () => {
    for (const p of COUNCIL_PERSONAS) {
      expect(contrastRatio(p.hex, "#ffffff")).toBeGreaterThanOrEqual(4.5);
    }
  });

  it("the border color used in each theme clears 3:1 against the dark card", () => {
    for (const p of COUNCIL_PERSONAS) {
      const darkThemeBorderHex = p.darkHex ?? p.hex;
      expect(contrastRatio(darkThemeBorderHex, DARK_CARD_HEX)).toBeGreaterThanOrEqual(3.0);
    }
  });
});

function toggleInArray(list: string[], value: string): string[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

describe("REACTION_EMOJIS", () => {
  it("has exactly 4 emoji, no duplicates", () => {
    expect(REACTION_EMOJIS).toHaveLength(4);
    expect(new Set(REACTION_EMOJIS).size).toBe(4);
  });

  it("toggling the same emoji twice returns to the original list", () => {
    const start: string[] = [];
    const added = toggleInArray(start, "👍");
    const removed = toggleInArray(added, "👍");
    expect(added).toEqual(["👍"]);
    expect(removed).toEqual([]);
  });

  it("toggling a second emoji keeps the first", () => {
    const afterFirst = toggleInArray([], "👍");
    const afterSecond = toggleInArray(afterFirst, "🔥");
    expect(afterSecond).toEqual(["👍", "🔥"]);
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

  it("builds at least one opening message per persona of a seed session", () => {
    for (const session of SEED_COUNCIL_SESSIONS) {
      const messages = buildOpeningMessages(session.personaIds, resolveTopic(session, ru), ru);
      const authors = new Set(messages.map((m) => m.author));
      for (const id of session.personaIds) {
        expect(authors.has(id)).toBe(true);
      }
    }
  });

  it("builds seed openings in every locale", () => {
    for (const dict of [ru, en, kk]) {
      for (const session of SEED_COUNCIL_SESSIONS) {
        const messages = buildOpeningMessages(
          session.personaIds,
          resolveTopic(session, dict),
          dict,
        );
        expect(messages.length).toBeGreaterThanOrEqual(session.personaIds.length);
        expect(messages.every((m) => m.text.trim().length > 0)).toBe(true);
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
      const messages = buildPersonaTake(p.id, topic, ru);
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
    const messages = buildOpeningMessages(["founder", "operator"], topic, ru);
    const authors = new Set(messages.map((m) => m.author));
    expect(authors.has("founder")).toBe(true);
    expect(authors.has("operator")).toBe(true);
  });

  it("adds a disagreement reaction when a bullish and skeptical persona are both present", () => {
    const messages = buildOpeningMessages(["founder", "contrarian"], topic, ru);
    const reaction = messages.find((m) => m.replyTo === "founder");
    expect(reaction).toBeDefined();
    expect(reaction?.author).toBe("contrarian");
  });

  it("adds no disagreement reaction without a bullish/skeptical pair", () => {
    const messages = buildOpeningMessages(["operator", "engineer"], topic, ru);
    expect(messages.some((m) => m.replyTo)).toBe(false);
  });

  it("every message has a non-empty time string", () => {
    const messages = buildOpeningMessages(["founder", "contrarian"], topic, ru);
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
    const messages = buildFollowUpReplies(
      ["resilience", "operator"],
      topic,
      "Какие тут риски?",
      ru,
    );
    expect(messages.some((m) => m.author === "resilience")).toBe(true);
  });

  it("falls back to the first persona with an honest reply when nothing matches", () => {
    const messages = buildFollowUpReplies(["operator", "engineer"], topic, "асдфасдф", ru);
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

describe("ru.councilTalk.quickReplies", () => {
  it("every quick reply matches a keyword rule when its persona is present", () => {
    const personaIds = ["resilience", "operator", "contrarian"];
    const topic = {
      title: "SpinBrush",
      summary: "Маленькая компания выбирает между ростом, партнёрством и продажей.",
      insight: "Переговорная сила растёт после подтверждения спроса.",
      businessUnit: "Товары для дома",
    };
    for (const reply of ru.councilTalk.quickReplies) {
      const messages = buildFollowUpReplies(personaIds, topic, reply, ru);
      expect(messages.some((m) => m.text !== ru.councilTalk.fallback)).toBe(true);
    }
  });
});
