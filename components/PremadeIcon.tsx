import { Trophy, Medal, Star, Globe, MapPin } from "@phosphor-icons/react/ssr";

// Category icons for the ready-made calendars. Keyed by the `icon` field in
// lib/calendar.ts so that file stays free of React imports.
const ICONS = { Trophy, Medal, Star, Globe, MapPin } as const;

export type PremadeIconName = keyof typeof ICONS;

export default function PremadeIcon({
  name,
  size = 28,
  weight = "duotone",
  className,
}: {
  name: string;
  size?: number;
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  className?: string;
}) {
  const Icon = ICONS[name as PremadeIconName] ?? Trophy;
  return <Icon size={size} weight={weight} className={className} />;
}
