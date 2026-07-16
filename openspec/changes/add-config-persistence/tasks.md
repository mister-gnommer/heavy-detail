## 1. Database

- [x] 1.1 Add `config` table (`key TEXT PRIMARY KEY, value TEXT NOT NULL`) to `CREATE TABLE IF NOT EXISTS` in `src/lib/db.ts`
- [x] 1.2 Invoke `seedDefaults(db)` after table creation so config table is populated on first run

## 2. Config API

- [x] 2.1 Create `src/lib/configApi.ts` with a `DEFAULTS` map of known keys and their default values
- [x] 2.2 Add `seedDefaults(db)` that iterates `DEFAULTS` and runs `INSERT OR IGNORE` for each entry
- [x] 2.3 Add `getAllConfig()` returning `Record<string, string>`
- [x] 2.4 Add `setConfig(key, value)` that inserts or replaces a config row
- [x] 2.5 Add `getConfigString(key, fallback)` and `getConfigNumber(key, fallback)` typed accessors
- [x] 2.6 Add `["config"]` query key to `src/lib/queryKeys.ts`

## 3. Config Hook

- [x] 3.1 Create `useConfig()` hook backed by `useQuery` / `useMutation` from TanStack Query, returning config map and a `setConfig` mutator

## 4. GoalCard Migration

- [x] 4.1 Replace `useState(goalKg)` in `GoalCard.tsx` with `useConfig()` — read `goal_weight_kg` from config, call `setConfig("goal_weight_kg", value)` on change

## 5. Tests

- [x] 5.1 Update `GoalCard.test.tsx` to wrap component with necessary providers (QueryClientProvider) and mock `useConfig` instead of simulating local state
- [x] 5.2 Verify existing tests pass after changes
