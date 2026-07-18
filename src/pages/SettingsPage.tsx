import { useState } from "react";
import Card from "../components/Card";
import TemplateForm from "../features/templates/TemplateForm";
import TemplateList from "../features/templates/TemplateList";
import ExerciseManager from "../features/settings/ExerciseManager";
import ExportImport from "../features/settings/ExportImport";

export default function SettingsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-semibold tracking-[-0.02em]">Settings</h1>
      <Card>
        <h2 className="mb-2 font-display text-lg font-semibold">Custom exercises</h2>
        <ExerciseManager />
      </Card>
      <Card>
        <h2 className="mb-2 font-display text-lg font-semibold">Workout templates</h2>
        <TemplateForm onSaved={() => setRefreshKey((k) => k + 1)} />
        <div key={refreshKey} className="mt-4">
          <TemplateList />
        </div>
      </Card>
      <Card>
        <h2 className="mb-2 font-display text-lg font-semibold">Data</h2>
        <ExportImport />
      </Card>
    </div>
  );
}
