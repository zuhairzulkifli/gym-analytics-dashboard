import { useEffect, useState } from "react";
import type { Exercise, TemplateItem } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";
import { saveTemplate } from "../../db/queries/templates";

export default function TemplateForm({ onSaved }: { onSaved: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);

  useEffect(() => {
    listExercises().then(setExercises);
  }, []);

  const addItem = () => {
    if (exercises.length === 0) return;
    setItems([...items, { exerciseId: exercises[0].id!, targetSets: 3, targetReps: 8 }]);
  };

  const updateItem = (index: number, patch: Partial<TemplateItem>) => {
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!name || items.length === 0) return;
    await saveTemplate({ name, items });
    setName("");
    setItems([]);
    onSaved();
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-lg bg-surface-card px-3 py-2 text-sm"
        placeholder="Template name (e.g. Push Day)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            className="flex-1 rounded-lg bg-surface-card px-2 py-1 text-xs"
            value={item.exerciseId}
            onChange={(e) => updateItem(i, { exerciseId: Number(e.target.value) })}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="w-14 rounded-lg bg-surface-card px-2 py-1 text-xs"
            value={item.targetSets}
            onChange={(e) => updateItem(i, { targetSets: Number(e.target.value) })}
          />
          <span className="text-xs text-ink-muted">x</span>
          <input
            type="number"
            className="w-14 rounded-lg bg-surface-card px-2 py-1 text-xs"
            value={item.targetReps}
            onChange={(e) => updateItem(i, { targetReps: Number(e.target.value) })}
          />
          <button onClick={() => removeItem(i)} className="text-xs text-danger">
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={addItem}
        className="w-full rounded-lg bg-surface-card py-2 text-xs transition-colors duration-200 hover:bg-surface-raised"
      >
        + Add exercise
      </button>
      <button
        onClick={handleSave}
        className="w-full rounded-lg bg-accent py-2 text-sm font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
      >
        Save template
      </button>
    </div>
  );
}
