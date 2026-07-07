## Summary

What does this PR change and why?

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change (sheet schema or scope changes)
- [ ] Documentation
- [ ] Refactor (no behavior change)

## Module(s) Touched

- [ ] Database
- [ ] Finance Engine
- [ ] API
- [ ] Analytics
- [ ] Automation
- [ ] Gateway / Webhook
- [ ] Menu
- [ ] Dashboard frontend
- [ ] Docs only

## Checklist

- [ ] No direct `SpreadsheetApp` calls outside `database.js`.
- [ ] Any new write path calls `API.clearCache()`.
- [ ] Any new sheet column is additive and documented in `docs/INSTALLATION.md` and `README.md`.
- [ ] JSDoc added for new public methods, matching existing style.
- [ ] Manually tested against a live spreadsheet (attach screenshot/clip if UI-facing).
- [ ] `CHANGELOG.md` updated under `Unreleased`.
- [ ] If this touches `gateway.js` or the account column ordering, confirmed it doesn't reintroduce or worsen the known From/To Account discrepancy (see `docs/TROUBLESHOOTING.md`).

## Testing Performed

Describe what you actually ran (dashboard load, transaction submission, cycle rollover, webhook call, etc.) and against what sheet configuration.

## Screenshots (if UI-facing)

## Related Issues

Closes #
