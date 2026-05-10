import { createContext, useContext } from "react";
import { t } from "@/i18n/index";

const I18nContext = createContext({ t, i18n: { language: "vi" } });

export function I18nProvider({ children }) {
  return (
    <I18nContext.Provider value={{ t, i18n: { language: "vi" } }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation(ns) {
  const ctx = useContext(I18nContext);
  return {
    t: (key, options) => ctx.t(key, { ...options, ns: ns || options?.ns }),
    i18n: ctx.i18n,
  };
}

export { I18nContext };
export default I18nProvider;
