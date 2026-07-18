import { useState } from "react";
import OneRepMaxChart from "./OneRepMaxChart";
import VolumeChart from "./VolumeChart";
import MuscleHeatmap from "./MuscleHeatmap";
import PRBoard from "./PRBoard";
import Card from "../../components/Card";
import MeasurementForm from "../measurements/MeasurementForm";
import MeasurementTrendChart from "../measurements/MeasurementTrendChart";
import GoalForm from "../goals/GoalForm";
import GoalProgressList from "../goals/GoalProgressList";

// Staggered in reading order: the heatmap (always meaningful, even empty)
// leads, related pairs (PR board + trend, form + its own feedback) share a
// row instead of stacking as one undifferentiated column.
const STAGGER_MS = 70;

export default function ProgressScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Progress</h1>

      <MuscleHeatmap revealDelayMs={0} />

      <div className="grid gap-4 md:grid-cols-2">
        <PRBoard revealDelayMs={STAGGER_MS} />
        <OneRepMaxChart revealDelayMs={STAGGER_MS * 2} />
      </div>

      <VolumeChart revealDelayMs={STAGGER_MS * 3} />

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="subtle" revealDelayMs={STAGGER_MS * 4}>
          <h2 className="mb-2 font-semibold">Log a measurement</h2>
          <MeasurementForm onSaved={() => setRefreshKey((k) => k + 1)} />
        </Card>
        <div key={`m-${refreshKey}`}>
          <MeasurementTrendChart type="bodyweight" revealDelayMs={STAGGER_MS * 5} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card variant="subtle" revealDelayMs={STAGGER_MS * 6}>
          <h2 className="mb-2 font-semibold">Set a goal</h2>
          <GoalForm onSaved={() => setRefreshKey((k) => k + 1)} />
        </Card>
        <div key={`g-${refreshKey}`}>
          <GoalProgressList revealDelayMs={STAGGER_MS * 7} />
        </div>
      </div>
    </div>
  );
}
