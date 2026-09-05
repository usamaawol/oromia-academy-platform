import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { dictionaries, type Lang, type TranslationKey } from "./translations";

const STORAGE_KEY = "oa.lang";

type Ctx = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("om");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "om" || stored === "en") setLangState(stored);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang === "om" ? "om" : "en";
  }, [lang]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    window.localStorage.setItem(STORAGE_KEY, l);
  }, []);

  const t = useCallback(
    (key: TranslationKey, vars?: Record<string, string | number>) => {
      let value: string = dictionaries[lang][key] ?? dictionaries.om[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          value = value.replaceAll(`{${k}}`, String(v));
        }
      }
      return value;
    },
    [lang],
  );

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

/** Pick the right side of a bilingual field. */
export function localized(
  lang: Lang,
  om?: string | null,
  en?: string | null,
): string {
  if (lang === "om") return (om || en || "").trim();
  return (en || om || "").trim();
}

export type { Lang, TranslationKey };
