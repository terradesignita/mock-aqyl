import type { AdvisorText } from "./text";

export const advisorEn: AdvisorText = {
  questions: {
    "partnership.proof": {
      title: "What has the product already proven?",
      ownPlaceholder: "Describe what the data already confirms",
      options: {
        internal: "An effect inside the company",
        external: "External demand from customers",
      },
    },
    "partnership.partner_gives": {
      title: "What does the potential partner bring?",
      ownPlaceholder: "What exactly the partner puts into the deal",
      options: {
        clients: "Access to customers and a sales channel",
        money: "Investment and cost sharing",
        tech: "Technology or expertise",
      },
    },
    "partnership.partner_wants": {
      title: "What does the partner want in return?",
      ownPlaceholder: "The terms currently on the table",
      options: { share: "A share of the future business", exclusive: "Exclusivity in the market" },
    },
    "partnership.priority": {
      title: "What matters more to you right now?",
      ownPlaceholder: "Your priority in your own words",
      options: {
        speed: "Testing the market quickly",
        control: "Keeping control of the product",
        money_now: "Getting cash now",
      },
    },
    "partnership.exclusive_scope": {
      title: "What does the exclusivity cover?",
      ownPlaceholder: "The boundaries of exclusivity in the partner’s offer",
      options: { kz: "One market (Kazakhstan, for example)", segment: "A single customer segment" },
    },
    "sale.why": {
      title: "Why are you considering a sale?",
      ownPlaceholder: "The reason in your own words",
      options: {
        focus: "The asset is not in the strategy’s focus",
        cash: "We need cash for other directions",
        limit: "We have no resource to develop it further",
      },
    },
    "sale.matters": {
      title: "What matters more to you in the deal?",
      ownPlaceholder: "Your priority",
      options: {
        price: "The highest price",
        speed: "Speed and certainty",
        team: "What happens to the team and the product",
      },
    },
    "sale.no_deal": {
      title: "What happens if you do not sell?",
      ownPlaceholder: "The alternative scenario",
      options: { stall: "Development will stall", loss: "We will start losing market share" },
    },
    "market.why": {
      title: "Why do you want to enter a new market?",
      ownPlaceholder: "The goal of entering",
      options: {
        growth: "Growth in the current market is exhausted",
        client: "We are following a specific customer",
        diversify: "Risk diversification",
      },
    },
    "market.known": {
      title: "What is already known about the market?",
      ownPlaceholder: "What the data confirms",
      options: {
        research: "There is research and a demand estimate",
        contacts: "There are contacts and first conversations",
      },
    },
    "market.how": {
      title: "How is the entry planned?",
      ownPlaceholder: "The entry model",
      options: {
        own: "On our own",
        partner: "Through a local partner",
        ma: "By acquiring a player",
      },
    },
    "generic.goal": {
      title: "What result do you want to achieve?",
      ownPlaceholder: "The expected result",
      options: {
        growth: "Revenue growth",
        efficiency: "Efficiency and lower cost",
        risk: "Lower risk",
      },
    },
    "generic.horizon": {
      title: "On what horizon do you need the decision?",
      ownPlaceholder: "Your horizon",
      options: {
        now: "This quarter",
        year: "Within the year",
        long: "A strategic horizon of 3+ years",
      },
    },
    "generic.limits": {
      title: "Which constraints matter?",
      ownPlaceholder: "Constraints in your own words",
      options: { budget: "Budget", people: "People and capabilities" },
    },
  },
  unknownOption: "Not known yet",

  dilemmaLabels: {
    partnership: "Partnership with an external company",
    build_or_partner: "Build alone or take an external partner",
    sale: "Selling the business or a stake",
    new_market: "Entering a new market",
    scaling: "Scaling",
    investment: "Investment and resource allocation",
    org_model: "Organisational model",
  },
  dilemmaDrivers: {
    partnership: [
      "whether external demand is proven",
      "what gap the partner actually closes",
      "which rights are handed over and for how long",
    ],
    build_or_partner: ["speed to market", "availability of alternatives", "the cost of control"],
    sale: ["the asset’s strategic value", "the alternative without a deal", "irreversibility"],
    new_market: ["how well demand is proven", "the entry model", "the cost of a mistake"],
    scaling: ["durability of the unit economics", "the process bottleneck", "team readiness"],
    investment: ["the alternative return", "reversibility", "the horizon of the effect"],
    org_model: ["the process owner", "decision speed", "the cost of coordination"],
  },
  classifyWords: {
    partnership: ["partner", "joint", "alliance", "exclusiv", "together"],
    build_or_partner: [],
    sale: ["sell", "sale", "stake", "exit the business", "deal"],
    new_market: ["new market", "market", "region", "country", "export"],
    scaling: ["scale", "scaling", "roll out", "growth", "expand"],
    investment: ["invest", "budget", "capital", "allocate"],
    org_model: ["structure", "organis", "organiz", "team", "department"],
  },
  lookupPrefixes: ["find", "show", "material", "document", "deck", "article", "search"],

  known: {
    ownProduct: "this is about the company’s own product",
    externalPartner: "an external partner is on the table",
    externalClients: "the question concerns going out to external customers",
    dealTerms: "deal terms are being discussed",
    none: "a management situation with no explicit parameters in the wording",
    patterns: {
      product: /(product|solution|platform|service)/,
      partner: /(partner|together|joint)/,
      market: /(market|customer|client|sell)/,
      terms: /(share|stake|exclusiv|term)/,
    },
  },

  understanding: {
    provenInternalOnly:
      "The internal product has proven its effect inside the company, but there is no confirmed external demand yet.",
    provenExternal: "The product has confirmed external demand.",
    provenUnknown: "How well the product is proven is not yet backed by data.",
    partnerGives: (list) => `The partner offers: ${list}.`,
    partnerWants: (list) => `In return they want: ${list}.`,
    priority: (value) => `BI Group’s priority right now is ${value}.`,
    exclusiveScope: (value) => `Exclusivity is being discussed within: ${value}.`,
    decisionType: (label) => `Type of decision: ${label}.`,
    questionAnswer: (title, picked) => `${title} — ${picked}.`,
    yourNotes: (notes) => `Your notes: ${notes}.`,
    originalQuery: (query) => `The original wording: “${query}”.`,
  },

  evidence: { high: "high", medium: "medium", low: "low", insufficient: "insufficient data" },
  applicability: {
    high: "Highly applicable",
    partial: "Partly applicable",
    weak: "Weak analogy",
  },
  sourceKinds: {
    fact: "Fact",
    analysis: "Author’s analysis",
    note: "Personal note",
    ai: "AI-generated",
  },
  influence: { decisive: "Decisive", supporting: "Supporting", contextual: "Contextual" },

  drJohns: {
    title: "Dr. John's Products",
    summary:
      "A small company with a fast-growing product was choosing between developing alone, allying with a large player, and selling. By the time of the decision the product already had proven demand and a presence in major sales channels.",
    matches: [
      "a product with a proven effect and limited resource to scale it",
      "a large counterparty offering a channel in exchange for rights",
      "the decision is taken before the full market value is confirmed",
    ],
    differences: [
      "in the case demand was proven by the external market; at BI Group it is so far internal",
      "a consumer product versus a digital B2B product",
      "Dr. John's had alternative buyers — stronger negotiating position",
    ],
  },

  refusalInsight:
    "I can structure the options, risks and questions for negotiation, but I will not pass them off as a conclusion drawn from BI Group’s accumulated experience.",

  partnership: {
    volumeNote:
      " The partner now takes on measurable market risk by guaranteeing volume, which makes the channel more credible. On its own, though, it does not justify handing over a stake and long-term exclusivity.",
    verdictUnknown: "I cannot give an evidence-backed recommendation.",
    verdictProven:
      "Going into the partnership is possible, but with limited rights and measurable obligations on the partner.",
    verdictNotProven: "Do not accept the proposed terms as they stand.",
    detailUnknown:
      "The library holds material on partnerships, but the deal terms — the stake, the exclusivity period, the guaranteed volume — are not yet on record, so the situation cannot be soundly compared with the Dr. John's case.",
    detailProven:
      "External demand is confirmed, so the partner’s channel genuinely accelerates growth — the question is no longer “go or not” but “on what terms”. Handing over a stake and long-term exclusivity before the market itself has set the product’s price is premature: BI Group would give away perpetual rights for something that may be worth three times as much in six months. The right move is to convert the partner’s interest into a testable pilot with clear metrics, not into a one-off sale of potential.",
    detailNotProven:
      "A partnership genuinely can speed up the test of external demand — the partner has a channel BI Group does not. But handing over a significant stake and long-term exclusivity before the product’s market value is confirmed by anything creates disproportionate risk: the company would be selling an asset at a price it cannot yet justify itself. With not a single external customer and not a single independent metric, any figure in the negotiation is the partner’s bet, not the market’s valuation.",
    insight: (volumeNote) =>
      `Right now BI Group is not selling a business but a hypothesis about a business — and hypotheses are worth an order of magnitude less than equity. The right thing to sell the partner today is a limited right to test the channel on clear terms, not a share of a future value nobody can yet calculate.${volumeNote}`,
    evidenceNoteUnknown:
      "The key deal terms — the size of the stake, the exclusivity period, the guaranteed volume — are not recorded on paper or in correspondence. The conclusion is therefore a frame, not a final answer: as soon as a draft agreement with real figures appears, the recommendation must be recalculated rather than the facts fitted to a conclusion already made.",
    evidenceNote:
      "The Dr. John's case supports the logic of negotiating power well — whoever has alternatives sets the terms. But the model there is consumer and physical, not digital B2B, so the deal structure cannot be copied literally: transfer the principle, not the numbers.",
    argProven:
      "External demand is confirmed — the negotiating position is already stronger than at the start.",
    argNotProven: "External demand is not confirmed yet.",
    argValueUnknown: "The product’s market value is still unknown.",
    argLongTermRights: "The partner gets long-term rights on the strength of future potential.",
    argNoMeasurables: "The partner’s obligations are not yet expressed in measurable terms.",
    argSpeed: "Speed is critical, but it can be bought with a pilot rather than with equity.",
    argOwnPath: "Going alone is possible, though it will take longer.",
    transferable: [
      "a product’s value rises once demand is proven",
      "negotiating power depends on having alternatives",
      "a large partner may be buying speed rather than the product",
      "strategic value exceeds current financial value",
    ],
    nonTransferable: [
      "a direct comparison of multiples and deal valuation",
      "the deal structure of a consumer market",
      "the assumption that several competing buyers exist",
    ],
    scenarios: {
      own: {
        name: "Go alone",
        speed: "Low",
        control: "High",
        risk: "Medium",
        when: "If time is not critical",
      },
      pilot: {
        name: "A limited pilot with the partner",
        speed: "High",
        control: "High",
        risk: "Low",
        when: "To test the market",
      },
      exclusive: {
        name: "Exclusive partnership",
        speed: "High",
        control: "Low",
        risk: "High",
        when: "With guaranteed volume",
      },
      exclusiveLimitedRisk: "Medium",
      exclusiveLimitedWhen: "With guaranteed volume and a limited exclusivity period",
      jv: {
        name: "Joint venture",
        speed: "Medium",
        control: "Medium",
        risk: "High",
        when: "After the economics are confirmed",
      },
      sell: {
        name: "Sell the product",
        speed: "High",
        control: "None",
        risk: "Irreversible",
        when: "If the holding does not want to build the business",
      },
    },
    recommendationUnknown:
      "Put the partnership terms on record — the stake, the exclusivity period, the guaranteed volume — then come back for a recommendation.",
    recommendation:
      "The preferred scenario is a limited commercial pilot of 6–9 months with no stake handed over and no broad exclusivity.",
    terms: [
      "a limited customer segment",
      "a limited term",
      "measurable KPIs",
      "a minimum guaranteed volume",
      "data rights retained",
      "intellectual property stays with BI Group",
      "no automatic renewal",
      "a right to terminate",
      "the discussion of a stake moves to the stage of confirmed revenue",
    ],
    risks: [
      "the partner does not deliver the channel they promised",
      "the product turns out to be too dependent on BI Group’s internal processes",
      "external demand proves weaker than internal",
      "the partner gains access to the technology without adequate compensation",
      "exclusivity closes off other channels",
      "the parties value each other’s contribution differently",
    ],
    riskChannelNotDelivered: "the partner does not deliver the channel they promised",
    changeFactors: [
      "a guaranteed sales volume",
      "significant investment by the partner",
      "a short market window",
      "a strong competitor in play",
      "no realistic way to go alone",
      "an international channel",
      "unique technology from the partner",
      "a high cost of support",
    ],
    missing: [
      "a draft agreement",
      "a valuation of the product",
      "a forecast of external revenue",
      "the partner’s obligations",
      "the term and boundaries of exclusivity",
      "rules on data ownership",
      "exit conditions from the partnership",
    ],
    sources: [
      {
        id: "src_case_facts",
        title: "Dr. John's Products — case material",
        kind: "Fact",
        influence: "Decisive",
        quote:
          "By the time of the decision the product was stocked by major retail chains, and sales growth was evidenced by channel data rather than management’s forecast.",
      },
      {
        id: "src_case_analysis",
        title: "Case walkthrough: the HBS instructor’s questions",
        kind: "Author’s analysis",
        influence: "Supporting",
        quote:
          "A strategic buyer values not only the asset’s profit but also the cost of closing a gap in its own portfolio and the risk of doing nothing.",
      },
      {
        id: "src_ll_bi",
        title: "Lessons Learned: pilots with external partners",
        kind: "Fact",
        influence: "Supporting",
        quote:
          "Pilots without measurable KPIs and a minimum guaranteed volume failed to grow external revenue in 3 out of 4 cases.",
      },
      {
        id: "src_note",
        title: "Note from the strategy session on digital products",
        kind: "Personal note",
        influence: "Contextual",
        quote:
          "Agreed: data rights and IP on internal products are not handed over until the external economics are confirmed.",
      },
    ],
  },

  sale: {
    verdictUnknown: "I cannot give an evidence-backed recommendation.",
    verdictSell: "Selling makes sense, but not at the first price offered.",
    verdictHold: "Do not sell now — the asset has not yet realised its strategic value.",
    detailUnknown:
      "The library holds material on selling a business, but the reason for the sale and the alternative without a deal are not on record — the situation cannot be soundly compared with the Dr. John's case.",
    detailSell:
      "If development genuinely stalls without a deal, or leads to a loss of share, waiting costs more than the price left on the table in the negotiation. But pressure of circumstance on its own does not mean accepting the buyer’s first figure — a strategic buyer almost always values an asset above its standalone worth.",
    detailHold:
      "The asset can still grow on its own, which means the company is not obliged to sell at the first price. With no pressure of circumstance forcing a deal, selling now locks the value in at its current, not yet fully revealed level.",
    insight:
      "A strategic buyer almost always values an asset not by your current revenue but by the cost of closing its own gap and the risk of its own inaction — standalone and strategic value almost never coincide.",
    evidenceNoteUnknown:
      "The reason for the sale and the consequences of walking away are not on record — the conclusion is a frame, not a final answer.",
    evidenceNote:
      "The Dr. John's case considered a sale directly as one of the options and supports the logic of the gap between standalone and strategic value well — but there the decision was taken with external demand already proven, which may not be the case here.",
    argLoseShare:
      "Without a deal there is a risk of losing market share — that limits the time available to negotiate.",
    argCanGrow: "Without a deal the asset can keep growing on its own.",
    argValueGap: "Standalone and strategic value of the asset to a buyer are different numbers.",
    argPriceFirst:
      "The highest price is the priority, which argues for holding out until a second interested buyer appears.",
    argTermsMatter:
      "Price is not the only priority, so the terms of the deal matter as much as the sum.",
    argNoResource:
      "There is not enough resource to develop the asset further alone — that pushes towards a deal.",
    argHasResource: "The resource to develop it alone exists — that reduces the need to sell now.",
    transferable: [
      "the standalone and strategic value of a business differ",
      "negotiating power grows when there are alternatives to the deal",
      "a buyer values not only profit but closing its own gap",
    ],
    nonTransferable: [
      "the deal structure of a consumer market",
      "specific valuation multiples",
      "the assumption that several competing buyers exist",
    ],
    scenarios: {
      keepGrowing: {
        name: "Keep developing it alone",
        speed: "Low",
        control: "High",
        risk: "Medium",
        when: "If the pressure of circumstance is not critical",
      },
      sellNow: {
        name: "Sell now at the price offered",
        speed: "High",
        control: "None",
        risk: "Irreversible",
        when: "Only if there is no alternative to the deal",
      },
      waitForSecond: {
        name: "Hold and look for a second buyer",
        speed: "Medium",
        control: "Medium",
        risk: "Medium",
        when: "To strengthen the negotiating position",
      },
    },
    recommendationUnknown:
      "Put the reason for the sale and the cost of inaction on record, then come back for a recommendation.",
    recommendationSell:
      "Negotiate with the current buyer while feeling out an alternative — a second interested player, or a path without a deal.",
    recommendationHold:
      "Do not rush the sale until the asset approaches the limit of what it can grow to alone, or a materially stronger buyer appears.",
    terms: [
      "an independent valuation before negotiating",
      "the exclusivity period for talks with one buyer is capped",
      "terms for the team and the product are agreed separately from the price",
    ],
    risks: [
      "a sale locks the value in at a not-yet-revealed level",
      "the buyer may push the price down by pointing to the absence of alternatives",
      "waiting may weaken the negotiating position if the pressure of circumstance is real",
    ],
    changeFactors: [
      "a second interested buyer appears",
      "share loss without a deal accelerates",
      "an independent valuation comes in above expectations",
      "the buyer is willing to account for the team’s future",
    ],
    missing: [
      "an independent valuation",
      "offers from alternative buyers",
      "a financial forecast if the deal is refused",
      "terms on the team and further development of the product",
    ],
    sources: [
      {
        id: "src_case_facts",
        title: "Dr. John's Products — case material",
        kind: "Fact",
        influence: "Decisive",
        quote:
          "The company considered a sale as one option alongside a partnership and standalone growth, already holding proven demand and a negotiating position.",
      },
      {
        id: "src_case_analysis",
        title: "Case walkthrough: the HBS instructor’s questions",
        kind: "Author’s analysis",
        influence: "Supporting",
        quote:
          "A strategic buyer values not only the asset’s profit but also the cost of closing a gap in its own portfolio and the risk of doing nothing.",
      },
    ],
  },

  generic: {
    verdict: (label) => `I cannot give an evidence-backed recommendation on “${label}”.`,
    verdictDetail: (label) =>
      `The library holds material on partnerships and selling a business, but no case describes a situation close enough to “${label}” with a confirmed outcome.`,
    evidenceNote: (drivers) =>
      `What drives the conclusion in this type of decision: ${drivers}. An evidence-backed recommendation needs at least one case with a similar dilemma in the library.`,
    argument: (driver) => `A key factor with nothing yet to compare it against: ${driver}.`,
    transferable: [
      "the logic of negotiating power and having alternatives applies to any strategic dilemma",
    ],
    nonTransferable: [
      "the specific deal structure and figures of the Dr. John's case do not apply to this type of decision",
    ],
    scenarios: {
      own: {
        name: "Act alone",
        speed: "Low",
        control: "High",
        risk: "Medium",
        when: "If time is not critical",
      },
      probe: {
        name: "A limited test of the hypothesis",
        speed: "High",
        control: "High",
        risk: "Low",
        when: "Before taking on a full commitment",
      },
      commit: {
        name: "Full commitment now",
        speed: "High",
        control: "Low",
        risk: "High",
        when: "Only with confirmed data",
      },
    },
    recommendation:
      "Collect the missing data below and, if possible, add a case with a similar dilemma to the library before treating a recommendation as a conclusion rather than a frame.",
    risks: [
      "the decision will be taken on a weak evidence base — with no relevant case to support it",
    ],
    changeFactors: [
      "a case with a similar dilemma appears in the library",
      "the missing data below is obtained",
    ],
    missingFallback: (drivers) => `data on the situation for the factors: ${drivers}`,
  },

  followUp: {
    patterns: {
      volume: /объём|гаранти|volume|guarantee|көлем|кепіл/i,
      exclusivity: /эксклюзив|сегмент|exclusiv|segment/i,
      horizon: /сценар|окно|срок|месяц|scenario|window|month|терезе|мерзім|ай/i,
      risk: /риск|risk|тәуекел/i,
    },
    volume: (firstTerm) =>
      `A guaranteed volume changes the risk arithmetic: part of the uncertainty that makes the conclusion cautious falls away. It is worth locking in as a separate deal term — alongside “${firstTerm}” — rather than as a verbal understanding. The conclusion and the scenario table above are already updated.`,
    fallbackTerm: "the other proposed terms",
    exclusivity:
      "Narrowing exclusivity to one segment or a shorter term reduces the rights the partner receives and makes that scenario less risky. The scenario table above is already updated — the logic of the recommendation does not change, only the price of the question does.",
    horizon: (scenarioName) =>
      `On that horizon the strongest option is still “${scenarioName}” — it was designed for a short market window rather than a long run.`,
    fallbackScenario: "the recommended option",
    risk: (firstRisk) =>
      `The key risk here: ${firstRisk}. The other factors on the risk list do not overturn the conclusion, but they are worth watching until signature.`,
    fallbackRisk: "the risk is described above",
    generic: (verdict) =>
      `That refines the terms but does not change the main conclusion: ${verdict} As soon as exact figures on this point appear, the recommendation should be recalculated rather than fitted to a conclusion already made.`,
  },

  negotiation: {
    partnership: [
      {
        title: "On the commercial contribution",
        questions: [
          "Which specific customers have already confirmed interest?",
          "Who is the decision-maker at each customer?",
          "What is the average deal cycle?",
          "What sales volume is the partner ready to guarantee?",
          "What happens if the plan is missed?",
        ],
      },
      {
        title: "On the stake",
        questions: [
          "Why is the partner’s contribution valued at exactly the stake proposed?",
          "Is the stake handed over at once or in stages?",
          "Against which KPIs does it vest?",
          "Can the stake be bought back?",
        ],
      },
      {
        title: "On exclusivity",
        questions: [
          "Which countries and customer segments does it cover?",
          "What is the condition for keeping the exclusivity?",
          "Does it lapse automatically if the KPIs are missed?",
        ],
      },
      {
        title: "On data and technology",
        questions: [
          "What data does the partner want to receive, and for what purpose?",
          "Can the partner train its own models on it?",
          "Who owns new developments?",
        ],
      },
    ],
    sale: [
      {
        title: "On price and deal structure",
        questions: [
          "On what basis does the buyer justify the price offered?",
          "Is part of the price contingent on future performance (earn-out)?",
          "How long does exclusivity of talks with this buyer last?",
        ],
      },
      {
        title: "On the team and the product",
        questions: [
          "What happens to the team after the deal?",
          "Will the brand and product survive in their current form?",
          "Are there commitments on further development of the product?",
        ],
      },
    ],
    genericTitle: (label) => `Questions to test the decision “${label}”`,
    genericQuestion: (driver) => `What exactly is known about: ${driver}?`,
  },

  shareholder: {
    preferredScenario: (recommendation) => `Preferred scenario: ${recommendation}`,
    evidenceLine: (level, note) => `Evidence level: ${level}. ${note}`,
  },

  thinkingSteps: [
    "Identifying the type of management decision",
    "Collecting the parameters of the situation from your answers",
    "Looking for relevant cases by meaning, not by keywords",
    "Assessing applicability and differences",
    "Forming the options, the recommendation and the risks",
  ],
  examples: [
    "We have an internal AI product. A partner offers to take it to market together. Should we agree?",
    "Should we enter the Uzbek market on our own or through a local partner?",
    "Should we sell our stake in a non-core asset now, or keep developing it?",
  ],
};
