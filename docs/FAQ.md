# FAQ

### Do I need to host anything to use FinanceOS?

No. Everything runs inside your Google account, on Google's infrastructure, at no cost beyond your existing Google Workspace/Gmail account. The only optional external piece is the `doPost` webhook if you choose to integrate with Telegram or another external tool.

### Is my financial data sent anywhere?

No. All data lives in your own Google Sheet. FinanceOS doesn't call any third-party API for data storage. The frontend loads CDN-hosted libraries (ApexCharts, Motion One, Lucide, Tailwind), but no financial data is transmitted to those CDNs, they're static asset hosts.

### Can multiple people use one FinanceOS instance?

Not in the way most SaaS products support multi-user accounts. Since the dashboard's access model is tied to spreadsheet sharing permissions, anyone with edit access to the sheet can open the dashboard and log transactions. There's no per-user login, role separation, or activity attribution. For a household budget shared between partners, this works fine, share the sheet. For anything requiring isolated user data, you'd need separate spreadsheet instances.

### What happens when a budget cycle ends?

Run **financeOS → Start New Budget Cycle** from the menu. This prompts for the new cycle name and a salary amount, logs the salary as an Income transaction, copies (rolls over) all budget lines from the current cycle into the new one, and updates `Settings.Active_Cycle`. See [automation.js](../automation.js) for the exact sequence.

### Why isn't my dashboard showing a transaction I just added directly in the sheet?

The dashboard reads from a cache (`CacheService`, 5-minute default TTL) rather than hitting the sheet on every load. Transactions added through the dashboard's modal clear the cache automatically, but manual edits made directly in `Daily Log` do not. Click the refresh icon in the dashboard header, which calls `forceRefreshDashboard` and bypasses the cache.

### Can I change the currency symbol?

Yes. Update the `Currency` value in the `Settings` sheet. It's read on every dashboard load and passed through to KPI formatting, chart tooltips, and the transaction modal.

### Does FinanceOS support multiple currencies simultaneously?

No. `Settings.Currency` is a single global symbol applied uniformly across the dashboard. Multi-currency support would require changes to `financeEngine.js` (currency-aware balance calculation) and is not currently implemented, see the [Roadmap](ROADMAP.md).

### Why does the Analytics sheet get wiped every time I run "Generate Analytics"?

`buildAnalyticsDashboard()` in `analytics.js` clears the sheet and removes existing charts at the start of every run, by design, to prevent stale or duplicate charts from accumulating. Don't store anything manually in the `Analytics` tab, treat it as a generated artifact.

### Can I add a new transaction type beyond Income, Expense, Saving, Bank Charge, Receivable, and Transfer?

Yes, but it requires a matching change in `FinanceEngine._summarizeCycle` (or `_calculateAccountBalances`, if it affects account balances) to define how the new type is aggregated. Adding a value to the `Type` column alone won't produce meaningful KPI behavior, since `FinanceEngine` only recognizes the types it explicitly checks for.

### Is there a mobile app?

No. The dashboard is a responsive HTML modal that works reasonably well in the Google Sheets mobile app's browser view, but there's no native mobile app and none is planned given the Apps Script constraint (see [Roadmap](ROADMAP.md)).

### What happens if I rename a sheet tab?

Everything breaks. `config.js` hardcodes the expected sheet names in `CONFIG.SHEETS`. If you rename a tab in your spreadsheet, update `CONFIG.SHEETS` to match, or better, don't rename tabs, rename the values in `Settings` instead where applicable.

### Why does the webhook only support a colon-delimited description format?

It's a deliberate simplification for fast mobile entry (`Coffee : 1500` is quick to type in a chat app). It trades expressiveness for speed. If you need richer parsing, see [Telegram Integration Guide](TELEGRAM_INTEGRATION.md) for passing explicit `type`, `cat`, `account`, and `to` fields instead of relying on the shorthand parser.
