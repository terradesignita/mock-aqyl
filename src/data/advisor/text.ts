import type { Answer, DilemmaType } from "@/data/advisor";

/** Текст одного уточняющего вопроса: заголовок, подписи вариантов, плейсхолдер. */
export interface QuestionText {
  title: string;
  ownPlaceholder: string;
  options: Record<string, string>;
}

/** Подписи одного сценария в таблице вариантов. */
export interface ScenarioText {
  name: string;
  speed: string;
  control: string;
  risk: string;
  when: string;
}

/**
 * Весь текст AI-советника для одной локали. Логика ветвлений живёт в
 * `advisor.ts` и одна на все языки — здесь только формулировки, поэтому
 * пропущенный ключ ловится компилятором.
 */
export interface AdvisorText {
  /** Ключ — `${набор}.${questionId}`: id вопросов повторяются между наборами. */
  questions: Record<string, QuestionText>;
  unknownOption: string;

  dilemmaLabels: Record<DilemmaType, string>;
  dilemmaDrivers: Record<DilemmaType, string[]>;

  /** Ключевые слова классификатора — свои для каждого языка ввода. */
  classifyWords: Record<DilemmaType, string[]>;
  lookupPrefixes: string[];

  known: {
    ownProduct: string;
    externalPartner: string;
    externalClients: string;
    dealTerms: string;
    none: string;
    patterns: {
      product: RegExp;
      partner: RegExp;
      market: RegExp;
      terms: RegExp;
    };
  };

  understanding: {
    provenInternalOnly: string;
    provenExternal: string;
    provenUnknown: string;
    partnerGives: (list: string) => string;
    partnerWants: (list: string) => string;
    priority: (value: string) => string;
    exclusiveScope: (value: string) => string;
    decisionType: (label: string) => string;
    questionAnswer: (title: string, picked: string) => string;
    yourNotes: (notes: string) => string;
    originalQuery: (query: string) => string;
  };

  evidence: {
    high: string;
    medium: string;
    low: string;
    insufficient: string;
  };

  applicability: {
    high: string;
    partial: string;
    weak: string;
  };

  sourceKinds: {
    fact: string;
    analysis: string;
    note: string;
    ai: string;
  };

  influence: {
    decisive: string;
    supporting: string;
    contextual: string;
  };

  drJohns: {
    title: string;
    summary: string;
    matches: string[];
    differences: string[];
  };

  refusalInsight: string;

  partnership: {
    volumeNote: string;
    verdictUnknown: string;
    verdictProven: string;
    verdictNotProven: string;
    detailUnknown: string;
    detailProven: string;
    detailNotProven: string;
    insight: (volumeNote: string) => string;
    evidenceNoteUnknown: string;
    evidenceNote: string;
    argProven: string;
    argNotProven: string;
    argValueUnknown: string;
    argLongTermRights: string;
    argNoMeasurables: string;
    argSpeed: string;
    argOwnPath: string;
    transferable: string[];
    nonTransferable: string[];
    scenarios: {
      own: ScenarioText;
      pilot: ScenarioText;
      exclusive: ScenarioText;
      exclusiveLimitedRisk: string;
      exclusiveLimitedWhen: string;
      jv: ScenarioText;
      sell: ScenarioText;
    };
    recommendationUnknown: string;
    recommendation: string;
    terms: string[];
    risks: string[];
    /** Риск, который снимается гарантированным объёмом — должен совпадать с записью в `risks`. */
    riskChannelNotDelivered: string;
    changeFactors: string[];
    missing: string[];
    sources: { id: string; title: string; kind: string; influence: string; quote: string }[];
  };

  sale: {
    verdictUnknown: string;
    verdictSell: string;
    verdictHold: string;
    detailUnknown: string;
    detailSell: string;
    detailHold: string;
    insight: string;
    evidenceNoteUnknown: string;
    evidenceNote: string;
    argLoseShare: string;
    argCanGrow: string;
    argValueGap: string;
    argPriceFirst: string;
    argTermsMatter: string;
    argNoResource: string;
    argHasResource: string;
    transferable: string[];
    nonTransferable: string[];
    scenarios: { keepGrowing: ScenarioText; sellNow: ScenarioText; waitForSecond: ScenarioText };
    recommendationUnknown: string;
    recommendationSell: string;
    recommendationHold: string;
    terms: string[];
    risks: string[];
    changeFactors: string[];
    missing: string[];
    sources: { id: string; title: string; kind: string; influence: string; quote: string }[];
  };

  generic: {
    verdict: (label: string) => string;
    verdictDetail: (label: string) => string;
    evidenceNote: (drivers: string) => string;
    argument: (driver: string) => string;
    transferable: string[];
    nonTransferable: string[];
    scenarios: { own: ScenarioText; probe: ScenarioText; commit: ScenarioText };
    recommendation: string;
    risks: string[];
    changeFactors: string[];
    missingFallback: (drivers: string) => string;
  };

  followUp: {
    patterns: { volume: RegExp; exclusivity: RegExp; horizon: RegExp; risk: RegExp };
    volume: (firstTerm: string) => string;
    fallbackTerm: string;
    exclusivity: string;
    horizon: (scenarioName: string) => string;
    fallbackScenario: string;
    risk: (firstRisk: string) => string;
    fallbackRisk: string;
    generic: (verdict: string) => string;
  };

  negotiation: {
    partnership: { title: string; questions: string[] }[];
    sale: { title: string; questions: string[] }[];
    genericTitle: (label: string) => string;
    genericQuestion: (driver: string) => string;
  };

  shareholder: {
    preferredScenario: (recommendation: string) => string;
    evidenceLine: (level: string, note: string) => string;
  };

  thinkingSteps: string[];
  examples: string[];
}

/** Уровень доказательности из `Answer` — в подпись локали. */
export function evidenceLabel(level: Answer["evidenceLevel"], t: AdvisorText): string {
  switch (level) {
    case "высокий":
      return t.evidence.high;
    case "средний":
      return t.evidence.medium;
    case "низкий":
      return t.evidence.low;
    default:
      return t.evidence.insufficient;
  }
}
