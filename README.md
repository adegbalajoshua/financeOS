<div align="center">

# FinanceOS

**A personal finance operating system built entirely on Google Sheets and Google Apps Script.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Google%20Apps%20Script-4285F4)](https://developers.google.com/apps-script)
[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](CONTRIBUTING.md)

[Features](#features) • [Architecture](#architecture) • [Installation](docs/INSTALLATION.md) • [Deployment](docs/DEPLOYMENT.md) • [API Docs](docs/API.md) • [FAQ](docs/FAQ.md)

</div>

---

## What is FinanceOS?

FinanceOS turns a Google Sheet into a full budgeting and cash flow application. No external database, no hosting bill, no third-party server. Your spreadsheet is the database, Google Apps Script is the backend, and a responsive HTML dashboard renders on top of it inside a modal dialog launched from the Sheets menu.

It tracks accounts, budgets, transactions, and receivables across budget cycles (monthly or otherwise), and exposes a webhook endpoint so you can log transactions from outside the spreadsheet, for example from a Telegram bot.

## Features

- **Zero-infrastructure backend.** Runs entirely inside Google's ecosystem. No servers, no hosting costs, no external database.
- **Live dashboard.** A single-page dashboard (ApexCharts, Motion One, Lucide icons, Tailwind) rendered as a modal dialog directly in Google Sheets.
- **Budget cycles.** Start a new cycle, roll over budget lines, and auto-fund the cycle with your salary in one guided workflow.
- **Multi-account balance tracking.** Bank, mobile money, and cash accounts are tracked independently, with a combined liquid cash KPI.
- **Expense and savings budgets.** Category-level budget vs. actual tracking with utilization percentages.
- **Receivables tracking.** Track money owed to you separately from spending.
- **External logging via webhook.** `doPost` endpoint accepts JSON payloads so transactions can be logged from Telegram, Zapier, n8n, or any HTTP client.
- **Server-side caching.** `CacheService` backed cache avoids recomputing the dashboard payload on every load.
- **Native Sheets analytics.** A one-click menu action generates a dedicated Analytics sheet with native Google Sheets pie and column charts.

## Architecture

FinanceOS follows a layered, modular architecture. Business logic never touches `SpreadsheetApp` directly, all persistence goes through a single Data Access Layer, and the frontend never talks to Apps Script functions except through the `API` module's exposed global endpoints.

```
┌─────────────────────────────────────────────┐
│              Dashboard (HTML/JS)             │
│   dashboard.js.html / components.js.html /   │
│   charts.js.html / animations.js.html        │
└───────────────────┬───────────────────────────┘
                    │ google.script.run
┌───────────────────▼───────────────────────────┐
│                API Layer (api.js)             │
│  fetchDashboardPayload / submitNewTransaction │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│         Finance Engine (financeEngine.js)     │
│   KPI calculation, balance aggregation,       │
│   budget merging                              │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│           Database (database.js)              │
│      Sole owner of SpreadsheetApp access       │
└───────────────────┬───────────────────────────┘
                    │
┌───────────────────▼───────────────────────────┐
│              Google Sheets (storage)           │
│  Settings / Accounts / Budget Setup /          │
│  Daily Log / Analytics                         │
└─────────────────────────────────────────────────┘
```

Full diagrams (component, sequence, and data flow) live in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Modules

| Module | File | Responsibility |
|---|---|---|
| Configuration | `config.js` | Single source of truth for sheet names, cache settings, defaults, chart colors |
| Database | `database.js` | Data Access Layer, the only module allowed to call `SpreadsheetApp` |
| Finance Engine | `financeEngine.js` | Pure business logic: KPI calculation, account balances, budget merging |
| API | `api.js` | Bridge between frontend and backend, caching, transaction submission |
| Analytics | `analytics.js` | Generates native Google Sheets charts on demand |
| Automation | `automation.js` | Guided budget cycle rollover workflow |
| Gateway | `gateway.js` | `doPost` webhook for external integrations (Telegram, etc.) |
| Menu | `menu.js` | Registers the custom Sheets menu and launches the dashboard |
| Dashboard | `dashboard.html` + partials | Frontend UI, rendering, charts, and animations |

## Sheet Schema

FinanceOS expects five worksheets in the active spreadsheet:

**Settings** (`Key` / `Value`)
Holds `Active_Cycle`, `Currency`, `Default_Category`, `Default_Account`.

**Accounts** (`Account Name` / `Account Type` / `Opening Balance` / `Status`)
`Account Type` of `Bank`, `Mobile`, or `Cash` counts toward the Liquid Cash KPI. `Status` must be `Active` for the account to be included.

**Budget Setup** (`Budget Cycle` / `Type` / `Category` / `Budget Amount`)
`Type` is `Expense` or `Saving`.

**Daily Log** (`Date` / `Budget Cycle` / `Type` / `Category` / `Description` / `To Account` / `From Account` / `Amount` / `Note`)
`Type` is one of `Income`, `Expense`, `Saving`, `Bank Charge`, `Receivable`, or `Transfer`.

**Analytics**
Generated automatically by the Analytics module. Do not edit manually, it's rebuilt on every run.

See [docs/INSTALLATION.md](docs/INSTALLATION.md) for exact column headers and a copy-paste sheet setup.

## Quick Start

```
1. Copy the spreadsheet template (see Installation Guide)
2. Extensions → Apps Script → paste in all .js and .html files
3. Set your Script Properties / Settings sheet values
4. Reload the spreadsheet, use the "financeOS" menu → Launch Dashboard
```

Full walkthrough: [docs/INSTALLATION.md](docs/INSTALLATION.md)

## Screenshots

See [docs/SCREENSHOTS.md](docs/SCREENSHOTS.md) for the current gallery and a checklist for contributors submitting new UI screenshots.

## Documentation Index

- [Architecture](docs/ARCHITECTURE.md)
- [Installation Guide](docs/INSTALLATION.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Telegram Integration Guide](docs/TELEGRAM_INTEGRATION.md)
- [API Documentation](docs/API.md)
- [Folder Structure](docs/FOLDER_STRUCTURE.md)
- [FAQ](docs/FAQ.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Roadmap](docs/ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Security Policy](SECURITY.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Changelog](CHANGELOG.md)

## Author

Built and maintained by **adegbalajoshua**.

- GitHub: [@adegbalajoshua](https://github.com/adegbalajoshua)

If FinanceOS is useful to you, a star on the repo is appreciated.

## License

MIT. See [LICENSE](LICENSE).
