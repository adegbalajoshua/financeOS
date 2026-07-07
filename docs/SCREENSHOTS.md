# Screenshots

This page holds the visual gallery for FinanceOS. Populate the sections below with real screenshots before the first public release, placeholders are marked accordingly.

## Dashboard, Light Mode

`![Dashboard light mode](./screenshots/dashboard-light.png)`

*Capture the full dashboard immediately after `staggerEntrance()` completes, KPI counters at final value, charts fully rendered.*

## Dashboard, Dark Mode

`![Dashboard dark mode](./screenshots/dashboard-dark.png)`

## Transaction Modal (Expense / Income / Transfer)

`![Transaction modal](./screenshots/transaction-modal.png)`

*Show the Transfer variant specifically, since it demonstrates the conditional "To Account" field.*

## Budget Utilization Cards

`![Budget cards](./screenshots/budget-cards.png)`

*Include at least one card at each utilization tier (green, under 75%; amber, 75 to 89%; red, 90%+) to show the conditional styling.*

## Native Analytics Sheet

`![Generated Analytics sheet](./screenshots/analytics-sheet.png)`

*Capture after running **financeOS → Generate Analytics**, showing both the pie and column charts.*

## financeOS Custom Menu

`![Custom menu](./screenshots/custom-menu.png)`

## Guidelines for Contributors Submitting Screenshots

1. Use a spreadsheet populated with the demo data (`sample-data/budgetTrackerDemo.xlsx`), not real financial data.
2. Capture at 2x resolution (Retina/HiDPI) where possible.
3. Crop to the modal or dialog boundary, exclude the surrounding Google Sheets chrome unless the screenshot is specifically demonstrating menu placement.
4. Save as PNG, place under `docs/screenshots/`, and update the corresponding image path above.
5. Keep file sizes under 500 KB, use PNG compression (`pngquant` or similar) if needed.
