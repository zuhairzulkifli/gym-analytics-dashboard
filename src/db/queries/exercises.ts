import { db } from "../schema";
import type { Exercise } from "../types";

export async function listExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy("name").toArray();
}

export async function addCustomExercise(
  input: Omit<Exercise, "id" | "isCustom">
): Promise<number> {
  return db.exercises.add({ ...input, isCustom: true });
}

export async function deleteExercise(
  id: number
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const referencingSets = await db.sets.where("exerciseId").equals(id).count();
  if (referencingSets > 0) {
    return { ok: false, reason: `${referencingSets} logged set(s) use this exercise` };
  }
  await db.exercises.delete(id);
  return { ok: true };
}
