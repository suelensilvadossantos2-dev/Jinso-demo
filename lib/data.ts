export const teacherSkills = { Reading: 82, Listening: 74, Writing: 68, Speaking: 58 };

export type Learner = {
  id: string;
  name: string;
  status: "On track" | "Needs attention";
  progress: number;
  active: string;
  observation: string;
  action: string;
  skills: Record<string, number>;
};

const detailedLearners: Learner[] = [
  { id: "lucia", name: "Lucia Martínez", status: "Needs attention", progress: 62, active: "Last active 9 days ago", observation: "Speaking practice has fallen below her recent baseline. Her reading comprehension remains steady, but she is giving shorter spoken explanations.", action: "Invite Lucia to a short paired recommendation role-play with sentence starters.", skills: { Reading: 76, Listening: 68, Writing: 64, Speaking: 45 } },
  { id: "daniel", name: "Daniel Silva", status: "On track", progress: 78, active: "Active today", observation: "Regular participation and consistent performance across skills. He is ready for more demanding comparative language.", action: "Ask Daniel to justify two options and respond to a counterargument.", skills: { Reading: 84, Listening: 80, Writing: 76, Speaking: 74 } },
  { id: "sofia", name: "Sofia Herrera", status: "Needs attention", progress: 55, active: "Active 3 days ago", observation: "Sofia understands scenarios but has difficulty organizing written and spoken explanations.", action: "Use a claim–reason–example organizer before the next speaking activity.", skills: { Reading: 72, Listening: 66, Writing: 48, Speaking: 46 } },
];

const names = ["Carlos Rojas", "Emily Chen", "Mateo Pereira", "Ana Costa", "Rafael Gómez", "Valentina Ruiz", "Diego Torres", "Mariana López", "Bruno Santos", "Elena Vargas", "Tomás Medina", "Camila Duarte", "Nicolás Reyes", "Isabela Lima", "Andrés Molina", "Laura Pérez", "Felipe Castro", "Julia Mendes", "Sebastián Ortiz", "Renata Alves", "Gabriel Cruz", "Paula Navarro"];

export const learners: Learner[] = [...detailedLearners, ...names.map((name, index): Learner => {
  const needs = index === 5 || index === 13 || index === 18;
  const progress = needs ? 59 + (index % 4) : 69 + (index * 3) % 18;
  return { id: name.toLowerCase().replace(/[^a-z]+/g, "-"), name, status: needs ? "Needs attention" : "On track", progress, active: needs ? "Last active 7 days ago" : `${index % 3 === 0 ? "Active today" : "Active this week"}`, observation: needs ? "Participation has recently declined, especially in productive skills." : "Participation and learning indicators are consistent with the class pattern.", action: needs ? "Check in and assign a short guided speaking task." : "Continue the current sequence and offer one stretch activity.", skills: { Reading: progress + 5, Listening: progress + 1, Writing: progress - 4, Speaking: progress - 8 } };
})];

export type AssessmentEvidence = {
  type: "Formally assessed task" | "Moderated portfolio" | "AI-assisted practice signal";
  description: string;
  source: string;
};

export type AcademicOutcome = {
  id: string;
  shortLabel: string;
  title: string;
  cefrMapping: string;
  attainment: number;
  benchmark: number;
  assessedLearners: number;
  learnersMeetingCriteria?: number;
  assessmentCriteria: string;
  evidence: AssessmentEvidence;
  interpretation: string;
};

export type CourseStatus = "Meeting expectations" | "Monitor" | "Academic review recommended";

export type Course = {
  id: string;
  name: string;
  level: string;
  learners: number;
  classes: number;
  assessedLearners: number;
  aggregateAttainment: number;
  improvement: number;
  outcomesMeetingTarget: number;
  totalOutcomes: number;
  status: CourseStatus;
  curriculumObjective: string;
  outcomes: AcademicOutcome[];
  gaps: string[];
  academicPriority: string;
};

const evidence = (description: string, source: string): AssessmentEvidence => ({ type: "Formally assessed task", description, source });

export const b2InstitutionalOutcomes: AcademicOutcome[] = [
  { id: "b2-spoken-interaction", shortLabel: "Spoken Interaction", title: "Sustain conversations, respond appropriately, and participate effectively in discussions.", cefrMapping: "B2 spoken interaction (paraphrased CEFR-aligned competency)", attainment: 68, benchmark: 80, assessedLearners: 247, learnersMeetingCriteria: 168, assessmentCriteria: "Learners meet the institution's rubric threshold for sustaining turns, responding relevantly, asking follow-up questions, and participating effectively in discussion.", evidence: evidence("Moderated workplace discussions and role-plays assessed for sustained interaction, relevance, responsiveness, and interaction management.", "Term spoken-interaction assessment · 168 of 247 learners met the criteria"), interpretation: "Attainment is 12 percentage points below the institutional target; increase structured opportunities for extended, responsive discussion." },
  { id: "b2-grammatical-control", shortLabel: "Grammatical Control", title: "Use a range of grammatical structures with appropriate accuracy and control.", cefrMapping: "B2 grammatical accuracy and range (paraphrased CEFR-aligned competency)", attainment: 81, benchmark: 78, assessedLearners: 247, learnersMeetingCriteria: 200, assessmentCriteria: "Learners meet the institution's rubric threshold for grammatical range and control when errors do not regularly obscure meaning across extended speaking and writing.", evidence: evidence("Moderated speaking and writing samples evaluated with the institution's grammatical range, accuracy, and language-control rubric.", "Term language portfolio · 200 of 247 learners met the criteria"), interpretation: "Attainment is 3 percentage points above the institutional target; maintain current practice and monitor consistency across classes." },
  { id: "b2-written-production", shortLabel: "Written Production", title: "Produce clear, detailed, well-organized texts on a range of subjects.", cefrMapping: "B2 written production (paraphrased CEFR-aligned competency)", attainment: 74, benchmark: 80, assessedLearners: 247, learnersMeetingCriteria: 183, assessmentCriteria: "Learners meet the institution's rubric threshold for task achievement, organization, clarity, development of ideas, and appropriate language control.", evidence: evidence("Extended writing assignments, argumentative texts, written explanations, and short reports assessed with a shared organization, clarity, task-achievement, and language-control rubric.", "Term written-production portfolio · 183 of 247 learners met the criteria"), interpretation: "Attainment is 6 percentage points below the institutional target; prioritize organization, development of ideas, and clear written explanations." },
  { id: "b2-listening-comprehension", shortLabel: "Listening Comprehension", title: "Understand extended speech, follow arguments, and identify key information.", cefrMapping: "B2 listening comprehension (paraphrased CEFR-aligned competency)", attainment: 76, benchmark: 80, assessedLearners: 247, learnersMeetingCriteria: 188, assessmentCriteria: "Learners meet the institution's rubric threshold for identifying key information, following an extended argument, and recognizing relevant supporting details.", evidence: evidence("Listening assessments using extended explanations, discussions, and presentations scored for main ideas, argument structure, and supporting details.", "Term listening-comprehension assessment · 188 of 247 learners met the criteria"), interpretation: "Attainment is 4 percentage points below the institutional target; strengthen practice with extended explanations and argument tracking." },
];

export const courses: Course[] = [
  { id: "a2-general", name: "General English", level: "A2", learners: 320, classes: 12, assessedLearners: 302, aggregateAttainment: 78, improvement: 4, outcomesMeetingTarget: 3, totalOutcomes: 4, status: "Meeting expectations", curriculumObjective: "Build practical communication for familiar routines, needs, and everyday exchanges.", outcomes: [
    { id: "a2-exchange", shortLabel: "Everyday exchange", title: "Complete familiar transactional exchanges with appropriate information", cefrMapping: "A2 spoken interaction (paraphrased CEFR-aligned competency)", attainment: 82, benchmark: 78, assessedLearners: 302, assessmentCriteria: "Completes the exchange, supplies required information, and responds intelligibly.", evidence: evidence("Moderated service and travel role-plays.", "A2 term performance task · 302 learners assessed"), interpretation: "Attainment is above the course target." },
    { id: "a2-description", shortLabel: "Simple descriptions", title: "Describe familiar people, places, and routines in connected phrases", cefrMapping: "A2 spoken production (paraphrased CEFR-aligned competency)", attainment: 76, benchmark: 75, assessedLearners: 302, assessmentCriteria: "Communicates relevant details in an understandable sequence.", evidence: evidence("Short recorded descriptions scored with the A2 production rubric.", "A2 speaking portfolio · 302 learners assessed"), interpretation: "Attainment is slightly above target; monitor class variation." },
  ], gaps: ["A small group needs additional support connecting ideas beyond short phrases."], academicPriority: "Maintain transactional role-play practice and review variation between classes before adjusting the course sequence." },
  { id: "b1-general", name: "General English", level: "B1", learners: 280, classes: 10, assessedLearners: 265, aggregateAttainment: 75, improvement: 6, outcomesMeetingTarget: 3, totalOutcomes: 4, status: "Monitor", curriculumObjective: "Develop connected communication for familiar social, study, and travel contexts.", outcomes: [
    { id: "b1-narrative", shortLabel: "Connected narrative", title: "Organize experiences and events into a connected account", cefrMapping: "B1 spoken production (paraphrased CEFR-aligned competency)", attainment: 77, benchmark: 75, assessedLearners: 265, assessmentCriteria: "Sequences events clearly and uses sufficient detail for the listener to follow.", evidence: evidence("Moderated personal-experience presentations.", "B1 narrative assessment · 265 learners assessed"), interpretation: "Attainment meets the institutional benchmark." },
    { id: "b1-explanation", shortLabel: "Reasons and explanations", title: "Give reasons and brief explanations for opinions and plans", cefrMapping: "B1 communicative competence (paraphrased CEFR-aligned competency)", attainment: 70, benchmark: 74, assessedLearners: 265, assessmentCriteria: "States a position and supports it with at least two relevant reasons.", evidence: evidence("Decision tasks scored for clarity, relevance, and support.", "B1 integrated task · 265 learners assessed"), interpretation: "Attainment is 4 percentage points below target; continue targeted support." },
  ], gaps: ["Supporting reasons remain inconsistent in three classes."], academicPriority: "Use short claim–reason–example routines and compare results at the next moderated checkpoint." },
  { id: "b2-academic", name: "Academic English", level: "B2", learners: 260, classes: 9, assessedLearners: 247, aggregateAttainment: 75, improvement: 5, outcomesMeetingTarget: 1, totalOutcomes: 4, status: "Academic review recommended", curriculumObjective: "Develop sustained, accurate, and well-organized communication across spoken, written, and listening contexts.", outcomes: b2InstitutionalOutcomes, gaps: ["Spoken Interaction is 12 percentage points below target.", "Written Production is 6 percentage points below target.", "Listening Comprehension is 4 percentage points below target."], academicPriority: "Prioritize sustained discussion, structured written explanations, and extended-listening tasks; moderate a shared sample from each outcome before the next checkpoint." },
  { id: "c1-professional", name: "Professional English", level: "C1", learners: 180, classes: 7, assessedLearners: 169, aggregateAttainment: 82, improvement: 9, outcomesMeetingTarget: 4, totalOutcomes: 4, status: "Meeting expectations", curriculumObjective: "Develop flexible, precise professional communication across complex audiences and purposes.", outcomes: [
    { id: "c1-position", shortLabel: "Complex position", title: "Develop and defend a nuanced position in professional discussion", cefrMapping: "C1 spoken interaction and production (paraphrased CEFR-aligned competency)", attainment: 84, benchmark: 80, assessedLearners: 169, assessmentCriteria: "Integrates evidence, addresses counterarguments, and adapts register appropriately.", evidence: evidence("Moderated stakeholder briefings and panel discussions.", "C1 professional performance task · 169 learners assessed"), interpretation: "Attainment is above target across the seven classes." },
    { id: "c1-synthesis", shortLabel: "Information synthesis", title: "Synthesize complex information into a clear audience-appropriate briefing", cefrMapping: "C1 mediation (paraphrased CEFR-aligned competency)", attainment: 80, benchmark: 78, assessedLearners: 169, assessmentCriteria: "Selects, integrates, and reframes key information accurately for the intended audience.", evidence: evidence("Briefing portfolios assessed with a shared synthesis rubric.", "C1 moderated portfolio · 169 learners assessed"), interpretation: "Attainment meets target; continue calibration of the shared rubric." },
  ], gaps: ["A small cross-class gap remains in handling spontaneous counterarguments."], academicPriority: "Retain the current assessment sequence and add one unprepared follow-up in the next moderated task." },
  { id: "young-learners", name: "Young Learners", level: "A1–A2", learners: 210, classes: 10, assessedLearners: 198, aggregateAttainment: 76, improvement: 7, outcomesMeetingTarget: 3, totalOutcomes: 4, status: "Monitor", curriculumObjective: "Build age-appropriate confidence communicating familiar ideas through short supported tasks.", outcomes: [
    { id: "yl-comprehension", shortLabel: "Key information", title: "Identify and respond to key information in familiar classroom exchanges", cefrMapping: "A1–A2 reception and interaction (paraphrased CEFR-aligned competency)", attainment: 80, benchmark: 76, assessedLearners: 198, assessmentCriteria: "Identifies the requested information and gives an appropriate supported response.", evidence: evidence("Teacher-moderated listening and response stations.", "Young Learners checkpoint · 198 learners assessed"), interpretation: "Attainment is above the program benchmark." },
    { id: "yl-description", shortLabel: "Supported description", title: "Give a short supported description of a familiar topic", cefrMapping: "A1–A2 spoken production (paraphrased CEFR-aligned competency)", attainment: 71, benchmark: 74, assessedLearners: 198, assessmentCriteria: "Uses learned language to communicate several relevant details intelligibly.", evidence: evidence("Picture-supported speaking tasks reviewed with the program rubric.", "Young Learners speaking sample · 198 learners assessed"), interpretation: "Attainment is 3 percentage points below target; monitor the effect of added rehearsal support." },
  ], gaps: ["Supported descriptions vary across age groups and classes."], academicPriority: "Align picture-supported speaking routines and review a common sample at the next teacher calibration meeting." },
];

export type InstitutionPeriod = {
  assessedLearners: number;
  learnersMeetingOutcomes: number;
  baselineAttainment: number;
  learnersForReview: number;
  outcomeMeasuresMeetingTarget: number;
  applicableOutcomeMeasures: number;
  benchmark: number;
  trend: Array<{ label: string; attainment: number; assessedLearners: number }>;
};

export const institutionPeriods: Record<"Month" | "Term" | "Year", InstitutionPeriod> = {
  Month: { assessedLearners: 1175, learnersMeetingOutcomes: 811, baselineAttainment: 64, learnersForReview: 101, outcomeMeasuresMeetingTarget: 17, applicableOutcomeMeasures: 23, benchmark: 75, trend: [
    { label: "Baseline", attainment: 64, assessedLearners: 1118 }, { label: "W1", attainment: 65, assessedLearners: 1132 }, { label: "W2", attainment: 66, assessedLearners: 1144 }, { label: "W3", attainment: 68, assessedLearners: 1161 }, { label: "Current", attainment: 69, assessedLearners: 1175 },
  ] },
  Term: { assessedLearners: 1200, learnersMeetingOutcomes: 864, baselineAttainment: 64, learnersForReview: 94, outcomeMeasuresMeetingTarget: 18, applicableOutcomeMeasures: 23, benchmark: 75, trend: [
    { label: "Baseline", attainment: 64, assessedLearners: 1128 }, { label: "Checkpoint 1", attainment: 66, assessedLearners: 1154 }, { label: "Midpoint", attainment: 67, assessedLearners: 1171 }, { label: "Checkpoint 2", attainment: 70, assessedLearners: 1186 }, { label: "Current", attainment: 72, assessedLearners: 1200 },
  ] },
  Year: { assessedLearners: 1225, learnersMeetingOutcomes: 894, baselineAttainment: 62, learnersForReview: 112, outcomeMeasuresMeetingTarget: 20, applicableOutcomeMeasures: 25, benchmark: 75, trend: [
    { label: "Baseline", attainment: 62, assessedLearners: 1104 }, { label: "Q1", attainment: 65, assessedLearners: 1148 }, { label: "Q2", attainment: 68, assessedLearners: 1182 }, { label: "Q3", attainment: 71, assessedLearners: 1207 }, { label: "Current", attainment: 73, assessedLearners: 1225 },
  ] },
};

export function deriveInstitutionMetrics(period: InstitutionPeriod) {
  const learnerAttainment = Math.round((period.learnersMeetingOutcomes / period.assessedLearners) * 100);
  return {
    learnerAttainment,
    improvement: learnerAttainment - period.baselineAttainment,
    learnersForReview: period.learnersForReview,
    standardsMeetingTarget: Math.round((period.outcomeMeasuresMeetingTarget / period.applicableOutcomeMeasures) * 100),
  };
}

export const institutionInsight = "Spoken Interaction remains the largest gap against the institution's B2 benchmarks, with 68% of assessed learners meeting the criteria against an 80% target. Written Production and Listening Comprehension are also below their targets, while Grammatical Control is performing above expectations.";
