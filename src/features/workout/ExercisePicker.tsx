import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";

export default function ExercisePicker({
  onSelect
}: {
  onSelect: (exercise: Exercise) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listExercises().then(setExercises);
  }, []);

  const filtered = useMemo(
    () => exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())),
    [exercises, query]
  );

  const byCategory = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const e of filtered) {
      groups[e.category] = groups[e.category] ?? [];
      groups[e.category].push(e);
    }
    return groups;
  }, [filtered]);

  return (
    <div>
      <input
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-64 space-y-4 overflow-y-auto">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <p className="mb-1 text-xs uppercase text-slate-400">{category}</p>
            {items.map((ex) => (
              <button
                key={ex.id}
                className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-800"
                onClick={() => onSelect(ex)}
              >
                {ex.name} <span className="text-slate-400">· {ex.muscleGroup}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
