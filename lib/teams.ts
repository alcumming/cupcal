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
  flag: string;
  region: Region;
  favourite?: boolean; // pre-tournament favourites bundle
}

export const TEAMS: Team[] = [
  { code: "alg", name: "Algeria", flag: "🇩🇿", region: "africa" },
  { code: "arg", name: "Argentina", flag: "🇦🇷", region: "south-america", favourite: true },
  { code: "aus", name: "Australia", flag: "🇦🇺", region: "asia" },
  { code: "aut", name: "Austria", flag: "🇦🇹", region: "europe" },
  { code: "bel", name: "Belgium", flag: "🇧🇪", region: "europe" },
  { code: "bih", name: "Bosnia & Herzegovina", flag: "🇧🇦", region: "europe" },
  { code: "bra", name: "Brazil", flag: "🇧🇷", region: "south-america", favourite: true },
  { code: "can", name: "Canada", flag: "🇨🇦", region: "north-america" },
  { code: "cpv", name: "Cape Verde", flag: "🇨🇻", region: "africa" },
  { code: "col", name: "Colombia", flag: "🇨🇴", region: "south-america" },
  { code: "cro", name: "Croatia", flag: "🇭🇷", region: "europe" },
  { code: "cuw", name: "Curaçao", flag: "🇨🇼", region: "north-america" },
  { code: "cze", name: "Czech Republic", flag: "🇨🇿", region: "europe" },
  { code: "cod", name: "DR Congo", flag: "🇨🇩", region: "africa" },
  { code: "ecu", name: "Ecuador", flag: "🇪🇨", region: "south-america" },
  { code: "egy", name: "Egypt", flag: "🇪🇬", region: "africa" },
  { code: "eng", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", region: "europe", favourite: true },
  { code: "fra", name: "France", flag: "🇫🇷", region: "europe", favourite: true },
  { code: "ger", name: "Germany", flag: "🇩🇪", region: "europe", favourite: true },
  { code: "gha", name: "Ghana", flag: "🇬🇭", region: "africa" },
  { code: "hai", name: "Haiti", flag: "🇭🇹", region: "north-america" },
  { code: "irn", name: "Iran", flag: "🇮🇷", region: "asia" },
  { code: "irq", name: "Iraq", flag: "🇮🇶", region: "asia" },
  { code: "civ", name: "Ivory Coast", flag: "🇨🇮", region: "africa" },
  { code: "jpn", name: "Japan", flag: "🇯🇵", region: "asia" },
  { code: "jor", name: "Jordan", flag: "🇯🇴", region: "asia" },
  { code: "mex", name: "Mexico", flag: "🇲🇽", region: "north-america" },
  { code: "mar", name: "Morocco", flag: "🇲🇦", region: "africa" },
  { code: "ned", name: "Netherlands", flag: "🇳🇱", region: "europe", favourite: true },
  { code: "nzl", name: "New Zealand", flag: "🇳🇿", region: "oceania" },
  { code: "nor", name: "Norway", flag: "🇳🇴", region: "europe" },
  { code: "pan", name: "Panama", flag: "🇵🇦", region: "north-america" },
  { code: "par", name: "Paraguay", flag: "🇵🇾", region: "south-america" },
  { code: "por", name: "Portugal", flag: "🇵🇹", region: "europe", favourite: true },
  { code: "qat", name: "Qatar", flag: "🇶🇦", region: "asia" },
  { code: "ksa", name: "Saudi Arabia", flag: "🇸🇦", region: "asia" },
  { code: "sco", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", region: "europe" },
  { code: "sen", name: "Senegal", flag: "🇸🇳", region: "africa" },
  { code: "rsa", name: "South Africa", flag: "🇿🇦", region: "africa" },
  { code: "kor", name: "South Korea", flag: "🇰🇷", region: "asia" },
  { code: "esp", name: "Spain", flag: "🇪🇸", region: "europe", favourite: true },
  { code: "swe", name: "Sweden", flag: "🇸🇪", region: "europe" },
  { code: "sui", name: "Switzerland", flag: "🇨🇭", region: "europe" },
  { code: "tun", name: "Tunisia", flag: "🇹🇳", region: "africa" },
  { code: "tur", name: "Turkey", flag: "🇹🇷", region: "europe" },
  { code: "usa", name: "USA", flag: "🇺🇸", region: "north-america" },
  { code: "uru", name: "Uruguay", flag: "🇺🇾", region: "south-america" },
  { code: "uzb", name: "Uzbekistan", flag: "🇺🇿", region: "asia" },
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

export function teamLabel(team: Team): string {
  return `${team.flag} ${team.name}`;
}
