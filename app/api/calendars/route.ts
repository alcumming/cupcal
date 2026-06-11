import { NextRequest, NextResponse } from "next/server";
import { configFromQuery } from "@/lib/calendar";
import { getStore } from "@/lib/store";

// Create a saved calendar. Body: { teams: string[], finals: boolean, spoilers, name? }
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const params = new URLSearchParams({
    teams: Array.isArray(body.teams) ? (body.teams as string[]).join(",") : "",
    finals: body.finals === false ? "0" : "1",
    spoilers: body.spoilers === "instant" ? "instant" : "safe",
    ...(typeof body.name === "string" && body.name ? { name: body.name } : {}),
  });
  const config = configFromQuery(params);

  if (config.teams.length === 0 && !config.finals) {
    return NextResponse.json({ error: "Pick at least one team" }, { status: 400 });
  }

  try {
    const saved = await getStore().create(config);
    return NextResponse.json({ id: saved.id });
  } catch (e) {
    console.error("calendar save failed", e);
    return NextResponse.json(
      { error: "Saving is unavailable right now — use the subscribe link instead." },
      { status: 503 }
    );
  }
}
