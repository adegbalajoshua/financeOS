# Versioning Strategy

FinanceOS follows adapted [Semantic Versioning](https://semver.org/): `MAJOR.MINOR.PATCH`.

## What Counts as a Version Bump

| Change | Bump | Example |
|---|---|---|
| Sheet column renamed or removed | MAJOR | Renaming `To Account` to `Destination Account` |
| Change requiring re-authorization of Apps Script scopes | MAJOR | Adding a new external API call requiring a new OAuth scope |
| New sheet column, additive only | MINOR | Adding a `Tags` column to `Daily Log` |
| New module or new global endpoint | MINOR | Adding a `recurringTransactions.js` module |
| New dashboard feature, backward compatible | MINOR | Adding a CSV export button |
| Bug fix, no schema or API change | PATCH | Fixing the From/To Account column swap in `gateway.js` |
| Documentation only | PATCH | Correcting `docs/API.md` |
| Internal refactor, no external behavior change | PATCH | Extracting a helper inside `financeEngine.js` |

## Pre-1.0 Exception

Versions under `1.0.0` (`0.x.y`) may include breaking schema changes without a MAJOR bump. The schema isn't considered stable until the known From/To Account discrepancies (`docs/TROUBLESHOOTING.md`) are resolved, `1.0.0` marks that stabilization point, not a marketing milestone.

## Tagging

- Git tags follow `vMAJOR.MINOR.PATCH` (e.g. `v0.2.0`).
- Tag only after `CHANGELOG.md` has a dated section for the version and the [Release Checklist](RELEASE_CHECKLIST.md) is complete.
- Apps Script deployment versions (see `docs/DEPLOYMENT.md`) are independent of git tags. A git tag doesn't automatically create a new Apps Script Web App version, that's a manual step.

## Deprecation Policy

Once `1.0.0` ships, deprecated sheet columns or endpoints are kept functional for at least one MINOR version, marked clearly in `CHANGELOG.md` under a `Deprecated` heading, before removal in a subsequent MAJOR release.
