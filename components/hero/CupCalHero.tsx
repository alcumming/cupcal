"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { LazyMotion, domAnimation } from "framer-motion";
import { ArrowRight } from "@phosphor-icons/react/ssr";
import PitchField from "./PitchField";

/**
 * CupCal animated hero: gold wordmark + tagline, primary CTA, and the
 * interactive pitch/calendar scene (docs/cupcal-hero-spec.md).
 */
export default function CupCalHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0.01 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="mx-auto max-w-5xl px-4 pt-12 pb-10 text-center">
      <Image
        src="/hero/fifa26-logo.png"
        alt="FIFA World Cup 26"
        width={52}
        height={80}
        priority
        className="mx-auto h-20 w-auto"
      />
      <h1 className="font-black text-[#9D6F19] mt-3 text-6xl leading-tight sm:text-[80px] sm:leading-[96px]">
        CupCal
      </h1>
      <p className="font-display font-black text-balance text-[#262626] mt-4 text-4xl leading-tight sm:mt-[24px] sm:text-[48px] sm:leading-[50px]">
        Pick teams to follow and sync all their games to your calendar
      </p>

      <div ref={containerRef} className="mt-8 aspect-[1556/360] w-full sm:mt-[70px]">
        <LazyMotion features={domAnimation} strict>
          <PitchField paused={offscreen} />
        </LazyMotion>
      </div>

      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:mt-[44px]">
        <Link
          href="/build"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3.5 font-semibold text-white transition hover:bg-emerald-700"
        >
          Build my calendar <ArrowRight size={18} weight="bold" />
        </Link>
        <a
          href="#calendars"
          className="rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-3.5 font-semibold transition hover:border-emerald-500"
        >
          Ready-made calendars
        </a>
      </div>
      <p className="mt-6 text-center font-sans text-[18px] font-medium leading-[20px] text-[#262626]">
        Local kick-off times. No spoilers. Stays updated as the tournament unfolds.
      </p>
    </section>
  );
}
