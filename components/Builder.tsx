"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { TEAMS, REGION_LABELS, Region } from "@/lib/teams";
import SubscribeButtons from "./SubscribeButtons";

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
  const router = useRouter();
  const editId = searchParams.get("edit");

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [finals, setFinals] = useState(true);
  const [spoilers, setSpoilers] = useState<"safe" | "instant">("safe");
  const [name, setName] = useState("");
  const [search, setSearch] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
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
      .catch(() => setSaveError("Couldn't load that calendar — the link may be wrong."))
      .finally(() => setLoaded(true));
  }, [editId]);

  const toggle = (code: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
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

  const save = async () => {
    setSaving(true);
    setSaveError("");
    const body = { teams: [...selected], finals, spoilers, name: name || undefined };
    try {
      const res = editId
        ? await fetch(`/api/calendars/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          })
        : await fetch("/api/calendars", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      router.push(`/c/${editId ?? data.id}${editId ? "?updated=1" : ""}`);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Something went wrong");
      setSaving(false);
    }
  };

  if (!loaded) {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-zinc-500">Loading your calendar…</main>;
  }

  return (
    <main className="mx-auto max-w-3xl px-4 pb-44 pt-10">
      <Link href="/" className="text-sm text-zinc-500 hover:underline">← World Cup Calendar</Link>
      <h1 className="mt-3 text-3xl font-bold tracking-tight">
        {editId ? "Edit your calendar" : "Pick your teams"}
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Every game your teams play goes in your calendar — including knockout
        games as they qualify.
      </p>

      <div className="mt-6 space-y-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-4">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={finals}
            onChange={(e) => setFinals(e.target.checked)}
            className="mt-1 h-5 w-5 accent-emerald-600"
          />
          <span>
            <span className="font-medium">Include semi-finals &amp; the final</span>
            <span className="block text-sm text-zinc-500">
              The games everyone watches — on by default.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={spoilers === "safe"}
            onChange={(e) => setSpoilers(e.target.checked ? "safe" : "instant")}
            className="mt-1 h-5 w-5 accent-emerald-600"
          />
          <span>
            <span className="font-medium">Spoiler protection</span>
            <span className="block text-sm text-zinc-500">
              Knockout match-ups stay hidden until 18 hours after the deciding
              game, so results aren&apos;t spoiled. Turn off to see them immediately.
            </span>
          </span>
        </label>
      </div>

      <input
        type="search"
        placeholder="Search teams…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mt-6 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-3 outline-none focus:border-emerald-500"
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
              {teams.map((t) => {
                const on = selected.has(t.code);
                return (
                  <button
                    key={t.code}
                    onClick={() => toggle(t.code)}
                    aria-pressed={on}
                    className={`rounded-full border px-3 py-2 text-sm font-medium transition ${
                      on
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : "border-zinc-300 dark:border-zinc-700 hover:border-emerald-500"
                    }`}
                  >
                    {t.flag} {t.name}
                  </button>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 border-t border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur">
        <div className="mx-auto max-w-3xl px-4 py-3">
          {!showResult ? (
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                <span className="font-semibold">{selected.size}</span>{" "}
                {selected.size === 1 ? "team" : "teams"}
                {finals && " + semis & final"}
              </p>
              <button
                onClick={() => setShowResult(true)}
                disabled={!canGenerate}
                className="rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-40"
              >
                Get my calendar →
              </button>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto py-1">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Your calendar is ready</h3>
                <button onClick={() => setShowResult(false)} className="text-sm text-zinc-500 hover:underline">
                  ← keep editing
                </button>
              </div>
              <input
                type="text"
                placeholder="Name it (optional) — e.g. ‘Our World Cup’"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                className="my-3 w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-transparent px-4 py-2 text-sm outline-none focus:border-emerald-500"
              />
              <SubscribeButtons
                feedPath={`/api/cal?${query}`}
                calendarName={name || "My World Cup 2026"}
              />
              <div className="mt-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <button
                  onClick={save}
                  disabled={saving}
                  className="w-full rounded-xl border border-emerald-600 px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400 transition hover:bg-emerald-50 dark:hover:bg-emerald-950 disabled:opacity-40"
                >
                  {saving
                    ? "Saving…"
                    : editId
                      ? "💾 Save changes"
                      : "💾 Save so I can edit it later (no signup)"}
                </button>
                {saveError && <p className="mt-2 text-sm text-red-600">{saveError}</p>}
                {!editId && (
                  <p className="mt-2 text-xs text-zinc-500">
                    Saving gives you a private link to add or remove teams later —
                    your subscribed calendar updates in place.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
