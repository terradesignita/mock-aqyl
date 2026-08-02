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
  { id: "founder", name: "Артур Ким", initials: "AK", role: "Визионер-фаундер", inspiredBy: "Илона Маска", color: "bg-amber-700" },
  { id: "operator", name: "Роза Ниязова", initials: "RN", role: "Операционный директор", inspiredBy: "Тима Кука", color: "bg-violet-600" },
  { id: "engineer", name: "Виктор Тен", initials: "VT", role: "Инженер-прагматик", inspiredBy: "Стива Возняка", color: "bg-blue-600" },
  { id: "contrarian", name: "Лейла Асанова", initials: "LA", role: "Контрарианка-инвестор", inspiredBy: "Джорджа Сороса", color: "bg-teal-700" },
  { id: "industrialist", name: "Данияр Оспанов", initials: "DO", role: "Промышленник", inspiredBy: "Уоррена Баффета", color: "bg-orange-700" },
  { id: "product", name: "Мила Ержанова", initials: "ME", role: "Продакт-лидер", inspiredBy: "Джеффа Безоса", color: "bg-fuchsia-600" },
  { id: "brand", name: "Николь Багрова", initials: "NB", role: "Бренд-стратег", inspiredBy: "Ричарда Брэнсона", color: "bg-rose-700" },
  { id: "platform", name: "Самат Ержигитов", initials: "SE", role: "Платформенный стратег", inspiredBy: "Сатьи Наделлы", color: "bg-indigo-600" },
  { id: "competitor", name: "Алина Достаева", initials: "AD", role: "Директор по M&A", inspiredBy: "Ларри Эллисона", color: "bg-red-700" },
  { id: "resilience", name: "Тимур Нурланов", initials: "TN", role: "Директор по устойчивости", inspiredBy: "Джека Ма", color: "bg-cyan-700" },
  { id: "scale", name: "Диана Рахимова", initials: "DR", role: "Операционная эффективность", inspiredBy: "Сэма Уолтона", color: "bg-emerald-700" },
  { id: "transform", name: "Ержан Тулегенов", initials: "ET", role: "Директор по трансформации", inspiredBy: "Мэри Барра", color: "bg-stone-600" },
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
  return [0, 5, 10].map((offset) => ids[(start + offset) % ids.length]);
}

export interface CouncilSession {
  id: string;
  title: string;
  date: string;
  personaIds: string[];
  unread?: boolean;
  topic: CouncilTopic;
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
  },
];

export function buildPersonaTake(personaId: string, topic: CouncilTopic): string {
  switch (personaId) {
    case "cfo":
      return `Финансово: ${topic.insight} Прежде чем двигаться дальше, нужно оценить эффект на денежный поток «${topic.businessUnit}» на горизонте 6–12 месяцев.`;
    case "legal":
      return `С юридической стороны: главный риск в «${topic.title}» — нечётко зафиксированные права и обязательства сторон. Это нужно закрыть до подписания.`;
    case "ops":
      return `Операционно: ${topic.summary} Без выделенного владельца процесса результат не повторится на масштабе.`;
    case "hr":
      return `С точки зрения людей: успех зависит от того, кто в «${topic.businessUnit}» реально возьмёт на себя ответственность и как будет организовано сопровождение команды.`;
    case "strategy":
      return `Стратегически: ${topic.insight} Вопрос в том, усиливает ли это долгосрочную позицию компании или создаёт зависимость.`;
    case "external":
      return `Взгляд со стороны: похожие ситуации на рынке подтверждают — ${topic.insight.toLowerCase()} Стоит сверить с независимым бенчмарком, прежде чем финализировать.`;
    default:
      return topic.insight;
  }
}
