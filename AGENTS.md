# heavy-detail

A local-first Tauri 2.0 desktop app for tracking body weight and analyzing trends.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS v4
- Recharts (charts)
- TanStack Query (state)
- SQLite via `@tauri-apps/plugin-sql`
- `simple-statistics` (linear regression for goal date prediction)

## Architecture

- DB access from TypeScript via `tauri-plugin-sql` (`src/lib/db.ts`, `src/lib/weightApi.ts`)
- Business logic in `src/lib/analytics.ts`
- Components in `src/components/`
- Untested: `weightApi.ts` and `db.ts` (no business logic, depend on Tauri native runtime)
- Tests cover `analytics.ts`, `utils.ts`, and all components (RTL)

## Attribution

Follow code attribution rules in `~/.config/opencode/AGENTS.md`.
