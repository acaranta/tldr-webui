"use client";

import { ThemeProvider } from "next-themes";
import { LangProvider } from "./LangContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LangProvider>{children}</LangProvider>
    </ThemeProvider>
  );
}
