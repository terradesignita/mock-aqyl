/**
 * Моковая модель AI-советника BI AQYL (ТЗ v1.0).
 * Вся логика детерминированная — точка подключения реального LLM одна:
 * заменить buildAnswer/classify на серверную функцию, интерфейс не меняется.
 */

export type DilemmaType =
  | "partnership"
  | "build_or_partner"
  | "sale"
  | "new_market"
  | "scaling"
  | "investment"
  | "org_model";

export interface ClarifyOption {
  id: string;
  label: string;
}

export interface ClarifyQuestion {
  id: string;
  title: string;
  multi: boolean;
  options: ClarifyOption[];
  /** Показывать вариант «Пока неизвестно» */
  unknown?: boolean;
  ownPlaceholder: string;
  /** Вопрос второго, адаптивного блока: показывается только при выборе триггера */
  triggeredBy?: { questionId: string; optionId: string };
}

export interface Dilemma {
  type: DilemmaType;
  label: string;
  /** Что определяет вывод в этом типе решений */
  drivers: string[];
  questions: ClarifyQuestion[];
}

export interface Answer {
  verdict: string;
  verdictDetail: string;
  insight: string;
  evidenceLevel: "высокий" | "средний" | "низкий" | "недостаточно данных";
  evidenceNote: string;
  arguments: string[];
  caseRef: {
    id: string;
    title: string;
    summary: string;
    applicability: "Высокая применимость" | "Частичная применимость" | "Слабая аналогия";
    matches: string[];
    differences: string[];
  };
  transferable: string[];
  nonTransferable: string[];
  scenarios: {
    name: string;
    speed: string;
    control: string;
    risk: string;
    when: string;
    recommended?: boolean;
  }[];
  recommendation: string;
  terms: string[];
  risks: string[];
  changeFactors: string[];
  missing: string[];
  sources: {
    id: string;
    title: string;
    kind: "Факт" | "Авторский анализ" | "Личная заметка" | "AI-материал";
    influence: "Определяющий" | "Подтверждающий" | "Контекстный";
    quote: string;
  }[];
}

/* ------------------------------------------------------------------ */
/* Уточняющие вопросы                                                  */
/* ------------------------------------------------------------------ */

const PARTNERSHIP_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "proof",
    title: "Что продукт уже доказал?",
    multi: true,
    options: [
      { id: "internal", label: "Эффект внутри компании" },
      { id: "external", label: "Внешний спрос от клиентов" },
      { id: "economics", label: "Экономику продаж вне компании" },
    ],
    unknown: true,
    ownPlaceholder: "Опишите, что уже подтверждено данными",
  },
  {
    id: "partner_gives",
    title: "Что даёт потенциальный партнёр?",
    multi: true,
    options: [
      { id: "clients", label: "Доступ к клиентам и канал продаж" },
      { id: "money", label: "Инвестиции и разделение затрат" },
      { id: "tech", label: "Технологию или экспертизу" },
    ],
    ownPlaceholder: "Что именно партнёр приносит в сделку",
  },
  {
    id: "partner_wants",
    title: "Что партнёр хочет получить?",
    multi: true,
    options: [
      { id: "share", label: "Долю в будущем бизнесе" },
      { id: "exclusive", label: "Эксклюзивность на рынке" },
      { id: "revenue", label: "Процент от выручки" },
    ],
    unknown: true,
    ownPlaceholder: "Условия, которые обсуждаются сейчас",
  },
  {
    id: "priority",
    title: "Что для вас сейчас важнее?",
    multi: false,
    options: [
      { id: "speed", label: "Быстро проверить рынок" },
      { id: "control", label: "Сохранить контроль над продуктом" },
      { id: "money_now", label: "Получить деньги сейчас" },
    ],
    ownPlaceholder: "Ваш приоритет своими словами",
  },
  {
    id: "exclusive_scope",
    title: "На что распространяется эксклюзивность?",
    multi: false,
    options: [
      { id: "kz", label: "Один рынок (например, Казахстан)" },
      { id: "segment", label: "Отдельный сегмент клиентов" },
      { id: "all", label: "Весь продукт без ограничений" },
    ],
    unknown: true,
    ownPlaceholder: "Границы эксклюзивности в предложении партнёра",
    triggeredBy: { questionId: "partner_wants", optionId: "exclusive" },
  },
];

const SALE_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "why",
    title: "Почему вы рассматриваете продажу?",
    multi: true,
    options: [
      { id: "focus", label: "Актив не в фокусе стратегии" },
      { id: "cash", label: "Нужны деньги на другие направления" },
      { id: "limit", label: "Нет ресурса развивать дальше" },
    ],
    ownPlaceholder: "Причина своими словами",
  },
  {
    id: "matters",
    title: "Что для вас важнее в сделке?",
    multi: false,
    options: [
      { id: "price", label: "Максимальная цена" },
      { id: "speed", label: "Скорость и определённость" },
      { id: "team", label: "Судьба команды и продукта" },
    ],
    ownPlaceholder: "Ваш приоритет",
  },
  {
    id: "no_deal",
    title: "Что произойдёт, если не продавать?",
    multi: false,
    options: [
      { id: "grow", label: "Актив продолжит расти сам" },
      { id: "stall", label: "Развитие остановится" },
      { id: "loss", label: "Начнём терять долю рынка" },
    ],
    unknown: true,
    ownPlaceholder: "Альтернативный сценарий",
  },
];

const MARKET_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "why",
    title: "Зачем вы хотите выйти на новый рынок?",
    multi: true,
    options: [
      { id: "growth", label: "Исчерпан рост на текущем рынке" },
      { id: "client", label: "Идём за конкретным клиентом" },
      { id: "diversify", label: "Диверсификация рисков" },
    ],
    ownPlaceholder: "Цель выхода",
  },
  {
    id: "known",
    title: "Что уже известно о рынке?",
    multi: true,
    options: [
      { id: "research", label: "Есть исследование и оценка спроса" },
      { id: "contacts", label: "Есть контакты и первые переговоры" },
      { id: "nothing", label: "Только общее представление" },
    ],
    unknown: true,
    ownPlaceholder: "Что подтверждено данными",
  },
  {
    id: "how",
    title: "Как планируется выход?",
    multi: false,
    options: [
      { id: "own", label: "Своими силами" },
      { id: "partner", label: "Через локального партнёра" },
      { id: "ma", label: "Через покупку игрока" },
    ],
    ownPlaceholder: "Модель выхода",
  },
];

const GENERIC_QUESTIONS: ClarifyQuestion[] = [
  {
    id: "goal",
    title: "Какого результата вы хотите достичь?",
    multi: true,
    options: [
      { id: "growth", label: "Рост выручки" },
      { id: "efficiency", label: "Эффективность и снижение затрат" },
      { id: "risk", label: "Снижение рисков" },
    ],
    ownPlaceholder: "Ожидаемый результат",
  },
  {
    id: "horizon",
    title: "На каком горизонте нужно решение?",
    multi: false,
    options: [
      { id: "now", label: "Ближайший квартал" },
      { id: "year", label: "В течение года" },
      { id: "long", label: "Стратегический горизонт 3+ года" },
    ],
    ownPlaceholder: "Ваш горизонт",
  },
  {
    id: "limits",
    title: "Какие ограничения важны?",
    multi: true,
    options: [
      { id: "budget", label: "Бюджет" },
      { id: "people", label: "Люди и компетенции" },
      { id: "time", label: "Рыночное окно" },
    ],
    unknown: true,
    ownPlaceholder: "Ограничения своими словами",
  },
];

export const DILEMMAS: Record<DilemmaType, Dilemma> = {
  partnership: {
    type: "partnership",
    label: "Партнёрство с внешней компанией",
    drivers: [
      "подтверждён ли внешний спрос",
      "что именно партнёр закрывает своим дефицитом",
      "какие права передаются и на какой срок",
    ],
    questions: PARTNERSHIP_QUESTIONS,
  },
  build_or_partner: {
    type: "build_or_partner",
    label: "Самостоятельное развитие или внешний партнёр",
    drivers: ["скорость выхода", "наличие альтернатив", "стоимость контроля"],
    questions: PARTNERSHIP_QUESTIONS,
  },
  sale: {
    type: "sale",
    label: "Продажа бизнеса или доли",
    drivers: ["стратегическая стоимость актива", "альтернатива без сделки", "необратимость"],
    questions: SALE_QUESTIONS,
  },
  new_market: {
    type: "new_market",
    label: "Выход на новый рынок",
    drivers: ["подтверждённость спроса", "модель входа", "стоимость ошибки"],
    questions: MARKET_QUESTIONS,
  },
  scaling: {
    type: "scaling",
    label: "Масштабирование",
    drivers: ["устойчивость юнит-экономики", "узкое место процесса", "готовность команды"],
    questions: GENERIC_QUESTIONS,
  },
  investment: {
    type: "investment",
    label: "Инвестиции и распределение ресурсов",
    drivers: ["альтернативная доходность", "обратимость", "горизонт эффекта"],
    questions: GENERIC_QUESTIONS,
  },
  org_model: {
    type: "org_model",
    label: "Организационная модель",
    drivers: ["владелец процесса", "скорость решений", "стоимость координации"],
    questions: GENERIC_QUESTIONS,
  },
};

const RULES: { type: DilemmaType; words: string[] }[] = [
  { type: "partnership", words: ["партн", "совмест", "альянс", "эксклюзив", "вместе"] },
  { type: "sale", words: ["прода", "долю", "выйти из бизнеса", "сделк"] },
  { type: "new_market", words: ["новый рынок", "рынок", "регион", "страну", "экспорт"] },
  { type: "scaling", words: ["масштаб", "тиражир", "рост", "расширить"] },
  { type: "investment", words: ["инвест", "бюджет", "вложить", "капитал"] },
  { type: "org_model", words: ["структур", "организац", "команд", "департамент"] },
];

/** Является ли запрос управленческим (а не поиском материалов). */
export function isManagerialQuery(q: string) {
  const t = q.trim().toLowerCase();
  if (t.length < 12) return false;
  const lookup = ["найди", "покажи", "материал", "документ", "презентац", "статья"];
  if (lookup.some((w) => t.startsWith(w))) return false;
  return true;
}

export function classify(query: string): Dilemma {
  const t = query.toLowerCase();
  for (const r of RULES) if (r.words.some((w) => t.includes(w))) return DILEMMAS[r.type];
  return DILEMMAS.build_or_partner;
}

/** Известные параметры, извлечённые из формулировки запроса. */
export function extractKnown(query: string): string[] {
  const t = query.toLowerCase();
  const out: string[] = [];
  if (/(продукт|решени|платформ|сервис)/.test(t)) out.push("речь о собственном продукте компании");
  if (/(партн|вместе|совмест)/.test(t)) out.push("рассматривается внешний партнёр");
  if (/(рынок|клиент|прода)/.test(t)) out.push("вопрос касается выхода к внешним клиентам");
  if (/(доля|эксклюзив|услови)/.test(t)) out.push("обсуждаются условия сделки");
  if (out.length === 0) out.push("управленческая ситуация без явных параметров в формулировке");
  return out;
}

export interface AdvisorSelection {
  /** questionId -> выбранные optionId */
  choices: Record<string, string[]>;
  /** questionId -> свой ответ */
  own: Record<string, string>;
  /** дополнительный контекст после проверки понимания */
  extraContext?: string;
}

export function visibleQuestions(d: Dilemma, sel: AdvisorSelection) {
  return d.questions.filter(
    (q) =>
      !q.triggeredBy ||
      (sel.choices[q.triggeredBy.questionId] ?? []).includes(q.triggeredBy.optionId),
  );
}

/** Достаточно ли контекста, чтобы формировать рекомендацию. */
export function contextIsSufficient(d: Dilemma, sel: AdvisorSelection) {
  const required = visibleQuestions(d, sel).filter((q) => !q.triggeredBy);
  return required.every((q) => (sel.choices[q.id]?.length ?? 0) > 0 || !!sel.own[q.id]?.trim());
}

const LABEL = (d: Dilemma, qId: string, oId: string) =>
  d.questions.find((q) => q.id === qId)?.options.find((o) => o.id === oId)?.label ?? oId;

/** Экран «Вот как я понял вашу ситуацию». */
export function buildUnderstanding(d: Dilemma, sel: AdvisorSelection, query: string): string {
  const parts: string[] = [];
  const has = (q: string, o: string) => (sel.choices[q] ?? []).includes(o);

  if (d.type === "partnership" || d.type === "build_or_partner") {
    parts.push(
      has("proof", "internal") && !has("proof", "external")
        ? "Внутренний продукт уже доказал эффект внутри компании, но подтверждённого внешнего спроса пока нет."
        : has("proof", "external")
          ? "Продукт имеет подтверждённый внешний спрос."
          : "Уровень доказанности продукта пока не зафиксирован данными.",
    );
    const gives = (sel.choices["partner_gives"] ?? []).map((o) => LABEL(d, "partner_gives", o));
    if (gives.length) parts.push(`Партнёр предлагает: ${gives.join(", ").toLowerCase()}.`);
    const wants = (sel.choices["partner_wants"] ?? []).map((o) => LABEL(d, "partner_wants", o));
    if (wants.length) parts.push(`Взамен он хочет: ${wants.join(", ").toLowerCase()}.`);
    const pr = sel.choices["priority"]?.[0];
    if (pr) parts.push(`Для BI Group сейчас приоритет — ${LABEL(d, "priority", pr).toLowerCase()}.`);
    const sc = sel.choices["exclusive_scope"]?.[0];
    if (sc) parts.push(`Эксклюзивность обсуждается в границах: ${LABEL(d, "exclusive_scope", sc).toLowerCase()}.`);
  } else {
    parts.push(`Тип решения: ${d.label.toLowerCase()}.`);
    for (const q of visibleQuestions(d, sel)) {
      const picked = (sel.choices[q.id] ?? []).map((o) => LABEL(d, q.id, o));
      if (picked.length) parts.push(`${q.title} — ${picked.join(", ").toLowerCase()}.`);
    }
  }

  const owns = Object.values(sel.own).filter((v) => v.trim());
  if (owns.length) parts.push(`Ваши уточнения: ${owns.join("; ")}.`);
  if (sel.extraContext?.trim()) parts.push(sel.extraContext.trim());
  if (parts.length < 2) parts.push(`Исходная формулировка: «${query.trim()}».`);
  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/* Ответ                                                               */
/* ------------------------------------------------------------------ */

const DR_JOHNS: Answer["caseRef"] = {
  id: "case_dr_johns",
  title: "Dr. John's Products",
  summary:
    "Небольшая компания с быстро растущим продуктом выбирала между самостоятельным развитием, союзом с крупным игроком и продажей. На момент решения продукт уже имел доказанный спрос и присутствие в крупных каналах продаж.",
  applicability: "Частичная применимость",
  matches: [
    "продукт с доказанным эффектом и ограниченным ресурсом на масштабирование",
    "крупный контрагент предлагает канал в обмен на права",
    "решение принимается до подтверждения полной рыночной стоимости",
  ],
  differences: [
    "в кейсе спрос был подтверждён внешним рынком, у BI Group — пока внутренним",
    "потребительский товар против цифрового B2B-продукта",
    "у Dr. John's были альтернативные покупатели — переговорная сила выше",
  ],
};

export function buildAnswer(d: Dilemma, sel: AdvisorSelection): Answer {
  const has = (q: string, o: string) => (sel.choices[q] ?? []).includes(o);
  const externalProven = has("proof", "external") || has("proof", "economics");
  const wantsShare = has("partner_wants", "share");
  const wantsExclusive = has("partner_wants", "exclusive");
  const priority = sel.choices["priority"]?.[0];
  const unknownTerms = has("partner_wants", "__unknown") || has("proof", "__unknown");

  const evidenceLevel: Answer["evidenceLevel"] = unknownTerms
    ? "недостаточно данных"
    : externalProven
      ? "средний"
      : "средний";

  const verdict = externalProven
    ? "Идти в партнёрство можно, но с ограниченными правами и измеримыми обязательствами партнёра."
    : "Не соглашаться на предложенные условия в текущем виде.";

  return {
    verdict,
    verdictDetail: externalProven
      ? "Внешний спрос подтверждён, поэтому канал партнёра ускоряет рост. Но передавать долю и эксклюзивность до фиксации рыночной цены продукта преждевременно."
      : "Партнёрство может ускорить проверку внешнего спроса, но передача значительной доли и долгосрочной эксклюзивности до подтверждения рыночной ценности продукта создаёт несоразмерный риск для BI Group.",
    insight:
      "Сейчас BI Group следует продавать партнёру ограниченное право проверить канал, а не долю в будущем бизнесе.",
    evidenceLevel,
    evidenceNote: unknownTerms
      ? "Ключевые условия сделки не зафиксированы, поэтому вывод носит рамочный характер и должен быть пересмотрен после получения проекта соглашения."
      : "Кейс Dr. John's хорошо подтверждает логику переговорной силы, но не содержит полностью совпадающей модели цифрового B2B-партнёрства.",
    arguments: [
      externalProven
        ? "Внешний спрос подтверждён — переговорная позиция уже сильнее, чем на старте."
        : "Внешний спрос ещё не подтверждён.",
      "Рыночная стоимость продукта пока неизвестна.",
      wantsShare || wantsExclusive
        ? "Партнёр получает долгосрочные права, опираясь на будущий потенциал."
        : "Обязательства партнёра пока не выражены в измеримых показателях.",
      priority === "speed"
        ? "Скорость критична, но её можно купить пилотом, а не долей."
        : "Самостоятельный выход возможен, хотя и займёт больше времени.",
    ],
    caseRef: {
      ...DR_JOHNS,
      applicability: externalProven ? "Высокая применимость" : "Частичная применимость",
    },
    transferable: [
      "ценность продукта растёт после подтверждения спроса",
      "переговорная сила зависит от наличия альтернатив",
      "крупный партнёр может покупать не продукт, а скорость",
      "стратегическая стоимость выше текущей финансовой стоимости",
    ],
    nonTransferable: [
      "прямое сравнение мультипликаторов и оценки сделки",
      "структура сделки потребительского рынка",
      "предположение о наличии нескольких конкурирующих покупателей",
    ],
    scenarios: [
      {
        name: "Самостоятельный выход",
        speed: "Низкая",
        control: "Высокий",
        risk: "Средний",
        when: "Если время не критично",
      },
      {
        name: "Ограниченный пилот с партнёром",
        speed: "Высокая",
        control: "Высокий",
        risk: "Низкий",
        when: "Для проверки рынка",
        recommended: true,
      },
      {
        name: "Эксклюзивное партнёрство",
        speed: "Высокая",
        control: "Низкий",
        risk: "Высокий",
        when: "При гарантированном объёме",
      },
      {
        name: "Совместное предприятие",
        speed: "Средняя",
        control: "Средний",
        risk: "Высокий",
        when: "После подтверждения экономики",
      },
      {
        name: "Продажа продукта",
        speed: "Высокая",
        control: "Отсутствует",
        risk: "Необратимый",
        when: "Если холдинг не хочет строить бизнес",
      },
    ],
    recommendation:
      "Предпочтительный сценарий — ограниченный коммерческий пилот на 6–9 месяцев без передачи доли и без широкой эксклюзивности.",
    terms: [
      "ограниченный сегмент клиентов",
      "ограниченный срок",
      "измеримые KPI",
      "минимальный гарантированный объём",
      "права на данные сохраняются",
      "интеллектуальная собственность остаётся у BI Group",
      "отсутствует автоматическое продление",
      "есть право прекращения",
      "обсуждение доли переносится на этап подтверждённой выручки",
    ],
    risks: [
      "партнёр не обеспечит заявленный канал",
      "продукт окажется слишком зависим от внутренних процессов BI Group",
      "внешний спрос будет слабее внутреннего",
      "партнёр получит доступ к технологии без достаточной компенсации",
      "эксклюзивность ограничит другие каналы",
      "стороны будут по-разному оценивать вклад в развитие",
    ],
    changeFactors: [
      "гарантированный объём продаж",
      "значительные инвестиции партнёра",
      "короткое рыночное окно",
      "наличие сильного конкурента",
      "отсутствие возможности самостоятельного выхода",
      "международный канал",
      "уникальная технология партнёра",
      "высокая стоимость поддержки",
    ],
    missing: [
      "проект соглашения",
      "оценка продукта",
      "прогноз внешней выручки",
      "обязательства партнёра",
      "срок и границы эксклюзивности",
      "правила владения данными",
      "условия выхода из партнёрства",
    ],
    sources: [
      {
        id: "src_case_facts",
        title: "Dr. John's Products — материалы кейса",
        kind: "Факт",
        influence: "Определяющий",
        quote:
          "К моменту решения продукт был представлен в крупных розничных сетях, а рост продаж подтверждался данными каналов, а не прогнозом менеджмента.",
      },
      {
        id: "src_case_analysis",
        title: "Разбор кейса: вопросы преподавателя HBS",
        kind: "Авторский анализ",
        influence: "Подтверждающий",
        quote:
          "Стратегический покупатель оценивает не только прибыль актива, но и стоимость закрытия пробела в собственном портфеле и риск бездействия.",
      },
      {
        id: "src_ll_bi",
        title: "Lessons Learned: пилоты с внешними партнёрами",
        kind: "Факт",
        influence: "Подтверждающий",
        quote:
          "Пилоты без измеримых KPI и минимального гарантированного объёма в 3 из 4 случаев не привели к росту внешней выручки.",
      },
      {
        id: "src_note",
        title: "Заметка со стратегической сессии по цифровым продуктам",
        kind: "Личная заметка",
        influence: "Контекстный",
        quote:
          "Договорились: права на данные и IP по внутренним продуктам не передаются до подтверждения внешней экономики.",
      },
    ],
  };
}

export const THINKING_STEPS = [
  "Определяю тип управленческого решения",
  "Собираю параметры ситуации из ваших ответов",
  "Ищу релевантные кейсы по смыслу, а не по словам",
  "Оцениваю применимость и различия",
  "Формирую варианты, рекомендацию и риски",
];

export const ADVISOR_EXAMPLES = [
  "У нас есть внутренний AI-продукт. Партнёр предлагает вывести его на рынок вместе. Стоит ли соглашаться?",
  "Стоит ли выходить на рынок Узбекистана самостоятельно или через локального партнёра?",
  "Продавать ли долю в непрофильном активе сейчас или развивать его дальше?",
];
