import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "@phosphor-icons/react/ssr";
import SubscribeInstructions from "@/components/SubscribeInstructions";

export const metadata: Metadata = {
  title: "How to subscribe to a World Cup 2026 calendar (iPhone, Google, Outlook)",
  description:
    "Step-by-step instructions for adding a World Cup 2026 calendar subscription to Apple Calendar on iPhone, Google Calendar, and Outlook — and why subscriptions beat one-off imports.",
};

export default function HowToSubscribe() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:underline">
        <ArrowLeft size={14} /> World Cup Calendar
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">How to subscribe</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Your calendar link is a <strong>live subscription</strong>, not a file
        you import once. Subscribe once and new knockout games, time changes
        and your edited team picks all flow in automatically.
      </p>

      <SubscribeInstructions />

      <section className="mt-10">
        <h2 className="text-xl font-bold">Why not just download a file?</h2>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          A downloaded .ics file is a snapshot: knockout games would show as
          &ldquo;TBD&rdquo; forever and schedule changes would never reach you. A
          subscription is a living calendar — when your team makes the
          quarter-finals, the game just appears.
        </p>
      </section>
    </main>
  );
}
