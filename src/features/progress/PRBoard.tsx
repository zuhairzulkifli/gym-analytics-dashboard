import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computePRs } from "../../utils/calculations";
import type { Exercise, WorkoutSet } from "../../db/types";

export default function PRBoard() {
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
    return <Card className="text-sm text-slate-400">No PRs yet — log some sets first.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">PR board</h2>
      <div className="space-y-2 text-sm">
        {rows.map(({ exercise, prs }) => (
          <div key={exercise.id} className="flex items-center justify-between">
            <span>{exercise.name}</span>
            <span className="text-slate-400">
              {prs.maxWeightKg}kg · est. 1RM {prs.best1RM.toFixed(1)}kg · {prs.maxReps} reps
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
