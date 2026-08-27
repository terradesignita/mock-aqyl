import { pluralRu } from "./plural";
import { advisorRu } from "@/data/advisor/text.ru";
import type { CouncilTopicText } from "@/data/council-types";

/**
 * Русский словарь — источник истины для типа `Dictionary`. Остальные локали
 * типизированы против него, поэтому пропущенный ключ ловится компилятором,
 * а не пользователем, увидевшим русскую надпись в английском интерфейсе.
 */
export const ru = {
  common: {
    cancel: "Отмена",
    close: "Закрыть",
    open: "Открыть",
    save: "Сохранить",
    saved: "Сохранено",
    delete: "Удалить",
    back: "Назад",
    next: "Далее",
    reset: "Сбросить",
    copy: "Копировать",
    copied: "Скопировано",
    download: "Скачать",
    loading: "Загружаю...",
    rename: "Переименовать",
    hint: "Подсказка",
    more: "Ещё",
    collapse: "Свернуть",
    expand: "Развернуть",
    of: "из",
    esc: "Esc",
    aiDisclaimer:
      "AQYL — ИИ и может ошибаться. Пожалуйста, перепроверяйте факты и цитируемые источники.",
  },

  nav: {
    cases: "Кейсы",
    council: "Консилиум",
    settings: "Настройки и метрики",
    myProfile: "Мой профиль",
    logout: "Выйти",
    userMenu: (name: string) => `Меню пользователя: ${name}`,
    lightTheme: "Светлая тема",
    darkTheme: "Тёмная тема",
    profileFromSso: (unit: string, role: string) =>
      `${unit} · ${role} · профиль приходит из корпоративного SSO`,
    logoutInSso: "Выход выполняется в корпоративном SSO — в прототипе его нет",
  },

  footer: {
    tagline: "AQYL — платформа корпоративных знаний",
    docs: "Документация",
    support: "Поддержка",
    version: "MVP v0.1 · demo mode",
  },

  greeting: {
    night: "Доброй ночи",
    morning: "Доброе утро",
    day: "Добрый день",
    evening: "Добрый вечер",
  },

  dashboard: {
    materialsAndUnits: (materials: number, units: number) =>
      `${materials} ${pluralRu(materials, "материал", "материала", "материалов")} · ${units} ${pluralRu(units, "направление", "направления", "направлений")}`,
    advisorMode: "AI-советник",
    searchMode: "Поиск",
    advisorSwitchLabel: "Режим AI-советника",
    advisorHintOn:
      "Включите, если нужно принять решение: советник задаст уточняющие вопросы и даст рекомендацию со сценариями. Выключено — обычный поиск материалов.",
    advisorHintOff:
      "Обычный поиск ищет только по кейсам: названиям, описаниям и тегам. Включите AI-советника, если нужно принять управленческое решение, а не просто найти материал.",
    searchLabel: "Поиск по материалам BI AQYL",
    advisorLabel: "Опишите бизнес-ситуацию для AI-советника",
    searchPlaceholder: "Спросите BI AQYL: найдите материалы, кейсы и презентации",
    advisorPlaceholder:
      "Опишите бизнес-ситуацию или решение, которое нужно принять — советник разберётся и предложит рекомендацию",
    clear: "Очистить",
    submit: "Отправить запрос",
    voiceInput: "Голосовой ввод",
    voiceStop: "Остановить запись",
    voiceRequesting: "Запрашиваю доступ к микрофону",
    voiceUnsupported: "Голосовой ввод не поддерживается в этом браузере",
    recentQuestions: "Недавние вопросы",
    clearHistory: "очистить",
    scopeAll: "Все",
    scopeInternal: "Внутренний опыт BI",
    scopeExternal: "Мировой опыт",
    filters: "Фильтры",
    allUnits: "Все направления",
    allLanguages: "Все языки",
    unitPlaceholder: "Направление",
    languagePlaceholder: "Язык",
    casesHeading: "Кейсы",
    found: (n: number) => `Найдено: ${n}`,
    topics: "Темы",
    resetTopics: (n: number) => `Сбросить темы (${n})`,
    visibilityAll: "Все",
    visibilityPrivate: "Приватные",
    visibilityShared: "Общие",
    visibilityHintLabel: "Что значит Приватные и Общие",
    visibilityHint:
      "Приватные — кейсы, видимые только вам. Общие — доступны всем сотрудникам и участвуют в общем поиске.",
    bookmarks: "Закладки",
    emptyNarrowedTitle: "Ничего не нашлось",
    emptyNarrowedBody: "Сузили слишком сильно. Сбросьте условия — и материалы вернутся.",
    emptyTitle: "Пока ничего не найдено",
    emptyBody: "Введите запрос или выберите тему. Можно искать обычными словами.",
    resetAll: "Сбросить все условия",
    clearQuery: "Очистить запрос",
    prevPage: "Предыдущая страница",
    nextPage: "Следующая страница",
    page: (current: number, total: number) => `Страница ${current} из ${total}`,
    advisorIntroTitle: "Режим AI-советника: рекомендация по вашей ситуации со ссылками на опыт",
    advisorIntroBody:
      "Советник определит тип решения, задаст уточняющие вопросы по вашей ситуации, найдёт похожие кейсы и предложит рекомендацию с рисками, условиями и источниками.",
    closeHint: "Закрыть подсказку",
    resultPages: "Страницы результатов",
    deleteSession: "Удалить сохранённую сессию",
    advisorExamplesTitle: "Например",
  },

  onboarding: {
    title: "Кейс и Материал",
    subtitle: "Два главных слова на этой платформе",
    caseIsFolder: "Кейс — папка",
    fileReport: "Отчёт",
    filePresentation: "Презентация",
    fileArticle: "Статья",
    threeFilesNote: "Это и есть «3 файла» — та же надпись, что вы увидите на карточке Кейса",
    caseBody:
      "Кейс — это как обычная бумажная папка на столе. Она сама по себе пустая. Вы кладёте туда бумаги на одну тему — и получается Кейс.",
    materialBody:
      "Материал — это один такой лист бумаги внутри папки: отчёт, презентация или статья. В одной папке (Кейсе) может лежать сразу несколько бумаг (Материалов) — если они все про одно и то же.",
    dontShowAgain: "Больше не показывать",
    gotIt: "Понятно",
  },

  card: {
    private: "Приватный",
    shared: "Общий",
    makeSharedQuestion:
      "Сделать общедоступным? Материалы кейса попадут в общую базу знаний для всех сотрудников.",
    makePrivateQuestion:
      "Сделать приватным? Материалы кейса перестанут быть видны остальным сотрудникам.",
    makeSharedConfirm: "Да, сделать общедоступным",
    makePrivateConfirm: "Да, сделать приватным",
    privateHint:
      "Приватный: кейс виден только вам и скрыт из общей базы знаний для остальных сотрудников.",
    sharedHint: "Общий: кейс виден всем сотрудникам и участвует в общем поиске по базе знаний.",
    addBookmark: "В закладки",
    removeBookmark: "Убрать из закладок",
    bookmarkAdded: "Добавлено в закладки",
    bookmarkRemoved: "Убрано из закладок",
    unreadDot: "Вы ещё не открывали этот кейс",
    unreadSr: "не открывали",
    filesCount: (n: number) => `${n} ${pluralRu(n, "файл", "файла", "файлов")}`,
    openCase: (title: string) => `Открыть кейс: ${title}`,
    deleteCase: "Удалить кейс",
    deleteTitle: "Удалить кейс?",
    deleteBody: (title: string) =>
      `«${title}» будет удалён из списка. Это действие нельзя отменить.`,
    deleteConfirm: "Да, удалить",
    internal: "Внутренний опыт",
    external: "Мировой опыт",
  },

  workspace: {
    caseTitleLabel: "Название кейса",
    copyLink: "Скопировать ссылку на кейс",
    linkCopied: "Ссылка на кейс скопирована",
    linkCopyFailed: "Не удалось скопировать — скопируйте адрес из строки браузера",
    sourcesPanel: "Источники",
    artifactsPanel: "Артефакты",
    showSources: "Показать источники",
    showArtifacts: "Показать артефакты",
    closeCase: "Закрыть кейс",
    resizeSources: "Изменить ширину панели источников",
    resizeArtifacts: "Изменить ширину панели артефактов",
    deletedTitle: "Кейс удалён",
    deletedBody: (title: string) =>
      `«${title}» удалён вместе с материалами, вики-страницами и заметками. Прямая ссылка больше не открывает содержимое.`,
    backToList: "К списку кейсов",
    notFoundTitle: "Карточка не найдена — BI AQYL",
    savedToNotes: "Сохранено в заметки",
    artifactToNotes: "Артефакт сохранён в заметки",
  },

  sources: {
    title: "Источники",
    selectedOf: (total: number) => `из ${total}`,
    selectAll: "Выбрать все",
    deselectAll: "Снять все",
    collapse: "Свернуть панель источников",
    collapseTitle: "Свернуть панель",
    hint: "Отмеченные источники — контекст для ассистента и артефактов. Снимите галочку, чтобы исключить материал из ответов. Если не выбрано ничего, ассистент отвечать не будет.",
    noneSelected:
      "Ни один источник не выбран — ассистент не сможет ответить и артефакты не собрать.",
    dropzone: "Перетащите файлы сюда или нажмите, чтобы выбрать",
    dropzoneNaming: "Название материала возьмём из содержимого",
    useInChat: (title: string) => `Использовать «${title}» в чате`,
    actionsMenu: "Действия с источником",
    openInReader: "Открыть в читалке",
    renamePrompt: "Новое название источника",
    renamed: "Источник переименован",
    downloadMd: "Скачать .md",
    downloaded: "Источник скачан в .md",
    removed: "Источник удалён из кейса",
    groupFiles: "Загруженные файлы",
    groupFilesEmpty: "Файлов пока нет — загрузите первый",
    groupLinks: "Ссылки на материалы",
    groupLinksEmpty: "Ссылок в этом кейсе нет",
    groupLinksHint:
      "Внешние материалы, на которые ссылается кейс. Участвуют в контексте так же, как файлы.",
    rejectedTitle: "Не добавлено — формат не поддерживается",
    rejectedHide: "Скрыть сообщение об отклонённых файлах",
    rejectedBody:
      "Принимаем документы, слайды, аудио и видео. Таблицы и архивы обрабатывать пока нечем — выгрузите нужное в PDF или текст.",
    rejectedOne: (name: string) => `«${name}» — формат не поддерживается`,
    rejectedMany: (n: number) =>
      `${n} ${pluralRu(n, "файл", "файла", "файлов")} отклонено: формат не поддерживается`,
    addedOne: (title: string) => `«${title}» добавлен в кейс`,
    noTypeLabel: "без типа",
    notes: "Заметки",
    notesHint:
      "Сюда попадают ответы ассистента, сохранённые кнопкой «В заметки». Их можно скопировать или удалить.",
    notesEmpty: "Сохраняйте ответы из диалога — они появятся здесь.",
    removeNote: "Удалить заметку",
    linkLabel: "Ссылка",
    uploadedAt: (date: string) => `загружен ${date}`,
  },

  ingest: {
    queued: "В очереди",
    queuedDetail: "Файл принят, ждёт обработки",
    converting: "Конвертация",
    convertingDetail: "Привожу слайды к PDF",
    extracting: "Извлечение аудио",
    extractingDetail: "Отделяю звуковую дорожку",
    parsing: "Разбор",
    parsingDetail: "Извлекаю текст и структуру документа",
    transcribing: "Транскрибация",
    transcribingDetail: "Распознаю речь",
    embedding: "Индексация",
    embeddingDetail: "Считаю эмбеддинги фрагментов",
    wiki: "Вики-страница",
    wikiDetail: "Собираю оглавление, теги и факты",
  },

  reader: {
    fontSize: "Размер шрифта",
    fullscreen: "На весь экран",
    autoTagsSr: "Автоматические теги:",
    autoTagsHint: "Теги проставлены автоматически при построении страницы",
    facts: "Выделенные факты",
    toc: "Оглавление",
    tocLabel: "Оглавление",
    wikiFooter: (date: string, origin: string) => `Вики-страница собрана ${date} из`,
    chunksIndexed: (n: number) =>
      `${n} ${pluralRu(n, "фрагмент", "фрагмента", "фрагментов")} в индексе`,
    chunksNone: "фрагменты не проиндексированы",
    usedInChat: "Используется в чате",
    addToContext: "Добавить в контекст",
    askAbout: "Спросить по источнику",
    askAboutQuestion: (title: string) => `Что важного в источнике «${title}»?`,
    openOriginal: "Открыть оригинал",
    quoteHighlighted: "Цитата подсвечена в тексте · ",
    escHint: "Esc — закрыть · Aa — размер текста",
    sectionContent: "Содержимое",
    sectionStart: "Начало материала",
    sectionHowBuilt: "Как построена эта страница",
    howBuiltText:
      "Текст прочитан прямо в браузере, заголовок взят из содержимого. Разбиение на фрагменты, эмбеддинги и связывание с другими материалами базы выполняет ingestion-сервис — в прототипе его нет, поэтому дальше страницы дело не идёт.",
    notParsed: (stages: string, kind: string) =>
      `Файл принят и прошёл этапы обработки (${stages}). Разбор ${kind} выполняет бэкенд, которого в прототипе нет, — поэтому текста здесь не будет.`,
    kindSpeech: "речи",
    kindContent: "содержимого",
    format: "Формат",
    size: "Размер",
    uploaded: "Загружен",
    tagUploadedByYou: "загружено вами",
    familyText: "конспект",
    familyDocument: "документ",
    familySlides: "презентация",
    familyAudio: "аудио",
    familyVideo: "видео",
    annotation: "Аннотация",
    keyTakeaway: "Ключевой вывод",
    citedFragment: "Фрагмент, на который ссылается ассистент",
    citedFragmentBody: (anchor: string, author: string, unit: string, lang: string, date: string) =>
      `«${anchor}». Материал подготовлен: ${author}. Направление: ${unit}. Язык оригинала: ${lang}. Дата актуализации: ${date}.`,
    howToApplyBody: (unit: string) =>
      `Материал используется командами направления «${unit}» при подготовке решений. Рекомендуется сверять выводы с внутренними регламентами и данными по объектам, прежде чем переносить практику на площадку.`,
    practicalPart: "Практическая часть",
    howToApply: "Как применять в BI Group",
    factDate: "Дата актуализации",
    factLanguage: "Язык оригинала",
    factMediaType: "Тип материала",
    factSteps: "Шагов в практической части",
    pages: (n: number) => `${n} стр.`,
  },

  chat: {
    assistant: "AQYL ассистент",
    contextOf: (selected: number, total: number) =>
      `Контекст: ${selected} из ${total} ${pluralRu(total, "источника", "источников", "источников")}`,
    contextHint:
      "Ассистент отвечает только по источникам, отмеченным в левой панели. Сноски [1], [2] в ответе ведут к конкретным цитатам.",
    refusal:
      "Не могу ответить: в панели источников не выбрано ни одного материала.\n\nОтметьте хотя бы один источник слева — ответ строится только по выбранному контексту, без него у меня нет оснований.",
    thinking: (n: number) =>
      `Анализирую ${n} ${pluralRu(n, "источник", "источника", "источников")}...`,
    questionLabel: "Вопрос по выбранным источникам",
    placeholder: (n: number) => `Задайте вопрос по ${n} выбранным источникам...`,
    placeholderEmpty: "Отметьте источник слева, чтобы задать вопрос",
    placeholderListening: "Слушаю...",
    placeholderRequesting: "Запрашиваю микрофон...",
    voiceStarted: "Говорите — я записываю вопрос",
    send: "Отправить",
    moreSuggestions: "Ещё варианты",
    helpful: "Полезный ответ",
    notHelpful: "Неудачный ответ",
    markedHelpful: "Спасибо, отметили как полезный",
    markedNotHelpful: "Учтём — ответ отмечен",
    toNotes: "В заметки",
    reportError: "Сообщить об ошибке",
    reportQuestion: "Что не так с ответом?",
    reportSent: (reason: string) => `Отправлено редакторам: «${reason}»`,
    reasonWrongFact: "Неверный факт",
    reasonWrongQuote: "Цитата не соответствует",
    reasonOffTopic: "Ответ не по вопросу",
    reasonOutdated: "Устаревшие данные",
    reasonConfidential: "Конфиденциальные данные",
    sourceN: (n: number) => `Источник ${n}`,
    sourceBracket: (n: number) => `Источник [${n}]`,
    clickToOpenReader: "Нажмите, чтобы открыть в читалке",
    suggestions: [
      "Кратко о чём этот материал?",
      "Дай 5 тезисов для планёрки",
      "Как применить это у нас?",
      "Составь пошаговый план внедрения",
      "Какие риски и ограничения?",
      "Что может пойти не так на площадке?",
      "Какие метрики отслеживать?",
      "Сколько времени займёт внедрение?",
      "Чем это отличается от нашей практики?",
      "Кто должен быть владельцем процесса?",
      "Покажи источники и цитаты",
      "Сформулируй письмо руководителю",
      "Какие вопросы задать подрядчику?",
      "Переведи вывод на простой язык",
      "Сделай чек-лист на первую неделю",
    ] as string[],
    answerRisks: (source: string, unit: string) =>
      `Ограничения и риски:\n1. Контекст материала «${source}» отличается от площадок BI Group — нужна калибровка по объёму работ.\n2. Эффект проявляется на горизонте 2–3 кварталов, ранние замеры вводят в заблуждение.\n3. Без владельца процесса практика откатывается к прежнему состоянию.`,
    answerSteps: (steps: string) =>
      `На основе выбранных источников применение выглядит так:\n${steps}`,
    answerMetrics: (insight: string) =>
      `Что измерять:\n• Базовый показатель до внедрения (замер 4 недели).\n• Ключевой эффект: ${insight}\n• Контрольная метрика качества, чтобы рост скорости не съедал качество.`,
    answerWhy: (insight: string) => `Ключевой вывод: ${insight}`,
    answerCompare: (unit: string) =>
      `Отличие от текущей практики: материал предлагает управлять причиной, а не следствием. В направлении «${unit}» это означает перенос усилий на подготовительный этап.`,
    answerSources: (n: number, source: string, author: string) =>
      `Ответ опирается на ${n} ${pluralRu(n, "выбранный фрагмент", "выбранных фрагмента", "выбранных фрагментов")} из материала «${source}» (${author}). Наведите на сноску, чтобы увидеть цитату, и нажмите — откроется читалка.`,
    answerSummary: (summary: string, insight: string) =>
      `${summary}\n\nКлючевой инсайт: ${insight}`,
    answerDefault: (summary: string, insight: string) =>
      `${summary}\n\nКлючевой инсайт: ${insight}\n\nЕсли нужно — разложу на шаги внедрения или соберу список метрик.`,
  },

  studio: {
    title: "Артефакты",
    hint: "Готовые форматы на основе выбранных источников: тест, презентация, отчёт, карточки, подкаст, инфографика. «⋮» — перегенерировать, открыть на весь экран или скачать.",
    readyOf: (ready: number, total: number) => `${ready} из ${total} готово`,
    contextCount: (n: number) =>
      `контекст: ${n} ${pluralRu(n, "источник", "источника", "источников")}`,
    collapse: "Свернуть панель артефактов",
    noContext:
      "Нет отмеченных источников — артефакт собирать не из чего. Отметьте материал в панели источников.",
    noContextToast: "Отметьте хотя бы один источник — собирать артефакт не из чего",
    noContextTitle: "Нет отмеченных источников",
    busyTitle: "Дождитесь окончания генерации",
    generating: (title: string) => `Генерирую «${title}»`,
    generatingShort: "Генерирую...",
    ready: "Готово · открыть",
    stepReading: "Читаю отмеченные источники",
    stepExtracting: "Выделяю ключевые тезисы",
    stepAssembling: "Собираю формат",
    actionsFor: (title: string) => `Действия — ${title}`,
    generate: "Сгенерировать",
    regenerateMenu: "Сгенерировать заново",
    openFullscreen: "Открыть на весь экран",
    copyText: "Копировать текст",
    downloadPdf: "Скачать PDF",
    saveToNotes: "Сохранить в заметки",
    copiedToast: "Текст артефакта скопирован",
    downloadedMd: "Файл .md скачан",
    printDialog: "Открыт диалог печати — сохраните как PDF",
    regenerated: "Артефакт пересоздан",
    regeneratedByContext: "Артефакт пересоздан по текущему контексту",
    aiFooter:
      "Артефакты собираются ИИ из отмеченных источников. Перед отправкой сверьте цифры и цитаты с исходными материалами.",
    generatedByAi: "сгенерировано ИИ",
    quiz: "Тест",
    quizSubtitle: "Тест на понимание",
    deck: "Презентация",
    deckSubtitle: "Слайды для встречи",
    report: "Отчёт",
    reportSubtitle: "Аналитический отчёт",
    cards: "Карточки",
    cardsSubtitle: "Карточки с выводами",
    podcast: "Подкаст",
    podcastSubtitle: "Аудио по материалу",
    infographic: "Инфографика",
    infographicSubtitle: "Визуальная сводка",
  },

  artifactDialog: {
    fromSources: "Сгенерировано из выбранных источников",
    exitFullscreen: "Выйти из полноэкранного режима",
    enterFullscreen: "Полноэкранный режим",
    collapseHint: "Свернуть (Esc)",
    expandHint: "Развернуть (F)",
    closeHint: "Закрыть (Esc)",
    footerHintFull: "Esc — выйти из полного экрана · F — полный экран",
    footerHint: "Esc — закрыть · F — полный экран",
    regenerate: "Пересоздать",
    regenerating: "Пересоздаю...",
    metricsCaption: "Считается из состава артефакта и отмеченных источников — не оценка модели.",
  },

  advisor: {
    stageClarify: "Уточнение",
    stageUnderstanding: "Понимание",
    stageThinking: "Анализ",
    stageAnswer: "Рекомендация",
    stageStatus: (label: string) => `Этап: ${label}`,
    typeHint: (known: string) =>
      `Тип решения определён по вашему запросу. Из запроса понятно: ${known}.`,
    savedIndicator: "Сохранено — вернётся после перезагрузки",
    savedIndicatorShort: "Сохранено",
    notManagerialTitle: "Это похоже на поиск материалов, а не на управленческий вопрос",
    notManagerialBody:
      "AI-советник работает со стратегическими решениями: партнёрство, продажа доли, выход на рынок, масштабирование, инвестиции. Выключите тумблер, чтобы найти документы и кейсы, или сформулируйте ситуацию и вопрос — что нужно решить.",
    rephrase: "Переформулировать",
    clarifyGate: "Ответьте на ключевые вопросы — без этого рекомендация не формируется.",
    ownAnswer: "Ответить своими словами",
    questionOf: (current: number, total: number) => `${current}/${total}`,
    understandingTitle: "Вот как я понял вашу ситуацию",
    extraContextPlaceholder: "Добавить контекст: что ещё важно учесть при рекомендации",
    allCorrect: "Всё верно",
    editAnswers: "Изменить ответы",
    confirmGate: "До подтверждения рекомендация не формируется",
    situation: "Ситуация",
    changeSituation: "изменить",
    closeAnswer: "Закрыть рекомендацию и задать новый вопрос",
    verdictShort: "Краткий вывод",
    verdictRefusal: "Честный отказ",
    mainInsight: "Главный стратегический инсайт",
    evidenceLevel: (level: string) => `Уровень доказательности: ${level}`,
    evidenceHintLabel: "Что значит уровень доказательности",
    evidenceHint:
      "Шкала: высокий — несколько независимых источников; средний — один надёжный источник; низкий — косвенные данные; недостаточно данных — советник отказывается от рекомендации.",
    sectionWhy: "Почему сделан такой вывод",
    sectionCase: (title: string) => `Релевантный кейс: ${title}`,
    applicabilityHintLabel: "Что значит применимость кейса",
    applicabilityHint:
      "Насколько похож этот кейс на вашу ситуацию: высокая — условия почти идентичны; частичная — совпадает часть факторов; слабая — только общая логика, детали переносить нельзя.",
    matches: "Что совпадает",
    differences: "Что различается",
    sectionTransfer: "Что можно и что нельзя переносить",
    canTransfer: "Можно перенести",
    cannotTransfer: "Нельзя переносить напрямую",
    sectionRecommendation: "Рекомендация и предлагаемые условия",
    proposedTerms: "Предлагаемые условия",
    sectionScenarios: "Варианты решения",
    colScenario: "Сценарий",
    colSpeed: "Скорость",
    colControl: "Контроль",
    colRisk: "Риск",
    colWhen: "Когда подходит",
    recommendedBadge: "рекомендуем",
    sectionRisks: "Риски",
    sectionChangeFactors: "Что может изменить рекомендацию",
    sectionMissing: "Чего не хватает для окончательного решения",
    sectionSources: "Источники",
    sourceKindWeight: "Тип источника и его вес в выводе",
    sourceKindHint:
      "Тип источника: факт из документа, авторский анализ, ваша заметка или сгенерировано ИИ. Вес в выводе: определяющий — на нём строится вывод; подтверждающий — усиливает его; контекстный — просто фон.",
    sourceOpened: (title: string) => `Источник «${title}» открыт`,
    followUpTitle: "Уточнить или изменить условия",
    followUpThinking: "Смотрю, что меняется в рекомендации...",
    followUpPlaceholder: "Задайте уточняющий вопрос по этой рекомендации",
    followUpLabel: "Уточняющий вопрос по рекомендации",
    followUpSend: "Отправить уточнение",
    negotiationButton: "Подготовить вопросы партнёру",
    shareholderButton: "Сделать версию для акционера",
    saveAnalysis: "Сохранить анализ",
    negotiationTitle: "Вопросы для переговоров",
    shareholderTitle: "Версия для акционера",
  },

  council: {
    title: "Консилиум",
    assembleTitle: "Соберите консилиум",
    whatIsLabel: "Что такое консилиум",
    whatIsHint:
      "Консилиум — это групповое обсуждение вашей задачи с несколькими AI-персонами. Каждая привносит свой взгляд на вопрос, поэтому вместо одного мнения вы получаете спор и разные точки зрения. Выберите от одного до трёх участников.",
    selectedOf: (selected: number, max: number) => `Выбрано ${selected} из ${max}`,
    capacityReached: "Можно выбрать не более трёх участников.",
    similarViews:
      "В этом составе взгляды похожи — спора может не быть. Попробуйте добавить контрарианку или скептика.",
    sessions: "Сессии",
    createCouncil: "Создать совет",
    searchSessions: "Поиск по сессиям",
    nothingFound: (query: string) => `Ничего не найдено по «${query}».`,
    today: "Сегодня",
    earlier: "Ранее",
    startCouncil: "Начать совет",
    selectHint: "Выберите участников совета и кейс для обсуждения",
    collapseSessions: "Свернуть список сессий",
    resizeSessions: "Изменить ширину списка сессий",
    deleteSession: "Удалить сессию",
    followUpPlaceholder: "Задайте вопрос совету",
    followUpSend: "Отправить",
    participants: (names: string) => `Участники: ${names}`,
    participantsCount: (n: number) => `${n} ${pluralRu(n, "участник", "участника", "участников")}`,
    pickCaseTitle: "Выберите кейс, чтобы начать совет",
    pickCaseHint:
      "Выберите кейс, который разберёт совет. Персоны будут обсуждать именно его — свою ситуацию, ключевой инсайт и цитаты они возьмут оттуда.",
    pickCaseHintLabel: "Что здесь нужно выбрать",
    needParticipant: "Добавьте хотя бы одного участника совета",
    searchCase: "Найдите кейс по названию",
    searchPersona: "Найдите персону по имени или стилю",
    messagePlaceholder: "Написать сообщение…",
    send: "Отправить",
    showSessions: "Показать сессии",
    showSessionsPanel: "Показать панель сессий",
    collapsePanel: "Свернуть панель",
    sessionDeleted: "Сессия удалена",
    deleteSessionTitle: "Удалить сессию?",
    deleteSessionNamed: (title: string) => `Удалить сессию «${title}»`,
    react: (emoji: string) => `Отреагировать ${emoji}`,
    unread: "Непрочитано",
    readReceipt: " · Прочитано ✓✓",
    topicQuestion: "О чём поговорим?",
    councilShort: "Совет",
    reactionLabel: (emoji: string) => `Реакция ${emoji}`,
  },

  settings: {
    title: "Настройки",
    subtitle: "Профиль, оформление и статистика использования платформы.",
    profile: "Профиль",
    profileHint:
      "Данные приходят из корпоративного SSO (BILife). В прототипе профиль зафиксирован.",
    loginIs: (login: string) => `логин ${login}`,
    appearance: "Оформление и язык",
    theme: "Тема",
    themeLight: "Светлая",
    themeDark: "Тёмная",
    interfaceLanguage: "Язык интерфейса",
    languageHint:
      "Переключается весь интерфейс: подписи, подсказки, подсказки-чипы и генерируемые тексты. Выбор запоминается в этом браузере.",
    languageChanged: "Язык интерфейса переключён",
    materialLanguages: (list: string) =>
      `Материалы в базе есть на ${list} — язык оригинала виден в карточке и фильтрах.`,
    library: "База знаний",
    libraryHint: "Считается по фактическому составу базы, а не задаётся числом.",
    cases: "Кейсов",
    materials: "Материалов",
    units: "Направлений",
    freshest: "Свежий материал",
    internalExternal: "Внутренний опыт / мировой",
    formats: "Форматы",
    topTopics: "Частые темы",
    activity: "Ваша активность",
    activityHint:
      "Действия в этом браузере за последние 14 дней. В продукте это события на сервере, общие для всех ваших устройств.",
    activityEmptyTitle: "Пока пусто",
    activityEmptyBody:
      "Задайте вопрос по кейсу, соберите артефакт или загрузите материал — здесь появится разбивка по дням и типам действий.",
    openCases: "Открыть кейсы",
    questions: "Вопросов",
    artifacts: "Артефактов",
    uploads: "Загрузок",
    totalActions: "Всего действий",
    activityChartLabel: "Активность по дням",
    activityOnDay: (day: string, n: number) =>
      `${day}: ${n} ${pluralRu(n, "действие", "действия", "действий")}`,
    latest: "Последнее",
    clearLog: "Очистить журнал",
    logCleared: "Журнал активности очищен",
    feedback: "Оценки ответов",
    feedbackHint:
      "Что вы отметили под ответами ассистента. В продукте эти события уходят редакторам базы знаний и питают дообучение.",
    feedbackUp: "Полезных",
    feedbackDown: "Неудачных",
    feedbackReports: "Жалоб",
    reportReasons: "Причины жалоб",
    noReports:
      "Жалоб нет. Кнопка «Сообщить об ошибке» под ответом ассистента записывает причину сюда.",
    stored: "Сохранённое",
    storedHint:
      "Всё это лежит в хранилище браузера: в продукте — на сервере, с доступом со всех устройств.",
    storedBookmarks: "Закладки",
    storedAdvisor: "Консультации советника",
    storedCouncil: "Сессии консилиума",
    openLink: "открыть",
  },

  activity: {
    question: "Вопрос ассистенту",
    artifact: "Артефакт",
    upload: "Загрузка материала",
    advisor: "Консультация советника",
    council: "Консилиум",
    note: "Заметка",
  },

  roles: {
    viewer: "Чтение",
    editor: "Редактор",
    owner: "Владелец",
    admin: "Администратор",
    viewerDesc: "Можно искать, читать и генерировать артефакты. Загрузка и удаление недоступны.",
    editorDesc: "Можно загружать материалы, править названия и теги, удалять свои кейсы.",
    ownerDesc: "Права редактора плюс управление доступом к своим кейсам.",
    adminDesc: "Полный доступ, включая чужие кейсы и настройки платформы.",
  },

  media: {
    document: "Документ",
    video: "Видео",
    podcast: "Подкаст",
    presentation: "Презентация",
  },

  errors: {
    notFoundTitle: "Страница не найдена",
    notFoundBody: "Такой страницы не существует, либо она была перемещена.",
    toHome: "На главную",
    crashTitle: "Страница не загрузилась",
    crashBody: "Что-то пошло не так. Попробуйте обновить страницу или вернуться на главную.",
    retry: "Попробовать снова",
  },

  voice: {
    notAllowed: "Нет доступа к микрофону — разрешите его в настройках браузера",
    noMic: "Микрофон не найден",
    network: "Распознавание речи недоступно без сети",
    noSpeech: "Речь не распознана — попробуйте ещё раз",
    aborted: "Запись остановлена",
    generic: "Не удалось распознать речь, попробуйте ещё раз",
    unsupported: "Голосовой ввод не поддерживается в этом браузере",
    startFailed: "Не удалось запустить запись — попробуйте ещё раз",
    timeout: "Микрофон не ответил — проверьте разрешение и устройство ввода",
  },

  units: {
    bytes: "Б",
    kilobytes: "КБ",
    megabytes: "МБ",
  },

  upload: {
    namedFrom: (kind: string, date: string, time: string) => `${kind} от ${date}, ${time}`,
    family: {
      text: "Конспект",
      document: "Документ",
      slides: "Презентация",
      audio: "Аудиозапись",
      video: "Видеозапись",
    },
  },

  artifactContent: {
    quizIntro: (questions: number, cites: number) =>
      `${questions} ${pluralRu(questions, "вопрос", "вопроса", "вопросов")} по материалу. Собрано из ${cites} ${pluralRu(cites, "фрагмента", "фрагментов", "фрагментов")}.`,
    quizQuestions: "Вопросов",
    quizPassScore: "Проходной балл",
    quizFragments: "Фрагментов в основе",
    quizQ1Label: "Вопрос 1 · выбор ответа",
    quizQ1: (title: string, insight: string, ref: string) =>
      `Какой главный вывод материала «${title}»?\nA) ${insight}\nB) Эффект достигается только при полной автоматизации\nC) Метрики не изменяются в первый год\n\nПравильно: A · Обоснование: ${ref}`,
    quizQ2Label: "Вопрос 2 · верно/неверно",
    quizQ2: (unit: string, source: string, author: string, date: string) =>
      `«Внедрение окупается быстрее в бизнес-юните «${unit}», если есть выделенный владелец процесса.» — Верно.\nИсточник: ${source}, ${author}, ${date}.`,
    quizQ3Label: "Вопрос 3 · последовательность",
    quizQ3Steps: (steps: string) => `Расставьте шаги внедрения по порядку:\n${steps}`,
    quizQ3Fallback:
      "Назовите три ограничения применения подхода в контексте BI Group и предложите способ их снятия.",
    quizQ4Label: "Вопрос 4 · открытый",
    quizQ4:
      "Какие 2 метрики вы будете отслеживать в первые 90 дней и какой целевой уровень поставите?",
    deckIntro: (slides: number) =>
      `${slides} ${pluralRu(slides, "слайд", "слайда", "слайдов")} · формат 16:9 · спикер-ноты включены.`,
    deckSlides: "Слайдов",
    deckDuration: "Длительность",
    deckAudience: "Аудитория",
    deckMinutes: "12 мин",
    deckS1Label: "Слайд 1 · Контекст",
    deckS1: (summary: string) =>
      `${summary}\nСпикер-нота: начать с боли текущего процесса, 40 секунд.`,
    deckS2Label: "Слайд 2 · Ключевой инсайт",
    deckS2: (insight: string) => `${insight}\nВизуал: крупная цифра + сравнение «до/после».`,
    deckStepLabel: (slide: number, step: number) => `Слайд ${slide} · Шаг ${step}`,
    deckNextLabel: (slide: number) => `Слайд ${slide} · Next steps`,
    deckNext: (unit: string, author: string) =>
      `Пилот в «${unit}» — 6 недель · владелец: ${author} · чек-поинт через 30 дней · бюджет: в рамках текущего OPEX.`,
    reportIntro: (lang: string, minutes: number) =>
      `Аналитический отчёт · язык оригинала ${lang} · ~${minutes} мин чтения.`,
    reportSections: "Разделов",
    reportSources: "Источников в основе",
    reportSteps: "Шагов в рекомендации",
    reportSummary: "Резюме",
    reportKey: "Ключевой вывод",
    reportRisks: "Риски",
    reportRisksBody:
      "1. Нехватка владельца процесса на стороне бизнес-юнита.\n2. Данные для метрик собираются вручную — риск искажения baseline.\n3. Сопротивление линейных руководителей на этапе пилота.",
    reportRecommendations: "Рекомендации",
    reportRecommendationsFallback:
      "1. Определить baseline метрик.\n2. Запустить пилот на одном объекте.\n3. Зафиксировать эффект и масштабировать.",
    reportOwnerFallback: "ответственный: PMO",
    reportSourcesLabel: "Источники",
    cardsIntro: "Карточки с выводами · листайте горизонтально.",
    cardsLabel: (n: number) => `Карточка ${n}`,
    cardsQ1: (insight: string) => `A: Главный эффект подхода?\nB: ${insight}`,
    cardsQStep: (step: string, description: string) =>
      `A: Что происходит на шаге «${step}»?\nB: ${description}`,
    cardsStepFallback: "Фиксируем результат и передаём владельцу процесса.",
    podcastIntro: "Аудио-разбор · два ведущих · транскрипт синхронизирован с аудио.",
    podcastChapters: "Глав",
    podcastHosts: "Ведущих",
    podcastSources: "Источников в основе",
    podcastIntroLabel: "00:00 · Вступление",
    podcastIntroBody: (unit: string) =>
      `Зачем этот материал бизнес-юниту «${unit}» и кому его слушать в первую очередь.`,
    podcastCaseLabel: "01:20 · Разбор кейса",
    podcastDebateLabel: "04:05 · Спор ведущих",
    podcastDebate:
      "Ведущий A: эффект воспроизводим на объектах BI Group. Ведущий B: нужен baseline, иначе цифры не проверить. Компромисс — пилот на 6 недель.",
    podcastOutroLabel: "07:10 · Вывод",
    podcastOutro: (insight: string, source: string, author: string, date: string) =>
      `${insight}\nИсточник: ${source}, ${author}, ${date}.`,
    infographicIntro: "Визуальная сводка одним экраном · подходит для рассылки и дашборда.",
    infoSources: "Источников",
    infoSteps: "Шагов внедрения",
    infoLanguage: "Язык оригинала",
    infoType: "Тип контента",
    infoYear: "Год",
    infoBlock1: "Блок 1 · Заголовок",
    infoBlock2: "Блок 2 · Цифра-герой",
    infoBlock3: "Блок 3 · Путь внедрения",
    infoBlock3Fallback: "Инсайт → пилот → масштабирование",
    infoBlock4: "Блок 4 · Подпись",
  },

  quiz: {
    answeredOf: (answered: number, total: number) => `Отвечено ${answered} из ${total}`,
    passMark: "проходной балл 70%",
    result: (pct: number) => `${pct}% · ${pct >= 70 ? "зачёт" : "нужно повторить"}`,
    questionN: (n: number) => `Вопрос ${n}`,
    retake: "Пройти заново",
    q1: (title: string) => `Какой главный вывод материала «${title}»?`,
    q1o2: "Эффект достигается только при полной автоматизации всех процессов",
    q1o3: "Метрики не меняются в первый год внедрения",
    q1why: (cite: string) => `Прямая цитата из источника: ${cite}.`,
    q2: "Кто в первую очередь выигрывает от применения подхода в BI Group?",
    q2o1: "Внешние подрядчики",
    q2o2: (unit: string) => `Бизнес-юнит «${unit}»`,
    q2o3: "Только топ-менеджмент",
    q2why: (unit: string) =>
      `Материал описывает контекст «${unit}» — там эффект воспроизводим быстрее всего.`,
    q3: "Что критично зафиксировать до старта пилота?",
    q3o1: "Финальный бюджет масштабирования",
    q3o2: "Состав проектного офиса",
    q3o3: "Baseline метрик — иначе эффект нечем измерить",
    q3why: "Без baseline любые цифры «после» не проверяемы и не защищаются на комитете.",
    q4Step: (step: string) => `Что происходит на шаге «${step}»?`,
    q4Fallback: "С чего начинается внедрение?",
    q4o1Fallback: "Фиксируем текущее состояние и договариваемся о цели",
    q4o2: "Сразу масштабируем решение на все объекты",
    q4o3: "Передаём задачу внешнему консультанту",
    q4why: "Первый шаг всегда про диагностику, а не про масштабирование.",
    q5: "Какой горизонт эффекта заявлен по материалу?",
    q5o1: "1–2 недели",
    q5o2: "6–12 месяцев",
    q5o3: "3–5 лет",
    q5why: (author: string) =>
      `Автор (${author}) описывает эффект в горизонте 6–12 месяцев после пилота.`,
  },

  viewers: {
    deckRelevance: (date: string, relevance: number) => `${date} · релевантность ${relevance}%`,
    deckNote1: "Начать с боли текущего процесса — 40 секунд, без цифр.",
    deckKickerContext: "Контекст",
    deckTitleNow: "Что происходит сейчас",
    deckNote2: "Дать аудитории узнать себя в описании. Спросить: «у вас так же?»",
    deckKickerInsight: "Ключевой инсайт",
    deckTitleInsight: "Главный вывод",
    deckNote3: "Пауза после цифры. Не комментировать 3 секунды.",
    deckStepKicker: (n: number, total: number) => `Шаг ${n} из ${total}`,
    deckStepFallback: "Фиксируем результат и передаём владельцу процесса.",
    deckStepNote: (unit: string) => `Пример из практики «${unit}» — 30 секунд.`,
    deckKickerNext: "Next steps",
    deckTitlePilot: "Пилот на 6 недель",
    deckOwner: (author: string) => `Владелец: ${author}`,
    deckScope: (unit: string) => `Периметр: ${unit}, один объект`,
    deckCheckpoint: "Чек-поинт: через 30 дней",
    deckBudget: "Бюджет: в рамках текущего OPEX",
    deckNoteLast: "Закрыть договорённостью о дате чек-поинта прямо на встрече.",
    deckSlideN: (n: number) => `Слайд ${n}`,
    deckBack: "Назад",
    deckNext: "Далее",
    deckHideNotes: "Скрыть заметки",
    deckShowNotes: "Спикер-ноты",
    deckSpeakerNote: "Спикер-нота: ",
    podcastHostA: "Алия",
    podcastHostB: "Данияр",
    podcastEpisode: "AQYL Разбор · выпуск дня",
    podcastSeek: "Перемотка",
    podcastBack10: "Назад 10 секунд",
    podcastForward10: "Вперёд 10 секунд",
    podcastPause: "Пауза",
    podcastPlay: "Слушать",
    podcastLine1: (title: string) => `Привет! Сегодня разбираем материал «${title}».`,
    podcastLine2: (source: string, author: string, date: string) =>
      `Источник — ${source}, автор ${author}, ${date}.`,
    podcastLine3: (unit: string) => `Кому это важно в первую очередь? Бизнес-юниту «${unit}».`,
    podcastLineTurn: "Окей, а в чём главный вывод, если убрать всю обёртку?",
    podcastLineStep: (n: number, step: string) => `Шаг ${n}: ${step}.`,
    podcastLineDoubt: "Меня смущает одно: без baseline цифры невозможно проверить.",
    podcastLineAgree: "Согласна. Поэтому предлагаем пилот на шесть недель и замер до старта.",
    podcastLineOutro: "Договорились. Спасибо, что были с нами — и до следующего разбора.",
    cardsPrev: "Предыдущая карточка",
    cardsNext: "Следующая карточка",
    cardsTagInsight: "Инсайт",
    cardsTitleInsight: "Главный вывод",
    cardsTagContext: "Контекст",
    cardsTitleContext: "Что за материал",
    cardsTagStep: (n: number) => `Шаг ${n}`,
    cardsStepFallback: "Фиксируем результат и передаём владельцу процесса.",
    cardsTagRisk: "Риск",
    cardsTitleRisk: "Что может сломаться",
    cardsTextRisk: "Нет владельца процесса и baseline метрик — эффект не докажете на комитете.",
    cardsTagAction: "Действие",
    cardsTitleAction: "Первый шаг на этой неделе",
    cardsTextAction: (unit: string) =>
      `Собрать команду «${unit}» на 60 минут и зафиксировать текущие метрики.`,
    infoPathFallback: "Инсайт → Пилот → Масштабирование",
    infoRelevance: "Релевантность",
  },

  /** Направления бизнеса. Ключ — каноническое русское значение из данных. */
  businessUnits: {
    Строительство: "Строительство",
    Девелопмент: "Девелопмент",
    Промышленность: "Промышленность",
    "Корпоративный центр": "Корпоративный центр",
    Финансы: "Финансы",
    HR: "HR",
  } as Record<string, string>,

  positions: {
    developmentDirector: "Директор по развитию",
  },

  evidence: {
    высокий: "высокий",
    средний: "средний",
    низкий: "низкий",
    "недостаточно данных": "недостаточно данных",
  } as Record<string, string>,

  applicability: {
    "Высокая применимость": "Высокая применимость",
    "Частичная применимость": "Частичная применимость",
    "Слабая аналогия": "Слабая аналогия",
  } as Record<string, string>,

  clarify: {
    unknown: "Пока неизвестно",
    questionN: (n: number) => `Вопрос ${n}`,
    questionOfTitle: (n: number, total: number, title: string) =>
      `Вопрос ${n} из ${total}: ${title}`,
    ownOption: (placeholder: string) => `Свой вариант: ${placeholder}`,
    ownAnswerLabel: (placeholder: string) => `Свой вариант ответа: ${placeholder}`,
    modeHint: (multi: boolean, drivers: string) =>
      `${multi ? "Можно выбрать несколько вариантов." : "Выберите один вариант."} На вывод влияют: ${drivers}.`,
    followUpVolume: "А если партнёр даст гарантированный объём?",
    followUpExclusivity: "Что изменится при эксклюзивности только на один сегмент?",
    followUpWindow: "Какой сценарий выбрать, если рыночное окно 6 месяцев?",
  },

  infographic: {
    mainInsight: "Главный инсайт",
    rolloutPath: "Путь внедрения",
    footer: "Одноэкранная сводка · F — полный экран.",
  },

  profile: {
    firstName: "Марат",
    lastName: "Абенов",
    initials: "МА",
  },

  councilExtra: {
    online: "на связи",
    disclaimer:
      "AI-модели публичных подходов. Не являются реальными людьми и не выражают их частные взгляды.",
    replyTo: (name: string) => `· Ответ: ${name}`,
    typing: (name: string) => `${name} печатает…`,
    messageLabel: "Сообщение совету",
    lineup: (selected: number, max: number) => `Состав совета (${selected}/${max})`,
    done: "Готово",
    clearSearch: "Очистить поиск",
    changeLineup: "Изменить состав",
    deleteBody: (title: string) =>
      `«${title}» и вся переписка совета будут удалены без возможности восстановления.`,
    deleteConfirm: "Да, удалить",
  },

  viewerExtra: {
    cardsHint: (n: number) =>
      `Листайте горизонтально — ${n} ${pluralRu(n, "карточка", "карточки", "карточек")} с выводами по материалу.`,
    podcastHosts: (a: string, b: string, n: number) =>
      `${a} и ${b} · ${n} ${pluralRu(n, "реплика", "реплики", "реплик")}`,
    podcastHint: "Клик по реплике — перемотка. Текст подсвечивается синхронно с аудио.",
    advisorPromptTitle: "Опишите управленческую ситуацию обычным языком",
    savedSessions: "Сохранённые сессии",
  },

  /** Тематические теги. Ключ — каноническая русская метка из данных. */
  topicTags: {
    Качество: {
      label: "Качество",
      description: "Дефекты, стандарты отделки, контроль на объекте, выявление проблем",
    },
    Безопасность: {
      label: "Безопасность",
      description: "Техника безопасности на площадке, охрана труда, incidents, prevention",
    },
    Проекты: {
      label: "Проекты",
      description: "Сроки, бюджет, ресурсы, координация подрядчиков, риски задержек",
    },
    Эффективность: {
      label: "Эффективность",
      description: "Оптимизация процессов, автоматизация на стройке, sunk time, затраты",
    },
    Стандартизация: {
      label: "Стандартизация",
      description: "Унификация процессов, воспроизводимость, checklist, система контроля",
    },
    Сроки: {
      label: "Сроки",
      description: "Планирование, отслеживание прогресса, причины задержек, управление рисками",
    },
    NPS: {
      label: "NPS",
      description: "NPS покупателей, передача ключей, обслуживание после продажи, жалобы",
    },
    Опыт: {
      label: "Опыт",
      description: "От первого контакта до получения ключей, touchpoints, journey",
    },
    Лояльность: {
      label: "Лояльность",
      description:
        "Repeat purchases, lifetime value, loyalty программы, почему клиент уходит к конкурентам",
    },
    Ценообразование: {
      label: "Ценообразование",
      description:
        "Расчёт стоимости, EVC, стратегия цены, позиционирование по цене, переговоры о цене",
    },
    Маркетинг: {
      label: "Маркетинг",
      description:
        "Позиционирование, бренд-коммуникации, customer journey, омниканальность, Digital vs Offline",
    },
    Инновация: {
      label: "Инновация",
      description:
        "Разработка нового продукта, услуги или бизнес-модели; вывод на рынок; преодоление барьеров",
    },
    Конкуренция: {
      label: "Конкуренция",
      description: "Отличие от других застройщиков, уникальность предложения, positioning",
    },
    Рост: {
      label: "Рост",
      description:
        "Расширение, масштабирование, пересчёт ёмкости, стратегия роста, риски при росте",
    },
    Локализация: {
      label: "Локализация",
      description:
        "Различия между регионами, адаптация к местным условиям, масштабирование по географиям",
    },
    Стратегия: {
      label: "Стратегия",
      description:
        "Долгосрочное позиционирование, выбор рынков (Ansoff), конкурентное преимущество",
    },
    Масштабирование: {
      label: "Масштабирование",
      description:
        "Готовность системы расти, сохранение качества при росте, воспроизводимость модели",
    },
    Бренд: {
      label: "Бренд",
      description:
        "Идентичность, репутация, resonance с аудиторией, возрождение бренда, ассоциации",
    },
    Доверие: {
      label: "Доверие",
      description:
        "В отсутствующем рынке, сигналы надёжности, репутация, честность, transparent mechanics",
    },
    Лидерство: {
      label: "Лидерство",
      description:
        "Руководство людьми, принятие решений в кризис, видение, развитие команды, персональный стиль",
    },
    Культура: {
      label: "Культура",
      description:
        "Ценности компании, символы и нормы, как транслируются убеждения, культурные конфликты",
    },
    Ценности: {
      label: "Ценности",
      description: "Принципы лидера/компании, во что люди верят, на что готовы идти на компромисс",
    },
    Команда: {
      label: "Команда",
      description: "Состав, динамика, эффективность, разнообразие, развитие способностей членов",
    },
    HR: {
      label: "HR",
      description:
        "Найм, развитие персонала, retention, compensation, культурный fit, succession planning",
    },
    Управление: {
      label: "Управление",
      description: "Принятие решений, управленческие механики, процессы, контроль, делегирование",
    },
    Переговоры: {
      label: "Переговоры",
      description: "Торг с клиентом, с инвесторами, закрытие сделки, влияние и power dynamics",
    },
    Перемены: {
      label: "Перемены",
      description: "Трансформация, организационные сдвиги, resistance to change, change management",
    },
    Трансформация: {
      label: "Трансформация",
      description: "Кардинальное переизобретение, поворот стратегии, спасение от упадка",
    },
    Аналитика: {
      label: "Аналитика",
      description:
        "Анализ данных, ML-модели, прогнозирование, insights, поведенческие паттерны, data-driven decisions",
    },
    Обучение: {
      label: "Обучение",
      description:
        "Сохранение экспертизы, обучение команды, документирование процессов, передача опыта",
    },
    Финансы: {
      label: "Финансы",
      description:
        "ROI, расчёт эффекта проекта, бюджетирование, экономия средств, обоснование инвестиций",
    },
    Принципы: {
      label: "Принципы",
      description:
        "Ключевые принципы, фреймворки, алгоритмы действий, которые можно применить в других контекстах; transferable insights",
    },
  } as Record<string, { label: string; description: string }>,

  /** Теги карточек. Ключ — каноническое русское значение. */
  cardTags: {
    bim: "bim",
    hr: "hr",
    lean: "lean",
    данные: "данные",
    девелопмент: "девелопмент",
    закупки: "закупки",
    изменения: "изменения",
    инновации: "инновации",
    кризис: "кризис",
    культура: "культура",
    лидерство: "лидерство",
    "операционная эффективность": "операционная эффективность",
    организация: "организация",
    переговоры: "переговоры",
    портфель: "портфель",
    процессы: "процессы",
    себестоимость: "себестоимость",
    стратегия: "стратегия",
    трансформация: "трансформация",
    управление: "управление",
    "управление рисками": "управление рисками",
    финансы: "финансы",
    ценообразование: "ценообразование",
  } as Record<string, string>,

  /** Персоны консилиума: имена и описания подходов. */
  personas: {
    founder: {
      name: "Илон Маск",
      role: "Радикальный инженер и визионер",
      tag: "Первые принципы",
      description:
        "Разбирает проблему до базовых фактов, удаляет лишнее и ищет путь к десятикратному улучшению.",
    },
    operator: {
      name: "Джефф Безос",
      role: "Долгосрочный оператор",
      tag: "Клиент",
      description:
        "Начинает с клиента и строит масштабируемые механизмы вместо разовых героических усилий.",
    },
    engineer: {
      name: "Демис Хассабис",
      role: "Научный стратег",
      tag: "Наука",
      description:
        "Разделяет инженерную задачу и научную неизвестность, требуя точного эксперимента и проверки обобщения.",
    },
    contrarian: {
      name: "Питер Тиль",
      role: "Контрарный стратег",
      tag: "Контрарианец",
      description: "Ищет скрытую истину, сильную дифференциацию и путь от нуля к единице.",
    },
    industrialist: {
      name: "Уоррен Баффет",
      role: "Дисциплинированный инвестор",
      tag: "Ценность",
      description:
        "Проверяет понятность экономики, качество управления, цену ошибки и долгосрочную устойчивость.",
    },
    product: {
      name: "Стив Джобс",
      role: "Продуктовый редактор",
      tag: "Продукт",
      description:
        "Защищает простоту и цельность опыта, возвращая спор к вопросу: зачем это человеку.",
    },
    brand: {
      name: "Айдын Рахимбаев",
      role: "Предприниматель и лидер девелопмента",
      tag: "Девелопмент",
      description:
        "Оценивает идеи через пользу людям, качество среды, масштаб исполнения и ответственность за результат.",
    },
    platform: {
      name: "Дженсен Хуанг",
      role: "Архитектор технологических платформ",
      tag: "Полный стек",
      description:
        "Рассматривает AI, вычисления, экосистему и экономику отрасли как единый полный стек.",
    },
    competitor: {
      name: "Сэм Альтман",
      role: "Стратег AI-продуктов",
      tag: "Стартап",
      description:
        "Сочетает большую ставку со скоростью обучения, дистрибуцией и ранним реальным использованием.",
    },
    resilience: {
      name: "Рэй Далио",
      role: "Системный диагност",
      tag: "Принципы",
      description:
        "Превращает решения в явные принципы, причинно-следственные модели и циклы обратной связи.",
    },
    scale: {
      name: "Эндрю Ын",
      role: "Прагматичный AI-лидер",
      tag: "AI-практик",
      description:
        "Переводит бизнес-задачу в выполнимый AI-проект с данными, метриками и короткими итерациями.",
    },
    transform: {
      name: "Сатья Наделла",
      role: "Лидер корпоративной трансформации",
      tag: "Трансформация",
      description:
        "Соединяет технологию, культуру, партнёрства и практическую ценность для организации.",
    },
  } as Record<string, { name: string; role: string; tag: string; description: string }>,

  personaDisclaimer:
    "Цифровые модели публично известных подходов. Это не реальные люди и не их текущие или частные мнения.",

  councilTalk: {
    takes: {
      founder: (topic: CouncilTopicText) => [
        `Смело: ${topic.insight}`,
        "Если это не меняет правила игры на горизонте 10 лет — не стоит тратить на это ресурсы.",
      ],
      operator: (topic: CouncilTopicText) => [
        `Операционно: ${topic.summary}`,
        `Без чёткого владельца процесса и метрик это не повторится на масштабе направления «${topic.businessUnit}».`,
      ],
      engineer: (topic: CouncilTopicText) => [
        `Технически: прежде чем говорить про «${topic.title}», нужно проверить, что это вообще реализуемо без скрытых допущений.`,
      ],
      contrarian: (topic: CouncilTopicText) => [
        `Контрарианский взгляд: рынок наверняка уже заложил обратное — ${topic.insight.toLowerCase()}`,
        "Стоит поставить на то, где консенсус ошибается.",
      ],
      industrialist: (topic: CouncilTopicText) => [
        `Долгий горизонт: репутация направления «${topic.businessUnit}» стоит дороже быстрой выгоды.`,
        `${topic.insight} Спешить не буду.`,
      ],
      product: (topic: CouncilTopicText) => [
        `С точки зрения клиента: ${topic.summary}`,
        "Если это не улучшает жизнь конечного пользователя — вопрос ещё не решён.",
      ],
      brand: (topic: CouncilTopicText) => [
        `История имеет значение: как мы объясним «${topic.title}» людям внутри и снаружи компании?`,
        topic.insight,
      ],
      platform: (topic: CouncilTopicText) => [
        `Экосистемно: кто ещё выигрывает от «${topic.title}», если мы пойдём этим путём?`,
        `В направлении «${topic.businessUnit}» партнёрства важнее, чем контроль над каждым шагом.`,
      ],
      competitor: (topic: CouncilTopicText) => [
        `Конкурентно: ${topic.insight}`,
        `Если мы не сделаем этот шаг первыми, это сделает кто-то другой в направлении «${topic.businessUnit}».`,
      ],
      resilience: (topic: CouncilTopicText) => [
        `Через призму устойчивости: регуляторная и рыночная турбулентность рано или поздно ударит по направлению «${topic.businessUnit}» — вопрос, готовы ли мы адаптироваться быстрее других.`,
      ],
      scale: (topic: CouncilTopicText) => [
        `Эффективность прежде всего: ${topic.summary}`,
        `Каждый лишний доллар издержек на масштабе направления «${topic.businessUnit}» — упущенная маржа.`,
      ],
      transform: (topic: CouncilTopicText) => [
        `Трансформационно: старые процессы в направлении «${topic.businessUnit}» не переживут это решение без изменений в культуре.`,
        topic.insight,
      ],
    } as Record<string, (topic: CouncilTopicText) => string[]>,
    disagreement: {
      contrarian: (name: string) => `${name}, а вы уверены, что рынок ещё не отыграл это заранее?`,
      competitor: (name: string) =>
        `${name}, оптимизм — это хорошо, но кто-то из конкурентов уже наверняка думает о том же.`,
      resilience: (name: string) =>
        `${name}, красиво, но что будет с этим планом, если условия резко изменятся?`,
    } as Record<string, (name: string) => string>,
    disagreementDefault: (name: string) => `${name}, я бы не спешил.`,
    keywords: {
      risk: /риск|risk|тәуекел/i,
      plan: /план|дальше|шаг|первым|plan|next|step|first|жоспар|қадам|бірінші/i,
      agree: /согласны|друг с другом|спор|agree|disagree|argument|келіс|пікір/i,
    },
    riskReply: (unit: string) => `Главный риск: «${unit}» не прощает недооценённых сценариев.`,
    planReply: "Первый шаг — назначить владельца процесса, без этого любой план стоит на месте.",
    agreeReply:
      "Не совсем — именно в этом и смысл: если бы все соглашались, совет был бы не нужен.",
    fallback: "Тут нужен более предметный разбор — задайте вопрос конкретнее, и отвечу.",
    quickReplies: [
      "Какие главные риски?",
      "Что бы вы сделали первым?",
      "Вы согласны друг с другом?",
      "Дайте конкретный план",
    ] as string[],
  },

  /** Темы демонстрационных сессий консилиума. */
  seedTopics: {
    "seed-1": {
      title: "Iz Lynn Chan at Far East Organization (Abridged)",
      summary:
        "Региональный директор должна решить, продвигать ли local-hire менеджера в обход более опытного экспата, балансируя результативность и организационные ожидания.",
      insight:
        "Формальный стаж не гарантирует результат — решение о повышении должно опираться на измеримый вклад, а не на срок работы.",
      businessUnit: "Дальний Восток",
    },
    "seed-2": {
      title: "SpinBrush",
      summary:
        "Маленькая компания с быстро растущим продуктом выбирает между самостоятельным ростом, партнёрством с крупным игроком и продажей бизнеса.",
      insight:
        "Переговорная сила резко возрастает после подтверждения внешнего спроса — до этого момента долгосрочные права лучше не отдавать.",
      businessUnit: "Товары для дома",
    },
  } as Record<string, CouncilTopicText>,

  /** Текст AI-советника — см. src/data/advisor/text.ts. */
  advisorText: advisorRu,
};

export type Dictionary = typeof ru;
