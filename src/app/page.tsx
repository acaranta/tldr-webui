"use client";

import { useState, useEffect, useRef } from "react";
import { SearchBar } from "@/components/SearchBar";
import { PlatformSelector } from "@/components/PlatformSelector";
import { CommandDisplay } from "@/components/CommandDisplay";
import { useLang } from "@/components/LangContext";
import { type SearchPlatform, type CommandEntry, type PageResult } from "@/lib/types";
import { cn } from "@/lib/utils";

type SyncStatus = "syncing" | "ready" | "error";

export default function Home() {
  const { lang } = useLang();
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<SearchPlatform>("any");
  const [results, setResults] = useState<CommandEntry[]>([]);
  const [selectedCommand, setSelectedCommand] = useState<CommandEntry | null>(null);
  const [page, setPage] = useState<PageResult | null>(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("syncing");
  const debounceRef = useRef<NodeJS.Timeout>();

  // Track sync status so we can show contextual messages
  useEffect(() => {
    let interval: NodeJS.Timeout;
    async function check() {
      try {
        const res = await fetch("/api/sync-status");
        const data = await res.json();
        setSyncStatus(data.status);
        if (data.status === "ready" || data.status === "error") clearInterval(interval);
      } catch {
        setSyncStatus("error");
        clearInterval(interval);
      }
    }
    check();
    interval = setInterval(check, 3000);
    return () => clearInterval(interval);
  }, []);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSelectedCommand(null);
      setPage(null);
      return;
    }
    setSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/commands?q=${encodeURIComponent(query)}&platform=${platform}&lang=${lang}`
        );
        const data = await res.json();
        setResults(data);
        if (data.length > 0) {
          selectCommand(data[0]);
        } else {
          setSelectedCommand(null);
          setPage(null);
        }
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 200);
    return () => clearTimeout(debounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, platform, lang]);

  async function selectCommand(cmd: CommandEntry) {
    setSelectedCommand(cmd);
    setPageLoading(true);
    setPage(null);
    try {
      const res = await fetch(
        `/api/page?command=${encodeURIComponent(cmd.command)}&platform=${cmd.platform}&lang=${lang}`
      );
      if (res.ok) {
        setPage(await res.json());
      }
    } catch {
      // ignore
    } finally {
      setPageLoading(false);
    }
  }

  const hasQuery = query.trim().length > 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {hasQuery ? (
        /* Results layout */
        <div className="flex flex-1 min-h-0">
          {/* Left panel */}
          <div className="flex flex-col w-72 shrink-0 border-r border-border">
            <div className="p-3 border-b border-border bg-card/50">
              <SearchBar
                value={query}
                onChange={setQuery}
                placeholder="Search commands..."
                variant="compact"
                autoFocus
              />
            </div>
            <div className="px-3 py-2 border-b border-border overflow-x-auto">
              <PlatformSelector value={platform} onChange={setPlatform} />
            </div>
            <div className="flex-1 overflow-y-auto">
              {searching && results.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground font-mono animate-pulse">
                  Searching…
                </p>
              )}
              {!searching && results.length === 0 && (
                <div className="p-4 flex flex-col gap-1">
                  {syncStatus === "syncing" ? (
                    <>
                      <p className="text-sm text-amber-400 font-mono">Data is syncing…</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        tldr-pages is being downloaded. Try again in a moment.
                      </p>
                    </>
                  ) : syncStatus === "error" ? (
                    <>
                      <p className="text-sm text-destructive font-mono">Sync failed</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        Could not fetch tldr-pages. Check container logs.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground font-mono">
                      No commands found for &ldquo;{query}&rdquo;
                    </p>
                  )}
                </div>
              )}
              {results.map((cmd) => {
                const isActive =
                  selectedCommand?.command === cmd.command &&
                  selectedCommand?.platform === cmd.platform;
                return (
                  <button
                    key={`${cmd.command}:${cmd.platform}`}
                    onClick={() => selectCommand(cmd)}
                    className={cn(
                      "w-full text-left px-4 py-3 flex flex-col gap-0.5 transition-colors",
                      "border-b border-border/40",
                      isActive
                        ? "bg-primary/10 border-l-2 border-l-primary"
                        : "hover:bg-accent border-l-2 border-l-transparent"
                    )}
                  >
                    <span
                      className={cn(
                        "font-mono text-sm font-semibold",
                        isActive ? "text-primary" : "text-foreground"
                      )}
                    >
                      {cmd.command}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">
                      {cmd.platform}
                      {!cmd.hasTranslation && lang !== "en" && (
                        <span className="ml-1 text-amber-500/70">· EN</span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel */}
          <div className="flex-1 overflow-y-auto p-8">
            {pageLoading && (
              <p className="text-sm text-muted-foreground font-mono animate-pulse">
                Loading…
              </p>
            )}
            {!pageLoading && page && (
              <CommandDisplay
                content={page.content}
                fallback={page.fallback}
                platform={page.platform}
                lang={page.lang}
                selectedLang={lang}
              />
            )}
            {!pageLoading && !page && selectedCommand && (
              <p className="text-sm text-muted-foreground font-mono">
                Page not available
              </p>
            )}
          </div>
        </div>
      ) : (
        /* Hero state */
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="tldr logo"
                className="h-14 w-14 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <h1 className="text-4xl font-bold font-mono tracking-tight">
                tldr
              </h1>
            </div>
            <p className="text-muted-foreground text-lg max-w-md">
              Simplified man pages for 2000+ commands across all platforms
            </p>
          </div>

          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Search commands… try 'ls', 'git', 'curl'"
            variant="hero"
            className="w-full max-w-2xl"
            autoFocus
          />

          <PlatformSelector value={platform} onChange={setPlatform} />

          <p className="text-xs text-muted-foreground font-mono">
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">
              /
            </kbd>{" "}
            or{" "}
            <kbd className="px-1.5 py-0.5 rounded border border-border bg-secondary">
              Ctrl+K
            </kbd>{" "}
            to focus search
          </p>
        </div>
      )}
    </div>
  );
}
