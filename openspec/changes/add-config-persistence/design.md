## Context

The app currently has one SQLite table (`weight_entries`) and no mechanism for persisting user settings. The goal weight in `GoalCard` uses React `useState` — it disappears on page refresh. The app needs a lightweight config store that can grow over time without schema migrations, aligning with the project's agile, local-first nature.

## Goals / Non-Goals

**Goals:**

- Persist goal weight so it survives page refresh and app restart
- Provide a key-value config store extensible for future settings (mode, window days, etc.)
- Integrate with existing TanStack Query patterns for reactive data flow

**Non-Goals:**

- A full settings UI page — config editing stays inline (GoalCard keeps its input)
- Multi-row or typed column table — key-value is intentionally flexible
- Migration framework — new config keys are added via the accessor layer, not schema changes

## Decisions

### Key-value config table

**Decision**: Single `config` table with `key TEXT PRIMARY KEY, value TEXT NOT NULL`.

**Alternatives considered**:

- **Typed single-row table** (columns: goal_weight_kg REAL, window_days INTEGER, ...): Rejected because every new config requires `ALTER TABLE`, which is fragile without a migration framework and adds friction to an agile project.
- **JSON blob**: Rejected because you can't query individual keys from SQL and there's no versioning story.

**Rationale**: Key-value is schema-flexible — adding a new setting is inserting a row. No migrations. The TypeScript accessor layer provides type safety on read.

### Default seeding

**Decision**: A `DEFAULTS` map in `configApi.ts` is the single source of truth for all known config keys and their default values. During initialization, `seedDefaults(db)` iterates the map and runs `INSERT OR IGNORE` for each entry.

**Rationale**: Adding a new config key is adding one line to the map — no SQL changes, no touching `db.ts`. `INSERT OR IGNORE` is idempotent: on first run it seeds all defaults; on upgrade it seeds only new keys; existing values are never overwritten.

### Config API: separate module

**Decision**: New file `src/lib/configApi.ts` with a `DEFAULTS` map, `seedDefaults(db)`, `getAllConfig()`, `setConfig(key, value)`, typed accessors (`getConfigString`, `getConfigNumber`), and a `useConfig()` hook.

**Rationale**: Colocating the DEFAULTS map, seeding, reads, writes, and the React hook in one module keeps all config concerns together. `db.ts` only invokes `seedDefaults` after table creation — it knows nothing about what keys exist.

### GoalCard migration: useState → useConfig

**Decision**: `GoalCard` reads `goal_weight_kg` from `useConfig()` instead of local state. On change, it calls `setConfig`.

**Rationale**: Minimal change to the existing component. The input behavior is identical — the only difference is the value survives refresh. No need for a separate Settings view at this stage.

### Query key: `["config"]`

**Decision**: Single `["config"]` query key for the entire config map, not granular per-key keys.

**Rationale**: Config is small (a handful of rows), read once and cached. Per-key queries would add complexity with no performance benefit.

## Risks / Trade-offs

- **Everything is TEXT in SQLite**: Type coercion happens in TypeScript, not the database. A user could manually insert `"banana"` into `goal_weight_kg`. Mitigation: `setConfig` validates at the TypeScript boundary — numeric keys reject non-numeric input.
- **No per-key reactivity**: Updating one config invalidates the whole config query. For a handful of settings in a local app, this is negligible. If config grows large, per-key queries can be added later.
