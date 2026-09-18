const SLEEP_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Tulog pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya. Salamat po.";

const BUSY_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Busy pa po ang boss ko sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya.";

const URGENT_REPLY =
  "Nagmamadali po ba kayo? Importante po ba ito at hindi maaaring hintayin hanggang matapos ang pagpapahinga o ginagawa ni Boss Allan? Si AVA ito, assistant niya. Maaari po ninyong iwan ang kumpletong message at ipapaabot ko ito sa kanya.";

const AVAILABLE_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Salamat po sa inyong message. Natanggap ko na po ito at ipapaabot ko kay Boss Allan.";

const START_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Maaari po kayong mag-iwan ng message dito at ipapaabot ko ito sa kanya. Kung gusto ninyong malaman ang status niya, gamitin ang /status.";

const HELP_REPLY = `AVA can help with:
• Taking messages for Boss Allan
• Telling you if Boss Allan is available, busy, or sleeping
• Handling urgent messages
• Receiving business and website inquiries

Commands:
/start - Start chatting with AVA
/help - Show this help menu
/status - Check Boss Allan’s availability
/services - View website services and pricing
/portfolio - View sample websites`;

const SERVICES_REPLY = `Hi po! Si AVA ito, assistant ni Boss Allan.

NextPage Digital website services:
• Starter Website — starts at ₱999
• Business Website — starts at ₱1,999
• Custom Website — quotation depends on the project

Simple, modern, at mobile-friendly websites po ang ginagawa namin para sa small businesses. Hindi po ako tumatanggap ng payment; si Boss Allan ang personal na magko-confirm ng payment instructions.`;

const PORTFOLIO_REPLY = `Hi po! Si AVA ito, assistant ni Boss Allan. Narito po ang sample websites ng NextPage Digital:

NextPage Digital:
https://bitchevillamor-bot.github.io/Nextpage-Digital/

Sample café/restaurant website:
https://bitchevillamor-bot.github.io/Tuboy-s-Lopez-demo/`;

const BUSINESS_INTRO = `Hi po! Si AVA ito, assistant ni Boss Allan. Gumagawa po ang NextPage Digital ng simple, modern, at mobile-friendly websites para sa small businesses.

Introductory packages:
• Starter Website — starts at ₱999
• Business Website — starts at ₱1,999
• Custom Website — quotation depends on the project

Portfolio:
NextPage Digital:
https://bitchevillamor-bot.github.io/Nextpage-Digital/

Sample café/restaurant website:
https://bitchevillamor-bot.github.io/Tuboy-s-Lopez-demo/

Kung interesado po kayo, maaari ko kayong tulungang kunin muna ang basic details para maipasa ko kay Boss Allan.`;

const PAYMENT_REPLY =
  "Hi po! Si AVA ito, assistant ni Boss Allan. Hindi po ako tumatanggap ng payment. Si Boss Allan po ang personal na magko-confirm ng tama at ligtas na payment instructions.";

const SENSITIVE_REPLY =
  "Para sa inyong seguridad, huwag po kayong magpadala ng OTP, password, banking credentials, card number, crypto seed phrase, o ibang sensitibong financial information. Si AVA ito, assistant ni Boss Allan, at hindi ko po kailangan ang mga detalyeng iyon.";

const SLEEPING_STATUS_REPLY = `Status: SLEEPING
Tulog pa po si Boss Allan sa oras na ito. Maaari po kayong mag-iwan ng message at ipapaabot ko ito sa kanya kapag available na siya.`;

const BUSY_STATUS_REPLY = `Status: BUSY
Busy pa po si Boss Allan sa oras na ito. Maaari po kayong mag-iwan ng message at ipapaabot ko ito sa kanya.`;

const AVAILABLE_STATUS_REPLY = `Status: AVAILABLE
Available po si Boss Allan sa oras na ito. Maaari po ninyong iwan ang inyong message.`;

const URGENT_PHRASES = [
  "urgent",
  "emergency",
  "importante",
  "asap",
  "kailangan agad",
  "nagmamadali",
];

const BUSINESS_PHRASES = [
  "magkano website",
  "website price",
  "gumagawa ba kayo ng website",
  "interested ako",
  "need ko website",
  "may sample kayo",
  "website for my business",
  "gumawa ng website",
  "web design",
  "website service",
];

const INQUIRY_QUESTIONS = [
  "Ano po ang pangalan ninyo?",
  "Ano po ang pangalan ng inyong business?",
  "Anong uri po ng business ito?",
  "Ano po ang contact number o preferred contact method ninyo?",
  "Anong klaseng website po ang gusto ninyo?",
  "Anong mahahalagang pages o features po ang kailangan ninyo?",
  "Kung komportable po kayong ibahagi, ano ang approximate budget ninyo? Maaari rin po ninyong sabihing “skip.”",
];

const INQUIRY_LABELS = [
  "Name",
  "Business",
  "Business type",
  "Contact",
  "Website needed",
  "Requested features",
  "Budget",
];

// Sessions are intentionally temporary: they expire after 30 minutes and are
// never written to logs or permanent storage.
const inquirySessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000;
const MAX_SESSIONS = 1_000;

/** Return the current hour (0-23) in the Philippines. */
export function getManilaHour(date = new Date()) {
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    hour: "numeric",
    hourCycle: "h23",
  }).format(date);
  return Number(hour);
}

/** Sleep Mode runs from 11 PM through 6:59 AM, Manila time. */
export function isSleepMode(date = new Date()) {
  const hour = getManilaHour(date);
  return hour >= 23 || hour < 7;
}

export function isUrgent(text) {
  const normalized = text.toLocaleLowerCase("en-US");
  return URGENT_PHRASES.some((phrase) => normalized.includes(phrase));
}

export function isBusinessInquiry(text) {
  const normalized = text.toLocaleLowerCase("en-US");
  return BUSINESS_PHRASES.some((phrase) => normalized.includes(phrase));
}

function asksAboutPayment(text) {
  return /(where|saan|paano|how).{0,30}(pay|payment|bayad)|(?:send|padala).{0,20}(payment|bayad)/i.test(
    text,
  );
}

function containsSensitiveInformation(text) {
  const mentionsSecret =
    /\b(otp|one[- ]time pin|password|passcode|cvv|cvc|seed phrase|recovery phrase|banking credentials?)\b/i.test(
      text,
    );
  // Card numbers are normally 13–19 digits, allowing spaces and dashes.
  const possibleCardNumber = /(?:\d[ -]?){13,19}/.test(text);
  return mentionsSecret || possibleCardNumber;
}

/**
 * Read a Telegram command from the beginning of a message. Telegram adds the
 * bot name in group chats (for example, /status@AvaBossAllanbot), so the
 * optional @name is deliberately ignored. Commands are also case-insensitive.
 */
export function getCommand(text) {
  const match = text.match(/^\s*\/(start|help|status|services|portfolio)(?:@[a-z0-9_]+)?(?=\s|$)/i);
  return match ? match[1].toLowerCase() : null;
}

/** Build the /status response with the same Sleep and Busy Mode rules as AVA. */
export function chooseStatusReply(env, now = new Date()) {
  if (isSleepMode(now)) return SLEEPING_STATUS_REPLY;
  if (String(env.BUSY_MODE).toLowerCase() === "true") {
    return BUSY_STATUS_REPLY;
  }
  return AVAILABLE_STATUS_REPLY;
}

/**
 * Busy Mode is deliberately reusable. Set BUSY_MODE=true in Worker variables
 * whenever Boss Allan should be treated as unavailable outside sleeping hours.
 */
export function chooseReply(text, env, now = new Date()) {
  // Handle known commands first so words in command arguments cannot
  // accidentally trigger the urgent-message reply.
  const command = getCommand(text);
  if (command === "start") return START_REPLY;
  if (command === "help") return HELP_REPLY;
  if (command === "status") return chooseStatusReply(env, now);
  if (command === "services") return SERVICES_REPLY;
  if (command === "portfolio") return PORTFOLIO_REPLY;

  if (asksAboutPayment(text)) return PAYMENT_REPLY;
  if (containsSensitiveInformation(text)) return SENSITIVE_REPLY;
  if (isUrgent(text)) return URGENT_REPLY;
  if (isBusinessInquiry(text)) {
    return `${BUSINESS_INTRO}\n\n${INQUIRY_QUESTIONS[0]}`;
  }

  if (isSleepMode(now)) return SLEEP_REPLY;
  if (String(env.BUSY_MODE).toLowerCase() === "true") return BUSY_REPLY;
  return AVAILABLE_REPLY;
}

function inquirySummary(answers) {
  const details = INQUIRY_LABELS.map(
    (label, index) => `${label}: ${answers[index]}`,
  ).join("\n");
  return `Salamat po! Ito ang details na nakuha ko:\n\n${details}\n\nIpapaabot ko po ito kay Boss Allan para ma-review niya. Maraming salamat po sa interest ninyo sa NextPage Digital.`;
}

/** Select a reply and advance this chat's temporary business inquiry session. */
export function handleMessage(text, chatId, env, now = new Date()) {
  const command = getCommand(text);
  // Commands remain available during an inquiry and do not consume an answer.
  if (command) return chooseReply(text, env, now);
  if (asksAboutPayment(text)) return PAYMENT_REPLY;

  const session = inquirySessions.get(String(chatId));
  if (session && now.getTime() - session.updatedAt > SESSION_TTL_MS) {
    inquirySessions.delete(String(chatId));
  }
  const activeSession = inquirySessions.get(String(chatId));

  if (containsSensitiveInformation(text)) {
    const reminder = activeSession
      ? `\n\n${INQUIRY_QUESTIONS[activeSession.answers.length]}`
      : "";
    return `${SENSITIVE_REPLY}${reminder}`;
  }

  if (!activeSession && isUrgent(text)) return chooseReply(text, env, now);

  if (activeSession) {
    const answer = text.trim();
    if (!answer) return INQUIRY_QUESTIONS[activeSession.answers.length];
    activeSession.answers.push(answer);
    activeSession.updatedAt = now.getTime();
    if (activeSession.answers.length === INQUIRY_QUESTIONS.length) {
      inquirySessions.delete(String(chatId));
      return inquirySummary(activeSession.answers);
    }
    return INQUIRY_QUESTIONS[activeSession.answers.length];
  }

  if (isBusinessInquiry(text)) {
    // Keep the in-memory collection bounded if an isolate receives many chats.
    if (inquirySessions.size >= MAX_SESSIONS) {
      const oldestChatId = inquirySessions.keys().next().value;
      inquirySessions.delete(oldestChatId);
    }
    inquirySessions.set(String(chatId), { answers: [], updatedAt: now.getTime() });
    return `${BUSINESS_INTRO}\n\n${INQUIRY_QUESTIONS[0]}`;
  }
  return chooseReply(text, env, now);
}

/** Test helper; production sessions expire naturally. */
export function clearInquirySessions() {
  inquirySessions.clear();
}

// Compare without returning as soon as one character differs. This reduces
// timing information leaked when checking the webhook verification secret.
function secretsMatch(received = "", expected = "") {
  const encoder = new TextEncoder();
  const left = encoder.encode(received);
  const right = encoder.encode(expected);
  let difference = left.length ^ right.length;
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    difference |= (left[index] ?? 0) ^ (right[index] ?? 0);
  }
  return difference === 0;
}

async function sendTelegramMessage(token, chatId, text) {
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text }),
    },
  );

  if (!response.ok) {
    // Do not log the token or the response body, which could contain user data.
    console.error(`Telegram API request failed with status ${response.status}`);
    throw new Error("Telegram API request failed");
  }
}

async function callTelegramApi(token, method, body) {
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(token)}/${method}`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    console.error(`Telegram API request failed with status ${response.status}`);
    throw new Error("Telegram API request failed");
  }

  const result = await response.json();
  if (result?.ok !== true) {
    // Telegram descriptions are deliberately not logged or returned. Keeping
    // errors generic ensures credentials cannot leak through an API response.
    console.error("Telegram API rejected the request");
    throw new Error("Telegram API rejected the request");
  }
  return result.result;
}

function configurationError(env) {
  if (env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_WEBHOOK_SECRET) return null;
  console.error("Required Worker secrets are not configured");
  return new Response("Server configuration error", { status: 500 });
}

async function setupWebhook(url, env) {
  const error = configurationError(env);
  if (error) return error;

  try {
    await callTelegramApi(env.TELEGRAM_BOT_TOKEN, "setWebhook", {
      url: `${url.origin}/telegram/webhook`,
      secret_token: env.TELEGRAM_WEBHOOK_SECRET,
    });
    return new Response("AVA Telegram webhook connected successfully.");
  } catch {
    return new Response("Unable to connect Telegram webhook", { status: 502 });
  }
}

async function webhookInfo(env) {
  const error = configurationError(env);
  if (error) return error;

  try {
    const info = await callTelegramApi(
      env.TELEGRAM_BOT_TOKEN,
      "getWebhookInfo",
      {},
    );
    // Only return an explicit allowlist of non-secret status fields rather than
    // forwarding Telegram's response wholesale.
    return Response.json({
      connected: typeof info?.url === "string" && info.url.length > 0,
      url: info?.url ?? "",
      pending_update_count: info?.pending_update_count ?? 0,
      last_error_date: info?.last_error_date ?? null,
      last_error_message: info?.last_error_message ?? null,
    });
  } catch {
    return new Response("Unable to check Telegram webhook", { status: 502 });
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("AVA Telegram backend is online");
    }

    if (url.pathname === "/telegram/setup") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
      return setupWebhook(url, env);
    }

    if (url.pathname === "/telegram/webhook-info") {
      if (request.method !== "GET") {
        return new Response("Method not allowed", {
          status: 405,
          headers: { Allow: "GET" },
        });
      }
      return webhookInfo(env);
    }

    if (url.pathname !== "/telegram/webhook") {
      return new Response("Not found", { status: 404 });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", {
        status: 405,
        headers: { Allow: "POST" },
      });
    }
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_WEBHOOK_SECRET) {
      console.error("Required Worker secrets are not configured");
      return new Response("Server configuration error", { status: 500 });
    }

    const receivedSecret = request.headers.get(
      "X-Telegram-Bot-Api-Secret-Token",
    );
    if (!secretsMatch(receivedSecret ?? "", env.TELEGRAM_WEBHOOK_SECRET)) {
      return new Response("Unauthorized", { status: 401 });
    }

    let update;
    try {
      update = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const message = update?.message;
    if (typeof message?.text !== "string" || message?.chat?.id == null) {
      // Telegram also sends stickers, photos, and other update types. Acknowledge
      // those safely without trying to reply as though they were text.
      return new Response("OK");
    }

    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      handleMessage(message.text, message.chat.id, env),
    );
    return new Response("OK");
  },
};
