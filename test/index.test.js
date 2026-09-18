import test from "node:test";
import assert from "node:assert/strict";
import {
  clearInquirySessions,
  chooseReply,
  chooseBusinessReply,
  chooseAzzyVoiceReply,
  chooseStatusReply,
  getCommand,
  handleMessage,
  isBusinessInquiry,
  isAzzy,
  isSleepMode,
  isUrgent,
} from "../src/index.js";

function businessWebhookRequest(update) {
  return new Request("https://ava.example/telegram/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "secret",
    },
    body: JSON.stringify(update),
  });
}

function voiceWebhookRequest(username = "twoseventwothree") {
  return new Request("https://ava.example/telegram/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "X-Telegram-Bot-Api-Secret-Token": "secret",
    },
    body: JSON.stringify({
      message: {
        chat: { id: 2723 },
        from: { id: 99, username },
        voice: { file_id: "voice-file" },
      },
    }),
  });
}

test("detects urgent phrases without regard to case", () => {
  assert.equal(isUrgent("KAILANGAN AGAD ang sagot"), true);
  assert.equal(isUrgent("Hello po"), false);
});

test("uses Manila sleeping hours", () => {
  assert.equal(isSleepMode(new Date("2026-01-01T15:00:00Z")), true); // 11 PM
  assert.equal(isSleepMode(new Date("2026-01-01T22:59:00Z")), true); // 6:59 AM
  assert.equal(isSleepMode(new Date("2026-01-01T23:00:00Z")), false); // 7 AM
});

test("business replies use exact sleep and busy messages and stay silent when available", () => {
  const sleeping = new Date("2026-01-01T15:00:00Z");
  const daytime = new Date("2026-01-01T04:00:00Z");
  assert.equal(
    chooseBusinessReply("Hello", {}, sleeping),
    "Hi 😊 Si AVA ito, assistant ni Boss Allan. Tulog pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag gising at available na siya. Salamat po.",
  );
  assert.equal(
    chooseBusinessReply("Hello", { BUSY_MODE: "true" }, daytime),
    "Hi 😊 Si AVA ito, assistant ni Boss Allan. Busy pa po siya sa oras na ito. Maaari po ninyong iwan ang inyong message at ipapaabot ko ito sa kanya kapag available na siya.",
  );
  assert.equal(chooseBusinessReply("Hello", {}, daytime), null);
  assert.match(chooseBusinessReply("urgent po", {}, daytime), /Nagmamadali/);
  assert.match(chooseBusinessReply("Need ko website", {}, daytime), /NextPage Digital/);
});

test("business messages reply on behalf of the connection and are deduplicated", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(options.body) });
    return Response.json({ ok: true, result: {} });
  });
  const worker = (await import("../src/index.js")).default;
  const env = {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    BUSY_MODE: "true",
    BOSS_ALLAN_TELEGRAM_USER_ID: "100",
  };
  const update = {
    update_id: 5001,
    business_message: {
      message_id: 44,
      business_connection_id: "connection-1",
      chat: { id: 200 },
      from: { id: 300, is_bot: false },
      text: "Hello",
    },
  };

  assert.equal((await worker.fetch(businessWebhookRequest(update), env)).status, 200);
  assert.equal((await worker.fetch(businessWebhookRequest(update), env)).status, 200);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].body.chat_id, 200);
  assert.equal(calls[0].body.business_connection_id, "connection-1");
  assert.match(calls[0].body.text, /Busy pa po siya/);
});

test("business updates never reply to Allan, bots, edits, or deletions", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (...args) => {
    calls.push(args);
    return Response.json({ ok: true, result: {} });
  });
  const worker = (await import("../src/index.js")).default;
  const env = {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    BUSY_MODE: "true",
    BOSS_ALLAN_TELEGRAM_USER_ID: "100",
  };
  const base = {
    message_id: 1,
    business_connection_id: "connection-2",
    chat: { id: 200 },
    text: "Hello",
  };
  await worker.fetch(businessWebhookRequest({ update_id: 5101, business_message: { ...base, from: { id: 100 } } }), env);
  await worker.fetch(businessWebhookRequest({ update_id: 5102, business_message: { ...base, message_id: 2, from: { id: 400, is_bot: true } } }), env);
  await worker.fetch(businessWebhookRequest({ update_id: 5103, edited_business_message: base }), env);
  await worker.fetch(businessWebhookRequest({ update_id: 5104, deleted_business_messages: { business_connection_id: "connection-2", chat: { id: 200 }, message_ids: [1] } }), env);
  assert.equal(calls.length, 0);
});

test("urgent messages take priority and Busy Mode is reusable", () => {
  const daytime = new Date("2026-01-01T04:00:00Z"); // noon in Manila
  assert.match(chooseReply("emergency", { BUSY_MODE: "true" }, daytime), /Nagmamadali/);
  assert.match(chooseReply("urgent, need ko website", {}, daytime), /Nagmamadali/);
  assert.match(chooseReply("Hello", { BUSY_MODE: "true" }, daytime), /Busy/);
  assert.match(chooseReply("Hello", {}, daytime), /Natanggap/);
});

test("recognizes commands regardless of case and ignores bot suffixes", () => {
  assert.equal(getCommand("/START"), "start");
  assert.equal(getCommand("/Help@AvaBossAllanbot"), "help");
  assert.equal(getCommand(" /STATUS@avabossallanbot "), "status");
  assert.equal(getCommand("/Services"), "services");
  assert.equal(getCommand("/portfolio@AvaBossAllanbot"), "portfolio");
  assert.equal(getCommand("/status-report"), null);
});

test("returns the requested start and help messages", () => {
  const daytime = new Date("2026-01-01T04:00:00Z");
  assert.equal(
    chooseReply("/start@AvaBossAllanbot", {}, daytime),
    "Hi, si AVA ito, assistant ni Boss Allan. Maaari po kayong mag-iwan ng message dito at ipapaabot ko ito sa kanya. Kung gusto ninyong malaman ang status niya, gamitin ang /status.",
  );
  assert.match(chooseReply("/HELP", {}, daytime), /^AVA can help with:/);
  assert.match(chooseReply("/HELP", {}, daytime), /\/status - Check Boss Allan’s availability/);
});

test("help, services, and portfolio describe NextPage Digital", () => {
  const daytime = new Date("2026-01-01T04:00:00Z");
  assert.match(chooseReply("/help", {}, daytime), /\/services - View website services and pricing/);
  assert.match(chooseReply("/help", {}, daytime), /\/portfolio - View sample websites/);
  assert.match(chooseReply("/services", {}, daytime), /Starter Website — starts at ₱999/);
  assert.match(chooseReply("/services", {}, daytime), /Hindi po ako tumatanggap ng payment/);
  assert.match(chooseReply("/portfolio", {}, daytime), /Nextpage-Digital/);
  assert.match(chooseReply("/portfolio", {}, daytime), /Tuboy-s-Lopez-demo/);
});

test("recognizes common business inquiry phrases", () => {
  for (const phrase of [
    "Magkano website?",
    "Gumagawa ba kayo ng website",
    "Need ko website for my business",
    "May sample website kayo?",
    "Interested ako sa web design",
    "web design",
    "website service",
  ]) {
    assert.equal(isBusinessInquiry(phrase), true, phrase);
  }
  assert.equal(isBusinessInquiry("Hello po"), false);
  assert.equal(isBusinessInquiry("May sample kayo?"), false);
  assert.equal(isBusinessInquiry("I need help po"), false);
  assert.equal(isBusinessInquiry("This site is down"), false);
  assert.equal(isBusinessInquiry("website"), false);
});

test("starts Business Inquiry Mode for natural Filipino and English requests", () => {
  clearInquirySessions();
  const daytime = new Date("2026-01-01T04:00:00Z");
  const messages = [
    "Magkano po website?",
    "Magkano ang website?",
    "Pwede po magpagawa ng website?",
    "Need ko po website para sa business ko",
    "May sample website po kayo?",
    "How much is a website?",
  ];

  messages.forEach((message, index) => {
    const reply = handleMessage(message, `natural-inquiry-${index}`, {}, daytime);
    assert.match(reply, /Ano po ang pangalan ninyo\?$/, message);
  });
});

test("collects an inquiry one answer at a time and returns a summary", () => {
  clearInquirySessions();
  const now = new Date("2026-01-01T04:00:00Z");
  const chatId = 123;
  const first = handleMessage("Magkano website?", chatId, {}, now);
  assert.match(first, /Si AVA ito, assistant ni Boss Allan/);
  assert.match(first, /Ano po ang pangalan ninyo\?$/);
  assert.doesNotMatch(first, /pangalan ng inyong business\?/);

  assert.match(handleMessage("Maria", chatId, {}, now), /pangalan ng inyong business/);
  assert.match(handleMessage("Maria's Café", chatId, {}, now), /Anong uri/);
  assert.match(handleMessage("Café", chatId, {}, now), /contact number/);
  assert.match(handleMessage("Telegram", chatId, {}, now), /klaseng website/);
  assert.match(handleMessage("Business website", chatId, {}, now), /pages o features/);
  assert.match(handleMessage("Menu and contact page", chatId, {}, now), /approximate budget/);

  const summary = handleMessage("₱2,000", chatId, {}, now);
  assert.match(summary, /Name: Maria/);
  assert.match(summary, /Business: Maria's Café/);
  assert.match(summary, /Requested features: Menu and contact page/);
  assert.match(summary, /Budget: ₱2,000/);
  assert.match(summary, /Ipapaabot ko po ito kay Boss Allan/);
});

test("does not collect sensitive details or provide payment destinations", () => {
  clearInquirySessions();
  const now = new Date("2026-01-01T04:00:00Z");
  assert.match(
    handleMessage("Saan ko isesend ang payment?", 200, {}, now),
    /Boss Allan po ang personal na magko-confirm/,
  );

  handleMessage("Need ko website", 201, {}, now);
  const warning = handleMessage("My password is secret", 201, {}, now);
  assert.match(warning, /huwag po kayong magpadala ng OTP/);
  assert.match(warning, /Ano po ang pangalan ninyo\?$/);
  assert.match(handleMessage("Juan", 201, {}, now), /pangalan ng inyong business/);
});

test("status follows Manila Sleep Mode before Busy Mode", () => {
  const sleeping = new Date("2026-01-01T15:00:00Z"); // 11 PM in Manila
  const daytime = new Date("2026-01-01T04:00:00Z"); // noon in Manila

  assert.match(chooseStatusReply({ AVA_MODE: "AUTO" }, sleeping), /^Mode: AUTO\nStatus: SLEEPING/);
  assert.match(chooseReply("/status", { AVA_MODE: "BUSY" }, daytime), /^Mode: BUSY\nStatus: BUSY/);
  assert.match(chooseReply("/status", { AVA_MODE: "ONLINE" }, daytime), /^Mode: ONLINE\nStatus: AVAILABLE/);
});

test("recognizes Azzy by username or configured Telegram user ID", () => {
  assert.equal(isAzzy({ id: 1, username: "TwoSevenTwoThree" }, {}), true);
  assert.equal(isAzzy({ id: 2723 }, { AZZY_TELEGRAM_USER_ID: "2723" }), true);
  assert.equal(isAzzy({ id: 2, username: "someone_else" }, {}), false);
});

test("Azzy voice replies preserve urgent, sleeping, and busy priority", () => {
  const daytime = new Date("2026-01-01T04:00:00Z");
  const sleeping = new Date("2026-01-01T15:00:00Z");
  assert.match(chooseAzzyVoiceReply("urgent po", {}, sleeping), /urgent o importante/);
  assert.match(chooseAzzyVoiceReply("hello", {}, sleeping), /Tulog pa si Tatay/);
  assert.match(chooseAzzyVoiceReply("hello", { BUSY_MODE: "true" }, daytime), /Busy pa si Tatay/);
  assert.match(chooseAzzyVoiceReply("hello", {}, daytime), /Available si Tatay/);
});

test("Azzy voice note is transcribed, notified, and answered with voice", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/getFile")) {
      return Response.json({ ok: true, result: { file_path: "voice/file.oga" } });
    }
    if (String(url).includes("/file/bot")) {
      return new Response(new Uint8Array([1, 2, 3]), {
        headers: { "content-type": "audio/ogg" },
      });
    }
    if (String(url).endsWith("/audio/transcriptions")) {
      assert.equal(options.headers.Authorization, "Bearer openai-secret");
      assert.equal(options.body.get("model"), "gpt-4o-mini-transcribe");
      return Response.json({ text: "Importante po ito" });
    }
    if (String(url).endsWith("/audio/speech")) {
      const body = JSON.parse(options.body);
      assert.equal(body.voice, "coral");
      assert.equal(body.response_format, "opus");
      assert.match(body.input, /urgent o importante/);
      return new Response(new Uint8Array([4, 5]), {
        headers: { "content-type": "audio/ogg" },
      });
    }
    return Response.json({ ok: true, result: {} });
  });

  const worker = (await import("../src/index.js")).default;
  const response = await worker.fetch(voiceWebhookRequest(), {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    OPENAI_API_KEY: "openai-secret",
    BOSS_ALLAN_CHAT_ID: "allan-chat",
  });

  assert.equal(response.status, 200);
  assert.equal(calls.filter(({ url }) => url.endsWith("/sendVoice")).length, 1);
  const notification = calls.find(({ url, options }) =>
    url.endsWith("/sendMessage") && JSON.parse(options.body).chat_id === "allan-chat"
  );
  assert.equal(JSON.parse(notification.options.body).text, "💜 Voice message from Azzy:\nImportante po ito");
});

test("transcription failure sends Azzy a warm text fallback", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/getFile")) {
      return Response.json({ ok: true, result: { file_path: "voice/file.oga" } });
    }
    if (String(url).includes("/file/bot")) return new Response("audio");
    if (String(url).endsWith("/audio/transcriptions")) return new Response("", { status: 502 });
    return Response.json({ ok: true, result: {} });
  });

  const worker = (await import("../src/index.js")).default;
  await worker.fetch(voiceWebhookRequest(), {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    OPENAI_API_KEY: "openai-secret",
  });
  const fallback = calls.find(({ url }) => url.endsWith("/sendMessage"));
  assert.match(JSON.parse(fallback.options.body).text, /Paki-send ulit/);
  assert.equal(calls.some(({ url }) => url.endsWith("/sendVoice")), false);
});

test("speech generation failure sends the selected reply as text", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options = {}) => {
    calls.push({ url: String(url), options });
    if (String(url).endsWith("/getFile")) {
      return Response.json({ ok: true, result: { file_path: "voice/file.oga" } });
    }
    if (String(url).includes("/file/bot")) return new Response("audio");
    if (String(url).endsWith("/audio/transcriptions")) {
      return Response.json({ text: "Hello po" });
    }
    if (String(url).endsWith("/audio/speech")) {
      return new Response("", { status: 503 });
    }
    return Response.json({ ok: true, result: {} });
  });

  const worker = (await import("../src/index.js")).default;
  await worker.fetch(voiceWebhookRequest(), {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    OPENAI_API_KEY: "openai-secret",
  });
  const fallback = calls.find(({ url }) => url.endsWith("/sendMessage"));
  assert.match(JSON.parse(fallback.options.body).text, /Si AVA ito/);
  assert.equal(calls.some(({ url }) => url.endsWith("/sendVoice")), false);
});

test("setup registers the current Worker webhook without exposing secrets", async (t) => {
  const calls = [];
  t.mock.method(globalThis, "fetch", async (url, options) => {
    calls.push({ url, options });
    return Response.json({ ok: true, result: true });
  });

  const worker = (await import("../src/index.js")).default;
  const response = await worker.fetch(
    new Request("https://ava.example/telegram/setup"),
    { TELEGRAM_BOT_TOKEN: "bot-token", TELEGRAM_WEBHOOK_SECRET: "secret" },
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "AVA Telegram webhook connected successfully.");
  assert.equal(calls.length, 1);
  assert.match(calls[0].url, /\/setWebhook$/);
  assert.deepEqual(JSON.parse(calls[0].options.body), {
    url: "https://ava.example/telegram/webhook",
    secret_token: "secret",
    allowed_updates: [
      "message",
      "business_connection",
      "business_message",
      "edited_business_message",
      "deleted_business_messages",
    ],
  });
});

test("webhook info returns only safe status fields", async (t) => {
  t.mock.method(globalThis, "fetch", async () =>
    Response.json({
      ok: true,
      result: {
        url: "https://ava.example/telegram/webhook",
        pending_update_count: 2,
        has_custom_certificate: false,
        secret_token: "must-not-leak",
      },
    }),
  );

  const worker = (await import("../src/index.js")).default;
  const response = await worker.fetch(
    new Request("https://ava.example/telegram/webhook-info"),
    { TELEGRAM_BOT_TOKEN: "bot-token", TELEGRAM_WEBHOOK_SECRET: "secret" },
  );
  const body = await response.json();

  assert.deepEqual(body, {
    connected: true,
    url: "https://ava.example/telegram/webhook",
    pending_update_count: 2,
    last_error_date: null,
    last_error_message: null,
  });
  assert.doesNotMatch(JSON.stringify(body), /bot-token|secret|must-not-leak/);
});

test("owner commands persist modes in AVA_STATE and /myid works for anyone", async (t) => {
  const sent = [];
  const state = new Map();
  t.mock.method(globalThis, "fetch", async (url, options) => {
    sent.push(JSON.parse(options.body));
    return Response.json({ ok: true, result: {} });
  });
  const worker = (await import("../src/index.js")).default;
  const env = {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    BOSS_ALLAN_TELEGRAM_USER_ID: "100",
    AVA_STATE: {
      get: async (key) => state.get(key),
      put: async (key, value) => state.set(key, value),
    },
  };
  const request = (updateId, fromId, text) => businessWebhookRequest({
    update_id: updateId,
    message: { chat: { id: fromId, type: "private" }, from: { id: fromId }, text },
  });

  await worker.fetch(request(9001, 200, "/myid"), env);
  assert.equal(sent.at(-1).text, "200");
  await worker.fetch(request(9002, 200, "/busy"), env);
  assert.equal(sent.at(-1).text, "This command is only available to Boss Allan.");
  assert.equal(state.has("mode"), false);

  await worker.fetch(request(9003, 100, "/busy"), env);
  assert.equal(state.get("mode"), "BUSY");
  assert.equal(sent.at(-1).text, "🤖 AVA is now in BUSY mode. I will automatically answer incoming private messages for Boss Allan.");
  await worker.fetch(request(9004, 100, "/online"), env);
  assert.equal(state.get("mode"), "ONLINE");
  await worker.fetch(request(9005, 100, "/auto"), env);
  assert.equal(state.get("mode"), "AUTO");
});

test("stored modes control business auto-replies and status", async (t) => {
  const sent = [];
  let mode = "ONLINE";
  t.mock.method(globalThis, "fetch", async (url, options) => {
    sent.push(JSON.parse(options.body));
    return Response.json({ ok: true, result: {} });
  });
  const worker = (await import("../src/index.js")).default;
  const env = {
    TELEGRAM_BOT_TOKEN: "bot-token",
    TELEGRAM_WEBHOOK_SECRET: "secret",
    BOSS_ALLAN_TELEGRAM_USER_ID: "100",
    AVA_STATE: { get: async () => mode, put: async () => {} },
  };
  const businessUpdate = (id) => businessWebhookRequest({
    update_id: id,
    business_message: {
      message_id: id,
      business_connection_id: "mode-test",
      chat: { id: 300, type: "private" },
      from: { id: 300 },
      text: "Hello",
    },
  });

  await worker.fetch(businessUpdate(9101), env);
  assert.equal(sent.length, 0);
  mode = "BUSY";
  await worker.fetch(businessUpdate(9102), env);
  assert.match(sent.at(-1).text, /Busy pa po siya/);
  await worker.fetch(businessWebhookRequest({
    update_id: 9103,
    message: { chat: { id: 100 }, from: { id: 100 }, text: "/status" },
  }), env);
  assert.match(sent.at(-1).text, /^Mode: BUSY\nStatus: BUSY/);
});
