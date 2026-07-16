## Why

Goal weight is currently ephemeral component state — it vanishes on page refresh. Users need their goal weight to persist across sessions so they don't have to re-enter it every time they open the app. This also lays the foundation for future persisted settings (calculation mode, timeframe windows, etc.).

## What Changes

- Add a `config` key-value table to the SQLite database
- Add a config API layer with typed accessors (`getConfig`, `setConfig`, `useConfig` hook)
- Move goal weight from `GoalCard`'s local `useState` to persisted config
- Make `GoalCard` read from config on mount and write to config on change

## Capabilities

### New Capabilities

- `config-persistence`: A key-value config store in SQLite with typed TypeScript accessors, enabling settings to survive page refresh and app restart.

### Modified Capabilities

<!-- None — no existing capabilities to modify -->

## Impact

- `src/lib/db.ts`: new `config` table in `CREATE TABLE IF NOT EXISTS`
- `src/lib/configApi.ts` (new): typed config read/write functions, TanStack Query hook
- `src/lib/queryKeys.ts`: new `["config"]` query key
- `src/components/GoalCard.tsx`: replace `useState` with `useConfig` hook
