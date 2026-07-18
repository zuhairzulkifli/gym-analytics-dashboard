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
        {exercise.name} <span className="text-ink-muted">· {exercise.muscleGroup}</span>
      </p>
      <label className="block text-xs text-ink-muted">
        Weight (kg)
        <input
          type="number"
          step={0.5}
          min={0}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-surface-card px-3 py-2 text-sm text-ink transition-colors duration-200"
        />
      </label>
      <label className="block text-xs text-ink-muted">
        Reps
        <input
          type="number"
          step={1}
          min={1}
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-surface-card px-3 py-2 text-sm text-ink transition-colors duration-200"
        />
      </label>
      <label className="block text-xs text-ink-muted">
        RPE
        <select
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-surface-card px-3 py-2 text-sm text-ink transition-colors duration-200"
        >
          {RPE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg bg-surface-card py-2 text-sm transition-colors duration-200 hover:bg-surface-raised"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
        >
          Log set
        </button>
      </div>
    </form>
  );
}
