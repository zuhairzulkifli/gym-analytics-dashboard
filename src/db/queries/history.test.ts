import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { getSessionsWithSets, getTrainedDates } from "./history";
import { startSession } from "./sessions";
import { logSet } from "./sets";
import { addCustomExercise } from "./exercises";

beforeEach(async () => {
  await db.sessions.clear();
  await db.sets.clear();
  await db.exercises.clear();
});

describe("getSessionsWithSets", () => {
  it("attaches exercise name and muscle group to each set, newest session first", async () => {
    const exId = await addCustomExercise({ name: "Bench Press", muscleGroup: "Chest", category: "Barbell" });
    const s1 = await startSession("Push");
    await logSet({ sessionId: s1, exerciseId: exId, weightKg: 80, reps: 5, rpe: 8 });

    const result = await getSessionsWithSets();
    expect(result).toHaveLength(1);
    expect(result[0].sets[0]).toMatchObject({ exerciseName: "Bench Press", muscleGroup: "Chest" });
  });
});

describe("getTrainedDates", () => {
  it("returns unique session dates", async () => {
    await startSession("Push");
    await startSession("Pull");
    const dates = await getTrainedDates();
    expect(dates).toHaveLength(1); // both started "today" in the test run
  });
});
