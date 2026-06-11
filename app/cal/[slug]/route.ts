import { getMatches } from "@/lib/fixtures";
import { PREMADE_BY_SLUG } from "@/lib/calendar";
import { buildIcs, icsResponse } from "@/lib/ics";

// Pre-made feeds: /cal/all-games.ics, /cal/favourites.ics, ...
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const premade = PREMADE_BY_SLUG.get(slug.replace(/\.ics$/, ""));
  if (!premade) return new Response("Not found", { status: 404 });
  const matches = await getMatches();
  return icsResponse(buildIcs(premade.config, matches), `${premade.slug}.ics`);
}
