# Security Policy

## Supported Versions

FinanceOS is pre-1.0 and distributed as source you deploy into your own Google account. There is no hosted service and no centrally patched version, so "supported version" means the latest commit on `main`.

| Version | Supported |
|---|---|
| `main` (latest) | Yes |
| Tagged releases prior to latest | No, upgrade to `main` |

## Reporting a Vulnerability

Do not open a public GitHub issue for security vulnerabilities.

Instead, use GitHub's private vulnerability reporting (**Security → Report a vulnerability** on the repository) or email the maintainer directly (see repository profile for contact). Include:

- A description of the vulnerability and its impact.
- Steps to reproduce, including any specific sheet configuration required.
- The affected file(s) and function(s), if known.

Expect an initial response within 5 business days. Confirmed vulnerabilities will be patched and disclosed via the [Changelog](CHANGELOG.md) with credit to the reporter, unless anonymity is requested.

## Threat Model and Data Handling

FinanceOS runs entirely inside your own Google account. Understanding what that means for security:

- **Your spreadsheet is your database.** All financial data (transactions, balances, budgets) lives in the Google Sheet you control. FinanceOS never sends data to a third-party server.
- **The webhook is the primary external attack surface.** `gateway.js` exposes a `doPost` endpoint intended for integrations like Telegram bots. If deployed as a public web app, anyone with the URL can POST transactions into your log. Deployment guidance in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) covers restricting access appropriately, and you should treat the deployment URL as a secret.
- **No authentication layer is built into the webhook.** `doPost` trusts the payload it receives. If you expose the endpoint publicly, add your own shared-secret check (for example, a token field in the JSON payload validated before the row is appended) before relying on it in production.
- **Apps Script execution runs with your account's permissions.** Any script you paste into your own Apps Script project has access to whatever that project is authorized for. Only install code from sources you trust, and review third-party contributions before merging.
- **Dashboard access is scoped to spreadsheet access.** The dashboard is a modal launched from within Sheets, so anyone with edit access to your spreadsheet can open it.

## Best Practices for Deployers

1. Never commit real financial data, API keys, or spreadsheet IDs into a public fork.
2. If exposing the `doPost` webhook, add a shared-secret or signature check before merging any PR that relies on public exposure.
3. Restrict spreadsheet sharing to accounts that should have transaction access, dashboard access follows spreadsheet access.
4. Rotate your Web App deployment URL if you suspect it has leaked.
5. Review the [Known Issues](CHANGELOG.md#unreleased) section before relying on the webhook for financial record-keeping, there are open discrepancies in account-column handling that could misattribute funds.
