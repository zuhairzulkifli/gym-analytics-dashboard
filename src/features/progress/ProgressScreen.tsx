import OneRepMaxChart from "./OneRepMaxChart";
import VolumeChart from "./VolumeChart";
import MuscleHeatmap from "./MuscleHeatmap";
import PRBoard from "./PRBoard";
import Card from "../../components/Card";
import MeasurementForm from "../measurements/MeasurementForm";
import MeasurementTrendChart from "../measurements/MeasurementTrendChart";
import GoalForm from "../goals/GoalForm";
import GoalProgressList from "../goals/GoalProgressList";
import { useState } from "react";

export default function ProgressScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Progress</h1>
      <PRBoard />
      <OneRepMaxChart />
      <VolumeChart />
      <MuscleHeatmap />
      <Card>
        <h2 className="mb-2 font-semibold">Log a measurement</h2>
        <MeasurementForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </Card>
      <div key={`m-${refreshKey}`}>
        <MeasurementTrendChart type="bodyweight" />
      </div>
      <Card>
        <h2 className="mb-2 font-semibold">Set a goal</h2>
        <GoalForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </Card>
      <div key={`g-${refreshKey}`}>
        <GoalProgressList />
      </div>
    </div>
  );
}
