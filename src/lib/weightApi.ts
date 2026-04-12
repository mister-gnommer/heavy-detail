import { getDb } from "./db";

export interface WeightEntry {
  id: number;
  date: string;
  weight_kg: number;
  created_at: string;
}

export async function addEntry(date: string, weight_kg: number): Promise<void> {
  const db = await getDb();
  await db.execute("INSERT OR REPLACE INTO weight_entries (date, weight_kg) VALUES (?, ?)", [
    date,
    weight_kg,
  ]);
}

export async function getAllEntries(): Promise<WeightEntry[]> {
  const db = await getDb();
  return db.select<WeightEntry[]>("SELECT * FROM weight_entries ORDER BY date DESC");
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM weight_entries WHERE id = ?", [id]);
}

export async function getRecentEntries(days: number): Promise<WeightEntry[]> {
  const db = await getDb();
  return db.select<WeightEntry[]>(
    `SELECT * FROM weight_entries
     WHERE date >= date('now', ?)
     ORDER BY date ASC`,
    [`-${days} days`]
  );
}
