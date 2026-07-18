import { describe, it, expect } from "vitest";
import { estimate1RM, computeVolume, computePRs, computeStreak } from "./calculations";
import type { WorkoutSet } from "../db/types";

describe("estimate1RM", () => {
  it("returns the weight itself for a 1-rep set", () => {
    expect(estimate1RM(100, 1)).toBeCloseTo(103.33, 1);
  });

  it("applies the Epley formula for higher reps", () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe("computeVolume", () => {
  it("multiplies weight by reps", () => {
    expect(computeVolume(80, 10)).toBe(800);
  });
});

function makeSet(overrides: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 1,
    sessionId: 1,
    exerciseId: 1,
    weightKg: 100,
    reps: 5,
    rpe: 8,
    order: 0,
    createdAt: "2026-01-01T10:00:00.000Z",
    ...overrides
  };
}

describe("computePRs", () => {
  it("finds max weight, best est. 1RM, and max reps for the given exercise only", () => {
    const sets: WorkoutSet[] = [
      makeSet({ exerciseId: 1, weightKg: 100, reps: 5 }),
      makeSet({ exerciseId: 1, weightKg: 110, reps: 2 }),
      makeSet({ exerciseId: 1, weightKg: 60, reps: 12 }),
      makeSet({ exerciseId: 2, weightKg: 200, reps: 1 }) // different exercise, ignored
    ];
    const prs = computePRs(sets, 1);
    expect(prs.maxWeightKg).toBe(110);
    expect(prs.maxReps).toBe(12);
    expect(prs.best1RM).toBeCloseTo(estimate1RM(110, 2), 5);
  });

  it("returns zeros when no sets exist for the exercise", () => {
    const prs = computePRs([], 5);
    expect(prs).toEqual({ maxWeightKg: 0, best1RM: 0, maxReps: 0 });
  });
});

describe("computeStreak", () => {
  const today = new Date("2026-07-18T12:00:00Z");

  it("counts consecutive days ending today", () => {
    const dates = ["2026-07-16", "2026-07-17", "2026-07-18"];
    expect(computeStreak(dates, today)).toBe(3);
  });

  it("counts consecutive days ending yesterday (today not trained yet)", () => {
    const dates = ["2026-07-16", "2026-07-17"];
    expect(computeStreak(dates, today)).toBe(2);
  });

  it("resets to 0 when the most recent session is more than 1 day old", () => {
    const dates = ["2026-07-10", "2026-07-11"];
    expect(computeStreak(dates, today)).toBe(0);
  });

  it("deduplicates same-day entries", () => {
    const dates = ["2026-07-18", "2026-07-18"];
    expect(computeStreak(dates, today)).toBe(1);
  });
});
