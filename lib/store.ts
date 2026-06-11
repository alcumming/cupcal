import { CalendarConfig } from "./calendar";
import { promises as fs } from "fs";
import path from "path";
import crypto from "crypto";

export interface SavedCalendar {
  id: string;
  config: CalendarConfig;
  createdAt: string;
  updatedAt: string;
}

export interface Store {
  create(config: CalendarConfig): Promise<SavedCalendar>;
  get(id: string): Promise<SavedCalendar | null>;
  update(id: string, config: CalendarConfig): Promise<SavedCalendar | null>;
}

// Unguessable, URL-friendly id — this IS the edit credential (secret link).
function newId(): string {
  return crypto.randomBytes(12).toString("base64url");
}

// ---- Supabase (production) ----
// Table:
//   create table calendars (
//     id text primary key,
//     config jsonb not null,
//     created_at timestamptz not null default now(),
//     updated_at timestamptz not null default now()
//   );
// Accessed with the service-role key from the server only; RLS stays enabled
// with no public policies, so the secret id is the only way in.

class SupabaseStore implements Store {
  constructor(private url: string, private key: string) {}

  private async req(method: string, pathname: string, body?: unknown) {
    const res = await fetch(`${this.url}/rest/v1/${pathname}`, {
      method,
      headers: {
        apikey: this.key,
        Authorization: `Bearer ${this.key}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: body ? JSON.stringify(body) : undefined,
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`Supabase ${method} ${pathname}: ${res.status}`);
    return res.json();
  }

  async create(config: CalendarConfig): Promise<SavedCalendar> {
    const id = newId();
    const [row] = await this.req("POST", "calendars", { id, config });
    return toSaved(row);
  }

  async get(id: string): Promise<SavedCalendar | null> {
    const rows = await this.req("GET", `calendars?id=eq.${encodeURIComponent(id)}&select=*`);
    return rows[0] ? toSaved(rows[0]) : null;
  }

  async update(id: string, config: CalendarConfig): Promise<SavedCalendar | null> {
    const rows = await this.req(
      "PATCH",
      `calendars?id=eq.${encodeURIComponent(id)}`,
      { config, updated_at: new Date().toISOString() }
    );
    return rows[0] ? toSaved(rows[0]) : null;
  }
}

interface CalendarRow {
  id: string;
  config: CalendarConfig;
  created_at: string;
  updated_at: string;
}

const toSaved = (row: CalendarRow): SavedCalendar => ({
  id: row.id,
  config: row.config,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

// ---- Local file (development) ----

class FileStore implements Store {
  private file = path.join(process.cwd(), ".data", "calendars.json");

  private async read(): Promise<Record<string, SavedCalendar>> {
    try {
      return JSON.parse(await fs.readFile(this.file, "utf8"));
    } catch {
      return {};
    }
  }

  private async write(data: Record<string, SavedCalendar>) {
    await fs.mkdir(path.dirname(this.file), { recursive: true });
    await fs.writeFile(this.file, JSON.stringify(data, null, 2));
  }

  async create(config: CalendarConfig): Promise<SavedCalendar> {
    const data = await this.read();
    const now = new Date().toISOString();
    const saved: SavedCalendar = { id: newId(), config, createdAt: now, updatedAt: now };
    data[saved.id] = saved;
    await this.write(data);
    return saved;
  }

  async get(id: string): Promise<SavedCalendar | null> {
    return (await this.read())[id] ?? null;
  }

  async update(id: string, config: CalendarConfig): Promise<SavedCalendar | null> {
    const data = await this.read();
    if (!data[id]) return null;
    data[id] = { ...data[id], config, updatedAt: new Date().toISOString() };
    await this.write(data);
    return data[id];
  }
}

export function getStore(): Store {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url && key) return new SupabaseStore(url, key);
  return new FileStore();
}
