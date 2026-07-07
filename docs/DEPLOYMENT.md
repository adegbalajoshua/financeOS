# Deployment Guide

FinanceOS has two distinct "deployments": the spreadsheet-bound dashboard (no deployment step required beyond installation) and the optional web app endpoint used for external transaction logging (`gateway.js`). This guide covers the latter, plus considerations for keeping a production instance stable.

## Dashboard: No Deployment Needed

The dashboard runs as a **container-bound script**, tied directly to your spreadsheet. There's nothing to deploy, publish, or version for this part. Once the Apps Script files are pasted in (see [Installation Guide](INSTALLATION.md)), the `financeOS` menu and `Launch Dashboard` action work immediately for anyone with edit access to the sheet.

## Web App Deployment (for the `doPost` Webhook)

To let external tools (Telegram, n8n, Zapier, curl) post transactions into your Daily Log, deploy the script as a Web App.

### Steps

1. In the Apps Script editor, click **Deploy → New deployment**.
2. Click the gear icon next to **Select type** and choose **Web app**.
3. Configure:
   - **Description:** something identifiable, e.g. `FinanceOS Webhook v1`.
   - **Execute as:** `Me` (your account). This is required, since the script needs your permissions to write to the spreadsheet regardless of who calls the endpoint.
   - **Who has access:** choose based on your threat model:
     - `Only myself`, safest, but only works for requests you can authenticate as yourself (not useful for a Telegram bot).
     - `Anyone`, required for most external integrations (Telegram, webhooks from third-party services). This makes the endpoint reachable by anyone with the URL. See the security notes below before choosing this.
4. Click **Deploy**.
5. Copy the **Web app URL**. This is your webhook endpoint, treat it as a secret.

### Versioning Deployments

Every time you edit `gateway.js` (or any file it depends on) and want the change to go live, you must create a **new deployment version**, editing an existing script does not automatically update a live Web App deployment.

1. **Deploy → Manage deployments**.
2. Select the existing deployment, click the pencil icon.
3. Under **Version**, select **New version**, add a description, and click **Deploy**.
4. The Web App URL stays the same across versions, only the code behind it changes.

This versioning behavior is important: if you're debugging and changes don't seem to take effect on the webhook, you likely forgot this step.

## Security Considerations for Public Webhooks

Since `doPost` has no built-in authentication, review [SECURITY.md](../SECURITY.md) before setting access to `Anyone`. At minimum:

- Add a shared-secret field to your JSON payload (for example `payload.token`) and validate it at the top of `doPost` before processing, rejecting with an error response if it doesn't match a value stored in **Script Properties** (`PropertiesService.getScriptProperties()`), not hardcoded in source.
- Avoid committing your deployment URL to a public repository or client-side code.
- Monitor `Daily Log` periodically for unexpected entries if the endpoint is public.

## Environment-Specific Settings

FinanceOS reads all environment-style configuration from the `Settings` sheet (`Active_Cycle`, `Currency`, `Default_Category`, `Default_Account`), not from `.env` files or Script Properties, with the exception of any secret you add for webhook authentication (which should live in Script Properties). This means "deploying to production" is really just:

1. Ensuring the `Settings` sheet reflects the correct active cycle and defaults for the live spreadsheet.
2. Re-deploying the Web App if `gateway.js` changed.
3. Confirming `CONFIG.CACHE.EXPIRATION_SEC` in `config.js` matches your tolerance for stale dashboard data (default: 300 seconds).

## Rollback

Apps Script keeps every saved version of your project. To roll back:

1. **Deploy → Manage deployments**.
2. Edit the deployment, and under **Version**, select a previous version number instead of creating a new one.
3. Click **Deploy**.

There is no automatic rollback trigger, this is a manual process.

## Multi-Spreadsheet / Multi-User Deployment

FinanceOS is architected for a single spreadsheet, single user model. Deploying a separate instance for a second person means copying the entire spreadsheet (with its own Apps Script project) rather than sharing one deployment. Multi-tenant support is tracked as a future consideration in the [Roadmap](ROADMAP.md), not currently supported.
