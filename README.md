# AVA Telegram Backend

A small, beginner-friendly Telegram webhook built with a Cloudflare Worker. AVA
identifies herself as **AVA, assistant ni Boss Allan**, follows Manila time, and
automatically uses Sleep Mode from 11:00 PM until 7:00 AM.

AVA also includes a **Business Inquiry Mode** for NextPage Digital. It detects
common Filipino and English website-service questions, shares introductory
pricing and portfolio links, then politely collects lead details one question
at a time. Answers are held only in a temporary in-memory conversation session
while the inquiry is being completed; sessions expire after 30 minutes and are
not permanent storage.

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
   - `/services` shows NextPage Digital's website services and introductory
     prices (Starter from ₱999, Business from ₱1,999, and custom quotations).
   - `/portfolio` shares the NextPage Digital and café/restaurant sample sites.
3. Send a normal message. Between 7:00 AM and 11:00 PM in `Asia/Manila`, AVA
   acknowledges it; overnight, AVA sends the Sleep Mode reply.
4. Send `urgent`, `emergency`, `importante`, `ASAP`, `kailangan agad`, or
   `nagmamadali` to verify the urgent response.
5. Open `<WORKER_URL>/` in a browser. It should say
   `AVA Telegram backend is online`.

## Business Inquiry Mode

Send a natural Filipino or English message such as `Magkano po website?`,
`Pwede po magpagawa ng website?`, `Need ko po website para sa business ko`,
`May sample website po kayo?`, or `How much is a website?`. AVA recognizes a
website subject (`website`, `web design`, `site`, or `webpage`) together with an
inquiry intent such as price, interest, having one made, need, samples, or
services. Requiring both kinds of keyword helps prevent an unrelated message
with only a generic word such as `need`, `sample`, or `site` from starting the
questionnaire.

AVA then introduces herself as **AVA, assistant ni Boss Allan**, explains
NextPage Digital's packages, and shares:

- [NextPage Digital](https://bitchevillamor-bot.github.io/Nextpage-Digital/)
- [Sample café/restaurant website](https://bitchevillamor-bot.github.io/Tuboy-s-Lopez-demo/)

AVA then asks separately for the customer's name, business name, business
type, preferred contact, desired website, requested pages/features, and an
optional approximate budget. After the last answer, AVA returns a formatted
summary for Boss Allan. Customers can use `/help`, `/status`, `/services`, or
`/portfolio` without those commands being mistaken for an inquiry answer.

Conversation sessions live only in the running Worker isolate, expire after 30
minutes, and may disappear sooner if Cloudflare recycles the isolate. For a
production CRM workflow, the completed summary should later be forwarded to a
secure, purpose-built lead store with an appropriate privacy policy.

Other unsupported Telegram updates are acknowledged so Telegram does not
repeatedly deliver them.

## Connect AVA to Boss Allan's Telegram Business account

Telegram Business users can connect AVA as a **chatbot / chat automation bot**
so replies are sent from Boss Allan's personal account rather than from the
ordinary `@AvaBossAllanbot` chat. The normal bot webhook and all commands above
continue to work after the connection is enabled.

1. In Telegram, enable Telegram Business/Premium if necessary. Open
   **Settings → Telegram Business → Chatbots** (the label may appear as
   **Business → Chatbots** on some clients), select `@AvaBossAllanbot`, choose
   the private chats it may access, and grant permission to reply to messages.
2. Obtain Boss Allan's numeric Telegram user ID through a trusted method. Store
   it as an encrypted Worker secret—never put the value in this repository:

   ```sh
   npx wrangler secret put BOSS_ALLAN_TELEGRAM_USER_ID
   ```

   This lets AVA reliably ignore messages sent by Boss Allan himself, including
   after a fresh Worker isolate starts. AVA also learns the owner ID from
   Telegram's `business_connection` update while an isolate is running.
3. Create a Cloudflare KV namespace for durable update deduplication:

   ```sh
   npx wrangler kv namespace create TELEGRAM_UPDATE_DEDUP
   ```

   Copy the returned namespace ID into a local `[[kv_namespaces]]` block using
   the commented template in `wrangler.toml`, with the binding name exactly
   `TELEGRAM_UPDATE_DEDUP`. The Worker has a bounded in-memory fallback for
   development, but KV is strongly recommended in production so Telegram
   retries delivered to another Worker isolate do not produce another reply.
4. Deploy again, then revisit `<WORKER_URL>/telegram/setup`. Setup registers
   `message`, `business_connection`, `business_message`,
   `edited_business_message`, and `deleted_business_messages` as allowed
   update types.
5. Send Boss Allan a test message from a different personal account. From
   **11:00 PM through 6:59 AM Asia/Manila**, AVA sends the sleeping response.
   From **7:00 AM through 10:59 PM**, it sends the busy response only when
   `BUSY_MODE = "true"`. When available, ordinary personal messages receive no
   automatic reply; existing urgent, safety, and website-inquiry handling is
   retained.

AVA uses the incoming `business_connection_id` on Telegram's `sendMessage`
request, which is what makes the response appear on behalf of Boss Allan's
connected account. Messages marked as sent by a business bot, messages from a
bot account, Boss Allan's own messages, edited messages, and deletion updates
are never answered, preventing reply loops. New business messages are marked
as processed before delivery is attempted, so each message receives at most
one automatic-reply attempt.

## Azzy voice notes

AVA recognizes Azzy by the Telegram username **`twoseventwothree`**. You may
also configure `AZZY_TELEGRAM_USER_ID` (recommended because a numeric account
ID does not change when a username changes). When Azzy sends a voice note, AVA:

1. asks Telegram `getFile` for its temporary path and downloads it directly;
2. sends the in-memory audio to OpenAI speech-to-text;
3. applies the existing urgent-message, Manila Sleep Mode, and Busy Mode rules;
4. creates a warm, gentle spoken reply with OpenAI text-to-speech; and
5. replies through Telegram `sendVoice`—voice in, voice out.

Add the OpenAI credential only as a Cloudflare secret:

```sh
npx wrangler secret put OPENAI_API_KEY
```

Never place the value in `.env.example`, `wrangler.toml`, source code, logs, or
commits. If desired, configure `AZZY_TELEGRAM_USER_ID` and
`BOSS_ALLAN_CHAT_ID` as Cloudflare secrets as well. When the latter is set,
Allan receives a private text notification containing the transcription;
transcriptions that are Telegram commands are never forwarded.

### Test an Azzy voice message

1. Deploy after setting `TELEGRAM_BOT_TOKEN`, `TELEGRAM_WEBHOOK_SECRET`, and
   `OPENAI_API_KEY`, and register the webhook as described above.
2. From the `twoseventwothree` account (or the account whose numeric ID is in
   `AZZY_TELEGRAM_USER_ID`), hold Telegram's microphone button and send a short
   voice note such as “Hello po.” AVA should answer with a voice note matching
   the current Available, Busy, or Sleeping status.
3. Send another voice note containing “urgent” or “importante” to check the
   urgent spoken response. If `BOSS_ALLAN_CHAT_ID` is configured, verify that
   chat receives `💜 Voice message from Azzy:` followed by the transcription.

The downloaded note and generated reply remain in request memory only and are
never written to permanent storage. AVA does not log audio or full message
content. If transcription fails, Azzy receives a warm text request to try
again. If speech generation or voice delivery fails, AVA sends the same warm
reply as text so the message is not lost. The built-in `coral` voice is used;
AVA does not clone or imitate a real person's voice.

## Optional Busy Mode

Busy Mode is ready for later use. In `wrangler.toml`, set `BUSY_MODE = "true"`
and run `npm run deploy`. Restore it to `"false"` and deploy when Boss Allan is
available again. Urgent messages take priority over both Busy and Sleep modes.

## Security notes

- The webhook accepts only `POST` and verifies Telegram's
  `X-Telegram-Bot-Api-Secret-Token` header.
- Telegram credentials and `OPENAI_API_KEY` live only in Cloudflare's encrypted
  secret store.
- The Worker does not log message bodies, bot tokens, or secrets.
- Connected-account IDs are supplied by Telegram or encrypted Worker secrets;
  no Telegram token or personal account ID is hardcoded.
- AVA never requests OTPs, passwords, card or banking credentials, crypto seed
  phrases, or other sensitive financial information. If one is sent during an
  inquiry, it is rejected instead of being added to the session.
- AVA does not accept payments. Boss Allan personally confirms any payment
  instructions.
- If any credential is accidentally disclosed, revoke/rotate it immediately,
  update the corresponding Cloudflare secret, and register the webhook again.
