import type { WorkoutSet } from "../db/types";

export function estimate1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

export function computeVolume(weightKg: number, reps: number): number {
  return weightKg * reps;
}

export function computePRs(
  sets: WorkoutSet[],
  exerciseId: number
): { maxWeightKg: number; best1RM: number; maxReps: number } {
  const relevant = sets.filter((s) => s.exerciseId === exerciseId);
  if (relevant.length === 0) {
    return { maxWeightKg: 0, best1RM: 0, maxReps: 0 };
  }
  return {
    maxWeightKg: Math.max(...relevant.map((s) => s.weightKg)),
    best1RM: Math.max(...relevant.map((s) => estimate1RM(s.weightKg, s.reps))),
    maxReps: Math.max(...relevant.map((s) => s.reps))
  };
}

export function computeStreak(sessionDates: string[], today: Date = new Date()): number {
  const uniqueDates = Array.from(new Set(sessionDates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const toUtcMidnight = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dayMs = 24 * 60 * 60 * 1000;

  const mostRecent = toUtcMidnight(new Date(uniqueDates[0] + "T00:00:00Z"));
  const todayMidnight = toUtcMidnight(today);
  const gapFromToday = (todayMidnight - mostRecent) / dayMs;

  if (gapFromToday > 1) return 0;

  let streak = 1;
  let cursor = mostRecent;
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayMidnight = toUtcMidnight(new Date(uniqueDates[i] + "T00:00:00Z"));
    if (cursor - dayMidnight === dayMs) {
      streak++;
      cursor = dayMidnight;
    } else {
      break;
    }
  }
  return streak;
}
