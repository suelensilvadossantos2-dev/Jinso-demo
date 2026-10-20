import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { mockReply } from "@/lib/mock-ai";
import { grammarTargets, personalities, replyTravelChallenge, travelMilestones, vocabularyTargets } from "@/lib/travel-challenge";
import { courses, institutionPeriods, institutionSkills, learners, teacherSkills } from "@/lib/data";
import { readFileSync } from "node:fs";
import path from "node:path";

export const runtime = "nodejs";

const productKnowledge = readFileSync(path.join(process.cwd(), "content/product-knowledge.md"), "utf8");

const bodySchema = z.object({
  context: z.enum(["student", "teacher", "institution", "general"]),
  messages: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(1200) })).min(1).max(12),
  studentScenario: z.object({
    personality: z.enum(["adventure", "food", "relaxation"]),
    stage: z.enum(["discover", "recommend", "surprise", "finalize", "complete"]),
    surpriseRevealed: z.boolean(),
    discovered: z.array(z.enum(["preferences", "budget", "companions", "departure"])).max(4),
    milestones: z.array(z.number().int().min(1).max(4)).max(4),
    recommendation: z.string().max(80).optional(),
  }).optional(),
});

type Bucket = { count: number; resetAt: number };
const globalStore = globalThis as typeof globalThis & { jinsoRate?: Map<string, Bucket>; jinsoSessions?: Map<string, number> };
const rateStore = globalStore.jinsoRate ??= new Map();
const sessionStore = globalStore.jinsoSessions ??= new Map();

function limited(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const bucket = rateStore.get(key);
  if (!bucket || bucket.resetAt < now) { rateStore.set(key, { count: 1, resetAt: now + windowMs }); return false; }
  bucket.count += 1;
  return bucket.count > limit;
}

const systems = {
  teacher: `You are Jinso's classroom assistant. Answer only from this fictional illustrative classroom dataset: ${JSON.stringify({ teacherSkills, learners })}. Be concise, evidence-conscious, and never imply this is real student data. If naming Lucia Martínez or Sofia Herrera, include a learnerRef field with lucia or sofia in JSON. Return JSON with content and optional learnerRef.`,
  institution: `You are Jinso's institutional learning intelligence assistant. Answer only from this fictional illustrative dataset: ${JSON.stringify({ institutionPeriods, institutionSkills, courses })}. Define percentages as illustrative indicators, not CEFR levels or certified gains. Be concise and evidence-conscious. Return JSON with content.`,
  general: `You are Jinso, a warm, thoughtful education consultant. Use only this confirmed product knowledge:\n${productKnowledge}\nDo not invent features, results, terms, or pricing. If information is unavailable, say so and suggest speaking with the team. Return JSON with content.`,
};

function studentSystem(scenario: NonNullable<z.infer<typeof bodySchema>["studentScenario"]>) {
  return `You are Jinso acting as a customer in a short B2 English travel-agent role-play called The Dream Vacation Challenge. Stay in character, be concise and natural, ask one question at a time, and respond to the learner's actual idea. Do not teach or correct after every message. Do not reveal the surprise before a meaningful recommendation and never repeat it. Accept reasonable destinations; this evaluates communication, not travel expertise. If the learner asks for help, guide without supplying a complete answer.

Structured scenario (preferences and surprise are hidden from the learner until naturally relevant): ${JSON.stringify({ personality: personalities[scenario.personality], currentStage: scenario.stage, surpriseRevealed: scenario.surpriseRevealed, discoveredTopics: scenario.discovered, currentRecommendation: scenario.recommendation, learningObjectives: travelMilestones, vocabularyTargets, grammarTargets })}

Use the conversation history. Return one JSON object with: content (customer reply), vocabulary (only targets meaningfully used by the learner in their latest message), grammar (only targets grammatically demonstrated in that message), milestones (all stages actually completed), studentState (the updated scenario with personality, stage, surpriseRevealed, discovered, milestones, and optional recommendation), and optional destinationCard with name and subtitle. Do not award progress for time or message count. Use exactly one response for both conversation and evaluation.`;
}

const aiStudentResult = z.object({
  content: z.string().min(1),
  vocabulary: z.array(z.enum(vocabularyTargets)).default([]),
  grammar: z.array(z.enum(grammarTargets)).default([]),
  milestones: z.array(z.number().int().min(1).max(4)).default([]),
  studentState: bodySchema.shape.studentScenario.unwrap(),
  destinationCard: z.object({ name: z.string().min(1).max(80), subtitle: z.string().min(1).max(140) }).optional(),
});

export async function POST(request: NextRequest) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please send a shorter, valid message." }, { status: 400 });
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const minuteLimit = Number(process.env.AI_REQUESTS_PER_MINUTE || 8);
  if (limited(`ip:${ip}`, minuteLimit, 60_000)) return NextResponse.json({ error: "You’ve reached the short-term demo limit. Please try again in a minute." }, { status: 429 });

  let sessionId = request.cookies.get("jinso_session")?.value;
  if (!sessionId) sessionId = crypto.randomUUID();
  const sessionCount = sessionStore.get(sessionId) || 0;
  const sessionLimit = Number(process.env.AI_SESSION_MESSAGE_LIMIT || 30);
  if (sessionCount >= sessionLimit) return NextResponse.json({ error: "This demo session has reached its message limit. Refresh later to begin a new session." }, { status: 429 });
  sessionStore.set(sessionId, sessionCount + 1);

  const { context, messages, studentScenario } = parsed.data;
  const lastPrompt = messages.at(-1)!.content;
  const apiKey = process.env.OPENAI_API_KEY;
  let payload: Record<string, unknown>;

  if (!apiKey) {
    if (context === "student" && studentScenario) {
      const result = replyTravelChallenge(lastPrompt, studentScenario);
      payload = { message: { role: "assistant", content: result.content }, evaluation: result.evaluation, studentState: result.state, destinationCard: result.destinationCard, mode: "mock" };
    } else {
      const turn = messages.filter((message) => message.role === "user").length;
      const result = mockReply(context, lastPrompt, turn);
      payload = { message: { role: "assistant", content: result.content, learnerRef: result.learnerRef }, evaluation: result.evaluation, mode: "mock" };
    }
  } else {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-4o-mini", temperature: 0.4, max_tokens: 420, response_format: { type: "json_object" }, messages: [{ role: "system", content: context === "student" && studentScenario ? studentSystem(studentScenario) : systems[context as keyof typeof systems] }, ...messages.slice(-10)] }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("The AI service could not answer right now.");
      const data = await response.json();
      const result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
      if (typeof result.content !== "string") throw new Error("The AI service returned an invalid response.");
      if (context === "student" && studentScenario) {
        const validated = aiStudentResult.parse(result);
        payload = { message: { role: "assistant", content: validated.content }, evaluation: { vocabulary: validated.vocabulary, grammar: validated.grammar, milestones: validated.milestones }, studentState: validated.studentState, destinationCard: validated.destinationCard, mode: "real" };
      } else {
        payload = { message: { role: "assistant", content: result.content, learnerRef: result.learnerRef }, mode: "real" };
      }
    } catch (error) {
      return NextResponse.json({ error: error instanceof Error && error.name === "AbortError" ? "Jinso took too long to answer. Please try again." : error instanceof Error ? error.message : "Jinso is unavailable right now." }, { status: 502 });
    } finally { clearTimeout(timeout); }
  }

  const response = NextResponse.json(payload);
  response.cookies.set("jinso_session", sessionId, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 4, path: "/" });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
