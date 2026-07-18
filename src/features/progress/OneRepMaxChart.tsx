import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { estimate1RM } from "../../utils/calculations";
import { MUSCLE_GROUP_COLORS } from "../../utils/muscleGroupColors";
import type { Exercise, WorkoutSet } from "../../db/types";

export default function OneRepMaxChart({ revealDelayMs }: { revealDelayMs?: number }) {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
      const trainedIds = new Set(s.map((set) => set.exerciseId));
      const firstTrained = e.find((ex) => trainedIds.has(ex.id!));
      setSelectedId(firstTrained?.id ?? null);
    });
  }, []);

  const trainedExercises = useMemo(() => {
    const trainedIds = new Set(sets.map((s) => s.exerciseId));
    return exercises.filter((e) => trainedIds.has(e.id!));
  }, [sets, exercises]);

  const selectedExercise = trainedExercises.find((e) => e.id === selectedId);
  const lineColor = selectedExercise ? MUSCLE_GROUP_COLORS[selectedExercise.muscleGroup] : "#60a5fa";

  const chartData = useMemo(() => {
    if (!selectedId) return [];
    const byDate = new Map<string, number>();
    for (const s of sets.filter((s) => s.exerciseId === selectedId)) {
      const date = s.createdAt.slice(0, 10);
      const rm = estimate1RM(s.weightKg, s.reps);
      byDate.set(date, Math.max(byDate.get(date) ?? 0, rm));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, est1rm]) => ({ date, est1rm: Number(est1rm.toFixed(1)) }));
  }, [sets, selectedId]);

  if (trainedExercises.length === 0) {
    return (
      <Card revealDelayMs={revealDelayMs} className="text-sm text-slate-400">
        Log a few sets to see your 1RM trend.
      </Card>
    );
  }

  return (
    <Card revealDelayMs={revealDelayMs}>
      <h2 className="mb-2 font-semibold">Estimated 1RM trend</h2>
      <select
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm transition-colors duration-200"
      >
        {trainedExercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="est1rm"
            stroke={lineColor}
            strokeWidth={2.5}
            dot={false}
            animationDuration={600}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
