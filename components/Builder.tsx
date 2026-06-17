"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Switch } from "@base-ui/react/switch";
import { Toggle } from "@base-ui/react/toggle";
import { Input } from "@base-ui/react/input";
import { Dialog } from "@base-ui/react/dialog";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/ssr";
import { TEAMS, REGION_LABELS, Region } from "@/lib/teams";
import SubscribeButtons from "./SubscribeButtons";
import Flag from "./Flag";

const REGION_ORDER: Region[] = [
  "europe",
  "south-america",
  "north-america",
  "africa",
  "asia",
  "oceania",
];

export default function Builder() {
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [finals, setFinals] = useState(true);
  const [spoilers, setSpoilers] = useState<"safe" | "instant">("safe");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [loaded, setLoaded] = useState(!editId);

  // Editing an existing saved calendar: load its config
  useEffect(() => {
    if (!editId) return;
    fetch(`/api/calendars/${editId}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((saved) => {
        setSelected(new Set(saved.config.teams));
        setFinals(saved.config.finals);
        setSpoilers(saved.config.spoilers);
        setName(saved.config.name ?? "");
      })
      .finally(() => setLoaded(true));
  }, [editId]);

  const toggle = (code: string, pressed: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (pressed) next.add(code);
      else next.delete(code);
      return next;
    });
    setShowResult(false);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? TEAMS.filter((t) => t.name.toLowerCase().includes(q)) : TEAMS;
  }, [search]);

  const query = useMemo(() => {
    const q = new URLSearchParams();
    q.set("teams", [...selected].join(","));
    if (!finals) q.set("finals", "0");
    if (spoilers === "instant") q.set("spoilers", "instant");
    if (name) q.set("name", name);
    return q.toString();
  }, [selected, finals, spoilers, name]);

  const canGenerate = selected.size > 0 || finals;

  if (!loaded) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-zinc-500">Loading your calendar…</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-44 pt-10">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:underline">
        <ArrowLeft size={14} /> World Cup Calendar
      </Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        {editId ? "Edit your calendar" : "Pick your teams"}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Every game your teams play goes in your calendar — including knockout
        games as they qualify.
      </p>

      <Input
        type="search"
        placeholder="Search teams…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3 outline-none focus:border-emerald-500"
      />

      {REGION_ORDER.map((region) => {
        const teams = filtered.filter((t) => t.region === region);
        if (!teams.length) return null;
        return (
          <section key={region} className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {REGION_LABELS[region]}
            </h2>
            <div className="mt-2 flex flex-wrap gap-2">
              {teams.map((t) => (
                <Toggle
                  key={t.code}
                  pressed={selected.has(t.code)}
                  onPressedChange={(pressed) => toggle(t.code, pressed)}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-sm font-medium transition hover:border-emerald-500 data-pressed:border-emerald-600 data-pressed:bg-emerald-600 data-pressed:text-white"
                >
                  <Flag code={t.flag} name={t.name} /> {t.name}
                </Toggle>
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-6 space-y-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <Switch.Root
            checked={finals}
            onCheckedChange={(checked) => setFinals(checked)}
            className="mt-0.5 h-5 w-9 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 transition data-checked:bg-emerald-600"
          >
            <Switch.Thumb className="block h-4 w-4 rounded-full bg-white transition-transform data-checked:translate-x-4" />
          </Switch.Root>
          <span>
            <span className="font-medium">Include semi-finals &amp; the final</span>
            <span className="block text-sm text-zinc-500">
              Included by default, even if you don&apos;t pick a single team.
            </span>
          </span>
        </label>

        <label className="flex items-start gap-3 cursor-pointer">
          <Switch.Root
            checked={spoilers === "safe"}
            onCheckedChange={(checked) => setSpoilers(checked ? "safe" : "instant")}
            className="mt-0.5 h-5 w-9 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 p-0.5 transition data-checked:bg-emerald-600"
          >
            <Switch.Thumb className="block h-4 w-4 rounded-full bg-white transition-transform data-checked:translate-x-4" />
          </Switch.Root>
          <span>
            <span className="font-medium">Spoiler protection</span>
            <span className="block text-sm text-zinc-500">
              Knockout match-ups stay hidden until 18 hours after the deciding
              game, so results aren&apos;t spoiled. Turn off to see them immediately.
            </span>
          </span>
        </label>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold">{selected.size}</span>{" "}
              {selected.size === 1 ? "team" : "teams"}
              {finals && " + semis & final"}
            </p>
            <button
              onClick={() => setShowResult(true)}
              disabled={!canGenerate}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
            >
              Get my calendar <ArrowRight size={18} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      <Dialog.Root open={showResult} onOpenChange={setShowResult}>
        <Dialog.Portal>
          <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0" />
          <Dialog.Popup className="fixed inset-x-0 bottom-0 flex max-h-[90vh] w-full flex-col rounded-t-3xl bg-white dark:bg-zinc-900 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl transition-all sm:inset-x-auto sm:left-1/2 sm:bottom-auto sm:top-1/2 sm:w-full sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl data-starting-style:translate-y-full data-starting-style:opacity-0 data-ending-style:translate-y-full data-ending-style:opacity-0 sm:data-starting-style:translate-y-4 sm:data-ending-style:translate-y-4">
            <div className="mx-auto mb-2 h-1.5 w-10 shrink-0 rounded-full bg-zinc-300 dark:bg-zinc-700 sm:hidden" />
            <Dialog.Title className="font-semibold mb-3">Your calendar is ready</Dialog.Title>
            <div className="flex-1 overflow-y-auto">
              <SubscribeButtons
                feedPath={`/api/cal?${query}`}
                calendarName={name || "My World Cup 2026"}
                hideCopy
              />
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </main>
  );
}
