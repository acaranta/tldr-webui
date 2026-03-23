import { NextResponse } from "next/server";
import fs from "fs";

export const dynamic = "force-dynamic";

const STATUS_FILE = "/app/tldr-sync.json";

export async function GET() {
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const raw = fs.readFileSync(STATUS_FILE, "utf-8");
      return NextResponse.json(JSON.parse(raw));
    }
    return NextResponse.json({ status: "ready" });
  } catch {
    return NextResponse.json({ status: "error", message: "Could not read sync status" });
  }
}
