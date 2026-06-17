import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Check,
  Trophy,
  Medal,
  EyeSlash,
  Lightning,
  PencilSimple,
} from "@phosphor-icons/react/ssr";
import { getStore } from "@/lib/store";
import { TEAMS_BY_CODE } from "@/lib/teams";
import SubscribeButtons from "@/components/SubscribeButtons";
import Flag from "@/components/Flag";

export const metadata = {
  title: "Your World Cup 2026 calendar",
  robots: { index: false }, // secret links must never be indexed
};

export default async function SavedCalendarPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ updated?: string }>;
}) {
  const { id } = await params;
  const { updated } = await searchParams;
  const saved = await getStore().get(id);
  if (!saved) notFound();

  const teams = saved.config.teams
    .map((c) => TEAMS_BY_CODE.get(c))
    .filter((t) => t != null);

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:underline">
        <ArrowLeft size={14} /> World Cup Calendar
      </Link>

      {updated && (
        <p className="mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 px-4 py-3 text-sm font-medium text-emerald-800 dark:text-emerald-300">
          <Check size={18} weight="bold" className="mt-0.5 shrink-0" />
          <span>
            Saved. If you&apos;re already subscribed, your calendar will pick up the
            changes on its next refresh — nothing else to do.
          </span>
        </p>
      )}

      <h1 className="mt-4 text-3xl font-bold tracking-tight">
        {saved.config.name ?? "My World Cup 2026"}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        {saved.config.teams.includes("all") ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm">
            <Trophy size={16} weight="fill" className="text-emerald-600" /> Every game
          </span>
        ) : (
          teams.map((t) => (
            <span key={t.code} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm">
              <Flag code={t.flag} name={t.name} /> {t.name}
            </span>
          ))
        )}
        {saved.config.finals && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm">
            <Medal size={16} weight="fill" className="text-emerald-600" /> Semis &amp; final
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-sm">
          {saved.config.spoilers === "safe" ? (
            <><EyeSlash size={16} className="text-emerald-600" /> Spoiler-safe</>
          ) : (
            <><Lightning size={16} weight="fill" className="text-amber-500" /> Instant updates</>
          )}
        </span>
      </div>

      <div className="mt-8">
        <h2 className="font-semibold">Subscribe</h2>
        <div className="mt-3">
          <SubscribeButtons
            feedPath={`/c/${id}/feed.ics`}
            calendarName={saved.config.name ?? "My World Cup 2026"}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="font-semibold">Change your teams anytime</h2>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Discovered a new team to root for? Edit this calendar and your
          subscribed feed updates in place — no need to re-subscribe.
        </p>
        <Link
          href={`/build?edit=${id}`}
          className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-600 px-4 py-2 font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950"
        >
          <PencilSimple size={18} /> Edit teams
        </Link>
        <p className="mt-3 text-xs text-zinc-500">
          Bookmark this page — the link is your key to this calendar. Anyone
          with it can edit it, so only share with your household.
        </p>
      </div>
    </main>
  );
}
