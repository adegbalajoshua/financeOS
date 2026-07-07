---
name: Bug Report
about: Something in FinanceOS isn't working as expected
title: "[BUG] "
labels: bug
assignees: ''
---

## Module Affected

- [ ] Database (`database.js`)
- [ ] Finance Engine (`financeEngine.js`)
- [ ] API (`api.js`)
- [ ] Analytics (`analytics.js`)
- [ ] Automation (`automation.js`)
- [ ] Gateway / Webhook (`gateway.js`)
- [ ] Menu (`menu.js`)
- [ ] Dashboard frontend (`.html` files)
- [ ] Sheet schema / Installation
- [ ] Other (describe below)

## Description

A clear description of what's broken.

## Steps to Reproduce

1.
2.
3.

## Expected Behavior

## Actual Behavior

## Sheet Configuration

Paste the relevant sheet headers and a sample row (redact real financial data):

```
Sheet: Daily Log
Headers: Date | Budget Cycle | Type | Category | Description | To Account | From Account | Amount | Note
Sample row: 03-Jul-26 | Jul-26 | Expense | Groceries | Weekly shop | | Zenith | 18000 | Dashboard Entry
```

## Apps Script Execution Log

Paste relevant output from **Extensions → Apps Script → Executions**:

```
(paste here)
```

## Environment

- Browser:
- Deployed as: Container-bound script / Web app
- FinanceOS version or commit:

## Additional Context

Anything else worth noting (recent changes, whether this reproduces with the sample data in `sample-data/budgetTrackerDemo.xlsx`, etc.)
