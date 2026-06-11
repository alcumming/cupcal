"use client";

import { useState } from "react";
import SubscribeButtons from "./SubscribeButtons";

export default function PremadeCard({
  slug,
  title,
  emoji,
  description,
}: {
  slug: string;
  title: string;
  emoji: string;
  description: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col">
      <div className="text-3xl">{emoji}</div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>
      {open ? (
        <div className="mt-4">
          <SubscribeButtons feedPath={`/cal/${slug}.ics`} calendarName={title} />
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mt-4 rounded-xl bg-zinc-900 dark:bg-zinc-100 px-4 py-2.5 font-semibold text-white dark:text-zinc-900 transition hover:bg-zinc-700 dark:hover:bg-zinc-300"
        >
          Subscribe
        </button>
      )}
    </div>
  );
}
