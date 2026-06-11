import { NextRequest, NextResponse } from "next/server";
import { configFromQuery } from "@/lib/calendar";
import { getStore } from "@/lib/store";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const saved = await getStore().get(id);
  if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(saved);
}

// Update a saved calendar's config. Knowing the secret id is the credential.
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const p = new URLSearchParams({
    teams: Array.isArray(body.teams) ? (body.teams as string[]).join(",") : "",
    finals: body.finals === false ? "0" : "1",
    spoilers: body.spoilers === "instant" ? "instant" : "safe",
    ...(typeof body.name === "string" && body.name ? { name: body.name } : {}),
  });

  const saved = await getStore().update(id, configFromQuery(p));
  if (!saved) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(saved);
}
