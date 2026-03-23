"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Copy, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/languages";

interface CommandDisplayProps {
  content: string;
  fallback: boolean;
  platform: string;
  lang: string;
  selectedLang: string;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        "shrink-0 flex items-center justify-center w-7 h-7 rounded-md transition-colors",
        "bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground"
      )}
      aria-label="Copy command"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5 text-primary" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

// Parse placeholder like {{path}} to styled span
function renderInlineCode(code: string) {
  const parts = code.split(/({{[^}]+}})/g);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith("{{") ? (
          <span key={i} className="text-amber-400 dark:text-amber-300">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

export function CommandDisplay({
  content,
  fallback,
  platform,
  lang,
  selectedLang,
}: CommandDisplayProps) {
  const selectedLangName = LANGUAGES.find((l) => l.code === selectedLang)?.name;

  return (
    <div className="flex flex-col gap-4 h-full overflow-y-auto pr-1">
      {fallback && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-950/40 dark:bg-blue-950/30 border border-blue-900/40 text-sm text-blue-300">
          <Info className="h-4 w-4 mt-0.5 shrink-0" />
          <span>
            No {selectedLangName} translation available — showing English version.
          </span>
        </div>
      )}

      <div className="tldr-content">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold font-mono text-foreground">
                  {children}
                </h1>
                <span className="text-xs font-mono px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                  {platform}
                </span>
              </div>
            ),
            blockquote: ({ children }) => (
              <blockquote className="text-muted-foreground mb-4 border-l-2 border-primary/40 pl-3">
                {children}
              </blockquote>
            ),
            ul: ({ children }) => (
              <ul className="space-y-5">{children}</ul>
            ),
            li: ({ children }) => {
              // Extract the command code block from children
              const childArray = Array.isArray(children) ? children : [children];
              const descParts: React.ReactNode[] = [];
              const codeParts: React.ReactNode[] = [];

              childArray.forEach((child) => {
                if (
                  child &&
                  typeof child === "object" &&
                  "type" in child &&
                  (child as React.ReactElement).type === "code"
                ) {
                  codeParts.push(child);
                } else {
                  descParts.push(child);
                }
              });

              return (
                <li className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground leading-relaxed">
                    {descParts}
                  </span>
                  {codeParts.map((code, i) => {
                    const codeEl = code as React.ReactElement<{ children: string }>;
                    const codeText = codeEl.props?.children ?? "";
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-2 group rounded-lg bg-secondary/50 dark:bg-card border border-border px-4 py-3"
                      >
                        <code className="flex-1 font-mono text-sm text-primary">
                          {renderInlineCode(codeText)}
                        </code>
                        <CopyButton text={codeText} />
                      </div>
                    );
                  })}
                </li>
              );
            },
            code: ({ children, className }) => {
              // Inline code in blockquote/description
              return (
                <code className="font-mono text-sm text-primary bg-secondary/50 px-1 rounded">
                  {renderInlineCode(String(children))}
                </code>
              );
            },
            a: ({ href, children }) => (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                {children}
              </a>
            ),
            p: ({ children }) => (
              <p className="text-muted-foreground leading-relaxed">{children}</p>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
