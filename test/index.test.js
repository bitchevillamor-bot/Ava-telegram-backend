import test from "node:test";
import assert from "node:assert/strict";
import {
  clearInquirySessions,
  chooseReply,
  chooseStatusReply,
  getCommand,
  handleMessage,
  isBusinessInquiry,
  isSleepMode,
  isUrgent,
} from "../src/index.js";

test("detects urgent phrases without regard to case", () => {
  assert.equal(isUrgent("KAILANGAN AGAD ang sagot"), true);
  assert.equal(isUrgent("Hello po"), false);
});

test("uses Manila sleeping hours", () => {
  assert.equal(isSleepMode(new Date("2026-01-01T15:00:00Z")), true); // 11 PM
  assert.equal(isSleepMode(new Date("2026-01-01T22:59:00Z")), true); // 6:59 AM
  assert.equal(isSleepMode(new Date("2026-01-01T23:00:00Z")), false); // 7 AM
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
    "May sample kayo?",
    "Interested ako sa web design",
  ]) {
    assert.equal(isBusinessInquiry(phrase), true, phrase);
  }
  assert.equal(isBusinessInquiry("Hello po"), false);
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

  assert.match(chooseStatusReply({ BUSY_MODE: "true" }, sleeping), /^Status: SLEEPING/);
  assert.match(chooseReply("/status", { BUSY_MODE: "TRUE" }, daytime), /^Status: BUSY/);
  assert.match(chooseReply("/status", {}, daytime), /^Status: AVAILABLE/);
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
