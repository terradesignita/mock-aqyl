import { pluralEn } from "./plural";
import { advisorEn } from "@/data/advisor/text.en";
import type { CouncilTopicText } from "@/data/council-types";
import type { Dictionary } from "./ru";

export const en: Dictionary = {
  common: {
    cancel: "Cancel",
    close: "Close",
    open: "Open",
    save: "Save",
    saved: "Saved",
    delete: "Delete",
    back: "Back",
    next: "Next",
    reset: "Reset",
    copy: "Copy",
    copied: "Copied",
    download: "Download",
    loading: "Loading…",
    rename: "Rename",
    hint: "Hint",
    more: "More",
    collapse: "Collapse",
    expand: "Expand",
    of: "of",
    esc: "Esc",
    aiDisclaimer:
      "AQYL is AI and can be wrong. Please double-check facts and the sources it cites.",
  },

  nav: {
    cases: "Cases",
    council: "Council",
    settings: "Settings and metrics",
    myProfile: "My profile",
    logout: "Sign out",
    userMenu: (name: string) => `User menu: ${name}`,
    lightTheme: "Light theme",
    darkTheme: "Dark theme",
    profileFromSso: (unit: string, role: string) =>
      `${unit} · ${role} · profile comes from corporate SSO`,
    logoutInSso: "Sign-out happens in corporate SSO — not wired up in this prototype",
  },

  footer: {
    tagline: "AQYL — corporate knowledge platform",
    docs: "Documentation",
    support: "Support",
    version: "MVP v0.1 · demo mode",
  },

  greeting: {
    night: "Good night",
    morning: "Good morning",
    day: "Good afternoon",
    evening: "Good evening",
  },

  dashboard: {
    materialsAndUnits: (materials: number, units: number) =>
      `${materials} ${pluralEn(materials, "material", "materials")} · ${units} ${pluralEn(units, "business unit", "business units")}`,
    advisorMode: "AI advisor",
    searchMode: "Search",
    advisorSwitchLabel: "AI advisor mode",
    advisorHintOn:
      "Turn this on when you need to make a decision: the advisor asks clarifying questions and returns a recommendation with scenarios. Turned off, it is plain material search.",
    advisorHintOff:
      "Plain search only looks through cases: titles, summaries and tags. Turn on the AI advisor when you need to make a management decision rather than find a document.",
    searchLabel: "Search BI AQYL materials",
    advisorLabel: "Describe the business situation for the AI advisor",
    searchPlaceholder: "Ask BI AQYL: find materials, cases and decks",
    advisorPlaceholder:
      "Describe the business situation or the decision you need to make — the advisor will work through it and propose a recommendation",
    clear: "Clear",
    submit: "Send request",
    voiceInput: "Voice input",
    voiceStop: "Stop recording",
    voiceRequesting: "Requesting microphone access",
    voiceUnsupported: "Voice input is not supported in this browser",
    recentQuestions: "Recent questions",
    clearHistory: "clear",
    scopeAll: "All",
    scopeInternal: "BI internal experience",
    scopeExternal: "Global experience",
    filters: "Filters",
    allUnits: "All business units",
    allLanguages: "All languages",
    unitPlaceholder: "Business unit",
    languagePlaceholder: "Language",
    casesHeading: "Cases",
    found: (n: number) => `Found: ${n}`,
    topics: "Topics",
    resetTopics: (n: number) => `Clear topics (${n})`,
    visibilityAll: "All",
    visibilityPrivate: "Private",
    visibilityShared: "Shared",
    visibilityHintLabel: "What Private and Shared mean",
    visibilityHint:
      "Private — cases only you can see. Shared — available to every employee and included in company-wide search.",
    bookmarks: "Bookmarks",
    emptyNarrowedTitle: "Nothing matched",
    emptyNarrowedBody: "The filters are too tight. Clear them and the materials come back.",
    emptyTitle: "Nothing found yet",
    emptyBody: "Type a query or pick a topic. Plain words work fine.",
    resetAll: "Clear all filters",
    clearQuery: "Clear query",
    prevPage: "Previous page",
    nextPage: "Next page",
    page: (current: number, total: number) => `Page ${current} of ${total}`,
    advisorIntroTitle: "AI advisor mode: a recommendation for your situation, backed by experience",
    advisorIntroBody:
      "The advisor identifies the type of decision, asks clarifying questions about your situation, finds comparable cases and proposes a recommendation with risks, terms and sources.",
    closeHint: "Dismiss the hint",
    resultPages: "Result pages",
    deleteSession: "Delete the saved session",
    advisorExamplesTitle: "For example",
  },

  onboarding: {
    title: "Case and Material",
    subtitle: "The two words that matter on this platform",
    caseIsFolder: "A Case is a folder",
    fileReport: "Report",
    filePresentation: "Deck",
    fileArticle: "Article",
    threeFilesNote: "That is the “3 files” label you will see on a Case card",
    caseBody:
      "A Case is like a paper folder on your desk. On its own it is empty. You put documents on one topic into it — and that makes a Case.",
    materialBody:
      "A Material is one of those sheets inside the folder: a report, a deck or an article. One folder (Case) can hold several sheets (Materials) — as long as they are about the same thing.",
    dontShowAgain: "Don’t show again",
    gotIt: "Got it",
  },

  card: {
    private: "Private",
    shared: "Shared",
    makeSharedQuestion:
      "Make this shared? The case materials will enter the company-wide knowledge base for all employees.",
    makePrivateQuestion:
      "Make this private? The case materials will no longer be visible to others.",
    makeSharedConfirm: "Yes, make it shared",
    makePrivateConfirm: "Yes, make it private",
    privateHint:
      "Private: the case is visible only to you and hidden from the shared knowledge base.",
    sharedHint:
      "Shared: the case is visible to every employee and included in knowledge-base search.",
    addBookmark: "Bookmark",
    removeBookmark: "Remove bookmark",
    bookmarkAdded: "Added to bookmarks",
    bookmarkRemoved: "Removed from bookmarks",
    unreadDot: "You have not opened this case yet",
    unreadSr: "not opened",
    filesCount: (n: number) => `${n} ${pluralEn(n, "file", "files")}`,
    openCase: (title: string) => `Open case: ${title}`,
    deleteCase: "Delete case",
    deleteTitle: "Delete this case?",
    deleteBody: (title: string) =>
      `“${title}” will be removed from the list. This cannot be undone.`,
    deleteConfirm: "Yes, delete",
    internal: "Internal experience",
    external: "Global experience",
  },

  workspace: {
    caseTitleLabel: "Case title",
    copyLink: "Copy link to case",
    linkCopied: "Link to case copied",
    linkCopyFailed: "Could not copy — take the address from the browser bar",
    sourcesPanel: "Sources",
    artifactsPanel: "Artifacts",
    showSources: "Show sources",
    showArtifacts: "Show artifacts",
    closeCase: "Close case",
    resizeSources: "Resize the sources panel",
    resizeArtifacts: "Resize the artifacts panel",
    deletedTitle: "Case deleted",
    deletedBody: (title: string) =>
      `“${title}” was deleted along with its materials, wiki pages and notes. The direct link no longer opens the content.`,
    backToList: "Back to cases",
    notFoundTitle: "Case not found — BI AQYL",
    savedToNotes: "Saved to notes",
    artifactToNotes: "Artifact saved to notes",
  },

  sources: {
    title: "Sources",
    selectedOf: (total: number) => `of ${total}`,
    selectAll: "Select all",
    deselectAll: "Deselect all",
    collapse: "Collapse the sources panel",
    collapseTitle: "Collapse panel",
    hint: "Checked sources are the context for the assistant and the artifacts. Uncheck a material to keep it out of the answers. With nothing selected the assistant will not answer.",
    noneSelected:
      "No source is selected — the assistant cannot answer and artifacts cannot be built.",
    dropzone: "Drop files here or click to choose",
    dropzoneNaming: "We take the material name from its content",
    useInChat: (title: string) => `Use “${title}” in chat`,
    actionsMenu: "Source actions",
    openInReader: "Open in reader",
    renamePrompt: "New source name",
    renamed: "Source renamed",
    downloadMd: "Download .md",
    downloaded: "Source downloaded as .md",
    removed: "Source removed from the case",
    groupFiles: "Uploaded files",
    groupFilesEmpty: "No files yet — upload the first one",
    groupLinks: "Links to materials",
    groupLinksEmpty: "This case has no links",
    groupLinksHint:
      "External materials the case refers to. They count towards the context just like files.",
    rejectedTitle: "Not added — format not supported",
    rejectedHide: "Hide the rejected-files message",
    rejectedBody:
      "We accept documents, decks, audio and video. There is nothing to process spreadsheets or archives with — export what you need to PDF or text.",
    rejectedOne: (name: string) => `“${name}” — format not supported`,
    rejectedMany: (n: number) =>
      `${n} ${pluralEn(n, "file", "files")} rejected: format not supported`,
    addedOne: (title: string) => `“${title}” added to the case`,
    noTypeLabel: "no extension",
    notes: "Notes",
    notesHint:
      "Assistant answers you saved with “To notes” land here. You can copy or delete them.",
    notesEmpty: "Save answers from the conversation — they will show up here.",
    removeNote: "Delete note",
    linkLabel: "Link",
    uploadedAt: (date: string) => `uploaded ${date}`,
  },

  ingest: {
    queued: "Queued",
    queuedDetail: "File accepted, waiting to be processed",
    converting: "Converting",
    convertingDetail: "Rendering the slides to PDF",
    extracting: "Extracting audio",
    extractingDetail: "Separating the audio track",
    parsing: "Parsing",
    parsingDetail: "Extracting the text and document structure",
    transcribing: "Transcribing",
    transcribingDetail: "Recognising speech",
    embedding: "Indexing",
    embeddingDetail: "Computing chunk embeddings",
    wiki: "Wiki page",
    wikiDetail: "Assembling the outline, tags and facts",
  },

  reader: {
    fontSize: "Font size",
    fullscreen: "Fullscreen",
    autoTagsSr: "Automatic tags:",
    autoTagsHint: "Tags were assigned automatically when the page was built",
    facts: "Extracted facts",
    toc: "Outline",
    tocLabel: "Outline",
    wikiFooter: (date: string, origin: string) => `Wiki page built on ${date} from`,
    chunksIndexed: (n: number) => `${n} ${pluralEn(n, "chunk", "chunks")} indexed`,
    chunksNone: "no chunks indexed",
    usedInChat: "Used in chat",
    addToContext: "Add to context",
    askAbout: "Ask about this source",
    askAboutQuestion: (title: string) => `What matters in the source “${title}”?`,
    openOriginal: "Open the original",
    quoteHighlighted: "Quote highlighted in the text · ",
    escHint: "Esc — close · Aa — text size",
    sectionContent: "Content",
    sectionStart: "Start of the material",
    sectionHowBuilt: "How this page was built",
    howBuiltText:
      "The text was read right in the browser and the title taken from its content. Chunking, embeddings and linking to the rest of the knowledge base are the ingestion service’s job — there is none in this prototype, so it stops at the page.",
    notParsed: (stages: string, kind: string) =>
      `The file was accepted and went through the processing stages (${stages}). Parsing the ${kind} is the backend’s job, and there is none in this prototype — so there will be no text here.`,
    kindSpeech: "speech",
    kindContent: "content",
    format: "Format",
    size: "Size",
    uploaded: "Uploaded",
    tagUploadedByYou: "uploaded by you",
    familyText: "notes",
    familyDocument: "document",
    familySlides: "deck",
    familyAudio: "audio",
    familyVideo: "video",
    annotation: "Summary",
    keyTakeaway: "Key takeaway",
    citedFragment: "The fragment the assistant cites",
    citedFragmentBody: (anchor: string, author: string, unit: string, lang: string, date: string) =>
      `“${anchor}”. Prepared by: ${author}. Business unit: ${unit}. Original language: ${lang}. Last updated: ${date}.`,
    howToApplyBody: (unit: string) =>
      `The ${unit} teams use this material when preparing decisions. Cross-check the conclusions against internal regulations and site data before you carry the practice onto a site.`,
    practicalPart: "Practical part",
    howToApply: "How to apply this at BI Group",
    factDate: "Last updated",
    factLanguage: "Original language",
    factMediaType: "Material type",
    factSteps: "Steps in the practical part",
    pages: (n: number) => `${n} ${pluralEn(n, "page", "pages")}`,
  },

  chat: {
    assistant: "AQYL assistant",
    contextOf: (selected: number, total: number) =>
      `Context: ${selected} of ${total} ${pluralEn(total, "source", "sources")}`,
    contextHint:
      "The assistant answers only from the sources checked in the left panel. Footnotes [1], [2] in the answer lead to the exact quotes.",
    refusal:
      "I cannot answer: no material is selected in the sources panel.\n\nCheck at least one source on the left — the answer is built only from the selected context, and without it I have nothing to stand on.",
    thinking: (n: number) => `Analysing ${n} ${pluralEn(n, "source", "sources")}…`,
    questionLabel: "Question about the selected sources",
    placeholder: (n: number) => `Ask about the ${n} selected ${pluralEn(n, "source", "sources")}…`,
    placeholderEmpty: "Check a source on the left to ask a question",
    placeholderListening: "Listening…",
    placeholderRequesting: "Requesting the microphone…",
    voiceStarted: "Go ahead — I am recording your question",
    send: "Send",
    moreSuggestions: "More options",
    helpful: "Helpful answer",
    notHelpful: "Poor answer",
    markedHelpful: "Thanks, marked as helpful",
    markedNotHelpful: "Noted — the answer is flagged",
    toNotes: "To notes",
    reportError: "Report a problem",
    reportQuestion: "What is wrong with the answer?",
    reportSent: (reason: string) => `Sent to the editors: “${reason}”`,
    reasonWrongFact: "Incorrect fact",
    reasonWrongQuote: "Quote does not match",
    reasonOffTopic: "Answer misses the question",
    reasonOutdated: "Outdated data",
    reasonConfidential: "Confidential data",
    sourceN: (n: number) => `Source ${n}`,
    sourceBracket: (n: number) => `Source [${n}]`,
    clickToOpenReader: "Click to open in the reader",
    suggestions: [
      "What is this material about, briefly?",
      "Give me 5 talking points for a standup",
      "How do we apply this here?",
      "Draft a step-by-step rollout plan",
      "What are the risks and limitations?",
      "What could go wrong on site?",
      "Which metrics should we track?",
      "How long will the rollout take?",
      "How is this different from our current practice?",
      "Who should own the process?",
      "Show the sources and quotes",
      "Draft a note to the executive",
      "What should I ask the contractor?",
      "Put the takeaway in plain language",
      "Make a checklist for the first week",
    ] as string[],
    answerRisks: (source: string, unit: string) =>
      `Limitations and risks:\n1. The context of “${source}” differs from BI Group sites — it needs calibrating for scope of work.\n2. The effect shows over 2–3 quarters; measuring early is misleading.\n3. Without a process owner the practice reverts to how it was.`,
    answerSteps: (steps: string) =>
      `Based on the selected sources, applying it looks like this:\n${steps}`,
    answerMetrics: (insight: string) =>
      `What to measure:\n• The baseline before rollout (a 4-week reading).\n• The core effect: ${insight}\n• A quality control metric, so gains in speed do not eat quality.`,
    answerWhy: (insight: string) => `Key takeaway: ${insight}`,
    answerCompare: (unit: string) =>
      `How it differs from current practice: the material proposes managing the cause rather than the symptom. In ${unit} that means shifting effort to the preparation stage.`,
    answerSources: (n: number, source: string, author: string) =>
      `The answer rests on ${n} selected ${pluralEn(n, "fragment", "fragments")} from “${source}” (${author}). Hover a footnote to see the quote, and click it to open the reader.`,
    answerSummary: (summary: string, insight: string) => `${summary}\n\nKey insight: ${insight}`,
    answerDefault: (summary: string, insight: string) =>
      `${summary}\n\nKey insight: ${insight}\n\nIf useful, I can break this into rollout steps or assemble a list of metrics.`,
  },

  studio: {
    title: "Artifacts",
    hint: "Ready-made formats built from the selected sources: quiz, deck, report, cards, podcast, infographic. “⋮” — regenerate, open fullscreen or download.",
    readyOf: (ready: number, total: number) => `${ready} of ${total} ready`,
    contextCount: (n: number) => `context: ${n} ${pluralEn(n, "source", "sources")}`,
    collapse: "Collapse the artifacts panel",
    noContext:
      "No sources are selected — there is nothing to build an artifact from. Check a material in the sources panel.",
    noContextToast: "Select at least one source — there is nothing to build an artifact from",
    noContextTitle: "No sources selected",
    busyTitle: "Wait for the current generation to finish",
    generating: (title: string) => `Generating “${title}”`,
    generatingShort: "Generating…",
    ready: "Ready · open",
    stepReading: "Reading the selected sources",
    stepExtracting: "Pulling out the key points",
    stepAssembling: "Assembling the format",
    actionsFor: (title: string) => `Actions — ${title}`,
    generate: "Generate",
    regenerateMenu: "Generate again",
    openFullscreen: "Open fullscreen",
    copyText: "Copy text",
    downloadPdf: "Download PDF",
    saveToNotes: "Save to notes",
    copiedToast: "Artifact text copied",
    downloadedMd: ".md file downloaded",
    printDialog: "Print dialog opened — save it as PDF",
    regenerated: "Artifact regenerated",
    regeneratedByContext: "Artifact regenerated from the current context",
    aiFooter:
      "Artifacts are assembled by AI from the selected sources. Check the numbers and quotes against the originals before you send anything on.",
    generatedByAi: "generated by AI",
    quiz: "Quiz",
    quizSubtitle: "Comprehension check",
    deck: "Deck",
    deckSubtitle: "Slides for a meeting",
    report: "Report",
    reportSubtitle: "Analytical report",
    cards: "Cards",
    cardsSubtitle: "Insight cards",
    podcast: "Podcast",
    podcastSubtitle: "Audio walkthrough",
    infographic: "Infographic",
    infographicSubtitle: "One-screen visual summary",
  },

  artifactDialog: {
    fromSources: "Generated from the selected sources",
    exitFullscreen: "Exit fullscreen",
    enterFullscreen: "Fullscreen",
    collapseHint: "Collapse (Esc)",
    expandHint: "Expand (F)",
    closeHint: "Close (Esc)",
    footerHintFull: "Esc — exit fullscreen · F — fullscreen",
    footerHint: "Esc — close · F — fullscreen",
    regenerate: "Regenerate",
    regenerating: "Regenerating…",
    metricsCaption:
      "Counted from the artifact’s own contents and the selected sources — not a model estimate.",
  },

  advisor: {
    stageClarify: "Clarify",
    stageUnderstanding: "Understanding",
    stageThinking: "Analysis",
    stageAnswer: "Recommendation",
    stageStatus: (label: string) => `Stage: ${label}`,
    typeHint: (known: string) =>
      `The type of decision was inferred from your request. From it we can tell: ${known}.`,
    savedIndicator: "Saved — it comes back after a reload",
    savedIndicatorShort: "Saved",
    notManagerialTitle: "This looks like a search for materials, not a management question",
    notManagerialBody:
      "The AI advisor works on strategic decisions: partnerships, selling a stake, entering a market, scaling, investments. Switch the toggle off to find documents and cases, or describe the situation and the decision you need to make.",
    rephrase: "Rephrase",
    clarifyGate: "Answer the key questions — the recommendation is not formed without them.",
    ownAnswer: "Answer in my own words",
    questionOf: (current: number, total: number) => `${current}/${total}`,
    understandingTitle: "Here is how I understood your situation",
    extraContextPlaceholder: "Add context: what else should the recommendation account for",
    allCorrect: "All correct",
    editAnswers: "Edit answers",
    confirmGate: "The recommendation is not formed until you confirm",
    situation: "Situation",
    changeSituation: "change",
    closeAnswer: "Close the recommendation and ask a new question",
    verdictShort: "Bottom line",
    verdictRefusal: "An honest refusal",
    mainInsight: "Key strategic insight",
    evidenceLevel: (level: string) => `Evidence level: ${level}`,
    evidenceHintLabel: "What the evidence level means",
    evidenceHint:
      "The scale: high — several independent sources; medium — one reliable source; low — indirect data; insufficient data — the advisor declines to recommend.",
    sectionWhy: "Why this conclusion",
    sectionCase: (title: string) => `Comparable case: ${title}`,
    applicabilityHintLabel: "What case applicability means",
    applicabilityHint:
      "How close this case is to your situation: high — conditions are near identical; partial — some factors match; weak — only the general logic, the details do not transfer.",
    matches: "What matches",
    differences: "What differs",
    sectionTransfer: "What transfers and what does not",
    canTransfer: "Safe to transfer",
    cannotTransfer: "Do not transfer directly",
    sectionRecommendation: "Recommendation and proposed terms",
    proposedTerms: "Proposed terms",
    sectionScenarios: "Options",
    referenceGroup: "Reference — where this comes from",
    colScenario: "Scenario",
    colSpeed: "Speed",
    colControl: "Control",
    colRisk: "Risk",
    colWhen: "When it fits",
    recommendedBadge: "recommended",
    sectionRisks: "Risks",
    sectionChangeFactors: "What would change the recommendation",
    sectionMissing: "What is missing for a final decision",
    sectionSources: "Sources",
    sourceKindWeight: "Source type and its weight in the conclusion",
    sourceKindHint:
      "Source type: a fact from a document, the author’s analysis, your own note, or AI-generated. Weight: decisive — the conclusion rests on it; supporting — it reinforces it; contextual — background only.",
    sourceOpened: (title: string) => `Source “${title}” opened`,
    followUpTitle: "Clarify or change the terms",
    followUpThinking: "Checking what changes in the recommendation…",
    followUpPlaceholder: "Ask a follow-up about this recommendation",
    followUpLabel: "Follow-up question about the recommendation",
    followUpSend: "Send follow-up",
    negotiationButton: "Prepare questions for the partner",
    shareholderButton: "Make a shareholder version",
    saveAnalysis: "Save analysis",
    negotiationTitle: "Questions for the negotiation",
    shareholderTitle: "Shareholder version",
  },

  council: {
    title: "Council",
    assembleTitle: "Assemble your council",
    whatIsLabel: "What the council is",
    whatIsHint:
      "The council is a group discussion of your problem with several AI personas. Each brings its own angle, so instead of one opinion you get an argument and competing points of view. Pick one to three participants.",
    selectedOf: (selected: number, max: number) => `Selected ${selected} of ${max}`,
    capacityReached: "You can pick at most three participants.",
    similarViews:
      "This line-up thinks alike — there may be no argument. Try adding a contrarian or a sceptic.",
    sessions: "Sessions",
    createCouncil: "New council",
    searchSessions: "Search sessions",
    nothingFound: (query: string) => `Nothing found for “${query}”.`,
    today: "Today",
    earlier: "Earlier",
    startCouncil: "Start the council",
    selectHint: "Pick the council members and a case to discuss",
    collapseSessions: "Collapse the session list",
    resizeSessions: "Resize the session list",
    deleteSession: "Delete session",
    followUpPlaceholder: "Ask the council a question",
    followUpSend: "Send",
    participants: (names: string) => `Participants: ${names}`,
    participantsCount: (n: number) => `${n} ${pluralEn(n, "participant", "participants")}`,
    pickCaseTitle: "Pick a case to start the council",
    pickCaseHint:
      "Pick the case the council will work through. The personas discuss that case — the situation, the key insight and the quotes all come from it.",
    pickCaseHintLabel: "What to pick here",
    needParticipant: "Add at least one council member",
    searchCase: "Find a case by title",
    searchPersona: "Find a persona by name or style",
    messagePlaceholder: "Write a message…",
    send: "Send",
    showSessions: "Show sessions",
    showSessionsPanel: "Show the session panel",
    collapsePanel: "Collapse panel",
    sessionDeleted: "Session deleted",
    deleteSessionTitle: "Delete this session?",
    deleteSessionNamed: (title: string) => `Delete the session “${title}”`,
    react: (emoji: string) => `React with ${emoji}`,
    unread: "Unread",
    readReceipt: " · Read ✓✓",
    topicQuestion: "What shall we discuss?",
    councilShort: "Council",
    reactionLabel: (emoji: string) => `Reaction ${emoji}`,
  },

  settings: {
    title: "Settings",
    subtitle: "Profile, appearance and usage statistics.",
    profile: "Profile",
    profileHint: "The data comes from corporate SSO (BILife). In this prototype it is fixed.",
    loginIs: (login: string) => `login ${login}`,
    appearance: "Appearance and language",
    theme: "Theme",
    themeLight: "Light",
    themeDark: "Dark",
    interfaceLanguage: "Interface language",
    languageHint:
      "Switches the whole interface: labels, hints, suggestion chips and generated text. The choice is remembered in this browser.",
    languageChanged: "Interface language switched",
    materialLanguages: (list: string) =>
      `The library holds materials in ${list} — the original language is shown on the card and in the filters.`,
    library: "Knowledge base",
    libraryHint: "Counted from what the library actually holds, not hard-coded.",
    cases: "Cases",
    materials: "Materials",
    units: "Business units",
    freshest: "Newest material",
    internalExternal: "Internal / global experience",
    formats: "Formats",
    topTopics: "Frequent topics",
    activity: "Your activity",
    activityHint:
      "Actions in this browser over the last 14 days. In the product these are server-side events, shared across all your devices.",
    activityEmptyTitle: "Nothing yet",
    activityEmptyBody:
      "Ask a question about a case, build an artifact or upload a material — the breakdown by day and action type will appear here.",
    openCases: "Open cases",
    questions: "Questions",
    artifacts: "Artifacts",
    uploads: "Uploads",
    totalActions: "Actions in total",
    activityChartLabel: "Activity by day",
    activityOnDay: (day: string, n: number) => `${day}: ${n} ${pluralEn(n, "action", "actions")}`,
    latest: "Latest",
    clearLog: "Clear the log",
    logCleared: "Activity log cleared",
    feedback: "Answer ratings",
    feedbackHint:
      "What you marked under the assistant’s answers. In the product these events reach the knowledge-base editors and feed retraining.",
    feedbackUp: "Helpful",
    feedbackDown: "Poor",
    feedbackReports: "Reports",
    reportReasons: "Reasons for reports",
    noReports:
      "No reports. The “Report a problem” button under an assistant answer records the reason here.",
    stored: "Saved data",
    storedHint:
      "All of this lives in browser storage: in the product it is on the server, reachable from every device.",
    storedBookmarks: "Bookmarks",
    storedAdvisor: "Advisor consultations",
    storedCouncil: "Council sessions",
    openLink: "open",
  },

  activity: {
    question: "Assistant question",
    artifact: "Artifact",
    upload: "Material upload",
    advisor: "Advisor consultation",
    council: "Council",
    note: "Note",
  },

  roles: {
    viewer: "Read only",
    editor: "Editor",
    owner: "Owner",
    admin: "Administrator",
    viewerDesc: "Can search, read and generate artifacts. Upload and delete are unavailable.",
    editorDesc: "Can upload materials, edit titles and tags, delete their own cases.",
    ownerDesc: "Editor rights plus access management for their own cases.",
    adminDesc: "Full access, including other people’s cases and platform settings.",
  },

  media: {
    document: "Document",
    video: "Video",
    podcast: "Podcast",
    presentation: "Deck",
  },

  errors: {
    notFoundTitle: "Page not found",
    notFoundBody: "This page does not exist, or it has been moved.",
    toHome: "Go home",
    crashTitle: "The page failed to load",
    crashBody: "Something went wrong. Try reloading the page or going back home.",
    retry: "Try again",
  },

  voice: {
    notAllowed: "No microphone access — allow it in the browser settings",
    noMic: "No microphone found",
    network: "Speech recognition needs a network connection",
    noSpeech: "Speech was not recognised — try again",
    aborted: "Recording stopped",
    generic: "Could not recognise the speech, try again",
    unsupported: "Voice input is not supported in this browser",
    startFailed: "Could not start recording — try again",
    timeout: "The microphone did not respond — check the permission and the input device",
  },

  units: {
    bytes: "B",
    kilobytes: "KB",
    megabytes: "MB",
  },

  upload: {
    namedFrom: (kind: string, date: string, time: string) => `${kind} from ${date}, ${time}`,
    family: {
      text: "Notes",
      document: "Document",
      slides: "Deck",
      audio: "Audio recording",
      video: "Video recording",
    },
  },

  /** Creating a case from a file. The report (fig. 40): an entry point for new knowledge. */
  newCase: {
    cta: "New case",
    title: "New case",
    body: "A case is a material plus everything around it: sources, the chat and artefacts. Start with a file — a document, a deck, audio or video.",
    unitLabel: "Business unit",
    dropTitle: "Drop a file here or pick one from disk",
    dropBody: (n: number) =>
      `${n} ${pluralEn(n, "format", "formats")} accepted. The case name comes from the content, not the file name.`,
    pickFile: "Pick a file",
    onlyFirstFile: (rest: number) =>
      `${rest} ${pluralEn(rest, "file", "files")} left out: a case starts from one material, add the rest inside the case.`,
    created: (title: string) => `Case "${title}" created`,
    pendingSummary:
      "The file content has not been parsed yet — this prototype does not extract text. The source is attached, and the chat and artefacts will rely on it.",
    pendingInsight: "The core insight will appear once the material is parsed.",
    searchHotkey: 'Press "/" to search',
  },

  artifactContent: {
    quizIntro: (questions: number, cites: number) =>
      `${questions} ${pluralEn(questions, "question", "questions")} on the material. Assembled from ${cites} ${pluralEn(cites, "fragment", "fragments")}.`,
    quizQuestions: "Questions",
    quizPassScore: "Pass mark",
    quizFragments: "Fragments used",
    quizQ1Label: "Question 1 · multiple choice",
    quizQ1: (title: string, insight: string, ref: string) =>
      `What is the main takeaway of “${title}”?\nA) ${insight}\nB) The effect only appears with full automation\nC) Metrics do not move in the first year\n\nCorrect: A · Basis: ${ref}`,
    quizQ2Label: "Question 2 · true/false",
    quizQ2: (unit: string, source: string, author: string, date: string) =>
      `“The rollout pays back faster in the ${unit} unit when there is a dedicated process owner.” — True.\nSource: ${source}, ${author}, ${date}.`,
    quizQ3Label: "Question 3 · ordering",
    quizQ3Steps: (steps: string) => `Put the rollout steps in order:\n${steps}`,
    quizQ3Fallback:
      "Name three limits on applying this approach at BI Group and propose a way to remove them.",
    quizQ4Label: "Question 4 · open",
    quizQ4: "Which 2 metrics will you track in the first 90 days, and what target will you set?",
    deckIntro: (slides: number) =>
      `${slides} ${pluralEn(slides, "slide", "slides")} · 16:9 · speaker notes included.`,
    deckSlides: "Slides",
    deckDuration: "Length",
    deckAudience: "Audience",
    deckMinutes: "12 min",
    deckS1Label: "Slide 1 · Context",
    deckS1: (summary: string) =>
      `${summary}\nSpeaker note: open with the pain of the current process, 40 seconds.`,
    deckS2Label: "Slide 2 · Key insight",
    deckS2: (insight: string) =>
      `${insight}\nVisual: one large number + a before/after comparison.`,
    deckStepLabel: (slide: number, step: number) => `Slide ${slide} · Step ${step}`,
    deckNextLabel: (slide: number) => `Slide ${slide} · Next steps`,
    deckNext: (unit: string, author: string) =>
      `Pilot in ${unit} — 6 weeks · owner: ${author} · checkpoint in 30 days · budget: within current OPEX.`,
    reportIntro: (lang: string, minutes: number) =>
      `Analytical report · original language ${lang} · ~${minutes} min read.`,
    reportSections: "Sections",
    reportSources: "Sources used",
    reportSteps: "Steps in the recommendation",
    reportSummary: "Summary",
    reportKey: "Key takeaway",
    reportRisks: "Risks",
    reportRisksBody:
      "1. No process owner on the business-unit side.\n2. Metric data is collected manually — risk of a distorted baseline.\n3. Resistance from line managers during the pilot.",
    reportRecommendations: "Recommendations",
    reportRecommendationsFallback:
      "1. Establish the metric baseline.\n2. Run a pilot on one site.\n3. Record the effect and scale it.",
    reportOwnerFallback: "owner: PMO",
    reportSourcesLabel: "Sources",
    cardsIntro: "Insight cards · swipe horizontally.",
    cardsLabel: (n: number) => `Card ${n}`,
    cardsQ1: (insight: string) => `A: The main effect of the approach?\nB: ${insight}`,
    cardsQStep: (step: string, description: string) =>
      `A: What happens at the “${step}” step?\nB: ${description}`,
    cardsStepFallback: "We record the result and hand it to the process owner.",
    podcastIntro: "Audio walkthrough · two hosts · transcript synced to the audio.",
    podcastChapters: "Chapters",
    podcastHosts: "Hosts",
    podcastSources: "Sources used",
    podcastIntroLabel: "00:00 · Intro",
    podcastIntroBody: (unit: string) =>
      `Why this material matters to the ${unit} unit and who should listen first.`,
    podcastCaseLabel: "01:20 · Case walkthrough",
    podcastDebateLabel: "04:05 · Hosts disagree",
    podcastDebate:
      "Host A: the effect reproduces on BI Group sites. Host B: you need a baseline, otherwise the numbers cannot be checked. The compromise — a 6-week pilot.",
    podcastOutroLabel: "07:10 · Takeaway",
    podcastOutro: (insight: string, source: string, author: string, date: string) =>
      `${insight}\nSource: ${source}, ${author}, ${date}.`,
    infographicIntro: "A one-screen visual summary · fits a mailout or a dashboard.",
    infoSources: "Sources",
    infoSteps: "Rollout steps",
    infoLanguage: "Original language",
    infoMediaType: "Material type",
    infoType: "Content type",
    infoYear: "Year",
    infoBlock1: "Block 1 · Headline",
    infoBlock2: "Block 2 · Hero number",
    infoBlock3: "Block 3 · Rollout path",
    infoBlock3Fallback: "Insight → pilot → scale-up",
    infoBlock4: "Block 4 · Credit",
  },

  quiz: {
    answeredOf: (answered: number, total: number) => `Answered ${answered} of ${total}`,
    passMark: "pass mark 70%",
    result: (pct: number) => `${pct}% · ${pct >= 70 ? "passed" : "retake needed"}`,
    questionN: (n: number) => `Question ${n}`,
    retake: "Retake",
    q1: (title: string) => `What is the main takeaway of “${title}”?`,
    q1o2: "The effect is only achieved with full automation of every process",
    q1o3: "Metrics do not move in the first year of the rollout",
    q1why: (cite: string) => `A direct quote from the source: ${cite}.`,
    q2: "Who benefits first from applying this approach at BI Group?",
    q2o1: "External contractors",
    q2o2: (unit: string) => `The ${unit} business unit`,
    q2o3: "Top management only",
    q2why: (unit: string) =>
      `The material describes the ${unit} context — that is where the effect reproduces fastest.`,
    q3: "What is critical to establish before the pilot starts?",
    q3o1: "The final scale-up budget",
    q3o2: "The project-office line-up",
    q3o3: "A metric baseline — otherwise there is nothing to measure the effect against",
    q3why:
      "Without a baseline any “after” numbers cannot be verified and will not survive a committee.",
    q4Step: (step: string) => `What happens at the “${step}” step?`,
    q4Fallback: "How does the rollout begin?",
    q4o1Fallback: "We record the current state and agree on the target",
    q4o2: "We immediately scale the solution to every site",
    q4o3: "We hand the task to an external consultant",
    q4why: "The first step is always diagnosis, not scale-up.",
    q5: "What effect horizon does the material state?",
    q5o1: "1–2 weeks",
    q5o2: "6–12 months",
    q5o3: "3–5 years",
    q5why: (author: string) =>
      `The author (${author}) describes the effect over 6–12 months after the pilot.`,
  },

  viewers: {
    deckMeta: (date: string, kind: string) => `${date} · ${kind}`,
    deckNote1: "Open with the pain of the current process — 40 seconds, no numbers.",
    deckKickerContext: "Context",
    deckTitleNow: "What happens today",
    deckNote2: "Let the room recognise itself in the description. Ask: “same for you?”",
    deckKickerInsight: "Key insight",
    deckTitleInsight: "The takeaway",
    deckNote3: "Pause after the number. Say nothing for 3 seconds.",
    deckStepKicker: (n: number, total: number) => `Step ${n} of ${total}`,
    deckStepFallback: "We record the result and hand it to the process owner.",
    deckStepNote: (unit: string) => `An example from ${unit} practice — 30 seconds.`,
    deckKickerNext: "Next steps",
    deckTitlePilot: "A 6-week pilot",
    deckOwner: (author: string) => `Owner: ${author}`,
    deckScope: (unit: string) => `Scope: ${unit}, one site`,
    deckCheckpoint: "Checkpoint: in 30 days",
    deckBudget: "Budget: within current OPEX",
    deckNoteLast: "Close by agreeing the checkpoint date in the meeting itself.",
    deckSlideN: (n: number) => `Slide ${n}`,
    deckBack: "Back",
    deckNext: "Next",
    deckHideNotes: "Hide notes",
    deckShowNotes: "Speaker notes",
    deckSpeakerNote: "Speaker note: ",
    podcastHostA: "Aliya",
    podcastHostB: "Daniyar",
    podcastEpisode: "AQYL Review · episode of the day",
    podcastSeek: "Seek",
    podcastBack10: "Back 10 seconds",
    podcastForward10: "Forward 10 seconds",
    podcastPause: "Pause",
    podcastPlay: "Play",
    podcastLine1: (title: string) => `Hi! Today we are going through “${title}”.`,
    podcastLine2: (source: string, author: string, date: string) =>
      `The source is ${source}, by ${author}, ${date}.`,
    podcastLine3: (unit: string) => `Who does this matter to first? The ${unit} unit.`,
    podcastLineTurn: "Okay, so what is the takeaway once you strip the wrapping off?",
    podcastLineStep: (n: number, step: string) => `Step ${n}: ${step}.`,
    podcastLineDoubt: "One thing bothers me: without a baseline the numbers cannot be checked.",
    podcastLineAgree:
      "Agreed. That is why we propose a six-week pilot and a reading before it starts.",
    podcastLineOutro: "Deal. Thanks for listening — see you in the next review.",
    cardsPrev: "Previous card",
    cardsNext: "Next card",
    cardsTagInsight: "Insight",
    cardsTitleInsight: "The takeaway",
    cardsTagContext: "Context",
    cardsTitleContext: "What this material is",
    cardsTagStep: (n: number) => `Step ${n}`,
    cardsStepFallback: "We record the result and hand it to the process owner.",
    cardsTagRisk: "Risk",
    cardsTitleRisk: "What can break",
    cardsTextRisk:
      "No process owner and no metric baseline — you will not prove the effect to a committee.",
    cardsTagAction: "Action",
    cardsTitleAction: "The first step this week",
    cardsTextAction: (unit: string) =>
      `Get the ${unit} team together for 60 minutes and record the current metrics.`,
    infoPathFallback: "Insight → Pilot → Scale-up",
    cardsOriginCited: (n: number) =>
      n === 0 ? "No fragment cited" : `From ${n} ${pluralEn(n, "fragment", "fragments")}`,
    cardsOriginSource: (source: string) => `Source: ${source}`,
    cardsOriginFramework: "From the author's framework",
    cardsOriginModel: "Model's own estimate, not from the source",
  },

  /** Направления бизнеса. Ключ — каноническое русское значение из данных. */
  businessUnits: {
    Строительство: "Construction",
    Девелопмент: "Development",
    Промышленность: "Industry",
    "Корпоративный центр": "Corporate center",
    Финансы: "Finance",
    HR: "HR",
  } as Record<string, string>,

  positions: {
    developmentDirector: "Director of Development",
  },

  evidence: {
    высокий: "high",
    средний: "medium",
    низкий: "low",
    "недостаточно данных": "insufficient data",
  } as Record<string, string>,

  applicability: {
    "Высокая применимость": "Highly applicable",
    "Частичная применимость": "Partly applicable",
    "Слабая аналогия": "Weak analogy",
  } as Record<string, string>,

  clarify: {
    unknown: "Not known yet",
    questionN: (n: number) => `Question ${n}`,
    questionOfTitle: (n: number, total: number, title: string) =>
      `Question ${n} of ${total}: ${title}`,
    ownOption: (placeholder: string) => `My own answer: ${placeholder}`,
    ownAnswerLabel: (placeholder: string) => `My own answer: ${placeholder}`,
    modeHint: (multi: boolean, drivers: string) =>
      `${multi ? "You can pick several options." : "Pick one option."} What drives the conclusion: ${drivers}.`,
    followUpVolume: "What if the partner guarantees the volume?",
    followUpExclusivity: "What changes if exclusivity covers only one segment?",
    followUpWindow: "Which scenario fits if the market window is 6 months?",
  },

  infographic: {
    mainInsight: "Key insight",
    rolloutPath: "Rollout path",
    footer: "One-screen summary · F — fullscreen.",
  },

  profile: {
    firstName: "Marat",
    lastName: "Abenov",
    initials: "MA",
  },

  councilExtra: {
    online: "online",
    disclaimer:
      "AI models of publicly known approaches. Not real people, and not their private views.",
    replyTo: (name: string) => `· Reply to: ${name}`,
    typing: (name: string) => `${name} is typing…`,
    messageLabel: "Message to the council",
    lineup: (selected: number, max: number) => `Council line-up (${selected}/${max})`,
    done: "Done",
    clearSearch: "Clear search",
    changeLineup: "Change line-up",
    deleteBody: (title: string) =>
      `“${title}” and the whole council conversation will be deleted with no way to restore them.`,
    deleteConfirm: "Yes, delete",
  },

  viewerExtra: {
    cardsHint: (n: number) =>
      `Swipe horizontally — ${n} ${pluralEn(n, "card", "cards")} of takeaways from the material.`,
    podcastHosts: (a: string, b: string, n: number) =>
      `${a} and ${b} · ${n} ${pluralEn(n, "line", "lines")}`,
    podcastHint: "Click a line to jump there. The text highlights in sync with the audio.",
    advisorPromptTitle: "Describe the management situation in plain words",
    savedSessions: "Saved sessions",
  },

  /** Тематические теги. Ключ — каноническая русская метка из данных. */
  topicTags: {
    Качество: {
      label: "Quality",
      description: "Defects, finishing standards, on-site control, spotting problems",
    },
    Безопасность: {
      label: "Safety",
      description: "Site safety, occupational health, incidents, prevention",
    },
    Проекты: {
      label: "Projects",
      description: "Deadlines, budget, resources, contractor coordination, delay risk",
    },
    Эффективность: {
      label: "Efficiency",
      description: "Process optimisation, automation on site, sunk time, cost",
    },
    Стандартизация: {
      label: "Standardisation",
      description: "Process unification, repeatability, checklists, a control system",
    },
    Сроки: {
      label: "Schedule",
      description: "Planning, progress tracking, causes of delay, risk management",
    },
    NPS: {
      label: "NPS",
      description: "Buyer NPS, handover of keys, after-sales service, complaints",
    },
    Опыт: {
      label: "Experience",
      description: "From first contact to the keys, touchpoints, journey",
    },
    Лояльность: {
      label: "Loyalty",
      description:
        "Repeat purchases, lifetime value, loyalty programmes, why customers move to competitors",
    },
    Ценообразование: {
      label: "Pricing",
      description: "Cost calculation, EVC, price strategy, price positioning, price negotiation",
    },
    Маркетинг: {
      label: "Marketing",
      description:
        "Positioning, brand communication, customer journey, omnichannel, digital vs offline",
    },
    Инновация: {
      label: "Innovation",
      description:
        "Developing a new product, service or business model; going to market; clearing barriers",
    },
    Конкуренция: {
      label: "Competition",
      description: "How we differ from other developers, uniqueness of the offer, positioning",
    },
    Рост: {
      label: "Growth",
      description:
        "Expansion, scaling, recalculating capacity, growth strategy, risks while growing",
    },
    Локализация: {
      label: "Localisation",
      description:
        "Differences between regions, adapting to local conditions, scaling across geographies",
    },
    Стратегия: {
      label: "Strategy",
      description: "Long-term positioning, choosing markets (Ansoff), competitive advantage",
    },
    Масштабирование: {
      label: "Scaling",
      description:
        "Readiness of the system to grow, holding quality while growing, repeatability of the model",
    },
    Бренд: {
      label: "Brand",
      description: "Identity, reputation, resonance with the audience, brand revival, associations",
    },
    Доверие: {
      label: "Trust",
      description:
        "In a market that does not exist yet, reliability signals, reputation, honesty, transparent mechanics",
    },
    Лидерство: {
      label: "Leadership",
      description:
        "Leading people, deciding in a crisis, vision, developing the team, personal style",
    },
    Культура: {
      label: "Culture",
      description:
        "Company values, symbols and norms, how beliefs are transmitted, cultural conflict",
    },
    Ценности: {
      label: "Values",
      description:
        "The principles of a leader or company, what people believe in, where they will compromise",
    },
    Команда: {
      label: "Team",
      description: "Composition, dynamics, effectiveness, diversity, developing members’ abilities",
    },
    HR: {
      label: "HR",
      description:
        "Hiring, development, retention, compensation, cultural fit, succession planning",
    },
    Управление: {
      label: "Management",
      description: "Decision-making, management mechanics, processes, control, delegation",
    },
    Переговоры: {
      label: "Negotiation",
      description:
        "Bargaining with customers and investors, closing the deal, influence and power dynamics",
    },
    Перемены: {
      label: "Change",
      description: "Transformation, organisational shifts, resistance to change, change management",
    },
    Трансформация: {
      label: "Transformation",
      description: "Radical reinvention, a strategic turn, rescue from decline",
    },
    Аналитика: {
      label: "Analytics",
      description:
        "Data analysis, ML models, forecasting, insights, behavioural patterns, data-driven decisions",
    },
    Обучение: {
      label: "Learning",
      description:
        "Retaining expertise, training the team, documenting processes, passing on experience",
    },
    Финансы: {
      label: "Finance",
      description: "ROI, calculating project effect, budgeting, cost saving, justifying investment",
    },
    Принципы: {
      label: "Principles",
      description:
        "Key principles, frameworks and playbooks that transfer to other contexts; transferable insights",
    },
  } as Record<string, { label: string; description: string }>,

  /** Теги карточек. Ключ — каноническое русское значение. */
  cardTags: {
    bim: "bim",
    hr: "hr",
    lean: "lean",
    данные: "data",
    девелопмент: "development",
    закупки: "procurement",
    изменения: "change",
    инновации: "innovation",
    кризис: "crisis",
    культура: "culture",
    лидерство: "leadership",
    "операционная эффективность": "operational efficiency",
    организация: "organisation",
    переговоры: "negotiation",
    портфель: "portfolio",
    процессы: "processes",
    себестоимость: "cost",
    стратегия: "strategy",
    трансформация: "transformation",
    управление: "management",
    "управление рисками": "risk management",
    финансы: "finance",
    ценообразование: "pricing",
  } as Record<string, string>,

  /** Персоны консилиума: имена и описания подходов. */
  personas: {
    founder: {
      name: "Elon Musk",
      role: "Radical engineer and visionary",
      tag: "First principles",
      description:
        "Breaks the problem down to base facts, removes the excess and looks for a tenfold improvement.",
    },
    operator: {
      name: "Jeff Bezos",
      role: "Long-term operator",
      tag: "Customer",
      description:
        "Starts from the customer and builds scalable mechanisms instead of one-off heroics.",
    },
    engineer: {
      name: "Demis Hassabis",
      role: "Scientific strategist",
      tag: "Science",
      description:
        "Separates the engineering task from the scientific unknown, demanding a precise experiment and a test of generalisation.",
    },
    contrarian: {
      name: "Peter Thiel",
      role: "Contrarian strategist",
      tag: "Contrarian",
      description:
        "Looks for the hidden truth, strong differentiation and the path from zero to one.",
    },
    industrialist: {
      name: "Warren Buffett",
      role: "Disciplined investor",
      tag: "Value",
      description:
        "Checks whether the economics are understandable, the quality of management, the cost of a mistake and long-term durability.",
    },
    product: {
      name: "Steve Jobs",
      role: "Product editor",
      tag: "Product",
      description:
        "Defends simplicity and coherence of the experience, pulling the argument back to: why does a person need this.",
    },
    brand: {
      name: "Aidyn Rakhimbayev",
      role: "Entrepreneur and development leader",
      tag: "Development",
      description:
        "Judges ideas by the benefit to people, the quality of the environment, the scale of execution and accountability for the result.",
    },
    platform: {
      name: "Jensen Huang",
      role: "Architect of technology platforms",
      tag: "Full stack",
      description:
        "Treats AI, compute, the ecosystem and the industry’s economics as one full stack.",
    },
    competitor: {
      name: "Sam Altman",
      role: "AI product strategist",
      tag: "Startup",
      description: "Combines a big bet with learning speed, distribution and early real usage.",
    },
    resilience: {
      name: "Ray Dalio",
      role: "Systems diagnostician",
      tag: "Principles",
      description:
        "Turns decisions into explicit principles, cause-and-effect models and feedback loops.",
    },
    scale: {
      name: "Andrew Ng",
      role: "Pragmatic AI leader",
      tag: "AI practitioner",
      description:
        "Translates a business problem into a deliverable AI project with data, metrics and short iterations.",
    },
    transform: {
      name: "Satya Nadella",
      role: "Leader of corporate transformation",
      tag: "Transformation",
      description:
        "Connects technology, culture, partnerships and practical value for the organisation.",
    },
  } as Record<string, { name: string; role: string; tag: string; description: string }>,

  personaDisclaimer:
    "Digital models of publicly known approaches. These are not real people, nor their current or private opinions.",

  councilTalk: {
    takes: {
      founder: (topic: CouncilTopicText) => [
        `Boldly: ${topic.insight}`,
        "If it does not change the rules of the game on a 10-year horizon, it is not worth the resources.",
      ],
      operator: (topic: CouncilTopicText) => [
        `Operationally: ${topic.summary}`,
        `Without a clear process owner and metrics this will not repeat at the scale of ${topic.businessUnit}.`,
      ],
      engineer: (topic: CouncilTopicText) => [
        `Technically: before we talk about “${topic.title}”, we need to check it is feasible at all without hidden assumptions.`,
      ],
      contrarian: (topic: CouncilTopicText) => [
        `A contrarian view: the market has almost certainly priced in the opposite — ${topic.insight.toLowerCase()}`,
        "The bet worth making is where the consensus is wrong.",
      ],
      industrialist: (topic: CouncilTopicText) => [
        `The long horizon: the reputation of ${topic.businessUnit} is worth more than a quick gain.`,
        `${topic.insight} I am in no hurry.`,
      ],
      product: (topic: CouncilTopicText) => [
        `From the customer’s point of view: ${topic.summary}`,
        "If it does not improve the end user’s life, the question is not settled yet.",
      ],
      brand: (topic: CouncilTopicText) => [
        `The story matters: how do we explain “${topic.title}” to people inside and outside the company?`,
        topic.insight,
      ],
      platform: (topic: CouncilTopicText) => [
        `From the ecosystem angle: who else wins from “${topic.title}” if we go this way?`,
        `In ${topic.businessUnit}, partnerships matter more than controlling every step.`,
      ],
      competitor: (topic: CouncilTopicText) => [
        `Competitively: ${topic.insight}`,
        `If we do not move first, someone else in ${topic.businessUnit} will.`,
      ],
      resilience: (topic: CouncilTopicText) => [
        `Through the resilience lens: regulatory and market turbulence will hit ${topic.businessUnit} sooner or later — the question is whether we adapt faster than the rest.`,
      ],
      scale: (topic: CouncilTopicText) => [
        `Efficiency first: ${topic.summary}`,
        `Every extra dollar of cost at the scale of ${topic.businessUnit} is margin left on the table.`,
      ],
      transform: (topic: CouncilTopicText) => [
        `From the transformation angle: the old processes in ${topic.businessUnit} will not survive this decision without a change in culture.`,
        topic.insight,
      ],
    } as Record<string, (topic: CouncilTopicText) => string[]>,
    disagreement: {
      contrarian: (name: string) =>
        `${name}, are you sure the market has not already played this out?`,
      competitor: (name: string) =>
        `${name}, optimism is fine, but one of the competitors is surely thinking the same thing.`,
      resilience: (name: string) =>
        `${name}, elegant — but what happens to this plan if conditions change sharply?`,
    } as Record<string, (name: string) => string>,
    disagreementDefault: (name: string) => `${name}, I would not rush.`,
    keywords: {
      risk: /риск|risk|тәуекел/i,
      plan: /план|дальше|шаг|первым|plan|next|step|first|жоспар|қадам|бірінші/i,
      agree: /согласны|друг с другом|спор|agree|disagree|argument|келіс|пікір/i,
    },
    riskReply: (unit: string) =>
      `The main risk: ${unit} does not forgive underestimated scenarios.`,
    planReply: "The first step is to name a process owner — without one, any plan stands still.",
    agreeReply:
      "Not entirely — and that is rather the point: if everyone agreed, there would be no need for a council.",
    fallback: "This needs a more specific breakdown — ask a sharper question and I will answer.",
    quickReplies: [
      "What are the main risks?",
      "What would you do first?",
      "Do you agree with each other?",
      "Give me a concrete plan",
    ] as string[],
  },

  /** Темы демонстрационных сессий консилиума. */
  seedTopics: {
    "seed-1": {
      title: "Iz Lynn Chan at Far East Organization (Abridged)",
      summary:
        "A regional director must decide whether to promote a local hire over a more experienced expatriate, balancing performance against organisational expectations.",
      insight:
        "Formal seniority does not guarantee results — a promotion decision should rest on measurable contribution, not on time served.",
      businessUnit: "Far East",
    },
    "seed-2": {
      title: "SpinBrush",
      summary:
        "A small company with a fast-growing product chooses between growing alone, partnering with a large player, and selling the business.",
      insight:
        "Negotiating power rises sharply once external demand is proven — until then, long-term rights are best kept.",
      businessUnit: "Household goods",
    },
  } as Record<string, CouncilTopicText>,

  /** Текст AI-советника — см. src/data/advisor/text.ts. */
  advisorText: advisorEn,
};
