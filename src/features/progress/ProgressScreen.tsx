import OneRepMaxChart from "./OneRepMaxChart";
import VolumeChart from "./VolumeChart";
import MuscleHeatmap from "./MuscleHeatmap";
import PRBoard from "./PRBoard";

export default function ProgressScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Progress</h1>
      <PRBoard />
      <OneRepMaxChart />
      <VolumeChart />
      <MuscleHeatmap />
    </div>
  );
}
