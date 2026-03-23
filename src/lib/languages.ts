export interface Language {
  code: string;
  name: string;
  dir: string; // folder name in tldr repo
}

export const LANGUAGES: Language[] = [
  { code: "en", name: "English", dir: "pages" },
  { code: "ar", name: "العربية", dir: "pages.ar" },
  { code: "bg", name: "Български", dir: "pages.bg" },
  { code: "bn", name: "বাংলা", dir: "pages.bn" },
  { code: "bs", name: "Bosanski", dir: "pages.bs" },
  { code: "ca", name: "Català", dir: "pages.ca" },
  { code: "cs", name: "Čeština", dir: "pages.cs" },
  { code: "da", name: "Dansk", dir: "pages.da" },
  { code: "de", name: "Deutsch", dir: "pages.de" },
  { code: "el", name: "Ελληνικά", dir: "pages.el" },
  { code: "es", name: "Español", dir: "pages.es" },
  { code: "fa", name: "فارسی", dir: "pages.fa" },
  { code: "fi", name: "Suomi", dir: "pages.fi" },
  { code: "fr", name: "Français", dir: "pages.fr" },
  { code: "hi", name: "हिन्दी", dir: "pages.hi" },
  { code: "id", name: "Indonesia", dir: "pages.id" },
  { code: "it", name: "Italiano", dir: "pages.it" },
  { code: "ja", name: "日本語", dir: "pages.ja" },
  { code: "ko", name: "한국어", dir: "pages.ko" },
  { code: "lo", name: "ລາວ", dir: "pages.lo" },
  { code: "ml", name: "മലയാളം", dir: "pages.ml" },
  { code: "ne", name: "नेपाली", dir: "pages.ne" },
  { code: "nl", name: "Nederlands", dir: "pages.nl" },
  { code: "no", name: "Norsk", dir: "pages.no" },
  { code: "pl", name: "Polski", dir: "pages.pl" },
  { code: "pt_BR", name: "Português (Brasil)", dir: "pages.pt_BR" },
  { code: "pt_PT", name: "Português (Portugal)", dir: "pages.pt_PT" },
  { code: "ro", name: "Română", dir: "pages.ro" },
  { code: "ru", name: "Русский", dir: "pages.ru" },
  { code: "sr", name: "Српски", dir: "pages.sr" },
  { code: "sv", name: "Svenska", dir: "pages.sv" },
  { code: "ta", name: "தமிழ்", dir: "pages.ta" },
  { code: "th", name: "ไทย", dir: "pages.th" },
  { code: "tr", name: "Türkçe", dir: "pages.tr" },
  { code: "uk", name: "Українська", dir: "pages.uk" },
  { code: "uz", name: "Oʻzbekcha", dir: "pages.uz" },
  { code: "zh", name: "中文 (简体)", dir: "pages.zh" },
  { code: "zh_TW", name: "中文 (繁體)", dir: "pages.zh_TW" },
];

export function detectBrowserLanguage(): string {
  if (typeof navigator === "undefined") return "en";
  const lang = navigator.language || "en";
  // Try exact match first
  const exact = LANGUAGES.find((l) => l.code === lang.replace("-", "_"));
  if (exact) return exact.code;
  // Try prefix match (e.g. "fr-FR" → "fr")
  const prefix = lang.split("-")[0];
  const prefixMatch = LANGUAGES.find((l) => l.code === prefix);
  return prefixMatch ? prefixMatch.code : "en";
}

export function getLangDir(langCode: string): string {
  const lang = LANGUAGES.find((l) => l.code === langCode);
  return lang?.dir ?? "pages";
}
