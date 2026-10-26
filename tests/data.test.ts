import assert from "node:assert/strict";
import test from "node:test";
import { b2InstitutionalOutcomes, courses, deriveInstitutionMetrics, institutionPeriods, learners, teacherSkills } from "../lib/data.ts";

test("fictional classroom contains 25 internally bounded learners", () => {
  assert.equal(learners.length, 25);
  assert.equal(learners.filter((learner) => learner.status === "Needs attention").length, 5);
  for (const learner of learners) assert.ok(learner.progress >= 0 && learner.progress <= 100);
});

test("institutional outcome data is bounded, benchmarked, and evidence-linked", () => {
  for (const value of Object.values(teacherSkills)) assert.ok(value >= 0 && value <= 100);
  for (const period of Object.values(institutionPeriods)) {
    assert.ok(period.learnersMeetingOutcomes <= period.assessedLearners);
    assert.ok(period.outcomeMeasuresMeetingTarget <= period.applicableOutcomeMeasures);
    for (const point of period.trend) {
      assert.ok(point.attainment >= 0 && point.attainment <= 100);
      assert.ok(point.assessedLearners > 0);
    }
  }
  for (const course of courses) {
    assert.ok(course.outcomesMeetingTarget <= course.totalOutcomes);
    for (const outcome of course.outcomes) {
      assert.ok(outcome.attainment >= 0 && outcome.attainment <= 100);
      assert.ok(outcome.benchmark > 0 && outcome.benchmark <= 100);
      assert.ok(outcome.assessedLearners > 0);
      assert.ok(outcome.cefrMapping.includes("paraphrased CEFR-aligned competency"));
      assert.ok(outcome.evidence.description.length > 0);
      assert.ok(outcome.assessmentCriteria.length > 0);
    }
  }
  assert.equal(courses.find((course) => course.level === "B2")?.status, "Academic review recommended");
  assert.equal(b2InstitutionalOutcomes.length, 4);
  assert.deepEqual(b2InstitutionalOutcomes.map((outcome) => outcome.id), [
    "b2-spoken-interaction",
    "b2-grammatical-control",
    "b2-written-production",
    "b2-listening-comprehension",
  ]);
  assert.deepEqual(b2InstitutionalOutcomes.map((outcome) => [outcome.attainment, outcome.benchmark]), [[68, 80], [81, 78], [74, 80], [76, 80]]);
  for (const outcome of b2InstitutionalOutcomes) {
    assert.ok(outcome.learnersMeetingCriteria);
    assert.equal(Math.round((outcome.learnersMeetingCriteria! / outcome.assessedLearners) * 100), outcome.attainment);
  }
  assert.equal(courses.find((course) => course.id === "b2-academic")?.aggregateAttainment, 75);
});

test("term headline metrics derive from coherent numerator and denominator values", () => {
  const metrics = deriveInstitutionMetrics(institutionPeriods.Term);
  assert.deepEqual(metrics, { learnerAttainment: 72, improvement: 8, learnersForReview: 94, standardsMeetingTarget: 78 });
  assert.equal(institutionPeriods.Term.trend.at(-1)?.attainment, metrics.learnerAttainment);
});
