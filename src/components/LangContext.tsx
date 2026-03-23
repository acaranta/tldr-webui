"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import Cookies from "js-cookie";
import { detectBrowserLanguage } from "@/lib/languages";

const COOKIE_LANG = "tldr_lang";

interface LangContextValue {
  lang: string;
  setLang: (lang: string) => void;
}

const LangContext = createContext<LangContextValue>({ lang: "en", setLang: () => {} });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");

  useEffect(() => {
    const saved = Cookies.get(COOKIE_LANG);
    setLangState(saved ?? detectBrowserLanguage());
  }, []);

  function setLang(newLang: string) {
    setLangState(newLang);
    Cookies.set(COOKIE_LANG, newLang, { expires: 365, path: "/" });
  }

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
