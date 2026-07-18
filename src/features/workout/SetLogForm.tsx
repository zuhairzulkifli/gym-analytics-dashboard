import { useState } from "react";
import type { Exercise } from "../../db/types";

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export default function SetLogForm({
  exercise,
  onSubmit,
  onCancel
}: {
  exercise: Exercise;
  onSubmit: (data: { weightKg: number; reps: number; rpe: number }) => void;
  onCancel: () => void;
}) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(1);
  const [rpe, setRpe] = useState(8);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ weightKg: weight, reps, rpe });
      }}
    >
      <p className="text-sm font-semibold">
        {exercise.name} <span className="text-slate-400">· {exercise.muscleGroup}</span>
      </p>
      <label className="block text-xs text-slate-400">
        Weight (kg)
        <input
          type="number"
          step={0.5}
          min={0}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs text-slate-400">
        Reps
        <input
          type="number"
          step={1}
          min={1}
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs text-slate-400">
        RPE
        <select
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {RPE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-slate-800 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold">
          Log set
        </button>
      </div>
    </form>
  );
}
