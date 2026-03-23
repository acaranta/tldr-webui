"use client";

import { ThemeToggle } from "./ThemeToggle";
import { LanguageSelector } from "./LanguageSelector";
import { useLang } from "./LangContext";

export function Navbar() {
  const { lang, setLang } = useLang();

  return (
    <header className="flex items-center gap-4 px-4 h-14 border-b border-border bg-card/80 backdrop-blur-sm shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="tldr logo" className="h-8 w-8 object-contain" />
        <span className="font-mono font-bold text-lg tracking-tight">tldr</span>
      </div>

      <div className="flex-1" />

      {/* Controls */}
      <div className="flex items-center gap-2">
        <LanguageSelector value={lang} onChange={setLang} />
        <ThemeToggle />
      </div>
    </header>
  );
}
