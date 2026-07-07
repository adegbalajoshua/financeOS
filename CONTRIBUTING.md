# Contributing to FinanceOS

FinanceOS is a Google Apps Script project, which comes with constraints that don't apply to a typical Node or Python repo. Read this before opening a PR.

## Ground Rules

1. **No breaking changes to the sheet schema.** Column order and names in `Settings`, `Accounts`, `Budget Setup`, and `Daily Log` are load-bearing. `Database.getSheetDataAsObjects` maps rows to objects by header name, so `FinanceEngine` depends on exact header text (`From Account`, `To Account`, `Budget Cycle`, etc.). If you need a new field, add a new column, don't rename or reorder existing ones.
2. **Database module owns `SpreadsheetApp`.** No other module should call `SpreadsheetApp.getActiveSpreadsheet()` or interact with ranges/sheets directly. Route all reads and writes through `Database`.
3. **Business logic stays out of the frontend.** Calculations belong in `financeEngine.js`, not in `dashboard.js.html` or `components.js.html`. The frontend renders what the backend computes.
4. **Cache invalidation is mandatory.** Any function that writes a transaction, budget, or setting must call `API.clearCache()` afterward. Forgetting this is the single most common bug in this codebase.
5. **`.html` files are Apps Script HTML templates, not standalone web files.** They're inlined into `dashboard.html` via `HtmlService.createHtmlOutputFromFile`. Keep the `<script>` wrapper intact and don't add `<!DOCTYPE>`, `<html>`, or `<head>` tags to partials.

## Project Structure

See [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) for the full layout and what belongs where.

## Development Workflow

1. Fork the repository.
2. Create a copy of the demo spreadsheet (`budgetTrackerDemo.xlsx`) in your own Google Drive.
3. Open **Extensions → Apps Script** and paste your working copy of the `.js` and `.html` files.
4. Make your changes against that live sandbox. Apps Script has no local test runner, all testing happens against a real spreadsheet.
5. Test both the dashboard flow (`Launch Dashboard`) and, if relevant, the webhook flow (`doPost`) before submitting.
6. Open a PR against `main`.

## Commit Style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(api): add pagination to dashboard payload
fix(database): correct off-by-one row index in updateSetting
docs(readme): update sheet schema table
refactor(financeEngine): extract balance calculation into helper
```

## Pull Request Checklist

- [ ] Change respects the module boundaries described above.
- [ ] No direct `SpreadsheetApp` calls outside `database.js`.
- [ ] Any new write path calls `API.clearCache()`.
- [ ] Any new sheet column is documented in `docs/INSTALLATION.md` and `README.md`.
- [ ] JSDoc comments added for new public methods, matching the existing style.
- [ ] Manually tested against a live spreadsheet (attach a screenshot or short clip if the change is UI-facing).
- [ ] `CHANGELOG.md` updated under `Unreleased`.

## Reporting Bugs

Use the **Bug Report** issue template. Include:
- The exact sheet setup you're using (column headers, a sample row).
- Console output from **View → Logs** in the Apps Script editor.
- Whether the failure happens in the dashboard, the webhook, or the Analytics generator.

## Proposing Features

Use the **Feature Request** issue template, or start a thread in [GitHub Discussions](https://github.com) under **Ideas** before writing code. Given the single-spreadsheet, no-database architecture, some features (multi-user auth, real-time sync) are out of scope. Check the [Roadmap](docs/ROADMAP.md) first.

## Code Style

- Match the existing formatting: one blank line between logical blocks inside functions, JSDoc on every public method.
- Prefer explicit `CONFIG.SHEETS.X` references over hardcoded sheet name strings.
- Keep functions in `financeEngine.js` pure where possible, no direct I/O.

## License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).
