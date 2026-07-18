import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { listGoals, deleteGoal } from "../../db/queries/goals";
import { listExercises } from "../../db/queries/exercises";
import { getAllSets } from "../../db/queries/sets";
import { listMeasurements } from "../../db/queries/measurements";
import { computeGoalProgress } from "../../utils/goalProgress";
import type { Goal, Exercise } from "../../db/types";
import { subDays } from "date-fns";

export default function GoalProgressList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState<Map<number, { current: number; target: number; percent: number }>>(new Map());

  const reload = async () => {
    const [g, ex, sets, measurements] = await Promise.all([
      listGoals(),
      listExercises(),
      getAllSets(),
      listMeasurements()
    ]);
    setGoals(g);
    setExercises(ex);

    const sevenDaysAgo = subDays(new Date(), 7);
    const sessionCountLast7Days = new Set(
      sets.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).map((s) => s.sessionId)
    ).size;

    const map = new Map<number, { current: number; target: number; percent: number }>();
    for (const goal of g) {
      map.set(goal.id!, computeGoalProgress(goal, { sets, measurements, sessionCountLast7Days }));
    }
    setProgress(map);
  };

  useEffect(() => {
    reload();
  }, []);

  if (goals.length === 0) {
    return <Card className="text-sm text-slate-400">No goals set yet.</Card>;
  }

  const exerciseName = (id?: number) => exercises.find((e) => e.id === id)?.name ?? "";

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Goals</h2>
      <div className="space-y-3">
        {goals.map((goal) => {
          const p = progress.get(goal.id!) ?? { current: 0, target: goal.targetValue, percent: 0 };
          return (
            <div key={goal.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>
                  {goal.type === "frequency"
                    ? `Train ${goal.targetValue}x/week`
                    : `${exerciseName(goal.exerciseId)} → ${goal.targetValue}`}
                </span>
                <button
                  className="text-xs text-red-400"
                  onClick={async () => {
                    await deleteGoal(goal.id!);
                    reload();
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${p.percent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {p.current} / {p.target} ({p.percent}%)
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
