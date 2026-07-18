import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { startSession, endSession, getSession, deleteSession } from "./sessions";
import { logSet } from "./sets";
import { addCustomExercise } from "./exercises";

beforeEach(async () => {
  await db.sessions.clear();
  await db.sets.clear();
  await db.exercises.clear();
});

describe("startSession / endSession", () => {
  it("creates an open session and can close it", async () => {
    const id = await startSession("Push");
    let session = await getSession(id);
    expect(session?.name).toBe("Push");
    expect(session?.endedAt).toBeNull();

    await endSession(id);
    session = await getSession(id);
    expect(session?.endedAt).not.toBeNull();
  });
});

describe("deleteSession", () => {
  it("cascades to delete all sets belonging to the session", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    await deleteSession(sessionId);

    expect(await db.sessions.get(sessionId)).toBeUndefined();
    expect(await db.sets.where("sessionId").equals(sessionId).count()).toBe(0);
  });
});
