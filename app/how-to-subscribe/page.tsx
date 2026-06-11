import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How to subscribe to a World Cup 2026 calendar (iPhone, Google, Outlook)",
  description:
    "Step-by-step instructions for adding a World Cup 2026 calendar subscription to Apple Calendar on iPhone, Google Calendar, and Outlook — and why subscriptions beat one-off imports.",
};

export default function HowToSubscribe() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">← World Cup Calendar</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">How to subscribe</h1>
      <p className="mt-3 text-zinc-600 dark:text-zinc-400">
        Your calendar link is a <strong>live subscription</strong>, not a file
        you import once. Subscribe once and new knockout games, time changes
        and your edited team picks all flow in automatically.
      </p>

      <section className="mt-10">
        <h2 className="text-xl font-bold"> iPhone &amp; iPad (Apple Calendar)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Tap <strong>Add to Apple Calendar</strong> on your calendar page.</li>
          <li>iOS shows a &ldquo;Subscribe to calendar&rdquo; dialog — tap <strong>Subscribe</strong>.</li>
          <li>Done. To control refresh frequency: Settings → Apps → Calendar → Accounts → your subscription → Fetch.</li>
        </ol>
        <p className="mt-2 text-sm text-zinc-500">
          Also works on Mac: the same button opens Calendar with a subscribe prompt.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Google Calendar</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>
            <strong>On a computer</strong>, click the Google Calendar button —
            Google opens an &ldquo;Add calendar&rdquo; prompt. Confirm it.
          </li>
          <li>
            Alternatively: in Google Calendar go to <strong>Settings → Add
            calendar → From URL</strong> and paste your calendar link.
          </li>
          <li>
            The calendar syncs to the Google Calendar app on your phone
            automatically.
          </li>
        </ol>
        <div className="mt-3 rounded-xl bg-amber-50 dark:bg-amber-950 p-4 text-sm text-amber-900 dark:text-amber-200">
          <p>
            <strong>On your phone?</strong> The Google Calendar mobile app can&apos;t
            add subscription links — that screen only exists on the desktop
            site. Use the <em>Email me the link</em> button and add it next time
            you&apos;re at a computer; it then appears on your phone too.
          </p>
          <p className="mt-2">
            Heads-up: Google refreshes subscribed calendars roughly once a day,
            so knockout games can take up to ~24h to appear there. Apple
            Calendar and Outlook refresh more often.
          </p>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Outlook</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Click the <strong>Outlook.com</strong> button, or</li>
          <li>
            In Outlook on the web: <strong>Add calendar → Subscribe from web</strong>,
            paste your calendar link, name it, and add.
          </li>
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-bold">Android</h2>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Google Calendar on Android has the same limitation as on iPhone — add
          the subscription once from a computer and it syncs to your phone. If
          you use another calendar app (e.g. Samsung Calendar synced to Google),
          the same applies: subscribe via Google on desktop.
        </p>
      </section>

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
