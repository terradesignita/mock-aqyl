/**
 * Моковая модель AI-советника BI AQYL (ТЗ v1.0).
 * Вся логика детерминированная — точка подключения реального LLM одна:
 * заменить buildAnswer/classify на серверную функцию, интерфейс не меняется.
 */

import { evidenceLabel, type AdvisorText } from "@/data/advisor/text";

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
/* Уточняющие вопросы: структура здесь, формулировки — в словаре локали  */
/* ------------------------------------------------------------------ */

interface QuestionShape {
  id: string;
  multi: boolean;
  optionIds: string[];
  unknown?: boolean;
  triggeredBy?: { questionId: string; optionId: string };
}

const QUESTION_SETS: Record<string, QuestionShape[]> = {
  partnership: [
    { id: "proof", multi: true, optionIds: ["internal", "external"], unknown: true },
    { id: "partner_gives", multi: true, optionIds: ["clients", "money", "tech"] },
    { id: "partner_wants", multi: true, optionIds: ["share", "exclusive"], unknown: true },
    { id: "priority", multi: true, optionIds: ["speed", "control", "money_now"] },
    {
      id: "exclusive_scope",
      multi: false,
      optionIds: ["kz", "segment"],
      unknown: true,
      triggeredBy: { questionId: "partner_wants", optionId: "exclusive" },
    },
  ],
  sale: [
    { id: "why", multi: true, optionIds: ["focus", "cash", "limit"] },
    { id: "matters", multi: false, optionIds: ["price", "speed", "team"] },
    { id: "no_deal", multi: false, optionIds: ["stall", "loss"], unknown: true },
  ],
  market: [
    { id: "why", multi: true, optionIds: ["growth", "client", "diversify"] },
    { id: "known", multi: true, optionIds: ["research", "contacts"], unknown: true },
    { id: "how", multi: false, optionIds: ["own", "partner", "ma"] },
  ],
  generic: [
    { id: "goal", multi: true, optionIds: ["growth", "efficiency", "risk"] },
    { id: "horizon", multi: false, optionIds: ["now", "year", "long"] },
    { id: "limits", multi: true, optionIds: ["budget", "people"], unknown: true },
  ],
};

/** Какой набор вопросов у какого типа решения. */
const SET_BY_TYPE: Record<DilemmaType, string> = {
  partnership: "partnership",
  build_or_partner: "partnership",
  sale: "sale",
  new_market: "market",
  scaling: "generic",
  investment: "generic",
  org_model: "generic",
};

function buildQuestions(setKey: string, t: AdvisorText): ClarifyQuestion[] {
  return QUESTION_SETS[setKey].map((shape) => {
    const text = t.questions[`${setKey}.${shape.id}`];
    return {
      id: shape.id,
      title: text.title,
      multi: shape.multi,
      options: shape.optionIds.map((id) => ({ id, label: text.options[id] })),
      unknown: shape.unknown,
      ownPlaceholder: text.ownPlaceholder,
      triggeredBy: shape.triggeredBy,
    };
  });
}

const DILEMMA_TYPES: DilemmaType[] = [
  "partnership",
  "build_or_partner",
  "sale",
  "new_market",
  "scaling",
  "investment",
  "org_model",
];

/** Все типы решений с формулировками текущей локали. */
export function dilemmasFor(t: AdvisorText): Record<DilemmaType, Dilemma> {
  const out = {} as Record<DilemmaType, Dilemma>;
  for (const type of DILEMMA_TYPES) {
    out[type] = {
      type,
      label: t.dilemmaLabels[type],
      drivers: t.dilemmaDrivers[type],
      questions: buildQuestions(SET_BY_TYPE[type], t),
    };
  }
  return out;
}

/** Является ли запрос управленческим (а не поиском материалов). */
export function isManagerialQuery(q: string, t: AdvisorText) {
  const value = q.trim().toLowerCase();
  if (value.length < 12) return false;
  return !t.lookupPrefixes.some((w) => value.startsWith(w));
}

export function classify(query: string, t: AdvisorText): Dilemma {
  const dilemmas = dilemmasFor(t);
  const value = query.toLowerCase();
  for (const type of DILEMMA_TYPES) {
    const words = t.classifyWords[type];
    if (words.length && words.some((w) => value.includes(w))) return dilemmas[type];
  }
  return dilemmas.build_or_partner;
}

/** Известные параметры, извлечённые из формулировки запроса. */
export function extractKnown(query: string, t: AdvisorText): string[] {
  const value = query.toLowerCase();
  const out: string[] = [];
  const p = t.known.patterns;
  if (p.product.test(value)) out.push(t.known.ownProduct);
  if (p.partner.test(value)) out.push(t.known.externalPartner);
  if (p.market.test(value)) out.push(t.known.externalClients);
  if (p.terms.test(value)) out.push(t.known.dealTerms);
  if (out.length === 0) out.push(t.known.none);
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

/** Условия, изменённые через follow-up — влияют на пересчёт рекомендации. */
export interface FollowUpFlags {
  volumeGuaranteed?: boolean;
  exclusivityLimited?: boolean;
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
export function buildUnderstanding(
  d: Dilemma,
  sel: AdvisorSelection,
  query: string,
  t: AdvisorText,
): string {
  const parts: string[] = [];
  const has = (q: string, o: string) => (sel.choices[q] ?? []).includes(o);
  const u = t.understanding;

  if (d.type === "partnership" || d.type === "build_or_partner") {
    parts.push(
      has("proof", "internal") && !has("proof", "external")
        ? u.provenInternalOnly
        : has("proof", "external")
          ? u.provenExternal
          : u.provenUnknown,
    );
    const gives = (sel.choices["partner_gives"] ?? []).map((o) => LABEL(d, "partner_gives", o));
    if (gives.length) parts.push(u.partnerGives(gives.join(", ").toLowerCase()));
    const wants = (sel.choices["partner_wants"] ?? []).map((o) => LABEL(d, "partner_wants", o));
    if (wants.length) parts.push(u.partnerWants(wants.join(", ").toLowerCase()));
    const pr = sel.choices["priority"]?.[0];
    if (pr) parts.push(u.priority(LABEL(d, "priority", pr).toLowerCase()));
    const sc = sel.choices["exclusive_scope"]?.[0];
    if (sc) parts.push(u.exclusiveScope(LABEL(d, "exclusive_scope", sc).toLowerCase()));
  } else {
    parts.push(u.decisionType(d.label.toLowerCase()));
    for (const q of visibleQuestions(d, sel)) {
      const picked = (sel.choices[q.id] ?? []).map((o) => LABEL(d, q.id, o));
      if (picked.length) parts.push(u.questionAnswer(q.title, picked.join(", ").toLowerCase()));
    }
  }

  const owns = Object.values(sel.own).filter((v) => v.trim());
  if (owns.length) parts.push(u.yourNotes(owns.join("; ")));
  if (sel.extraContext?.trim()) parts.push(sel.extraContext.trim());
  if (parts.length < 2) parts.push(u.originalQuery(query.trim()));
  return parts.join(" ");
}

/* ------------------------------------------------------------------ */
/* Ответ                                                               */
/* ------------------------------------------------------------------ */

function drJohns(t: AdvisorText): Omit<Answer["caseRef"], "applicability"> {
  return {
    id: "case_dr_johns",
    title: t.drJohns.title,
    summary: t.drJohns.summary,
    matches: t.drJohns.matches,
    differences: t.drJohns.differences,
  };
}

function scenario(
  text: { name: string; speed: string; control: string; risk: string; when: string },
  recommended?: boolean,
): Answer["scenarios"][number] {
  return { ...text, recommended };
}

function toSources(
  raw: { id: string; title: string; kind: string; influence: string; quote: string }[],
): Answer["sources"] {
  return raw as Answer["sources"];
}

function buildPartnershipAnswer(
  d: Dilemma,
  sel: AdvisorSelection,
  flags: FollowUpFlags,
  t: AdvisorText,
): Answer {
  const has = (q: string, o: string) => (sel.choices[q] ?? []).includes(o);
  const externalProven = has("proof", "external");
  const wantsShare = has("partner_wants", "share");
  const wantsExclusive = has("partner_wants", "exclusive");
  const priority = sel.choices["priority"] ?? [];
  const unknownTerms = has("partner_wants", "__unknown") || has("proof", "__unknown");
  const p = t.partnership;

  const evidenceLevel: Answer["evidenceLevel"] = unknownTerms ? "недостаточно данных" : "средний";
  const volumeNote = flags.volumeGuaranteed ? p.volumeNote : "";

  const risks = flags.volumeGuaranteed
    ? p.risks.filter((r) => r !== p.riskChannelNotDelivered)
    : p.risks;

  return {
    verdict: unknownTerms
      ? p.verdictUnknown
      : externalProven
        ? p.verdictProven
        : p.verdictNotProven,
    verdictDetail: unknownTerms
      ? p.detailUnknown
      : externalProven
        ? p.detailProven
        : p.detailNotProven,
    insight: unknownTerms ? t.refusalInsight : p.insight(volumeNote),
    evidenceLevel,
    evidenceNote: unknownTerms ? p.evidenceNoteUnknown : p.evidenceNote,
    arguments: [
      externalProven ? p.argProven : p.argNotProven,
      p.argValueUnknown,
      wantsShare || wantsExclusive ? p.argLongTermRights : p.argNoMeasurables,
      priority.includes("speed") ? p.argSpeed : p.argOwnPath,
    ],
    caseRef: {
      ...drJohns(t),
      applicability: externalProven ? t.applicability.high : t.applicability.partial,
    } as Answer["caseRef"],
    transferable: p.transferable,
    nonTransferable: p.nonTransferable,
    scenarios: [
      scenario(p.scenarios.own),
      scenario(p.scenarios.pilot, true),
      {
        ...p.scenarios.exclusive,
        risk: flags.exclusivityLimited
          ? p.scenarios.exclusiveLimitedRisk
          : p.scenarios.exclusive.risk,
        when: flags.exclusivityLimited
          ? p.scenarios.exclusiveLimitedWhen
          : p.scenarios.exclusive.when,
      },
      scenario(p.scenarios.jv),
      scenario(p.scenarios.sell),
    ],
    recommendation: unknownTerms ? p.recommendationUnknown : p.recommendation,
    terms: p.terms,
    risks,
    changeFactors: p.changeFactors,
    missing: p.missing,
    sources: toSources(p.sources),
  };
}

function buildSaleAnswer(sel: AdvisorSelection, t: AdvisorText): Answer {
  const has = (q: string, o: string) => (sel.choices[q] ?? []).includes(o);
  const outOfFocus = has("why", "focus");
  const noResource = has("why", "limit");
  const willLoseShare = has("no_deal", "loss");
  const priorityPrice = sel.choices["matters"]?.[0] === "price";
  const unknownTerms = has("why", "__unknown") || has("no_deal", "__unknown");
  const strongCaseToSell = willLoseShare && (outOfFocus || noResource);
  const s = t.sale;

  return {
    verdict: unknownTerms ? s.verdictUnknown : strongCaseToSell ? s.verdictSell : s.verdictHold,
    verdictDetail: unknownTerms ? s.detailUnknown : strongCaseToSell ? s.detailSell : s.detailHold,
    insight: unknownTerms ? t.refusalInsight : s.insight,
    evidenceLevel: unknownTerms ? "недостаточно данных" : "средний",
    evidenceNote: unknownTerms ? s.evidenceNoteUnknown : s.evidenceNote,
    arguments: [
      willLoseShare ? s.argLoseShare : s.argCanGrow,
      s.argValueGap,
      priorityPrice ? s.argPriceFirst : s.argTermsMatter,
      noResource ? s.argNoResource : s.argHasResource,
    ],
    caseRef: { ...drJohns(t), applicability: t.applicability.partial } as Answer["caseRef"],
    transferable: s.transferable,
    nonTransferable: s.nonTransferable,
    scenarios: [
      scenario(s.scenarios.keepGrowing, !strongCaseToSell),
      scenario(s.scenarios.sellNow),
      scenario(s.scenarios.waitForSecond, strongCaseToSell),
    ],
    recommendation: unknownTerms
      ? s.recommendationUnknown
      : strongCaseToSell
        ? s.recommendationSell
        : s.recommendationHold,
    terms: s.terms,
    risks: s.risks,
    changeFactors: s.changeFactors,
    missing: s.missing,
    sources: toSources(s.sources),
  };
}

function buildGenericWeakAnswer(d: Dilemma, sel: AdvisorSelection, t: AdvisorText): Answer {
  const ownNotes = Object.values(sel.own).filter((v) => v.trim());
  const g = t.generic;

  return {
    verdict: g.verdict(d.label),
    verdictDetail: g.verdictDetail(d.label.toLowerCase()),
    insight: t.refusalInsight,
    evidenceLevel: "недостаточно данных",
    evidenceNote: g.evidenceNote(d.drivers.join(", ")),
    arguments: d.drivers.map((driver) => g.argument(driver)),
    caseRef: { ...drJohns(t), applicability: t.applicability.weak } as Answer["caseRef"],
    transferable: g.transferable,
    nonTransferable: g.nonTransferable,
    scenarios: [
      scenario(g.scenarios.own),
      scenario(g.scenarios.probe, true),
      scenario(g.scenarios.commit),
    ],
    recommendation: g.recommendation,
    terms: [],
    risks: g.risks,
    changeFactors: g.changeFactors,
    missing: ownNotes.length ? ownNotes : [g.missingFallback(d.drivers.join(", "))],
    sources: [],
  };
}

export function buildAnswer(
  d: Dilemma,
  sel: AdvisorSelection,
  t: AdvisorText,
  flags: FollowUpFlags = {},
): Answer {
  if (d.type === "partnership" || d.type === "build_or_partner")
    return buildPartnershipAnswer(d, sel, flags, t);
  if (d.type === "sale") return buildSaleAnswer(sel, t);
  return buildGenericWeakAnswer(d, sel, t);
}

export interface FollowUpReply {
  text: string;
  flags?: FollowUpFlags;
}

/** Ответ на уточняющий вопрос по уже сформированной рекомендации. */
export function buildFollowUpReply(
  question: string,
  answer: Answer,
  t: AdvisorText,
): FollowUpReply {
  const q = question.toLowerCase();
  const f = t.followUp;

  if (f.patterns.volume.test(q)) {
    return {
      text: f.volume(answer.terms[0] ?? f.fallbackTerm),
      flags: { volumeGuaranteed: true },
    };
  }
  if (f.patterns.exclusivity.test(q)) {
    return { text: f.exclusivity, flags: { exclusivityLimited: true } };
  }
  if (f.patterns.horizon.test(q)) {
    const recommended = answer.scenarios.find((sc) => sc.recommended);
    return {
      text: f.horizon(recommended?.name ?? answer.scenarios[0]?.name ?? f.fallbackScenario),
    };
  }
  if (f.patterns.risk.test(q)) {
    return { text: f.risk(answer.risks[0] ?? f.fallbackRisk) };
  }
  return { text: f.generic(answer.verdict) };
}

export interface NegotiationQuestions {
  groups: { title: string; questions: string[] }[];
}

/** §30 ТЗ — вопросы для подготовки к переговорам, сгруппированные по теме. */
export function buildNegotiationQuestions(d: Dilemma, t: AdvisorText): NegotiationQuestions {
  if (d.type === "partnership" || d.type === "build_or_partner") {
    return { groups: t.negotiation.partnership };
  }
  if (d.type === "sale") return { groups: t.negotiation.sale };
  return {
    groups: [
      {
        title: t.negotiation.genericTitle(d.label),
        questions: d.drivers.map((driver) => t.negotiation.genericQuestion(driver)),
      },
    ],
  };
}

/** §31 ТЗ — короткая версия ответа для акционера. */
export function buildShareholderSummary(answer: Answer, t: AdvisorText): string {
  return [
    answer.verdict,
    answer.verdictDetail,
    t.shareholder.preferredScenario(answer.recommendation),
    t.shareholder.evidenceLine(evidenceLabel(answer.evidenceLevel, t), answer.evidenceNote),
  ].join("\n\n");
}
