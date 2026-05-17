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

  // Initialise from the cookie / browser after mount. This must run in an
  // effect (not lazy useState) so the server and the first client render
  // both produce "en" and hydration matches — js-cookie and navigator are
  // client-only APIs.
  useEffect(() => {
    const saved = Cookies.get(COOKIE_LANG);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-shot client-only init
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
