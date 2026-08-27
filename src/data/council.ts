import type { Dictionary } from "@/lib/i18n";
import type { CouncilTopicText } from "@/data/council-types";

export interface CouncilPersona {
  id: string;
  initials: string;
  image: string;
  /** Основной цвет персоны — hex. Используется в обеих темах для солидной
   *  заливки (аватар, тег) и как база для рамки/кольца. */
  hex: string;
  /** Только у персон, чей `hex` не проходит WCAG 3:1 на тёмной карточке —
   *  более светлый вариант ТОЛЬКО для рамки/кольца в тёмной теме. */
  darkHex?: string;
}

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // hex/darkHex подобраны скриптом (OKLCH → sRGB → WCAG-контраст) — см.
  // docs/superpowers/specs/2026-08-04-council-visual-redesign-design.md §1
  // для полной таблицы контрастов. Не менять точечно без пересчёта.
  {
    id: "founder",
    initials: "EM",
    image: "/personas/elon-musk.webp",
    hex: "#a75d00",
  },
  {
    id: "operator",
    initials: "JB",
    image: "/personas/jeff-bezos.webp",
    hex: "#7c3aed",
  },
  {
    id: "engineer",
    initials: "DH",
    image: "/personas/demis-hassabis.webp",
    hex: "#2563eb",
  },
  {
    id: "contrarian",
    initials: "PT",
    image: "/personas/peter-thiel.webp",
    hex: "#0f766e",
  },
  {
    id: "industrialist",
    initials: "WB",
    image: "/personas/warren-buffett.webp",
    hex: "#c34700",
  },
  {
    id: "product",
    initials: "SJ",
    image: "/personas/steve-jobs.webp",
    hex: "#c026d3",
  },
  {
    id: "brand",
    initials: "AR",
    image: "/personas/aydin-rakhimbayev.webp",
    hex: "#c13892",
  },
  {
    id: "platform",
    initials: "JH",
    image: "/personas/jensen-huang.webp",
    hex: "#4f46e5",
    darkHex: "#5954f3",
  },
  {
    id: "competitor",
    initials: "SA",
    image: "/personas/sam-altman.webp",
    hex: "#ce3452",
  },
  {
    id: "resilience",
    initials: "RD",
    image: "/personas/ray-dalio.webp",
    hex: "#0e7490",
  },
  {
    id: "scale",
    initials: "AN",
    image: "/personas/andrew-ng.webp",
    hex: "#047857",
  },
  {
    id: "transform",
    initials: "SN",
    image: "/personas/satya-nadella.webp",
    hex: "#57534e",
    darkHex: "#6f6b66",
  },
];

export function getPersona(id: string): CouncilPersona {
  return COUNCIL_PERSONAS.find((p) => p.id === id) ?? COUNCIL_PERSONAS[0];
}

export interface CouncilTopic extends CouncilTopicText {
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
  /** id персоны, на чью реплику это реакция — рендерится как "· Ответ: <Имя>". */
  replyTo?: string;
  /** Эмодзи, которыми пользователь отреагировал на это сообщение персоны.
   *  Только у сообщений персон — у сообщений пользователя не используется. */
  reactions?: string[];
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

/** Демонстрационные сессии. Тема берётся из словаря локали по id — см. `t.seedTopics`. */
export const SEED_COUNCIL_SESSIONS: CouncilSession[] = [
  {
    id: "seed-1",
    title: "Iz Lynn Chan at Far East Organization (Abridged)",
    date: "30.07.2026",
    personaIds: ["founder", "contrarian", "transform"],
    topic: { title: "", summary: "", insight: "", businessUnit: "" },
    messages: [],
  },
  {
    id: "seed-2",
    title: "SpinBrush",
    date: "28.07.2026",
    personaIds: ["operator", "competitor", "resilience"],
    unread: true,
    topic: { title: "", summary: "", insight: "", businessUnit: "" },
    messages: [],
  },
];

/** Тема сессии в текущей локали: для демо-сессий берётся из словаря. */
export function resolveTopic(session: CouncilSession, t: Dictionary): CouncilTopic {
  return t.seedTopics[session.id] ?? session.topic;
}

/** Реплики сид-сессий собираются в компоненте — им нужен словарь локали. */

/** 1-2 короткие реплики на персону (не абзац) — материал для группового чата. */
export function buildPersonaTake(personaId: string, topic: CouncilTopic, t: Dictionary): string[] {
  const take = t.councilTalk.takes[personaId];
  return take ? take(topic) : [topic.insight];
}

/** Имя персоны для обращения. Неизвестный id не должен ломать сборку реплик —
 *  сессии из хранилища могут ссылаться на персону, которой больше нет. */
function firstName(personaId: string, t: Dictionary): string {
  return t.personas[personaId]?.name.split(" ")[0] ?? personaId;
}

function buildDisagreement(skepticId: string, bullishFirstName: string, t: Dictionary): string {
  const line = t.councilTalk.disagreement[skepticId];
  return line ? line(bullishFirstName) : t.councilTalk.disagreementDefault(bullishFirstName);
}

/** Стартовые реплики при создании сессии: 1-2 сообщения на персону + опциональная реакция несогласия. */
export function buildOpeningMessages(
  personaIds: string[],
  topic: CouncilTopic,
  t: Dictionary,
): CouncilChatMessage[] {
  const messages: CouncilChatMessage[] = [];
  for (const id of personaIds) {
    for (const text of buildPersonaTake(id, topic, t)) {
      messages.push({ id: makeMessageId(), author: id, text, time: nowTime() });
    }
  }
  const bullishId = personaIds.find((id) => BULLISH.has(id));
  const skepticalId = personaIds.find((id) => SKEPTICAL.has(id));
  if (bullishId && skepticalId) {
    messages.push({
      id: makeMessageId(),
      author: skepticalId,
      text: buildDisagreement(skepticalId, firstName(bullishId, t), t),
      time: nowTime(),
      replyTo: bullishId,
    });
  }
  return messages;
}

/** Ответы на follow-up: персоны отвечают по ключевым словам, либо честный фолбэк. */
export function buildFollowUpReplies(
  personaIds: string[],
  topic: CouncilTopic,
  followUpText: string,
  t: Dictionary,
): CouncilChatMessage[] {
  if (personaIds.length === 0) return [];
  const talk = t.councilTalk;
  const rules: { personaId: string; test: RegExp; reply: string }[] = [
    {
      personaId: "resilience",
      test: talk.keywords.risk,
      reply: talk.riskReply(topic.businessUnit),
    },
    { personaId: "operator", test: talk.keywords.plan, reply: talk.planReply },
    { personaId: "contrarian", test: talk.keywords.agree, reply: talk.agreeReply },
  ];
  const matched = rules.filter(
    (rule) => rule.test.test(followUpText) && personaIds.includes(rule.personaId),
  );
  if (matched.length > 0) {
    return matched.map((rule) => ({
      id: makeMessageId(),
      author: rule.personaId,
      text: rule.reply,
      time: nowTime(),
    }));
  }
  return [
    {
      id: makeMessageId(),
      author: personaIds[0],
      text: talk.fallback,
      time: nowTime(),
    },
  ];
}

export function buildUserMessage(text: string): CouncilChatMessage {
  return { id: makeMessageId(), author: "user", text, time: nowTime() };
}

export const REACTION_EMOJIS = ["👍", "🤔", "😮", "🔥"];
