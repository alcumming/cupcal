"use client";

import { useEffect, useState } from "react";
import {
  AppleLogo,
  GoogleLogo,
  MicrosoftOutlookLogo,
  Envelope,
  Copy,
  Check,
} from "@phosphor-icons/react/ssr";

type Platform = "ios" | "android" | "desktop";

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "desktop";
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/.test(ua)) return "ios";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

export default function SubscribeButtons({
  feedPath,
  calendarName = "World Cup 2026",
}: {
  feedPath: string; // e.g. "/cal/all-games.ics" or "/api/cal?teams=usa"
  calendarName?: string;
}) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setPlatform(detectPlatform());
    setOrigin(window.location.origin);
  }, []);

  if (!origin) return <div className="h-32" aria-hidden />;

  const httpsUrl = `${origin}${feedPath}`;
  const webcalUrl = httpsUrl.replace(/^https?:\/\//, "webcal://");
  const googleUrl = `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcalUrl)}`;
  const outlookUrl = `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpsUrl)}&name=${encodeURIComponent(calendarName)}`;

  const copy = async () => {
    await navigator.clipboard.writeText(httpsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mailto = `mailto:?subject=${encodeURIComponent(`My ${calendarName} calendar`)}&body=${encodeURIComponent(
    `Subscribe link for ${calendarName}:\n\n${httpsUrl}\n\nOn a computer, open Google Calendar → Settings → Add calendar → From URL and paste the link. On iPhone, just tap: ${webcalUrl}`
  )}`;

  const primary =
    "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition";

  return (
    <div className="space-y-2">
      {platform === "ios" && (
        <>
          <a href={webcalUrl} className={`${primary} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <AppleLogo size={20} weight="fill" /> Add to Apple Calendar — one tap
          </a>
          <a href={outlookUrl} target="_blank" rel="noopener" className={`${primary} bg-sky-600 text-white hover:bg-sky-700`}>
            <MicrosoftOutlookLogo size={20} /> Add to Outlook.com
          </a>
          <a href={mailto} className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}>
            <Envelope size={20} /> Use Google Calendar? Email me the link
          </a>
          <p className="text-xs text-zinc-500 px-1">
            Google Calendar can only add subscription links on a computer — email
            yourself the link, add it there once, and it syncs to your phone.
          </p>
        </>
      )}

      {platform === "android" && (
        <>
          <a href={googleUrl} className={`${primary} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <GoogleLogo size={20} weight="bold" /> Add to Google Calendar
          </a>
          <a href={outlookUrl} target="_blank" rel="noopener" className={`${primary} bg-sky-600 text-white hover:bg-sky-700`}>
            <MicrosoftOutlookLogo size={20} /> Add to Outlook.com
          </a>
          <a href={mailto} className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}>
            <Envelope size={20} /> Email me the link
          </a>
          <p className="text-xs text-zinc-500 px-1">
            If the Google Calendar app opens without an &ldquo;add&rdquo; option, open the
            link on a computer instead — it then syncs to your phone automatically.
          </p>
        </>
      )}

      {platform === "desktop" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <a href={googleUrl} target="_blank" rel="noopener" className={`${primary} bg-emerald-600 text-white hover:bg-emerald-700`}>
            <GoogleLogo size={20} weight="bold" /> Google Calendar
          </a>
          <a href={webcalUrl} className={`${primary} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`}>
            <AppleLogo size={20} weight="fill" /> Apple Calendar
          </a>
          <a href={outlookUrl} target="_blank" rel="noopener" className={`${primary} bg-sky-600 text-white hover:bg-sky-700`}>
            <MicrosoftOutlookLogo size={20} /> Outlook.com
          </a>
          <button onClick={copy} className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}>
            {copied ? <><Check size={20} weight="bold" /> Copied</> : <><Copy size={20} /> Copy link</>}
          </button>
        </div>
      )}

      {platform !== "desktop" && (
        <button onClick={copy} className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}>
          {copied ? <><Check size={20} weight="bold" /> Copied</> : <><Copy size={20} /> Copy subscribe link</>}
        </button>
      )}

      <p className="text-xs text-zinc-500 px-1">
        This is a live subscription — knockout games appear automatically as
        teams qualify.{" "}
        <a href="/how-to-subscribe" className="underline">Full instructions</a>
      </p>
    </div>
  );
}
