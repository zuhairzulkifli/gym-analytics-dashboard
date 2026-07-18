import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../db/schema";
import { exportAllDataAsJson, importAllDataFromJson, exportSetsAsCsv } from "./backup";
import { addCustomExercise } from "../db/queries/exercises";
import { startSession } from "../db/queries/sessions";
import { logSet } from "../db/queries/sets";

beforeEach(async () => {
  await db.exercises.clear();
  await db.sessions.clear();
  await db.sets.clear();
});

describe("exportAllDataAsJson / importAllDataFromJson", () => {
  it("round-trips all table data", async () => {
    const exId = await addCustomExercise({ name: "Bench Press", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 80, reps: 5, rpe: 8 });

    const json = await exportAllDataAsJson();

    await db.exercises.clear();
    await db.sessions.clear();
    await db.sets.clear();

    await importAllDataFromJson(json);

    expect(await db.exercises.count()).toBe(1);
    expect(await db.sessions.count()).toBe(1);
    expect(await db.sets.count()).toBe(1);
  });
});

describe("exportSetsAsCsv", () => {
  it("produces a header row matching the legacy CSV schema, plus one row per set", async () => {
    const exId = await addCustomExercise({ name: "Bench Press", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 80, reps: 5, rpe: 8 });

    const csv = await exportSetsAsCsv();
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("date,exercise,weight_kg,reps,rpe,muscle_group,session_id,session_name");
    expect(lines).toHaveLength(2);
    expect(lines[1]).toContain("Bench Press");
    expect(lines[1]).toContain("80");
  });
});
