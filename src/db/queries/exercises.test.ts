import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { listExercises, addCustomExercise, deleteExercise } from "./exercises";
import { logSet } from "./sets";
import { startSession } from "./sessions";

beforeEach(async () => {
  await db.exercises.clear();
  await db.sets.clear();
  await db.sessions.clear();
});

describe("addCustomExercise / listExercises", () => {
  it("adds a custom exercise flagged isCustom: true", async () => {
    const id = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const all = await listExercises();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id, name: "Zercher Squat", isCustom: true });
  });
});

describe("deleteExercise", () => {
  it("deletes an exercise with no logged sets", async () => {
    const id = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const result = await deleteExercise(id);
    expect(result).toEqual({ ok: true });
    expect(await listExercises()).toHaveLength(0);
  });

  it("refuses to delete an exercise referenced by a logged set", async () => {
    const exId = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const sessionId = await startSession("Legs");
    await logSet({ sessionId, exerciseId: exId, weightKg: 60, reps: 5, rpe: 8 });

    const result = await deleteExercise(exId);
    expect(result.ok).toBe(false);
    expect(await listExercises()).toHaveLength(1);
  });
});
