import type { KnowledgeCardData, Lang, MediaType, Scope } from "@/data/mockCards";

export interface Filters {
  mediaType: MediaType | "all";
  businessUnit: string | "all";
  language: Lang | "all";
  topics: string[];
}

export const emptyFilters: Filters = {
  mediaType: "all",
  businessUnit: "all",
  language: "all",
  topics: [],
};

function matchesTopics(card: KnowledgeCardData, topics: string[]) {
  if (topics.length === 0) return true;
  const haystack = [
    card.title,
    card.executive_summary,
    card.core_insight,
    card.tags.join(" "),
    card.business_unit,
  ]
    .join(" ")
    .toLowerCase();
  return topics.some((topic) => haystack.includes(topic.trim().toLowerCase()));
}

function score(card: KnowledgeCardData, q: string) {
  const query = q.trim().toLowerCase();
  if (!query) return card.relevance;
  const terms = query.split(/\s+/);
  const haystack = [
    card.title,
    card.executive_summary,
    card.core_insight,
    card.source,
    card.author,
    card.tags.join(" "),
    card.business_unit,
  ]
    .join(" ")
    .toLowerCase();

  let hits = 0;
  for (const t of terms) {
    if (card.title.toLowerCase().includes(t)) hits += 3;
    else if (haystack.includes(t)) hits += 1;
  }
  if (hits === 0) return -1;
  return Math.min(99, card.relevance + hits * 2);
}

export interface SearchResult extends KnowledgeCardData {
  matchScore: number;
}

/** Scope selector used in the UI: both libraries or one of them. */
export type ScopeFilter = Scope | "ALL";

export function searchCards(
  cards: KnowledgeCardData[],
  query: string,
  scope: ScopeFilter,
  filters: Filters,
  onlyBookmarked?: string[] | null,
): SearchResult[] {
  return cards
    .filter((c) => (scope === "ALL" ? true : c.scope === scope))
    .filter((c) => (filters.mediaType === "all" ? true : c.media_type === filters.mediaType))
    .filter((c) =>
      filters.businessUnit === "all" ? true : c.business_unit === filters.businessUnit,
    )
    .filter((c) => (filters.language === "all" ? true : c.language === filters.language))
    .filter((c) => matchesTopics(c, filters.topics))
    .filter((c) => (onlyBookmarked ? onlyBookmarked.includes(c.id) : true))
    .map((c) => ({ ...c, matchScore: score(c, query) }))
    .filter((c) => c.matchScore >= 0)
    .sort((a, b) => b.matchScore - a.matchScore);
}

export const LANGUAGES = ["RU", "EN", "KK", "UZ", "AZ"] as const;
