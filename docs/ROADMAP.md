# Roadmap

## Versioning Strategy

FinanceOS uses adapted Semantic Versioning (`MAJOR.MINOR.PATCH`):

- **MAJOR**: Breaking changes to the sheet schema (column renames/removals), or a change that requires re-authorization of Apps Script scopes.
- **MINOR**: New modules, new sheet columns (additive only), new dashboard features, non-breaking API additions.
- **PATCH**: Bug fixes, documentation, internal refactors with no external behavior change.

Pre-`1.0.0` versions (`0.x.y`) may include breaking schema changes without a major version bump, since the schema is still being finalized (see the known account-column issues in [CHANGELOG.md](../CHANGELOG.md)). `1.0.0` will be cut once those are resolved and the schema is considered stable.

## Release Checklist

Before tagging any release:

- [ ] All entries under `CHANGELOG.md → Unreleased` are accurate and complete.
- [ ] `Unreleased` is renamed to the new version number and dated.
- [ ] Version badge in `README.md` updated, if present.
- [ ] All five worksheet schemas in `docs/INSTALLATION.md` match the current code exactly.
- [ ] `docs/API.md` reflects any new or changed global endpoints.
- [ ] Manual smoke test: dashboard load, transaction submission (Expense, Income, Transfer), cycle rollover, Analytics generation, and webhook logging (if `gateway.js` changed).
- [ ] No hardcoded secrets, spreadsheet IDs, or personal data in any committed file.
- [ ] GitHub release notes drafted from the Changelog entry.
- [ ] Tag pushed (`vX.Y.Z`) and GitHub Release published.

## Near-Term (Next Minor Release)

- Resolve the `From Account` / `To Account` column-order discrepancy between `gateway.js` and `api.js`/`automation.js` (tracked as a known issue since `0.1.0`).
- Correct Income transaction handling so submitted income credits the selected account instead of debiting it.
- Add a shared-secret validation step to `doPost` as an opt-in security hardening measure for public webhook deployments.
- Expand the transaction modal to support editing/deleting a logged transaction, not just appending new ones.

## Mid-Term

- Recurring transactions (rent, subscriptions) with automatic logging on a schedule via a time-driven Apps Script trigger.
- CSV export of `Daily Log` for external analysis or tax prep.
- Configurable liquid-account type list (currently hardcoded to `Bank`, `Mobile`, `Cash` in `financeEngine.js`) via a `Settings` entry.
- A dedicated "Reports" view aggregating multiple cycles for trend analysis, beyond the single-cycle dashboard.

## Long-Term / Exploratory

- Multi-currency support, currency-aware balance calculation and per-account currency tagging.
- Multi-user / shared-household mode with per-user transaction attribution (would require moving beyond spreadsheet-level sharing as the access control mechanism).
- A native mobile companion (likely a lightweight PWA wrapper around the same `API` endpoints via a public web app, rather than a true native app), given the Apps Script constraint that background execution and push notifications aren't well supported.
- Pluggable integration framework so `gateway.js`-style webhooks can be added for other chat platforms (WhatsApp, Discord) without duplicating the parsing logic.

## Explicitly Out of Scope

- Real-time multi-user collaboration (Apps Script and Sheets don't provide the primitives for this without significant architectural change).
- A hosted, multi-tenant SaaS version. FinanceOS is designed to be self-deployed into your own Google account, that's a deliberate architectural choice, not a temporary limitation.
- Bank account synchronization (Plaid-style). This is a personal finance *tracker*, not an aggregator, and pulling live bank data introduces a compliance and security surface well beyond what a spreadsheet-based project should take on.
