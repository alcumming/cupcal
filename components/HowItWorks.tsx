"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Check,
  CheckCircle,
  Copy,
  CursorClick,
  GoogleLogo,
  AppleLogo,
  MicrosoftOutlookLogo,
} from "@phosphor-icons/react/ssr";
import Flag from "./Flag";

function TeamChip({ code, name, active }: { code: string; name: string; active?: boolean }) {
  const wasActive = useRef(active);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (active && !wasActive.current) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 400);
      wasActive.current = active;
      return () => clearTimeout(t);
    }
    wasActive.current = active;
  }, [active]);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-300 ${
        pulse ? "scale-110" : "scale-100"
      } ${
        active
          ? "border-emerald-600 bg-emerald-600 text-white"
          : "border-zinc-300 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"
      }`}
    >
      <Flag code={code} name={name} /> {name}
    </span>
  );
}

// Scalar cursor positions only — keyframe arrays that return to their
// starting value get silently skipped by framer-motion, so each stage is a
// distinct target the cursor tweens to.
const PICKER_CURSOR = {
  hidden: { left: "60%", top: "-10%", opacity: 0 },
  de: { left: "17%", top: "69%", opacity: 1 },
  eng: { left: "53%", top: "69%", opacity: 1 },
} as const;

function TeamPickerPreview({ hovered }: { hovered: boolean }) {
  const [active, setActive] = useState({ de: false, eng: false });
  const [cursor, setCursor] = useState<keyof typeof PICKER_CURSOR>("hidden");

  useEffect(() => {
    if (!hovered) {
      setCursor("hidden");
      setActive({ de: false, eng: false });
      return;
    }
    const timers = [
      setTimeout(() => setCursor("de"), 100),
      setTimeout(() => setActive((a) => ({ ...a, de: true })), 700),
      setTimeout(() => setCursor("eng"), 1300),
      setTimeout(() => setActive((a) => ({ ...a, eng: true })), 1900),
      setTimeout(() => setCursor("hidden"), 2300),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hovered]);

  return (
    <div className="relative w-full">
      <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/60 px-3 py-2 text-xs text-zinc-400">
        Search teams…
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <TeamChip code="br" name="Brazil" active />
        <TeamChip code="ar" name="Argentina" active />
        <TeamChip code="fr" name="France" active />
        <TeamChip code="de" name="Germany" active={active.de} />
        <TeamChip code="gb-eng" name="England" active={active.eng} />
        <TeamChip code="jp" name="Japan" />
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded bg-emerald-600">
          <Check size={10} weight="bold" className="text-white" />
        </span>
        Include semi-finals &amp; the final
      </label>
      <motion.div
        className="pointer-events-none absolute text-zinc-700 drop-shadow-sm dark:text-zinc-200"
        animate={PICKER_CURSOR[cursor]}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <CursorClick size={20} weight="fill" />
      </motion.div>
    </div>
  );
}

const SUBSCRIBE_CURSOR = {
  hidden: { left: "85%", top: "-15%", opacity: 0 },
  google: { left: "25%", top: "25%", opacity: 1 },
} as const;

const GOOGLE_SCALE = { idle: 1, down: 0.94, up: 1.06 } as const;

function SubscribePreview({ hovered }: { hovered: boolean }) {
  const [cursor, setCursor] = useState<keyof typeof SUBSCRIBE_CURSOR>("hidden");
  const [press, setPress] = useState<keyof typeof GOOGLE_SCALE>("idle");
  const [showAdded, setShowAdded] = useState(false);

  useEffect(() => {
    if (!hovered) {
      setCursor("hidden");
      setPress("idle");
      setShowAdded(false);
      return;
    }
    const timers = [
      setTimeout(() => setCursor("google"), 100),
      setTimeout(() => setPress("down"), 700),
      setTimeout(() => setPress("up"), 850),
      setTimeout(() => setPress("idle"), 1000),
      setTimeout(() => setShowAdded(true), 850),
      setTimeout(() => setCursor("hidden"), 1700),
      setTimeout(() => setShowAdded(false), 1700),
    ];
    return () => timers.forEach(clearTimeout);
  }, [hovered]);

  return (
    <div className="relative w-full">
      <div className="grid grid-cols-2 gap-2">
        <motion.div
          className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 py-2.5 text-xs font-semibold text-white"
          animate={{ scale: GOOGLE_SCALE[press] }}
          transition={{ duration: 0.15 }}
        >
          <GoogleLogo size={15} weight="bold" /> Google
        </motion.div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 py-2.5 text-xs font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
          <AppleLogo size={15} weight="fill" /> Apple
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-sky-600 py-2.5 text-xs font-semibold text-white">
          <MicrosoftOutlookLogo size={15} /> Outlook
        </div>
        <div className="flex items-center justify-center gap-1.5 rounded-lg bg-zinc-100 py-2.5 text-xs font-semibold text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
          <Copy size={15} /> Copy link
        </div>
      </div>
      <motion.div
        className="pointer-events-none absolute left-[6%] top-[4%] flex items-center gap-1 rounded-md bg-zinc-900 px-2 py-1 text-[10px] font-medium text-white dark:bg-white dark:text-zinc-900"
        animate={showAdded ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={{ duration: 0.25 }}
      >
        <CheckCircle size={12} weight="fill" className="text-emerald-400 dark:text-emerald-600" /> Added
      </motion.div>
      <motion.div
        className="pointer-events-none absolute text-zinc-700 drop-shadow-sm dark:text-zinc-200"
        animate={SUBSCRIBE_CURSOR[cursor]}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      >
        <CursorClick size={20} weight="fill" />
      </motion.div>
    </div>
  );
}

const CAL_TIMES = ["13:00", "14:00", "15:00", "16:00"];

function CalendarPreview({ hovered }: { hovered: boolean }) {
  return (
    <div className="relative w-full">
      <div className="grid grid-cols-[3rem_1fr]">
        {CAL_TIMES.map((t) => (
          <div key={t} className="contents">
            <div className="h-10 pr-2 text-right text-[11px] leading-10 text-zinc-400">{t}</div>
            <div className="h-10 border-t border-zinc-200 dark:border-zinc-800" />
          </div>
        ))}
      </div>
      <div className="absolute inset-y-0 left-12 right-0">
        <div className="absolute inset-x-1 top-[44px] flex h-8 items-center gap-1.5 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-[11px] font-medium">
          <Flag code="br" name="Brazil" />
          <span className="truncate">Brazil vs France</span>
          <Flag code="fr" name="France" />
        </div>
        <motion.div
          className="absolute inset-x-1 top-[124px] flex h-8 items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40 px-2 text-[11px] font-medium text-emerald-900 dark:text-emerald-300"
          initial={false}
          animate={hovered ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.96 }}
          transition={{ duration: 0.35, delay: hovered ? 0.3 : 0 }}
        >
          <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">NEW</span>
          <span className="truncate">Round of 16 added</span>
        </motion.div>
      </div>
    </div>
  );
}

const STEPS = [
  {
    title: "Pick your teams",
    body: "Choose who you follow. The semi-finals and final are included by default.",
    Preview: TeamPickerPreview,
  },
  {
    title: "Subscribe once",
    body: "Add the calendar to Google, Apple or Outlook in a tap. There's no account to create and nothing to install.",
    Preview: SubscribePreview,
  },
  {
    title: "It updates itself",
    body: "When your team reaches the knockouts, the new games appear on their own, and results stay hidden until you've had a chance to watch.",
    Preview: CalendarPreview,
  },
];

function StepCard({ step, index }: { step: (typeof STEPS)[number]; index: number }) {
  const [hovered, setHovered] = useState(false);
  const Preview = step.Preview;

  return (
    <li
      className="grid grid-rows-[auto_1fr] sm:grid-rows-[subgrid] sm:row-span-2 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="p-5 pb-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 font-bold text-white">
          {index + 1}
        </span>
        <h3 className="mt-3 font-semibold text-lg">{step.title}</h3>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.body}</p>
      </div>
      <div className="flex min-h-[180px] items-center overflow-hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5">
        <Preview hovered={hovered} />
      </div>
    </li>
  );
}

export default function HowItWorks() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <h2 className="text-2xl font-bold">How it works</h2>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Set it up once before kick-off on June 11, and it looks after itself for the rest of the tournament.
      </p>
      <ol className="mt-6 grid gap-6 sm:grid-cols-3 sm:grid-rows-[auto_1fr]">
        {STEPS.map((step, i) => (
          <StepCard key={step.title} step={step} index={i} />
        ))}
      </ol>
    </section>
  );
}
