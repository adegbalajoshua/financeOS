# Repository Metadata

Reference for the GitHub repo's "About" panel and marketing surface. Not user-facing documentation, this is a maintainer setup guide.

## Repository Description

Use as the one-line description in **Settings → General**:

> Personal finance operating system built entirely on Google Sheets and Apps Script. No server, no database, no hosting cost.

## Topics / Tags

Add under **Settings → General → Topics**:

```
google-apps-script
google-sheets
personal-finance
budgeting
finance-tracker
javascript
no-code
low-code
dashboard
apexcharts
webhook
telegram-bot
open-source
```

## Badges

Already placed at the top of `README.md`. Reference set:

```markdown
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-Google%20Apps%20Script-4285F4)](https://developers.google.com/apps-script)
[![Status](https://img.shields.io/badge/status-active-brightgreen)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-blueviolet)](CONTRIBUTING.md)
```

Once a first tagged release exists, add:

```markdown
[![Release](https://img.shields.io/github/v/release/OWNER/financeos)](https://github.com/OWNER/financeos/releases)
```

Once GitHub Discussions is enabled:

```markdown
[![Discussions](https://img.shields.io/github/discussions/OWNER/financeos)](https://github.com/OWNER/financeos/discussions)
```

Replace `OWNER` with the actual GitHub username/org before publishing.

## Social Preview Image

**Settings → General → Social preview.** Use a 1280x640px image showing the dashboard in dark mode with the KPI row and donut chart visible, this is what renders when the repo link is shared on social platforms or in Slack/Discord unfurls. Generate this after the screenshots in `docs/SCREENSHOTS.md` are captured.

## Demo GIF Plan

A single GIF for the top of `README.md`, under the badges, above the feature list.

**Target duration:** 8 to 12 seconds, looping.

**Sequence:**
1. (1s) Google Sheets view, cursor clicks **financeOS → Launch Dashboard**.
2. (1s) Loader spinner, brief.
3. (2s) Dashboard fades in, stagger entrance animation plays, KPI counters animate up.
4. (2s) Cursor clicks the FAB, menu expands, clicks **Add Expense**.
5. (2s) Modal opens, fills in a sample transaction, submits.
6. (2s) Modal closes, toast confirms, dashboard refreshes with updated KPI.
7. (1s) Cursor clicks dark mode toggle, theme switches, charts re-theme live.

**Capture settings:** 1280x800 browser window, no bookmarks bar, cursor highlighting enabled if your capture tool supports it. Export as GIF at 12 to 15 fps to keep file size under 8 MB (GitHub's inline render limit), or host as an MP4 via GitHub's drag-and-drop asset upload and embed that instead for a smaller repo footprint.

**Placement in README:**

```markdown
<div align="center">
  <img src="docs/screenshots/demo.gif" alt="FinanceOS dashboard demo" width="800">
</div>
```

Add this directly below the badge row in `README.md` once captured.
