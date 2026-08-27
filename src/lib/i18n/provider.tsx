import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { BCP47, I18nContext, dictionaryFor, isLocale, type Locale } from "@/lib/i18n";

/**
 * Локаль хранится в браузере и применяется после гидратации: серверный HTML
 * рендерится по-русски, поэтому первый кадр совпадает у сервера и клиента.
 */
export function I18nProvider({ children }: { children: ReactNode }) {
  const [stored, setStored] = useLocalStorage<string>("biaqyl:locale", "ru");
  const locale: Locale = isLocale(stored) ? stored : "ru";

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((next: Locale) => setStored(next), [setStored]);

  const value = useMemo(
    () => ({
      locale,
      t: dictionaryFor(locale),
      setLocale,
      formatDate: (v: Date | number | string) => new Date(v).toLocaleDateString(BCP47[locale]),
      formatDateTime: (v: Date | number | string) => new Date(v).toLocaleString(BCP47[locale]),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}
