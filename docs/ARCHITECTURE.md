# Architecture

FinanceOS is a layered, single-tenant application built entirely on the Google Apps Script runtime, with Google Sheets acting as the persistence layer. There is no external server, no ORM, and no network hop outside Google's own infrastructure (aside from CDN-hosted frontend libraries and the optional `doPost` webhook).

## Design Principles

1. **Single Data Access Layer.** `database.js` is the only module permitted to call `SpreadsheetApp`. Every other module reads and writes through `Database`.
2. **Business logic is pure and testable.** `financeEngine.js` takes plain data in and returns plain data out. It never touches the spreadsheet directly, `API` and `Analytics` supply it with data from `Database`.
3. **The frontend is a thin rendering layer.** `components.js.html`, `charts.js.html`, and `animations.js.html` only render what `API` hands them. No aggregation or business math happens client-side.
4. **Configuration is centralized.** `config.js` is the single source of truth for sheet names, cache TTLs, defaults, and chart colors. No module hardcodes a sheet name string.
5. **Cache-aside pattern.** `API.getDashboardData` checks `CacheService` before invoking `FinanceEngine`, and every write path clears the cache afterward.

## Component Diagram

```
                        ┌────────────────────────────┐
                        │   Google Sheets UI (onOpen) │
                        └──────────────┬───────────────┘
                                       │
                                ┌──────▼──────┐
                                │   menu.js    │
                                │ (Menu.build) │
                                └──────┬──────┘
                                       │ launches
                                ┌──────▼───────────────┐
                                │   dashboard.html      │
                                │ (HtmlService template)│
                                └──────┬───────────────┘
                                       │ inlines
       ┌───────────────────────────────┼───────────────────────────────┐
       │                               │                               │
┌──────▼───────┐              ┌────────▼────────┐              ┌───────▼───────┐
│components.js │              │   charts.js      │              │ animations.js │
│  .html        │              │   .html          │              │   .html        │
│ DOM rendering │              │ ApexCharts render│              │ Motion One /   │
│               │              │                  │              │ rAF tweening   │
└──────┬───────┘              └────────┬────────┘              └───────┬───────┘
       │                               │                               │
       └───────────────┬───────────────┴───────────────────────────────┘
                       │  App (dashboard.js.html) orchestrates via
                       │  google.script.run
                ┌──────▼──────┐
                │   api.js     │◄────────────────┐
                │ (API layer)  │                  │
                └──────┬──────┘                  │
                       │                          │
             ┌─────────▼─────────┐         ┌──────┴──────┐
             │  financeEngine.js  │         │  gateway.js  │
             │ (business logic)   │         │  (doPost)    │
             └─────────┬─────────┘         └──────┬──────┘
                       │                          │
                ┌──────▼──────────────────────────▼──────┐
                │              database.js                │
                │         (Data Access Layer)              │
                └──────────────────┬───────────────────────┘
                                   │
                        ┌──────────▼──────────┐
                        │   Google Sheets       │
                        │ Settings / Accounts /  │
                        │ Budget Setup /         │
                        │ Daily Log / Analytics  │
                        └───────────────────────┘
```

`automation.js` and `analytics.js` sit alongside `api.js` as additional consumers of `Database` and `FinanceEngine`, triggered from the custom menu rather than from the dashboard's `google.script.run` calls.

## Sequence Diagram: Dashboard Load

```
User            Menu           dashboard.html      dashboard.js.html      API           FinanceEngine     Database        CacheService
 │  Launch        │                   │                    │               │                │                │                │
 ├───────────────►│                   │                    │               │                │                │                │
 │                ├──showModalDialog─►│                    │                │                │                │                │
 │                │                   ├──DOMContentLoaded──►│                │                │                │                │
 │                │                   │                    ├──fetchDashboardPayload()───────►│                │                │                │
 │                │                   │                    │               ├──getSettings()──┼───────────────►│                │                │
 │                │                   │                    │               │◄────────────────┼─settings────────┤                │                │
 │                │                   │                    │               ├──cache.get(key)─┼────────────────┼───────────────►│                │
 │                │                   │                    │               │                 │                │  (miss)         │                │
 │                │                   │                    │               ├──generateDashboardPayload()─────►│                │                │
 │                │                   │                    │               │                 ├──getSheetDataAsObjects()───────►│                │
 │                │                   │                    │               │                 │◄────rows──────┤                │                │
 │                │                   │                    │               │◄──payload───────┤                │                │                │
 │                │                   │                    │               ├──cache.put(payload)──────────────────────────────►│                │
 │                │                   │                    │◄──payload─────┤                │                │                │                │
 │                │                   │                    ├──Components.renderAll()─────────────────────────────────────────────►
 │                │                   │                    ├──Charts.renderAll()──────────────────────────────────────────────────►
 │                │                   │                    ├──Animations.staggerEntrance()───────────────────────────────────────►
 │◄───────────────┴───────────────────┴────────────────────┴ rendered dashboard ─────────────────────────────────────────────────┤
```

## Sequence Diagram: Transaction Submission

```
User        dashboard.js.html      API           Database        CacheService
 │  Submit form    │                │               │                │
 ├────────────────►│                │               │                │
 │                 ├──submitNewTransaction(formData)►│               │
 │                 │                ├──getSettings()┼──────────────►│
 │                 │                │◄──cycle───────┤                │
 │                 │                ├──appendTransaction(row)───────►│
 │                 │                ├──clearCache()─┼────────────────┼──remove(key)──►
 │                 │◄──{success}────┤                │                │
 │                 ├──closeModal(), showToast(), fetchData(force=true)│
 │◄────────────────┤ dashboard reflects new transaction               │
```

## Sequence Diagram: External Webhook Ingestion (Telegram)

```
Telegram Bot        gateway.js (doPost)      Database        API           Sheets
    │  POST JSON        │                       │               │              │
    ├──────────────────►│                       │               │              │
    │                   ├──getSettings()────────►│               │              │
    │                   │◄──settings────────────┤               │              │
    │                   ├──parse "desc:amount"   │               │              │
    │                   ├──logSheet.appendRow(row)───────────────┼─────────────►│
    │                   ├──setNumberFormat("@")──────────────────┼─────────────►│
    │                   ├──API.clearCache()──────┼──────────────►│              │
    │                   │◄──{status:"success"}   │               │              │
    │◄──────────────────┤ JSON response          │               │              │
```

## Data Flow: Dashboard Payload Assembly

```
Daily Log ──┐
            ├──► FinanceEngine._calculateAccountBalances ──► accounts[], liquidTotal
Accounts ───┘

Daily Log (filtered by cycle) ──► FinanceEngine._summarizeCycle ──► totalIncome, totalSpent,
                                                                     bankCharges, totalReceivables,
                                                                     actualsMap, receivableList

Budget Setup (filtered by cycle) ─┐
actualsMap ────────────────────────┼──► FinanceEngine._mergeBudgets ──► expenses[], savings[]

All of the above ──► generateDashboardPayload() ──► { cycle, kpis, accounts, expenses, savings,
                                                       receivableList, settings }
                                                              │
                                                              ▼
                                                    CacheService (5 min TTL)
                                                              │
                                                              ▼
                                                     Dashboard (Components, Charts, Animations)
```

## Why This Architecture

Apps Script has no persistent server process and no long-running background jobs. Every execution is a fresh, stateless invocation triggered by a UI action, a menu click, or an HTTP request. The layered structure above exists specifically to keep that constraint from leaking into the business logic: `FinanceEngine` doesn't know or care whether it's being called from the dashboard, the Telegram webhook, or the Analytics generator. It receives sheet data as plain objects and returns plain data structures, which is what makes it reusable across all three entry points (`api.js`, `analytics.js`, and indirectly `automation.js` for cycle rollover).
