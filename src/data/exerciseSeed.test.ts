import { describe, it, expect, beforeEach } from "vitest";
import { exerciseSeed, seedExercises } from "./exerciseSeed";
import { db } from "../db/schema";
import type { MuscleGroup } from "../db/types";

beforeEach(async () => {
  await db.exercises.clear();
});

describe("exerciseSeed data", () => {
  it("has at least 70 exercises", () => {
    expect(exerciseSeed.length).toBeGreaterThanOrEqual(70);
  });

  it("covers every muscle group", () => {
    const groups: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
    for (const g of groups) {
      expect(exerciseSeed.some((e) => e.muscleGroup === g)).toBe(true);
    }
  });

  it("has no duplicate names", () => {
    const names = exerciseSeed.map((e) => e.name);
    expect(new Set(names).size).toBe(names.length);
  });
});

describe("seedExercises", () => {
  it("populates the exercises table with isCustom: false", async () => {
    await seedExercises(db);
    const all = await db.exercises.toArray();
    expect(all.length).toBe(exerciseSeed.length);
    expect(all.every((e) => e.isCustom === false)).toBe(true);
  });

  it("does not duplicate rows if run twice", async () => {
    await seedExercises(db);
    await seedExercises(db);
    const all = await db.exercises.toArray();
    expect(all.length).toBe(exerciseSeed.length);
  });

  it("does not duplicate rows when called concurrently (e.g. StrictMode double effect)", async () => {
    await Promise.all([seedExercises(db), seedExercises(db)]);
    const all = await db.exercises.toArray();
    expect(all.length).toBe(exerciseSeed.length);
  });
});
