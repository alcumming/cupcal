import { Team, TEAMS_BY_NAME } from "./teams";
import fallback from "@/data/fixtures-fallback.json";

const SOURCE_URL =
  "https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json";

interface RawMatch {
  num?: number;
  round: string;
  date: string; // "2026-06-11"
  time?: string; // "13:00 UTC-6"
  team1: string;
  team2: string;
  group?: string; // "Group A"
  ground?: string;
}

export type Stage =
  | "group"
  | "round-of-32"
  | "round-of-16"
  | "quarter-final"
  | "semi-final"
  | "third-place"
  | "final";

export type Side =
  | { kind: "team"; team: Team }
  | {
      kind: "placeholder";
      code: string; // original bracket slot, e.g. "1A", "W73", "3A/B/C/D/F"
      label: string; // human label, e.g. "Winner Group A"
      // Team if the slot has been decided in the live data (may still be
      // hidden from spoiler-safe feeds until revealAt).
      resolved?: Team;
    };

export interface Match {
  uid: string; // stable across refreshes
  num?: number;
  stage: Stage;
  roundLabel: string; // "Group A · Matchday 2", "Round of 16", ...
  kickoff: Date;
  end: Date;
  ground?: string;
  group?: string;
  side1: Side;
  side2: Side;
}

const STAGE_LABELS: Record<Exclude<Stage, "group">, string> = {
  "round-of-32": "Round of 32",
  "round-of-16": "Round of 16",
  "quarter-final": "Quarter-final",
  "semi-final": "Semi-final",
  "third-place": "Third-place match",
  final: "Final",
};

function stageOf(raw: RawMatch): Stage {
  if (raw.group) return "group";
  const r = raw.round.toLowerCase();
  if (r.includes("32")) return "round-of-32";
  if (r.includes("16")) return "round-of-16";
  if (r.includes("quarter")) return "quarter-final";
  if (r.includes("semi")) return "semi-final";
  if (r.includes("third")) return "third-place";
  return "final";
}

// "2026-06-11" + "13:00 UTC-6" -> Date in UTC
function parseKickoff(date: string, time?: string): Date {
  if (!time) return new Date(`${date}T18:00:00Z`);
  const m = time.match(/^(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})(?::?(\d{2}))?$/);
  if (!m) return new Date(`${date}T18:00:00Z`);
  const [, hh, mm, off, offMin] = m;
  const sign = off.startsWith("-") ? "-" : "+";
  const offH = String(Math.abs(parseInt(off, 10))).padStart(2, "0");
  return new Date(
    `${date}T${hh.padStart(2, "0")}:${mm}:00${sign}${offH}:${offMin ?? "00"}`
  );
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function matchUid(raw: RawMatch): string {
  // Knockout matches have a stable FIFA match number. Group matches don't,
  // but team pairings are unique within the group stage.
  if (raw.num != null) return `wc2026-m${raw.num}`;
  return `wc2026-${slug(raw.group ?? "g")}-${slug(raw.team1)}-${slug(raw.team2)}`;
}

function placeholderLabel(code: string, bracket: Map<number, RawMatch>): string {
  let m = code.match(/^1([A-L])$/);
  if (m) return `Winner Group ${m[1]}`;
  m = code.match(/^2([A-L])$/);
  if (m) return `Runner-up Group ${m[1]}`;
  if (code.startsWith("3")) return `Third-place team (Groups ${code.slice(1)})`;
  m = code.match(/^([WL])(\d+)$/);
  if (m) {
    const ref = bracket.get(parseInt(m[2], 10));
    const refLabel = ref
      ? STAGE_LABELS[stageOf(ref) as Exclude<Stage, "group">] ?? ref.round
      : "match";
    return `${m[1] === "W" ? "Winner" : "Loser"} of ${refLabel} ${m[2]}`;
  }
  return code;
}

const isPlaceholderCode = (s: string) => !TEAMS_BY_NAME.has(s);

// The bundled snapshot was taken before any knockout slots resolved, so it
// preserves the original bracket structure ("1A", "W73", ...) that the live
// feed overwrites with real team names as the tournament unfolds.
const SNAPSHOT = (fallback as { matches: RawMatch[] }).matches;

let cache: { at: number; matches: Match[] } | null = null;
const CACHE_MS = 30 * 60 * 1000;

export async function getMatches(): Promise<Match[]> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.matches;
  let raw: RawMatch[] = SNAPSHOT;
  try {
    const res = await fetch(SOURCE_URL, { next: { revalidate: 1800 } });
    if (res.ok) raw = ((await res.json()) as { matches: RawMatch[] }).matches;
  } catch {
    // network failure: serve the bundled snapshot
  }
  const matches = normalize(raw);
  cache = { at: Date.now(), matches };
  return matches;
}

function normalize(raw: RawMatch[]): Match[] {
  const bracketByNum = new Map<number, RawMatch>();
  const snapshotByUid = new Map<string, RawMatch>();
  for (const s of SNAPSHOT) {
    if (s.num != null) bracketByNum.set(s.num, s);
    snapshotByUid.set(matchUid(s), s);
  }

  return raw
    .map((r): Match => {
      const stage = stageOf(r);
      const kickoff = parseKickoff(r.date, r.time);
      const minutes = stage === "group" ? 120 : 150; // knockouts may go to extra time
      const uid = matchUid(r);
      const snap = snapshotByUid.get(uid);

      const side = (live: string, original?: string): Side => {
        const orig = original ?? live;
        const liveTeam = TEAMS_BY_NAME.get(live);
        if (!isPlaceholderCode(orig) && liveTeam) {
          return { kind: "team", team: liveTeam };
        }
        return {
          kind: "placeholder",
          code: orig,
          label: placeholderLabel(orig, bracketByNum),
          resolved: liveTeam,
        };
      };

      return {
        uid,
        num: r.num,
        stage,
        roundLabel:
          stage === "group"
            ? `${r.group} · ${r.round}`
            : STAGE_LABELS[stage as Exclude<Stage, "group">],
        kickoff,
        end: new Date(kickoff.getTime() + minutes * 60 * 1000),
        ground: r.ground,
        group: r.group,
        side1: side(r.team1, snap?.team1),
        side2: side(r.team2, snap?.team2),
      };
    })
    .sort((a, b) => a.kickoff.getTime() - b.kickoff.getTime());
}
