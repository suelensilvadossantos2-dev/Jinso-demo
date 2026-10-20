import assert from "node:assert/strict";
import test from "node:test";
import { evaluateStudent, mockReply } from "../lib/mock-ai.ts";

test("student evaluation only credits learner evidence", () => {
  const result = evaluateStudent("Based on your needs, I would recommend the lighter model, which has better battery life.", 2);
  assert.deepEqual(result.vocabulary.sort(), ["based on your needs", "i would recommend"].sort());
  assert.ok(result.grammar.includes("Comparatives and superlatives"));
  assert.ok(result.grammar.includes("Relative clauses"));
  assert.ok(result.milestones.includes(3));
});

test("teacher mock answers remain grounded in the fictional learner profile", () => {
  const reply = mockReply("teacher", "Why should I check on Lucia?");
  assert.equal(reply.learnerRef, "lucia");
  assert.match(reply.content, /nine days/i);
  assert.match(reply.content, /45%/);
});

test("general advisor avoids inventing missing product claims", () => {
  const reply = mockReply("general", "What can Jinso do for a teacher?");
  assert.match(reply.content, /class-level patterns/i);
  assert.doesNotMatch(reply.content, /guarantee|certif/i);

  const pricing = mockReply("general", "What is Jinso's price?");
  assert.match(pricing.content, /isn’t confirmed in this demo/i);
  assert.match(pricing.content, /speak with the Jinso team/i);
});
