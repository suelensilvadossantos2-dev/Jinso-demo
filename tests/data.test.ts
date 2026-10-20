import assert from "node:assert/strict";
import test from "node:test";
import { courses, institutionPeriods, learners, teacherSkills } from "../lib/data.ts";

test("fictional classroom contains 25 internally bounded learners", () => {
  assert.equal(learners.length, 25);
  assert.equal(learners.filter((learner) => learner.status === "Needs attention").length, 5);
  for (const learner of learners) assert.ok(learner.progress >= 0 && learner.progress <= 100);
});

test("featured institution datasets keep all indicators within percentage bounds", () => {
  for (const value of Object.values(teacherSkills)) assert.ok(value >= 0 && value <= 100);
  for (const period of Object.values(institutionPeriods)) {
    assert.ok(period.active <= 100 && period.completion <= 100);
    for (const point of period.trend) assert.ok(point >= 0 && point <= 100);
  }
  assert.equal(courses.find((course) => course.level === "B2")?.status, "Review");
});
