# AVA Telegram Backend

A small, beginner-friendly Telegram webhook built with a Cloudflare Worker. AVA
identifies herself as **AVA, assistant ni Boss Allan**, follows Manila time, and
automatically uses Sleep Mode from 11:00 PM until 7:00 AM.

## Project structure

```text
src/index.js       Worker, Telegram webhook, and AVA replies
test/index.test.js Small tests for reply selection and Manila sleeping hours
wrangler.toml      Cloudflare Worker configuration (no secrets)
package.json       development commands and Wrangler dependency
.env.example       secret names only; never add values here
```

## Before you begin

1. Create a Telegram bot with **@BotFather** and retain its token privately.
2. Create a free [Cloudflare account](https://dash.cloudflare.com/sign-up).
3. Install a current Node.js LTS release and run `npm install` in this folder.
4. Authenticate the Cloudflare CLI with `npx wrangler login`.

Do **not** paste a token or secret into source code, `wrangler.toml`, a commit,
an issue, or a chat message. The `.gitignore` excludes common local secret
files, but Cloudflare secrets are the intended storage mechanism.

## 1. Deploy the Worker

Run:

```sh
npm install
npm test
npm run deploy
```

Wrangler prints a URL similar to
`https://ava-telegram-backend.<your-subdomain>.workers.dev`. Save that public
HTTPS URL as `WORKER_URL` for the webhook step.

## 2. Add the bot token securely

Run this command and enter the token only at Wrangler's hidden prompt:

```sh
npx wrangler secret put TELEGRAM_BOT_TOKEN
```

The Worker reads the value from `env.TELEGRAM_BOT_TOKEN`; it is never stored in
this repository.

## 3. Add a webhook verification secret securely

Generate a new random value locally (for example, with a password manager),
then run the following and enter it only at Wrangler's hidden prompt:

```sh
npx wrangler secret put TELEGRAM_WEBHOOK_SECRET
```

Keep this value temporarily available in your password manager for the next
step. Telegram will send it in a verification header on every webhook request,
and the Worker rejects requests that do not match.

After adding or changing secrets, deploying again is not normally required.

## 4. Register the Telegram webhook

After deploying and configuring both secrets, open this URL in a browser:

```sh
<WORKER_URL>/telegram/setup
```

The Worker securely calls Telegram's `setWebhook` method using its configured
secrets and automatically registers `<WORKER_URL>/telegram/webhook`. A
successful setup displays `AVA Telegram webhook connected successfully.`

Open `<WORKER_URL>/telegram/webhook-info` to check the registered URL, connection
state, pending update count, and last Telegram delivery error. This endpoint
returns only an allowlist of status fields and never returns either secret.

## 5. Test AVA

1. Open the bot's Telegram chat and press **Start**.
2. Try AVA's commands (command names are case-insensitive and also work with a
   Telegram bot-name suffix such as `/status@AvaBossAllanbot`):
   - `/start` introduces AVA and explains how to leave a message.
   - `/help` shows AVA's short help menu.
   - `/status` reports whether Boss Allan is **AVAILABLE**, **BUSY**, or
     **SLEEPING**, using Manila time and the current Busy Mode setting.
3. Send a normal message. Between 7:00 AM and 11:00 PM in `Asia/Manila`, AVA
   acknowledges it; overnight, AVA sends the Sleep Mode reply.
4. Send `urgent`, `emergency`, `importante`, `ASAP`, `kailangan agad`, or
   `nagmamadali` to verify the urgent response.
5. Open `<WORKER_URL>/` in a browser. It should say
   `AVA Telegram backend is online`.

Only text messages receive a reply. Other Telegram updates are acknowledged so
Telegram does not repeatedly deliver them.

## Optional Busy Mode

Busy Mode is ready for later use. In `wrangler.toml`, set `BUSY_MODE = "true"`
and run `npm run deploy`. Restore it to `"false"` and deploy when Boss Allan is
available again. Urgent messages take priority over both Busy and Sleep modes.

## Security notes

- The webhook accepts only `POST` and verifies Telegram's
  `X-Telegram-Bot-Api-Secret-Token` header.
- Both required credentials live only in Cloudflare's encrypted secret store.
- The Worker does not log message bodies, bot tokens, or secrets.
- If any credential is accidentally disclosed, revoke/rotate it immediately,
  update the corresponding Cloudflare secret, and register the webhook again.
