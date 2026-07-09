# Changelog

All notable changes to FinanceOS are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project uses [Semantic Versioning](https://semver.org/) adapted for an Apps Script release cadence (see [docs/ROADMAP.md](docs/ROADMAP.md) for the versioning strategy in full).

## [1.0.0] - Stable Release

### Fixed
- Resolved the dashboard Income subtraction bug by updating the ('resolveAccountColumns') function.  
- The system now correctly maps 'Income' types to the ('toAccount') field and leaves the ('fromAccount') empty, ensuring ('FinanceEngine') credits the balance properly.
- Fixed the Telegram webhook ledger reversal issue by completely removing manual column writing from ('gateway.js').  
- The ('doPost') webhook now parses the incoming payload and delegates the actual database write to the shared ('submitNewTransaction') pipeline.
- Dashboard "Recent Activity" timeline was rendering `receivableList` instead of actual transactions, and colored entries by array index rather than transaction type. `FinanceEngine.generateDashboardPayload` now returns a `recentTransactions` array (most recent 8, newest first), and `Components.renderTimeline` colors/signs each entry by its real `Type` (Income/Receivable credit, Transfer neutral, everything else debit).


### Changed
- Centralized transaction architecture so that external webhooks and internal frontend submissions both utilize the same validation and formatting rules.  
- Improved data safety in ('FinanceEngine') by upgrading the ('_parseNum') method.  
- The engine now strips all non-numeric characters from incoming string values, leaving only digits, decimals, and minus signs before performing calculations.  

### Added
- Implemented automated cache clearing via ('API.clearCache()').  
- The cache is now dynamically wiped whenever a new transaction is appended to the ledger.  
- The cache is also explicitly wiped at the end of the ('startNewCycle') automation workflow to ensure the dashboard reflects the newly funded cycle immediately.

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
