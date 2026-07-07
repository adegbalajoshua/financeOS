# Release Checklist

Run through this in order before tagging any release. See [Versioning Strategy](VERSIONING.md) for how to pick the version number.

## 1. Code and Schema

- [ ] All five sheet schemas in `docs/INSTALLATION.md` match the actual code (`config.js` sheet names, header names referenced in `financeEngine.js`).
- [ ] Any schema change is additive, or the version bump is MAJOR per `docs/VERSIONING.md`.
- [ ] Every new write path calls `API.clearCache()`.
- [ ] No direct `SpreadsheetApp` access outside `database.js`.

## 2. Documentation

- [ ] `CHANGELOG.md → Unreleased` renamed to the new version, dated, and accurate.
- [ ] `docs/API.md` reflects all current global endpoints and their parameters.
- [ ] `docs/FAQ.md` and `docs/TROUBLESHOOTING.md` updated if this release closes a known issue.
- [ ] `README.md` badges and version references updated.

## 3. Manual Smoke Test

Run against a live spreadsheet with `sample-data/budgetTrackerDemo.xlsx` loaded:

- [ ] Dashboard opens via **financeOS → Launch Dashboard**.
- [ ] KPI counters, donut chart, and cash flow chart all render.
- [ ] Add Expense, Add Income, and Transfer all submit successfully and reflect in `Daily Log`.
- [ ] Refresh button forces a cache clear and shows updated data.
- [ ] **Start New Budget Cycle** completes and updates `Settings.Active_Cycle`.
- [ ] **Generate Analytics** produces both charts in the `Analytics` sheet.
- [ ] If `gateway.js` changed: a test webhook POST logs correctly and the response payload matches `docs/API.md`.

## 4. Security

- [ ] No spreadsheet IDs, API keys, or real financial data in any committed file.
- [ ] If the Web App deployment changed, a new deployment version was created (`docs/DEPLOYMENT.md`), not just a code save.
- [ ] `SECURITY.md` still accurately describes the current threat model.

## 5. Tag and Publish

- [ ] Git tag created: `vMAJOR.MINOR.PATCH`.
- [ ] GitHub Release published with notes copied from the `CHANGELOG.md` entry.
- [ ] Pinned **Announcements** discussion post updated or created (see `docs/DISCUSSIONS.md`).

## 6. Post-Release

- [ ] Open follow-up issues for anything deferred during this release (found during smoke test but not blocking).
- [ ] Confirm `docs/ROADMAP.md` reflects what actually shipped versus what's still pending.
