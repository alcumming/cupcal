import { Match, Side } from "./fixtures";
import { Team, TEAMS, TEAMS_BY_CODE } from "./teams";

export interface CalendarConfig {
  teams: string[]; // team codes; ["all"] = every match
  finals: boolean; // include semis, third-place match and final
  spoilers: "safe" | "instant";
  name?: string;
}

export const DEFAULT_CONFIG: CalendarConfig = {
  teams: [],
  finals: true,
  spoilers: "safe",
};

const REVEAL_DELAY_MS = 18 * 60 * 60 * 1000;
const MIN_NOTICE_MS = 6 * 60 * 60 * 1000;

/**
 * When is a bracket slot safe to reveal without spoiling results?
 * 18h after the deciding game's scheduled end — but never later than 6h
 * before this match kicks off (you need to know who's playing), and never
 * before the deciding game has actually finished.
 */
export function revealAt(side: Side, match: Match, all: Match[]): Date | null {
  if (side.kind === "team") return null; // known from the original draw
  const code = side.code;
  let decidingEnd: number | undefined;

  const groupMatch = code.match(/^[12]([A-L])$/);
  if (groupMatch) {
    decidingEnd = maxEnd(all.filter((m) => m.group === `Group ${groupMatch[1]}`));
  } else if (code.startsWith("3")) {
    // Best third-placed allocation depends on every group's final standings
    decidingEnd = maxEnd(all.filter((m) => m.stage === "group"));
  } else {
    const ref = code.match(/^[WL](\d+)$/);
    if (ref) {
      const deciding = all.find((m) => m.num === parseInt(ref[1], 10));
      decidingEnd = deciding?.end.getTime();
    }
  }
  if (decidingEnd == null) return null;

  const reveal = Math.max(
    decidingEnd,
    Math.min(decidingEnd + REVEAL_DELAY_MS, match.kickoff.getTime() - MIN_NOTICE_MS)
  );
  return new Date(reveal);
}

/** The teams visible on each side of a match for a given spoiler setting. */
export function visibleSide(
  side: Side,
  match: Match,
  all: Match[],
  spoilers: "safe" | "instant",
  now: Date
): { team?: Team; label: string } {
  if (side.kind === "team") return { team: side.team, label: side.team.name };
  if (side.resolved) {
    if (spoilers === "instant") {
      return { team: side.resolved, label: side.resolved.name };
    }
    const at = revealAt(side, match, all);
    if (!at || now >= at) {
      return { team: side.resolved, label: side.resolved.name };
    }
  }
  return { label: side.label };
}

export function selectMatches(
  config: CalendarConfig,
  all: Match[],
  now: Date
): Match[] {
  if (config.teams.includes("all")) return all;
  const wanted = new Set(config.teams);

  return all.filter((m) => {
    if (
      config.finals &&
      (m.stage === "semi-final" || m.stage === "third-place" || m.stage === "final")
    ) {
      return true;
    }
    return [m.side1, m.side2].some((s) => {
      const v = visibleSide(s, m, all, config.spoilers, now);
      return v.team != null && wanted.has(v.team.code);
    });
  });
}

const maxEnd = (ms: Match[]) =>
  ms.length ? Math.max(...ms.map((m) => m.end.getTime())) : undefined;

// ---- Pre-made calendars ----

export interface PremadeCalendar {
  slug: string;
  title: string;
  emoji: string;
  description: string;
  config: CalendarConfig;
}

const regionTeams = (region: Team["region"]) =>
  TEAMS.filter((t) => t.region === region).map((t) => t.code);

export const PREMADE: PremadeCalendar[] = [
  {
    slug: "all-games",
    title: "Every game",
    emoji: "🏆",
    description: "All 104 matches of the 2026 World Cup, kick-off to final.",
    config: { teams: ["all"], finals: true, spoilers: "safe", name: "World Cup 2026 · Every game" },
  },
  {
    slug: "knockouts",
    title: "Semis & final only",
    emoji: "🥇",
    description: "Just the big ones: both semi-finals, the third-place match and the final.",
    config: { teams: [], finals: true, spoilers: "safe", name: "World Cup 2026 · Semis & final" },
  },
  {
    slug: "favourites",
    title: "Tournament favourites",
    emoji: "⭐",
    description: "Argentina, France, Brazil, England, Spain, Germany, Portugal and the Netherlands.",
    config: {
      teams: TEAMS.filter((t) => t.favourite).map((t) => t.code),
      finals: true,
      spoilers: "safe",
      name: "World Cup 2026 · Favourites",
    },
  },
  {
    slug: "european-teams",
    title: "European teams",
    emoji: "🇪🇺",
    description: "Every match involving one of the 16 European sides.",
    config: { teams: regionTeams("europe"), finals: true, spoilers: "safe", name: "World Cup 2026 · European teams" },
  },
  {
    slug: "african-teams",
    title: "African teams",
    emoji: "🌍",
    description: "Every match involving one of the African sides.",
    config: { teams: regionTeams("africa"), finals: true, spoilers: "safe", name: "World Cup 2026 · African teams" },
  },
  {
    slug: "south-american-teams",
    title: "South American teams",
    emoji: "🌎",
    description: "Every match involving one of the CONMEBOL sides.",
    config: { teams: regionTeams("south-america"), finals: true, spoilers: "safe", name: "World Cup 2026 · South American teams" },
  },
  {
    slug: "asian-teams",
    title: "Asian teams",
    emoji: "🌏",
    description: "Every match involving one of the Asian and Middle Eastern sides.",
    config: { teams: regionTeams("asia"), finals: true, spoilers: "safe", name: "World Cup 2026 · Asian teams" },
  },
  {
    slug: "host-nations",
    title: "Host nations",
    emoji: "🏟️",
    description: "USA, Mexico and Canada — every match the hosts play.",
    config: { teams: ["usa", "mex", "can"], finals: true, spoilers: "safe", name: "World Cup 2026 · Host nations" },
  },
];

export const PREMADE_BY_SLUG = new Map(PREMADE.map((p) => [p.slug, p]));

// ---- Config <-> URL query ----

export function configToQuery(config: CalendarConfig): string {
  const q = new URLSearchParams();
  q.set("teams", config.teams.join(","));
  if (!config.finals) q.set("finals", "0");
  if (config.spoilers === "instant") q.set("spoilers", "instant");
  if (config.name) q.set("name", config.name);
  return q.toString();
}

export function configFromQuery(params: URLSearchParams): CalendarConfig {
  const teams = (params.get("teams") ?? "")
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t === "all" || TEAMS_BY_CODE.has(t));
  return {
    teams,
    finals: params.get("finals") !== "0",
    spoilers: params.get("spoilers") === "instant" ? "instant" : "safe",
    name: params.get("name")?.slice(0, 80) || undefined,
  };
}
