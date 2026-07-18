import type { Goal, WorkoutSet, Measurement } from "../db/types";
import { computePRs } from "./calculations";

export function computeGoalProgress(
  goal: Goal,
  context: { sets: WorkoutSet[]; measurements: Measurement[]; sessionCountLast7Days: number }
): { current: number; target: number; percent: number } {
  let current = 0;

  if (goal.type === "exerciseWeight" && goal.exerciseId !== undefined) {
    current = computePRs(context.sets, goal.exerciseId).maxWeightKg;
  } else if (goal.type === "exercise1RM" && goal.exerciseId !== undefined) {
    current = computePRs(context.sets, goal.exerciseId).best1RM;
  } else if (goal.type === "bodyweight") {
    const bodyweightEntries = context.measurements
      .filter((m) => m.type === "bodyweight")
      .sort((a, b) => a.date.localeCompare(b.date));
    current = bodyweightEntries.at(-1)?.value ?? 0;
  } else if (goal.type === "frequency") {
    current = context.sessionCountLast7Days;
  }

  const percent = goal.targetValue > 0 ? Math.min((current / goal.targetValue) * 100, 100) : 0;
  return { current, target: goal.targetValue, percent: Number(percent.toFixed(1)) };
}
