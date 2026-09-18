const SLEEP_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Tulog pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya. Salamat po.";

const BUSY_REPLY =
  "Hi, si AVA ito, assistant ni Boss Allan. Busy pa po ang boss ko sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya.";

const BUSINESS_SLEEP_REPLY =
  "Hi 😊 Si AVA ito, assistant ni Boss Allan. Tulog pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag gising at available na siya. Salamat po.";

const BUSINESS_BUSY_REPLY =
  "Hi 😊 Si AVA ito, assistant ni Boss Allan. Busy pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya.";

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

const MODES = new Set(["ONLINE", "BUSY", "AUTO"]);
const MODE_REPLIES = {
  ONLINE:
    "✅ AVA is now in ONLINE mode. Boss Allan will handle normal messages himself.",
  BUSY:
    "🤖 AVA is now in BUSY mode. I will automatically answer incoming private messages for Boss Allan.",
  AUTO:
    "🕒 AVA is now in AUTO mode. I will automatically answer during Sleep Mode from 11:00 PM to 7:00 AM, and remain quiet during normal available hours.",
};
const OWNER_ONLY_REPLY = "This command is only available to Boss Allan.";

const AZZY_USERNAME = "twoseventwothree";
const VOICE_TRANSCRIPTION_FALLBACK =
  "Hi Azzy. Si AVA ito. Hindi ko po malinaw na naintindihan ang voice note mo. Paki-send ulit kapag maaari, at pakikinggan ko itong mabuti.";
const AZZY_VOICE_REPLIES = {
  available:
    "Hi Azzy. Si AVA ito, assistant ni Tatay Allan. Available si Tatay ngayon. Ipapasa ko sa kanya ang message mo. Sana okay ka palagi.",
  busy:
    "Hi Azzy. Si AVA ito, assistant ni Tatay Allan. Busy pa si Tatay ngayon pero ipapaabot ko agad ang message mo kapag available na siya. Ingat ka palagi ha.",
  sleeping:
    "Hi Azzy. Si AVA ito, assistant ni Tatay Allan. Tulog pa si Tatay ngayon pero iingatan ko ang message mo at ipapaabot ko sa kanya kapag gising na siya. Ingat ka palagi ha.",
  urgent:
    "Azzy, nabasa at narinig ko ang message mo. Si AVA ito. Kung urgent o importante ito, ipapaabot ko agad kay Tatay Allan.",
};

const URGENT_PHRASES = [
  "urgent",
  "emergency",
  "importante",
  "asap",
  "kailangan agad",
  "nagmamadali",
];

// Business inquiries can be phrased in many natural ways. Look for both a
// website subject and an inquiry intent instead of requiring one exact phrase.
// Keeping these lists separate also prevents generic messages such as "I need
// help" or "May sample kayo?" from starting the inquiry questionnaire.
const WEBSITE_KEYWORD_PATTERN =
  /\b(?:websites?|web[ -]?pages?|web[ -]?design|sites?)\b/i;
const BUSINESS_INTENT_PATTERN =
  /\b(?:magkano|presyo|prices?|pricing|costs?|how\s+much|interested|interest|(?:mag)?pagawa|gumawa|gumagawa|need(?:ed|ing)?|kailangan|samples?|examples?|portfolio|services?|gusto|want(?:ed)?|looking\s+for|for\s+(?:my|our)\s+business)\b/i;
const WEB_DESIGN_PATTERN = /\bweb[ -]?design\b/i;

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

// These caches stop Telegram retries (and repeated delivery of the same
// business message under a different update id) from generating extra replies.
// A KV binding makes this durable across Worker isolates; the bounded in-memory
// cache remains useful locally and when KV has not yet been configured.
const processedUpdates = new Map();
const businessConnections = new Map();
const DEDUP_TTL_SECONDS = 24 * 60 * 60;
const MAX_DEDUP_ENTRIES = 10_000;

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
  return (
    WEB_DESIGN_PATTERN.test(text) ||
    (WEBSITE_KEYWORD_PATTERN.test(text) && BUSINESS_INTENT_PATTERN.test(text))
  );
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
  const match = text.match(/^\s*\/(start|help|status|services|portfolio|myid|online|busy|auto)(?:@[a-z0-9_]+)?(?=\s|$)/i);
  return match ? match[1].toLowerCase() : null;
}

/** Resolve the mode already loaded for this request, with a safe AUTO default. */
export function getMode(env) {
  const configured = String(env.AVA_MODE ?? "").toUpperCase();
  if (MODES.has(configured)) return configured;
  // Preserve compatibility while installations migrate from the old variable.
  if (String(env.BUSY_MODE).toLowerCase() === "true") return "BUSY";
  return "AUTO";
}

/** Build /status with both the persisted mode and Allan's effective status. */
export function chooseStatusReply(env, now = new Date()) {
  const mode = getMode(env);
  const status = mode === "BUSY"
    ? BUSY_STATUS_REPLY
    : mode === "AUTO" && isSleepMode(now)
      ? SLEEPING_STATUS_REPLY
      : AVAILABLE_STATUS_REPLY;
  return `Mode: ${mode}\n${status}`;
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

  const mode = getMode(env);
  if (mode === "BUSY") return BUSY_REPLY;
  if (mode === "AUTO" && isSleepMode(now)) return SLEEP_REPLY;
  return AVAILABLE_REPLY;
}

/** Select an automatic reply for a connected-account message, or no reply. */
export function chooseBusinessReply(text, env, now = new Date()) {
  // Safety and special-purpose handling remains active in every mode.
  if (asksAboutPayment(text)) return PAYMENT_REPLY;
  if (containsSensitiveInformation(text)) return SENSITIVE_REPLY;
  if (isUrgent(text)) return URGENT_REPLY;
  if (isBusinessInquiry(text)) return BUSINESS_INTRO;
  const mode = getMode(env);
  if (mode === "BUSY") return BUSINESS_BUSY_REPLY;
  if (mode === "AUTO" && isSleepMode(now)) return BUSINESS_SLEEP_REPLY;
  // ONLINE, and AUTO during available hours, stay quiet for ordinary messages.
  return null;
}

/** Match Azzy by her public username or an optional, more durable user ID. */
export function isAzzy(from, env) {
  const username = String(from?.username ?? "").replace(/^@/, "").toLowerCase();
  const configuredId = String(env.AZZY_TELEGRAM_USER_ID ?? "").trim();
  return (
    username === AZZY_USERNAME ||
    (configuredId !== "" && String(from?.id) === configuredId)
  );
}

/** Apply the same urgent, Sleep Mode, and Busy Mode priority used by AVA. */
export function chooseAzzyVoiceReply(transcription, env, now = new Date()) {
  if (isUrgent(transcription)) return AZZY_VOICE_REPLIES.urgent;
  const mode = getMode(env);
  if (mode === "BUSY") return AZZY_VOICE_REPLIES.busy;
  if (mode === "AUTO" && isSleepMode(now)) return AZZY_VOICE_REPLIES.sleeping;
  return AZZY_VOICE_REPLIES.available;
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

async function sendTelegramMessage(token, chatId, text, businessConnectionId) {
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`,
    {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        ...(businessConnectionId
          ? { business_connection_id: businessConnectionId }
          : {}),
      }),
    },
  );

  if (!response.ok) {
    // Do not log the token or the response body, which could contain user data.
    console.error(`Telegram API request failed with status ${response.status}`);
    throw new Error("Telegram API request failed");
  }
}

async function loadMode(env) {
  if (!env.AVA_STATE) return getMode(env);
  try {
    const stored = String((await env.AVA_STATE.get("mode")) ?? "").toUpperCase();
    return MODES.has(stored) ? stored : "AUTO";
  } catch {
    console.error("AVA mode storage is unavailable");
    return "AUTO";
  }
}

async function envWithMode(env) {
  return { ...env, AVA_MODE: await loadMode(env) };
}

function isBossAllan(userId, env) {
  const ownerId = String(env.BOSS_ALLAN_TELEGRAM_USER_ID ?? "").trim();
  return ownerId !== "" && String(userId) === ownerId;
}

async function handleControlCommand(command, message, env) {
  if (command === "myid") return String(message.from?.id ?? "Unknown");
  if (!isBossAllan(message.from?.id, env)) return OWNER_ONLY_REPLY;

  const mode = command.toUpperCase();
  if (!env.AVA_STATE) {
    console.error("AVA_STATE KV binding is not configured");
    return "AVA mode storage is not configured.";
  }
  try {
    await env.AVA_STATE.put("mode", mode);
    return MODE_REPLIES[mode];
  } catch {
    console.error("Unable to persist AVA mode");
    return "Unable to update AVA mode right now. Please try again.";
  }
}

function rememberLocally(key) {
  if (processedUpdates.size >= MAX_DEDUP_ENTRIES) {
    processedUpdates.delete(processedUpdates.keys().next().value);
  }
  processedUpdates.set(key, Date.now());
}

async function isDuplicateUpdate(update, env) {
  const businessMessage = update?.business_message;
  const key = businessMessage?.business_connection_id && businessMessage?.message_id != null
    ? `business:${businessMessage.business_connection_id}:${businessMessage.chat?.id}:${businessMessage.message_id}`
    : update?.update_id != null
      ? `update:${update.update_id}`
      : null;
  if (!key) return false;
  if (processedUpdates.has(key)) return true;

  if (env.TELEGRAM_UPDATE_DEDUP) {
    try {
      if (await env.TELEGRAM_UPDATE_DEDUP.get(key)) return true;
      // Mark before sending: at-most-once replies are safer than duplicate
      // automated messages if Telegram retries after a downstream failure.
      await env.TELEGRAM_UPDATE_DEDUP.put(key, "1", {
        expirationTtl: DEDUP_TTL_SECONDS,
      });
    } catch {
      console.error("Telegram update deduplication storage is unavailable");
    }
  }
  rememberLocally(key);
  return false;
}

function isFromBossAllan(message, env) {
  const configuredId = String(env.BOSS_ALLAN_TELEGRAM_USER_ID ?? "").trim();
  const connectionOwnerId = businessConnections.get(
    String(message.business_connection_id),
  );
  return (
    (configuredId && String(message.from?.id) === configuredId) ||
    (connectionOwnerId != null && String(message.from?.id) === connectionOwnerId)
  );
}

async function handleBusinessMessage(message, env) {
  // Telegram supplies this field for messages sent by a connected business
  // bot. Ignoring it prevents AVA (or another automation) from creating loops.
  if (
    !message?.business_connection_id ||
    message.chat?.id == null ||
    (message.chat.type && message.chat.type !== "private") ||
    message.sender_business_bot ||
    message.from?.is_bot ||
    isFromBossAllan(message, env)
  ) {
    return;
  }
  if (message.voice?.file_id && isAzzy(message.from, env)) {
    await handleAzzyVoice(message, env, message.business_connection_id);
    return;
  }
  // Captions can carry urgent/business wording; non-text messages still get
  // the scheduled sleep or busy notice, but remain silent when Allan is free.
  const text = typeof message.text === "string"
    ? message.text
    : typeof message.caption === "string"
      ? message.caption
      : "";
  const reply = chooseBusinessReply(text, await envWithMode(env));
  if (!reply) return;
  await sendTelegramMessage(
    env.TELEGRAM_BOT_TOKEN,
    message.chat.id,
    reply,
    message.business_connection_id,
  );
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

async function transcribeTelegramVoice(token, voice, openAiKey) {
  // Telegram's Bot API only supports downloading files up to 20 MB. Reject an
  // oversized declared payload before making any provider requests.
  if (Number(voice.file_size ?? 0) > 20 * 1024 * 1024) {
    throw new Error("Telegram voice file is too large");
  }
  const file = await callTelegramApi(token, "getFile", {
    file_id: voice.file_id,
  });
  // Accept only Telegram's relative file paths. This keeps the download pinned
  // to Telegram even if an unexpected API response is ever received.
  if (
    typeof file?.file_path !== "string" ||
    file.file_path.startsWith("/") ||
    file.file_path.includes("..") ||
    !/^[a-zA-Z0-9_./-]+$/.test(file.file_path)
  ) {
    throw new Error("Telegram returned an invalid voice file path");
  }

  const audioResponse = await fetch(
    `https://api.telegram.org/file/bot${encodeURIComponent(token)}/${file.file_path}`,
  );
  if (!audioResponse.ok) throw new Error("Unable to download Telegram voice file");

  // The Blob exists only for this request and is never written to storage.
  const audio = await audioResponse.blob();
  const form = new FormData();
  form.append("model", "gpt-4o-mini-transcribe");
  form.append("file", audio, "voice.ogg");
  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${openAiKey}` },
    body: form,
  });
  if (!response.ok) throw new Error("OpenAI transcription failed");
  const result = await response.json();
  if (typeof result?.text !== "string" || !result.text.trim()) {
    throw new Error("OpenAI returned an empty transcription");
  }
  return result.text.trim();
}

async function createVoiceReply(text, openAiKey) {
  const response = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openAiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      voice: "coral",
      input: text,
      instructions:
        "Speak as AVA, a warm, gentle, caring female assistant. Sound natural and reassuring. Do not imitate any real person.",
      response_format: "opus",
    }),
  });
  if (!response.ok) throw new Error("OpenAI speech generation failed");
  return response.blob();
}

async function sendTelegramVoice(token, chatId, audio, businessConnectionId) {
  const form = new FormData();
  form.append("chat_id", String(chatId));
  if (businessConnectionId) {
    form.append("business_connection_id", businessConnectionId);
  }
  form.append("voice", audio, "ava-reply.opus");
  const response = await fetch(
    `https://api.telegram.org/bot${encodeURIComponent(token)}/sendVoice`,
    { method: "POST", body: form },
  );
  if (!response.ok) throw new Error("Telegram voice delivery failed");
  const result = await response.json();
  if (result?.ok !== true) throw new Error("Telegram rejected voice delivery");
}

async function handleAzzyVoice(message, env, businessConnectionId) {
  let transcription;
  try {
    if (!env.OPENAI_API_KEY) throw new Error("OpenAI is not configured");
    transcription = await transcribeTelegramVoice(
      env.TELEGRAM_BOT_TOKEN,
      message.voice,
      env.OPENAI_API_KEY,
    );
  } catch {
    // Never log audio, the transcription, or provider response bodies.
    console.error("Azzy voice transcription failed");
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      VOICE_TRANSCRIPTION_FALLBACK,
      businessConnectionId,
    );
    return;
  }

  // A voice note that transcribes to a command is handled locally and is not
  // forwarded. All other transcriptions may be privately notified to Allan.
  if (env.BOSS_ALLAN_CHAT_ID && !getCommand(transcription)) {
    try {
      await sendTelegramMessage(
        env.TELEGRAM_BOT_TOKEN,
        env.BOSS_ALLAN_CHAT_ID,
        `💜 Voice message from Azzy:\n${transcription}`,
      );
    } catch {
      console.error("Unable to notify Boss Allan about Azzy's voice message");
    }
  }

  const reply = chooseAzzyVoiceReply(transcription, await envWithMode(env));
  try {
    const audio = await createVoiceReply(reply, env.OPENAI_API_KEY);
    await sendTelegramVoice(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      audio,
      businessConnectionId,
    );
  } catch {
    console.error("Azzy voice reply generation or delivery failed");
    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      reply,
      businessConnectionId,
    );
  }
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
      allowed_updates: [
        "message",
        "business_connection",
        "business_message",
        "edited_business_message",
        "deleted_business_messages",
      ],
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

    if (await isDuplicateUpdate(update, env)) return new Response("OK");

    if (update?.business_connection?.id) {
      const connection = update.business_connection;
      if (connection.is_enabled === false) {
        businessConnections.delete(String(connection.id));
      } else if (connection.user?.id != null) {
        businessConnections.set(String(connection.id), String(connection.user.id));
      }
      return new Response("OK");
    }

    if (update?.business_message) {
      await handleBusinessMessage(update.business_message, env);
      return new Response("OK");
    }

    // Edits and deletions are deliberately acknowledged without an automatic
    // response. Only a newly delivered business_message may trigger AVA.
    if (update?.edited_business_message || update?.deleted_business_messages) {
      return new Response("OK");
    }

    const message = update?.message;
    if (message?.chat?.id == null) {
      return new Response("OK");
    }

    if (message.voice?.file_id && isAzzy(message.from, env)) {
      await handleAzzyVoice(message, env);
      return new Response("OK");
    }

    if (typeof message.text !== "string") {
      // Telegram also sends stickers, photos, and other update types. Acknowledge
      // those safely without trying to reply as though they were text.
      return new Response("OK");
    }

    const command = getCommand(message.text);
    if (["myid", "online", "busy", "auto"].includes(command)) {
      await sendTelegramMessage(
        env.TELEGRAM_BOT_TOKEN,
        message.chat.id,
        await handleControlCommand(command, message, env),
      );
      return new Response("OK");
    }

    const requestEnv = await envWithMode(env);

    await sendTelegramMessage(
      env.TELEGRAM_BOT_TOKEN,
      message.chat.id,
      handleMessage(message.text, message.chat.id, requestEnv),
    );
    return new Response("OK");
  },
};
