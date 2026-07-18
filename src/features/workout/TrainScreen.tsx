import { useState } from "react";
import Card from "../../components/Card";
import ExercisePicker from "./ExercisePicker";
import SetLogForm from "./SetLogForm";
import RestTimer from "./RestTimer";
import { useWorkoutStore } from "../../store/workoutStore";
import { useToast } from "../../components/Toast";
import { startSession, endSession } from "../../db/queries/sessions";
import { logSet, getAllSets } from "../../db/queries/sets";
import { computePRs } from "../../utils/calculations";
import { ensureDefaultSettings } from "../../db/schema";
import TemplateList from "../templates/TemplateList";
import { startSessionFromTemplate } from "../../db/queries/templates";
import type { Exercise, Template } from "../../db/types";

const SESSION_TYPES = ["Upper Body", "Lower Body", "Push", "Pull", "Legs", "Full Body", "Other"];

export default function TrainScreen() {
  const { sessionId, sessionName, start, end, startRest } = useWorkoutStore();
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const { showToast } = useToast();

  const handleStart = async () => {
    const id = await startSession(sessionType);
    start(sessionType, id, new Date().toISOString());
  };

  const handleEnd = async () => {
    if (sessionId) await endSession(sessionId);
    end();
  };

  const handleLog = async (data: { weightKg: number; reps: number; rpe: number }) => {
    if (!sessionId || !activeExercise) return;
    const priorSets = await getAllSets();
    const priorPR = computePRs(priorSets, activeExercise.id!);

    await logSet({ sessionId, exerciseId: activeExercise.id!, ...data });

    if (data.weightKg > priorPR.maxWeightKg) {
      showToast(`New PR! ${activeExercise.name} — ${data.weightKg}kg`);
    } else {
      showToast(`Logged ${activeExercise.name}`);
    }

    const settings = await ensureDefaultSettings();
    startRest(settings.restTimerDefaultSeconds);
    setActiveExercise(null);
  };

  const handleStartFromTemplate = async (template: Template) => {
    const id = await startSessionFromTemplate(template);
    start(template.name, id, new Date().toISOString());
  };

  if (!sessionId) {
    return (
      <div className="space-y-4">
        <Card>
          <h1 className="mb-3 font-display text-2xl font-semibold tracking-[-0.02em]">Start a workout</h1>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="mb-3 w-full rounded-lg bg-surface-card px-3 py-2 text-sm transition-colors duration-200"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button
            onClick={handleStart}
            className="w-full rounded-lg bg-accent py-2 font-semibold text-white transition-colors duration-200 hover:bg-accent-dark"
          >
            ▶️ Start Workout
          </button>
        </Card>
        <Card>
          <h2 className="mb-2 font-display text-lg font-semibold">Or start from a template</h2>
          <TemplateList onStart={handleStartFromTemplate} />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <span className="font-semibold">{sessionName} in progress</span>
        <button
          onClick={handleEnd}
          className="rounded-lg bg-surface-card px-3 py-1 text-sm transition-colors duration-200 hover:bg-surface-raised"
        >
          ⏹️ End
        </button>
      </Card>
      <Card>
        {activeExercise ? (
          <SetLogForm exercise={activeExercise} onSubmit={handleLog} onCancel={() => setActiveExercise(null)} />
        ) : (
          <ExercisePicker onSelect={setActiveExercise} />
        )}
      </Card>
      <RestTimer />
    </div>
  );
}
