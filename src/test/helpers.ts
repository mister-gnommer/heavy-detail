import type { WeightEntry } from "../lib/weightApi";

export function makeEntry(date: string, weight_kg: number): WeightEntry {
  return { id: 1, date, weight_kg, created_at: "2025-01-01T00:00:00Z" };
}

export function makeEntries(pairs: [string, number][]): WeightEntry[] {
  return pairs.map(([date, weight_kg], i) => ({ id: i + 1, date, weight_kg, created_at: "2025-01-01T00:00:00Z" }));
}
