import { getMatches } from "@/lib/fixtures";
import { buildIcs, icsResponse } from "@/lib/ics";
import { getStore } from "@/lib/store";

// Saved custom feed: /c/{secret-id}/feed.ics
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const saved = await getStore().get(id);
  if (!saved) return new Response("Calendar not found", { status: 404 });
  const matches = await getMatches();
  return icsResponse(buildIcs(saved.config, matches), "my-world-cup-2026.ics");
}
