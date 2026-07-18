import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computePRs } from "../../utils/calculations";
import { MUSCLE_GROUP_COLORS } from "../../utils/muscleGroupColors";
import type { Exercise, WorkoutSet } from "../../db/types";

export default function PRBoard({ revealDelayMs }: { revealDelayMs?: number }) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const rows = useMemo(() => {
    const trainedIds = new Set(sets.map((s) => s.exerciseId));
    return exercises
      .filter((e) => trainedIds.has(e.id!))
      .map((e) => ({ exercise: e, prs: computePRs(sets, e.id!) }))
      .sort((a, b) => b.prs.maxWeightKg - a.prs.maxWeightKg);
  }, [sets, exercises]);

  if (rows.length === 0) {
    return (
      <Card variant="emphasis" revealDelayMs={revealDelayMs} className="text-sm text-ink-muted">
        No PRs yet — log some sets to start building your board.
      </Card>
    );
  }

  return (
    <Card variant="emphasis" revealDelayMs={revealDelayMs}>
      <h2 className="mb-1 font-display text-lg font-semibold">PR board</h2>
      <div className="divide-y divide-surface-border">
        {rows.map(({ exercise, prs }) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between gap-3 py-3 transition-colors duration-200 hover:bg-surface/40"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: MUSCLE_GROUP_COLORS[exercise.muscleGroup] }}
                aria-hidden="true"
              />
              <span className="truncate text-sm">{exercise.name}</span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <span className="font-display text-2xl font-semibold tabular-nums">{prs.maxWeightKg}</span>
              <span className="text-xs text-ink-muted">kg</span>
              <span className="ml-2 font-display text-lg font-semibold tabular-nums text-accent-text">
                {prs.best1RM.toFixed(0)}
              </span>
              <span className="text-xs text-ink-muted">1RM</span>
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
