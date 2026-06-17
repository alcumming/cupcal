"use client";

import { useEffect, useState } from "react";
import {
  AppleLogo,
  GoogleLogo,
  MicrosoftOutlookLogo,
  Envelope,
  Copy,
  Check,
  ArrowLeft,
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
  hideCopy = false,
}: {
  feedPath: string; // e.g. "/cal/all-games.ics" or "/api/cal?teams=usa"
  calendarName?: string;
  hideCopy?: boolean;
}) {
  const [platform, setPlatform] = useState<Platform>("desktop");
  const [origin, setOrigin] = useState("");
  const [copied, setCopied] = useState(false);
  const [googleExpanded, setGoogleExpanded] = useState(false);

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

  const googlePanel = (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 space-y-3">
      <button
        onClick={() => setGoogleExpanded(false)}
        className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
      >
        <ArrowLeft size={14} /> Back
      </button>
      <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Google Calendar can&apos;t add subscriptions on mobile.
      </p>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        You need to do this once on a computer — it then syncs to your phone automatically.
      </p>
      <a
        href={mailto}
        className={`${primary} bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300`}
      >
        <Envelope size={20} /> Email me the link
      </a>
      <button
        onClick={copy}
        className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}
      >
        {copied ? <><Check size={20} weight="bold" /> Copied!</> : <><Copy size={20} /> Copy the link</>}
      </button>
    </div>
  );

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
          {googleExpanded ? googlePanel : (
            <button
              onClick={() => setGoogleExpanded(true)}
              className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}
            >
              <GoogleLogo size={20} weight="bold" /> Google Calendar
            </button>
          )}
        </>
      )}

      {platform === "android" && (
        <>
          {googleExpanded ? googlePanel : (
            <button
              onClick={() => setGoogleExpanded(true)}
              className={`${primary} bg-emerald-600 text-white hover:bg-emerald-700`}
            >
              <GoogleLogo size={20} weight="bold" /> Google Calendar
            </button>
          )}
          <a href={outlookUrl} target="_blank" rel="noopener" className={`${primary} bg-sky-600 text-white hover:bg-sky-700`}>
            <MicrosoftOutlookLogo size={20} /> Add to Outlook.com
          </a>
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
          <a href={outlookUrl} target="_blank" rel="noopener" className={`${primary} bg-sky-600 text-white hover:bg-sky-700 ${hideCopy ? "sm:col-span-2" : ""}`}>
            <MicrosoftOutlookLogo size={20} /> Outlook.com
          </a>
          {!hideCopy && (
            <button onClick={copy} className={`${primary} bg-zinc-100 text-zinc-900 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700`}>
              {copied ? <><Check size={20} weight="bold" /> Copied</> : <><Copy size={20} /> Copy link</>}
            </button>
          )}
        </div>
      )}

      {platform !== "desktop" && !googleExpanded && !hideCopy && (
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
