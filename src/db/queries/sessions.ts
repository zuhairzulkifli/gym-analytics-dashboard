import { db } from "../schema";
import type { WorkoutSession } from "../types";

export async function startSession(name: string, templateId?: number): Promise<number> {
  const now = new Date();
  const session: WorkoutSession = {
    name,
    date: now.toISOString().slice(0, 10),
    startedAt: now.toISOString(),
    endedAt: null,
    notes: "",
    templateId
  };
  return db.sessions.add(session);
}

export async function endSession(sessionId: number): Promise<void> {
  await db.sessions.update(sessionId, { endedAt: new Date().toISOString() });
}

export async function getSession(id: number): Promise<WorkoutSession | undefined> {
  return db.sessions.get(id);
}

export async function deleteSession(id: number): Promise<void> {
  await db.transaction("rw", db.sessions, db.sets, async () => {
    await db.sets.where("sessionId").equals(id).delete();
    await db.sessions.delete(id);
  });
}

export async function listSessions(): Promise<WorkoutSession[]> {
  return db.sessions.orderBy("startedAt").reverse().toArray();
}
