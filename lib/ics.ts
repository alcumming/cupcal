import { Match } from "./fixtures";
import { CalendarConfig, selectMatches, visibleSide } from "./calendar";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
const DOMAIN = new URL(SITE_URL).hostname;

// RFC 5545 requires lines folded at 75 octets (bytes, not characters —
// flag emoji are 8+ bytes each).
function foldLine(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const out: string[] = [];
  let current = "";
  let currentBytes = 0;
  for (const ch of line) {
    const chBytes = new TextEncoder().encode(ch).length;
    const limit = out.length === 0 ? 75 : 74; // continuation lines start with a space
    if (currentBytes + chBytes > limit) {
      out.push(current);
      current = "";
      currentBytes = 0;
    }
    current += ch;
    currentBytes += chBytes;
  }
  if (current) out.push(current);
  return out.join("\r\n ");
}

const escapeText = (s: string) =>
  s.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");

const icsDate = (d: Date) =>
  d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function buildIcs(config: CalendarConfig, all: Match[], now = new Date()): string {
  const matches = selectMatches(config, all, now);
  const calName = config.name ?? "World Cup 2026";
  const dtstamp = icsDate(now);

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${DOMAIN}//World Cup Calendar//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeText(calName)}`,
    "X-WR-CALDESC:Auto-updating World Cup 2026 fixtures. Knockout opponents appear once your teams qualify.",
    // Hint to clients how often to re-fetch the subscription
    "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
    "X-PUBLISHED-TTL:PT4H",
  ];

  for (const m of matches) {
    const v1 = visibleSide(m.side1, m, all, config.spoilers, now);
    const v2 = visibleSide(m.side2, m, all, config.spoilers, now);

    const name1 = v1.team ? `${v1.team.flag} ${v1.team.name}` : v1.label;
    const name2 = v2.team ? `${v2.team.name} ${v2.team.flag}` : v2.label;
    const isTbd = !v1.team || !v2.team;
    const summary =
      m.stage === "group"
        ? `${name1} vs ${name2}`
        : `${shortStage(m)}: ${name1} vs ${name2}`;

    const descParts = [m.roundLabel];
    if (isTbd && config.spoilers === "safe") {
      descParts.push(
        "Teams are hidden until 18 hours after the deciding match, so results aren't spoiled. This event updates automatically."
      );
    }
    descParts.push(`Calendar by ${DOMAIN} — edit your teams anytime.`);

    lines.push(
      "BEGIN:VEVENT",
      `UID:${m.uid}@${DOMAIN}`,
      `DTSTAMP:${dtstamp}`,
      `DTSTART:${icsDate(m.kickoff)}`,
      `DTEND:${icsDate(m.end)}`,
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(descParts.join("\n\n"))}`,
      ...(m.ground ? [`LOCATION:${escapeText(m.ground)}`] : []),
      `URL:${SITE_URL}`,
      "TRANSP:TRANSPARENT",
      "STATUS:CONFIRMED",
      "END:VEVENT"
    );
  }

  lines.push("END:VCALENDAR");
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

function shortStage(m: Match): string {
  switch (m.stage) {
    case "round-of-32": return "R32";
    case "round-of-16": return "R16";
    case "quarter-final": return "QF";
    case "semi-final": return "SF";
    case "third-place": return "3rd place";
    case "final": return "🏆 FINAL";
    default: return "";
  }
}

export function icsResponse(body: string, filename: string): Response {
  return new Response(body, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "public, max-age=900, s-maxage=900",
    },
  });
}
