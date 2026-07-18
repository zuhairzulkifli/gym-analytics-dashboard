import { useEffect, useState } from "react";
import type { Exercise, GoalType } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";
import { saveGoal } from "../../db/queries/goals";

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "exerciseWeight", label: "Lift a weight" },
  { value: "exercise1RM", label: "Reach an estimated 1RM" },
  { value: "bodyweight", label: "Reach a bodyweight" },
  { value: "frequency", label: "Train N times a week" }
];

export default function GoalForm({ onSaved }: { onSaved: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [type, setType] = useState<GoalType>("exerciseWeight");
  const [exerciseId, setExerciseId] = useState<number | undefined>(undefined);
  const [targetValue, setTargetValue] = useState(0);

  useEffect(() => {
    listExercises().then((all) => {
      setExercises(all);
      setExerciseId(all[0]?.id);
    });
  }, []);

  const needsExercise = type === "exerciseWeight" || type === "exercise1RM";

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await saveGoal({
          type,
          exerciseId: needsExercise ? exerciseId : undefined,
          targetValue
        });
        setTargetValue(0);
        onSaved();
      }}
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as GoalType)}
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      >
        {GOAL_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {needsExercise && (
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(Number(e.target.value))}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="number"
        placeholder="Target value"
        value={targetValue}
        onChange={(e) => setTargetValue(Number(e.target.value))}
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      />
      <button type="submit" className="w-full rounded-lg bg-brand py-2 text-sm font-semibold">
        Save goal
      </button>
    </form>
  );
}
