import { NextRequest } from "next/server";
import { getMatches } from "@/lib/fixtures";
import { configFromQuery } from "@/lib/calendar";
import { buildIcs, icsResponse } from "@/lib/ics";

// Stateless custom feed: /api/cal?teams=usa,eng&finals=1&spoilers=safe
export async function GET(req: NextRequest) {
  const config = configFromQuery(req.nextUrl.searchParams);
  config.name ??= "My World Cup 2026";
  const matches = await getMatches();
  return icsResponse(buildIcs(config, matches), "world-cup-2026.ics");
}
