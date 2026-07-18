import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { logSet, deleteSet, getSetsForSession, getAllSets } from "./sets";
import { startSession } from "./sessions";
import { addCustomExercise } from "./exercises";

beforeEach(async () => {
  await db.sessions.clear();
  await db.sets.clear();
  await db.exercises.clear();
});

describe("logSet", () => {
  it("assigns increasing order within a session", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    const sets = await getSetsForSession(sessionId);
    expect(sets.map((s) => s.order)).toEqual([0, 1]);
  });
});

describe("deleteSet", () => {
  it("removes only the targeted set", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    const id1 = await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    await deleteSet(id1);

    const remaining = await getAllSets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].weightKg).toBe(55);
  });
});
