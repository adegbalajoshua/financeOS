# Installation Guide

This guide walks through setting up FinanceOS from scratch: the spreadsheet, the sheet schema, and the Apps Script project.

## Prerequisites

- A Google account with access to Google Sheets and Apps Script.
- No local development environment is required. Everything runs in the browser.

## Step 1: Create the Spreadsheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new blank spreadsheet.
2. Rename it (for example, "FinanceOS").
3. Alternatively, if a demo template is provided in this repository (`budgetTrackerDemo.xlsx`), import it via **File → Import → Upload**, choosing **Replace spreadsheet**, to start with the correct sheet structure and sample data already in place.

## Step 2: Create the Required Worksheets

FinanceOS expects five sheet tabs, named exactly as follows (these names are referenced in `config.js` under `CONFIG.SHEETS`, so if you rename them, update `config.js` to match):

### `Settings`

| Key | Value |
|---|---|
| Active_Cycle | Jul-26 |
| Currency | ₦ |
| Default_Category | Discretionary |
| Default_Account | Zenith |

`Active_Cycle` must match a value used in your `Budget Setup` and `Daily Log` sheets' `Budget Cycle` column.

### `Accounts`

| Account Name | Account Type | Opening Balance | Status |
|---|---|---|---|
| Zenith | Bank | 150000 | Active |
| OPay | Mobile | 25000 | Active |
| Cash | Cash | 5000 | Active |
| Savings Vault | Savings | 200000 | Active |

`Account Type` values of `Bank`, `Mobile`, or `Cash` are summed into the Liquid Cash KPI. Other types (like `Savings`) are tracked but excluded from that total. Set `Status` to `Inactive` to exclude an account entirely without deleting its history.

### `Budget Setup`

| Budget Cycle | Type | Category | Budget Amount |
|---|---|---|---|
| Jul-26 | Expense | Groceries | 60000 |
| Jul-26 | Expense | Transport | 20000 |
| Jul-26 | Saving | Emergency Fund | 50000 |

`Type` must be exactly `Expense` or `Saving`.

### `Daily Log`

| Date | Budget Cycle | Type | Category | Description | To Account | From Account | Amount | Note |
|---|---|---|---|---|---|---|---|---|
| 01-Jul-26 | Jul-26 | Income | Salary | Monthly Paycheck | | Zenith | 350000 | Auto-funded Jul-26 |
| 03-Jul-26 | Jul-26 | Expense | Groceries | Weekly shop | | Zenith | 18000 | Dashboard Entry |

Valid `Type` values: `Income`, `Expense`, `Saving`, `Bank Charge`, `Receivable`, `Transfer`.

> **Column order matters.** `Database.getSheetDataAsObjects` maps values by header text, not position, but the header row must exactly match the names above (case-sensitive, including the space in `To Account` / `From Account` / `Budget Cycle`). Do not rename or reorder these headers without also updating `financeEngine.js`.

> **Known issue:** the `doPost` webhook (`gateway.js`) currently writes the source account into the `To Account` column position and the destination into `From Account`, the reverse of what `api.js` and `automation.js` write. If you're setting up the Telegram integration, verify against [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md) before trusting webhook-logged balances.

### `Analytics`

Leave this tab empty, or don't create it at all. `analytics.js` creates it automatically the first time you run **Generate Analytics**, and clears/rebuilds it on every subsequent run.

## Step 3: Set Up the Apps Script Project

1. In your spreadsheet, go to **Extensions → Apps Script**.
2. Delete the default empty `Code.gs` file's contents.
3. Create the following script files, matching these names, and paste in the corresponding source from this repository:

| Apps Script file | Source file |
|---|---|
| `config.gs` | `config.js` |
| `database.gs` | `database.js` |
| `financeEngine.gs` | `financeEngine.js` |
| `api.gs` | `api.js` |
| `analytics.gs` | `analytics.js` |
| `automation.gs` | `automation.js` |
| `gateway.gs` | `gateway.js` |
| `menu.gs` | `menu.js` |

4. Create the following HTML files (**+ → HTML**) matching these exact names, since `HtmlService.createHtmlOutputFromFile` references them by filename without extension:

| Apps Script HTML file | Source file |
|---|---|
| `dashboard.html` | `dashboard.html` |
| `dashboard.css.html` | `dashboard.css.html` |
| `components.js.html` | `components.js.html` |
| `charts.js.html` | `charts.js.html` |
| `animations.js.html` | `animations.js.html` |
| `dashboard.js.html` | `dashboard.js.html` |

5. Save the project (Ctrl+S / Cmd+S).

## Step 4: Authorize the Script

1. Reload the spreadsheet in your browser.
2. A **financeOS** menu should appear in the menu bar. If it doesn't, check **View → Logs** in the Apps Script editor for errors, and confirm `onOpen()` exists in `menu.gs`.
3. Click **financeOS → Launch Dashboard**.
4. Google will prompt for authorization the first time. Review the requested scopes (Spreadsheet access, and if you configure the webhook, external requests) and approve.

## Step 5: Verify

1. The dashboard should open as a modal dialog showing your KPIs, charts, and budget cards populated from the sample data.
2. Click the **+** floating action button and add a test expense. Confirm it appears in `Daily Log` and the dashboard refreshes.
3. From the **financeOS** menu, run **Generate Analytics** and confirm a populated `Analytics` sheet with two native charts appears.

If any step fails, see [docs/TROUBLESHOOTING.md](TROUBLESHOOTING.md).

## Next Steps

- [Deployment Guide](DEPLOYMENT.md), for publishing the webhook endpoint.
- [Telegram Integration Guide](TELEGRAM_INTEGRATION.md), for logging transactions from a chat bot.
- [API Documentation](API.md), for the full function reference.
