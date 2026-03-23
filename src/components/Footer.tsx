import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="shrink-0 border-t border-border bg-card/50 px-6 py-3">
      <p className="text-center text-xs text-muted-foreground font-mono flex items-center justify-center gap-1 flex-wrap">
        <a
          href="https://github.com/acaranta/tldr-webui"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline underline-offset-2"
        >
          <Github className="h-3 w-3" />
          tldr-webui
        </a>
        {" "}is a viewer only.{" "}
        Command pages are sourced from{" "}
        <a
          href="https://github.com/tldr-pages/tldr"
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline underline-offset-2"
        >
          tldr-pages
        </a>
        {" "}— a community-maintained collection of simplified man pages.{" "}
        <a
          href="https://github.com/tldr-pages/tldr/blob/main/LICENSE.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-muted-foreground hover:text-foreground hover:underline underline-offset-2"
        >
          CC BY 4.0
        </a>
      </p>
    </footer>
  );
}
