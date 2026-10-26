import { z } from "zod";

export const primarySkills = ["Speaking", "Listening", "Reading", "Writing"] as const;
export const learningFocuses = [
  "Spoken Interaction",
  "Spoken Production",
  "Grammatical Control",
  "Vocabulary Development",
  "Written Production",
  "Listening Comprehension",
  "Reading Comprehension",
] as const;

export type PrimarySkill = (typeof primarySkills)[number];
export type LearningFocus = (typeof learningFocuses)[number];

export const activityStageSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
});

const strictTeacherActivitySchema = z.object({
  id: z.string().min(1).max(80),
  title: z.string().min(1).max(120),
  level: z.enum(["A2", "B1", "B2", "C1"]),
  primarySkill: z.enum(primarySkills),
  learningFocus: z.array(z.enum(learningFocuses)).min(1).max(7),
  duration: z.number().int().min(5).max(90),
  objective: z.string().min(1).max(500),
  instructions: z.string().min(1).max(900),
  stages: z.array(activityStageSchema).min(2).max(6),
  assessmentCriteria: z.array(z.string().min(1).max(180)).min(2).max(8),
  version: z.number().int().min(1).max(99),
  revisionNote: z.string().max(180).optional(),
});

type ActivityInput = Record<string, unknown>;

function inferPrimarySkill(value: unknown): PrimarySkill {
  if (typeof value !== "string") return "Speaking";
  const normalized = value.toLowerCase();
  if (normalized.includes("listen")) return "Listening";
  if (normalized.includes("read")) return "Reading";
  if (normalized.includes("writ")) return "Writing";
  return "Speaking";
}

function inferLearningFocus(source: ActivityInput, primarySkill: PrimarySkill): LearningFocus[] {
  const supplied = Array.isArray(source.learningFocus) ? source.learningFocus : [];
  const approved = supplied.filter((item): item is LearningFocus => typeof item === "string" && learningFocuses.includes(item as LearningFocus));
  if (approved.length) return [...new Set(approved)];

  const legacy = Array.isArray(source.languageFocus) ? source.languageFocus.join(" ").toLowerCase() : "";
  const inferred: LearningFocus[] = [];
  if (/grammar|comparative|conditional|sentence/.test(legacy)) inferred.push("Grammatical Control");
  if (/vocab|lexical|word|collocation/.test(legacy)) inferred.push("Vocabulary Development");
  if (/interaction|conversation|discussion|question|recommend/.test(legacy)) inferred.push("Spoken Interaction");
  if (/present|spoken|explain|opinion|speech/.test(legacy)) inferred.push("Spoken Production");
  if (/listen|audio/.test(legacy)) inferred.push("Listening Comprehension");
  if (/read|text/.test(legacy)) inferred.push("Reading Comprehension");
  if (/writ|email|report/.test(legacy)) inferred.push("Written Production");
  if (inferred.length) return [...new Set(inferred)];

  return [{ Speaking: "Spoken Interaction", Listening: "Listening Comprehension", Reading: "Reading Comprehension", Writing: "Written Production" }[primarySkill] as LearningFocus];
}

export function normalizeTeacherActivity(input: unknown): unknown {
  if (!input || typeof input !== "object" || Array.isArray(input)) return input;
  const source = input as ActivityInput;
  const primarySkill = inferPrimarySkill(source.primarySkill ?? source.skill);
  return {
    ...source,
    primarySkill,
    learningFocus: inferLearningFocus(source, primarySkill),
    skill: undefined,
    languageFocus: undefined,
  };
}

export const teacherActivitySchema = z.preprocess(normalizeTeacherActivity, strictTeacherActivitySchema);
export type TeacherActivity = z.infer<typeof strictTeacherActivitySchema>;

export const recommendationActivity: TeacherActivity = {
  id: "recommendation-challenge",
  title: "The Recommendation Challenge",
  level: "B2",
  primarySkill: "Speaking",
  learningFocus: ["Spoken Interaction", "Grammatical Control"],
  duration: 15,
  objective: "Students will compare alternatives and make a well-supported recommendation in a short B2-level exchange.",
  instructions: "Pairs act as advisers and clients. Advisers identify the client's priorities, compare two options, recommend one, and explain why it is the best fit. Clients ask follow-up questions and introduce one new constraint.",
  stages: [
    { title: "Explore the situation", description: "Clients share a scenario while advisers ask follow-up questions to identify needs, priorities, and constraints." },
    { title: "Compare and recommend", description: "Advisers compare two options, recommend one, and support the decision with two relevant reasons." },
    { title: "Adapt the choice", description: "Clients introduce a new condition. Advisers revise or defend the recommendation using accurate comparison structures." },
  ],
  assessmentCriteria: ["Questions identify the client's main priorities", "Recommendation responds to the stated needs", "Two relevant reasons support the choice", "Comparison and recommendation structures are used with appropriate B2 control"],
  version: 1,
};

const difficultConversation: TeacherActivity = {
  id: "difficult-conversation",
  title: "A Difficult Conversation",
  level: "B2",
  primarySkill: "Speaking",
  learningFocus: ["Spoken Interaction", "Spoken Production"],
  duration: 20,
  objective: "Students will manage a professional disagreement, explain their position clearly, and negotiate a workable next step.",
  instructions: "Pairs receive different workplace priorities. Each student prepares a short position, listens to the partner's concerns, asks clarifying questions, and works toward a practical agreement.",
  stages: [
    { title: "Prepare a position", description: "Students organize their desired outcome, two supporting reasons, and one acceptable compromise." },
    { title: "Clarify the disagreement", description: "Partners explain their positions, paraphrase the other view, and ask questions before proposing solutions." },
    { title: "Negotiate a next step", description: "Partners evaluate two compromises, agree on one action, and summarize the trade-off aloud." },
  ],
  assessmentCriteria: ["Position and reasons are communicated clearly", "Responses address the partner's stated concerns", "Clarifying questions move the discussion forward", "Final agreement and trade-off are summarized coherently"],
  version: 1,
};

const perfectGetaway: TeacherActivity = {
  id: "perfect-getaway",
  title: "The Perfect Getaway",
  level: "B1",
  primarySkill: "Listening",
  learningFocus: ["Listening Comprehension", "Vocabulary Development"],
  duration: 18,
  objective: "Students will identify the main idea, key preferences, and supporting details in a short travel consultation.",
  instructions: "Read the provided 90-second travel consultation aloud twice, or assign two confident readers behind a screen so listeners cannot see the script. Students listen once for gist and again for specific details before comparing answers. No paid audio or microphone access is required.",
  stages: [
    { title: "Prepare to listen", description: "Students preview four travel-category images and predict vocabulary they may hear without reading the consultation script." },
    { title: "First listening: gist", description: "Students listen without taking detailed notes and choose the traveler's main purpose and preferred type of trip." },
    { title: "Second listening: details", description: "Students record the traveler's budget, timing, interests, transport preferences, and one concern." },
    { title: "Check the recommendation", description: "Pairs compare evidence and select the destination that best matches the details they heard." },
  ],
  assessmentCriteria: ["Identifies the consultation's main purpose", "Records at least four accurate supporting details", "Distinguishes stated preferences from distractors", "Uses relevant travel vocabulary when reporting answers"],
  version: 1,
};

const writeItRight: TeacherActivity = {
  id: "write-it-right",
  title: "Write It Right",
  level: "B2",
  primarySkill: "Writing",
  learningFocus: ["Written Production", "Grammatical Control"],
  duration: 25,
  objective: "Students will produce a clear, appropriately formal email that explains a problem and proposes a practical solution.",
  instructions: "Students analyze a workplace email brief, plan the message, and write 140–170 words. They then use a focused checklist to revise organization, register, linking, and sentence accuracy.",
  stages: [
    { title: "Analyze the brief", description: "Students identify the audience, purpose, required content points, and appropriate level of formality." },
    { title: "Plan and draft", description: "Students organize the problem, supporting detail, proposed solution, and requested next step before drafting." },
    { title: "Review and improve", description: "Partners check whether all content points are covered and underline one sentence that could be made clearer or more accurate." },
  ],
  assessmentCriteria: ["All required content points are addressed", "Ideas are organized into clear, connected paragraphs", "Register is appropriate for the recipient", "Grammar and sentence structure support accurate communication"],
  version: 1,
};

const everydayDecisions: TeacherActivity = {
  id: "everyday-decisions",
  title: "Everyday Decisions",
  level: "A2",
  primarySkill: "Reading",
  learningFocus: ["Reading Comprehension", "Vocabulary Development"],
  duration: 15,
  objective: "Students will locate key information in short everyday texts and choose an option that matches a person's needs.",
  instructions: "Give students three short practical texts such as a café menu, a class notice, and a transport timetable. Students scan for prices, times, restrictions, and familiar keywords before matching each person to the best option.",
  stages: [
    { title: "Preview the texts", description: "Students identify each text type and predict where they will find prices, times, places, and rules." },
    { title: "Scan for details", description: "Students answer short questions by locating explicit information in each text." },
    { title: "Match and explain", description: "Students match three simple profiles to suitable options and point to the phrase that supports each choice." },
  ],
  assessmentCriteria: ["Locates explicit details accurately", "Recognizes common vocabulary in context", "Matches options to stated needs", "Uses evidence from the text to explain each choice"],
  version: 1,
};

const presentYourIdeas: TeacherActivity = {
  id: "present-your-ideas",
  title: "Present Your Ideas",
  level: "C1",
  primarySkill: "Speaking",
  learningFocus: ["Spoken Production", "Vocabulary Development"],
  duration: 20,
  objective: "Students will deliver a concise, well-structured proposal using precise vocabulary and adapt it in response to audience questions.",
  instructions: "Students prepare a two-minute proposal for improving a familiar organization. They select precise topic vocabulary, signpost the structure, present without reading a full script, and respond to two audience questions.",
  stages: [
    { title: "Shape the message", description: "Students define the problem, proposed change, expected benefit, and strongest supporting example." },
    { title: "Rehearse for precision", description: "Students replace vague wording, add clear signposting, and rehearse within the two-minute limit." },
    { title: "Present and respond", description: "Students deliver the proposal and answer questions by clarifying or expanding key points." },
  ],
  assessmentCriteria: ["Presentation has a clear and purposeful structure", "Vocabulary is precise and appropriate to the topic", "Delivery is fluent without dependence on a full script", "Answers extend or clarify the proposal effectively"],
  version: 1,
};

export const teacherActivityLibrary: TeacherActivity[] = [recommendationActivity, difficultConversation, perfectGetaway, writeItRight, everydayDecisions, presentYourIdeas];

export function filterTeacherActivities(activities: TeacherActivity[], level: string, primarySkill: string) {
  return activities.filter((activity) => (level === "All levels" || activity.level === level) && (primarySkill === "All skills" || activity.primarySkill === primarySkill));
}

export type TeacherStudioResult = { content: string; activity?: TeacherActivity };

const cloneActivity = (activity: TeacherActivity): TeacherActivity => teacherActivitySchema.parse(structuredClone(activity));

function revised(activity: TeacherActivity, changes: Partial<TeacherActivity>, note: string): TeacherActivity {
  return teacherActivitySchema.parse({ ...cloneActivity(activity), ...changes, version: activity.version + 1, revisionNote: note });
}

function templateForPrompt(prompt: string) {
  if (/\blisten|audio|podcast\b/.test(prompt)) return perfectGetaway;
  if (/\bread|article|text comprehension\b/.test(prompt)) return everydayDecisions;
  if (/\bwrite|writing|email|report\b/.test(prompt)) return writeItRight;
  if (/\bpresent|presentation|speech\b/.test(prompt)) return presentYourIdeas;
  return recommendationActivity;
}

export function respondToTeacherStudio(prompt: string, current?: TeacherActivity): TeacherStudioResult {
  const p = prompt.toLowerCase();
  const base = current ? teacherActivitySchema.parse(current) : undefined;

  if (/plan my next class|based on my students' learning needs|helps my students compare alternatives/.test(p)) {
    const activity = cloneActivity(recommendationActivity);
    activity.id = "targeted-recommendation-practice";
    activity.title = "Compare, Recommend, Justify";
    activity.revisionNote = "Created from the Classroom Pulse learning need";
    activity.instructions = "Students work through short workplace decision cards. Each recommendation must compare two alternatives and include two supporting reasons before a partner introduces a new constraint.";
    return { content: "I've created a targeted B2 speaking activity from the Classroom Pulse insight. It focuses on comparing alternatives and justifying recommendations.", activity: teacherActivitySchema.parse(activity) };
  }

  if (base && /\b(b1|a2|c1)\b/.test(p)) {
    const level = (p.match(/\b(a2|b1|c1)\b/i)?.[1].toUpperCase() || "B1") as TeacherActivity["level"];
    const activity = revised(base, {
      level,
      objective: level === "B1" ? `Students will complete the ${base.primarySkill.toLowerCase()} task using clear, connected language appropriate to familiar contexts.` : `Students will complete the activity using language and task demands appropriate to ${level} level.`,
    }, `Adapted for ${level} learners`);
    return { content: `I've adapted the existing activity for ${level} learners while preserving its primary skill and learning focus.`, activity };
  }

  if (base && /\b(listening|reading|writing)\b/.test(p)) {
    const template = templateForPrompt(p);
    const activity = revised(base, {
      primarySkill: template.primarySkill,
      learningFocus: template.learningFocus,
      objective: template.objective,
      instructions: template.instructions,
      stages: template.stages,
      assessmentCriteria: template.assessmentCriteria,
    }, `Adapted as a ${template.primarySkill.toLowerCase()} activity`);
    return { content: `I've adapted the draft into a genuine ${template.primarySkill.toLowerCase()} task and aligned its learning focus, stages, and assessment criteria.`, activity };
  }

  if (base && /(10 minute|10-minute|reduce|shorter)/.test(p)) {
    const activity = revised(base, { duration: 10, stages: base.stages.map((stage, index) => index === 0 ? { ...stage, description: `${stage.description} Keep this opening to two minutes.` } : stage) }, "Reduced to 10 minutes");
    return { content: "I've tightened the pacing to 10 minutes and kept the same learning objective and classification.", activity };
  }

  if (base && /(surprise|unexpected|objection|challeng)/.test(p)) {
    const stages = [...base.stages];
    const last = stages.length - 1;
    stages[last] = { title: "Respond to an unexpected objection", description: "A new constraint changes the task conditions. Students must adapt their response and explain what changed while continuing to meet the original objective." };
    const activity = revised(base, { stages }, "Added an unexpected change");
    return { content: "I've added an unexpected change to the final stage while preserving the activity's classification.", activity };
  }

  if (base && /(speaking|more interactive|interactive)/.test(p)) {
    const activity = revised(base, {
      primarySkill: "Speaking",
      learningFocus: ["Spoken Interaction", ...base.learningFocus.filter((focus) => focus === "Grammatical Control" || focus === "Vocabulary Development")],
      instructions: `${base.instructions} Rotate partners once so every learner explains the response twice and answers a new question.`,
    }, "Increased spoken interaction");
    return { content: "I've increased spoken interaction with a partner rotation and kept the classifications within the approved framework.", activity };
  }

  if (base && /(objective|learning objective)/.test(p)) {
    const activity = revised(base, { objective: `By the end of the activity, students will complete the ${base.primarySkill.toLowerCase()} task and demonstrate the stated success criteria using evidence from their response.` }, "Made the learning objective observable");
    return { content: "I've made the objective more observable while preserving the activity's classification.", activity };
  }

  if (/improve|existing activity|more interactive|unexpected challenge/.test(p) && !base) {
    const activity = revised(recommendationActivity, { instructions: `${recommendationActivity.instructions} Students change partners after the first recommendation and respond to a different client priority.` }, "Added a partner rotation");
    return { content: "I've opened a sample activity and made it more interactive with a partner rotation. Tell me what else you'd like to change.", activity };
  }

  if (/next class|learning needs|compare alternatives|justify/.test(p)) {
    const activity = cloneActivity(recommendationActivity);
    activity.id = "targeted-recommendation-practice";
    activity.title = "Compare, Recommend, Justify";
    activity.revisionNote = "Created from the Classroom Pulse learning need";
    activity.instructions = "Students work through short workplace decision cards. Each recommendation must compare two alternatives and include two supporting reasons before a partner introduces a new constraint.";
    return { content: "I've created a targeted B2 speaking activity from the Classroom Pulse insight. It focuses on comparing alternatives and justifying recommendations.", activity: teacherActivitySchema.parse(activity) };
  }

  if (/create|activity|recommendation|listen|read|write|present/.test(p)) {
    const activity = cloneActivity(templateForPrompt(p));
    return { content: `I've prepared a ${activity.duration}-minute ${activity.primarySkill.toLowerCase()} activity with approved learning focuses. You can review it on the right or ask me to adjust it.`, activity };
  }

  return { content: "In mock mode, I can create Speaking, Listening, Reading, or Writing activities; adapt the current draft; change the level or timing; or plan from the Classroom Pulse insight." };
}
