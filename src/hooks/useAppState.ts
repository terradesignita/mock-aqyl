import { useCallback, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { ScopeFilter } from "@/lib/search";
import {
  SEED_COUNCIL_SESSIONS,
  type CouncilChatMessage,
  type CouncilSession,
} from "@/data/council";
import type { AdvisorSelection, FollowUpFlags } from "@/data/advisor";

export function useTheme() {
  const [dark, setDark] = useLocalStorage<boolean>("biaqyl:dark", false);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  return { dark, toggle: () => setDark((d) => !d) };
}

/** Generic localStorage-backed set of ids, toggled in/out — shared by any "which ids are
 *  flagged" state (bookmarks, private cards, ...) that only differs by storage key. */
function useToggleSet(key: string) {
  const [items, setItems] = useLocalStorage<string[]>(key, []);
  const toggle = useCallback(
    (id: string) =>
      setItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])),
    [setItems],
  );
  return { items, toggle };
}

export function useBookmarks() {
  const { items: bookmarks, toggle } = useToggleSet("biaqyl:favourites");
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

/** Card visibility toggle (Общий/Приватный) — separate from `scope` (internal/external origin). */
export function usePrivateCards() {
  const { items: privateIds, toggle } = useToggleSet("biaqyl:private-cards");
  return { privateIds, toggle };
}

export function useScope() {
  return useLocalStorage<ScopeFilter>("biaqyl:mode", "ALL");
}

/** "Больше не показывать" onboarding modals explaining the Кейс/Материал entities. */
export function useOnboardingSeen() {
  return useLocalStorage<boolean>("biaqyl:onboarding-seen", false);
}

/** Per-card title override — lets the user rename a card without mutating the mock data. */
export function useCardTitle(cardId: string, fallback: string) {
  const [overrides, setOverrides] = useLocalStorage<Record<string, string>>(
    "biaqyl:card-titles",
    {},
  );
  const rename = useCallback(
    (title: string) => setOverrides((prev) => ({ ...prev, [cardId]: title })),
    [cardId, setOverrides],
  );
  return { title: overrides[cardId] ?? fallback, rename };
}

export function useCouncilSessions() {
  const [sessions, setSessions] = useLocalStorage<CouncilSession[]>(
    "biaqyl:council-sessions:v3",
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

  const updatePersonas = useCallback(
    (id: string, personaIds: string[]) =>
      setSessions((prev) => prev.map((s) => (s.id === id ? { ...s, personaIds } : s))),
    [setSessions],
  );

  const addMessages = useCallback(
    (id: string, newMessages: CouncilChatMessage[]) =>
      setSessions((prev) =>
        prev.map((s) => (s.id === id ? { ...s, messages: [...s.messages, ...newMessages] } : s)),
      ),
    [setSessions],
  );

  const toggleReaction = useCallback(
    (sessionId: string, messageId: string, emoji: string) =>
      setSessions((prev) =>
        prev.map((s) =>
          s.id !== sessionId
            ? s
            : {
                ...s,
                messages: s.messages.map((m) => {
                  if (m.id !== messageId) return m;
                  const active = m.reactions ?? [];
                  const next = active.includes(emoji)
                    ? active.filter((e) => e !== emoji)
                    : [...active, emoji];
                  return { ...m, reactions: next };
                }),
              },
        ),
      ),
    [setSessions],
  );

  const remove = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  );

  return { sessions, create, markRead, updatePersonas, addMessages, toggleReaction, remove };
}

/** §32-34 ТЗ AI-советника — сохранённый разбор ситуации, чтобы вернуться к нему после переговоров. */
export interface AdvisorSession {
  id: string;
  title: string;
  date: string;
  query: string;
  selection: AdvisorSelection;
  thread: { author: "user" | "advisor"; text: string }[];
  followUpFlags: FollowUpFlags;
}

export function useAdvisorSessions() {
  const [sessions, setSessions] = useLocalStorage<AdvisorSession[]>("biaqyl:advisor-sessions", []);

  const save = useCallback(
    (session: Omit<AdvisorSession, "id" | "date">) => {
      const entry: AdvisorSession = {
        ...session,
        id: `advisor-${Date.now()}`,
        date: new Date().toLocaleString("ru-RU"),
      };
      setSessions((prev) => [entry, ...prev]);
      return entry;
    },
    [setSessions],
  );

  const remove = useCallback(
    (id: string) => setSessions((prev) => prev.filter((s) => s.id !== id)),
    [setSessions],
  );

  return { sessions, save, remove };
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

/** Пользовательский файл, добавленный в кейс: то, что после обработки хранил бы бэкенд. */
export interface UploadedSource {
  id: string;
  title: string;
  format: string;
  size: string;
  date: string;
  /** Имя исходного файла — название материала выведено из содержимого, а не из него. */
  fileName?: string;
  /** Начало текста, если формат читается в браузере. */
  excerpt?: string;
}

export interface CardSourceState {
  /** null — пользователь ещё не менял выбор, значит выбраны все источники. */
  selected: string[] | null;
  renames: Record<string, string>;
  removed: string[];
  uploads: UploadedSource[];
}

const EMPTY_SOURCE_STATE: CardSourceState = {
  selected: null,
  renames: {},
  removed: [],
  uploads: [],
};

/**
 * Состояние панели источников кейса: выбор, переименования, удаления и загрузки.
 * Всё переживает перезагрузку — иначе выбор контекста и правки исчезают при F5 (BUG-24).
 */
export function useCardSources(cardId: string, allIds: string[]) {
  const [all, setAll, hydrated] = useLocalStorage<Record<string, CardSourceState>>(
    "biaqyl:card-sources",
    {},
  );
  const state = { ...EMPTY_SOURCE_STATE, ...(all[cardId] ?? {}) };

  const patch = useCallback(
    (next: (prev: CardSourceState) => CardSourceState) =>
      setAll((prev) => ({
        ...prev,
        [cardId]: next({ ...EMPTY_SOURCE_STATE, ...(prev[cardId] ?? {}) }),
      })),
    [cardId, setAll],
  );

  // Живые источники = исходные кейса + загруженные пользователем, минус удалённые.
  const liveIds = [...allIds, ...state.uploads.map((u) => u.id)].filter(
    (id) => !state.removed.includes(id),
  );
  const selected = (state.selected ?? allIds).filter((id) => liveIds.includes(id));

  const toggle = useCallback(
    (id: string) =>
      patch((prev) => {
        const base = prev.selected ?? allIds;
        return {
          ...prev,
          selected: base.includes(id) ? base.filter((x) => x !== id) : [...base, id],
        };
      }),
    [patch, allIds],
  );

  const toggleAll = useCallback(
    () =>
      patch((prev) => {
        const live = [...allIds, ...prev.uploads.map((u) => u.id)].filter(
          (id) => !prev.removed.includes(id),
        );
        const base = (prev.selected ?? allIds).filter((id) => live.includes(id));
        return { ...prev, selected: base.length === live.length ? [] : live };
      }),
    [patch, allIds],
  );

  const rename = useCallback(
    (id: string, title: string) =>
      patch((prev) => ({ ...prev, renames: { ...prev.renames, [id]: title } })),
    [patch],
  );

  const removeSource = useCallback(
    (id: string) =>
      patch((prev) => ({
        ...prev,
        removed: prev.removed.includes(id) ? prev.removed : [...prev.removed, id],
        selected: (prev.selected ?? allIds).filter((x) => x !== id),
        uploads: prev.uploads.filter((u) => u.id !== id),
      })),
    [patch, allIds],
  );

  const addUploads = useCallback(
    (files: Omit<UploadedSource, "id" | "date">[]) => {
      const created = files.map((f, i) => ({
        ...f,
        id: `upload_${Date.now()}_${i}`,
        date: new Date().toLocaleDateString("ru-RU"),
      }));
      patch((prev) => ({
        ...prev,
        uploads: [...prev.uploads, ...created],
        selected: [...(prev.selected ?? allIds), ...created.map((c) => c.id)],
      }));
      return created;
    },
    [patch, allIds],
  );

  return {
    selected,
    renames: state.renames,
    removed: state.removed,
    uploads: state.uploads,
    hydrated,
    toggle,
    toggleAll,
    rename,
    removeSource,
    addUploads,
  };
}

/** Незавершённая консультация советника — восстанавливается после перезагрузки (BUG-03). */
export interface AdvisorDraft {
  query: string;
  stage: "clarify" | "understanding" | "answer";
  qIndex: number;
  selection: AdvisorSelection;
  thread: { author: "user" | "advisor"; text: string }[];
  followUpFlags: FollowUpFlags;
  savedAt: string;
}

export function useAdvisorDraft() {
  const [draft, setDraft, hydrated] = useLocalStorage<AdvisorDraft | null>(
    "biaqyl:advisor-draft",
    null,
  );
  const clear = useCallback(() => setDraft(null), [setDraft]);
  return { draft, setDraft, clear, hydrated };
}

/** Тип действия в журнале активности — из него считаются метрики на экране настроек. */
export type ActivityType = "question" | "artifact" | "upload" | "advisor" | "council" | "note";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  /** Unix-время: по нему строится разбивка по дням. */
  at: number;
  label: string;
}

/** Сколько событий храним — журнал нужен для агрегатов, не для аудита. */
const ACTIVITY_LIMIT = 200;

/**
 * Журнал действий пользователя. В продукте это события на сервере; здесь —
 * локальная запись, но цифры на экране метрик настоящие, а не заглушка из нулей.
 */
export function useActivity() {
  const [events, setEvents, hydrated] = useLocalStorage<ActivityEvent[]>("biaqyl:activity", []);

  const log = useCallback(
    (type: ActivityType, label: string) =>
      setEvents((prev) =>
        [
          {
            id: `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            type,
            at: Date.now(),
            label,
          },
          ...prev,
        ].slice(0, ACTIVITY_LIMIT),
      ),
    [setEvents],
  );

  const clear = useCallback(() => setEvents([]), [setEvents]);

  return { events, log, clear, hydrated };
}

/** Все сохранённые оценки и жалобы по всем материалам — сводка для редакторов базы. */
export function useAllFeedback() {
  const [all, , hydrated] = useLocalStorage<Record<string, FeedbackStats>>("biaqyl:feedback", {});

  const totals = Object.values(all).reduce(
    (acc, s) => {
      acc.up += s.up;
      acc.down += s.down;
      acc.reports += s.reports;
      for (const [reason, count] of Object.entries(s.reasons)) {
        acc.reasons[reason] = (acc.reasons[reason] ?? 0) + count;
      }
      return acc;
    },
    { up: 0, down: 0, reports: 0, reasons: {} as Record<string, number> },
  );

  return { totals, byCard: all, hydrated };
}
