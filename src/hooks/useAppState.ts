import { useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ScopeFilter } from "@/lib/search";
import { SEED_COUNCIL_SESSIONS, type CouncilSession } from "@/data/council";

export function useTheme() {
  const [dark, setDark] = useLocalStorage<boolean>("biaqyl:dark", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalStorage<string[]>("biaqyl:favourites", []);
  const toggle = useCallback(
    (id: string) =>
      setBookmarks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setBookmarks],
  );
  return { bookmarks, toggle };
}

export function useDismissed() {
  const [dismissed, setDismissed] = useLocalStorage<string[]>("biaqyl:dismissed", []);
  const dismiss = useCallback(
    (id: string) => setDismissed((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setDismissed],
  );
  return { dismissed, dismiss };
}

export function useScope() {
  return useLocalStorage<ScopeFilter>("biaqyl:mode", "ALL");
}

export function useCouncilSessions() {
  const [sessions, setSessions] = useLocalStorage<CouncilSession[]>(
    "biaqyl:council-sessions",
    SEED_COUNCIL_SESSIONS,
  );

  const create = useCallback(
    (session: CouncilSession) => setSessions((prev) => [session, ...prev]),
    [setSessions],
  );

  const markRead = useCallback(
    (id: string) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, unread: false } : s))),
    [setSessions],
  );

  return { sessions, create, markRead };
}

export function useHistory() {
  const [history, setHistory] = useLocalStorage<string[]>("biaqyl:history", []);
  const push = useCallback(
    (q: string) => {
      const value = q.trim();
      if (value.length < 3) return;
      setHistory((prev) => [value, ...prev.filter((x) => x !== value)].slice(0, 5));
    },
    [setHistory],
  );
  return { history, push, clear: () => setHistory([]) };
}

export interface StoredNote {
  id: string;
  text: string;
  date: string;
}

export function useNotes(cardId: string) {
  const [all, setAll] = useLocalStorage<Record<string, StoredNote[]>>("biaqyl:notes", {});
  const notes = all[cardId] ?? [];

  const add = useCallback(
    (text: string) => {
      const note: StoredNote = {
        id: `${Date.now()}`,
        text,
        date: new Date().toLocaleString("ru-RU"),
      };
      setAll((prev) => ({ ...prev, [cardId]: [note, ...(prev[cardId] ?? [])] }));
    },
    [cardId, setAll],
  );

  const remove = useCallback(
    (id: string) =>
      setAll((prev) => ({ ...prev, [cardId]: (prev[cardId] ?? []).filter((n) => n.id !== id) })),
    [cardId, setAll],
  );

  return { notes, add, remove };
}

export interface FeedbackEvent {
  id: string;
  type: "up" | "down" | "report";
  reason?: string;
  question: string;
  date: string;
}

export interface FeedbackStats {
  up: number;
  down: number;
  reports: number;
  reasons: Record<string, number>;
  events: FeedbackEvent[];
}

const EMPTY_STATS: FeedbackStats = { up: 0, down: 0, reports: 0, reasons: {}, events: [] };

/** Aggregated reader feedback per material — used by knowledge-base editors. */
export function useFeedback(cardId: string) {
  const [all, setAll] = useLocalStorage<Record<string, FeedbackStats>>("biaqyl:feedback", {});
  const stats = all[cardId] ?? EMPTY_STATS;

  const record = useCallback(
    (type: FeedbackEvent["type"], question: string, reason?: string) => {
      setAll((prev) => {
        const cur = prev[cardId] ?? EMPTY_STATS;
        const event: FeedbackEvent = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          type,
          reason,
          question,
          date: new Date().toLocaleString("ru-RU"),
        };
        return {
          ...prev,
          [cardId]: {
            up: cur.up + (type === "up" ? 1 : 0),
            down: cur.down + (type === "down" ? 1 : 0),
            reports: cur.reports + (type === "report" ? 1 : 0),
            reasons:
              type === "report" && reason
                ? { ...cur.reasons, [reason]: (cur.reasons[reason] ?? 0) + 1 }
                : cur.reasons,
            events: [event, ...cur.events].slice(0, 20),
          },
        };
      });
    },
    [cardId, setAll],
  );

  const reset = useCallback(
    () => setAll((prev) => ({ ...prev, [cardId]: EMPTY_STATS })),
    [cardId, setAll],
  );

  return { stats, record, reset };
}
