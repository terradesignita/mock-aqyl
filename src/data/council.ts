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

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * ponytail: детерминированный подбор по хэшу заголовка+бизнес-юнита,
 * не семантическое сопоставление темы и архетипа. Заменить на более
 * умную логику, если подбор будет систематически невпопад.
 */
export function suggestPersonas(topic: CouncilTopic): string[] {
  const ids = COUNCIL_PERSONAS.map((p) => p.id);
  const start = hashString(topic.title + topic.businessUnit) % ids.length;
  // Use step size derived from roster length to guarantee 3 unique offsets
  // for any roster size >= 3, not just the current length of 12.
  const step = Math.max(1, Math.floor(ids.length / 3));
  return [0, step, 2 * step].map((offset) => ids[(start + offset) % ids.length]);
}

export interface CouncilSession {
  id: string;
  title: string;
  date: string;
  personaIds: string[];
  followUps: string[];
  unread?: boolean;
  topic: CouncilTopic;
}

export const SEED_COUNCIL_SESSIONS: CouncilSession[] = [
  {
    id: "seed-1",
    title: "Iz Lynn Chan at Far East Organization (Abridged)",
    date: "30.07.2026",
    personaIds: ["founder", "contrarian", "transform"],
    followUps: [],
    topic: {
      title: "Iz Lynn Chan at Far East Organization (Abridged)",
      summary:
        "Региональный директор должна решить, продвигать ли local-hire менеджера в обход более опытного экспата, балансируя результативность и организационные ожидания.",
      insight:
        "Формальный стаж не гарантирует результат — решение о повышении должно опираться на измеримый вклад, а не на срок работы.",
      businessUnit: "Дальний Восток",
    },
  },
  {
    id: "seed-2",
    title: "SpinBrush",
    date: "28.07.2026",
    personaIds: ["operator", "competitor", "resilience"],
    followUps: [],
    unread: true,
    topic: {
      title: "SpinBrush",
      summary:
        "Маленькая компания с быстро растущим продуктом выбирает между самостоятельным ростом, партнёрством с крупным игроком и продажей бизнеса.",
      insight:
        "Переговорная сила резко возрастает после подтверждения внешнего спроса — до этого момента долгосрочные права лучше не отдавать.",
      businessUnit: "Товары для дома",
    },
  },
];

export function buildPersonaTake(personaId: string, topic: CouncilTopic): string {
  switch (personaId) {
    case "founder":
      return `Смело: ${topic.insight} Если это не меняет правила игры на горизонте 10 лет — не стоит тратить на это ресурсы.`;
    case "operator":
      return `Операционно: ${topic.summary} Без чёткого владельца процесса и метрик это не повторится на масштабе «${topic.businessUnit}».`;
    case "engineer":
      return `Технически: прежде чем говорить про «${topic.title}», нужно проверить, что это вообще реализуемо без скрытых допущений.`;
    case "contrarian":
      return `Контрарианский взгляд: рынок наверняка уже заложил обратное — ${topic.insight.toLowerCase()} Стоит поставить на то, где консенсус ошибается.`;
    case "industrialist":
      return `Долгий горизонт: репутация «${topic.businessUnit}» стоит дороже быстрой выгоды. ${topic.insight} Спешить не буду.`;
    case "product":
      return `С точки зрения клиента: ${topic.summary} Если это не улучшает жизнь конечного пользователя — вопрос ещё не решён.`;
    case "brand":
      return `История имеет значение: как мы объясним «${topic.title}» людям внутри и снаружи компании? ${topic.insight}`;
    case "platform":
      return `Экосистемно: кто ещё выигрывает от «${topic.title}», если мы пойдём этим путём? В «${topic.businessUnit}» партнёрства важнее, чем контроль над каждым шагом.`;
    case "competitor":
      return `Конкурентно: ${topic.insight} Если мы не сделаем этот шаг первыми, это сделает кто-то другой в «${topic.businessUnit}».`;
    case "resilience":
      return `Через призму устойчивости: регуляторная и рыночная турбулентность рано или поздно ударит по «${topic.businessUnit}» — вопрос, готовы ли мы адаптироваться быстрее других.`;
    case "scale":
      return `Эффективность прежде всего: ${topic.summary} Каждый лишний доллар издержек на масштабе «${topic.businessUnit}» — упущенная маржа.`;
    case "transform":
      return `Трансформационно: старые процессы в «${topic.businessUnit}» не переживут это решение без изменений в культуре. ${topic.insight}`;
    default:
      return topic.insight;
  }
}

export interface CouncilVerdict {
  synthesis: string;
  openQuestions: string[];
  agreements: { label: string; kind: "agree" | "risk" }[];
}

const PERSONA_QUESTIONS: Record<string, string> = {
  founder: "Меняет ли это правила игры для компании на годы вперёд?",
  operator: "Кто станет владельцем процесса после запуска?",
  engineer: "Что произойдёт при провале ключевого допущения?",
  contrarian: "Где консенсус рынка может ошибаться?",
  industrialist: "Стоит ли краткосрочная выгода долгосрочной репутации?",
  product: "Как это меняет жизнь конечного клиента?",
  brand: "Как мы объясним это решение публично?",
  platform: "Кто ещё выигрывает от этого решения?",
  competitor: "Кто сделает этот шаг, если не мы?",
  resilience: "Что если регуляторная ситуация изменится?",
  scale: "Где здесь скрытые издержки на масштабе?",
  transform: "Готова ли культура компании к этому изменению?",
};

const RISK_PERSONAS = new Set(["contrarian", "competitor", "resilience"]);

function buildAgreements(
  personaIds: string[],
  topic: CouncilTopic,
): { label: string; kind: "agree" | "risk" }[] {
  const agreements: { label: string; kind: "agree" | "risk" }[] = [
    {
      label: topic.insight.length > 40 ? `${topic.insight.slice(0, 40)}…` : topic.insight,
      kind: "agree",
    },
  ];
  if (personaIds.some((id) => RISK_PERSONAS.has(id))) {
    agreements.push({ label: `Риск: сроки и допущения по «${topic.businessUnit}»`, kind: "risk" });
  }
  return agreements;
}

export function buildVerdict(
  topic: CouncilTopic,
  personaIds: string[],
  followUps: string[],
): CouncilVerdict {
  const latest = followUps[followUps.length - 1];
  const synthesis = latest
    ? personaIds.length > 1
      ? `${topic.insight} По вопросу «${latest}» совет расходится в деталях, но не в сути: решение зависит от того, какой риск готова принять компания.`
      : `${topic.insight} По вопросу «${latest}»: ключевой фактор — какой риск готова принять компания.`
    : topic.insight;

  return {
    synthesis,
    openQuestions: personaIds
      .map((id) => PERSONA_QUESTIONS[id] ?? topic.insight)
      .filter((q) => !followUps.includes(q)),
    agreements: buildAgreements(personaIds, topic),
  };
}
