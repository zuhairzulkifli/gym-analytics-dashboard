import { db } from "../schema";
import type { WorkoutSet } from "../types";

export async function logSet(
  input: Omit<WorkoutSet, "id" | "createdAt" | "order">
): Promise<number> {
  const existingCount = await db.sets.where("sessionId").equals(input.sessionId).count();
  const set: WorkoutSet = {
    ...input,
    order: existingCount,
    createdAt: new Date().toISOString()
  };
  return db.sets.add(set);
}

export async function deleteSet(id: number): Promise<void> {
  await db.sets.delete(id);
}

export async function getSetsForSession(sessionId: number): Promise<WorkoutSet[]> {
  return db.sets.where("sessionId").equals(sessionId).sortBy("order");
}

export async function getAllSets(): Promise<WorkoutSet[]> {
  return db.sets.toArray();
}
