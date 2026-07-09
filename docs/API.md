# API Documentation

This document covers every function exposed as a `google.script.run` endpoint, the `doPost` webhook contract, and the internal module APIs (`Database`, `FinanceEngine`) that back them.

## Global Endpoints (`google.script.run`)

These are the only functions the frontend is permitted to call, since `google.script.run` can only invoke top-level global functions, not object methods.

### `fetchDashboardPayload(cycle)`

Fetches the dashboard payload for a given cycle, using the cache when available.

**Parameters**
| Name | Type | Required | Description |
|---|---|---|---|
| `cycle` | `string` | No | Budget cycle to load, e.g. `"Jul-26"`. Defaults to `Settings.Active_Cycle` if omitted. |

**Returns:** `Object` (see [Dashboard Payload Shape](#dashboard-payload-shape)) or `{ error: true, message: string }` on failure.

**Caching:** Reads from `CacheService.getDocumentCache()` first, keyed by `CONFIG.CACHE.KEY_PREFIX + cycle`. On a cache miss, calls `FinanceEngine.generateDashboardPayload` and writes the result back with a TTL of `CONFIG.CACHE.EXPIRATION_SEC` (default 300 seconds).

---

### `forceRefreshDashboard(cycle)`

Identical to `fetchDashboardPayload`, but clears the cache first, guaranteeing fresh computation.

**Parameters:** same as above.

**Returns:** same shape as `fetchDashboardPayload`.

---

### `submitNewTransaction(formData)`

Appends a new row to `Daily Log` and clears the cache.

**Parameters**

| Field | Type | Required | Notes |
|---|---|---|---|
| `type` | `string` | Yes | `"Expense"`, `"Income"`, or `"Transfer"` |
| `category` | `string` | Yes | Must match a category used in `Budget Setup` to appear in budget tracking, otherwise it's recorded but untracked |
| `description` | `string` | Yes | Free text |
| `account` | `string` | Yes | Source account name, must match an entry in `Accounts` |
| `toAccount` | `string` | Only for `Transfer` | Destination account name |
| `amount` | `number` \| `string` | Yes | Coerced with `Number()` |

**Returns:** `{ success: true }` or `{ error: true, message: string }`.

**Side effects:** Appends to `Daily Log` using the active cycle from `Settings`, stamps the date as `dd-MMM-yy` in the script's timezone, sets the note to `"Dashboard Entry"`, then calls `API.clearCache()`.

### `updateTransaction(transactionId, formData)`

Overwrites an existing `Daily Log` row by `Transaction ID`. `type`, `date`, and `budgetCycle` are preserved from the original row; `category`, `account`, `toAccount`, `amount`, and `description` can change. Sets the note to `"Dashboard Entry (Edited)"`.

**Returns:** `{ success: true }` or `{ error: true, message: string }`.

---

### `deleteTransaction(transactionId)`

Deletes a `Daily Log` row by `Transaction ID` and clears the cache.

**Returns:** `{ success: true }` or `{ error: true, message: string }`.

## `API` Module (Internal)

Not directly callable from the frontend, `api.js` exposes these methods internally, wrapped by the global endpoints above.

### `API.getDashboardData(requestedCycle)`

Core logic behind both `fetchDashboardPayload` and `forceRefreshDashboard`. Resolves the target cycle, checks cache, falls back to `FinanceEngine.generateDashboardPayload`, attaches `settings` to the payload, and writes back to cache.

### `API.clearCache()`

Removes the cached payload for the currently active cycle. Called automatically by `submitNewTransaction`, `startNewCycle`, and `doPost`. Any new write path added to the codebase must call this too, or the dashboard will silently show stale data for up to `CONFIG.CACHE.EXPIRATION_SEC` seconds.

## `FinanceEngine` Module (Internal)

Pure business logic, no direct spreadsheet access. Consumed by `api.js` and `analytics.js`.

### `FinanceEngine.generateDashboardPayload(targetCycle)`

Orchestrates the full payload assembly described in [Architecture: Data Flow](ARCHITECTURE.md#data-flow-dashboard-payload-assembly).

**Returns:**

```js
{
  cycle: string,
  kpis: {
    income: number,
    spent: number,
    bankCharges: number,
    liquidCash: number,
    receivables: number
  },
  accounts: [{ name: string, balance: number }],
  expenses: [{ category, budget, spent, remaining, percentUsed }],
  savings: [{ category, budget, spent, remaining, percentUsed }],
  receivableList: [{ desc: string, amount: number }]
  recentTransactions: [{ date, desc, amount, type, category }],
  settings: { Active_Cycle, Currency, Default_Category, Default_Account }
}
```

### `FinanceEngine._parseNum(value)`

Strips currency symbols and separators (e.g. `"₦70,000"` → `70000`). Returns `0` for falsy or unparseable input.

### `FinanceEngine._calculateAccountBalances(accounts, allTransactions)`

Computes running balances for every `Active` account by applying every transaction's `From Account` (debit) and `To Account` (credit) fields, then sums accounts of type `Bank`, `Mobile`, or `Cash` into `liquidTotal`.

### `FinanceEngine._summarizeCycle(cycleTransactions)`

Aggregates a single cycle's transactions into total income, total spent, bank charges, total receivables, a per-category actuals map, and a receivables list.

### `FinanceEngine._mergeBudgets(cycleBudgets, actualsMap, typeFilter)`

Joins `Budget Setup` rows (filtered by `Expense` or `Saving`) against the actuals map to compute remaining budget and percent utilized.

## `Database` Module (Internal)

The sole owner of `SpreadsheetApp` access. See [database.js](../database.js) for full JSDoc. Key methods:

| Method | Purpose |
|---|---|
| `getSheet(sheetName)` | Returns a sheet, throws if not found |
| `getSheetDataAsObjects(sheetName)` | Maps rows to objects keyed by header row |
| `getSettings()` | Returns the `Settings` sheet as a key/value object |
| `updateSetting(key, value)` | Updates a single setting in place |
| `appendTransaction(transaction)` | Appends a row array to `Daily Log` |
| `appendBudgetRows(rows)` | Batch-appends rows to `Budget Setup` |
| `clearCharts(sheetName)` | Removes all native charts from a sheet |
| `clearSheet(sheetName)` | Clears all contents of a sheet |

## Webhook: `doPost(e)`

See [Telegram Integration Guide](TELEGRAM_INTEGRATION.md) for the full contract and examples.

**Request body (JSON):**

```json
{
  "desc": "Coffee : 1500",
  "date": "2026-07-06T00:00:00.000Z",
  "cycle": "Jul-26",
  "type": "Expense",
  "cat": "Discretionary",
  "account": "Zenith",
  "to": ""
}
```

Every field except `desc` is optional and falls back to `Settings` defaults.

**Response (JSON):**

Success:
```json
{ "status": "success", "message": "Logged: Coffee (1500)" }
```

Failure:
```json
{ "status": "error", "message": "<error string>" }
```

## Dashboard Payload Shape

The full object returned by `fetchDashboardPayload` / `forceRefreshDashboard`, with `settings` attached by `API.getDashboardData`:

```js
{
  cycle: "Jul-26",
  kpis: { income, spent, bankCharges, liquidCash, receivables },
  accounts: [{ name, balance }],
  expenses: [{ category, budget, spent, remaining, percentUsed }],
  savings: [{ category, budget, spent, remaining, percentUsed }],
  receivableList: [{ desc, amount }],
  settings: { Active_Cycle, Currency, Default_Category, Default_Account }
}
```
