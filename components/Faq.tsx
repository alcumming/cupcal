"use client";

import { Accordion } from "@base-ui/react/accordion";

export default function Faq({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <Accordion.Root className="mt-6 space-y-3">
      {faqs.map((f) => (
        <Accordion.Item
          key={f.q}
          className="rounded-2xl border border-zinc-200 dark:border-zinc-800"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-4 p-5 text-left font-semibold">
              {f.q}
              <span className="text-zinc-400 transition-transform group-data-panel-open:rotate-180" aria-hidden>
                ▾
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Panel className="px-5 pb-5 text-zinc-600 dark:text-zinc-400">
            {f.a}
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
