import { describe, it, expect } from "vitest";
import { computeGoalProgress } from "./goalProgress";
import type { WorkoutSet, Measurement, Goal } from "../db/types";

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 1,
    type: "exerciseWeight",
    targetValue: 100,
    createdAt: "2026-01-01T00:00:00.000Z",
    achievedAt: null,
    ...overrides
  };
}

describe("computeGoalProgress", () => {
  it("computes progress toward a raw exercise weight goal", () => {
    const sets: WorkoutSet[] = [
      { id: 1, sessionId: 1, exerciseId: 5, weightKg: 80, reps: 5, rpe: 8, order: 0, createdAt: "2026-07-01T00:00:00.000Z" }
    ];
    const goal = makeGoal({ type: "exerciseWeight", exerciseId: 5, targetValue: 100 });
    const result = computeGoalProgress(goal, { sets, measurements: [], sessionCountLast7Days: 0 });
    expect(result).toEqual({ current: 80, target: 100, percent: 80 });
  });

  it("computes progress toward a bodyweight goal using the latest measurement", () => {
    const measurements: Measurement[] = [
      { id: 1, date: "2026-07-01", type: "bodyweight", value: 75, unit: "kg" },
      { id: 2, date: "2026-07-10", type: "bodyweight", value: 78, unit: "kg" }
    ];
    const goal = makeGoal({ type: "bodyweight", targetValue: 80 });
    const result = computeGoalProgress(goal, { sets: [], measurements, sessionCountLast7Days: 0 });
    expect(result).toEqual({ current: 78, target: 80, percent: 97.5 });
  });

  it("computes progress toward a weekly-frequency goal", () => {
    const goal = makeGoal({ type: "frequency", targetValue: 4 });
    const result = computeGoalProgress(goal, { sets: [], measurements: [], sessionCountLast7Days: 3 });
    expect(result).toEqual({ current: 3, target: 4, percent: 75 });
  });

  it("clamps percent at 100", () => {
    const sets: WorkoutSet[] = [
      { id: 1, sessionId: 1, exerciseId: 5, weightKg: 120, reps: 1, rpe: 9, order: 0, createdAt: "2026-07-01T00:00:00.000Z" }
    ];
    const goal = makeGoal({ type: "exerciseWeight", exerciseId: 5, targetValue: 100 });
    const result = computeGoalProgress(goal, { sets, measurements: [], sessionCountLast7Days: 0 });
    expect(result.percent).toBe(100);
  });
});
