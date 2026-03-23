"use client";

import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

type SyncStatus = "syncing" | "ready" | "error";

export function SyncBanner() {
  const [status, setStatus] = useState<SyncStatus | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    async function checkStatus() {
      try {
        const res = await fetch("/api/sync-status");
        const data = await res.json();
        setStatus(data.status);
        if (data.status === "ready" || data.status === "error") {
          clearInterval(interval);
        }
      } catch {
        setStatus("error");
        clearInterval(interval);
      }
    }

    checkStatus();
    interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, []);

  if (!status || status === "ready") return null;

  if (status === "error") {
    return (
      <div className="flex items-center gap-2 px-4 py-2 text-sm bg-destructive/20 text-destructive border-b border-destructive/30">
        <AlertCircle className="h-4 w-4 shrink-0" />
        <span>Failed to sync tldr-pages. Some commands may be unavailable.</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 text-sm bg-amber-950/50 dark:bg-amber-950/30 text-amber-300 border-b border-amber-900/50">
      <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      <span>Syncing tldr-pages repository&hellip; this may take a minute on first start.</span>
    </div>
  );
}
