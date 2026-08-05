export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  /** Реальный лидер — только как отсылка к стилю в bio. Никогда не источник цитаты. */
  inspiredBy: string;
  /** Одна фраза о философии персоны — раскрывается по hover/focus на карточке в галерее. */
  description: string;
  /** Основной цвет персоны — hex. Используется в обеих темах для солидной
   *  заливки (аватар, тег) и как база для рамки/кольца. */
  hex: string;
  /** Только у персон, чей `hex` не проходит WCAG 3:1 на тёмной карточке —
   *  более светлый вариант ТОЛЬКО для рамки/кольца в тёмной теме. */
  darkHex?: string;
  /** Короткое слово-тег архетипа для чипа под именем персоны. */
  tag: string;
}

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // hex/darkHex подобраны скриптом (OKLCH → sRGB → WCAG-контраст) — см.
  // docs/superpowers/specs/2026-08-04-council-visual-redesign-design.md §1
  // для полной таблицы контрастов. Не менять точечно без пересчёта.
  {
    id: "founder",
    name: "Артур Ким",
    initials: "AK",
    role: "Визионер-фаундер",
    inspiredBy: "Илона Маска",
    description: "Ставит на горизонт в 10 лет и не боится сжигать ресурсы ради прорыва.",
    hex: "#a75d00",
    tag: "Визионер",
  },
  {
    id: "operator",
    name: "Роза Ниязова",
    initials: "RN",
    role: "Операционный директор",
    inspiredBy: "Тима Кука",
    description: "Требует владельца процесса и метрику на каждом шаге — иначе идея не масштабируется.",
    hex: "#7c3aed",
    tag: "Оператор",
  },
  {
    id: "engineer",
    name: "Виктор Тен",
    initials: "VT",
    role: "Инженер-прагматик",
    inspiredBy: "Стива Возняка",
    description: "Сначала проверит, реализуемо ли это технически, и только потом обсудит стратегию.",
    hex: "#2563eb",
    tag: "Инженер",
  },
  {
    id: "contrarian",
    name: "Лейла Асанова",
    initials: "LA",
    role: "Контрарианка-инвестор",
    inspiredBy: "Джорджа Сороса",
    description: "Ищет, где консенсус рынка ошибается, и ставит именно на это расхождение.",
    hex: "#0f766e",
    tag: "Скептик",
  },
  {
    id: "industrialist",
    name: "Данияр Оспанов",
    initials: "DO",
    role: "Промышленник",
    inspiredBy: "Уоррена Баффета",
    description: "Ценит репутацию направления выше быстрой выгоды и не спешит с решением.",
    hex: "#c34700",
    tag: "Промышленник",
  },
  {
    id: "product",
    name: "Мила Ержанова",
    initials: "ME",
    role: "Продакт-лидер",
    inspiredBy: "Джеффа Безоса",
    description: "Возвращает любой спор к одному вопросу: стало ли лучше конечному пользователю.",
    hex: "#c026d3",
    tag: "Продакт",
  },
  {
    id: "brand",
    name: "Николь Багрова",
    initials: "NB",
    role: "Бренд-стратег",
    inspiredBy: "Ричарда Брэнсона",
    description: "Проверяет, можно ли объяснить решение простой историей — внутри компании и снаружи.",
    hex: "#c13892",
    tag: "Бренд",
  },
  {
    id: "platform",
    name: "Самат Ержигитов",
    initials: "SE",
    role: "Платформенный стратег",
    inspiredBy: "Сатьи Наделлы",
    description: "Смотрит, кто ещё выигрывает от решения, и выбирает партнёрства вместо контроля.",
    hex: "#4f46e5",
    darkHex: "#5954f3",
    tag: "Платформа",
  },
  {
    id: "competitor",
    name: "Алина Достаева",
    initials: "AD",
    role: "Директор по M&A",
    inspiredBy: "Ларри Эллисона",
    description: "Считает, что если мы не сделаем этот шаг первыми, это сделает конкурент.",
    hex: "#ce3452",
    tag: "M&A",
  },
  {
    id: "resilience",
    name: "Тимур Нурланов",
    initials: "TN",
    role: "Директор по устойчивости",
    inspiredBy: "Джека Ма",
    description: "Готовит направление к турбулентности заранее — рынок и регулятор не предупреждают.",
    hex: "#0e7490",
    tag: "Устойчивость",
  },
  {
    id: "scale",
    name: "Диана Рахимова",
    initials: "DR",
    role: "Операционная эффективность",
    inspiredBy: "Сэма Уолтона",
    description: "Считает каждый лишний доллар издержек упущенной маржой на масштабе.",
    hex: "#047857",
    tag: "Масштаб",
  },
  {
    id: "transform",
    name: "Ержан Тулегенов",
    initials: "ET",
    role: "Директор по трансформации",
    inspiredBy: "Мэри Барра",
    description: "Уверен: старые процессы не переживут решение без изменений в культуре команды.",
    hex: "#57534e",
    darkHex: "#6f6b66",
    tag: "Трансформация",
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
        `Без чёткого владельца процесса и метрик это не повторится на масштабе направления «${topic.businessUnit}».`,
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
        `Долгий горизонт: репутация направления «${topic.businessUnit}» стоит дороже быстрой выгоды.`,
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
        `В направлении «${topic.businessUnit}» партнёрства важнее, чем контроль над каждым шагом.`,
      ];
    case "competitor":
      return [
        `Конкурентно: ${topic.insight}`,
        `Если мы не сделаем этот шаг первыми, это сделает кто-то другой в направлении «${topic.businessUnit}».`,
      ];
    case "resilience":
      return [
        `Через призму устойчивости: регуляторная и рыночная турбулентность рано или поздно ударит по направлению «${topic.businessUnit}» — вопрос, готовы ли мы адаптироваться быстрее других.`,
      ];
    case "scale":
      return [
        `Эффективность прежде всего: ${topic.summary}`,
        `Каждый лишний доллар издержек на масштабе направления «${topic.businessUnit}» — упущенная маржа.`,
      ];
    case "transform":
      return [
        `Трансформационно: старые процессы в направлении «${topic.businessUnit}» не переживут это решение без изменений в культуре.`,
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
    reply: (t) => `Главный риск: «${t.businessUnit}» не прощает недооценённых сценариев.`,
  },
  {
    test: /план|дальше|шаг|первым/i,
    personaId: "operator",
    reply: () => `Первый шаг — назначить владельца процесса, без этого любой план стоит на месте.`,
  },
  {
    test: /согласны|друг с другом|спор/i,
    personaId: "contrarian",
    reply: () =>
      `Не совсем — именно в этом и смысл: если бы все соглашались, совет был бы не нужен.`,
  },
];

/** Экспортируется, чтобы UI мог отличить этот фолбэк от настоящего ответа
 *  (например, не показывать его как превью сессии в общем списке). */
export const FOLLOW_UP_FALLBACK_TEXT =
  "Тут нужен более предметный разбор — задайте вопрос конкретнее, и отвечу.";

/** Ответы на follow-up: 1+ персоны отвечают по ключевым словам, либо честный фолбэк, если нет совпадений. */
export function buildFollowUpReplies(
  personaIds: string[],
  topic: CouncilTopic,
  followUpText: string,
): CouncilChatMessage[] {
  if (personaIds.length === 0) return [];
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
      text: FOLLOW_UP_FALLBACK_TEXT,
      time: nowTime(),
    },
  ];
}

export function buildUserMessage(text: string): CouncilChatMessage {
  return { id: makeMessageId(), author: "user", text, time: nowTime() };
}

export const QUICK_REPLIES = [
  "Какие главные риски?",
  "Что бы вы сделали первым?",
  "Вы согласны друг с другом?",
  "Дайте конкретный план",
];

/** Фиксированный набор — никакого открытого пикера (см. спеку §7). */
export const REACTION_EMOJIS = ["👍", "🤔", "😮", "🔥"];
