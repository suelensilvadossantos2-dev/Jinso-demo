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

export type Course = { id: string; name: string; level: string; learners: number; classes: number; engagement: number; progress: number; completion: number; status: "On track" | "Review"; skills: Record<string, number>; observation: string };

export const courses: Course[] = [
  { id: "a2-general", name: "General English", level: "A2", learners: 320, classes: 12, engagement: 88, progress: 78, completion: 84, status: "On track", skills: { Reading: 82, Listening: 79, Writing: 74, Speaking: 72 }, observation: "Participation and course completion are stable across classes." },
  { id: "b1-general", name: "General English", level: "B1", learners: 280, classes: 10, engagement: 84, progress: 68, completion: 79, status: "On track", skills: { Reading: 78, Listening: 75, Writing: 69, Speaking: 66 }, observation: "Learners are progressing consistently; writing is the clearest opportunity for reinforcement." },
  { id: "b2-academic", name: "Academic English", level: "B2", learners: 260, classes: 9, engagement: 72, progress: 58, completion: 67, status: "Review", skills: { Reading: 76, Listening: 70, Writing: 61, Speaking: 55 }, observation: "Engagement and progress are lower than other levels. Speaking and extended explanations merit academic review." },
  { id: "c1-professional", name: "Professional English", level: "C1", learners: 180, classes: 7, engagement: 86, progress: 74, completion: 81, status: "On track", skills: { Reading: 87, Listening: 82, Writing: 76, Speaking: 73 }, observation: "Strong engagement with an opportunity to deepen spontaneous speaking tasks." },
  { id: "young-learners", name: "Young Learners", level: "Mixed", learners: 210, classes: 10, engagement: 83, progress: 71, completion: 77, status: "On track", skills: { Reading: 77, Listening: 80, Writing: 65, Speaking: 70 }, observation: "Listening is a relative strength; writing scaffolds remain useful." },
];

export const institutionPeriods = {
  Month: { active: 82, progress: 9, attention: 101, completion: 76, trend: [62, 64, 66, 65, 69, 71] },
  Term: { active: 84, progress: 12, attention: 94, completion: 78, trend: [58, 61, 64, 68, 72, 76] },
  Year: { active: 81, progress: 18, attention: 112, completion: 74, trend: [52, 56, 60, 64, 69, 73] },
};

export const institutionSkills = { Reading: 81, Listening: 75, Writing: 67, Speaking: 59 };
