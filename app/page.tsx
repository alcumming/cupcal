import Link from "next/link";
import { PREMADE } from "@/lib/calendar";
import PremadeCard from "@/components/PremadeCard";

const FAQS = [
  {
    q: "How do I add the World Cup 2026 schedule to Google Calendar?",
    a: "Build or pick a calendar on this page, then click the Google Calendar button on a computer. Google opens an 'Add calendar' prompt — confirm it and every match appears, synced to your phone too. Note: the Google Calendar mobile app can't add subscription links directly, so do this step on a desktop browser once.",
  },
  {
    q: "How do I add World Cup fixtures to my iPhone calendar?",
    a: "On your iPhone, tap the 'Add to Apple Calendar' button. iOS opens a subscribe dialog — tap Subscribe and you're done. The calendar updates itself as the tournament unfolds.",
  },
  {
    q: "Does the calendar update as teams qualify for the knockout rounds?",
    a: "Yes — this is a live subscription, not a one-off import. When your team reaches the Round of 32, Round of 16, quarter-finals and beyond, those games appear in your calendar automatically.",
  },
  {
    q: "Will the calendar spoil results for me?",
    a: "No. By default, knockout match-ups stay hidden until 18 hours after the deciding game ends, so seeing 'France vs Brazil' in your calendar never reveals a result you haven't watched yet. You can switch to instant updates if you don't mind.",
  },
  {
    q: "What times are the matches shown in?",
    a: "Your local timezone, automatically. Calendar subscriptions carry times in UTC and your calendar app converts them — no timezone maths needed.",
  },
  {
    q: "Is this free?",
    a: "Yes, completely free. Pick teams, subscribe, done — no account needed.",
  },
];

export default function Home() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        name: "World Cup Calendar",
        applicationCategory: "SportsApplication",
        operatingSystem: "Any",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
        description:
          "Build a custom FIFA World Cup 2026 calendar with only the teams you follow, and subscribe in Google Calendar, Apple Calendar or Outlook.",
      },
      {
        "@type": "FAQPage",
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-16 pb-12 text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          FIFA World Cup 2026 · June 11 – July 19
        </p>
        <h1 className="mt-4 text-4xl sm:text-5xl font-bold tracking-tight text-balance">
          Only the World Cup games you care about, in your calendar
        </h1>
        <p className="mt-4 text-lg text-zinc-600 dark:text-zinc-400 text-balance">
          104 matches is a lot. Pick your teams and get a calendar with just
          their games — it updates itself as the tournament unfolds, all the way
          to the final. Works with Google Calendar, Apple Calendar and Outlook.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
          <Link
            href="/build"
            className="rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
          >
            Build my calendar →
          </Link>
          <a
            href="#calendars"
            className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-6 py-3.5 font-semibold transition hover:border-emerald-500"
          >
            Ready-made calendars
          </a>
        </div>
        <p className="mt-6 text-sm text-zinc-500">
          🇺🇸 USA vs Australia 🇦🇺 — that&apos;s how matches look in your calendar.
          Local kick-off times, no spoilers.
        </p>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ["1", "Pick your teams", "Choose who you follow. Semi-finals and the final are included by default — everyone watches those."],
            ["2", "Subscribe once", "Add the calendar to Google, Apple or Outlook in one tap. No account, no app, no spreadsheet."],
            ["3", "It updates itself", "When your team reaches the knockouts, the new games just appear — spoiler-free by default."],
          ].map(([n, title, body]) => (
            <li key={n} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">{n}</span>
              <h3 className="mt-3 font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Pre-made calendars */}
      <section id="calendars" className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold">Ready-made calendars</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Don&apos;t want to choose? Subscribe to one of these in a single tap.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREMADE.map((p) => (
            <PremadeCard key={p.slug} slug={p.slug} title={p.title} emoji={p.emoji} description={p.description} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <div className="mt-6 space-y-6">
          {FAQS.map((f) => (
            <details key={f.q} className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5">
              <summary className="cursor-pointer font-semibold">{f.q}</summary>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <footer className="mx-auto max-w-3xl px-4 py-12 text-center text-sm text-zinc-500">
        <p>
          Free forever · No account needed ·{" "}
          <Link href="/how-to-subscribe" className="underline">How to subscribe</Link>
        </p>
        <p className="mt-2">
          Fixture data from the open-source{" "}
          <a href="https://github.com/openfootball/worldcup.json" className="underline" rel="noopener">
            openfootball
          </a>{" "}
          project. Not affiliated with FIFA.
        </p>
      </footer>
    </main>
  );
}
