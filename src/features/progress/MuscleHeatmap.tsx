import { useEffect, useMemo, useState } from "react";
import { subDays } from "date-fns";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computeVolume } from "../../utils/calculations";
import { volumeToHex } from "../../utils/heatmapColor";
import type { Exercise, WorkoutSet, MuscleGroup } from "../../db/types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const WINDOWS = [
  { label: "This Week (last 7 days)", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "All Time", days: null as number | null }
];

export default function MuscleHeatmap() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [windowIdx, setWindowIdx] = useState(0);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const volumeByGroup = useMemo(() => {
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));
    const days = WINDOWS[windowIdx].days;
    const cutoff = days ? subDays(new Date(), days) : null;

    const result: Record<MuscleGroup, number> = {
      Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0
    };
    for (const s of sets) {
      if (cutoff && new Date(s.createdAt) < cutoff) continue;
      const ex = exerciseById.get(s.exerciseId);
      if (!ex) continue;
      result[ex.muscleGroup] += computeVolume(s.weightKg, s.reps);
    }
    return result;
  }, [sets, exercises, windowIdx]);

  const maxVolume = Math.max(...Object.values(volumeByGroup));
  const color = (g: MuscleGroup) => volumeToHex(volumeByGroup[g], maxVolume);

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Muscle group heatmap</h2>
      <select
        value={windowIdx}
        onChange={(e) => setWindowIdx(Number(e.target.value))}
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      >
        {WINDOWS.map((w, i) => (
          <option key={w.label} value={i}>
            {w.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 460 280" className="w-full max-w-md">
        <text x="100" y="18" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#cbd5e1">FRONT</text>
        <circle cx="100" cy="42" r="20" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="64" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="136" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="72" y="68" width="56" height="42" rx="8" fill={color("Chest")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="76" y="108" width="48" height="36" rx="6" fill={color("Core")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="40" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="143" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="74" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="104" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />

        <text x="360" y="18" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#cbd5e1">BACK</text>
        <circle cx="360" cy="42" r="20" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="324" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="396" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="332" y="68" width="56" height="76" rx="8" fill={color("Back")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="300" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="403" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="334" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="364" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        {MUSCLE_GROUPS.map((g) => `${g}: ${volumeByGroup[g].toFixed(0)}kg`).join(" • ")}
      </p>
    </Card>
  );
}
