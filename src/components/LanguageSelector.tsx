"use client";

import { Globe } from "lucide-react";
import { LANGUAGES } from "@/lib/languages";
import { cn } from "@/lib/utils";

interface LanguageSelectorProps {
  value: string;
  onChange: (lang: string) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  const current = LANGUAGES.find((l) => l.code === value);

  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none cursor-pointer pl-7 pr-3 py-1.5 rounded-md text-xs font-mono font-semibold",
          "bg-secondary text-muted-foreground border border-border",
          "hover:text-foreground hover:border-primary/50 transition-colors",
          "focus:outline-none focus:ring-1 focus:ring-primary"
        )}
        aria-label="Select language"
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.code.toUpperCase()} – {lang.name}
          </option>
        ))}
      </select>
      <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
    </div>
  );
}
