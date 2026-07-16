## ADDED Requirements

### Requirement: Config storage

The system SHALL persist application settings in a `config` table with key-value rows stored in SQLite.

#### Scenario: Table exists after database initialization

- **WHEN** the app calls `getDb()` — whether on a fresh install or an upgrade from a version without the `config` table
- **THEN** a `config` table with `key TEXT PRIMARY KEY` and `value TEXT NOT NULL` columns exists, created via `CREATE TABLE IF NOT EXISTS`

#### Scenario: Default values are seeded

- **WHEN** the `config` table is initialized
- **THEN** each entry in the `DEFAULTS` map from `configApi.ts` is seeded into the table via `INSERT OR IGNORE`, so the table is never empty for those keys

#### Scenario: Seeding does not overwrite existing values

- **WHEN** the `DEFAULTS` map gains a new config key
- **THEN** existing config rows for other keys remain unchanged

#### Scenario: Setting is stored and retrieved

- **WHEN** a config value is written for a given key
- **THEN** subsequent reads for that key return the stored value

#### Scenario: Setting is updated

- **WHEN** a config value is written for an existing key
- **THEN** the stored value is replaced with the new value

### Requirement: Typed config access

The system SHALL provide typed accessor functions that return config values with appropriate TypeScript types and fallback defaults.

#### Scenario: Reading an existing string config

- **WHEN** reading a string config key that has a stored value
- **THEN** the stored string value is returned

#### Scenario: Reading a missing config with fallback

- **WHEN** reading a config key that has no stored value
- **THEN** the caller-provided default value is returned

#### Scenario: Reading a numeric config

- **WHEN** reading a numeric config key
- **THEN** the stored value is parsed as a number and returned

### Requirement: Config is queryable via TanStack Query

The system SHALL expose a `useConfig` hook backed by TanStack Query so components can reactively consume config values.

#### Scenario: Component reads config on mount

- **WHEN** a component uses the `useConfig` hook
- **THEN** the hook returns typed accessor functions that read and write config values
  by key, with appropriate TypeScript return types and caller-provided fallback defaults

#### Scenario: Config mutation invalidates query cache

- **WHEN** a config value is updated via `setConfig`
- **THEN** the TanStack Query cache for the config query is invalidated, causing components to re-render with the new value

### Requirement: Goal weight persistence

The system SHALL store the user's goal weight in the config table under the key `goal_weight_kg` and persist it across app restarts.

#### Scenario: Goal weight survives page refresh

- **WHEN** the user enters a goal weight and refreshes the page
- **THEN** the goal weight input is pre-populated with the previously entered value

#### Scenario: Goal weight is updated

- **WHEN** the user changes their goal weight
- **THEN** the new value is persisted to the config table
