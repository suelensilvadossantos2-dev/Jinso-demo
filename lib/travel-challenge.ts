import type { StudentEvaluation } from "./types.ts";

export type TravelPersonalityId = "adventure" | "food" | "relaxation";
export type TravelStage = "discover" | "recommend" | "surprise" | "finalize" | "complete";
export type DiscoveryTopic = "preferences" | "budget" | "companions" | "departure";

export type TravelSessionState = {
  personality: TravelPersonalityId;
  stage: TravelStage;
  surpriseRevealed: boolean;
  discovered: DiscoveryTopic[];
  milestones: number[];
  recommendation?: string;
};

export type DestinationCard = { name: string; subtitle: string; image?: string };

export const vocabularyTargets = [
  "I would recommend",
  "suitable",
  "compared to",
  "ideal for",
  "based on your preferences",
  "one advantage",
] as const;

export const grammarTargets = [
  "Comparatives and superlatives",
  "Relative clauses",
  "Language for making recommendations",
] as const;

export const travelMilestones = [
  "Discover preferences",
  "Recommend a destination",
  "Adapt to a surprise",
  "Finalize your recommendation",
] as const;

export const personalities = {
  adventure: {
    name: "The Adventure Seeker",
    character: "Energetic, curious, and happiest outdoors.",
    surprise: "One more thing... I really don't like long flights!",
  },
  food: {
    name: "The Food Lover",
    character: "Friendly, curious about culture, and always excited by local food.",
    surprise: "Actually, I'm traveling with someone who really prefers quiet places. Do you think your recommendation would still work?",
  },
  relaxation: {
    name: "The Relaxation Expert",
    character: "Relaxed, friendly, and ready for a peaceful break.",
    surprise: "But there's one problem—I get bored when there's absolutely nothing to do!",
  },
} satisfies Record<TravelPersonalityId, { name: string; character: string; surprise: string }>;

export const openingMessage = "Hi! I finally have five days off, and I want to go somewhere amazing. But I'm terrible at planning trips! Could you be my travel agent?";

export function createTravelSession(personality: TravelPersonalityId): TravelSessionState {
  return { personality, stage: "discover", surpriseRevealed: false, discovered: [], milestones: [] };
}

const destinationCatalog: Array<{ names: string[]; canonical: string; subtitle: string; image?: string }> = [
  { names: ["costa rica"], canonical: "Costa Rica", subtitle: "Cloud forests, wildlife, and outdoor adventure", image: "/destinations/costa-rica.jpg" },
  { names: ["kyoto"], canonical: "Kyoto", subtitle: "Local cuisine, calm streets, and rich culture", image: "/destinations/kyoto.jpg" },
  { names: ["japan", "tokyo"], canonical: "Japan", subtitle: "Food, culture, and memorable contrasts", image: "/destinations/kyoto.jpg" },
  { names: ["santorini", "greece", "crete", "greek islands"], canonical: "The Greek Islands", subtitle: "Coastal calm with culture and places to explore", image: "/destinations/greek-island.jpg" },
  { names: ["bali"], canonical: "Bali", subtitle: "Beautiful surroundings with culture and gentle adventure" },
  { names: ["iceland"], canonical: "Iceland", subtitle: "Dramatic nature and unforgettable outdoor experiences" },
  { names: ["italy", "rome", "florence", "tuscany"], canonical: "Italy", subtitle: "Food, culture, and varied city escapes" },
  { names: ["portugal", "lisbon", "porto"], canonical: "Portugal", subtitle: "Coastal scenery, culture, and relaxed city life" },
  { names: ["thailand", "bangkok", "chiang mai", "phuket"], canonical: "Thailand", subtitle: "Distinctive cuisine, culture, and tropical escapes" },
  { names: ["new zealand"], canonical: "New Zealand", subtitle: "Big landscapes and outdoor adventure" },
  { names: ["switzerland", "swiss alps"], canonical: "Switzerland", subtitle: "Mountain scenery, calm towns, and active days" },
  { names: ["paris"], canonical: "Paris", subtitle: "Food, culture, and lively neighborhoods" },
  { names: ["mexico", "mexico city"], canonical: "Mexico", subtitle: "Regional food, history, and colorful culture" },
];

function normalize(value: string) { return value.toLowerCase().replace(/[’]/g, "'"); }

export function destinationFromText(text: string): DestinationCard | undefined {
  const lower = normalize(text);
  const match = destinationCatalog.find((entry) => entry.names.some((name) => lower.includes(name)));
  if (match) return { name: match.canonical, subtitle: match.subtitle, image: match.image };

  const phrase = text.match(/(?:recommend|suggest|consider|visit|go(?:ing)? to|how about)\s+(?:that you (?:visit|try)|a trip to|visiting|going to|the destination of)?\s*([A-Z][A-Za-zÀ-ÿ' -]{1,34}?)(?=\s+(?:because|since|as|for|which|that|would|is|has|offers)\b|[,.!?]|$)/i)?.[1]?.trim();
  if (!phrase || /^(a|an|the|somewhere|something|it|this)$/i.test(phrase)) return undefined;
  const name = phrase.replace(/\b(?:for you|instead)$/i, "").trim();
  return name ? { name: name.replace(/\b\w/g, (letter) => letter.toUpperCase()), subtitle: "A destination shaped around the traveler's priorities" } : undefined;
}

export function evaluateTravelLanguage(text: string): StudentEvaluation {
  const t = normalize(text);
  const vocabulary: string[] = [];
  if (/\b(?:i\s+(?:would|'d)\s+recommend|i\s+recommend|my recommendation (?:is|would be))\b/.test(t)) vocabulary.push("I would recommend");
  if (/\b(?:suitable|well[- ]suited|a good fit)\b/.test(t)) vocabulary.push("suitable");
  if (/\bcompared\s+(?:to|with)\b|\bin comparison (?:to|with)\b/.test(t)) vocabulary.push("compared to");
  if (/\b(?:ideal|perfect)\s+for\b/.test(t)) vocabulary.push("ideal for");
  if (/\bbased on (?:your|those) (?:preferences|priorities|interests|needs)\b|\bbased on what you(?:'ve| have)? (?:said|told me about) (?:your )?(?:preferences|priorities|interests|needs)\b/.test(t)) vocabulary.push("based on your preferences");
  if (/\b(?:one|an|the main|another) (?:advantage|benefit)\b/.test(t)) vocabulary.push("one advantage");

  const grammar: string[] = [];
  if (/\b(?:better|worse|more|less|farther|further|closer|quieter|calmer|busier|cheaper|warmer|cooler|easier|safer)\s+than\b|\b(?:the\s+)?(?:best|worst|most|least)\s+[a-z]+/.test(t)) grammar.push("Comparatives and superlatives");
  if (/\b(?:place|destination|city|island|country|area|resort|town|option|region|people|someone|companion)\s+(?:that|which|who)\s+(?:is|are|has|have|offers|enjoys|prefers|lets|gives|can|will|would)\b|,\s*(?:which|who)\s+(?:is|are|has|have|offers|enjoys|prefers|lets|gives|can|will|would)\b/.test(t)) grammar.push("Relative clauses");
  if (/\b(?:i\s+(?:would|'d)?\s*recommend|i\s+suggest|you (?:could|should|might) (?:visit|try|consider|go)|(?:a )?(?:suitable|ideal|perfect) (?:choice|option|destination|place))\b/.test(t)) grammar.push("Language for making recommendations");
  return { vocabulary, grammar, milestones: [] };
}

function topicsIn(text: string): DiscoveryTopic[] {
  const t = normalize(text);
  const topics: DiscoveryTopic[] = [];
  if (/\b(?:like|love|enjoy|prefer|interest|beach|mountain|relax|adventure|food|culture|kind of (?:place|trip|vacation))\b/.test(t)) topics.push("preferences");
  if (/\b(?:budget|spend|cost|price|expensive|afford)\b/.test(t)) topics.push("budget");
  if (/\b(?:who|someone|alone|solo|companion|partner|family|friend|travel(?:ing|ling)? with)\b/.test(t)) topics.push("companions");
  if (/\b(?:depart|departure|leav(?:e|ing) from|fly(?:ing)? from|where (?:are|will|would) you (?:start|leave|depart))\b/.test(t)) topics.push("departure");
  return topics;
}

function preferenceReply(personality: TravelPersonalityId, topics: DiscoveryTopic[]) {
  const topic = topics[0];
  if (topic === "budget") return "I can be fairly flexible, but I care more about a memorable experience than luxury. What else would help you narrow it down?";
  if (topic === "companions") return personality === "food" ? "I'm traveling with someone close to me. I love sharing food and cultural experiences when I travel. What else would you like to know?" : "For this trip, imagine it's just me. I want five days that feel genuinely different from everyday life. What should you ask me next?";
  if (topic === "departure") return "I'll be departing from southern Brazil. Would that change the kind of destination you have in mind?";
  if (personality === "adventure") return "I love discovering new places, especially when I can hike, be in nature, and have a little adventure. What else do you need to know?";
  if (personality === "food") return "Great food is a big priority for me, and I love discovering a place through its culture and local experiences. What else would help?";
  return "I want beautiful surroundings and a peaceful atmosphere—somewhere I can really disconnect. What else would you like to know?";
}

function hasRecommendationLanguage(text: string) {
  const t = normalize(text);
  return /\b(?:recommend|suggest|consider|visit|go to|travel to|destination|perfect for|ideal for|suitable)\b/.test(t) || Boolean(destinationFromText(text));
}

function hasAdaptation(text: string) {
  const t = normalize(text);
  return /\b(?:instead|alternative|another option|still work|adjust|adapt|closer|quieter|activities|things to do|compared|however|although|but|because|could also|would still|itinerary)\b/.test(t) || (hasRecommendationLanguage(text) && text.trim().length > 18);
}

export type TravelTurnResult = {
  content: string;
  state: TravelSessionState;
  evaluation: StudentEvaluation;
  destinationCard?: DestinationCard;
};

export function replyTravelChallenge(prompt: string, current: TravelSessionState): TravelTurnResult {
  const language = evaluateTravelLanguage(prompt);
  const t = normalize(prompt);
  const askedTopics = topicsIn(prompt);
  const discovered = Array.from(new Set([...current.discovered, ...askedTopics]));
  const milestones = [...current.milestones];
  const award = (number: number) => { if (!milestones.includes(number)) milestones.push(number); };
  const finishIntent = /\b(?:finish|finished|end (?:the|this)|i'm done|that'?s all|final answer)\b/.test(t);
  const recommendationCard = destinationFromText(prompt);

  if (finishIntent && current.stage !== "finalize") {
    return { content: "Thanks for helping me plan. Let's look at the language you demonstrated in this conversation.", state: { ...current, stage: "complete", discovered, milestones }, evaluation: { ...language, milestones } };
  }

  if (current.stage === "discover" || current.stage === "recommend") {
    if (hasRecommendationLanguage(prompt) && (recommendationCard || prompt.trim().length > 22)) {
      award(2);
      const destination = recommendationCard?.name || "that destination";
      return {
        content: `That sounds like an interesting choice—${destination}! ${personalities[current.personality].surprise} How would you adapt or defend your recommendation?`,
        state: { ...current, stage: "surprise", surpriseRevealed: true, discovered, milestones, recommendation: recommendationCard?.name || current.recommendation },
        evaluation: { ...language, milestones },
        destinationCard: recommendationCard,
      };
    }
    if (askedTopics.length > 0 || prompt.trim().endsWith("?")) {
      award(1);
      return {
        content: preferenceReply(current.personality, askedTopics.length ? askedTopics : ["preferences"]),
        state: { ...current, stage: "recommend", discovered, milestones },
        evaluation: { ...language, milestones },
      };
    }
    if (/\b(?:help|hint|not sure|don't know|do not know)\b/.test(t)) {
      return { content: "Start by asking me one thing that would help a travel agent understand what kind of vacation I enjoy.", state: { ...current, discovered, milestones }, evaluation: { ...language, milestones } };
    }
    return { content: "I'd love your help! What would you like to know about me before you choose a destination?", state: { ...current, discovered, milestones }, evaluation: { ...language, milestones } };
  }

  if (current.stage === "surprise") {
    if (askedTopics.includes("departure") && current.personality === "adventure") {
      award(1);
      return { content: `I'll be departing from southern Brazil. With that in mind, would you keep ${current.recommendation || "your recommendation"}, or suggest something closer?`, state: { ...current, discovered, milestones }, evaluation: { ...language, milestones } };
    }
    if (hasAdaptation(prompt)) {
      award(3);
      const newCard = recommendationCard || (current.recommendation ? destinationFromText(current.recommendation) : undefined);
      return {
        content: "That feels much more balanced. Give me your final recommendation in one clear message, including the strongest reason I should choose it.",
        state: { ...current, stage: "finalize", discovered, milestones, recommendation: recommendationCard?.name || current.recommendation },
        evaluation: { ...language, milestones },
        destinationCard: recommendationCard && recommendationCard.name !== current.recommendation ? recommendationCard : undefined,
      };
    }
    return { content: "How could you adjust the plan, compare another option, or explain why your original choice still works for me?", state: { ...current, discovered, milestones }, evaluation: { ...language, milestones } };
  }

  if (current.stage === "finalize") {
    if (prompt.trim().length >= 12) {
      award(4);
      return {
        content: `You've convinced me—${recommendationCard?.name || current.recommendation || "that plan"} sounds like a thoughtful fit. Thanks, travel agent! You can finish the lesson whenever you're ready.`,
        state: { ...current, stage: "complete", discovered, milestones, recommendation: recommendationCard?.name || current.recommendation },
        evaluation: { ...language, milestones },
        destinationCard: recommendationCard && recommendationCard.name !== current.recommendation ? recommendationCard : undefined,
      };
    }
    return { content: "Could you make that a little more specific and tell me your strongest reason?", state: { ...current, discovered, milestones }, evaluation: { ...language, milestones } };
  }

  return { content: "Thank you—that gives me a clear plan. Finish the lesson to see your language recap.", state: current, evaluation: { ...language, milestones } };
}

export function recapGuidance(state: TravelSessionState, vocabulary: string[], grammar: string[]) {
  const strength = state.milestones.includes(3)
    ? "You responded to a changing customer need and kept your recommendation focused on the traveler."
    : state.milestones.includes(2)
      ? "You made a clear destination recommendation and moved the conversation toward a practical choice."
      : state.milestones.includes(1)
        ? "You asked questions to understand what the traveler wanted before making assumptions."
        : "You took part in the role-play and began building a customer-focused conversation.";
  const improvement = !state.milestones.includes(2)
    ? "Make a specific destination recommendation and connect it to one preference the customer shared."
    : !state.milestones.includes(3)
      ? "When the plan changes, compare an alternative or explain how your first idea can be adapted."
      : grammar.length === 0
        ? "Add one comparison or relative clause to make your reasoning more precise."
        : vocabulary.length < 2
          ? "Use another recommendation phrase to organize your final explanation more clearly."
          : "State one trade-off before your final choice to make the recommendation feel more balanced.";
  const example = state.recommendation
    ? `Based on your preferences, I would recommend ${state.recommendation}, which offers a good balance of what matters most to you.`
    : "Based on your preferences, I would recommend a destination that offers both memorable experiences and time to relax.";
  return { strength, improvement, example };
}
