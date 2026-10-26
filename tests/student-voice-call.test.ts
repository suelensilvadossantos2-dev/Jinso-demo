import assert from "node:assert/strict";
import test from "node:test";
import { createMockStudentVoiceCallService, formatCallDuration, studentVoiceIntegration } from "../lib/student-voice-call.ts";

test("mock call lifecycle stays local and explicit", () => {
  const call = createMockStudentVoiceCallService();
  assert.equal(call.getSnapshot().status, "idle");
  assert.equal(call.start().status, "active");
  assert.equal(call.setMuted(true).muted, true);
  assert.equal(call.setSpeakerEnabled(false).speakerEnabled, false);
  assert.equal(call.setActivity("listening").activity, "listening");
  assert.equal(call.end().status, "ended");
  assert.equal(studentVoiceIntegration.enabled, false);
});

test("call timer formats elapsed seconds", () => {
  assert.equal(formatCallDuration(0), "00:00");
  assert.equal(formatCallDuration(26), "00:26");
  assert.equal(formatCallDuration(125.8), "02:05");
  assert.equal(formatCallDuration(-3), "00:00");
});
