"use client";

import { useEffect, useState } from "react";
import { Github, RefreshCw } from "lucide-react";

interface TldrVersion {
  localCommit: string | null;
  latestCommit: string | null;
  hasUpdate: boolean;
}

export function Footer() {
  const [version, setVersion] = useState<TldrVersion | null>(null);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    async function fetchVersion() {
      try {
        const r = await fetch("/api/tldr-version");
        const data: TldrVersion = await r.json();
        setVersion(data);
        // Retry if the git clone hasn't finished yet
        if (!data.localCommit) {
          timeout = setTimeout(fetchVersion, 5000);
        }
      } catch {
        timeout = setTimeout(fetchVersion, 5000);
      }
    }

    fetchVersion();
    return () => clearTimeout(timeout);
  }, []);

  const shortCommit = version?.localCommit?.slice(0, 7);

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
        {shortCommit && (
          <>
            <span className="text-muted-foreground/50 mx-0.5">·</span>
            <span>current version:{" "}</span>
            <a
              href={`https://github.com/tldr-pages/tldr/commit/${version!.localCommit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline underline-offset-2 font-mono"
            >
              {shortCommit}
            </a>
            {version?.hasUpdate && (
              <span
                title="A newer version of tldr-pages is available. Restart the container to fetch new data."
                className="inline-flex items-center gap-0.5 text-amber-500 cursor-help ml-0.5"
              >
                <RefreshCw className="h-3 w-3" />
                update available
              </span>
            )}
          </>
        )}
      </p>
    </footer>
  );
}
