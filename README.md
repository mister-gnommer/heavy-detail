# heavy-detail

> **NOTICE: This project was entirely AI-generated (Claude Sonnet 4.6 via Claude Code) and has not yet been human-reviewed. It will be reviewed and cleaned up when the author finds the time. Use at your own risk.**

A local-first desktop app for tracking body weight and analyzing trends. Built with Tauri 2.0.

## What it does

- Log daily weight entries
- View raw weigh-ins alongside a 7-day rolling average on a line chart
- See the gap between your scale reading and your actual trend
- Set a goal weight and get a projected reach date based on linear regression of recent data
- All data stays on your machine in a local SQLite file — no account, no server, no cloud

## Stack

- **Shell**: [Tauri 2.0](https://tauri.app/) (Rust backend, OS WebView frontend)
- **Frontend**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **State**: TanStack Query
- **Storage**: SQLite via `@tauri-apps/plugin-sql`
- **Math**: `simple-statistics` (linear regression for goal date prediction)

## Prerequisites

Before building, install the required toolchain:

```bash
# Rust (required by Tauri)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"

# System libraries (Fedora/RHEL)
sudo dnf install -y webkit2gtk4.1-devel libsoup3-devel

# System libraries (Ubuntu/Debian)
# sudo apt install libwebkit2gtk-4.1-dev libsoup-3.0-dev
```

## Development

```bash
npm install
npm run tauri dev
```

First build takes 10–20 minutes (cold Rust compile). Subsequent builds are fast.

## Build

```bash
npm run tauri build
```

Produces a native binary in `src-tauri/target/release/` and platform packages in `src-tauri/target/release/bundle/`.

## Data

Weight entries are stored in a SQLite database at:

- **Linux**: `~/.config/com.heavydetail.app/heavy-detail.db`
- **macOS**: `~/Library/Application Support/com.heavydetail.app/heavy-detail.db`
- **Windows**: `%APPDATA%\com.heavydetail.app\heavy-detail.db`

The `.db` file is excluded from this repository.

## Architecture notes

Database access is handled via `tauri-plugin-sql` directly from TypeScript (`src/lib/db.ts`, `src/lib/weightApi.ts`). This was a deliberate initial choice to avoid Rust boilerplate for a simple CRUD schema. The idiomatic Tauri approach would be to move queries into Rust commands — tracked in TODO below.

## Tests

```bash
npm test              # run once
npm run test:watch    # watch mode
npm run test:coverage # coverage report
```

Tests cover `analytics.ts` (unit), `utils.ts` (unit), and all components (RTL). The suite is comprehensive and partially AI-generated — it serves as guardrails to keep everything working across future refactors and the planned Rust migration, not as documentation of intentional design. Some tests (e.g. `utils.ts`) cover trivial behaviour; that is by design.

`weightApi.ts` and `db.ts` are intentionally untested: they have no business logic and depend on the Tauri native runtime.

## TODO

- automate test running (husky pre-commit? on build? TBD)
- advanced stats:
  - 0 to -7 average and diff vs -8 to -14
  - show/calculate 3 different stat windows (7, 14, and 30 days by default)
- add settings tab and allow user to configure stat window sizes
- in settings tab: export/import data (CSV or JSON)
- in settings tab: allow changing the database file path
- move DB logic to rust
- handle both `.` and `,` as decimal separator in weight input
- WeightHistory: allow sorting and filtering entries, persist preference (need to decide: localStorage vs Tauri store plugin)
- /components/ is getting messy
- change favicon/app icon

## License

MIT
