import { useCallback, useEffect, useRef, useState } from "react";

/** Подписчики на ключ: один и тот же ключ читают несколько компонентов сразу. */
const listeners = new Map<string, Set<(value: unknown) => void>>();

export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const latest = useRef(value);
  latest.current = value;

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw !== null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, [key]);

  /**
   * Запись в одном компоненте должна тут же увидеться в остальных: кейс, созданный
   * в обработке файлов, обязан появиться в сетке дашборда, а не после перезагрузки.
   */
  useEffect(() => {
    const set = listeners.get(key) ?? new Set<(value: unknown) => void>();
    listeners.set(key, set);
    const notify = (next: unknown) => setValue(next as T);
    set.add(notify);
    return () => {
      set.delete(notify);
      if (set.size === 0) listeners.delete(key);
    };
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      // Предыдущее значение берём из хранилища, а не из состояния: оно общее и всегда
      // актуально, даже если в этом такте писал другой компонент.
      let prev = latest.current;
      try {
        const raw = window.localStorage.getItem(key);
        if (raw !== null) prev = JSON.parse(raw) as T;
      } catch {
        /* ignore */
      }
      const resolved = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      try {
        window.localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* ignore */
      }
      for (const notify of listeners.get(key) ?? []) notify(resolved);
    },
    [key],
  );

  return [value, update, hydrated] as const;
}
