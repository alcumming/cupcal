// The 48 qualified teams for the 2026 World Cup.
// `name` must match the team names used in openfootball/worldcup.json exactly.

export type Region =
  | "europe"
  | "africa"
  | "south-america"
  | "asia"
  | "north-america"
  | "oceania";

export interface Team {
  code: string; // FIFA three-letter code, lowercase (used in URLs)
  name: string;
  flag: string; // flag-icons code, e.g. "us", "gb-eng" (rendered by <Flag>)
  region: Region;
  favourite?: boolean; // pre-tournament favourites bundle
}

export const TEAMS: Team[] = [
  { code: "alg", name: "Algeria", flag: "dz", region: "africa" },
  { code: "arg", name: "Argentina", flag: "ar", region: "south-america", favourite: true },
  { code: "aus", name: "Australia", flag: "au", region: "oceania" },
  { code: "aut", name: "Austria", flag: "at", region: "europe" },
  { code: "bel", name: "Belgium", flag: "be", region: "europe" },
  { code: "bih", name: "Bosnia & Herzegovina", flag: "ba", region: "europe" },
  { code: "bra", name: "Brazil", flag: "br", region: "south-america", favourite: true },
  { code: "can", name: "Canada", flag: "ca", region: "north-america" },
  { code: "cpv", name: "Cape Verde", flag: "cv", region: "africa" },
  { code: "col", name: "Colombia", flag: "co", region: "south-america" },
  { code: "cro", name: "Croatia", flag: "hr", region: "europe" },
  { code: "cuw", name: "Curaçao", flag: "cw", region: "north-america" },
  { code: "cze", name: "Czech Republic", flag: "cz", region: "europe" },
  { code: "cod", name: "DR Congo", flag: "cd", region: "africa" },
  { code: "ecu", name: "Ecuador", flag: "ec", region: "south-america" },
  { code: "egy", name: "Egypt", flag: "eg", region: "africa" },
  { code: "eng", name: "England", flag: "gb-eng", region: "europe", favourite: true },
  { code: "fra", name: "France", flag: "fr", region: "europe", favourite: true },
  { code: "ger", name: "Germany", flag: "de", region: "europe", favourite: true },
  { code: "gha", name: "Ghana", flag: "gh", region: "africa" },
  { code: "hai", name: "Haiti", flag: "ht", region: "north-america" },
  { code: "irn", name: "Iran", flag: "ir", region: "asia" },
  { code: "irq", name: "Iraq", flag: "iq", region: "asia" },
  { code: "civ", name: "Ivory Coast", flag: "ci", region: "africa" },
  { code: "jpn", name: "Japan", flag: "jp", region: "asia" },
  { code: "jor", name: "Jordan", flag: "jo", region: "asia" },
  { code: "mex", name: "Mexico", flag: "mx", region: "north-america" },
  { code: "mar", name: "Morocco", flag: "ma", region: "africa" },
  { code: "ned", name: "Netherlands", flag: "nl", region: "europe", favourite: true },
  { code: "nzl", name: "New Zealand", flag: "nz", region: "oceania" },
  { code: "nor", name: "Norway", flag: "no", region: "europe" },
  { code: "pan", name: "Panama", flag: "pa", region: "north-america" },
  { code: "par", name: "Paraguay", flag: "py", region: "south-america" },
  { code: "por", name: "Portugal", flag: "pt", region: "europe", favourite: true },
  { code: "qat", name: "Qatar", flag: "qa", region: "asia" },
  { code: "ksa", name: "Saudi Arabia", flag: "sa", region: "asia" },
  { code: "sco", name: "Scotland", flag: "gb-sct", region: "europe" },
  { code: "sen", name: "Senegal", flag: "sn", region: "africa" },
  { code: "rsa", name: "South Africa", flag: "za", region: "africa" },
  { code: "kor", name: "South Korea", flag: "kr", region: "asia" },
  { code: "esp", name: "Spain", flag: "es", region: "europe", favourite: true },
  { code: "swe", name: "Sweden", flag: "se", region: "europe" },
  { code: "sui", name: "Switzerland", flag: "ch", region: "europe" },
  { code: "tun", name: "Tunisia", flag: "tn", region: "africa" },
  { code: "tur", name: "Turkey", flag: "tr", region: "europe" },
  { code: "usa", name: "USA", flag: "us", region: "north-america" },
  { code: "uru", name: "Uruguay", flag: "uy", region: "south-america" },
  { code: "uzb", name: "Uzbekistan", flag: "uz", region: "asia" },
];

export const TEAMS_BY_NAME = new Map(TEAMS.map((t) => [t.name, t]));
export const TEAMS_BY_CODE = new Map(TEAMS.map((t) => [t.code, t]));

export const REGION_LABELS: Record<Region, string> = {
  europe: "Europe",
  africa: "Africa",
  "south-america": "South America",
  asia: "Asia & Middle East",
  "north-america": "North & Central America",
  oceania: "Oceania",
};

// Flag emoji for the GB subdivisions, which can't be derived from regional
// indicator letters the way ISO 3166-1 country codes can.
const SUBDIVISION_FLAG_EMOJI: Record<string, string> = {
  "gb-eng": "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  "gb-sct": "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
};

// Converts a flag-icons code to its emoji equivalent, for use in calendar
// invite text (where emoji render fine but SVGs can't).
export function flagEmoji(code: string): string {
  if (code in SUBDIVISION_FLAG_EMOJI) return SUBDIVISION_FLAG_EMOJI[code];
  return [...code.toUpperCase()]
    .map((c) => String.fromCodePoint(c.codePointAt(0)! + 0x1f1a5))
    .join("");
}
