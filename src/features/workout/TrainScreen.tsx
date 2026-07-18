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
import type { Exercise } from "../../db/types";

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

  if (!sessionId) {
    return (
      <Card>
        <h1 className="mb-3 text-lg font-bold">Start a workout</h1>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={handleStart} className="w-full rounded-lg bg-brand py-2 font-semibold">
          ▶️ Start Workout
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <span className="font-semibold">{sessionName} in progress</span>
        <button onClick={handleEnd} className="rounded-lg bg-slate-800 px-3 py-1 text-sm">
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
