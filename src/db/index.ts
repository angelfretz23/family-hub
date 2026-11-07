import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

function resolveDbPath() {
  const fromEnv = process.env.DATABASE_URL;
  if (fromEnv) {
    return fromEnv.startsWith("file:")
      ? fromEnv.replace(/^file:/, "")
      : fromEnv;
  }
  return path.join(process.cwd(), "data", "family-hub.db");
}

const dbPath = resolveDbPath();
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const sqlite = new Database(dbPath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

sqlite.exec(`
  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3F6F5B',
    role TEXT NOT NULL DEFAULT 'child',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    avatar_url TEXT
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    all_day INTEGER NOT NULL DEFAULT 0,
    location TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS event_people (
    event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    PRIMARY KEY (event_id, person_id)
  );

  CREATE TABLE IF NOT EXISTS rules (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    body TEXT NOT NULL DEFAULT '',
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    assignee_id INTEGER REFERENCES people(id) ON DELETE SET NULL,
    due_at TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS routines (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    band TEXT NOT NULL DEFAULT 'morning',
    active INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS routine_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS routine_runs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    routine_id INTEGER NOT NULL REFERENCES routines(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    run_date TEXT NOT NULL,
    completed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS routine_step_checks (
    run_id INTEGER NOT NULL REFERENCES routine_runs(id) ON DELETE CASCADE,
    step_id INTEGER NOT NULL REFERENCES routine_steps(id) ON DELETE CASCADE,
    checked_at TEXT NOT NULL,
    PRIMARY KEY (run_id, step_id)
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT '⭐',
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    band TEXT NOT NULL DEFAULT 'morning',
    variants TEXT NOT NULL DEFAULT '["boolean"]',
    star_reward INTEGER NOT NULL DEFAULT 1,
    sort_order INTEGER NOT NULL DEFAULT 0,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS task_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    log_date TEXT NOT NULL,
    completed INTEGER NOT NULL DEFAULT 1,
    minutes INTEGER,
    count_value INTEGER,
    book_title TEXT,
    stars_earned INTEGER NOT NULL DEFAULT 0,
    notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
`);

try {
  sqlite.exec(`ALTER TABLE people ADD COLUMN avatar_url TEXT`);
} catch {
  // column already exists
}

export const db = drizzle(sqlite, { schema });
export type Db = typeof db;
