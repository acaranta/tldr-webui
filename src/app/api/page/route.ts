import { NextRequest, NextResponse } from "next/server";
import { readPage } from "@/lib/tldr";
import { PLATFORMS, type Platform } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const command = searchParams.get("command")?.trim();
  const platform = (searchParams.get("platform") ?? "common") as Platform;
  const lang = searchParams.get("lang") ?? "en";

  if (!command) {
    return NextResponse.json({ error: "Missing command parameter" }, { status: 400 });
  }

  const validPlatform = PLATFORMS.includes(platform) ? platform : "common";
  const result = readPage(command, validPlatform, lang);

  if (!result) {
    return NextResponse.json({ error: "Command not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
