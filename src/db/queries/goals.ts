import { db } from "../schema";
import type { Goal } from "../types";

export async function saveGoal(input: Omit<Goal, "id" | "createdAt" | "achievedAt">): Promise<number> {
  return db.goals.add({ ...input, createdAt: new Date().toISOString(), achievedAt: null });
}

export async function listGoals(): Promise<Goal[]> {
  return db.goals.orderBy("createdAt").reverse().toArray();
}

export async function deleteGoal(id: number): Promise<void> {
  await db.goals.delete(id);
}
