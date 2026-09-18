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
