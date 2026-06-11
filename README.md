# World Cup Calendar

Build a custom FIFA World Cup 2026 calendar with only the teams you follow, then
subscribe to it from Google Calendar, Apple Calendar or Outlook. The feed is a
live ICS subscription: knockout games appear automatically as teams qualify,
with spoiler protection by default (match-ups hidden until 18h after the
deciding game).

## How it works

- **Fixture data** comes from [openfootball/worldcup.json](https://github.com/openfootball/worldcup.json)
  (public domain, auto-updated during the tournament), fetched server-side with a
  30-minute cache. [data/fixtures-fallback.json](data/fixtures-fallback.json) is a
  pre-tournament snapshot that both serves as an offline fallback **and** preserves
  the original bracket structure (`1A`, `W73`, …) so spoiler timing can be computed
  after the live feed replaces placeholders with real team names.
- **Feeds** are generated on demand:
  - `/cal/{slug}.ics` — pre-made calendars (all games, favourites, regions…), defined in [lib/calendar.ts](lib/calendar.ts)
  - `/api/cal?teams=usa,jpn&finals=1&spoilers=safe` — stateless custom feeds
  - `/c/{id}/feed.ics` — saved custom feeds (editable via secret link)
- **Spoiler protection**: a bracket slot is revealed at
  `max(decidingMatchEnd, min(decidingMatchEnd + 18h, kickoff − 6h))` — see
  [lib/calendar.ts](lib/calendar.ts).
- **Storage**: saved calendars live in Supabase in production (a local JSON file
  in dev). The unguessable calendar id is the edit credential — no login needed.

## Develop

```bash
npm install
npm run dev
```

## Deploy (free)

1. Push this repo to GitHub and import it in [Vercel](https://vercel.com/new) (Hobby plan).
2. Set the env var `NEXT_PUBLIC_SITE_URL` to your production URL (e.g. `https://yourdomain.com`).
3. (Optional, enables "save & edit later") Create a free [Supabase](https://supabase.com) project, run the SQL below, then set `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in Vercel. Without these, everything else still works — saving just returns a friendly error.

```sql
create table calendars (
  id text primary key,
  config jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table calendars enable row level security; -- no public policies: server-only access
```

4. Add your custom domain in Vercel → Project → Domains.

## Notes

- Google Calendar refreshes subscribed feeds roughly once a day; Apple Calendar
  is user-configurable (15 min – weekly). The feed advertises `REFRESH-INTERVAL: PT4H`.
- Google Calendar's mobile apps cannot add URL subscriptions — the UX routes
  mobile Google users to "email me the link" + desktop instructions.
