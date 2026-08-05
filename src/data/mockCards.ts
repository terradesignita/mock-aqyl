export type Scope = "INTERNAL" | "EXTERNAL";
export type Lang = "RU" | "EN" | "KK" | "UZ" | "AZ";
export type MediaType = "document" | "video" | "podcast" | "presentation";

export interface FrameworkStep {
  step: string;
  description: string;
}

export interface Citation {
  chunk_id: string;
  source_anchor: string;
}

export interface KnowledgeCardData {
  id: string;
  title: string;
  executive_summary: string;
  core_insight: string;
  framework?: FrameworkStep[];
  citations: Citation[];
  source: string;
  author: string;
  language: Lang;
  scope: Scope;
  relevance: number;
  date: string;
  media_type: MediaType;
  business_unit: string;
  tags: string[];
  /** Только что добавлен и распознан — показать бейдж "Новый" до первого открытия. */
  isNew?: boolean;
}

export const BUSINESS_UNITS = [
  "Строительство",
  "Девелопмент",
  "Промышленность",
  "Корпоративный центр",
  "Финансы",
  "HR",
];

export interface TopicTag {
  label: string;
  description: string;
}

export const TOPIC_TAGS: TopicTag[] = [
  {
    label: "Качество",
    description: "Дефекты, стандарты отделки, контроль на объекте, выявление проблем",
  },
  {
    label: "Безопасность",
    description: "Техника безопасности на площадке, охрана труда, incidents, prevention",
  },
  {
    label: "Проекты",
    description: "Сроки, бюджет, ресурсы, координация подрядчиков, риски задержек",
  },
  {
    label: "Эффективность",
    description: "Оптимизация процессов, автоматизация на стройке, sunk time, затраты",
  },
  {
    label: "Стандартизация",
    description: "Унификация процессов, воспроизводимость, checklist, система контроля",
  },
  {
    label: "Сроки",
    description: "Планирование, отслеживание прогресса, причины задержек, управление рисками",
  },
  {
    label: "NPS",
    description: "NPS покупателей, передача ключей, обслуживание после продажи, жалобы",
  },
  { label: "Опыт", description: "От первого контакта до получения ключей, touchpoints, journey" },
  {
    label: "Лояльность",
    description:
      "Repeat purchases, lifetime value, loyalty программы, почему клиент уходит к конкурентам",
  },
  {
    label: "Ценообразование",
    description:
      "Расчёт стоимости, EVC, стратегия цены, позиционирование по цене, переговоры о цене",
  },
  {
    label: "Маркетинг",
    description:
      "Позиционирование, бренд-коммуникации, customer journey, омниканальность, Digital vs Offline",
  },
  {
    label: "Инновация",
    description:
      "Разработка нового продукта, услуги или бизнес-модели; вывод на рынок; преодоление барьеров",
  },
  {
    label: "Конкуренция",
    description: "Отличие от других застройщиков, уникальность предложения, positioning",
  },
  {
    label: "Рост",
    description: "Расширение, масштабирование, пересчёт ёмкости, стратегия роста, риски при росте",
  },
  {
    label: "Локализация",
    description:
      "Различия между регионами, адаптация к местным условиям, масштабирование по географиям",
  },
  {
    label: "Стратегия",
    description: "Долгосрочное позиционирование, выбор рынков (Ansoff), конкурентное преимущество",
  },
  {
    label: "Масштабирование",
    description:
      "Готовность системы расти, сохранение качества при росте, воспроизводимость модели",
  },
  {
    label: "Бренд",
    description: "Идентичность, репутация, resonance с аудиторией, возрождение бренда, ассоциации",
  },
  {
    label: "Доверие",
    description:
      "В отсутствующем рынке, сигналы надёжности, репутация, честность, transparent mechanics",
  },
  {
    label: "Лидерство",
    description:
      "Руководство людьми, принятие решений в кризис, видение, развитие команды, персональный стиль",
  },
  {
    label: "Культура",
    description:
      "Ценности компании, символы и нормы, как транслируются убеждения, культурные конфликты",
  },
  {
    label: "Ценности",
    description: "Принципы лидера/компании, во что люди верят, на что готовы идти на компромисс",
  },
  {
    label: "Команда",
    description: "Состав, динамика, эффективность, разнообразие, развитие способностей членов",
  },
  {
    label: "HR",
    description:
      "Найм, развитие персонала, retention, compensation, культурный fit, succession planning",
  },
  {
    label: "Управление",
    description: "Принятие решений, управленческие механики, процессы, контроль, делегирование",
  },
  {
    label: "Переговоры",
    description: "Торг с клиентом, с инвесторами, закрытие сделки, влияние и power dynamics",
  },
  {
    label: "Перемены",
    description: "Трансформация, организационные сдвиги, resistance to change, change management",
  },
  {
    label: "Трансформация",
    description: "Кардинальное переизобретение, поворот стратегии, спасение от упадка",
  },
  {
    label: "Аналитика",
    description:
      "Анализ данных, ML-модели, прогнозирование, insights, поведенческие паттерны, data-driven decisions",
  },
  {
    label: "Обучение",
    description:
      "Сохранение экспертизы, обучение команды, документирование процессов, передача опыта",
  },
  {
    label: "Финансы",
    description:
      "ROI, расчёт эффекта проекта, бюджетирование, экономия средств, обоснование инвестиций",
  },
  {
    label: "Принципы",
    description:
      "Ключевые принципы, фреймворки, алгоритмы действий, которые можно применить в других контекстах; transferable insights",
  },
];

export const mockCards: KnowledgeCardData[] = [
  {
    id: "card_001",
    title: "Framework: Risk Management Maturity Model",
    executive_summary:
      "4-уровневая модель оценки зрелости системы управления рисками: от реактивного к проактивному подходу.",
    core_insight:
      "Компании на уровне 3–4 демонстрируют на 35% меньше убытков от операционных рисков.",
    framework: [
      { step: "1. Assess", description: "Оценить текущее состояние процессов управления рисками" },
      { step: "2. Map", description: "Определить критические риск-области и владельцев" },
      { step: "3. Control", description: "Внедрить контроли и регулярный мониторинг" },
      { step: "4. Optimize", description: "Автоматизировать сбор сигналов и оптимизировать реакцию" },
    ],
    citations: [
      { chunk_id: "chunk_42", source_anchor: "Деловой отчёт компании Z (2024, стр. 15)" },
      { chunk_id: "chunk_43", source_anchor: "McKinsey Report: Enterprise Risk Management" },
    ],
    source: "Lessons Learned Database",
    author: "Отдел риск-менеджмента",
    language: "RU",
    scope: "INTERNAL",
    relevance: 94,
    date: "2024-11-15",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["управление рисками", "процессы"],
    isNew: true,
  },
  {
    id: "card_002",
    title: "Уроки внедрения BIM на крупных объектах",
    executive_summary:
      "Синтез 14 проектов: где BIM-модель реально экономит время, а где становится дорогой формальностью.",
    core_insight:
      "Экономия появляется только когда модель ведут подрядчики, а не проектный офис: −18% переделок.",
    framework: [
      { step: "1. Договор", description: "Требование вести модель зашивается в контракт подрядчика" },
      { step: "2. Регламент", description: "Единый classifier и цикл обновления модели раз в неделю" },
      { step: "3. Контроль", description: "Коллизии закрываются до выхода на площадку" },
    ],
    citations: [
      { chunk_id: "chunk_88", source_anchor: "Lessons Learned: ЖК «Северный», раздел 4" },
      { chunk_id: "chunk_91", source_anchor: "Отчёт технадзора Q3 2024" },
      { chunk_id: "chunk_92", source_anchor: "Интервью с руководителем СМР" },
    ],
    source: "Lessons Learned BI",
    author: "Проектный офис",
    language: "RU",
    scope: "INTERNAL",
    relevance: 91,
    date: "2025-02-04",
    media_type: "presentation",
    business_unit: "Строительство",
    tags: ["bim", "операционная эффективность"],
  },
  {
    id: "card_003",
    title: "HBS Case: Amazon's Two-Pizza Teams",
    executive_summary:
      "Как ограничение размера команды меняет скорость принятия решений и владение результатом.",
    core_insight:
      "Автономия без чётких интерфейсов между командами превращается в хаос — контракт API важнее размера.",
    framework: [
      { step: "1. Ownership", description: "Одна команда — один сервис и один измеримый результат" },
      { step: "2. Interface", description: "Взаимодействие только через явные контракты" },
      { step: "3. Metrics", description: "Команда сама видит свои метрики в реальном времени" },
    ],
    citations: [
      { chunk_id: "chunk_11", source_anchor: "HBS Case 9-716-402, p. 7" },
      { chunk_id: "chunk_12", source_anchor: "Working Backwards, ch. 3" },
    ],
    source: "Harvard Business School",
    author: "HBS Publishing",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 89,
    date: "2024-06-21",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["лидерство", "организация"],
  },
  {
    id: "card_004",
    title: "Цифровая трансформация: почему 70% программ буксуют",
    executive_summary:
      "Мета-обзор исследований: главные причины провала — не технологии, а отсутствие владельца изменений.",
    core_insight:
      "Программы с выделенным CxO-спонсором и квартальными точками отказа успешны в 2,4 раза чаще.",
    citations: [
      { chunk_id: "chunk_201", source_anchor: "BCG: Digital Transformation Survey 2024" },
      { chunk_id: "chunk_202", source_anchor: "MIT Sloan Review, Winter 2024" },
    ],
    source: "Внешняя библиотека исследований",
    author: "BCG / MIT Sloan",
    language: "RU",
    scope: "EXTERNAL",
    relevance: 87,
    date: "2025-01-09",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["трансформация", "изменения"],
  },
  {
    id: "card_005",
    title: "Подкаст: как мы сократили цикл закупки с 45 до 19 дней",
    executive_summary:
      "Разбор внутреннего кейса закупочной службы: три узких места и решения, которые сработали.",
    core_insight:
      "80% задержек давали не согласования, а неполные технические задания на входе.",
    framework: [
      { step: "1. Шаблон ТЗ", description: "Обязательный чек-лист полноты перед регистрацией заявки" },
      { step: "2. Параллель", description: "Юридическая и техническая проверка идут одновременно" },
      { step: "3. SLA", description: "Явные сроки на каждом шаге и эскалация при просрочке" },
    ],
    citations: [
      { chunk_id: "chunk_310", source_anchor: "Подкаст «Внутри BI», выпуск 12, 14:20" },
      { chunk_id: "chunk_311", source_anchor: "Отчёт службы закупок, 2025" },
    ],
    source: "Lessons Learned BI",
    author: "Служба закупок",
    language: "RU",
    scope: "INTERNAL",
    relevance: 85,
    date: "2025-03-18",
    media_type: "podcast",
    business_unit: "Промышленность",
    tags: ["операционная эффективность", "закупки"],
  },
  {
    id: "card_006",
    title: "Innovation Portfolio: 70-20-10 Rule",
    executive_summary:
      "Как распределять инвестиции между ядром, смежными и прорывными инициативами.",
    core_insight:
      "Компании, удерживающие 10% на прорывные ставки 5+ лет, дают на 30% больший TSR.",
    framework: [
      { step: "70% Core", description: "Улучшение текущего бизнеса" },
      { step: "20% Adjacent", description: "Смежные рынки и продукты" },
      { step: "10% Transformational", description: "Прорывные ставки с длинным горизонтом" },
    ],
    citations: [
      { chunk_id: "chunk_44", source_anchor: "HBR: Managing Your Innovation Portfolio" },
      { chunk_id: "chunk_45", source_anchor: "Google X: Moonshot Principles" },
    ],
    source: "Harvard Business Review",
    author: "Nagji & Tuff",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 84,
    date: "2024-09-02",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["инновации", "портфель"],
  },
  {
    id: "card_007",
    title: "Тәуекелдерді басқару: практикалық бақылау парағы",
    executive_summary:
      "Жоба деңгейінде тәуекелдерді анықтауға және бақылауға арналған қысқа чек-лист.",
    core_insight:
      "Тәуекел иесі тағайындалмаған жағдайда, шаралардың 60%-ы орындалмайды.",
    citations: [
      { chunk_id: "chunk_501", source_anchor: "Ішкі әдістеме, 2025, 8-бет" },
    ],
    source: "Lessons Learned BI",
    author: "Регионалды офис",
    language: "KK",
    scope: "INTERNAL",
    relevance: 82,
    date: "2025-04-11",
    media_type: "document",
    business_unit: "Строительство",
    tags: ["управление рисками"],
  },
  {
    id: "card_008",
    title: "Видео-разбор: переговоры с крупным поставщиком",
    executive_summary:
      "Запись внутреннего тренинга: подготовка BATNA и работа с ценовым давлением.",
    core_insight:
      "Сильнейший рычаг — заранее просчитанная альтернатива, а не переговорная техника.",
    framework: [
      { step: "1. BATNA", description: "Просчитать лучшую альтернативу до встречи" },
      { step: "2. Anchor", description: "Первое предложение опирается на данные рынка" },
      { step: "3. Trade", description: "Уступки только в обмен на встречные условия" },
    ],
    citations: [
      { chunk_id: "chunk_620", source_anchor: "Тренинг «Переговоры», 32:10" },
      { chunk_id: "chunk_621", source_anchor: "Getting to Yes, ch. 6" },
    ],
    source: "Корпоративный университет",
    author: "Академия BI",
    language: "RU",
    scope: "INTERNAL",
    relevance: 80,
    date: "2024-12-01",
    media_type: "video",
    business_unit: "Финансы",
    tags: ["переговоры", "лидерство"],
  },
  {
    id: "card_009",
    title: "Netflix Culture Deck: контекст вместо контроля",
    executive_summary:
      "Как заменить процессный контроль передачей контекста и высокой планкой найма.",
    core_insight:
      "Свобода работает только при высокой плотности таланта — иначе растёт стоимость ошибок.",
    citations: [
      { chunk_id: "chunk_70", source_anchor: "Netflix Culture Deck, slide 45" },
      { chunk_id: "chunk_71", source_anchor: "No Rules Rules, ch. 2" },
    ],
    source: "Внешняя библиотека",
    author: "Reed Hastings",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 79,
    date: "2024-05-30",
    media_type: "presentation",
    business_unit: "HR",
    tags: ["культура", "лидерство"],
  },
  {
    id: "card_010",
    title: "Себестоимость: 6 драйверов отклонений на площадке",
    executive_summary:
      "Аналитика 30 объектов: где фактическая себестоимость чаще всего уходит от плана.",
    core_insight:
      "Половину отклонений даёт простой техники — управление графиком важнее торга по цене материалов.",
    framework: [
      { step: "1. Учёт", description: "Ежедневный факт по технике и бригадам" },
      { step: "2. Анализ", description: "Недельный разбор топ-3 отклонений" },
      { step: "3. Реакция", description: "Решение с владельцем и сроком в тот же день" },
    ],
    citations: [
      { chunk_id: "chunk_800", source_anchor: "Аналитика ПЭО, 2025" },
      { chunk_id: "chunk_801", source_anchor: "Lessons Learned: объект «Восток-3»" },
      { chunk_id: "chunk_802", source_anchor: "Интервью с прорабом, 07:40" },
    ],
    source: "Lessons Learned BI",
    author: "ПЭО",
    language: "RU",
    scope: "INTERNAL",
    relevance: 92,
    date: "2025-05-06",
    media_type: "document",
    business_unit: "Строительство",
    tags: ["операционная эффективность", "себестоимость"],
  },
  {
    id: "card_011",
    title: "Toyota Production System: поток вместо загрузки",
    executive_summary:
      "Классика бережливого производства: почему оптимизация загрузки участков ломает поток.",
    core_insight:
      "Локальная эффективность участка почти всегда увеличивает общий срок прохождения заказа.",
    framework: [
      { step: "1. Value stream", description: "Нарисовать поток создания ценности" },
      { step: "2. Pull", description: "Перейти к вытягиванию вместо планирования загрузки" },
      { step: "3. Kaizen", description: "Малые улучшения на местах еженедельно" },
    ],
    citations: [
      { chunk_id: "chunk_90", source_anchor: "The Toyota Way, ch. 8" },
      { chunk_id: "chunk_93", source_anchor: "Lean Thinking, p. 112" },
    ],
    source: "Библиотека книг",
    author: "Jeffrey Liker",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 83,
    date: "2024-08-14",
    media_type: "document",
    business_unit: "Промышленность",
    tags: ["операционная эффективность", "lean"],
  },
  {
    id: "card_012",
    title: "Raqamli transformatsiya: mintaqaviy ofis tajribasi",
    executive_summary:
      "Mintaqaviy ofisda hujjat aylanishini raqamlashtirish bo'yicha amaliy xulosalar.",
    core_insight:
      "Jarayonni avval soddalashtirmasdan raqamlashtirish xarajatni 1,5 barobar oshiradi.",
    citations: [{ chunk_id: "chunk_910", source_anchor: "Ichki hisobot, 2025, 4-bo'lim" }],
    source: "Lessons Learned BI",
    author: "Региональный офис",
    language: "UZ",
    scope: "INTERNAL",
    relevance: 76,
    date: "2025-04-28",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["трансформация"],
  },
  {
    id: "card_013",
    title: "Лидерство в кризисе: протокол первых 72 часов",
    executive_summary:
      "Что делает руководитель в первые три дня после серьёзного сбоя — по материалам разборов инцидентов.",
    core_insight:
      "Ранняя честная коммуникация снижает репутационные потери сильнее, чем скорость самого решения.",
    framework: [
      { step: "1. Факты", description: "Собрать проверенную картину без домыслов" },
      { step: "2. Голос", description: "Один спикер, регулярные обновления" },
      { step: "3. Решение", description: "Явные шаги, сроки и владельцы" },
      { step: "4. Разбор", description: "Постмортем без поиска виноватых" },
    ],
    citations: [
      { chunk_id: "chunk_1001", source_anchor: "HBR: Leadership in a Crisis" },
      { chunk_id: "chunk_1002", source_anchor: "Разбор инцидента 2024-07" },
    ],
    source: "Внешняя библиотека",
    author: "HBR",
    language: "RU",
    scope: "EXTERNAL",
    relevance: 88,
    date: "2025-02-20",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["лидерство", "кризис"],
  },
  {
    id: "card_014",
    title: "Как удерживать инженеров: данные по 3 годам",
    executive_summary:
      "Анализ увольнений: деньги — третий по значимости фактор ухода инженерного персонала.",
    core_insight:
      "Первое место — качество непосредственного руководителя, второе — понятная траектория роста.",
    citations: [
      { chunk_id: "chunk_1100", source_anchor: "HR-аналитика 2022–2025" },
      { chunk_id: "chunk_1101", source_anchor: "Exit-интервью, сводка" },
    ],
    source: "HR Analytics BI",
    author: "HR-департамент",
    language: "RU",
    scope: "INTERNAL",
    relevance: 86,
    date: "2025-06-02",
    media_type: "document",
    business_unit: "HR",
    tags: ["hr", "лидерство"],
  },
  {
    id: "card_015",
    title: "Pricing Power: три способа поднять цену без потери клиента",
    executive_summary:
      "Обзор практик ценообразования на зрелых рынках с высокой конкуренцией.",
    core_insight:
      "Сегментированное предложение приносит больше, чем линейное повышение прайса на 3–5%.",
    framework: [
      { step: "1. Segment", description: "Разделить клиентов по чувствительности к цене" },
      { step: "2. Package", description: "Собрать пакеты с разной ценностью" },
      { step: "3. Test", description: "Тестировать на ограниченной выборке" },
    ],
    citations: [
      { chunk_id: "chunk_1200", source_anchor: "Monetizing Innovation, ch. 5" },
      { chunk_id: "chunk_1201", source_anchor: "Simon-Kucher Global Pricing Study" },
    ],
    source: "Библиотека книг",
    author: "Madhavan Ramanujam",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 81,
    date: "2024-10-19",
    media_type: "document",
    business_unit: "Финансы",
    tags: ["ценообразование", "финансы"],
  },
  {
    id: "card_016",
    title: "Risklərin idarə edilməsi: layihə səviyyəsində yanaşma",
    executive_summary:
      "Layihə komandası üçün risklərin qeydiyyatı və monitorinqi üzrə qısa təlimat.",
    core_insight:
      "Risk reyestri həftəlik yenilənmədikdə, o, iki ay ərzində aktuallığını itirir.",
    citations: [{ chunk_id: "chunk_1300", source_anchor: "Daxili metodika, 2025" }],
    source: "Lessons Learned BI",
    author: "Региональный офис",
    language: "AZ",
    scope: "INTERNAL",
    relevance: 74,
    date: "2025-05-22",
    media_type: "document",
    business_unit: "Девелопмент",
    tags: ["управление рисками"],
  },
  {
    id: "card_017",
    title: "Видео-лекция: экономика девелоперского проекта",
    executive_summary:
      "Базовая модель денежного потока девелопмента и её чувствительность к срокам продаж.",
    core_insight:
      "Сдвиг старта продаж на квартал бьёт по IRR сильнее, чем рост себестоимости на 5%.",
    framework: [
      { step: "1. Модель", description: "Построить помесячный кэшфлоу" },
      { step: "2. Сценарии", description: "Проверить три сценария темпа продаж" },
      { step: "3. Триггеры", description: "Определить точки пересмотра стратегии" },
    ],
    citations: [
      { chunk_id: "chunk_1400", source_anchor: "Лекция «Экономика девелопмента», 21:05" },
      { chunk_id: "chunk_1401", source_anchor: "Финансовая модель, лист IRR" },
    ],
    source: "Корпоративный университет",
    author: "Академия BI",
    language: "RU",
    scope: "INTERNAL",
    relevance: 90,
    date: "2025-01-27",
    media_type: "video",
    business_unit: "Девелопмент",
    tags: ["финансы", "девелопмент"],
  },
  {
    id: "card_018",
    title: "Playing to Win: выбор там, где вы не играете",
    executive_summary:
      "Стратегия как каскад из пяти взаимосвязанных решений — от амбиции до систем управления.",
    core_insight:
      "Стратегия без явного отказа от сегментов — это не стратегия, а список пожеланий.",
    framework: [
      { step: "1. Winning aspiration", description: "Что значит победить" },
      { step: "2. Where to play", description: "Где играем и где нет" },
      { step: "3. How to win", description: "За счёт чего выигрываем" },
      { step: "4. Capabilities", description: "Какие компетенции нужны" },
      { step: "5. Systems", description: "Какие системы поддерживают выбор" },
    ],
    citations: [
      { chunk_id: "chunk_1500", source_anchor: "Playing to Win, ch. 1" },
      { chunk_id: "chunk_1501", source_anchor: "HBS Case: P&G Strategy" },
    ],
    source: "Harvard Business School",
    author: "A.G. Lafley & Roger Martin",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 93,
    date: "2024-07-08",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["стратегия", "трансформация"],
  },
  {
    id: "card_019",
    title: "Подкаст: как устроен инновационный конвейер в промышленности",
    executive_summary:
      "Разговор с директором завода о том, как идеи рабочих доходят до внедрения.",
    core_insight:
      "Идея внедряется, если у неё есть бюджет до 1 млн ₸ без согласования сверху.",
    citations: [
      { chunk_id: "chunk_1600", source_anchor: "Подкаст «Производство», выпуск 6, 09:15" },
    ],
    source: "Lessons Learned BI",
    author: "Дирекция завода",
    language: "RU",
    scope: "INTERNAL",
    relevance: 78,
    date: "2025-03-03",
    media_type: "podcast",
    business_unit: "Промышленность",
    tags: ["инновации"],
  },
  {
    id: "card_020",
    title: "Change Management: модель ADKAR на практике",
    executive_summary:
      "Пять состояний сотрудника при изменении и типовые ошибки на каждом из них.",
    core_insight:
      "Большинство программ обучают навыку (A), не создав осознание потребности (Awareness).",
    framework: [
      { step: "Awareness", description: "Понимание, зачем нужно изменение" },
      { step: "Desire", description: "Личная мотивация участвовать" },
      { step: "Knowledge", description: "Знание, как именно меняться" },
      { step: "Ability", description: "Способность применять на практике" },
      { step: "Reinforcement", description: "Закрепление результата" },
    ],
    citations: [
      { chunk_id: "chunk_1700", source_anchor: "Prosci ADKAR Model, p. 22" },
      { chunk_id: "chunk_1701", source_anchor: "HBR: Why Transformations Fail" },
    ],
    source: "Внешняя библиотека",
    author: "Prosci",
    language: "RU",
    scope: "EXTERNAL",
    relevance: 85,
    date: "2025-04-02",
    media_type: "presentation",
    business_unit: "HR",
    tags: ["трансформация", "изменения"],
  },
  {
    id: "card_021",
    title: "Data-driven решения: минимальный набор метрик для дирекции",
    executive_summary:
      "Какие 9 показателей реально используются на еженедельном комитете и почему остальные шумят.",
    core_insight:
      "Дашборд с более чем 12 метриками перестаёт влиять на решения — внимание распыляется.",
    citations: [
      { chunk_id: "chunk_1800", source_anchor: "Протоколы комитета, 2025" },
      { chunk_id: "chunk_1801", source_anchor: "Measure What Matters, ch. 4" },
    ],
    source: "Lessons Learned BI",
    author: "Аналитический центр",
    language: "RU",
    scope: "INTERNAL",
    relevance: 87,
    date: "2025-06-11",
    media_type: "document",
    business_unit: "Корпоративный центр",
    tags: ["данные", "управление"],
  },
  {
    id: "card_022",
    title: "Blue Ocean Strategy: сетка «убрать–снизить–повысить–создать»",
    executive_summary:
      "Инструмент пересборки ценностного предложения без лобовой конкуренции по цене.",
    core_insight:
      "Новая ценность чаще рождается из отказа от привычных атрибутов отрасли, чем из добавления новых.",
    framework: [
      { step: "Убрать", description: "Какие привычные атрибуты можно убрать" },
      { step: "Снизить", description: "Что снизить ниже отраслевого стандарта" },
      { step: "Повысить", description: "Что поднять выше стандарта" },
      { step: "Создать", description: "Что создать, чего в отрасли не было" },
    ],
    citations: [
      { chunk_id: "chunk_1900", source_anchor: "Blue Ocean Strategy, ch. 2" },
      { chunk_id: "chunk_1901", source_anchor: "INSEAD Case Study" },
    ],
    source: "Библиотека книг",
    author: "Kim & Mauborgne",
    language: "EN",
    scope: "EXTERNAL",
    relevance: 82,
    date: "2024-11-29",
    media_type: "document",
    business_unit: "Девелопмент",
    tags: ["стратегия", "инновации"],
  },
];

export function getCardById(id: string) {
  return mockCards.find((c) => c.id === id);
}

export function getRelatedCards(card: KnowledgeCardData, limit = 3) {
  return mockCards
    .filter((c) => c.id !== card.id)
    .map((c) => ({
      card: c,
      score:
        c.tags.filter((t) => card.tags.includes(t)).length * 2 +
        (c.business_unit === card.business_unit ? 1 : 0) +
        (c.scope === card.scope ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.card);
}
