import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import { getTrainedDates } from "../../db/queries/history";
import { computeStreak, computePRs } from "../../utils/calculations";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { listTemplates, startSessionFromTemplate } from "../../db/queries/templates";
import { useWorkoutStore } from "../../store/workoutStore";
import type { Template, Exercise, WorkoutSet } from "../../db/types";
import { subDays } from "date-fns";

export default function TodayScreen() {
  const navigate = useNavigate();
  const start = useWorkoutStore((s) => s.start);
  const [streak, setStreak] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentPRs, setRecentPRs] = useState<{ exercise: Exercise; weightKg: number }[]>([]);

  useEffect(() => {
    Promise.all([getTrainedDates(), listTemplates(), getAllSets(), listExercises()]).then(
      ([dates, tpls, sets, exercises]) => {
        setStreak(computeStreak(dates));
        setTemplates(tpls);

        const sevenDaysAgo = subDays(new Date(), 7);
        const recentSets = sets.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
        const prsHit: { exercise: Exercise; weightKg: number }[] = [];
        const seen = new Set<number>();
        for (const s of recentSets as WorkoutSet[]) {
          if (seen.has(s.exerciseId)) continue;
          const priorAndCurrent = sets.filter((x) => x.exerciseId === s.exerciseId);
          const pr = computePRs(priorAndCurrent, s.exerciseId);
          if (pr.maxWeightKg === s.weightKg) {
            const exercise = exercises.find((e) => e.id === s.exerciseId);
            if (exercise) {
              prsHit.push({ exercise, weightKg: s.weightKg });
              seen.add(s.exerciseId);
            }
          }
        }
        setRecentPRs(prsHit.slice(0, 5));
      }
    );
  }, []);

  const handleStartFromTemplate = async (template: Template) => {
    const id = await startSessionFromTemplate(template);
    start(template.name, id, new Date().toISOString());
    navigate("/train");
  };

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">Welcome back</h1>
      <Card className="flex items-center justify-between">
        <span className="text-sm text-ink-muted">Current streak</span>
        <span className="text-lg font-semibold text-accent-text">🔥 {streak} days</span>
      </Card>
      <Card>
        <button
          onClick={() => navigate("/train")}
          className="w-full rounded-lg bg-accent py-2 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
        >
          ▶️ Start a workout
        </button>
      </Card>
      {templates.length > 0 && (
        <Card>
          <h2 className="mb-2 font-display text-lg font-semibold">Quick start from template</h2>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleStartFromTemplate(t)}
                className="block w-full rounded-lg bg-surface-card px-3 py-2 text-left text-sm transition-colors duration-200 hover:bg-surface-raised"
              >
                {t.name} <span className="text-ink-muted">· {t.items.length} exercises</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <h2 className="mb-2 font-display text-lg font-semibold">Recent PRs</h2>
        {recentPRs.length === 0 ? (
          <p className="text-sm text-ink-muted">No PRs in the last 7 days yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentPRs.map(({ exercise, weightKg }) => (
              <li key={exercise.id}>
                🏆 {exercise.name} — {weightKg}kg
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
