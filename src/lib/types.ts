export const PLATFORMS = [
  "common",
  "linux",
  "osx",
  "windows",
  "android",
  "freebsd",
  "netbsd",
  "openbsd",
  "sunos",
  "cisco_ios",
] as const;

export type Platform = (typeof PLATFORMS)[number];

/** "any" is a UI-only search scope — not a real tldr folder */
export type SearchPlatform = Platform | "any";

export interface CommandEntry {
  command: string;
  platform: Platform;
  hasTranslation: boolean;
}

export interface PageResult {
  content: string;
  fallback: boolean;
  platform: Platform;
  lang: string;
}
