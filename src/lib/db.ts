import Database from "@tauri-apps/plugin-sql";

let _db: Database | null = null;

const STORAGE_KEY = "heavy-detail-db-path";
const DEFAULT_PATH = "sqlite:heavy-detail.db";

export function getDbPath(): string {
  return localStorage.getItem(STORAGE_KEY) ?? DEFAULT_PATH;
}

export function setDbPath(path: string): void {
  localStorage.setItem(STORAGE_KEY, path);
}

export async function reloadDb(): Promise<void> {
  if (_db) {
    try {
      await _db.close();
    } catch {
      // ignore
    }
    _db = null;
  }
}

async function ensureSchema(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS weight_entries (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      date       TEXT    NOT NULL UNIQUE,
      weight_kg  REAL    NOT NULL,
      created_at TEXT    NOT NULL DEFAULT (datetime('now'))
    )
  `);
}

export async function getDb(): Promise<Database> {
  if (_db) return _db;
  _db = await Database.load(getDbPath());
  await ensureSchema(_db);
  return _db;
}
