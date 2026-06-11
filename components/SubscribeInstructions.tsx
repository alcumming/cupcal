"use client";

import { Tabs } from "@base-ui/react/tabs";

const TAB_CLASS =
  "rounded-full px-4 py-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 transition data-selected:bg-zinc-900 data-selected:text-white dark:data-selected:bg-zinc-100 dark:data-selected:text-zinc-900";

export default function SubscribeInstructions() {
  return (
    <Tabs.Root defaultValue="apple" className="mt-8">
      <Tabs.List className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-2">
        <Tabs.Tab value="apple" className={TAB_CLASS}> iPhone &amp; Mac</Tabs.Tab>
        <Tabs.Tab value="google" className={TAB_CLASS}>Google Calendar</Tabs.Tab>
        <Tabs.Tab value="outlook" className={TAB_CLASS}>Outlook</Tabs.Tab>
        <Tabs.Tab value="android" className={TAB_CLASS}>Android</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel value="apple" keepMounted className="mt-6 data-hidden:hidden">
        <h2 className="text-xl font-bold"> iPhone &amp; iPad (Apple Calendar)</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Tap <strong>Add to Apple Calendar</strong> on your calendar page.</li>
          <li>iOS shows a &ldquo;Subscribe to calendar&rdquo; dialog — tap <strong>Subscribe</strong>.</li>
          <li>Done. To control refresh frequency: Settings → Apps → Calendar → Accounts → your subscription → Fetch.</li>
        </ol>
        <p className="mt-2 text-sm text-zinc-500">
          Also works on Mac: the same button opens Calendar with a subscribe prompt.
        </p>
      </Tabs.Panel>

      <Tabs.Panel value="google" keepMounted className="mt-6 data-hidden:hidden">
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
      </Tabs.Panel>

      <Tabs.Panel value="outlook" keepMounted className="mt-6 data-hidden:hidden">
        <h2 className="text-xl font-bold">Outlook</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-zinc-700 dark:text-zinc-300">
          <li>Click the <strong>Outlook.com</strong> button, or</li>
          <li>
            In Outlook on the web: <strong>Add calendar → Subscribe from web</strong>,
            paste your calendar link, name it, and add.
          </li>
        </ol>
      </Tabs.Panel>

      <Tabs.Panel value="android" keepMounted className="mt-6 data-hidden:hidden">
        <h2 className="text-xl font-bold">Android</h2>
        <p className="mt-3 text-zinc-700 dark:text-zinc-300">
          Google Calendar on Android has the same limitation as on iPhone — add
          the subscription once from a computer and it syncs to your phone. If
          you use another calendar app (e.g. Samsung Calendar synced to Google),
          the same applies: subscribe via Google on desktop.
        </p>
      </Tabs.Panel>
    </Tabs.Root>
  );
}
