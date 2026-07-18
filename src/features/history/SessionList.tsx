import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { getSessionsWithSets, type SessionWithSets } from "../../db/queries/history";
import { deleteSet } from "../../db/queries/sets";
import { computeVolume } from "../../utils/calculations";

export default function SessionList() {
  const [sessions, setSessions] = useState<SessionWithSets[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const reload = () => getSessionsWithSets().then(setSessions);

  useEffect(() => {
    reload();
  }, []);

  if (sessions.length === 0) {
    return <Card className="text-sm text-slate-400">No sessions logged yet.</Card>;
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const totalVolume = session.sets.reduce((sum, s) => sum + computeVolume(s.weightKg, s.reps), 0);
        const isOpen = openId === session.id;
        return (
          <Card key={session.id}>
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenId(isOpen ? null : session.id!)}
            >
              <span className="font-semibold">
                {session.name} — {session.date}
              </span>
              <span className="text-xs text-slate-500">
                {session.sets.length} sets, {totalVolume.toFixed(0)}kg
              </span>
            </button>
            {isOpen && (
              <div className="mt-3 space-y-2">
                {session.sets.map((set) => (
                  <div key={set.id} className="flex items-center justify-between text-sm">
                    <span>
                      {set.exerciseName} ({set.muscleGroup}) — {set.weightKg}kg x {set.reps} @ RPE {set.rpe}
                    </span>
                    <button
                      className="text-xs text-red-400"
                      onClick={async () => {
                        await deleteSet(set.id!);
                        reload();
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
