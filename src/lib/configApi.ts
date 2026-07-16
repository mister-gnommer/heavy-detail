import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type Database from "@tauri-apps/plugin-sql";
import { getDb } from "./db";
import { queryKeys } from "./queryKeys";
import { parseDecimal } from "./utils";

export const DEFAULTS: Record<string, string> = {
  goal_weight_kg: "85",
};

const NUMERIC_KEYS = new Set(["goal_weight_kg"]);

export async function seedDefaults(db: Database): Promise<void> {
  for (const [key, value] of Object.entries(DEFAULTS)) {
    await db.execute("INSERT OR IGNORE INTO config (key, value) VALUES (?, ?)", [key, value]);
  }
}

async function getAllConfig(): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<{ key: string; value: string }[]>("SELECT key, value FROM config");
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.key] = row.value;
  }
  return result;
}

export async function setConfig(key: string, value: string): Promise<void> {
  if (NUMERIC_KEYS.has(key)) {
    if (value !== "" && isNaN(parseDecimal(value))) {
      throw new Error(`Config key "${key}" requires a numeric value`);
    }
  }
  const db = await getDb();
  await db.execute("INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)", [key, value]);
}

export function getConfigString(
  config: Record<string, string>,
  key: string,
  fallback: string
): string {
  return config[key] ?? fallback;
}

export function getConfigNumber(
  config: Record<string, string>,
  key: string,
  fallback: number
): number {
  const value = config[key];
  if (value === undefined || value === "") return fallback;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? fallback : parsed;
}

export function useConfig() {
  const queryClient = useQueryClient();

  const { data: config = {}, isLoading } = useQuery({
    queryKey: queryKeys.config,
    queryFn: getAllConfig,
  });

  const mutation = useMutation({
    mutationFn: ({ key, value }: { key: string; value: string }) => setConfig(key, value),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.config }),
  });

  return {
    getString: (key: string, fallback: string) => config[key] ?? fallback,
    getNumber: (key: string, fallback: number) => {
      const value = config[key];
      if (value === undefined || value === "") return fallback;
      const parsed = parseFloat(value);
      return isNaN(parsed) ? fallback : parsed;
    },
    setValue: (key: string, value: string) => mutation.mutate({ key, value }),
    isLoading,
    isSaving: mutation.isPending,
    error: mutation.error,
  };
}
