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
      <Card variant="emphasis" revealDelayMs={revealDelayMs} className="text-sm text-slate-400">
        No PRs yet — log some sets to start building your board.
      </Card>
    );
  }

  return (
    <Card variant="emphasis" revealDelayMs={revealDelayMs}>
      <h2 className="mb-3 font-semibold">PR board</h2>
      <div className="space-y-1">
        {rows.map(({ exercise, prs }) => (
          <div
            key={exercise.id}
            className="flex items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm transition-colors duration-200 hover:bg-slate-900/40"
          >
            <span className="flex items-center gap-2 min-w-0">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: MUSCLE_GROUP_COLORS[exercise.muscleGroup] }}
                aria-hidden="true"
              />
              <span className="truncate">{exercise.name}</span>
            </span>
            <span className="shrink-0 whitespace-nowrap text-slate-400">
              {prs.maxWeightKg}kg · 1RM {prs.best1RM.toFixed(1)}kg · {prs.maxReps} reps
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
