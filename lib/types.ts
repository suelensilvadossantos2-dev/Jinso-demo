export type ChatContext = "student" | "teacher" | "institution" | "general";
export type ChatMessage = { role: "user" | "assistant"; content: string; learnerRef?: string };

export type StudentEvaluation = {
  vocabulary: string[];
  grammar: string[];
  milestones: number[];
};
