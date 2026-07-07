# Telegram Integration Guide

`gateway.js` exposes a `doPost` endpoint designed to accept transaction data from a Telegram bot, letting you log an expense by sending a message like `Coffee : 1500` without opening the spreadsheet.

## How the Parser Works

`doPost` reads `payload.desc`, a string, and splits it on the first colon:

```
"Coffee : 1500"
        │
        ├── description = "Coffee"
        └── amount      = 1500
```

If no colon is present, the entire string becomes the description and amount defaults to `0`. If `payload.desc` is missing entirely, the description falls back to `"Manual Entry"`.

Additional fields the webhook accepts, all optional:

| Field | Fallback if omitted |
|---|---|
| `date` | Current date/time |
| `cycle` | `Active_Cycle` from Settings |
| `type` | `"Expense"` |
| `cat` | `Default_Category` from Settings |
| `account` | `Default_Account` from Settings |
| `to` | Empty string |

## Prerequisites

- A completed [Installation](INSTALLATION.md) with `Settings` populated (`Default_Category`, `Default_Account` matter here, since most Telegram messages will omit `cat` and `account`).
- A deployed Web App endpoint (see [Deployment Guide](DEPLOYMENT.md)) with **Who has access** set to `Anyone`, since Telegram's servers call this URL directly.
- A Telegram bot token, created via [@BotFather](https://t.me/BotFather).

## Option A: Telegram Bot via a Middleware (Recommended)

Telegram's own webhook format doesn't match the flat JSON shape `doPost` expects, so a small middleware step (n8n, Zapier, Make, or a lightweight Cloud Function) is the most reliable path:

1. Create a bot with **@BotFather**, save the bot token.
2. Set the bot's webhook to point at your middleware:
   ```
   https://api.telegram.org/bot<TOKEN>/setWebhook?url=<YOUR_MIDDLEWARE_URL>
   ```
3. In your middleware, extract `message.text` from the incoming Telegram update and forward it to the FinanceOS Web App URL as:
   ```json
   { "desc": "<message.text>" }
   ```
4. Point the middleware's outbound request at your FinanceOS Web App URL from [Deployment](DEPLOYMENT.md).

### Example middleware payload (n8n / Zapier HTTP Request node)

```json
{
  "desc": "{{$json.message.text}}"
}
```

### Example curl test (bypassing Telegram, for local verification)

```bash
curl -X POST "<YOUR_WEB_APP_URL>" \
  -H "Content-Type: application/json" \
  -d '{"desc": "Coffee : 1500"}'
```

Expected response:

```json
{ "status": "success", "message": "Logged: Coffee (1500)" }
```

## Option B: Direct Bot-to-Webhook (Advanced)

If your middleware step supports templating the full JSON body, you can pass Telegram's raw update shape and extract fields directly in a lightly modified `doPost`. This requires editing `gateway.js` to read `payload.message.text` instead of `payload.desc`, which is a code change, not a configuration change, so treat it as a fork rather than a supported configuration.

## Sending Transaction Types Other Than Expense

To log income or a transfer via Telegram, include `type` (and `to` for transfers) explicitly, since the shorthand parser doesn't infer type from natural language:

```json
{ "desc": "Freelance payment : 45000", "type": "Income", "account": "Zenith" }
```

```json
{ "desc": "Move to savings : 20000", "type": "Transfer", "account": "Zenith", "to": "Savings Vault" }
```

## Known Limitation

As documented in [Troubleshooting](TROUBLESHOOTING.md), `gateway.js` currently writes `account` and `to` into columns in the reverse order used elsewhere in the codebase. Verify a test transaction's effect on account balances in the dashboard before relying on this integration for real bookkeeping.

## Verifying Delivery

After sending a test message:

1. Check `Daily Log` for the new row.
2. Confirm the **financeOS** dashboard reflects the updated balance after a refresh (the webhook calls `API.clearCache()`, so a manual refresh should show current data).
3. If nothing appears, check **Executions** in the Apps Script editor (left sidebar) for the `doPost` invocation and its logged error, if any.
