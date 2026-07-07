# Folder Structure

Apps Script projects are flat by nature (no real subdirectories inside the script editor itself), so the repository structure below is the source-of-truth layout you'll maintain in version control. When pasting files into the Apps Script editor, they all live at the same level regardless of the folders shown here.

```
financeos/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md
├── LICENSE
│
├── docs/
│   ├── ARCHITECTURE.md
│   ├── INSTALLATION.md
│   ├── DEPLOYMENT.md
│   ├── TELEGRAM_INTEGRATION.md
│   ├── API.md
│   ├── FOLDER_STRUCTURE.md
│   ├── FAQ.md
│   ├── TROUBLESHOOTING.md
│   ├── ROADMAP.md
│   └── SCREENSHOTS.md
│
├── src/
│   ├── backend/
│   │   ├── config.js              # CONFIG constants: sheet names, cache, defaults, chart colors
│   │   ├── database.js            # Data Access Layer, sole owner of SpreadsheetApp
│   │   ├── financeEngine.js       # Pure business logic: KPIs, balances, budget merging
│   │   ├── api.js                 # google.script.run endpoints + caching
│   │   ├── analytics.js           # Native Google Sheets chart generator
│   │   ├── automation.js          # Budget cycle rollover workflow
│   │   ├── gateway.js             # doPost webhook for external integrations
│   │   └── menu.js                # Custom Sheets menu, dashboard launcher
│   │
│   └── frontend/
│       ├── dashboard.html         # Root HTML template, includes all partials
│       ├── dashboard.css.html     # Tailwind config + custom utility classes
│       ├── dashboard.js.html      # App state, data fetching, modal/form logic
│       ├── components.js.html     # DOM rendering for KPIs, budgets, accounts, etc.
│       ├── charts.js.html         # ApexCharts rendering (donut, area)
│       └── animations.js.html     # Motion One / rAF entrance animations
│
├── sample-data/
│   └── budgetTrackerDemo.xlsx     # Pre-populated demo spreadsheet for quick start
│
└── .github/
    ├── ISSUE_TEMPLATE/
    │   ├── bug_report.md
    │   └── feature_request.md
    └── PULL_REQUEST_TEMPLATE.md
```

## What Belongs Where

| If you're adding... | It goes in... |
|---|---|
| A new calculated KPI or budget rule | `src/backend/financeEngine.js` |
| A new sheet-level read/write operation | `src/backend/database.js` |
| A new sheet name or default value | `src/backend/config.js` (`CONFIG`) |
| A new `google.script.run` endpoint | `src/backend/api.js`, as a top-level global function |
| A new dashboard visualization | `src/frontend/charts.js.html` |
| A new DOM section or card type | `src/frontend/components.js.html` |
| A new entrance/interaction animation | `src/frontend/animations.js.html` |
| A new external integration entry point | `src/backend/gateway.js`, or a new sibling module following the same pattern |
| A new guided multi-step workflow (like cycle rollover) | `src/backend/automation.js` |

## Apps Script Editor Mapping

When you copy these files into **Extensions → Apps Script**, use these exact filenames (see [Installation Guide](INSTALLATION.md) for the full table), since `.html` files are referenced by name via `HtmlService.createHtmlOutputFromFile('components.js')` (note: without the `.html` extension in the call, even though the file itself is named `components.js.html`).
