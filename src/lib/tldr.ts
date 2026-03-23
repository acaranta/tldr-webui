import fs from "fs";
import path from "path";
import { getLangDir } from "./languages";
import { PLATFORMS, type Platform, type SearchPlatform, type CommandEntry, type PageResult } from "./types";

export { PLATFORMS, type Platform, type SearchPlatform, type CommandEntry, type PageResult };

const TLDR_BASE = process.env.TLDR_PATH || "/tldr-pages";

function tldrReady(): boolean {
  return fs.existsSync(path.join(TLDR_BASE, ".git"));
}

function getPagePath(command: string, platform: Platform, langDir: string): string {
  return path.join(TLDR_BASE, langDir, platform, `${command}.md`);
}

export function searchCommands(
  query: string,
  platform: SearchPlatform = "common",
  lang: string = "en",
  limit = 50
): CommandEntry[] {
  if (!tldrReady()) return [];

  const langDir = getLangDir(lang);
  const results: CommandEntry[] = [];
  const seen = new Set<string>();
  const q = query.toLowerCase();

  // "any" searches every platform; specific platform searches only that platform
  const platformsToSearch: Platform[] =
    platform === "any" ? [...PLATFORMS] : [platform];

  for (const plt of platformsToSearch) {
    for (const dir of [langDir, "pages"]) {
      const dirPath = path.join(TLDR_BASE, dir, plt);
      if (!fs.existsSync(dirPath)) continue;

      try {
        const files = fs.readdirSync(dirPath);
        for (const file of files) {
          if (!file.endsWith(".md")) continue;
          const cmd = file.slice(0, -3);
          if (!cmd.includes(q)) continue;
          const key = `${cmd}:${plt}`;
          if (seen.has(key)) continue;
          seen.add(key);
          results.push({
            command: cmd,
            platform: plt,
            hasTranslation: dir === langDir,
          });
          if (results.length >= limit) return results.sort(sortCommands(q));
        }
      } catch {
        // ignore unreadable dirs
      }
    }
  }

  return results.sort(sortCommands(q)).slice(0, limit);
}

function sortCommands(query: string) {
  return (a: CommandEntry, b: CommandEntry) => {
    const aExact = a.command === query ? -1 : 0;
    const bExact = b.command === query ? -1 : 0;
    if (aExact !== bExact) return aExact - bExact;
    const aStarts = a.command.startsWith(query) ? -1 : 0;
    const bStarts = b.command.startsWith(query) ? -1 : 0;
    if (aStarts !== bStarts) return aStarts - bStarts;
    return a.command.localeCompare(b.command);
  };
}

export function readPage(
  command: string,
  platform: Platform,
  lang: string
): PageResult | null {
  if (!tldrReady()) return null;

  const langDir = getLangDir(lang);
  const platformsToTry: Platform[] =
    platform === "common" ? ["common"] : [platform, "common"];

  // Try translated version first
  for (const plt of platformsToTry) {
    const p = getPagePath(command, plt, langDir);
    if (fs.existsSync(p)) {
      return {
        content: fs.readFileSync(p, "utf-8"),
        fallback: false,
        platform: plt,
        lang,
      };
    }
  }

  // Fallback to English
  if (lang !== "en") {
    for (const plt of platformsToTry) {
      const p = getPagePath(command, plt, "pages");
      if (fs.existsSync(p)) {
        return {
          content: fs.readFileSync(p, "utf-8"),
          fallback: true,
          platform: plt,
          lang: "en",
        };
      }
    }
  }

  return null;
}

export function isTldrReady(): boolean {
  return tldrReady();
}
