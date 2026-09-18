const SLEEP_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Tulog pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya. Salamat po.";

const BUSY_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Busy pa po ang boss ko sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya.";

const URGENT_REPLY =
  "Nagmamadali po ba kayo? Importante po ba ito at hindi maaaring hintayin hanggang matapos ang pagpapahinga o ginagawa ni Boss Allan? Si AVA ito, assistant niya. Maaari po ninyong iwan ang kumpletong message at ipapaabot ko ito sa kanya.";

const AVAILABLE_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Salamat po sa inyong message. Natanggap ko na po ito at ipapaabot ko kay Boss Allan.";

const URGENT_PHRASES = [
  "urgent",
  "emergency",
  "importante",
  "asap",
  "kailangan agad",
  "nagmamadali",
];

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

/**
 * Busy Mode is deliberately reusable. Set BUSY_MODE=true in Worker variables
 * whenever Boss Allan should be treated as unavailable outside sleeping hours.
 */
export function chooseReply(text, env, now = new Date()) {
  if (isUrgent(text)) return URGENT_REPLY;
  if (isSleepMode(now)) return SLEEP_REPLY;
  if (String(env.BUSY_MODE).toLowerCase() === "true") return BUSY_REPLY;
  return AVAILABLE_REPLY;
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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/" && request.method === "GET") {
      return new Response("AVA Telegram backend is online");
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
      chooseReply(message.text, env),
    );
    return new Response("OK");
  },
};
