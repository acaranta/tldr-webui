import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

const STATUS_FILE = "/app/tldr-sync.json";
const FETCH_HEAD = "/tldr-pages/.git/FETCH_HEAD";

function getLocalCommit(): string | null {
  // Primary: read commit written by entrypoint.sh after successful sync
  try {
    const data = JSON.parse(fs.readFileSync(STATUS_FILE, "utf-8"));
    if (data.commit) return data.commit as string;
  } catch {}

  // Fallback: read directly from git FETCH_HEAD (world-readable, no git binary)
  // Format: "<sha>\t<type> '<ref>' of <url>"
  try {
    const raw = fs.readFileSync(FETCH_HEAD, "utf-8");
    const sha = raw.split(/\s/)[0];
    if (/^[0-9a-f]{40}$/.test(sha)) return sha;
  } catch {}

  return null;
}

async function getRemoteCommit(): Promise<string | null> {
  try {
    const res = await fetch("https://api.github.com/repos/tldr-pages/tldr/commits/main", {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.sha ?? null;
  } catch {
    return null;
  }
}

export async function GET() {
  const [localCommit, latestCommit] = await Promise.all([
    Promise.resolve(getLocalCommit()),
    getRemoteCommit(),
  ]);

  return NextResponse.json({
    localCommit,
    latestCommit,
    hasUpdate: localCommit && latestCommit ? localCommit !== latestCommit : false,
  });
}
