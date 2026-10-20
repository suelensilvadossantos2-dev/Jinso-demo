import assert from "node:assert/strict";
import test from "node:test";
import {
  createTravelSession,
  destinationFromText,
  evaluateTravelLanguage,
  personalities,
  replyTravelChallenge,
  type TravelPersonalityId,
} from "../lib/travel-challenge.ts";

const scenarios: Array<{ id: TravelPersonalityId; recommendation: string; surprise: RegExp; adaptation: string }> = [
  { id: "adventure", recommendation: "I would recommend Costa Rica because it is ideal for hiking.", surprise: /don't like long flights/i, adaptation: "If the flight is too long, I could suggest a closer nature destination instead." },
  { id: "food", recommendation: "I suggest Kyoto because the local food and culture are memorable.", surprise: /prefers quiet places/i, adaptation: "It would still work if you stay in a quieter area and visit busy food markets during the day." },
  { id: "relaxation", recommendation: "You could visit the Greek Islands for peaceful surroundings.", surprise: /get bored/i, adaptation: "We can adapt the itinerary with boat trips and cultural activities, while keeping relaxed mornings." },
];

for (const scenario of scenarios) {
  test(`${scenario.id} personality keeps a consistent four-stage flow`, () => {
    let state = createTravelSession(scenario.id);
    const discovery = replyTravelChallenge("What kind of places and activities do you enjoy?", state);
    state = discovery.state;
    assert.ok(state.milestones.includes(1));
    assert.equal(state.surpriseRevealed, false);
    assert.doesNotMatch(discovery.content, scenario.surprise);

    const recommendation = replyTravelChallenge(scenario.recommendation, state);
    state = recommendation.state;
    assert.equal(state.stage, "surprise");
    assert.equal(state.surpriseRevealed, true);
    assert.match(recommendation.content, scenario.surprise);
    assert.ok(state.milestones.includes(2));

    const adaptation = replyTravelChallenge(scenario.adaptation, state);
    state = adaptation.state;
    assert.equal(state.stage, "finalize");
    assert.ok(state.milestones.includes(3));
    assert.doesNotMatch(adaptation.content, scenario.surprise);

    const final = replyTravelChallenge("My final recommendation is the same because it offers the best balance for you.", state);
    assert.equal(final.state.stage, "complete");
    assert.deepEqual(final.state.milestones, [1, 2, 3, 4]);
  });
}

test("unexpected input is handled without giving away the hidden surprise", () => {
  const state = createTravelSession("adventure");
  const reply = replyTravelChallenge("Hello, I am ready!", state);
  assert.equal(reply.state.stage, "discover");
  assert.equal(reply.state.milestones.length, 0);
  assert.doesNotMatch(reply.content, /long flights/i);
});

test("ending early credits only milestones actually demonstrated", () => {
  const result = replyTravelChallenge("I would like to finish now.", createTravelSession("food"));
  assert.equal(result.state.stage, "complete");
  assert.deepEqual(result.state.milestones, []);
});

test("a final-answer phrase completes the final recommendation milestone", () => {
  const state = {
    ...createTravelSession("food"),
    stage: "finalize" as const,
    surpriseRevealed: true,
    milestones: [1, 2, 3],
    recommendation: "Portugal",
  };
  const result = replyTravelChallenge("My final answer is Portugal because it is a better fit for you.", state);
  assert.equal(result.state.stage, "complete");
  assert.deepEqual(result.state.milestones, [1, 2, 3, 4]);
});

test("language evaluation accepts meaningful variations and rejects lone keywords", () => {
  const strong = evaluateTravelLanguage("Based on what you told me about your preferences, I recommend Kyoto, which is quieter than Tokyo. One benefit is the calm atmosphere.");
  assert.ok(strong.vocabulary.includes("based on your preferences"));
  assert.ok(strong.vocabulary.includes("I would recommend"));
  assert.ok(strong.vocabulary.includes("one advantage"));
  assert.ok(strong.grammar.includes("Comparatives and superlatives"));
  assert.ok(strong.grammar.includes("Relative clauses"));
  assert.ok(strong.grammar.includes("Language for making recommendations"));

  const keywords = evaluateTravelLanguage("recommend suitable compared advantage which better");
  assert.deepEqual(keywords.vocabulary, ["suitable"]);
  assert.deepEqual(keywords.grammar, []);
});

test("destination cards use local images only where the catalog has one", () => {
  assert.equal(destinationFromText("I recommend Kyoto because of the food.")?.image, "/destinations/kyoto.jpg");
  assert.equal(destinationFromText("I suggest Bali because it is beautiful.")?.image, undefined);
  assert.equal(personalities.food.name, "The Food Lover");
});
