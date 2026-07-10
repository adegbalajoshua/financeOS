# Troubleshooting

## "financeOS" menu doesn't appear

- Confirm `onOpen()` exists in `menu.js` and that the file was saved in the Apps Script editor.
- Reload the spreadsheet tab completely (not just refresh the dashboard). Simple triggers like `onOpen` only fire on a full spreadsheet load.
- Check **Extensions → Apps Script → Executions** for a failed `onOpen` execution and read the stack trace.

## Dashboard opens but shows no data / a blank state

- Confirm `Settings.Active_Cycle` is set and matches the exact string used in the `Budget Cycle` column of `Daily Log` and `Budget Setup` (case-sensitive, whitespace-sensitive).
- Confirm the sheet tab names exactly match `CONFIG.SHEETS` in `config.js` (`Settings`, `Accounts`, `Budget Setup`, `Daily Log`).
- Open the browser console (right-click the dashboard dialog → Inspect, if supported) and check for a thrown error from `App.fetchData`.

## `Worksheet "X" could not be found` error

Thrown by `Database.getSheet`. The sheet name requested doesn't exist as a tab. Cross-check against `CONFIG.SHEETS` in `config.js` and your actual tab names, they must match exactly, including capitalization.

## Account balances look wrong after logging an Income transaction

This is a known architectural issue. `FinanceEngine._calculateAccountBalances` treats `From Account` as a debit and `To Account` as a credit:

```js
if (fromAcc && balanceMap[fromAcc]) balanceMap[fromAcc].balance -= amount;
if (toAcc && balanceMap[toAcc]) balanceMap[toAcc].balance += amount;
```

However, both `api.js` (`submitNewTransaction`) and `automation.js` (`startNewCycle`) write the transaction's account into the **From Account** column position for Income transactions, which causes income to be subtracted from the account rather than added.

**Workaround until fixed:** For Income transactions logged via the dashboard, expect the selected account's balance to decrease by the income amount rather than increase. Track this manually, or adjust the account's `Opening Balance` to compensate, until the row-construction logic in `api.js` / `automation.js` is corrected to place Income amounts in the `To Account` position instead.

This is tracked in [CHANGELOG.md](../CHANGELOG.md#unreleased) under Known Issues.

## Telegram-logged transactions don't match dashboard balances

`gateway.js` writes `account` (the source) into the column position `api.js` and `automation.js` treat as `To Account`, and `to` (the destination) into the position they treat as `From Account`, the reverse of the convention used elsewhere:

```js
// gateway.js
const newRow = [
  formattedDate, cycle, type, category, description,
  account,   // written to column 6
  toAccount, // written to column 7
  amount,
  'Logged Via Telegram'
];

// api.js, for comparison
const transactionRow = [
  formattedDate, cycle, formData.type, formData.category, formData.description,
  formData.toAccount, // written to column 6
  formData.account,   // written to column 7
  Number(formData.amount),
  "Dashboard Entry"
];
```

Since `Database.getSheetDataAsObjects` reads values by header name rather than position, the practical effect is that a webhook-logged transaction's debit and credit get swapped relative to a dashboard-logged one. Verify balance impact manually for webhook-originated rows until this is reconciled. Tracked in [CHANGELOG.md](../CHANGELOG.md#unreleased).

## Cache seems stale, changes don't show up

- Click the refresh icon in the dashboard header (calls `forceRefreshDashboard`, which clears the cache before recomputing).
- If you edited `Daily Log`, `Budget Setup`, or `Accounts` directly in the sheet (not through the dashboard or webhook), the cache has no way to know, and won't auto-invalidate. Manual sheet edits require a manual refresh.
- Confirm `API.clearCache()` is being called at the end of any custom write path you've added, per [CONTRIBUTING.md](../CONTRIBUTING.md).

## Charts don't render / ApexCharts errors in console

- Confirm `https://cdn.jsdelivr.net/npm/apexcharts` loaded successfully (check the Network tab), some corporate networks or browser extensions block CDN scripts inside Apps Script's sandboxed iframe.
- Confirm `payload.expenses` and `payload.kpis` are non-null, `Charts.renderAll` exits early if `payload.error` is truthy.

## `doPost` returns `{"status":"error", ...}`

- Confirm the request body is valid JSON, `JSON.parse(e.postData.contents)` throws on malformed input.
- Confirm `Content-Type: application/json` is set on the request.
- Check **Executions** in the Apps Script editor for the specific caught error message.

## Web App deployment changes don't take effect

Editing script files does not update a live Web App deployment automatically. You must create a **new version** under **Deploy → Manage deployments**. See [Deployment Guide](DEPLOYMENT.md#versioning-deployments).

## `startNewCycle` aborts with "Invalid salary amount"

`automation.js` requires a positive number with no letters or symbols other than commas (which are stripped). Enter digits only, e.g. `350000`, not `₦350,000` or `350k`.

## Native Analytics charts look empty or missing

- Confirm `payload.expenses` contains entries with `spent > 0`, `buildAnalyticsDashboard` only builds the pie chart if at least one row was written (`expRow > 4`).
- Re-run **financeOS → Generate Analytics**, the function clears prior charts and data before rebuilding, so a partial failure on a previous run can leave stale state that a fresh run corrects.

## Can't rename an account from the Manage panel

This is intentional, not a bug. `submitAccount` matches existing rows by name. Renaming in place would desync every historical `Daily Log` row that references the old name, silently breaking past balance calculations. To rename, create a new account with the new name and (optionally) deactivate the old one, or edit the sheet cell directly and understand you're accepting that history mismatch.

## Still stuck?

Open an issue using the Bug Report template, and include the specific module (`Database`, `FinanceEngine`, `API`, `Analytics`, `Automation`, `Gateway`, or frontend) along with the Apps Script execution log.
