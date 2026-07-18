import { useState } from "react";
import type { MeasurementType } from "../../db/types";
import { logMeasurement } from "../../db/queries/measurements";

const TYPES: { value: MeasurementType; label: string; unit: string }[] = [
  { value: "bodyweight", label: "Bodyweight", unit: "kg" },
  { value: "waist", label: "Waist", unit: "cm" },
  { value: "chest", label: "Chest", unit: "cm" },
  { value: "arms", label: "Arms", unit: "cm" },
  { value: "thighs", label: "Thighs", unit: "cm" }
];

export default function MeasurementForm({ onSaved }: { onSaved: () => void }) {
  const [type, setType] = useState<MeasurementType>("bodyweight");
  const [value, setValue] = useState(0);

  const selectedUnit = TYPES.find((t) => t.value === type)?.unit ?? "cm";

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await logMeasurement({
          date: new Date().toISOString().slice(0, 10),
          type,
          value,
          unit: selectedUnit
        });
        setValue(0);
        onSaved();
      }}
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as MeasurementType)}
        className="rounded-lg bg-slate-800 px-2 py-2 text-sm"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        step={0.1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-24 rounded-lg bg-slate-800 px-2 py-2 text-sm"
      />
      <span className="pb-2 text-xs text-slate-500">{selectedUnit}</span>
      <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold">
        Log
      </button>
    </form>
  );
}
