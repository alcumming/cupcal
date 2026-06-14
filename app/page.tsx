import Link from "next/link";
import { PREMADE } from "@/lib/calendar";
import PremadeCard from "@/components/PremadeCard";
import Faq from "@/components/Faq";
import CupCalHero from "@/components/hero/CupCalHero";
import HowItWorks from "@/components/HowItWorks";

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
      <CupCalHero />

      {/* How it works */}
      <HowItWorks />

      {/* Pre-made calendars */}
      <section id="calendars" className="mx-auto max-w-5xl px-4 py-12">
        <h2 className="text-2xl font-bold">Ready-made calendars</h2>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          If you'd rather not pick teams yourself, subscribe to one of these in a single tap.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PREMADE.map((p) => (
            <PremadeCard key={p.slug} slug={p.slug} title={p.title} icon={p.icon} description={p.description} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold">Frequently asked questions</h2>
        <Faq faqs={FAQS} />
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
        <p className="mt-2">
          Made by{" "}
          <a href="https://x.com/Al_Cumming" className="underline" rel="noopener">
            @Al_Cumming
          </a>
        </p>
      </footer>
    </main>
  );
}
