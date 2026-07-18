import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { startOfWeek, format } from "date-fns";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computeVolume } from "../../utils/calculations";
import type { Exercise, WorkoutSet, MuscleGroup } from "../../db/types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const COLORS: Record<MuscleGroup, string> = {
  Chest: "#2563eb",
  Back: "#16a34a",
  Legs: "#dc2626",
  Shoulders: "#d97706",
  Arms: "#9333ea",
  Core: "#0891b2"
};

export default function VolumeChart() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const chartData = useMemo(() => {
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));
    type WeekRow = { week: string } & Partial<Record<MuscleGroup, number>>;
    const byWeek = new Map<string, WeekRow>();

    for (const s of sets) {
      const ex = exerciseById.get(s.exerciseId);
      if (!ex) continue;
      const weekKey = format(startOfWeek(new Date(s.createdAt)), "yyyy-MM-dd");
      const row = byWeek.get(weekKey) ?? { week: weekKey };
      row[ex.muscleGroup] = (row[ex.muscleGroup] ?? 0) + computeVolume(s.weightKg, s.reps);
      byWeek.set(weekKey, row);
    }

    return Array.from(byWeek.values()).sort((a, b) => a.week.localeCompare(b.week));
  }, [sets, exercises]);

  if (chartData.length === 0) {
    return <Card className="text-sm text-slate-400">Log a few sets to see weekly volume.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Weekly volume per muscle group</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {MUSCLE_GROUPS.map((g) => (
            <Bar key={g} dataKey={g} stackId="a" fill={COLORS[g]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
