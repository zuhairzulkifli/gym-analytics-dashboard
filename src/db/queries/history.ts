import { db } from "../schema";
import type { WorkoutSession, WorkoutSet } from "../types";

export type SetWithExercise = WorkoutSet & { exerciseName: string; muscleGroup: string };
export type SessionWithSets = WorkoutSession & { sets: SetWithExercise[] };

export async function getSessionsWithSets(): Promise<SessionWithSets[]> {
  const [sessions, sets, exercises] = await Promise.all([
    db.sessions.orderBy("startedAt").reverse().toArray(),
    db.sets.toArray(),
    db.exercises.toArray()
  ]);

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const setsBySession = new Map<number, SetWithExercise[]>();

  for (const s of sets) {
    const ex = exerciseById.get(s.exerciseId);
    const enriched: SetWithExercise = {
      ...s,
      exerciseName: ex?.name ?? "Unknown exercise",
      muscleGroup: ex?.muscleGroup ?? "Unknown"
    };
    const list = setsBySession.get(s.sessionId) ?? [];
    list.push(enriched);
    setsBySession.set(s.sessionId, list);
  }

  return sessions.map((session) => ({
    ...session,
    sets: (setsBySession.get(session.id!) ?? []).sort((a, b) => a.order - b.order)
  }));
}

export async function getTrainedDates(): Promise<string[]> {
  const sessions = await db.sessions.toArray();
  return Array.from(new Set(sessions.map((s) => s.date)));
}
