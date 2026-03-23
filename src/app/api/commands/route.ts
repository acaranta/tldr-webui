import { NextRequest, NextResponse } from "next/server";
import { searchCommands } from "@/lib/tldr";
import { PLATFORMS, type SearchPlatform } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const platformParam = searchParams.get("platform") ?? "any";
  const lang = searchParams.get("lang") ?? "en";

  if (!q) {
    return NextResponse.json([]);
  }

  const validPlatform: SearchPlatform =
    platformParam === "any" || PLATFORMS.includes(platformParam as never)
      ? (platformParam as SearchPlatform)
      : "any";

  const results = searchCommands(q, validPlatform, lang);

  return NextResponse.json(results);
}
