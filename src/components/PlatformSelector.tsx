"use client";

import { useEffect, useRef } from "react";
import { PLATFORMS, type SearchPlatform } from "@/lib/types";
import { cn } from "@/lib/utils";

interface PlatformSelectorProps {
  value: SearchPlatform;
  onChange: (platform: SearchPlatform) => void;
}

const PLATFORM_LABELS: Record<SearchPlatform, string> = {
  any: "any",
  common: "common",
  linux: "linux",
  osx: "macos",
  windows: "windows",
  android: "android",
  freebsd: "freebsd",
  netbsd: "netbsd",
  openbsd: "openbsd",
  sunos: "sunos",
  cisco_ios: "cisco",
};

const ALL_PLATFORMS: SearchPlatform[] = [
  "any",
  "common",
  ...(PLATFORMS.filter((p) => p !== "common") as SearchPlatform[]).sort((a, b) =>
    PLATFORM_LABELS[a].localeCompare(PLATFORM_LABELS[b])
  ),
];

export function PlatformSelector({ value, onChange }: PlatformSelectorProps) {
  const activeRef = useRef<HTMLButtonElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Translate vertical wheel into horizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onWheel(e: WheelEvent) {
      if (e.deltaY === 0) return;
      e.preventDefault();
      el!.scrollLeft += e.deltaY;
    }
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // Scroll the active button into view whenever the selection changes
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [value]);

  return (
    <div ref={scrollRef} className="flex items-center gap-1 overflow-x-auto no-scrollbar">
      {ALL_PLATFORMS.map((platform) => {
        const isActive = value === platform;
        return (
          <button
            key={platform}
            ref={isActive ? activeRef : null}
            onClick={() => onChange(platform)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
            )}
          >
            {PLATFORM_LABELS[platform]}
          </button>
        );
      })}
    </div>
  );
}
