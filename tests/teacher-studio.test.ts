import assert from "node:assert/strict";
import test from "node:test";
import { filterTeacherActivities, learningFocuses, normalizeTeacherActivity, primarySkills, recommendationActivity, respondToTeacherStudio, teacherActivityLibrary, teacherActivitySchema } from "../lib/teacher-studio.ts";

test("teacher library contains six complete, valid sample activities", () => {
  assert.equal(teacherActivityLibrary.length, 6);
  const representedSkills = new Set<string>();
  for (const activity of teacherActivityLibrary) {
    assert.doesNotThrow(() => teacherActivitySchema.parse(activity));
    assert.ok(activity.stages.length >= 2);
    assert.ok(activity.assessmentCriteria.length >= 2);
    assert.ok(primarySkills.includes(activity.primarySkill));
    assert.ok(activity.learningFocus.every((focus) => learningFocuses.includes(focus)));
    representedSkills.add(activity.primarySkill);
  }
  assert.deepEqual([...representedSkills].sort(), [...primarySkills].sort());
});

test("sample activities use the approved academic classifications", () => {
  assert.deepEqual(teacherActivityLibrary.map(({ title, level, primarySkill, learningFocus }) => ({ title, level, primarySkill, learningFocus })), [
    { title: "The Recommendation Challenge", level: "B2", primarySkill: "Speaking", learningFocus: ["Spoken Interaction", "Grammatical Control"] },
    { title: "A Difficult Conversation", level: "B2", primarySkill: "Speaking", learningFocus: ["Spoken Interaction", "Spoken Production"] },
    { title: "The Perfect Getaway", level: "B1", primarySkill: "Listening", learningFocus: ["Listening Comprehension", "Vocabulary Development"] },
    { title: "Write It Right", level: "B2", primarySkill: "Writing", learningFocus: ["Written Production", "Grammatical Control"] },
    { title: "Everyday Decisions", level: "A2", primarySkill: "Reading", learningFocus: ["Reading Comprehension", "Vocabulary Development"] },
    { title: "Present Your Ideas", level: "C1", primarySkill: "Speaking", learningFocus: ["Spoken Production", "Vocabulary Development"] },
  ]);
});

test("library filters return only matching primary skills and levels", () => {
  assert.deepEqual(filterTeacherActivities(teacherActivityLibrary, "All levels", "Listening").map((item) => item.title), ["The Perfect Getaway"]);
  assert.deepEqual(filterTeacherActivities(teacherActivityLibrary, "B2", "Writing").map((item) => item.title), ["Write It Right"]);
  assert.equal(filterTeacherActivities(teacherActivityLibrary, "A2", "Speaking").length, 0);
});

test("legacy saved activities normalize into the approved classification", () => {
  const legacy = { ...recommendationActivity, primarySkill: undefined, learningFocus: undefined, skill: "Specialized discussion", languageFocus: ["Comparatives", "Conversation questions"] };
  const normalized = teacherActivitySchema.parse(normalizeTeacherActivity(legacy));
  assert.equal(normalized.primarySkill, "Speaking");
  assert.deepEqual(normalized.learningFocus, ["Grammatical Control", "Spoken Interaction"]);
  assert.equal(normalized.title, recommendationActivity.title);
  assert.equal(normalized.instructions, recommendationActivity.instructions);
});

test("teacher mock creates a structured recommendation activity", () => {
  const result = respondToTeacherStudio("Create an engaging 15-minute B2 speaking activity where students practice making recommendations.");
  assert.match(result.content, /prepared/i);
  assert.equal(result.activity?.title, "The Recommendation Challenge");
  assert.equal(result.activity?.duration, 15);
  assert.equal(result.activity?.primarySkill, "Speaking");
  assert.deepEqual(result.activity?.learningFocus, ["Spoken Interaction", "Grammatical Control"]);
});

test("teacher mock creates genuine listening, reading, and writing activities", () => {
  const listening = respondToTeacherStudio("Create a B1 listening activity about travel.").activity;
  const reading = respondToTeacherStudio("Create an A2 reading activity using practical texts.").activity;
  const writing = respondToTeacherStudio("Create a B2 writing activity for a formal email.").activity;
  assert.equal(listening?.primarySkill, "Listening");
  assert.match(listening?.stages[1]?.title || "", /listening/i);
  assert.equal(reading?.primarySkill, "Reading");
  assert.match(reading?.instructions || "", /texts/i);
  assert.equal(writing?.primarySkill, "Writing");
  assert.match(writing?.objective || "", /email/i);
});

test("teacher mock revisions preserve context and increment the version", () => {
  const result = respondToTeacherStudio("Add an unexpected customer objection", recommendationActivity);
  assert.equal(result.activity?.id, recommendationActivity.id);
  assert.equal(result.activity?.version, 2);
  assert.equal(result.activity?.objective, recommendationActivity.objective);
  assert.equal(result.activity?.primarySkill, recommendationActivity.primarySkill);
  assert.deepEqual(result.activity?.learningFocus, recommendationActivity.learningFocus);
  assert.match(result.activity?.stages.at(-1)?.title || "", /unexpected objection/i);
});

test("teacher adaptation updates the full task when its primary skill changes", () => {
  const result = respondToTeacherStudio("Adapt this as a listening activity", recommendationActivity);
  assert.equal(result.activity?.primarySkill, "Listening");
  assert.deepEqual(result.activity?.learningFocus, ["Listening Comprehension", "Vocabulary Development"]);
  assert.match(result.activity?.instructions || "", /listen once for gist/i);
  assert.match(result.activity?.assessmentCriteria.join(" ") || "", /supporting details/i);
});

test("Classroom Pulse insight creates a targeted activity even when another draft is open", () => {
  const result = respondToTeacherStudio("Create a 15-minute B2 speaking activity that helps my students compare alternatives and justify their recommendations.", recommendationActivity);
  assert.equal(result.activity?.id, "targeted-recommendation-practice");
  assert.match(result.activity?.objective || "", /compare alternatives/i);
  assert.match(result.activity?.revisionNote || "", /Classroom Pulse/i);
});
