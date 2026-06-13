"use client";

import { Dialog } from "@base-ui/react/dialog";
import { X } from "@phosphor-icons/react/ssr";
import SubscribeButtons from "./SubscribeButtons";
import PremadeIcon from "./PremadeIcon";

export default function PremadeCard({
  slug,
  title,
  icon,
  description,
}: {
  slug: string;
  title: string;
  icon: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 p-5 flex flex-col">
      <PremadeIcon name={icon} size={30} className="text-emerald-600" />
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 flex-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>

      <Dialog.Root>
        <Dialog.Trigger className="mt-4 rounded-xl bg-[#EBE2D1] px-4 py-2.5 font-semibold text-[#8A5C06] transition hover:bg-[#E2D5BC] active:bg-[#D9C8A8]">
          Subscribe
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0" />
          <Dialog.Popup className="fixed inset-x-4 bottom-4 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:inset-x-auto sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 rounded-2xl bg-white dark:bg-zinc-900 p-5 shadow-xl transition-all data-starting-style:opacity-0 data-starting-style:translate-y-4 data-ending-style:opacity-0">
            <div className="flex items-start justify-between gap-4">
              <Dialog.Title className="flex items-center gap-2 text-lg font-semibold">
                <PremadeIcon name={icon} size={22} className="text-emerald-600" />
                {title}
              </Dialog.Title>
              <Dialog.Close className="rounded-lg px-2 py-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Close">
                <X size={18} weight="bold" />
              </Dialog.Close>
            </div>
            <Dialog.Description className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              {description}
            </Dialog.Description>
            <div className="mt-4">
              <SubscribeButtons feedPath={`/cal/${slug}.ics`} calendarName={title} />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
