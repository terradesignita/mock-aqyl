import type { Dictionary } from "./ru";
import { advisorKk } from "@/data/advisor/text.kk";
import type { CouncilTopicText } from "@/data/council-types";

/**
 * Қазақша сөздік. Қазақ тілінде сан есімнен кейін зат есім көптік жалғауын
 * қабылдамайды (3 файл, 5 материал), сондықтан plural көмекшілері қажет емес.
 */
export const kk: Dictionary = {
  common: {
    cancel: "Болдырмау",
    close: "Жабу",
    open: "Ашу",
    save: "Сақтау",
    saved: "Сақталды",
    delete: "Жою",
    back: "Артқа",
    next: "Әрі қарай",
    reset: "Тастау",
    copy: "Көшіру",
    copied: "Көшірілді",
    download: "Жүктеп алу",
    loading: "Жүктелуде…",
    rename: "Атын өзгерту",
    hint: "Түсіндірме",
    more: "Тағы",
    collapse: "Жию",
    expand: "Жаю",
    of: "ішінен",
    esc: "Esc",
    aiDisclaimer:
      "AQYL — жасанды интеллект, қателесуі мүмкін. Фактілер мен келтірілген дереккөздерді тексеріп отырыңыз.",
  },

  nav: {
    cases: "Кейстер",
    council: "Консилиум",
    settings: "Параметрлер мен метрикалар",
    myProfile: "Менің профилім",
    logout: "Шығу",
    userMenu: (name: string) => `Пайдаланушы мәзірі: ${name}`,
    lightTheme: "Ашық тақырып",
    darkTheme: "Қараңғы тақырып",
    profileFromSso: (unit: string, role: string) =>
      `${unit} · ${role} · профиль корпоративтік SSO-дан келеді`,
    logoutInSso: "Шығу корпоративтік SSO арқылы орындалады — прототипте ол жоқ",
  },

  footer: {
    tagline: "AQYL — корпоративтік білім платформасы",
    docs: "Құжаттама",
    support: "Қолдау",
    version: "MVP v0.1 · demo mode",
  },

  greeting: {
    night: "Қайырлы түн",
    morning: "Қайырлы таң",
    day: "Қайырлы күн",
    evening: "Қайырлы кеш",
  },

  dashboard: {
    materialsAndUnits: (materials: number, units: number) =>
      `${materials} материал · ${units} бағыт`,
    advisorMode: "AI-кеңесші",
    searchMode: "Іздеу",
    advisorSwitchLabel: "AI-кеңесші режимі",
    advisorHintOn:
      "Шешім қабылдау керек болса қосыңыз: кеңесші нақтылайтын сұрақтар қойып, сценарийлерімен бірге ұсыныс береді. Өшірулі кезде — материалдарды кәдімгі іздеу.",
    advisorHintOff:
      "Кәдімгі іздеу кейстер бойынша жүреді: атаулар, сипаттамалар және тегтер. Құжат табу емес, басқару шешімін қабылдау керек болса AI-кеңесшіні қосыңыз.",
    searchLabel: "BI AQYL материалдарынан іздеу",
    advisorLabel: "AI-кеңесшіге бизнес-жағдайды сипаттаңыз",
    searchPlaceholder: "BI AQYL-дан сұраңыз: материалдар, кейстер және презентациялар",
    advisorPlaceholder:
      "Бизнес-жағдайды немесе қабылдау керек шешімді сипаттаңыз — кеңесші талдап, ұсыныс береді",
    clear: "Тазарту",
    submit: "Сұрауды жіберу",
    voiceInput: "Дауыспен енгізу",
    voiceStop: "Жазуды тоқтату",
    voiceRequesting: "Микрофонға рұқсат сұралуда",
    voiceUnsupported: "Бұл браузерде дауыспен енгізу қолданылмайды",
    recentQuestions: "Соңғы сұрақтар",
    clearHistory: "тазарту",
    scopeAll: "Барлығы",
    scopeInternal: "BI ішкі тәжірибесі",
    scopeExternal: "Әлемдік тәжірибе",
    filters: "Сүзгілер",
    allUnits: "Барлық бағыттар",
    allLanguages: "Барлық тілдер",
    unitPlaceholder: "Бағыт",
    languagePlaceholder: "Тіл",
    casesHeading: "Кейстер",
    found: (n: number) => `Табылды: ${n}`,
    topics: "Тақырыптар",
    resetTopics: (n: number) => `Тақырыптарды тастау (${n})`,
    visibilityAll: "Барлығы",
    visibilityPrivate: "Жабық",
    visibilityShared: "Ортақ",
    visibilityHintLabel: "Жабық және Ортақ дегеніміз не",
    visibilityHint:
      "Жабық — тек сізге көрінетін кейстер. Ортақ — барлық қызметкерге қолжетімді және жалпы іздеуге қатысады.",
    bookmarks: "Бетбелгілер",
    emptyNarrowedTitle: "Ештеңе табылмады",
    emptyNarrowedBody: "Шарттар тым тар. Оларды тастасаңыз, материалдар қайтады.",
    emptyTitle: "Әзірге ештеңе табылмады",
    emptyBody: "Сұрауды жазыңыз немесе тақырып таңдаңыз. Кәдімгі сөздермен іздеуге болады.",
    resetAll: "Барлық шартты тастау",
    clearQuery: "Сұрауды тазарту",
    prevPage: "Алдыңғы бет",
    nextPage: "Келесі бет",
    page: (current: number, total: number) => `${total} ішінен ${current}-бет`,
    advisorIntroTitle: "AI-кеңесші режимі: тәжірибеге сүйенген, сіздің жағдайыңызға ұсыныс",
    advisorIntroBody:
      "Кеңесші шешім түрін анықтайды, жағдайыңыз бойынша нақтылайтын сұрақтар қояды, ұқсас кейстерді табады және тәуекелдер, шарттар мен дереккөздерімен бірге ұсыныс береді.",
    closeHint: "Түсіндірмені жабу",
    resultPages: "Нәтиже беттері",
    deleteSession: "Сақталған сессияны жою",
    advisorExamplesTitle: "Мысалы",
  },

  onboarding: {
    title: "Кейс және Материал",
    subtitle: "Бұл платформадағы екі негізгі сөз",
    caseIsFolder: "Кейс — қалта",
    fileReport: "Есеп",
    filePresentation: "Презентация",
    fileArticle: "Мақала",
    threeFilesNote: "Кейс карточкасында көретін «3 файл» жазуы — осы",
    caseBody:
      "Кейс — үстелдегі кәдімгі қағаз қалта сияқты. Өзі бос. Ішіне бір тақырып бойынша қағаздарды салсаңыз — Кейс шығады.",
    materialBody:
      "Материал — қалта ішіндегі бір қағаз: есеп, презентация немесе мақала. Бір қалтада (Кейсте) бірнеше қағаз (Материал) жатуы мүмкін — олар бір тақырып туралы болса.",
    dontShowAgain: "Бұдан былай көрсетпеу",
    gotIt: "Түсінікті",
  },

  card: {
    private: "Жабық",
    shared: "Ортақ",
    makeSharedQuestion:
      "Ортақ ету керек пе? Кейс материалдары барлық қызметкерге арналған жалпы білім қорына түседі.",
    makePrivateQuestion: "Жабық ету керек пе? Кейс материалдары басқа қызметкерлерге көрінбейді.",
    makeSharedConfirm: "Иә, ортақ ету",
    makePrivateConfirm: "Иә, жабық ету",
    privateHint: "Жабық: кейс тек сізге көрінеді және жалпы білім қорынан жасырылады.",
    sharedHint: "Ортақ: кейс барлық қызметкерге көрінеді және білім қорынан іздеуге қатысады.",
    addBookmark: "Бетбелгіге қосу",
    removeBookmark: "Бетбелгіден алу",
    bookmarkAdded: "Бетбелгіге қосылды",
    bookmarkRemoved: "Бетбелгіден алынды",
    unreadDot: "Бұл кейсті әлі ашпағансыз",
    unreadSr: "ашылмаған",
    filesCount: (n: number) => `${n} файл`,
    openCase: (title: string) => `Кейсті ашу: ${title}`,
    deleteCase: "Кейсті жою",
    deleteTitle: "Кейсті жою керек пе?",
    deleteBody: (title: string) =>
      `«${title}» тізімнен жойылады. Бұл әрекетті қайтару мүмкін емес.`,
    deleteConfirm: "Иә, жою",
    internal: "Ішкі тәжірибе",
    external: "Әлемдік тәжірибе",
  },

  workspace: {
    caseTitleLabel: "Кейс атауы",
    copyLink: "Кейс сілтемесін көшіру",
    linkCopied: "Кейс сілтемесі көшірілді",
    linkCopyFailed: "Көшіру мүмкін болмады — мекенжайды браузер жолағынан алыңыз",
    sourcesPanel: "Дереккөздер",
    artifactsPanel: "Артефактілер",
    showSources: "Дереккөздерді көрсету",
    showArtifacts: "Артефактілерді көрсету",
    closeCase: "Кейсті жабу",
    resizeSources: "Дереккөздер панелінің енін өзгерту",
    resizeArtifacts: "Артефактілер панелінің енін өзгерту",
    deletedTitle: "Кейс жойылды",
    deletedBody: (title: string) =>
      `«${title}» материалдарымен, вики-беттерімен және жазбаларымен бірге жойылды. Тікелей сілтеме мазмұнды ашпайды.`,
    backToList: "Кейстер тізіміне",
    notFoundTitle: "Карточка табылмады — BI AQYL",
    savedToNotes: "Жазбаларға сақталды",
    artifactToNotes: "Артефакт жазбаларға сақталды",
  },

  sources: {
    title: "Дереккөздер",
    selectedOf: (total: number) => `${total} ішінен`,
    selectAll: "Барлығын таңдау",
    deselectAll: "Таңдауды алу",
    collapse: "Дереккөздер панелін жию",
    collapseTitle: "Панельді жию",
    hint: "Белгіленген дереккөздер — ассистент пен артефактілерге арналған контекст. Материалды жауаптан шығару үшін белгіні алыңыз. Ештеңе таңдалмаса, ассистент жауап бермейді.",
    noneSelected:
      "Бірде-бір дереккөз таңдалмады — ассистент жауап бере алмайды, артефакт та жиналмайды.",
    dropzone: "Файлдарды осында тартып апарыңыз немесе таңдау үшін басыңыз",
    dropzoneNaming: "Материал атауын мазмұнынан аламыз",
    useInChat: (title: string) => `«${title}» дереккөзін чатта пайдалану`,
    actionsMenu: "Дереккөз әрекеттері",
    openInReader: "Оқу режимінде ашу",
    renamePrompt: "Дереккөздің жаңа атауы",
    renamed: "Дереккөз атауы өзгертілді",
    downloadMd: ".md жүктеп алу",
    downloaded: "Дереккөз .md түрінде жүктелді",
    removed: "Дереккөз кейстен жойылды",
    groupFiles: "Жүктелген файлдар",
    groupFilesEmpty: "Әзірге файл жоқ — біріншісін жүктеңіз",
    groupLinks: "Материалдарға сілтемелер",
    groupLinksEmpty: "Бұл кейсте сілтеме жоқ",
    groupLinksHint: "Кейс сілтеме жасайтын сыртқы материалдар. Файлдар сияқты контекстке қатысады.",
    rejectedTitle: "Қосылмады — пішім қолданылмайды",
    rejectedHide: "Қабылданбаған файлдар туралы хабарламаны жасыру",
    rejectedBody:
      "Құжаттарды, презентацияларды, аудио мен бейнені қабылдаймыз. Кестелер мен архивтерді өңдейтін құрал әзірге жоқ — қажеттісін PDF немесе мәтінге шығарыңыз.",
    rejectedOne: (name: string) => `«${name}» — пішім қолданылмайды`,
    rejectedMany: (n: number) => `${n} файл қабылданбады: пішім қолданылмайды`,
    addedOne: (title: string) => `«${title}» кейске қосылды`,
    noTypeLabel: "пішімі жоқ",
    notes: "Жазбалар",
    notesHint:
      "«Жазбаларға» түймесімен сақтаған ассистент жауаптары осында түседі. Оларды көшіруге немесе жоюға болады.",
    notesEmpty: "Диалогтан жауаптарды сақтаңыз — олар осында шығады.",
    removeNote: "Жазбаны жою",
    linkLabel: "Сілтеме",
    uploadedAt: (date: string) => `${date} жүктелді`,
  },

  ingest: {
    queued: "Кезекте",
    queuedDetail: "Файл қабылданды, өңдеуді күтуде",
    converting: "Түрлендіру",
    convertingDetail: "Слайдтарды PDF-ке келтіремін",
    extracting: "Аудионы бөліп алу",
    extractingDetail: "Дыбыс жолағын ажыратамын",
    parsing: "Талдау",
    parsingDetail: "Құжаттың мәтіні мен құрылымын шығарамын",
    transcribing: "Транскрипциялау",
    transcribingDetail: "Сөзді танып жатырмын",
    embedding: "Индекстеу",
    embeddingDetail: "Фрагменттердің эмбеддингтерін есептеймін",
    wiki: "Вики-бет",
    wikiDetail: "Мазмұнды, тегтерді және фактілерді жинаймын",
  },

  reader: {
    fontSize: "Қаріп өлшемі",
    fullscreen: "Толық экран",
    autoTagsSr: "Автоматты тегтер:",
    autoTagsHint: "Тегтер бет құрылған кезде автоматты қойылды",
    facts: "Бөлектелген фактілер",
    toc: "Мазмұны",
    tocLabel: "Мазмұны",
    wikiFooter: (date: string, origin: string) => `Вики-бет ${date} мына файлдан жиналды:`,
    chunksIndexed: (n: number) => `индексте ${n} фрагмент`,
    chunksNone: "фрагменттер индекстелмеген",
    usedInChat: "Чатта пайдаланылады",
    addToContext: "Контекстке қосу",
    askAbout: "Дереккөз бойынша сұрау",
    askAboutQuestion: (title: string) => `«${title}» дереккөзінде не маңызды?`,
    openOriginal: "Түпнұсқаны ашу",
    quoteHighlighted: "Дәйексөз мәтінде бөлектелген · ",
    escHint: "Esc — жабу · Aa — мәтін өлшемі",
    sectionContent: "Мазмұны",
    sectionStart: "Материалдың басы",
    sectionHowBuilt: "Бұл бет қалай құрылды",
    howBuiltText:
      "Мәтін тікелей браузерде оқылды, тақырып мазмұнынан алынды. Фрагменттерге бөлу, эмбеддингтер және білім қорының басқа материалдарымен байланыстыру — ingestion қызметінің жұмысы; прототипте ол жоқ, сондықтан іс беттен әрі жүрмейді.",
    notParsed: (stages: string, kind: string) =>
      `Файл қабылданып, өңдеу кезеңдерінен өтті (${stages}). ${kind} талдауын бэкенд орындайды, ол прототипте жоқ — сондықтан мұнда мәтін болмайды.`,
    kindSpeech: "Сөзді",
    kindContent: "Мазмұнды",
    format: "Пішім",
    size: "Өлшем",
    uploaded: "Жүктелді",
    tagUploadedByYou: "өзіңіз жүктедіңіз",
    familyText: "конспект",
    familyDocument: "құжат",
    familySlides: "презентация",
    familyAudio: "аудио",
    familyVideo: "бейне",
    annotation: "Аңдатпа",
    keyTakeaway: "Негізгі тұжырым",
    citedFragment: "Ассистент сілтеме жасайтын фрагмент",
    citedFragmentBody: (anchor: string, author: string, unit: string, lang: string, date: string) =>
      `«${anchor}». Материалды дайындаған: ${author}. Бағыт: ${unit}. Түпнұсқа тілі: ${lang}. Жаңартылған күні: ${date}.`,
    howToApplyBody: (unit: string) =>
      `Материалды «${unit}» бағытының командалары шешім дайындауда пайдаланады. Практиканы алаңға көшірер алдында тұжырымдарды ішкі регламенттер мен нысан деректерімен салыстыру ұсынылады.`,
    practicalPart: "Практикалық бөлім",
    howToApply: "BI Group-та қалай қолдануға болады",
    factDate: "Жаңартылған күні",
    factLanguage: "Түпнұсқа тілі",
    factMediaType: "Материал түрі",
    factSteps: "Практикалық бөлімдегі қадам",
    pages: (n: number) => `${n} бет`,
  },

  chat: {
    assistant: "AQYL ассистенті",
    contextOf: (selected: number, total: number) => `Контекст: ${total} дереккөзден ${selected}`,
    contextHint:
      "Ассистент тек сол панельде белгіленген дереккөздер бойынша жауап береді. Жауаптағы [1], [2] сілтемелері нақты дәйексөзге апарады.",
    refusal:
      "Жауап бере алмаймын: дереккөздер панелінде бірде-бір материал таңдалмаған.\n\nСол жақтан кемінде бір дереккөзді белгілеңіз — жауап тек таңдалған контекст бойынша құрылады, онсыз менде негіз жоқ.",
    thinking: (n: number) => `${n} дереккөзді талдап жатырмын…`,
    questionLabel: "Таңдалған дереккөздер бойынша сұрақ",
    placeholder: (n: number) => `Таңдалған ${n} дереккөз бойынша сұрақ қойыңыз…`,
    placeholderEmpty: "Сұрақ қою үшін сол жақтан дереккөзді белгілеңіз",
    placeholderListening: "Тыңдап жатырмын…",
    placeholderRequesting: "Микрофон сұралуда…",
    voiceStarted: "Айтыңыз — сұрағыңызды жазып жатырмын",
    send: "Жіберу",
    moreSuggestions: "Тағы нұсқалар",
    helpful: "Пайдалы жауап",
    notHelpful: "Сәтсіз жауап",
    markedHelpful: "Рақмет, пайдалы деп белгіледік",
    markedNotHelpful: "Ескеремін — жауап белгіленді",
    toNotes: "Жазбаларға",
    reportError: "Қате туралы хабарлау",
    reportQuestion: "Жауапта не дұрыс емес?",
    reportSent: (reason: string) => `Редакторларға жіберілді: «${reason}»`,
    reasonWrongFact: "Дұрыс емес факт",
    reasonWrongQuote: "Дәйексөз сәйкес емес",
    reasonOffTopic: "Жауап сұраққа сай емес",
    reasonOutdated: "Ескірген деректер",
    reasonConfidential: "Құпия деректер",
    sourceN: (n: number) => `${n}-дереккөз`,
    sourceBracket: (n: number) => `Дереккөз [${n}]`,
    clickToOpenReader: "Оқу режимінде ашу үшін басыңыз",
    suggestions: [
      "Бұл материал не туралы, қысқаша?",
      "Жиналысқа 5 негізгі тезис бер",
      "Мұны бізде қалай қолданамыз?",
      "Енгізудің қадамдық жоспарын жаса",
      "Қандай тәуекелдер мен шектеулер бар?",
      "Алаңда не дұрыс болмауы мүмкін?",
      "Қандай метрикаларды бақылау керек?",
      "Енгізу қанша уақыт алады?",
      "Бұл біздің практикадан неімен ерекшеленеді?",
      "Процестің иесі кім болуы керек?",
      "Дереккөздер мен дәйексөздерді көрсет",
      "Басшыға хат жазып бер",
      "Мердігерге қандай сұрақ қою керек?",
      "Тұжырымды қарапайым тілге аудар",
      "Бірінші аптаға тексеру парағын жаса",
    ] as string[],
    answerRisks: (source: string, unit: string) =>
      `Шектеулер мен тәуекелдер:\n1. «${source}» материалының контексті BI Group алаңдарынан өзгеше — жұмыс көлемі бойынша калибрлеу қажет.\n2. Әсер 2–3 тоқсан көлемінде көрінеді, ерте өлшеу жаңылыстырады.\n3. Процестің иесі болмаса, практика бұрынғы қалпына қайтады.`,
    answerSteps: (steps: string) =>
      `Таңдалған дереккөздер негізінде қолдану былай көрінеді:\n${steps}`,
    answerMetrics: (insight: string) =>
      `Нені өлшеу керек:\n• Енгізуге дейінгі базалық көрсеткіш (4 апталық өлшем).\n• Негізгі әсер: ${insight}\n• Жылдамдық сапаны жеп кетпеуі үшін сапаны бақылайтын метрика.`,
    answerWhy: (insight: string) => `Негізгі тұжырым: ${insight}`,
    answerCompare: (unit: string) =>
      `Қазіргі практикадан айырмашылығы: материал салдарды емес, себепті басқаруды ұсынады. «${unit}» бағытында бұл күшті дайындық кезеңіне ауыстыруды білдіреді.`,
    answerSources: (n: number, source: string, author: string) =>
      `Жауап «${source}» материалынан (${author}) таңдалған ${n} фрагментке сүйенеді. Дәйексөзді көру үшін сілтемеге курсорды апарыңыз, ашу үшін басыңыз.`,
    answerSummary: (summary: string, insight: string) => `${summary}\n\nНегізгі инсайт: ${insight}`,
    answerDefault: (summary: string, insight: string) =>
      `${summary}\n\nНегізгі инсайт: ${insight}\n\nҚажет болса — енгізу қадамдарына жіктеп берем немесе метрикалар тізімін жинаймын.`,
  },

  studio: {
    title: "Артефактілер",
    hint: "Таңдалған дереккөздер негізіндегі дайын пішімдер: тест, презентация, есеп, карточкалар, подкаст, инфографика. «⋮» — қайта жасау, толық экранда ашу немесе жүктеп алу.",
    readyOf: (ready: number, total: number) => `${total} ішінен ${ready} дайын`,
    contextCount: (n: number) => `контекст: ${n} дереккөз`,
    collapse: "Артефактілер панелін жию",
    noContext:
      "Белгіленген дереккөз жоқ — артефакт жинауға негіз жоқ. Дереккөздер панелінде материалды белгілеңіз.",
    noContextToast: "Кемінде бір дереккөзді белгілеңіз — артефакт жинауға негіз жоқ",
    noContextTitle: "Белгіленген дереккөз жоқ",
    busyTitle: "Ағымдағы жасау аяқталуын күтіңіз",
    generating: (title: string) => `«${title}» жасалуда`,
    generatingShort: "Жасалуда…",
    ready: "Дайын · ашу",
    stepReading: "Белгіленген дереккөздерді оқып жатырмын",
    stepExtracting: "Негізгі тезистерді бөліп алам",
    stepAssembling: "Пішімді жинаймын",
    actionsFor: (title: string) => `Әрекеттер — ${title}`,
    generate: "Жасау",
    regenerateMenu: "Қайтадан жасау",
    openFullscreen: "Толық экранда ашу",
    copyText: "Мәтінді көшіру",
    downloadPdf: "PDF жүктеп алу",
    saveToNotes: "Жазбаларға сақтау",
    copiedToast: "Артефакт мәтіні көшірілді",
    downloadedMd: ".md файлы жүктелді",
    printDialog: "Басып шығару терезесі ашылды — PDF ретінде сақтаңыз",
    regenerated: "Артефакт қайта жасалды",
    regeneratedByContext: "Артефакт ағымдағы контекст бойынша қайта жасалды",
    aiFooter:
      "Артефактілерді жасанды интеллект белгіленген дереккөздерден жинайды. Жіберер алдында сандар мен дәйексөздерді түпнұсқамен салыстырыңыз.",
    generatedByAi: "жасанды интеллект жасаған",
    quiz: "Тест",
    quizSubtitle: "Түсінуді тексеру",
    deck: "Презентация",
    deckSubtitle: "Кездесуге арналған слайдтар",
    report: "Есеп",
    reportSubtitle: "Аналитикалық есеп",
    cards: "Карточкалар",
    cardsSubtitle: "Тұжырымдар карточкасы",
    podcast: "Подкаст",
    podcastSubtitle: "Материал бойынша аудио",
    infographic: "Инфографика",
    infographicSubtitle: "Бір экрандық көрнекі жинақ",
  },

  artifactDialog: {
    fromSources: "Таңдалған дереккөздерден жасалды",
    exitFullscreen: "Толық экраннан шығу",
    enterFullscreen: "Толық экран",
    collapseHint: "Жию (Esc)",
    expandHint: "Жаю (F)",
    closeHint: "Жабу (Esc)",
    footerHintFull: "Esc — толық экраннан шығу · F — толық экран",
    footerHint: "Esc — жабу · F — толық экран",
    regenerate: "Қайта жасау",
    regenerating: "Қайта жасалуда…",
    metricsCaption:
      "Артефакт құрамы мен белгіленген дереккөздерден есептеледі — модельдің бағасы емес.",
  },

  advisor: {
    stageClarify: "Нақтылау",
    stageUnderstanding: "Түсіну",
    stageThinking: "Талдау",
    stageAnswer: "Ұсыныс",
    stageStatus: (label: string) => `Кезең: ${label}`,
    typeHint: (known: string) =>
      `Шешім түрі сұрауыңыз бойынша анықталды. Сұраудан белгілі: ${known}.`,
    savedIndicator: "Сақталды — беттен кейін қайтады",
    savedIndicatorShort: "Сақталды",
    notManagerialTitle: "Бұл басқару сұрағы емес, материал іздеуге ұқсайды",
    notManagerialBody:
      "AI-кеңесші стратегиялық шешімдермен жұмыс істейді: серіктестік, үлесті сату, рынокқа шығу, ауқымдау, инвестиция. Құжат пен кейс табу үшін тумблерді өшіріңіз немесе жағдай мен шешілуі керек сұрақты тұжырымдаңыз.",
    rephrase: "Басқаша тұжырымдау",
    clarifyGate: "Негізгі сұрақтарға жауап беріңіз — онсыз ұсыныс құрылмайды.",
    ownAnswer: "Өз сөзіммен жауап беру",
    questionOf: (current: number, total: number) => `${current}/${total}`,
    understandingTitle: "Жағдайыңызды мен былай түсіндім",
    extraContextPlaceholder: "Контекст қосу: ұсыныста тағы не ескерілуі керек",
    allCorrect: "Бәрі дұрыс",
    editAnswers: "Жауаптарды өзгерту",
    confirmGate: "Растамағанша ұсыныс құрылмайды",
    situation: "Жағдай",
    changeSituation: "өзгерту",
    closeAnswer: "Ұсынысты жабу және жаңа сұрақ қою",
    verdictShort: "Қысқаша тұжырым",
    verdictRefusal: "Ашық бас тарту",
    mainInsight: "Негізгі стратегиялық инсайт",
    evidenceLevel: (level: string) => `Дәлелділік деңгейі: ${level}`,
    evidenceHintLabel: "Дәлелділік деңгейі дегеніміз не",
    evidenceHint:
      "Шкала: жоғары — бірнеше тәуелсіз дереккөз; орташа — бір сенімді дереккөз; төмен — жанама деректер; деректер жеткіліксіз — кеңесші ұсыныстан бас тартады.",
    sectionWhy: "Мұндай тұжырым неге жасалды",
    sectionCase: (title: string) => `Ұқсас кейс: ${title}`,
    applicabilityHintLabel: "Кейс қолданылуы дегеніміз не",
    applicabilityHint:
      "Бұл кейс сіздің жағдайыңызға қаншалықты ұқсас: жоғары — шарттар дерлік бірдей; ішінара — факторлардың бір бөлігі сәйкес; әлсіз — тек жалпы логика, бөлшектерін көшіруге болмайды.",
    matches: "Не сәйкеседі",
    differences: "Не өзгеше",
    sectionTransfer: "Нені көшіруге болады, нені болмайды",
    canTransfer: "Көшіруге болады",
    cannotTransfer: "Тікелей көшіруге болмайды",
    sectionRecommendation: "Ұсыныс және ұсынылатын шарттар",
    proposedTerms: "Ұсынылатын шарттар",
    sectionScenarios: "Шешім нұсқалары",
    referenceGroup: "Анықтама — бұл қайдан алынды",
    colScenario: "Сценарий",
    colSpeed: "Жылдамдық",
    colControl: "Бақылау",
    colRisk: "Тәуекел",
    colWhen: "Қашан қолайлы",
    recommendedBadge: "ұсынамыз",
    sectionRisks: "Тәуекелдер",
    sectionChangeFactors: "Ұсынысты не өзгертуі мүмкін",
    sectionMissing: "Ақырғы шешім үшін не жетіспейді",
    sectionSources: "Дереккөздер",
    sourceKindWeight: "Дереккөз түрі және тұжырымдағы салмағы",
    sourceKindHint:
      "Дереккөз түрі: құжаттағы факт, автордың талдауы, өз жазбаңыз немесе жасанды интеллект жасаған. Тұжырымдағы салмағы: айқындаушы — тұжырым оған сүйенеді; растаушы — күшейтеді; контекстік — тек фон.",
    sourceOpened: (title: string) => `«${title}» дереккөзі ашылды`,
    followUpTitle: "Шарттарды нақтылау немесе өзгерту",
    followUpThinking: "Ұсыныста не өзгеретінін қарап жатырмын…",
    followUpPlaceholder: "Осы ұсыныс бойынша нақтылайтын сұрақ қойыңыз",
    followUpLabel: "Ұсыныс бойынша нақтылайтын сұрақ",
    followUpSend: "Нақтылауды жіберу",
    negotiationButton: "Серіктеске сұрақтар дайындау",
    shareholderButton: "Акционерге арналған нұсқа жасау",
    saveAnalysis: "Талдауды сақтау",
    negotiationTitle: "Келіссөзге арналған сұрақтар",
    shareholderTitle: "Акционерге арналған нұсқа",
  },

  council: {
    title: "Консилиум",
    assembleTitle: "Консилиум жинаңыз",
    whatIsLabel: "Консилиум дегеніміз не",
    whatIsHint:
      "Консилиум — міндетіңізді бірнеше AI-персонамен топтық талқылау. Әрқайсысы өз көзқарасын әкеледі, сондықтан бір пікірдің орнына пікір алмасу мен әртүрлі көзқарас аласыз. Бірден үшке дейін қатысушы таңдаңыз.",
    selectedOf: (selected: number, max: number) => `${max} ішінен ${selected} таңдалды`,
    capacityReached: "Үштен көп қатысушы таңдауға болмайды.",
    similarViews:
      "Бұл құрамда көзқарастар ұқсас — пікір алмасу болмауы мүмкін. Контрариан немесе скептик қосып көріңіз.",
    sessions: "Сессиялар",
    createCouncil: "Кеңес құру",
    searchSessions: "Сессиялардан іздеу",
    nothingFound: (query: string) => `«${query}» бойынша ештеңе табылмады.`,
    today: "Бүгін",
    earlier: "Бұрын",
    startCouncil: "Кеңесті бастау",
    selectHint: "Кеңес қатысушыларын және талқылайтын кейсті таңдаңыз",
    collapseSessions: "Сессиялар тізімін жию",
    resizeSessions: "Сессиялар тізімінің енін өзгерту",
    deleteSession: "Сессияны жою",
    followUpPlaceholder: "Кеңеске сұрақ қойыңыз",
    followUpSend: "Жіберу",
    participants: (names: string) => `Қатысушылар: ${names}`,
    participantsCount: (n: number) => `${n} қатысушы`,
    pickCaseTitle: "Кеңесті бастау үшін кейс таңдаңыз",
    pickCaseHint:
      "Кеңес талдайтын кейсті таңдаңыз. Персоналар сол кейсті талқылайды — жағдайды, негізгі инсайтты және дәйексөздерді сол жерден алады.",
    pickCaseHintLabel: "Мұнда нені таңдау керек",
    needParticipant: "Кеңеске кемінде бір қатысушы қосыңыз",
    searchCase: "Кейсті атауы бойынша табыңыз",
    searchPersona: "Персонаны аты немесе стилі бойынша табыңыз",
    messagePlaceholder: "Хабарлама жазу…",
    send: "Жіберу",
    showSessions: "Сессияларды көрсету",
    showSessionsPanel: "Сессиялар панелін көрсету",
    collapsePanel: "Панельді жию",
    sessionDeleted: "Сессия жойылды",
    deleteSessionTitle: "Сессияны жою керек пе?",
    deleteSessionNamed: (title: string) => `«${title}» сессиясын жою`,
    react: (emoji: string) => `${emoji} реакциясын қою`,
    unread: "Оқылмаған",
    readReceipt: " · Оқылды ✓✓",
    topicQuestion: "Не туралы сөйлесеміз?",
    councilShort: "Кеңес",
    reactionLabel: (emoji: string) => `Реакция ${emoji}`,
  },

  settings: {
    title: "Параметрлер",
    subtitle: "Профиль, көрініс және платформаны пайдалану статистикасы.",
    profile: "Профиль",
    profileHint: "Деректер корпоративтік SSO-дан (BILife) келеді. Прототипте профиль тұрақты.",
    loginIs: (login: string) => `логин ${login}`,
    appearance: "Көрініс және тіл",
    theme: "Тақырып",
    themeLight: "Ашық",
    themeDark: "Қараңғы",
    interfaceLanguage: "Интерфейс тілі",
    languageHint:
      "Бүкіл интерфейс ауысады: жазулар, түсіндірмелер, ұсыныс-чиптер және жасалатын мәтіндер. Таңдау осы браузерде сақталады.",
    languageChanged: "Интерфейс тілі ауыстырылды",
    materialLanguages: (list: string) =>
      `Қорда материалдар мына тілдерде бар: ${list} — түпнұсқа тілі карточкада және сүзгілерде көрінеді.`,
    library: "Білім қоры",
    libraryHint: "Қордың нақты құрамы бойынша есептеледі, санмен қойылмайды.",
    cases: "Кейс",
    materials: "Материал",
    units: "Бағыт",
    freshest: "Ең жаңа материал",
    internalExternal: "Ішкі тәжірибе / әлемдік",
    formats: "Пішімдер",
    topTopics: "Жиі тақырыптар",
    activity: "Сіздің әрекеттеріңіз",
    activityHint:
      "Соңғы 14 күндегі осы браузердегі әрекеттер. Өнімде бұл сервердегі оқиғалар, барлық құрылғыңызға ортақ.",
    activityEmptyTitle: "Әзірге бос",
    activityEmptyBody:
      "Кейс бойынша сұрақ қойыңыз, артефакт жинаңыз немесе материал жүктеңіз — осында күндер мен әрекет түрлері бойынша бөліністер шығады.",
    openCases: "Кейстерді ашу",
    questions: "Сұрақ",
    artifacts: "Артефакт",
    uploads: "Жүктеу",
    totalActions: "Барлық әрекет",
    activityChartLabel: "Күндер бойынша әрекет",
    activityOnDay: (day: string, n: number) => `${day}: ${n} әрекет`,
    latest: "Соңғысы",
    clearLog: "Журналды тазарту",
    logCleared: "Әрекет журналы тазартылды",
    feedback: "Жауап бағалары",
    feedbackHint:
      "Ассистент жауаптарының астында не белгілегеніңіз. Өнімде бұл оқиғалар білім қоры редакторларына барады және қайта оқытуға негіз болады.",
    feedbackUp: "Пайдалы",
    feedbackDown: "Сәтсіз",
    feedbackReports: "Шағым",
    reportReasons: "Шағым себептері",
    noReports:
      "Шағым жоқ. Ассистент жауабының астындағы «Қате туралы хабарлау» түймесі себепті осында жазады.",
    stored: "Сақталған",
    storedHint: "Мұның бәрі браузер жадында: өнімде — серверде, барлық құрылғыдан қолжетімді.",
    storedBookmarks: "Бетбелгілер",
    storedAdvisor: "Кеңесші консультациялары",
    storedCouncil: "Консилиум сессиялары",
    openLink: "ашу",
  },

  activity: {
    question: "Ассистентке сұрақ",
    artifact: "Артефакт",
    upload: "Материал жүктеу",
    advisor: "Кеңесші консультациясы",
    council: "Консилиум",
    note: "Жазба",
  },

  roles: {
    viewer: "Оқу",
    editor: "Редактор",
    owner: "Иесі",
    admin: "Әкімші",
    viewerDesc: "Іздеуге, оқуға және артефакт жасауға болады. Жүктеу мен жою қолжетімсіз.",
    editorDesc: "Материал жүктеуге, атау мен тегтерді өзгертуге, өз кейсін жоюға болады.",
    ownerDesc: "Редактор құқықтары және өз кейстеріне қолжетімділікті басқару.",
    adminDesc: "Толық қолжетімділік, өзгенің кейстері мен платформа параметрлерін қоса.",
  },

  media: {
    document: "Құжат",
    video: "Бейне",
    podcast: "Подкаст",
    presentation: "Презентация",
  },

  errors: {
    notFoundTitle: "Бет табылмады",
    notFoundBody: "Мұндай бет жоқ немесе ол көшірілген.",
    toHome: "Басты бетке",
    crashTitle: "Бет жүктелмеді",
    crashBody: "Бірдеңе дұрыс болмады. Бетті жаңартып көріңіз немесе басты бетке қайтыңыз.",
    retry: "Қайта көру",
  },

  voice: {
    notAllowed: "Микрофонға рұқсат жоқ — браузер параметрлерінде рұқсат беріңіз",
    noMic: "Микрофон табылмады",
    network: "Сөзді тану желісіз жұмыс істемейді",
    noSpeech: "Сөз танылмады — қайта көріңіз",
    aborted: "Жазу тоқтатылды",
    generic: "Сөзді тану мүмкін болмады, қайта көріңіз",
    unsupported: "Бұл браузерде дауыспен енгізу қолданылмайды",
    startFailed: "Жазуды бастау мүмкін болмады — қайта көріңіз",
    timeout: "Микрофон жауап бермеді — рұқсат пен енгізу құрылғысын тексеріңіз",
  },

  units: {
    bytes: "Б",
    kilobytes: "КБ",
    megabytes: "МБ",
  },

  upload: {
    namedFrom: (kind: string, date: string, time: string) => `${date}, ${time} — ${kind}`,
    family: {
      text: "Конспект",
      document: "Құжат",
      slides: "Презентация",
      audio: "Аудиожазба",
      video: "Бейнежазба",
    },
  },

  /** Файлдан кейс жасау. Есеп (40-сурет): жаңа білім үшін кіру нүктесі. */
  newCase: {
    cta: "Жаңа кейс",
    title: "Жаңа кейс",
    body: "Кейс — материал және оның айналасындағының бәрі: дереккөздер, диалог және артефактілер. Файлдан бастаңыз: құжат, слайдтар, аудио немесе бейне.",
    unitLabel: "Бағыт",
    dropTitle: "Файлды осында тастаңыз немесе дискіден таңдаңыз",
    dropBody: (n: number) =>
      `${n} формат қабылданады. Кейс атауын файл атынан емес, мазмұнынан аламыз.`,
    pickFile: "Файл таңдау",
    onlyFirstFile: (rest: number) =>
      `${rest} файл алынмады: кейс бір материалдан жасалады, қалғанын кейс ішінде қосыңыз.`,
    created: (title: string) => `«${title}» кейсі жасалды`,
    pendingSummary:
      "Файл мазмұны әлі талданбаған — прототипте мәтінді шығару жоқ. Дереккөз қосылды, диалог пен артефактілер оған сүйенеді.",
    pendingInsight: "Негізгі тұжырым материал талданғаннан кейін пайда болады.",
    searchHotkey: "Іздеу үшін «/» басыңыз",
  },

  artifactContent: {
    quizIntro: (questions: number, cites: number) =>
      `Материал бойынша ${questions} сұрақ. ${cites} фрагменттен жиналды.`,
    quizQuestions: "Сұрақ",
    quizPassScore: "Өту балы",
    quizFragments: "Негізге алынған фрагмент",
    quizQ1Label: "1-сұрақ · жауап таңдау",
    quizQ1: (title: string, insight: string, ref: string) =>
      `«${title}» материалының басты тұжырымы қандай?\nA) ${insight}\nB) Әсер тек толық автоматтандыруда жетеді\nC) Метрикалар бірінші жылы өзгермейді\n\nДұрысы: A · Негіздеме: ${ref}`,
    quizQ2Label: "2-сұрақ · дұрыс/дұрыс емес",
    quizQ2: (unit: string, source: string, author: string, date: string) =>
      `«Процестің жеке иесі болса, «${unit}» бизнес-юнитінде енгізу тезірек өтеледі.» — Дұрыс.\nДереккөз: ${source}, ${author}, ${date}.`,
    quizQ3Label: "3-сұрақ · тізбек",
    quizQ3Steps: (steps: string) => `Енгізу қадамдарын ретімен қойыңыз:\n${steps}`,
    quizQ3Fallback:
      "BI Group контекстінде тәсілді қолданудың үш шектеуін атап, оларды жоюдың жолын ұсыныңыз.",
    quizQ4Label: "4-сұрақ · ашық",
    quizQ4: "Алғашқы 90 күнде қандай 2 метриканы бақылайсыз және қандай мақсатты деңгей қоясыз?",
    deckIntro: (slides: number) => `${slides} слайд · 16:9 пішімі · спикер-ноталар қосылған.`,
    deckSlides: "Слайд",
    deckDuration: "Ұзақтығы",
    deckAudience: "Аудитория",
    deckMinutes: "12 мин",
    deckS1Label: "1-слайд · Контекст",
    deckS1: (summary: string) =>
      `${summary}\nСпикер-нота: қазіргі процестің ауыртпалығынан бастау, 40 секунд.`,
    deckS2Label: "2-слайд · Негізгі инсайт",
    deckS2: (insight: string) => `${insight}\nВизуал: ірі сан + «дейін/кейін» салыстыруы.`,
    deckStepLabel: (slide: number, step: number) => `${slide}-слайд · ${step}-қадам`,
    deckNextLabel: (slide: number) => `${slide}-слайд · Келесі қадамдар`,
    deckNext: (unit: string, author: string) =>
      `«${unit}» бағытында пилот — 6 апта · иесі: ${author} · 30 күннен кейін чек-пойнт · бюджет: қазіргі OPEX шегінде.`,
    reportIntro: (lang: string, minutes: number) =>
      `Аналитикалық есеп · түпнұсқа тілі ${lang} · ~${minutes} мин оқу.`,
    reportSections: "Бөлім",
    reportSources: "Негізге алынған дереккөз",
    reportSteps: "Ұсыныстағы қадам",
    reportSummary: "Түйін",
    reportKey: "Негізгі тұжырым",
    reportRisks: "Тәуекелдер",
    reportRisksBody:
      "1. Бизнес-юнит тарапында процесс иесінің болмауы.\n2. Метрика деректері қолмен жиналады — baseline бұрмалану тәуекелі.\n3. Пилот кезеңінде желілік басшылардың қарсылығы.",
    reportRecommendations: "Ұсыныстар",
    reportRecommendationsFallback:
      "1. Метрикалардың baseline-ін анықтау.\n2. Бір нысанда пилот іске қосу.\n3. Әсерді тіркеп, ауқымдау.",
    reportOwnerFallback: "жауапты: PMO",
    reportSourcesLabel: "Дереккөздер",
    cardsIntro: "Тұжырымдар карточкасы · көлденең сырғытыңыз.",
    cardsLabel: (n: number) => `${n}-карточка`,
    cardsQ1: (insight: string) => `A: Тәсілдің басты әсері?\nB: ${insight}`,
    cardsQStep: (step: string, description: string) =>
      `A: «${step}» қадамында не болады?\nB: ${description}`,
    cardsStepFallback: "Нәтижені тіркеп, процесс иесіне тапсырамыз.",
    podcastIntro: "Аудио-талдау · екі жүргізуші · транскрипт аудиомен синхрондалған.",
    podcastChapters: "Тарау",
    podcastHosts: "Жүргізуші",
    podcastSources: "Негізге алынған дереккөз",
    podcastIntroLabel: "00:00 · Кіріспе",
    podcastIntroBody: (unit: string) =>
      `Бұл материал «${unit}» бизнес-юнитіне не үшін керек және оны алдымен кім тыңдауы тиіс.`,
    podcastCaseLabel: "01:20 · Кейсті талдау",
    podcastDebateLabel: "04:05 · Жүргізушілер пікірі",
    podcastDebate:
      "A жүргізуші: әсер BI Group нысандарында қайталанады. B жүргізуші: baseline керек, әйтпесе сандарды тексеру мүмкін емес. Ымыра — 6 апталық пилот.",
    podcastOutroLabel: "07:10 · Тұжырым",
    podcastOutro: (insight: string, source: string, author: string, date: string) =>
      `${insight}\nДереккөз: ${source}, ${author}, ${date}.`,
    infographicIntro: "Бір экрандық көрнекі жинақ · таратуға және дашбордқа қолайлы.",
    infoSources: "Дереккөз",
    infoSteps: "Енгізу қадамы",
    infoLanguage: "Түпнұсқа тілі",
    infoMediaType: "Материал түрі",
    infoType: "Мазмұн түрі",
    infoYear: "Жыл",
    infoBlock1: "1-блок · Тақырып",
    infoBlock2: "2-блок · Басты сан",
    infoBlock3: "3-блок · Енгізу жолы",
    infoBlock3Fallback: "Инсайт → пилот → ауқымдау",
    infoBlock4: "4-блок · Қолтаңба",
  },

  quiz: {
    answeredOf: (answered: number, total: number) => `${total} ішінен ${answered} жауап берілді`,
    passMark: "өту балы 70%",
    result: (pct: number) => `${pct}% · ${pct >= 70 ? "есеп" : "қайта өту керек"}`,
    questionN: (n: number) => `${n}-сұрақ`,
    retake: "Қайта өту",
    q1: (title: string) => `«${title}» материалының басты тұжырымы қандай?`,
    q1o2: "Әсер барлық процесті толық автоматтандырғанда ғана жетеді",
    q1o3: "Метрикалар енгізудің бірінші жылында өзгермейді",
    q1why: (cite: string) => `Дереккөзден тікелей дәйексөз: ${cite}.`,
    q2: "BI Group-та тәсілді қолданудан бірінші кім ұтады?",
    q2o1: "Сыртқы мердігерлер",
    q2o2: (unit: string) => `«${unit}» бизнес-юниті`,
    q2o3: "Тек топ-менеджмент",
    q2why: (unit: string) =>
      `Материал «${unit}» контекстін сипаттайды — әсер сонда ең тез қайталанады.`,
    q3: "Пилот басталғанға дейін нені тіркеу маңызды?",
    q3o1: "Ауқымдаудың ақырғы бюджеті",
    q3o2: "Жобалық кеңсенің құрамы",
    q3o3: "Метрикалардың baseline-і — әйтпесе әсерді өлшейтін нәрсе жоқ",
    q3why: "Baseline болмаса, «кейінгі» кез келген сан тексерілмейді және комитетте қорғалмайды.",
    q4Step: (step: string) => `«${step}» қадамында не болады?`,
    q4Fallback: "Енгізу неден басталады?",
    q4o1Fallback: "Қазіргі күйді тіркеп, мақсат туралы келісемін",
    q4o2: "Шешімді бірден барлық нысанға ауқымдаймыз",
    q4o3: "Тапсырманы сыртқы консультантқа береміз",
    q4why: "Бірінші қадам әрқашан диагностика туралы, ауқымдау туралы емес.",
    q5: "Материал бойынша әсердің қандай көкжиегі айтылған?",
    q5o1: "1–2 апта",
    q5o2: "6–12 ай",
    q5o3: "3–5 жыл",
    q5why: (author: string) =>
      `Автор (${author}) әсерді пилоттан кейінгі 6–12 ай көкжиегінде сипаттайды.`,
  },

  viewers: {
    deckMeta: (date: string, kind: string) => `${date} · ${kind}`,
    deckNote1: "Қазіргі процестің ауыртпалығынан бастау — 40 секунд, сансыз.",
    deckKickerContext: "Контекст",
    deckTitleNow: "Қазір не болып жатыр",
    deckNote2: "Аудитория сипаттамада өзін таныса. Сұраңыз: «сізде де осылай ма?»",
    deckKickerInsight: "Негізгі инсайт",
    deckTitleInsight: "Басты тұжырым",
    deckNote3: "Саннан кейін пауза. 3 секунд үндемеу.",
    deckStepKicker: (n: number, total: number) => `${total} ішінен ${n}-қадам`,
    deckStepFallback: "Нәтижені тіркеп, процесс иесіне тапсырамыз.",
    deckStepNote: (unit: string) => `«${unit}» практикасынан мысал — 30 секунд.`,
    deckKickerNext: "Келесі қадамдар",
    deckTitlePilot: "6 апталық пилот",
    deckOwner: (author: string) => `Иесі: ${author}`,
    deckScope: (unit: string) => `Периметр: ${unit}, бір нысан`,
    deckCheckpoint: "Чек-пойнт: 30 күннен кейін",
    deckBudget: "Бюджет: қазіргі OPEX шегінде",
    deckNoteLast: "Кездесудің өзінде чек-пойнт күні туралы келісіммен жабу.",
    deckSlideN: (n: number) => `${n}-слайд`,
    deckBack: "Артқа",
    deckNext: "Әрі қарай",
    deckHideNotes: "Жазбаларды жасыру",
    deckShowNotes: "Спикер-ноталар",
    deckSpeakerNote: "Спикер-нота: ",
    podcastHostA: "Әлия",
    podcastHostB: "Данияр",
    podcastEpisode: "AQYL Талдау · күн шығарылымы",
    podcastSeek: "Айналдыру",
    podcastBack10: "10 секунд артқа",
    podcastForward10: "10 секунд алға",
    podcastPause: "Пауза",
    podcastPlay: "Тыңдау",
    podcastLine1: (title: string) => `Сәлем! Бүгін «${title}» материалын талдаймыз.`,
    podcastLine2: (source: string, author: string, date: string) =>
      `Дереккөз — ${source}, авторы ${author}, ${date}.`,
    podcastLine3: (unit: string) => `Бұл бірінші кімге маңызды? «${unit}» бизнес-юнитіне.`,
    podcastLineTurn: "Жарайды, ал орамасын алып тастасаң, басты тұжырым қандай?",
    podcastLineStep: (n: number, step: string) => `${n}-қадам: ${step}.`,
    podcastLineDoubt: "Мені бір нәрсе ойландырады: baseline болмаса сандарды тексеру мүмкін емес.",
    podcastLineAgree:
      "Келісемін. Сондықтан алты апталық пилот пен басталғанға дейінгі өлшемді ұсынамыз.",
    podcastLineOutro: "Келістік. Бізбен болғаныңызға рақмет — келесі талдауға дейін.",
    cardsPrev: "Алдыңғы карточка",
    cardsNext: "Келесі карточка",
    cardsTagInsight: "Инсайт",
    cardsTitleInsight: "Басты тұжырым",
    cardsTagContext: "Контекст",
    cardsTitleContext: "Бұл қандай материал",
    cardsTagStep: (n: number) => `${n}-қадам`,
    cardsStepFallback: "Нәтижені тіркеп, процесс иесіне тапсырамыз.",
    cardsTagRisk: "Тәуекел",
    cardsTitleRisk: "Не сынуы мүмкін",
    cardsTextRisk:
      "Процесс иесі де, метрика baseline-і де жоқ — әсерді комитетте дәлелдей алмайсыз.",
    cardsTagAction: "Әрекет",
    cardsTitleAction: "Осы аптадағы бірінші қадам",
    cardsTextAction: (unit: string) =>
      `«${unit}» командасын 60 минутқа жинап, қазіргі метрикаларды тіркеу.`,
    infoPathFallback: "Инсайт → Пилот → Ауқымдау",
    cardsOriginCited: (n: number) => (n === 0 ? "Фрагментке сілтеме жоқ" : `${n} фрагмент бойынша`),
    cardsOriginSource: (source: string) => `Дереккөз: ${source}`,
    cardsOriginFramework: "Автор фреймворкінен",
    cardsOriginModel: "Модельдің бағасы, дереккөзден емес",
  },

  /** Направления бизнеса. Ключ — каноническое русское значение из данных. */
  businessUnits: {
    Строительство: "Құрылыс",
    Девелопмент: "Девелопмент",
    Промышленность: "Өнеркәсіп",
    "Корпоративный центр": "Корпоративтік орталық",
    Финансы: "Қаржы",
    HR: "HR",
  } as Record<string, string>,

  positions: {
    developmentDirector: "Даму директоры",
  },

  evidence: {
    высокий: "жоғары",
    средний: "орташа",
    низкий: "төмен",
    "недостаточно данных": "деректер жеткіліксіз",
  } as Record<string, string>,

  applicability: {
    "Высокая применимость": "Жоғары қолданылады",
    "Частичная применимость": "Ішінара қолданылады",
    "Слабая аналогия": "Әлсіз ұқсастық",
  } as Record<string, string>,

  clarify: {
    unknown: "Әзірге белгісіз",
    questionN: (n: number) => `${n}-сұрақ`,
    questionOfTitle: (n: number, total: number, title: string) =>
      `${total} ішінен ${n}-сұрақ: ${title}`,
    ownOption: (placeholder: string) => `Өз нұсқам: ${placeholder}`,
    ownAnswerLabel: (placeholder: string) => `Өз жауабым: ${placeholder}`,
    modeHint: (multi: boolean, drivers: string) =>
      `${multi ? "Бірнеше нұсқа таңдауға болады." : "Бір нұсқа таңдаңыз."} Тұжырымға әсер ететіні: ${drivers}.`,
    followUpVolume: "Ал серіктес кепілді көлем берсе?",
    followUpExclusivity: "Эксклюзивтілік тек бір сегментке берілсе не өзгереді?",
    followUpWindow: "Рынок терезесі 6 ай болса қандай сценарий таңдау керек?",
  },

  infographic: {
    mainInsight: "Негізгі инсайт",
    rolloutPath: "Енгізу жолы",
    footer: "Бір экрандық жинақ · F — толық экран.",
  },

  profile: {
    firstName: "Марат",
    lastName: "Әбенов",
    initials: "МӘ",
  },

  councilExtra: {
    online: "желіде",
    disclaimer:
      "Жария белгілі тәсілдердің AI-моделі. Нақты адамдар емес және олардың жеке көзқарасын білдірмейді.",
    replyTo: (name: string) => `· Жауап: ${name}`,
    typing: (name: string) => `${name} жазып жатыр…`,
    messageLabel: "Кеңеске хабарлама",
    lineup: (selected: number, max: number) => `Кеңес құрамы (${selected}/${max})`,
    done: "Дайын",
    clearSearch: "Іздеуді тазарту",
    changeLineup: "Құрамды өзгерту",
    deleteBody: (title: string) =>
      `«${title}» және кеңестің барлық хат-хабары қалпына келтірусіз жойылады.`,
    deleteConfirm: "Иә, жою",
  },

  viewerExtra: {
    cardsHint: (n: number) =>
      `Көлденең сырғытыңыз — материал бойынша тұжырымдары бар ${n} карточка.`,
    podcastHosts: (a: string, b: string, n: number) => `${a} мен ${b} · ${n} реплика`,
    podcastHint: "Репликаға басу — айналдыру. Мәтін аудиомен синхронды бөлектеледі.",
    advisorPromptTitle: "Басқару жағдайын қарапайым тілмен сипаттаңыз",
    savedSessions: "Сақталған сессиялар",
  },

  /** Тематические теги. Ключ — каноническая русская метка из данных. */
  topicTags: {
    Качество: {
      label: "Сапа",
      description: "Ақаулар, әрлеу стандарттары, нысанда бақылау, мәселелерді анықтау",
    },
    Безопасность: {
      label: "Қауіпсіздік",
      description: "Алаңдағы қауіпсіздік техникасы, еңбекті қорғау, инциденттер, алдын алу",
    },
    Проекты: {
      label: "Жобалар",
      description: "Мерзімдер, бюджет, ресурстар, мердігерлерді үйлестіру, кешігу тәуекелі",
    },
    Эффективность: {
      label: "Тиімділік",
      description: "Процестерді оңтайлау, құрылыстағы автоматтандыру, sunk time, шығындар",
    },
    Стандартизация: {
      label: "Стандарттау",
      description: "Процестерді біріздендіру, қайталанымдылық, чек-лист, бақылау жүйесі",
    },
    Сроки: {
      label: "Мерзімдер",
      description: "Жоспарлау, ілгерілеуді бақылау, кешігу себептері, тәуекелдерді басқару",
    },
    NPS: {
      label: "NPS",
      description: "Сатып алушылардың NPS-і, кілт тапсыру, сатудан кейінгі қызмет, шағымдар",
    },
    Опыт: {
      label: "Тәжірибе",
      description: "Алғашқы байланыстан кілт алуға дейін, touchpoints, journey",
    },
    Лояльность: {
      label: "Лоялдылық",
      description:
        "Қайталама сатып алу, lifetime value, лоялдылық бағдарламалары, клиент бәсекелестерге неге кетеді",
    },
    Ценообразование: {
      label: "Баға белгілеу",
      description:
        "Құнды есептеу, EVC, баға стратегиясы, баға бойынша позициялау, баға туралы келіссөз",
    },
    Маркетинг: {
      label: "Маркетинг",
      description:
        "Позициялау, бренд-коммуникация, customer journey, омниарналық, Digital vs Offline",
    },
    Инновация: {
      label: "Инновация",
      description:
        "Жаңа өнім, қызмет немесе бизнес-модель жасау; рынокқа шығару; кедергілерді жеңу",
    },
    Конкуренция: {
      label: "Бәсеке",
      description: "Басқа құрылыс салушылардан ерекшелігі, ұсыныстың бірегейлігі, позициялау",
    },
    Рост: {
      label: "Өсу",
      description:
        "Кеңею, ауқымдау, сыйымдылықты қайта есептеу, өсу стратегиясы, өсу кезіндегі тәуекел",
    },
    Локализация: {
      label: "Локализация",
      description:
        "Өңірлер арасындағы айырмашылық, жергілікті жағдайға бейімдеу, география бойынша ауқымдау",
    },
    Стратегия: {
      label: "Стратегия",
      description: "Ұзақ мерзімді позициялау, рынок таңдау (Ansoff), бәсекелік артықшылық",
    },
    Масштабирование: {
      label: "Ауқымдау",
      description: "Жүйенің өсуге дайындығы, өсу кезінде сапаны сақтау, модельдің қайталанымдылығы",
    },
    Бренд: {
      label: "Бренд",
      description: "Бірегейлік, репутация, аудиториямен резонанс, брендті жаңғырту, ассоциациялар",
    },
    Доверие: {
      label: "Сенім",
      description:
        "Қалыптаспаған рынокта, сенімділік белгілері, репутация, шыншылдық, transparent mechanics",
    },
    Лидерство: {
      label: "Көшбасшылық",
      description:
        "Адамдарды басқару, дағдарыста шешім қабылдау, көрегендік, командаға даму, жеке стиль",
    },
    Культура: {
      label: "Мәдениет",
      description:
        "Компания құндылықтары, рәміздер мен нормалар, сенімдер қалай беріледі, мәдени қақтығыс",
    },
    Ценности: {
      label: "Құндылықтар",
      description: "Көшбасшы/компания принциптері, адамдар неге сенеді, неге ымыраға келеді",
    },
    Команда: {
      label: "Команда",
      description: "Құрам, динамика, тиімділік, әралуандық, мүшелердің қабілетін дамыту",
    },
    HR: {
      label: "HR",
      description:
        "Жалдау, персоналды дамыту, ұстау, өтемақы, мәдени сәйкестік, succession planning",
    },
    Управление: {
      label: "Басқару",
      description: "Шешім қабылдау, басқару механикасы, процестер, бақылау, тапсыру",
    },
    Переговоры: {
      label: "Келіссөз",
      description: "Клиентпен, инвесторлармен сауда, мәмілені жабу, ықпал және power dynamics",
    },
    Перемены: {
      label: "Өзгерістер",
      description: "Трансформация, ұйымдық ығысулар, өзгеріске қарсылық, change management",
    },
    Трансформация: {
      label: "Трансформация",
      description: "Түбегейлі қайта ойлап табу, стратегияның бұрылысы, құлдыраудан құтқару",
    },
    Аналитика: {
      label: "Аналитика",
      description:
        "Деректерді талдау, ML-модельдер, болжау, инсайттар, мінез-құлық үлгілері, деректерге негізделген шешім",
    },
    Обучение: {
      label: "Оқыту",
      description: "Сараптаманы сақтау, командаға оқыту, процестерді құжаттау, тәжірибе беру",
    },
    Финансы: {
      label: "Қаржы",
      description: "ROI, жоба әсерін есептеу, бюджеттеу, қаражат үнемдеу, инвестицияны негіздеу",
    },
    Принципы: {
      label: "Принциптер",
      description:
        "Басқа контекстке көшіруге болатын негізгі принциптер, фреймворктер, әрекет алгоритмдері; transferable insights",
    },
  } as Record<string, { label: string; description: string }>,

  /** Теги карточек. Ключ — каноническое русское значение. */
  cardTags: {
    bim: "bim",
    hr: "hr",
    lean: "lean",
    данные: "деректер",
    девелопмент: "девелопмент",
    закупки: "сатып алу",
    изменения: "өзгерістер",
    инновации: "инновация",
    кризис: "дағдарыс",
    культура: "мәдениет",
    лидерство: "көшбасшылық",
    "операционная эффективность": "операциялық тиімділік",
    организация: "ұйым",
    переговоры: "келіссөз",
    портфель: "портфель",
    процессы: "процестер",
    себестоимость: "өзіндік құн",
    стратегия: "стратегия",
    трансформация: "трансформация",
    управление: "басқару",
    "управление рисками": "тәуекелдерді басқару",
    финансы: "қаржы",
    ценообразование: "баға белгілеу",
  } as Record<string, string>,

  /** Персоны консилиума: имена и описания подходов. */
  personas: {
    founder: {
      name: "Илон Маск",
      role: "Радикал инженер және көреген",
      tag: "Алғашқы принциптер",
      description:
        "Мәселені базалық фактілерге дейін жіктеп, артығын алып тастап, он есе жақсарту жолын іздейді.",
    },
    operator: {
      name: "Джефф Безос",
      role: "Ұзақ мерзімді оператор",
      tag: "Клиент",
      description:
        "Клиенттен бастайды және бір реттік батырлықтың орнына ауқымдалатын механизмдер құрады.",
    },
    engineer: {
      name: "Демис Хассабис",
      role: "Ғылыми стратег",
      tag: "Ғылым",
      description:
        "Инженерлік міндетті ғылыми белгісіздіктен ажыратып, нақты эксперимент пен жалпылауды тексеруді талап етеді.",
    },
    contrarian: {
      name: "Питер Тиль",
      role: "Контрарлық стратег",
      tag: "Контрариан",
      description:
        "Жасырын шындықты, күшті дифференциацияны және нөлден бірге дейінгі жолды іздейді.",
    },
    industrialist: {
      name: "Уоррен Баффет",
      role: "Тәртіпті инвестор",
      tag: "Құндылық",
      description:
        "Экономиканың түсініктілігін, басқару сапасын, қателік құнын және ұзақ мерзімді тұрақтылықты тексереді.",
    },
    product: {
      name: "Стив Джобс",
      role: "Өнім редакторы",
      tag: "Өнім",
      description:
        "Қарапайымдылық пен тәжірибенің тұтастығын қорғап, талқыны «бұл адамға не үшін керек» сұрағына қайтарады.",
    },
    brand: {
      name: "Айдын Рахимбаев",
      role: "Кәсіпкер және девелопмент көшбасшысы",
      tag: "Девелопмент",
      description:
        "Идеяларды адамдарға пайдасы, орта сапасы, орындау ауқымы және нәтижеге жауапкершілік арқылы бағалайды.",
    },
    platform: {
      name: "Дженсен Хуанг",
      role: "Технологиялық платформа сәулетшісі",
      tag: "Толық стек",
      description:
        "AI-ды, есептеуді, экожүйені және сала экономикасын біртұтас толық стек ретінде қарайды.",
    },
    competitor: {
      name: "Сэм Альтман",
      role: "AI-өнім стратегі",
      tag: "Стартап",
      description:
        "Үлкен ставканы оқу жылдамдығымен, дистрибуциямен және ерте нақты қолданумен біріктіреді.",
    },
    resilience: {
      name: "Рэй Далио",
      role: "Жүйелік диагност",
      tag: "Принциптер",
      description:
        "Шешімдерді нақты принциптерге, себеп-салдар моделіне және кері байланыс циклдеріне айналдырады.",
    },
    scale: {
      name: "Эндрю Ын",
      role: "Прагматик AI-көшбасшы",
      tag: "AI-практик",
      description:
        "Бизнес-міндетті деректері, метрикалары және қысқа итерациялары бар орындалатын AI-жобаға айналдырады.",
    },
    transform: {
      name: "Сатья Наделла",
      role: "Корпоративтік трансформация көшбасшысы",
      tag: "Трансформация",
      description:
        "Технологияны, мәдениетті, серіктестікті және ұйым үшін практикалық құндылықты қосады.",
    },
  } as Record<string, { name: string; role: string; tag: string; description: string }>,

  personaDisclaimer:
    "Жария белгілі тәсілдердің цифрлық моделі. Бұл нақты адамдар емес және олардың қазіргі немесе жеке пікірі емес.",

  councilTalk: {
    takes: {
      founder: (topic: CouncilTopicText) => [
        `Батыл: ${topic.insight}`,
        "Егер бұл 10 жылдық көкжиекте ойын ережесін өзгертпесе, оған ресурс жұмсаудың қажеті жоқ.",
      ],
      operator: (topic: CouncilTopicText) => [
        `Операциялық тұрғыдан: ${topic.summary}`,
        `Нақты процесс иесі мен метрикалар болмаса, бұл «${topic.businessUnit}» бағытының ауқымында қайталанбайды.`,
      ],
      engineer: (topic: CouncilTopicText) => [
        `Техникалық: «${topic.title}» туралы сөйлеспей тұрып, оның жасырын жорамалсыз жүзеге асатынын тексеру керек.`,
      ],
      contrarian: (topic: CouncilTopicText) => [
        `Контрарлық көзқарас: рынок керісінше нәрсені әлдеқашан бағаға енгізген — ${topic.insight.toLowerCase()}`,
        "Ставканы консенсус қателесетін жерге қою керек.",
      ],
      industrialist: (topic: CouncilTopicText) => [
        `Ұзақ көкжиек: «${topic.businessUnit}» бағытының репутациясы жылдам пайдадан қымбат.`,
        `${topic.insight} Асықпаймын.`,
      ],
      product: (topic: CouncilTopicText) => [
        `Клиент тұрғысынан: ${topic.summary}`,
        "Егер бұл соңғы пайдаланушының өмірін жақсартпаса, мәселе әлі шешілмеген.",
      ],
      brand: (topic: CouncilTopicText) => [
        `Тарихтың мәні бар: «${topic.title}» дегенді компания ішіндегі және сыртындағы адамдарға қалай түсіндіремін?`,
        topic.insight,
      ],
      platform: (topic: CouncilTopicText) => [
        `Экожүйелік тұрғыдан: осы жолмен жүрсек, «${topic.title}» ұтысынан кім тағы пайда көреді?`,
        `«${topic.businessUnit}» бағытында серіктестік әр қадамды бақылаудан маңызды.`,
      ],
      competitor: (topic: CouncilTopicText) => [
        `Бәсекелік тұрғыдан: ${topic.insight}`,
        `Бұл қадамды біз бірінші жасамасақ, «${topic.businessUnit}» бағытында басқа біреу жасайды.`,
      ],
      resilience: (topic: CouncilTopicText) => [
        `Тұрақтылық призмасы арқылы: реттеу мен рынок дүрбелеңі ерте ме, кеш пе «${topic.businessUnit}» бағытына соққы береді — мәселе, біз басқалардан тез бейімделуге дайын ба.`,
      ],
      scale: (topic: CouncilTopicText) => [
        `Ең алдымен тиімділік: ${topic.summary}`,
        `«${topic.businessUnit}» бағытының ауқымындағы әрбір артық шығын доллары — жіберіп алған маржа.`,
      ],
      transform: (topic: CouncilTopicText) => [
        `Трансформациялық тұрғыдан: «${topic.businessUnit}» бағытының ескі процестері мәдениет өзгермей бұл шешімнен өтпейді.`,
        topic.insight,
      ],
    } as Record<string, (topic: CouncilTopicText) => string[]>,
    disagreement: {
      contrarian: (name: string) =>
        `${name}, рынок мұны алдын ала ойнап шықпағанына сенімдісіз бе?`,
      competitor: (name: string) =>
        `${name}, оптимизм жақсы, бірақ бәсекелестердің бірі осыны әлдеқашан ойлап жүр.`,
      resilience: (name: string) =>
        `${name}, әдемі, бірақ жағдай күрт өзгерсе, бұл жоспар не болады?`,
    } as Record<string, (name: string) => string>,
    disagreementDefault: (name: string) => `${name}, мен асықпас едім.`,
    keywords: {
      risk: /риск|risk|тәуекел/i,
      plan: /план|дальше|шаг|первым|plan|next|step|first|жоспар|қадам|бірінші/i,
      agree: /согласны|друг с другом|спор|agree|disagree|argument|келіс|пікір/i,
    },
    riskReply: (unit: string) =>
      `Басты тәуекел: «${unit}» бағыты бағаланбаған сценарийлерді кешірмейді.`,
    planReply: "Бірінші қадам — процесс иесін тағайындау, онсыз кез келген жоспар орнында тұрады.",
    agreeReply: "Толық емес — мәні де сол: бәрі келісіп отырса, кеңестің қажеті болмас еді.",
    fallback: "Мұнда нақтырақ талдау керек — сұрақты нақтылап қойсаңыз, жауап беремін.",
    quickReplies: [
      "Басты тәуекелдер қандай?",
      "Бірінші не істер едіңіз?",
      "Бір-біріңізбен келісесіз бе?",
      "Нақты жоспар беріңіз",
    ] as string[],
  },

  /** Темы демонстрационных сессий консилиума. */
  seedTopics: {
    "seed-1": {
      title: "Iz Lynn Chan at Far East Organization (Abridged)",
      summary:
        "Өңірлік директор тәжірибелі экспаттың орнына жергілікті менеджерді көтеру керек пе деген шешімді қабылдауы тиіс — нәтижелілік пен ұйымдық күтулерді теңестіре отырып.",
      insight:
        "Формальды өтіл нәтижеге кепілдік бермейді — көтеру туралы шешім жұмыс мерзіміне емес, өлшенетін үлеске сүйенуі керек.",
      businessUnit: "Қиыр Шығыс",
    },
    "seed-2": {
      title: "SpinBrush",
      summary:
        "Өнімі жылдам өсіп келген шағын компания өз бетінше өсу, ірі ойыншымен серіктестік және бизнесті сату арасынан таңдайды.",
      insight:
        "Келіссөз күші сыртқы сұраныс расталғаннан кейін күрт артады — оған дейін ұзақ мерзімді құқықтарды беру дұрыс емес.",
      businessUnit: "Тұрмыстық тауарлар",
    },
  } as Record<string, CouncilTopicText>,

  /** Текст AI-советника — см. src/data/advisor/text.ts. */
  advisorText: advisorKk,
};
