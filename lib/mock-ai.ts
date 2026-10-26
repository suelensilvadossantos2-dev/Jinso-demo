import type { ChatContext, StudentEvaluation } from "./types.ts";

export type MockReply = { content: string; learnerRef?: string; evaluation?: StudentEvaluation };

const normalize = (value: string) => value.toLowerCase();

export function evaluateStudent(text: string, turn: number): StudentEvaluation {
  const t = normalize(text);
  const vocabulary = ["based on your needs", "suitable", "benefit", "feature", "value for money", "i would recommend"].filter((word) => t.includes(word));
  const grammar: string[] = [];
  if (/\b(better|best|more|less|lighter|cheaper|faster|stronger|most)\b/.test(t)) grammar.push("Comparatives and superlatives");
  if (/\b(which|that|who)\b/.test(t)) grammar.push("Relative clauses");
  if (/recommend|suggest|suitable|option|based on/.test(t)) grammar.push("Language for making recommendations");
  const milestones = [1];
  if (/recommend|suggest|choose|option/.test(t)) milestones.push(2);
  if (/because|since|benefit|feature|better|compare|whereas|while/.test(t)) milestones.push(3);
  if (turn >= 3 && /learn|next time|improve|would|could/.test(t)) milestones.push(4);
  return { vocabulary, grammar, milestones };
}

export function mockReply(context: ChatContext, prompt: string, turn = 1): MockReply {
  const p = normalize(prompt);
  if (context === "student") {
    const evaluation = evaluateStudent(prompt, turn);
    if (turn <= 1) return { content: "That is a clear recommendation. Which feature matters most for the traveler, and why is your choice more suitable than another option?", evaluation };
    if (turn === 2) return { content: "Good reasoning. Now compare your choice with one alternative. Try to mention value for money or use a relative clause with “which” or “that.”", evaluation };
    return { content: "Your explanation connects the customer’s priorities to useful features. To make it stronger, state one trade-off before giving your final recommendation. What would you improve next time?", evaluation };
  }
  if (context === "teacher") {
    if (p.includes("lucia")) return { content: "Lucia has been inactive for nine days, and her speaking indicator (45%) is below the class speaking indicator (58%). Her reading remains steadier. A short paired recommendation role-play with sentence starters would be a focused next step.", learnerRef: "lucia" };
    if (p.includes("which") || p.includes("attention")) return { content: "Five learners currently show attention signals. Lucia Martínez and Sofia Herrera are the clearest examples in this view: Lucia’s inactivity and speaking pattern stand out, while Sofia needs support organizing written and spoken explanations.", learnerRef: "lucia" };
    if (p.includes("struggl")) return { content: "Speaking is the class’s lowest illustrative indicator at 58%, followed by writing at 68%. Learners appear to need more practice explaining and justifying ideas, not just selecting an answer." };
    return { content: "Plan a 15-minute recommendation carousel: pairs compare two workplace options, justify one choice, then switch partners. Give sentence starters to learners who need support and a counterargument challenge to learners who are ready to stretch." };
  }
  if (context === "institution") {
    if (p.includes("evidence") || p.includes("support")) return { content: "The B2 conclusions use predefined, formally assessed evidence—not arbitrary AI feedback. Spoken Interaction uses moderated discussions and role-plays; Grammatical Control uses moderated speaking and writing samples; Written Production uses extended assignments and reports; Listening Comprehension uses extended explanations, discussions, and presentations. All four use institution-defined rubrics across the same fictional cohort of 247 assessed learners." };
    if (p.includes("strongest") || p.includes("improvement") || p.includes("improve")) return { content: "C1 Professional English shows the strongest improvement among the featured courses at +9 percentage points from its comparable baseline. Young Learners follows at +7 pp and B1 General English at +6 pp. These are changes in institutional outcome attainment, not percentage growth or evidence that Jinso caused the improvement." };
    if (p.includes("b2") || p.includes("curriculum standard")) return { content: "B2 performance is mixed. Spoken Interaction has the largest gap at 68% against an 80% target (−12 pp). Written Production is 74% against 80% (−6 pp), and Listening Comprehension is 76% against 80% (−4 pp). Grammatical Control is above target at 81% against 78% (+3 pp). I would prioritize sustained discussion and structured writing, then reinforce extended-listening practice." };
    if (p.includes("struggl") || p.includes("which institutional") || p.includes("outcome")) return { content: "Spoken Interaction needs the most attention at 12 percentage points below target. Written Production is 6 pp below target and Listening Comprehension is 4 pp below target. Grammatical Control is 3 pp above target. These are institution-defined attainment rates from fictional assessed evidence, not CEFR scores or certification." };
    if (p.includes("trend") || p.includes("progress")) return { content: "In the current term view, 72% of 1,200 assessed learners meet their applicable outcome criteria, up 8 percentage points from the comparable 64% baseline. The institution-wide reference benchmark is 75%. This is an illustrative trend and does not establish causation." };
    return { content: "The current term view shows 72% of 1,200 assessed learners meeting applicable institutional outcome criteria. Eighteen of 23 outcome measures meet their course-specific targets, while 94 learners are below at least one benchmark and require academic review." };
  }
  if (/\b(?:price|pricing|cost|plan|contract|commercial terms?|integration|integrate|api|sso|moodle|canvas|certif(?:y|ication)|guarantee|customer results?)\b/.test(p)) {
    return { content: "That information isn’t confirmed in this demo. Please speak with the Jinso team for current product, integration, pricing, or commercial details." };
  }
  if (p.includes("teacher") || p.includes("classroom")) return { content: "Jinso can help a teacher see class-level patterns, understand which learners may need attention, and turn evidence into a practical next teaching action. In this demo, you can explore a fictional B2 class and ask grounded questions about it." };
  if (p.includes("institution") || p.includes("leader")) return { content: "For an institution, Jinso brings learning indicators, engagement, completion, and course comparisons into one view so academic teams can focus their review. The demo uses clearly labeled fictional data rather than customer results." };
  if (p.includes("student") || p.includes("learner")) return { content: "The learner experience is designed around short, purposeful practice. Jinso introduces a realistic task, prompts the learner to explain their thinking, and gives concise feedback tied to the objective." };
  return { content: "I can help you explore Jinso from a learner, teacher, or institutional perspective. Which challenge matters most to you right now: personalized practice, classroom visibility, or learning intelligence at scale?" };
}
