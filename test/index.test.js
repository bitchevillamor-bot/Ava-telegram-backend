import test from "node:test";
import assert from "node:assert/strict";
import { chooseReply, isSleepMode, isUrgent } from "../src/index.js";

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
  assert.match(chooseReply("Hello", { BUSY_MODE: "true" }, daytime), /Busy/);
  assert.match(chooseReply("Hello", {}, daytime), /Natanggap/);
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
