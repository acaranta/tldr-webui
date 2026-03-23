"use client";

import { useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  variant?: "hero" | "compact";
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search commands...",
  className,
  autoFocus,
  variant = "compact",
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Global keyboard shortcut: / or Ctrl+K to focus
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
      if (e.key === "/" || (e.ctrlKey && e.key === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isHero = variant === "hero";

  return (
    <div
      className={cn(
        "relative flex items-center gap-2 rounded-xl border transition-colors",
        "bg-card border-border focus-within:border-primary/60",
        isHero ? "px-5 py-3.5" : "px-3 py-2",
        className
      )}
    >
      <Search
        className={cn(
          "shrink-0 text-primary",
          isHero ? "h-5 w-5" : "h-4 w-4"
        )}
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className={cn(
          "flex-1 bg-transparent font-mono outline-none placeholder:text-muted-foreground",
          isHero ? "text-base" : "text-sm"
        )}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className={isHero ? "h-5 w-5" : "h-4 w-4"} />
        </button>
      )}
      {!value && !isHero && (
        <kbd className="hidden sm:flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-xs font-mono bg-secondary text-muted-foreground border border-border">
          /
        </kbd>
      )}
    </div>
  );
}
