# Консилиум как живой групповой чат — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild Консилиум (`src/routes/council.tsx`) from a "verdict/synthesis panel" into a live-feeling group-chat messenger — timestamps, read receipts, multi-message bursts, typing indicators, opportunistic disagreement between personas, and a WhatsApp/Telegram-style "pick people, then topic" creation flow.

**Architecture:** New `CouncilChatMessage[]` replaces `followUps: string[]` as the session's content. Data generation stays in deterministic pure functions in `src/data/council.ts` (no LLM, no new runtime). The typing-indicator/staggered-reveal illusion lives entirely in `SessionView`'s local component state — the data layer writes all messages for a turn synchronously; the UI reveals new ones one at a time with `setTimeout`, exactly mirroring `AdvisorFlow.runThinking`'s existing cascade pattern in this codebase.

**Tech Stack:** React 19, TypeScript, Tailwind v4, Vitest. No new dependencies.

## Global Constraints

- Persona names stay fictional ("в духе" a real leader, named only in `inspiredBy`, never as an attributed quote source) — every new function must pass the existing `council.test.ts` guardrail describe block, extended to cover the new functions.
- No new dependencies, no new runtime (no Zustand, no JSON scenario engine) — plain functions and React state, per the spec's stack-adaptation table.
- Typing delay 600–1400ms, message delay 1000–2500ms (spec §"Что переносится из ТЗ без изменений").
- `MAX_PERSONAS = 3` (existing constant in `council.tsx`) still applies to both the new contacts step and the existing "Изменить состав" picker.
- All `setTimeout` chains driving the reveal animation must be cleared on unmount and on session switch — no leaked timers, no cross-session bleed (motivated by the already-fixed stuck-timer bug in `src/hooks/useResizablePanel.ts`).

---

### Task 1: Data model — `CouncilChatMessage`, opening/follow-up generation, remove verdict functions

**Files:**
- Modify: `src/data/council.ts` (whole file — see exact replacement below)
- Modify: `src/data/council.test.ts` (whole file — see exact replacement below)

**Interfaces:**
- Produces: `CouncilChatMessage { id: string; author: "user" | string; text: string; time: string; replyTo?: string }`
- Produces: `CouncilSession.messages: CouncilChatMessage[]` (replaces `followUps: string[]`)
- Produces: `buildPersonaTake(personaId: string, topic: CouncilTopic): string[]` (return type changed from `string`)
- Produces: `buildOpeningMessages(personaIds: string[], topic: CouncilTopic): CouncilChatMessage[]`
- Produces: `buildFollowUpReplies(personaIds: string[], topic: CouncilTopic, followUpText: string): CouncilChatMessage[]`
- Produces: `hasLikelyDisagreement(personaIds: string[]): boolean`
- Produces: `pickDefaultTrio(): string[]`
- Removes: `CouncilVerdict`, `buildVerdict`, `buildAgreements`, `formatVerdictForCopy`, `PERSONA_QUESTIONS`, `RISK_PERSONAS`, `suggestPersonas`, `hashString` — nothing outside this file references them after Tasks 3–5 land, and this task's own test file drops their tests.

- [ ] **Step 1: Replace `src/data/council.ts` entirely**

```ts
export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Реальный лидер — только как отсылка к стилю в bio. Никогда не источник цитаты. */
  inspiredBy: string;
  color: string;
}

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // Цвета подобраны на контраст ≥4.5:1 с белым текстом инициалов (WCAG AA).
  {
    id: "founder",
    name: "Артур Ким",
    initials: "AK",
    role: "Визионер-фаундер",
    inspiredBy: "Илона Маска",
    color: "bg-amber-700",
  },
  {
    id: "operator",
    name: "Роза Ниязова",
    initials: "RN",
    role: "Операционный директор",
    inspiredBy: "Тима Кука",
    color: "bg-violet-600",
  },
  {
    id: "engineer",
    name: "Виктор Тен",
    initials: "VT",
    role: "Инженер-прагматик",
    inspiredBy: "Стива Возняка",
    color: "bg-blue-600",
  },
  {
    id: "contrarian",
    name: "Лейла Асанова",
    initials: "LA",
    role: "Контрарианка-инвестор",
    inspiredBy: "Джорджа Сороса",
    color: "bg-teal-700",
  },
  {
    id: "industrialist",
    name: "Данияр Оспанов",
    initials: "DO",
    role: "Промышленник",
    inspiredBy: "Уоррена Баффета",
    color: "bg-orange-700",
  },
  {
    id: "product",
    name: "Мила Ержанова",
    initials: "ME",
    role: "Продакт-лидер",
    inspiredBy: "Джеффа Безоса",
    color: "bg-fuchsia-600",
  },
  {
    id: "brand",
    name: "Николь Багрова",
    initials: "NB",
    role: "Бренд-стратег",
    inspiredBy: "Ричарда Брэнсона",
    color: "bg-rose-700",
  },
  {
    id: "platform",
    name: "Самат Ержигитов",
    initials: "SE",
    role: "Платформенный стратег",
    inspiredBy: "Сатьи Наделлы",
    color: "bg-indigo-600",
  },
  {
    id: "competitor",
    name: "Алина Достаева",
    initials: "AD",
    role: "Директор по M&A",
    inspiredBy: "Ларри Эллисона",
    color: "bg-red-700",
  },
  {
    id: "resilience",
    name: "Тимур Нурланов",
    initials: "TN",
    role: "Директор по устойчивости",
    inspiredBy: "Джека Ма",
    color: "bg-cyan-700",
  },
  {
    id: "scale",
    name: "Диана Рахимова",
    initials: "DR",
    role: "Операционная эффективность",
    inspiredBy: "Сэма Уолтона",
    color: "bg-emerald-700",
  },
  {
    id: "transform",
    name: "Ержан Тулегенов",
    initials: "ET",
    role: "Директор по трансформации",
    inspiredBy: "Мэри Барра",
    color: "bg-stone-600",
  },
];

export function getPersona(id: string): CouncilPersona {
  return COUNCIL_PERSONAS.find((p) => p.id === id) ?? COUNCIL_PERSONAS[0];
}

export interface CouncilTopic {
  title: string;
  summary: string;
  insight: string;
  businessUnit: string;
}

export interface CouncilChatMessage {
  id: string;
  /** "user" или id персоны из COUNCIL_PERSONAS. */
  author: "user" | string;
  text: string;
  /** "ЧЧ:ММ" — тот же паттерн, что уже используется в NotebookChat.tsx. */
  time: string;
  /** id персоны, на чью реплику это реакция — рендерится как "отвечает <Имя>". */
  replyTo?: string;
}

export interface CouncilSession {
  id: string;
  title: string;
  date: string;
  personaIds: string[];
  messages: CouncilChatMessage[];
  unread?: boolean;
  topic: CouncilTopic;
}

function makeMessageId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function nowTime(): string {
  return new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
}

/** Персоны, у которых инстинктивная позиция — "действовать быстрее". */
const BULLISH = new Set(["founder", "product", "platform"]);
/** Персоны, у которых инстинктивная позиция — "сначала проверить, потом отдавать контроль". */
const SKEPTICAL = new Set(["contrarian", "competitor", "resilience"]);

export function hasLikelyDisagreement(personaIds: string[]): boolean {
  return personaIds.some((id) => BULLISH.has(id)) && personaIds.some((id) => SKEPTICAL.has(id));
}

/** Гарантированно разнообразная тройка по умолчанию — не завязана на тему, т.к. на шаге выбора персон темы ещё нет. */
export function pickDefaultTrio(): string[] {
  const bullish = COUNCIL_PERSONAS.find((p) => BULLISH.has(p.id));
  const skeptical = COUNCIL_PERSONAS.find((p) => SKEPTICAL.has(p.id));
  const neutral = COUNCIL_PERSONAS.find((p) => !BULLISH.has(p.id) && !SKEPTICAL.has(p.id));
  return [bullish, skeptical, neutral]
    .filter((p): p is CouncilPersona => Boolean(p))
    .map((p) => p.id);
}

export const SEED_COUNCIL_SESSIONS: CouncilSession[] = [
  {
    id: "seed-1",
    title: "Iz Lynn Chan at Far East Organization (Abridged)",
    date: "30.07.2026",
    personaIds: ["founder", "contrarian", "transform"],
    topic: {
      title: "Iz Lynn Chan at Far East Organization (Abridged)",
      summary:
        "Региональный директор должна решить, продвигать ли local-hire менеджера в обход более опытного экспата, балансируя результативность и организационные ожидания.",
      insight:
        "Формальный стаж не гарантирует результат — решение о повышении должно опираться на измеримый вклад, а не на срок работы.",
      businessUnit: "Дальний Восток",
    },
    messages: [],
  },
  {
    id: "seed-2",
    title: "SpinBrush",
    date: "28.07.2026",
    personaIds: ["operator", "competitor", "resilience"],
    unread: true,
    topic: {
      title: "SpinBrush",
      summary:
        "Маленькая компания с быстро растущим продуктом выбирает между самостоятельным ростом, партнёрством с крупным игроком и продажей бизнеса.",
      insight:
        "Переговорная сила резко возрастает после подтверждения внешнего спроса — до этого момента долгосрочные права лучше не отдавать.",
      businessUnit: "Товары для дома",
    },
    messages: [],
  },
];

// Seed sessions' opening messages are generated after buildOpeningMessages is
// defined below (function declarations are hoisted, but this keeps the seed
// data readable top-to-bottom without relying on hoisting for clarity).
SEED_COUNCIL_SESSIONS[0].messages = buildOpeningMessages(
  SEED_COUNCIL_SESSIONS[0].personaIds,
  SEED_COUNCIL_SESSIONS[0].topic,
);
SEED_COUNCIL_SESSIONS[1].messages = buildOpeningMessages(
  SEED_COUNCIL_SESSIONS[1].personaIds,
  SEED_COUNCIL_SESSIONS[1].topic,
);

/** 1-2 короткие реплики на персону (не абзац) — материал для группового чата. */
export function buildPersonaTake(personaId: string, topic: CouncilTopic): string[] {
  switch (personaId) {
    case "founder":
      return [
        `Смело: ${topic.insight}`,
        `Если это не меняет правила игры на горизонте 10 лет — не стоит тратить на это ресурсы.`,
      ];
    case "operator":
      return [
        `Операционно: ${topic.summary}`,
        `Без чёткого владельца процесса и метрик это не повторится на масштабе «${topic.businessUnit}».`,
      ];
    case "engineer":
      return [
        `Технически: прежде чем говорить про «${topic.title}», нужно проверить, что это вообще реализуемо без скрытых допущений.`,
      ];
    case "contrarian":
      return [
        `Контрарианский взгляд: рынок наверняка уже заложил обратное — ${topic.insight.toLowerCase()}`,
        `Стоит поставить на то, где консенсус ошибается.`,
      ];
    case "industrialist":
      return [
        `Долгий горизонт: репутация «${topic.businessUnit}» стоит дороже быстрой выгоды.`,
        `${topic.insight} Спешить не буду.`,
      ];
    case "product":
      return [
        `С точки зрения клиента: ${topic.summary}`,
        `Если это не улучшает жизнь конечного пользователя — вопрос ещё не решён.`,
      ];
    case "brand":
      return [
        `История имеет значение: как мы объясним «${topic.title}» людям внутри и снаружи компании?`,
        `${topic.insight}`,
      ];
    case "platform":
      return [
        `Экосистемно: кто ещё выигрывает от «${topic.title}», если мы пойдём этим путём?`,
        `В «${topic.businessUnit}» партнёрства важнее, чем контроль над каждым шагом.`,
      ];
    case "competitor":
      return [
        `Конкурентно: ${topic.insight}`,
        `Если мы не сделаем этот шаг первыми, это сделает кто-то другой в «${topic.businessUnit}».`,
      ];
    case "resilience":
      return [
        `Через призму устойчивости: регуляторная и рыночная турбулентность рано или поздно ударит по «${topic.businessUnit}» — вопрос, готовы ли мы адаптироваться быстрее других.`,
      ];
    case "scale":
      return [
        `Эффективность прежде всего: ${topic.summary}`,
        `Каждый лишний доллар издержек на масштабе «${topic.businessUnit}» — упущенная маржа.`,
      ];
    case "transform":
      return [
        `Трансформационно: старые процессы в «${topic.businessUnit}» не переживут это решение без изменений в культуре.`,
        `${topic.insight}`,
      ];
    default:
      return [topic.insight];
  }
}

function buildDisagreement(skepticId: string, bullishFirstName: string): string {
  switch (skepticId) {
    case "contrarian":
      return `${bullishFirstName}, а вы уверены, что рынок ещё не отыграл это заранее?`;
    case "competitor":
      return `${bullishFirstName}, оптимизм — это хорошо, но кто-то из конкурентов уже наверняка думает о том же.`;
    case "resilience":
      return `${bullishFirstName}, красиво, но что будет с этим планом, если условия резко изменятся?`;
    default:
      return `${bullishFirstName}, я бы не спешил.`;
  }
}

/** Стартовые реплики при создании сессии: 1-2 сообщения на персону + опциональная реакция несогласия. */
export function buildOpeningMessages(
  personaIds: string[],
  topic: CouncilTopic,
): CouncilChatMessage[] {
  const messages: CouncilChatMessage[] = [];
  for (const id of personaIds) {
    for (const text of buildPersonaTake(id, topic)) {
      messages.push({ id: makeMessageId(), author: id, text, time: nowTime() });
    }
  }
  const bullishId = personaIds.find((id) => BULLISH.has(id));
  const skepticalId = personaIds.find((id) => SKEPTICAL.has(id));
  if (bullishId && skepticalId) {
    messages.push({
      id: makeMessageId(),
      author: skepticalId,
      text: buildDisagreement(skepticalId, getPersona(bullishId).name.split(" ")[0]),
      time: nowTime(),
      replyTo: bullishId,
    });
  }
  return messages;
}

const KEYWORD_RULES: {
  test: RegExp;
  personaId: string;
  reply: (topic: CouncilTopic) => string;
}[] = [
  {
    test: /риск/i,
    personaId: "resilience",
    reply: (t) => `Риск главный: «${t.businessUnit}» не прощает недооценённых сценариев.`,
  },
  {
    test: /план|дальше|шаг/i,
    personaId: "operator",
    reply: () => `Первый шаг — назначить владельца процесса, без этого любой план стоит на месте.`,
  },
  {
    test: /согласны|друг с другом|спор/i,
    personaId: "contrarian",
    reply: () => `Не совсем — именно в этом и смысл: если бы все соглашались, совет был бы не нужен.`,
  },
];

/** Ответы на follow-up: 1+ персоны отвечают по ключевым словам, либо честный фолбэк, если нет совпадений. */
export function buildFollowUpReplies(
  personaIds: string[],
  topic: CouncilTopic,
  followUpText: string,
): CouncilChatMessage[] {
  const matched = KEYWORD_RULES.filter(
    (rule) => rule.test.test(followUpText) && personaIds.includes(rule.personaId),
  );
  if (matched.length > 0) {
    return matched.map((rule) => ({
      id: makeMessageId(),
      author: rule.personaId,
      text: rule.reply(topic),
      time: nowTime(),
    }));
  }
  return [
    {
      id: makeMessageId(),
      author: personaIds[0],
      text: "По этому конкретному вопросу мне нечего добавить сверх уже сказанного.",
      time: nowTime(),
    },
  ];
}

export const QUICK_REPLIES = [
  "Какие главные риски?",
  "Что бы вы сделали первым?",
  "Вы согласны друг с другом?",
  "Дайте конкретный план",
];
```

- [ ] **Step 2: Replace `src/data/council.test.ts` entirely**

```ts
import { describe, expect, it } from "vitest";
import {
  COUNCIL_PERSONAS,
  SEED_COUNCIL_SESSIONS,
  buildPersonaTake,
  buildOpeningMessages,
  buildFollowUpReplies,
  hasLikelyDisagreement,
  pickDefaultTrio,
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

  it("buildOpeningMessages never attributes a message to a real leader", () => {
    const allIds = COUNCIL_PERSONAS.map((p) => p.id);
    buildOpeningMessages(allIds.slice(0, 3), topic).forEach((m) => assertClean(m.text));
  });

  it("buildFollowUpReplies never attributes a message to a real leader", () => {
    const allIds = COUNCIL_PERSONAS.map((p) => p.id);
    buildFollowUpReplies(allIds.slice(0, 3), topic, "Какие риски?").forEach((m) =>
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
```

- [ ] **Step 3: Run tests**

Run: `bunx vitest run src/data/council.test.ts`
Expected: all tests pass.

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: errors in `src/routes/council.tsx` and `src/hooks/useAppState.ts` (they still reference the old API) — this is expected at this point; Tasks 2-5 fix them. Confirm the errors are ONLY in those two files, not in `council.ts`/`council.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/data/council.ts src/data/council.test.ts
git commit -m "Rebuild Council data model around chat messages instead of a verdict"
```

---

### Task 2: `useCouncilSessions` — messages instead of follow-ups

**Files:**
- Modify: `src/hooks/useAppState.ts:1-101`

**Interfaces:**
- Consumes: `CouncilChatMessage`, `CouncilSession` from Task 1 (`@/data/council`).
- Produces: `useCouncilSessions()` returns `{ sessions, create, markRead, updatePersonas, addMessages, remove }` — `addMessages` replaces `addFollowUp`.

- [ ] **Step 1: Update the import and storage key**

Find:
```ts
import { SEED_COUNCIL_SESSIONS, type CouncilSession } from "@/data/council";
```
Replace with:
```ts
import { SEED_COUNCIL_SESSIONS, type CouncilChatMessage, type CouncilSession } from "@/data/council";
```

Find:
```ts
export function useCouncilSessions() {
  const [sessions, setSessions] = useLocalStorage<CouncilSession[]>(
    "biaqyl:council-sessions:v2",
    SEED_COUNCIL_SESSIONS,
  );
```
Replace with:
```ts
export function useCouncilSessions() {
  const [sessions, setSessions] = useLocalStorage<CouncilSession[]>(
    "biaqyl:council-sessions:v3",
    SEED_COUNCIL_SESSIONS,
  );
```

(The key bump to `v3` invalidates old `v2` data using the removed `followUps: string[]` shape — same pattern as the existing `v2` bump, which already invalidated pre-branch data for the same reason.)

- [ ] **Step 2: Replace `addFollowUp` with `addMessages`**

Find:
```ts
  const addFollowUp = useCallback(
    (id: string, text: string) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, followUps: [...s.followUps, text] } : s)),
      ),
    [setSessions],
  );
```
Replace with:
```ts
  const addMessages = useCallback(
    (id: string, newMessages: CouncilChatMessage[]) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, messages: [...s.messages, ...newMessages] } : s)),
      ),
    [setSessions],
  );
```

- [ ] **Step 3: Update the return statement**

Find:
```ts
  return { sessions, create, markRead, updatePersonas, addFollowUp, remove };
```
Replace with:
```ts
  return { sessions, create, markRead, updatePersonas, addMessages, remove };
```

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: errors now only in `src/routes/council.tsx` (still calling the old `addFollowUp`/`followUps` API) — fixed in Tasks 3-5.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useAppState.ts
git commit -m "Replace addFollowUp with addMessages, bump council storage key to v3"
```

---

### Task 3: `NewCouncilPanel` — WhatsApp-style "pick people, then topic"

**Files:**
- Modify: `src/routes/council.tsx` (imports, then the `NewCouncilPanel` function — exact old/new blocks below)

**Interfaces:**
- Consumes: `hasLikelyDisagreement`, `pickDefaultTrio`, `buildOpeningMessages` from Task 1 (`@/data/council`).
- Produces: `NewCouncilPanel`'s `onCreate` callback receives a `CouncilSession` whose `messages` are already populated via `buildOpeningMessages` — unchanged prop signature (`onCreate: (session: CouncilSession) => void`), so `CouncilPage`'s usage in Task 5 doesn't need to change.

This task will not typecheck cleanly on its own (Task 4/5 still reference the old `VerdictPanel`/`SessionView` in the same file) — typecheck at the end of Task 5 instead. Do not skip the manual visual check in Step 3 below just because `tsc` is red at this point; the check only needs the specific component to render, and Vite's dev server compiles per-file.

- [ ] **Step 1: Update the top-of-file import block**

Find:
```ts
import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Check,
  Copy,
  Loader2,
  PanelLeft,
  PanelLeftClose,
  PanelRight,
  PanelRightClose,
  Plus,
  Search,
  Send,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildPersonaTake,
  buildVerdict,
  COUNCIL_PERSONAS,
  formatVerdictForCopy,
  getPersona,
  suggestPersonas,
  type CouncilSession,
} from "@/data/council";
```

Replace with:
```ts
import { useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PanelLeft, PanelLeftClose, Plus, Search, Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { MessageBubble } from "@/components/MessageBubble";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCouncilSessions, useTheme } from "@/hooks/useAppState";
import { useResizablePanel } from "@/hooks/useResizablePanel";
import { mockCards, type KnowledgeCardData } from "@/data/mockCards";
import {
  buildFollowUpReplies,
  buildOpeningMessages,
  COUNCIL_PERSONAS,
  getPersona,
  hasLikelyDisagreement,
  pickDefaultTrio,
  QUICK_REPLIES,
  type CouncilChatMessage,
  type CouncilSession,
} from "@/data/council";
```

(`Check`, `Copy`, `Loader2`, `PanelRight`, `PanelRightClose` were only used by the removed `VerdictPanel`/pending-follow-up UI in Tasks 4-5 — dropped here since nothing else in the file uses them. `buildFollowUpReplies` and `CouncilChatMessage` aren't used by this task yet but are needed by Task 4/5 in the same file; importing them now avoids a second import-editing pass.)

- [ ] **Step 2: Replace the whole `NewCouncilPanel` function**

Find (the entire current function, from its `function NewCouncilPanel(` line through its closing `}` — starts right after the `AvatarStack` function and ends right before the `PersonaPicker` function):

```tsx
function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const selectCard = (c: KnowledgeCardData) => {
    setCard(c);
    setPersonaIds(
      suggestPersonas({
        title: c.title,
        summary: c.executive_summary,
        insight: c.core_insight,
        businessUnit: c.business_unit,
      }),
    );
  };

  const start = () => {
    if (!card || personaIds.length === 0) return;
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      followUps: [],
      topic: {
        title: card.title,
        summary: card.executive_summary,
        insight: card.core_insight,
        businessUnit: card.business_unit,
      },
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="space-y-6 rounded-2xl border border-border bg-card p-6 shadow-soft">
        <div>
          <label
            htmlFor="council-case-search"
            className="mb-2 block text-xs font-bold text-muted-foreground"
          >
            Выберите кейс
          </label>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              id="council-case-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Найдите кейс по названию"
              className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
            />
          </div>
          <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
            {results.map((c) => (
              <button
                key={c.id}
                onClick={() => selectCard(c)}
                className={cn(
                  "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                  card?.id === c.id
                    ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                    : "border-transparent text-muted-foreground hover:bg-secondary/50",
                )}
              >
                <span className="block truncate">{c.title}</span>
              </button>
            ))}
          </div>
        </div>

        {card && (
          <div>
            <p className="mb-2 text-xs font-bold tabular-nums text-muted-foreground">
              Совет ({personaIds.length}/{MAX_PERSONAS})
            </p>
            {!pickerOpen && (
              <div className="flex flex-wrap items-center gap-2">
                {personaIds.map((id) => {
                  const p = getPersona(id);
                  return (
                    <span
                      key={id}
                      className={cn(
                        "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-white",
                        p.color,
                      )}
                    >
                      {p.initials} {p.name.split(" ")[0]}
                    </span>
                  );
                })}
                <button
                  ref={pickerTriggerRef}
                  type="button"
                  onClick={() => setPickerOpen(true)}
                  className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Изменить состав
                </button>
              </div>
            )}
            {pickerOpen && (
              <PersonaPicker
                selected={personaIds}
                onChange={setPersonaIds}
                onClose={() => {
                  setPickerOpen(false);
                  requestAnimationFrame(() => pickerTriggerRef.current?.focus());
                }}
              />
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button
            className="flex-1 gap-1.5"
            disabled={!card || personaIds.length === 0}
            onClick={start}
          >
            <Plus className="h-4 w-4" /> Начать совет
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
function NewCouncilPanel({
  onCreate,
  onCancel,
}: {
  onCreate: (session: CouncilSession) => void;
  onCancel: () => void;
}) {
  const [step, setStep] = useState<"contacts" | "topic">("contacts");
  const [personaIds, setPersonaIds] = useState<string[]>([]);
  const [personaQuery, setPersonaQuery] = useState("");
  const [query, setQuery] = useState("");
  const [card, setCard] = useState<KnowledgeCardData | null>(null);

  const personaResults = useMemo(() => {
    const q = personaQuery.trim().toLowerCase();
    if (!q) return COUNCIL_PERSONAS;
    return COUNCIL_PERSONAS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q) ||
        p.inspiredBy.toLowerCase().includes(q),
    );
  }, [personaQuery]);

  const togglePersona = (id: string) =>
    setPersonaIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= MAX_PERSONAS
          ? prev
          : [...prev, id],
    );

  const caseResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return mockCards.slice(0, 8);
    return mockCards.filter((c) => c.title.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const start = () => {
    if (!card || personaIds.length === 0) return;
    const topic = {
      title: card.title,
      summary: card.executive_summary,
      insight: card.core_insight,
      businessUnit: card.business_unit,
    };
    onCreate({
      id: `session-${Date.now()}`,
      title: card.title,
      date: TODAY,
      personaIds,
      messages: buildOpeningMessages(personaIds, topic),
      topic,
    });
  };

  return (
    <div className="mx-auto w-full max-w-xl px-6 py-10">
      <div className="space-y-5 rounded-2xl border border-border bg-card p-6 shadow-soft">
        {step === "contacts" ? (
          <>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-bold text-card-foreground">Кто в совете?</p>
                <p className="text-xs text-muted-foreground">
                  Выберите до {MAX_PERSONAS} участников
                </p>
              </div>
              <span className="shrink-0 text-xs font-bold tabular-nums text-muted-foreground">
                {personaIds.length}/{MAX_PERSONAS}
              </span>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={personaQuery}
                onChange={(e) => setPersonaQuery(e.target.value)}
                placeholder="Найдите персону по имени или стилю"
                aria-label="Найдите персону по имени или стилю"
                className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
              />
            </div>

            {personaIds.length >= 2 && !hasLikelyDisagreement(personaIds) && (
              <p className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-card-foreground">
                В этом составе взгляды похожи — спора может не быть. Попробуйте добавить
                контрарианку или скептика.
              </p>
            )}

            <button
              type="button"
              onClick={() => setPersonaIds(pickDefaultTrio())}
              className="text-xs font-semibold text-primary underline-offset-2 hover:underline"
            >
              Подобрать автоматически
            </button>

            <div className="max-h-72 space-y-1.5 overflow-y-auto">
              {personaResults.map((p) => {
                const isSelected = personaIds.includes(p.id);
                const disabled = !isSelected && personaIds.length >= MAX_PERSONAS;
                return (
                  <button
                    key={p.id}
                    onClick={() => togglePersona(p.id)}
                    disabled={disabled}
                    aria-pressed={isSelected}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-lg border p-2.5 text-left transition-colors disabled:opacity-40",
                      isSelected
                        ? "border-primary bg-primary/8"
                        : "border-border hover:border-primary/30 hover:bg-secondary/30",
                    )}
                  >
                    <PersonaAvatar initials={p.initials} size="md" className={p.color} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-card-foreground">
                        {p.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {p.role} · в духе {p.inspiredBy}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={onCancel}>
                Отмена
              </Button>
              <Button
                className="flex-1 gap-1.5"
                disabled={personaIds.length === 0}
                onClick={() => setStep("topic")}
              >
                Далее
              </Button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label
                htmlFor="council-case-search"
                className="mb-2 block text-xs font-bold text-muted-foreground"
              >
                О чём поговорим?
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-3 transition-colors focus-within:border-primary">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  id="council-case-search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Найдите кейс по названию"
                  className="h-10 w-full min-w-0 bg-transparent text-base outline-none placeholder:text-muted-foreground sm:text-sm"
                />
              </div>
              <div className="mt-2 max-h-56 space-y-1 overflow-y-auto">
                {caseResults.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCard(c)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors",
                      card?.id === c.id
                        ? "border-primary bg-primary/8 font-semibold text-card-foreground"
                        : "border-transparent text-muted-foreground hover:bg-secondary/50",
                    )}
                  >
                    <span className="block truncate">{c.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={() => setStep("contacts")}>
                Назад
              </Button>
              <Button className="flex-1 gap-1.5" disabled={!card} onClick={start}>
                <Plus className="h-4 w-4" /> Начать совет
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

Note: `PersonaPicker` (the next function in the file, used by "Изменить состав" on an already-active session) is untouched by this task — it keeps its own independent search/toggle state and its `Готово`-based close flow, since editing an existing council's composition is a different interaction than picking one from scratch.

- [ ] **Step 3: Manual visual check (file won't fully typecheck until Task 5 — check this component in isolation)**

The dev server (`docker compose up -d` / `bun run dev`) picks up the edit live even though other parts of the same file still reference removed APIs — Vite's error overlay will point at `VerdictPanel`/`SessionView`, not at `NewCouncilPanel`. Open `/council`, click "Создать совет", and confirm:
- Step 1 shows all 12 personas with a search box and a `0/3` counter.
- Selecting `Артур Ким` (founder) then `Мила Ержанова` (product) shows the "взгляды похожи" hint (both bullish, no skeptical).
- Adding `Лейла Асанова` (contrarian) makes the hint disappear (bullish+skeptical pair present) and hits the 3/3 cap.
- "Подобрать автоматически" replaces the selection with a 3-persona set that does NOT show the hint.
- "Далее" is disabled at 0 selected, enabled at ≥1.
- Step 2 shows the existing case search; "Назад" returns to Step 1 with the previous selection intact.

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Rework council creation into a WhatsApp-style contacts-then-topic flow"
```

---

### Task 4: `SessionView` — live group chat rendering

**Files:**
- Modify: `src/routes/council.tsx` (the `SessionView` function — exact old/new blocks below; also removes the now-unused `PERSONA_BORDER_CLASS`-consuming `MessageBubble` import path is unaffected, `PERSONA_BORDER_CLASS` itself stays, now consumed directly instead of via `accentClassName`)

**Interfaces:**
- Consumes: `CouncilChatMessage`, `getPersona`, `QUICK_REPLIES` from Task 1; `PERSONA_BORDER_CLASS` (already defined earlier in this same file, unchanged).
- Produces: `SessionView` prop signature becomes `{ session: CouncilSession; onFollowUp: (text: string) => void }` — drops the `pending: string | null` prop it had before (Task 5 updates the call site to match).

This task still won't fully typecheck alone (Task 5 hasn't removed `VerdictPanel`/wired `CouncilPage` yet) — same caveat as Task 3, verify visually instead.

- [ ] **Step 1: Add a local message-grouping helper**

Find the `AvatarStack` function (near the top of the file, right after `PERSONA_BORDER_CLASS`) and add this new function immediately after it (before `NewCouncilPanel`):

```tsx
/** Groups consecutive messages from the same author — that's what a "burst" of 2 short
 *  messages in a row looks like, both structurally and visually (avatar/name shown once). */
function groupMessages(
  messages: CouncilChatMessage[],
): { author: string; items: CouncilChatMessage[] }[] {
  const groups: { author: string; items: CouncilChatMessage[] }[] = [];
  for (const m of messages) {
    const last = groups[groups.length - 1];
    if (last && last.author === m.author) last.items.push(m);
    else groups.push({ author: m.author, items: [m] });
  }
  return groups;
}
```

- [ ] **Step 2: Replace the whole `SessionView` function**

Find (from `function SessionView(` through its closing `}`, right before `function VerdictPanel`):

```tsx
function SessionView({
  session,
  pending,
  onFollowUp,
}: {
  session: CouncilSession;
  /** Follow-up text already shown as sent, still waiting to land in `session.followUps`. */
  pending: string | null;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");

  const send = () => {
    const text = followUp.trim();
    if (!text || pending) return;
    onFollowUp(text);
    setFollowUp("");
  };

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-8">
      <div className="flex-1 space-y-5">
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-primary">Кейс</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {session.topic.summary}
          </p>
        </div>

        <div className="space-y-3">
          {session.personaIds.map((id, i) => {
            const p = getPersona(id);
            return (
              <div
                key={id}
                style={{ animationDelay: `${Math.min(i, 9) * 80}ms` }}
                className="animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <MessageBubble
                  variant="entity"
                  avatar={<PersonaAvatar initials={p.initials} size="md" className={p.color} />}
                  title={
                    <>
                      {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                    </>
                  }
                  accentClassName={cn("border-l-4", PERSONA_BORDER_CLASS[p.color])}
                >
                  {buildPersonaTake(id, session.topic)}
                </MessageBubble>
              </div>
            );
          })}

          {session.followUps.map((text, i) => (
            <div key={i} className="ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MessageBubble variant="user" bubbleClassName="p-3">
                {text}
              </MessageBubble>
            </div>
          ))}

          {pending && (
            <div className="ml-12 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <MessageBubble variant="user" bubbleClassName="p-3">
                {pending}
              </MessageBubble>
            </div>
          )}

          {pending && (
            <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" /> Совет учитывает ваш
              вопрос...
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-border bg-background pt-4 pb-2">
        <label htmlFor="council-follow-up" className="sr-only">
          Уточняющий вопрос совету
        </label>
        <input
          id="council-follow-up"
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          disabled={!!pending}
          placeholder="Задайте уточняющий вопрос совету"
          className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
        />
        <Button
          size="icon"
          disabled={!followUp.trim() || !!pending}
          onClick={send}
          aria-label="Отправить"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
function SessionView({
  session,
  onFollowUp,
}: {
  session: CouncilSession;
  onFollowUp: (text: string) => void;
}) {
  const [followUp, setFollowUp] = useState("");
  const [visibleCount, setVisibleCount] = useState(session.messages.length);
  const [typingAuthor, setTypingAuthor] = useState<string | null>(null);
  const shownCountRef = useRef(session.messages.length);
  const timersRef = useRef<number[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Session switched: show everything already there instantly, no replay of old bursts.
  useEffect(() => {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
    setVisibleCount(session.messages.length);
    shownCountRef.current = session.messages.length;
    setTypingAuthor(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.id]);

  // New messages appended to the same session: reveal them one at a time with a typing pause.
  useEffect(() => {
    if (session.messages.length <= shownCountRef.current) return;
    const newOnes = session.messages.slice(shownCountRef.current);
    shownCountRef.current = session.messages.length;
    let cancelled = false;
    let index = 0;

    const revealNext = () => {
      if (cancelled || index >= newOnes.length) {
        if (!cancelled) setTypingAuthor(null);
        return;
      }
      const message = newOnes[index];
      if (message.author === "user") {
        setVisibleCount((v) => v + 1);
        index += 1;
        timersRef.current.push(window.setTimeout(revealNext, 300));
        return;
      }
      setTypingAuthor(message.author);
      const typingDelay = 600 + Math.random() * 800;
      timersRef.current.push(
        window.setTimeout(() => {
          if (cancelled) return;
          setVisibleCount((v) => v + 1);
          setTypingAuthor(null);
          index += 1;
          const messageDelay = 1000 + Math.random() * 1500;
          timersRef.current.push(window.setTimeout(revealNext, messageDelay));
        }, typingDelay),
      );
    };

    revealNext();

    return () => {
      cancelled = true;
      timersRef.current.forEach((t) => window.clearTimeout(t));
      timersRef.current = [];
    };
  }, [session.messages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleCount, typingAuthor]);

  const isRevealing = typingAuthor !== null || visibleCount < session.messages.length;

  const send = (text: string) => {
    const value = text.trim();
    if (!value || isRevealing) return;
    onFollowUp(value);
    setFollowUp("");
  };

  const visibleMessages = session.messages.slice(0, visibleCount);
  const groups = groupMessages(visibleMessages);
  const typingPersona = typingAuthor ? getPersona(typingAuthor) : null;

  return (
    <div className="mx-auto flex min-h-full w-full max-w-2xl flex-col px-6 py-8">
      <div className="flex-1 space-y-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-card p-3">
          <AvatarStack personaIds={session.personaIds} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-card-foreground">{session.title}</p>
            <p className="text-xs text-muted-foreground">
              {session.personaIds.length} участника · на связи
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold text-primary">Кейс</p>
          <h2 className="mt-1 text-lg font-bold text-foreground">{session.topic.title}</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {session.topic.summary}
          </p>
        </div>

        {groups.map((group, gi) => {
          if (group.author === "user") {
            const isLastGroup = gi === groups.length - 1;
            return (
              <div key={gi} className="ml-12 space-y-1">
                {group.items.map((m, mi) => {
                  const isLastItem = isLastGroup && mi === group.items.length - 1;
                  const isRead = !isLastItem || isRevealing;
                  return (
                    <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                      <MessageBubble variant="user" bubbleClassName="p-3">
                        {m.text}
                      </MessageBubble>
                      <p className="mt-1 text-right text-xs text-muted-foreground">
                        {m.time}
                        {isLastItem && isRead && " · Прочитано ✓✓"}
                      </p>
                    </div>
                  );
                })}
              </div>
            );
          }

          const p = getPersona(group.author);
          const replyTarget = group.items[0].replyTo ? getPersona(group.items[0].replyTo) : null;

          return (
            <div key={gi} className="flex gap-3">
              <PersonaAvatar initials={p.initials} size="md" className={p.color} />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-card-foreground">
                  {p.name} <span className="font-normal text-muted-foreground">· {p.role}</span>
                  {replyTarget && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      · отвечает {replyTarget.name.split(" ")[0]}
                    </span>
                  )}
                </p>
                {group.items.map((m) => (
                  <div key={m.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div
                      className={cn(
                        "rounded-2xl rounded-tl-sm border border-border bg-card p-3 text-sm leading-relaxed text-card-foreground border-l-4",
                        PERSONA_BORDER_CLASS[p.color],
                      )}
                    >
                      {m.text}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{m.time}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {typingPersona && (
          <div className="flex items-center gap-3">
            <PersonaAvatar
              initials={typingPersona.initials}
              size="md"
              className={typingPersona.color}
            />
            <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm border border-border bg-card px-3 py-2.5">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "120ms" }}
              />
              <span
                className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                style={{ animationDelay: "240ms" }}
              />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="sticky bottom-0 mt-6 space-y-2 border-t border-border bg-background pt-4 pb-2">
        <div className="flex flex-wrap gap-1.5">
          {QUICK_REPLIES.map((q) => (
            <button
              key={q}
              type="button"
              disabled={isRevealing}
              onClick={() => send(q)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <label htmlFor="council-follow-up" className="sr-only">
            Сообщение совету
          </label>
          <input
            id="council-follow-up"
            value={followUp}
            onChange={(e) => setFollowUp(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send(followUp)}
            disabled={isRevealing}
            placeholder="Написать сообщение…"
            className="h-10 w-full min-w-0 rounded-control border border-border bg-secondary/40 px-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary disabled:opacity-60 sm:text-sm"
          />
          <Button
            size="icon"
            disabled={!followUp.trim() || isRevealing}
            onClick={() => send(followUp)}
            aria-label="Отправить"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
```

Note: this introduces a `useEffect` import requirement — the file's top-level `import { useMemo, useRef, useState } from "react";` (set in Task 3, Step 1) needs `useEffect` added.

- [ ] **Step 3: Add `useEffect` to the React import**

Find:
```ts
import { useMemo, useRef, useState } from "react";
```
Replace with:
```ts
import { useEffect, useMemo, useRef, useState } from "react";
```

- [ ] **Step 4: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Turn SessionView into a live group chat with typing indicators and read receipts"
```

---

### Task 5: Remove `VerdictPanel`, wire `CouncilPage`, update `SessionsOverview` preview

**Files:**
- Modify: `src/routes/council.tsx` (removes `VerdictPanel` entirely; rewrites `CouncilPage`; updates `SessionsOverview`'s preview line)

**Interfaces:**
- Consumes: `addMessages` (Task 2), `buildFollowUpReplies`/`buildOpeningMessages` (Task 1), `SessionView`'s new 2-prop signature (Task 4).
- Produces: nothing further downstream — this is the task that makes the whole file typecheck again.

- [ ] **Step 1: Delete the `VerdictPanel` function entirely**

Find (from `function VerdictPanel(` through its closing `}`, right before `function CouncilPage`) and delete the whole block:

```tsx
function VerdictPanel({
  session,
  onAsk,
  pending,
  width,
  startResize,
  collapsed,
  onCollapse,
  panelRef,
}: {
  session: CouncilSession;
  onAsk: (text: string) => void;
  pending: boolean;
  width: number;
  startResize: (e: React.MouseEvent) => void;
  collapsed: boolean;
  onCollapse: () => void;
  panelRef: React.RefObject<HTMLElement | null>;
}) {
  const verdict = buildVerdict(session.topic, session.personaIds, session.followUps);
  const [copied, setCopied] = useState(false);

  const copyVerdict = async () => {
    await navigator.clipboard.writeText(formatVerdictForCopy(session.topic, verdict));
    setCopied(true);
    toast.success("Вердикт скопирован");
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <aside
      ref={panelRef}
      tabIndex={-1}
      aria-label="Вердикт совета"
      style={{ "--panel-w": `${width}px` } as React.CSSProperties}
      className={cn(
        "relative flex w-full flex-col gap-3 border-t border-border bg-card p-4 outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-[45vh] md:shrink-0 md:overflow-y-auto lg:max-h-none lg:w-[var(--panel-w)] lg:border-l lg:border-t-0",
        collapsed && "lg:hidden",
      )}
    >
      <div
        onMouseDown={startResize}
        role="separator"
        aria-orientation="vertical"
        aria-label="Изменить ширину панели вердикта"
        className="absolute inset-y-0 left-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 lg:block"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={onCollapse}
          aria-label="Свернуть панель вердикта"
          title="Свернуть панель"
          className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary lg:grid"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-success" />
        <p className="flex-1 text-xs font-bold text-primary">Вердикт совета</p>
        <button
          onClick={copyVerdict}
          aria-label="Скопировать вердикт"
          title="Скопировать вердикт"
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <div
        key={session.followUps.length}
        className="animate-in rounded-xl border border-primary/30 bg-primary/6 p-3 text-sm leading-relaxed text-card-foreground fade-in duration-300"
      >
        {verdict.synthesis}
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Открытые вопросы</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.openQuestions.map((question, i) => (
            <button
              key={i}
              type="button"
              disabled={pending}
              onClick={() => onAsk(question)}
              className="rounded-full border border-border bg-secondary/30 px-3 py-1.5 text-left text-xs text-card-foreground transition-[color,border-color,background-color,transform] hover:-translate-y-0.5 hover:border-primary hover:bg-primary/8 hover:text-primary disabled:pointer-events-none disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-bold text-muted-foreground">Согласны / расходятся</p>
        <div className="flex flex-wrap gap-1.5">
          {verdict.agreements.map((a, i) => (
            <span
              key={i}
              className={cn(
                "max-w-full truncate rounded-full border px-2 py-0.5 text-xs font-medium",
                a.kind === "agree"
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-destructive/40 bg-destructive/10 text-destructive",
              )}
            >
              {a.label}
            </span>
          ))}
        </div>
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Update `SessionsOverview`'s preview line**

Find:
```tsx
      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s) => {
          const verdict = buildVerdict(s.topic, s.personaIds, s.followUps);
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/20"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-card-foreground">{s.title}</p>
                {s.unread && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-success" />
                    <span className="sr-only">Непрочитано</span>
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {verdict.synthesis}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <AvatarStack personaIds={s.personaIds} />
                <span className="text-xs text-muted-foreground">{s.date}</span>
              </div>
            </button>
          );
        })}
      </div>
```

Replace with:
```tsx
      <div className="grid gap-3 sm:grid-cols-2">
        {sessions.map((s) => {
          const preview = s.messages.at(-1)?.text ?? s.topic.summary;
          return (
            <button
              key={s.id}
              onClick={() => onOpen(s.id)}
              className="flex flex-col gap-2 rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-secondary/20"
            >
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-sm font-bold text-card-foreground">{s.title}</p>
                {s.unread && (
                  <span className="flex shrink-0 items-center gap-1 text-xs font-semibold text-success">
                    <span aria-hidden className="h-2 w-2 rounded-full bg-success" />
                    <span className="sr-only">Непрочитано</span>
                  </span>
                )}
              </div>
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {preview}
              </p>
              <div className="mt-1 flex items-center justify-between">
                <AvatarStack personaIds={s.personaIds} />
                <span className="text-xs text-muted-foreground">{s.date}</span>
              </div>
            </button>
          );
        })}
      </div>
```

- [ ] **Step 3: Replace `CouncilPage` entirely**

Find (from `function CouncilPage() {` through its closing `}`, right before `function SessionRow`):

```tsx
function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { sessions, create, markRead, updatePersonas, addFollowUp, remove } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const [pendingFollowUp, setPendingFollowUp] = useState<string | null>(null);
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const [showSessions, setShowSessions] = useState(true);
  const [showVerdict, setShowVerdict] = useState(true);
  const sessionsCollapseRef = useRef<HTMLButtonElement>(null);
  const sessionsRestoreRef = useRef<HTMLButtonElement>(null);
  const sessionsPanelRef = useRef<HTMLElement>(null);
  const verdictRestoreRef = useRef<HTMLButtonElement>(null);
  const verdictPanelRef = useRef<HTMLElement>(null);

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };
  const { width: sessionsWidth, startResize: startSessionsResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });
  const { width: verdictWidth, startResize: startVerdictResize } = useResizablePanel(260, {
    min: 220,
    max: 480,
  });

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const q = sessionQuery.trim().toLowerCase();
  const visibleSessions = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions;
  const today = visibleSessions.filter((s) => s.date === TODAY);
  const earlier = visibleSessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  const deleteSession = (id: string) => {
    remove(id);
    if (id === activeId) setActiveId(null);
    toast.success("Сессия удалена");
  };

  const submitFollowUp = (text: string) => {
    if (!active || pendingFollowUp) return;
    setPendingFollowUp(text);
    window.setTimeout(() => {
      addFollowUp(active.id, text);
      setPendingFollowUp(null);
    }, 650);
  };


  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="relative flex flex-1 flex-col lg:min-h-0 md:flex-row">
        <aside
          ref={sessionsPanelRef}
          tabIndex={-1}
          style={{ "--panel-w": `${sessionsWidth}px` } as React.CSSProperties}
          className={cn(
            "relative flex w-full shrink-0 flex-col border-b border-border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-none md:w-[var(--panel-w)] md:overflow-y-auto md:border-b-0 md:border-r",
            !showSessions && "md:hidden",
          )}
        >
          <div
            onMouseDown={startSessionsResize()}
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину панели сессий"
            className="absolute inset-y-0 right-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 md:block"
          />

          <div className="flex items-center gap-2 pb-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
              Сессии
              <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-xs font-bold tabular-nums text-muted-foreground">
                {sessions.length}
              </span>
            </p>
            <button
              ref={sessionsCollapseRef}
              onClick={() => {
                setShowSessions(false);
                focusNext(sessionsRestoreRef);
              }}
              aria-label="Свернуть панель сессий"
              title="Свернуть панель"
              className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary md:grid"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={sessionQuery}
              onChange={(e) => setSessionQuery(e.target.value)}
              placeholder="Поиск по сессиям"
              aria-label="Поиск по сессиям"
              className="h-9 w-full min-w-0 rounded-lg border border-border bg-secondary/30 pl-8 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
            />
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {q && today.length === 0 && earlier.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground">Ничего не найдено</p>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              {!pickerOpen && (
                <>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {active.personaIds.map((id) => {
                      const p = getPersona(id);
                      return (
                        <PersonaAvatar
                          key={id}
                          initials={p.initials}
                          size="sm"
                          className={p.color}
                        />
                      );
                    })}
                  </div>
                  <button
                    ref={pickerTriggerRef}
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
                  >
                    Изменить состав
                  </button>
                </>
              )}
              {pickerOpen && (
                <PersonaPicker
                  selected={active.personaIds}
                  onChange={(ids) => updatePersonas(active.id, ids)}
                  onClose={() => {
                    setPickerOpen(false);
                    focusNext(pickerTriggerRef);
                  }}
                />
              )}
            </div>
          )}
        </aside>

        {!showSessions && (
          <button
            ref={sessionsRestoreRef}
            onClick={() => {
              setShowSessions(true);
              focusNext(sessionsPanelRef);
            }}
            aria-label="Показать сессии"
            title="Показать панель сессий"
            className="absolute left-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary md:grid"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <div className="relative flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:flex-row">
          <main className="flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:overflow-y-auto">
            {creating ? (
              <NewCouncilPanel
                onCancel={() => setCreating(false)}
                onCreate={(session) => {
                  create(session);
                  setCreating(false);
                  setActiveId(session.id);
                }}
              />
            ) : active ? (
              <SessionView session={active} pending={pendingFollowUp} onFollowUp={submitFollowUp} />
            ) : (
              <SessionsOverview sessions={sessions} onOpen={openSession} />
            )}
          </main>
          {active && (
            <VerdictPanel
              session={active}
              onAsk={submitFollowUp}
              pending={!!pendingFollowUp}
              width={verdictWidth}
              startResize={startVerdictResize(true)}
              collapsed={!showVerdict}
              onCollapse={() => {
                setShowVerdict(false);
                focusNext(verdictRestoreRef);
              }}
              panelRef={verdictPanelRef}
            />
          )}
          {active && !showVerdict && (
            <button
              ref={verdictRestoreRef}
              onClick={() => {
                setShowVerdict(true);
                focusNext(verdictPanelRef);
              }}
              aria-label="Показать вердикт"
              title="Показать панель вердикта"
              className="absolute right-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-l-lg border border-r-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary lg:grid"
            >
              <PanelRight className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

Replace with:

```tsx
function CouncilPage() {
  const { dark, toggle } = useTheme();
  const { sessions, create, markRead, updatePersonas, addMessages, remove } = useCouncilSessions();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [sessionQuery, setSessionQuery] = useState("");
  const pickerTriggerRef = useRef<HTMLButtonElement>(null);
  const [showSessions, setShowSessions] = useState(true);
  const sessionsCollapseRef = useRef<HTMLButtonElement>(null);
  const sessionsRestoreRef = useRef<HTMLButtonElement>(null);
  const sessionsPanelRef = useRef<HTMLElement>(null);

  const focusNext = (ref: React.RefObject<HTMLElement | null>) => {
    requestAnimationFrame(() => ref.current?.focus());
  };
  const { width: sessionsWidth, startResize: startSessionsResize } = useResizablePanel(320, {
    min: 220,
    max: 520,
  });

  const active = sessions.find((s) => s.id === activeId) ?? null;
  const q = sessionQuery.trim().toLowerCase();
  const visibleSessions = q ? sessions.filter((s) => s.title.toLowerCase().includes(q)) : sessions;
  const today = visibleSessions.filter((s) => s.date === TODAY);
  const earlier = visibleSessions.filter((s) => s.date !== TODAY);

  const openSession = (id: string) => {
    setCreating(false);
    setActiveId(id);
    markRead(id);
  };

  const deleteSession = (id: string) => {
    remove(id);
    if (id === activeId) setActiveId(null);
    toast.success("Сессия удалена");
  };

  const submitFollowUp = (text: string) => {
    if (!active) return;
    const userMessage: CouncilChatMessage = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      author: "user",
      text,
      time: new Date().toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
    };
    const replies = buildFollowUpReplies(active.personaIds, active.topic, text);
    addMessages(active.id, [userMessage, ...replies]);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background lg:h-screen lg:overflow-hidden">
      <Header dark={dark} onToggleDark={toggle} />
      <h1 className="sr-only">Консилиум</h1>

      <div className="relative flex flex-1 flex-col lg:min-h-0 md:flex-row">
        <aside
          ref={sessionsPanelRef}
          tabIndex={-1}
          style={{ "--panel-w": `${sessionsWidth}px` } as React.CSSProperties}
          className={cn(
            "relative flex w-full shrink-0 flex-col border-b border-border bg-card p-3 outline-none focus-visible:ring-2 focus-visible:ring-primary md:max-h-none md:w-[var(--panel-w)] md:overflow-y-auto md:border-b-0 md:border-r",
            !showSessions && "md:hidden",
          )}
        >
          <div
            onMouseDown={startSessionsResize()}
            role="separator"
            aria-orientation="vertical"
            aria-label="Изменить ширину панели сессий"
            className="absolute inset-y-0 right-0 z-20 hidden w-2 cursor-col-resize hover:bg-primary/25 md:block"
          />

          <div className="flex items-center gap-2 pb-2">
            <p className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm font-bold tracking-tight text-card-foreground">
              Сессии
              <span className="inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-secondary px-1 text-xs font-bold tabular-nums text-muted-foreground">
                {sessions.length}
              </span>
            </p>
            <button
              ref={sessionsCollapseRef}
              onClick={() => {
                setShowSessions(false);
                focusNext(sessionsRestoreRef);
              }}
              aria-label="Свернуть панель сессий"
              title="Свернуть панель"
              className="hidden h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary md:grid"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          </div>

          <Button
            className="h-11 w-full gap-1.5 rounded-2xl text-sm"
            onClick={() => {
              setCreating(true);
              setActiveId(null);
            }}
          >
            <Plus className="h-4 w-4" /> Создать совет
          </Button>

          <div className="relative mt-3">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={sessionQuery}
              onChange={(e) => setSessionQuery(e.target.value)}
              placeholder="Поиск по сессиям"
              aria-label="Поиск по сессиям"
              className="h-9 w-full min-w-0 rounded-lg border border-border bg-secondary/30 pl-8 pr-3 text-base outline-none transition-colors placeholder:text-muted-foreground focus:border-primary sm:text-sm"
            />
          </div>

          <div className="mt-4 flex-1 space-y-4">
            {today.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Сегодня</p>
                <div className="space-y-1.5">
                  {today.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {earlier.length > 0 && (
              <div>
                <p className="px-1 pb-1.5 text-xs font-bold text-muted-foreground">Ранее</p>
                <div className="space-y-1.5">
                  {earlier.map((s) => (
                    <SessionRow
                      key={s.id}
                      session={s}
                      active={s.id === activeId}
                      onClick={openSession}
                      onDelete={deleteSession}
                    />
                  ))}
                </div>
              </div>
            )}
            {q && today.length === 0 && earlier.length === 0 && (
              <p className="px-1 text-xs text-muted-foreground">Ничего не найдено</p>
            )}
          </div>

          {active && (
            <div className="mt-4 border-t border-border pt-3">
              <p className="mb-1.5 px-1 text-xs font-bold text-muted-foreground">Совет</p>
              {!pickerOpen && (
                <>
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {active.personaIds.map((id) => {
                      const p = getPersona(id);
                      return (
                        <PersonaAvatar
                          key={id}
                          initials={p.initials}
                          size="sm"
                          className={p.color}
                        />
                      );
                    })}
                  </div>
                  <button
                    ref={pickerTriggerRef}
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="mt-2 w-full rounded-lg border border-border px-2 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-card-foreground"
                  >
                    Изменить состав
                  </button>
                </>
              )}
              {pickerOpen && (
                <PersonaPicker
                  selected={active.personaIds}
                  onChange={(ids) => updatePersonas(active.id, ids)}
                  onClose={() => {
                    setPickerOpen(false);
                    focusNext(pickerTriggerRef);
                  }}
                />
              )}
            </div>
          )}
        </aside>

        {!showSessions && (
          <button
            ref={sessionsRestoreRef}
            onClick={() => {
              setShowSessions(true);
              focusNext(sessionsPanelRef);
            }}
            aria-label="Показать сессии"
            title="Показать панель сессий"
            className="absolute left-0 top-1/2 z-20 hidden h-16 w-6 -translate-y-1/2 place-items-center rounded-r-lg border border-l-0 border-border bg-card text-muted-foreground shadow-sm transition-colors hover:text-primary md:grid"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}

        <main className="flex flex-1 flex-col lg:min-h-0 md:min-w-0 lg:overflow-y-auto">
          {creating ? (
            <NewCouncilPanel
              onCancel={() => setCreating(false)}
              onCreate={(session) => {
                create(session);
                setCreating(false);
                setActiveId(session.id);
              }}
            />
          ) : active ? (
            <SessionView session={active} onFollowUp={submitFollowUp} />
          ) : (
            <SessionsOverview sessions={sessions} onOpen={openSession} />
          )}
        </main>
      </div>
    </div>
  );
}
```

(The `main` no longer needs its own `relative flex-col ... lg:flex-row` wrapper `div` — with `VerdictPanel` gone it has no sibling to sit next to, so it's now a direct child of the outer row alongside `aside` and the floating sessions-restore button.)

- [ ] **Step 4: Typecheck**

Run: `bunx tsc --noEmit`
Expected: clean. If anything remains red, it's almost certainly a leftover reference to `VerdictPanel`, `buildVerdict`, `followUps`, `pendingFollowUp`, or an unused import — grep for those exact strings in `council.tsx` and remove/fix.

- [ ] **Step 5: Run the test suite**

Run: `bunx vitest run`
Expected: all tests pass (existing suites plus Task 1's new/updated `council.test.ts`).

- [ ] **Step 6: Commit**

```bash
git add src/routes/council.tsx
git commit -m "Remove the verdict panel and wire Council's live chat end to end"
```

---

### Task 6: Manual verification

**Files:** none (verification only)

- [ ] **Step 1: Start the app**

`docker compose up -d --build` (OrbStack) or `bun run dev`. Serves on `http://localhost:8080`.

- [ ] **Step 2: Full creation → chat → follow-up flow**

Open `/council`. Confirm:
- Landing view (no active session) shows the `SessionsOverview` feed, each card previewing the LAST message of that session, not a verdict.
- "Создать совет" → Step 1 contacts list → pick 2 personas from the SAME camp (e.g., `founder` + `product`) → the "взгляды похожи" hint appears. Add a `SKEPTICAL` persona (e.g., `contrarian`) → hint disappears.
- "Далее" → Step 2 → search and pick any case → "Начать совет".
- New session opens already inside the chat: persona messages appear one at a time, each preceded by a bouncing-dots typing indicator, each carries a `ЧЧ:ММ` timestamp. The bullish/skeptical pair produces one extra message from the skeptical persona explicitly labeled "· отвечает `<Имя>`".
- Type a follow-up containing "риск" (matches the `resilience` keyword rule, if that persona is in the council) or send a message with no keyword match — confirm either a relevant reply or the honest fallback line appears, never silence.
- While the reply cascade is playing, confirm the input, send button, and quick-reply chips are all disabled; sending a second message mid-cascade should be blocked, not queued weirdly.
- The most recent user message shows "· Прочитано ✓✓" once its reply cascade has started.

- [ ] **Step 3: Reload persistence check**

Reload the page mid-session. Confirm all previously-added messages render instantly (no re-playing typing indicators for old messages) and the session's `SessionsOverview` card preview matches the true last message.

- [ ] **Step 4: Timer-safety check**

Send a follow-up, then — while the typing indicator is still visible — immediately click a different session in the sidebar (or delete the active session). Confirm no error appears in the browser console and no stray typing indicator or duplicate message shows up if you return to the original session afterward.

- [ ] **Step 5: Regression check on unaffected areas**

Confirm the sessions sidebar's own collapse/resize/search/delete (all untouched by this plan) still work, and that `/card/<id>` (the unrelated case workspace) still works normally.

- [ ] **Step 6: Final full-suite check**

```bash
bunx tsc --noEmit
bunx vitest run
```

Expected: both clean.
