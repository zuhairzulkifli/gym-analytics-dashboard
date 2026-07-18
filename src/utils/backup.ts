import { db } from "../db/schema";

interface BackupPayload {
  exercises: unknown[];
  sessions: unknown[];
  sets: unknown[];
  templates: unknown[];
  measurements: unknown[];
  goals: unknown[];
  settings: unknown[];
}

export async function exportAllDataAsJson(): Promise<string> {
  const payload: BackupPayload = {
    exercises: await db.exercises.toArray(),
    sessions: await db.sessions.toArray(),
    sets: await db.sets.toArray(),
    templates: await db.templates.toArray(),
    measurements: await db.measurements.toArray(),
    goals: await db.goals.toArray(),
    settings: await db.settings.toArray()
  };
  return JSON.stringify(payload, null, 2);
}

export async function importAllDataFromJson(json: string): Promise<void> {
  const payload = JSON.parse(json) as BackupPayload;
  await db.transaction(
    "rw",
    [db.exercises, db.sessions, db.sets, db.templates, db.measurements, db.goals, db.settings],
    async () => {
      await Promise.all([
        db.exercises.clear(),
        db.sessions.clear(),
        db.sets.clear(),
        db.templates.clear(),
        db.measurements.clear(),
        db.goals.clear(),
        db.settings.clear()
      ]);
      await Promise.all([
        db.exercises.bulkAdd(payload.exercises as never[]),
        db.sessions.bulkAdd(payload.sessions as never[]),
        db.sets.bulkAdd(payload.sets as never[]),
        db.templates.bulkAdd(payload.templates as never[]),
        db.measurements.bulkAdd(payload.measurements as never[]),
        db.goals.bulkAdd(payload.goals as never[]),
        db.settings.bulkAdd(payload.settings as never[])
      ]);
    }
  );
}

export async function exportSetsAsCsv(): Promise<string> {
  const [sets, exercises, sessions] = await Promise.all([
    db.sets.toArray(),
    db.exercises.toArray(),
    db.sessions.toArray()
  ]);
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  const header = "date,exercise,weight_kg,reps,rpe,muscle_group,session_id,session_name";
  const rows = sets.map((s) => {
    const ex = exerciseById.get(s.exerciseId);
    const session = sessionById.get(s.sessionId);
    return [
      session?.date ?? "",
      ex?.name ?? "",
      s.weightKg,
      s.reps,
      s.rpe,
      ex?.muscleGroup ?? "",
      s.sessionId,
      session?.name ?? ""
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
