import type { CardTexts } from "./types";

/** English text for every knowledge card. `language` on the card marks the original. */
export const cardsEn: CardTexts = {
  card_001: {
    title: "Framework: Risk Management Maturity Model",
    executive_summary:
      "A four-level model for assessing risk-management maturity: from reactive to proactive.",
    core_insight: "Companies at levels 3–4 show 35% lower losses from operational risk.",
    framework: [
      { step: "1. Assess", description: "Assess the current state of risk-management processes" },
      { step: "2. Map", description: "Identify critical risk areas and their owners" },
      { step: "3. Control", description: "Put controls and regular monitoring in place" },
      { step: "4. Optimize", description: "Automate signal collection and optimise the response" },
    ],
    anchors: [
      "Company Z business report (2024, p. 15)",
      "McKinsey Report: Enterprise Risk Management",
    ],
    author: "Risk Management Office",
  },
  card_002: {
    title: "Lessons from rolling out BIM on large sites",
    executive_summary:
      "A synthesis of 14 projects: where a BIM model genuinely saves time, and where it becomes an expensive formality.",
    core_insight:
      "The saving only appears when contractors maintain the model rather than the project office: −18% rework.",
    framework: [
      {
        step: "1. Contract",
        description: "The duty to maintain the model is written into the contractor’s contract",
      },
      { step: "2. Standard", description: "One shared classifier and a weekly model update cycle" },
      { step: "3. Control", description: "Clashes are resolved before work reaches the site" },
    ],
    anchors: [
      "Lessons Learned: Severny residential complex, section 4",
      "Technical supervision report Q3 2024",
      "Interview with the construction manager",
    ],
    source: "Lessons Learned BI",
    author: "Project office",
  },
  card_003: {
    title: "HBS Case: Amazon's Two-Pizza Teams",
    executive_summary: "How capping team size changes decision speed and ownership of the outcome.",
    core_insight:
      "Autonomy without clear interfaces between teams turns into chaos — the API contract matters more than the headcount.",
    framework: [
      { step: "1. Ownership", description: "One team — one service and one measurable outcome" },
      { step: "2. Interface", description: "Teams interact only through explicit contracts" },
      { step: "3. Metrics", description: "The team sees its own metrics in real time" },
    ],
    anchors: ["HBS Case 9-716-402, p. 7", "Working Backwards, ch. 3"],
  },
  card_004: {
    title: "Digital transformation: why 70% of programmes stall",
    executive_summary:
      "A meta-review of the research: the main causes of failure are not technology but the absence of a change owner.",
    core_insight:
      "Programmes with a dedicated CxO sponsor and quarterly kill-points succeed 2.4× more often.",
    anchors: ["BCG: Digital Transformation Survey 2024", "MIT Sloan Review, Winter 2024"],
    source: "External research library",
  },
  card_005: {
    title: "Podcast: how we cut the procurement cycle from 45 days to 19",
    executive_summary:
      "A walkthrough of an internal procurement case: three bottlenecks and the fixes that worked.",
    core_insight:
      "80% of the delay came from incomplete specifications on the way in, not from approvals.",
    framework: [
      {
        step: "1. Spec template",
        description: "A mandatory completeness checklist before a request is registered",
      },
      {
        step: "2. Parallel review",
        description: "Legal and technical review run at the same time",
      },
      { step: "3. SLA", description: "Explicit deadlines per step and escalation when they slip" },
    ],
    anchors: ["“Inside BI” podcast, episode 12, 14:20", "Procurement report, 2025"],
    source: "Lessons Learned BI",
    author: "Procurement",
  },
  card_006: {
    title: "Innovation Portfolio: the 70-20-10 rule",
    executive_summary:
      "How to split investment between the core, adjacent moves and breakthrough bets.",
    core_insight:
      "Companies that hold 10% on breakthrough bets for 5+ years deliver 30% higher TSR.",
    framework: [
      { step: "70% Core", description: "Improving the current business" },
      { step: "20% Adjacent", description: "Adjacent markets and products" },
      { step: "10% Transformational", description: "Breakthrough bets on a long horizon" },
    ],
    anchors: ["HBR: Managing Your Innovation Portfolio", "Google X: Moonshot Principles"],
  },
  card_007: {
    title: "Risk management: a practical checklist",
    executive_summary: "A short checklist for identifying and controlling risk at project level.",
    core_insight: "With no risk owner assigned, 60% of the measures are never carried out.",
    anchors: ["Internal methodology, 2025, p. 8"],
    source: "Lessons Learned BI",
    author: "Regional office",
  },
  card_008: {
    title: "Video walkthrough: negotiating with a major supplier",
    executive_summary:
      "A recording of an internal training session: preparing a BATNA and handling price pressure.",
    core_insight:
      "The strongest lever is an alternative worked out in advance, not a negotiating technique.",
    framework: [
      { step: "1. BATNA", description: "Work out the best alternative before the meeting" },
      { step: "2. Anchor", description: "The first offer rests on market data" },
      { step: "3. Trade", description: "Concessions only in exchange for something in return" },
    ],
    anchors: ["“Negotiation” training, 32:10", "Getting to Yes, ch. 6"],
    source: "Corporate university",
    author: "BI Academy",
  },
  card_009: {
    title: "Netflix Culture Deck: context, not control",
    executive_summary: "How to replace process control with shared context and a high hiring bar.",
    core_insight:
      "Freedom only works at high talent density — otherwise the cost of mistakes grows.",
    anchors: ["Netflix Culture Deck, slide 45", "No Rules Rules, ch. 2"],
    source: "External library",
  },
  card_010: {
    title: "Cost: 6 drivers of variance on site",
    executive_summary: "Analysis of 30 sites: where actual cost most often drifts away from plan.",
    core_insight:
      "Half of the variance comes from idle equipment — managing the schedule matters more than haggling over material prices.",
    framework: [
      { step: "1. Record", description: "Daily actuals for equipment and crews" },
      { step: "2. Analyse", description: "A weekly review of the top 3 variances" },
      { step: "3. Respond", description: "A decision with an owner and a deadline the same day" },
    ],
    anchors: [
      "Planning & economics analytics, 2025",
      "Lessons Learned: Vostok-3 site",
      "Interview with the site foreman, 07:40",
    ],
    source: "Lessons Learned BI",
    author: "Planning & economics",
  },
  card_011: {
    title: "Toyota Production System: flow, not utilisation",
    executive_summary:
      "The lean classic: why optimising the utilisation of individual stations breaks the flow.",
    core_insight:
      "Local efficiency at one station almost always increases the total lead time of the order.",
    framework: [
      { step: "1. Value stream", description: "Map the value stream" },
      { step: "2. Pull", description: "Move to pull instead of planning utilisation" },
      { step: "3. Kaizen", description: "Small weekly improvements on the floor" },
    ],
    anchors: ["The Toyota Way, ch. 8", "Lean Thinking, p. 112"],
    source: "Book library",
  },
  card_012: {
    title: "Digital transformation: a regional office’s experience",
    executive_summary: "Practical conclusions from digitising document flow at a regional office.",
    core_insight: "Digitising a process before simplifying it raises the cost by a factor of 1.5.",
    anchors: ["Internal report, 2025, section 4"],
    source: "Lessons Learned BI",
    author: "Regional office",
  },
  card_013: {
    title: "Leadership in a crisis: the first 72 hours",
    executive_summary:
      "What a leader does in the first three days after a serious failure — from incident reviews.",
    core_insight:
      "Early honest communication reduces reputational damage more than the speed of the decision itself.",
    framework: [
      { step: "1. Facts", description: "Assemble a verified picture with no guesswork" },
      { step: "2. Voice", description: "One spokesperson, regular updates" },
      { step: "3. Decision", description: "Explicit steps, deadlines and owners" },
      { step: "4. Review", description: "A post-mortem with no hunt for the guilty" },
    ],
    anchors: ["HBR: Leadership in a Crisis", "Incident review 2024-07"],
    source: "External library",
  },
  card_014: {
    title: "How to retain engineers: three years of data",
    executive_summary:
      "Attrition analysis: money is only the third most important reason engineers leave.",
    core_insight: "First is the quality of the direct manager, second is a clear growth path.",
    anchors: ["HR analytics 2022–2025", "Exit interviews, summary"],
    author: "HR department",
  },
  card_015: {
    title: "Pricing Power: three ways to raise price without losing the customer",
    executive_summary: "A review of pricing practice in mature, highly competitive markets.",
    core_insight: "A segmented offer earns more than a linear 3–5% list-price increase.",
    framework: [
      { step: "1. Segment", description: "Split customers by price sensitivity" },
      { step: "2. Package", description: "Assemble packages at different value levels" },
      { step: "3. Test", description: "Test on a limited sample" },
    ],
    anchors: ["Monetizing Innovation, ch. 5", "Simon-Kucher Global Pricing Study"],
    source: "Book library",
  },
  card_016: {
    title: "Risk management: a project-level approach",
    executive_summary: "A short guide to registering and monitoring risk for a project team.",
    core_insight: "A risk register that is not updated weekly goes stale within two months.",
    anchors: ["Internal methodology, 2025"],
    source: "Lessons Learned BI",
    author: "Regional office",
  },
  card_017: {
    title: "Video lecture: the economics of a development project",
    executive_summary: "The basic development cash-flow model and its sensitivity to sales timing.",
    core_insight:
      "Pushing the sales launch back by a quarter hits IRR harder than a 5% rise in cost.",
    framework: [
      { step: "1. Model", description: "Build a month-by-month cash flow" },
      { step: "2. Scenarios", description: "Test three sales-rate scenarios" },
      { step: "3. Triggers", description: "Define the points at which strategy is revisited" },
    ],
    anchors: ["“Development economics” lecture, 21:05", "Financial model, IRR sheet"],
    source: "Corporate university",
    author: "BI Academy",
  },
  card_018: {
    title: "Playing to Win: the choice of where not to play",
    executive_summary:
      "Strategy as a cascade of five interlocking choices — from aspiration to management systems.",
    core_insight:
      "A strategy with no explicit segments given up is not a strategy but a wish list.",
    framework: [
      { step: "1. Winning aspiration", description: "What winning means" },
      { step: "2. Where to play", description: "Where we play and where we do not" },
      { step: "3. How to win", description: "What we win on" },
      { step: "4. Capabilities", description: "Which capabilities are required" },
      { step: "5. Systems", description: "Which systems support the choice" },
    ],
    anchors: ["Playing to Win, ch. 1", "HBS Case: P&G Strategy"],
  },
  card_019: {
    title: "Podcast: how the innovation pipeline works in industry",
    executive_summary:
      "A conversation with a plant director about how workers’ ideas reach implementation.",
    core_insight:
      "An idea gets implemented when it has a budget of up to ₸1m with no approval from above.",
    anchors: ["“Production” podcast, episode 6, 09:15"],
    source: "Lessons Learned BI",
    author: "Plant management",
  },
  card_020: {
    title: "Change Management: the ADKAR model in practice",
    executive_summary:
      "The five states an employee passes through during change, and the typical mistake at each.",
    core_insight:
      "Most programmes teach the skill (Ability) without first building Awareness of the need.",
    framework: [
      { step: "Awareness", description: "Understanding why the change is needed" },
      { step: "Desire", description: "Personal motivation to take part" },
      { step: "Knowledge", description: "Knowing exactly how to change" },
      { step: "Ability", description: "Being able to apply it in practice" },
      { step: "Reinforcement", description: "Locking the result in" },
    ],
    anchors: ["Prosci ADKAR Model, p. 22", "HBR: Why Transformations Fail"],
    source: "External library",
  },
  card_021: {
    title: "Data-driven decisions: the minimum metric set for a board",
    executive_summary:
      "Which 9 indicators are actually used at the weekly committee, and why the rest are noise.",
    core_insight:
      "A dashboard with more than 12 metrics stops influencing decisions — attention scatters.",
    anchors: ["Committee minutes, 2025", "Measure What Matters, ch. 4"],
    source: "Lessons Learned BI",
    author: "Analytics centre",
  },
  card_022: {
    title: "Blue Ocean Strategy: the eliminate–reduce–raise–create grid",
    executive_summary:
      "A tool for rebuilding the value proposition without competing head-on on price.",
    core_insight:
      "New value more often comes from dropping the industry’s habitual attributes than from adding new ones.",
    framework: [
      { step: "Eliminate", description: "Which habitual attributes can be dropped" },
      { step: "Reduce", description: "What to take below the industry standard" },
      { step: "Raise", description: "What to lift above the standard" },
      { step: "Create", description: "What to create that the industry never had" },
    ],
    anchors: ["Blue Ocean Strategy, ch. 2", "INSEAD Case Study"],
    source: "Book library",
  },
};
