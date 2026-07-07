# Changelog

All notable changes to FinanceOS are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/) adapted for an Apps Script release cadence (see [docs/ROADMAP.md](docs/ROADMAP.md) for the versioning strategy in full).

## [Unreleased]

### Known Issues
- `gateway.js` (`doPost`) writes the source account to column 6 (`To Account`) and the destination to column 7 (`From Account`), which is the reverse of the column order used by `api.js` (`submitNewTransaction`) and `automation.js` (`startNewCycle`). Transactions logged through the Telegram webhook will post to the wrong side of the ledger until this is reconciled. Tracked for a fix before the first stable release.
- Income transactions submitted from the dashboard modal populate the `From Account` field rather than `To Account`, which causes `FinanceEngine._calculateAccountBalances` to subtract income from the selected account's balance instead of crediting it. Needs verification against intended behavior before v1.0.0.

## [0.1.0] - Initial Public Preparation

### Added
- Modular backend: `Database`, `FinanceEngine`, `API`, `Analytics`, `Automation`, `Gateway`, `Menu`.
- Responsive dashboard frontend with ApexCharts donut and area charts, Motion One entrance animations, Lucide icons.
- Budget cycle rollover workflow (`startNewCycle`) with guided prompts for new cycle name and salary funding.
- Native Google Sheets analytics generator (`buildAnalyticsDashboard`) producing pie and column charts directly in a dedicated `Analytics` sheet.
- `doPost` webhook for external transaction logging (Telegram-style `"Description : Amount"` shorthand parsing).
- Document-scoped caching via `CacheService` for dashboard payloads, keyed per budget cycle.
- Transaction modal supporting Expense, Income, and Transfer entry types.
- Dark mode with `localStorage` persistence and live ApexCharts theme switching.

### Notes
This is the baseline snapshot being prepared for open-source release. Version numbers before `1.0.0` should be treated as pre-release and may include breaking schema changes as the known issues above are resolved.

---

### How to update this file

When you open a PR, add an entry under `[Unreleased]` in the appropriate category: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, or `Security`. On release, the maintainers move `Unreleased` entries into a new dated version section.
