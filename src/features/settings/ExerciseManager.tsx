import { useEffect, useState } from "react";
import type { Exercise, ExerciseCategory, MuscleGroup } from "../../db/types";
import { listExercises, addCustomExercise, deleteExercise } from "../../db/queries/exercises";
import { useToast } from "../../components/Toast";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const CATEGORIES: ExerciseCategory[] = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("Chest");
  const [category, setCategory] = useState<ExerciseCategory>("Barbell");
  const { showToast } = useToast();

  const reload = () => listExercises().then(setExercises);

  useEffect(() => {
    reload();
  }, []);

  const customExercises = exercises.filter((e) => e.isCustom);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <input
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-lg bg-slate-800 px-2 py-2 text-sm"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="flex-1 rounded-lg bg-slate-800 px-2 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded-lg bg-brand py-2 text-sm font-semibold"
          onClick={async () => {
            if (!name) return;
            await addCustomExercise({ name, muscleGroup, category });
            setName("");
            reload();
          }}
        >
          + Add custom exercise
        </button>
      </div>
      {customExercises.length === 0 ? (
        <p className="text-sm text-slate-400">No custom exercises yet.</p>
      ) : (
        <div className="space-y-1">
          {customExercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
              <span>
                {ex.name} <span className="text-slate-500">· {ex.muscleGroup}</span>
              </span>
              <button
                className="text-xs text-red-400"
                onClick={async () => {
                  const result = await deleteExercise(ex.id!);
                  if (!result.ok) {
                    showToast(`Can't delete: ${result.reason}`);
                    return;
                  }
                  reload();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
