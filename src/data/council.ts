export interface CouncilPersona {
  id: string;
  name: string;
  initials: string;
  role: string;
  color: string;
}

export const COUNCIL_PERSONAS: CouncilPersona[] = [
  // Цвета подобраны на контраст ≥4.5:1 с белым текстом инициалов (WCAG AA).
  { id: "cfo", name: "Санжар Ахметов", initials: "SA", role: "Финансовый директор", color: "bg-amber-700" },
  { id: "legal", name: "Дана Бекова", initials: "DB", role: "Юрист", color: "bg-violet-600" },
  { id: "ops", name: "Ержан Мадиев", initials: "EM", role: "Операционный директор", color: "bg-blue-600" },
  { id: "hr", name: "Жанна Хан", initials: "JH", role: "HR-директор", color: "bg-teal-700" },
  { id: "strategy", name: "Самал Зейнеп", initials: "SZ", role: "Стратегический советник", color: "bg-orange-700" },
  { id: "external", name: "Марк Абрамс", initials: "MA", role: "Внешний консультант", color: "bg-fuchsia-600" },
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
    personaIds: ["strategy", "legal", "external"],
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
    personaIds: ["ops", "hr", "external"],
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
