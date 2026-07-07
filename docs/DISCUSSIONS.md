# GitHub Discussions

Enable Discussions under **Settings → General → Features** and configure these categories. Issues are for actionable bugs and approved feature work, Discussions is for everything upstream of that.

| Category | Format | Purpose |
|---|---|---|
| **Announcements** | Announcement | Maintainer-only. Release notes, breaking-change notices, deprecation warnings. |
| **Ideas** | Open-ended discussion | Feature proposals before they become a Feature Request issue. Use this to gauge interest and refine scope, per `CONTRIBUTING.md`. |
| **Q&A** | Question/Answer | Setup problems, sheet schema questions, "how do I..." Not for confirmed bugs, redirect those to a Bug Report issue. |
| **Show and Tell** | Open-ended discussion | Contributors sharing their own FinanceOS customizations, dashboards, or integrations (custom Telegram bots, extra KPIs, etc). |
| **Integrations** | Open-ended discussion | Webhook, Telegram, n8n/Zapier/Make setups. Community-maintained recipes belong here before graduating to `docs/TELEGRAM_INTEGRATION.md` if broadly useful. |
| **General** | Open-ended discussion | Anything that doesn't fit above. |

## Routing Rules for Maintainers

- A **Q&A** thread that turns out to be a real bug gets converted: ask the reporter to open a Bug Report issue, referencing the discussion.
- An **Ideas** thread that reaches rough consensus gets converted into a Feature Request issue by whoever wants to build it, referencing the discussion thread for context.
- **Show and Tell** posts describing a broadly useful pattern (a new integration, a reusable dashboard tweak) are candidates for a documentation PR, link back to the original post.

## Pinned Discussion Starters (create at launch)

1. An **Announcements** post linking to `README.md`, `CONTRIBUTING.md`, and the current `docs/ROADMAP.md`.
2. A pinned **Ideas** post: "What would you want FinanceOS to do next?" linking the Roadmap's Explicitly Out of Scope section so people aren't surprised by rejections.
3. A pinned **Integrations** post collecting community webhook recipes beyond the built-in Telegram guide.
