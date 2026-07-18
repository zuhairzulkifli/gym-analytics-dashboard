import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { listTemplates, saveTemplate, deleteTemplate, startSessionFromTemplate } from "./templates";
import { addCustomExercise } from "./exercises";
import { getSession } from "./sessions";

beforeEach(async () => {
  await db.templates.clear();
  await db.sessions.clear();
  await db.exercises.clear();
});

describe("saveTemplate / listTemplates", () => {
  it("persists a template with its items", async () => {
    const exId = await addCustomExercise({ name: "Bench Press", muscleGroup: "Chest", category: "Barbell" });
    await saveTemplate({ name: "Push Day", items: [{ exerciseId: exId, targetSets: 3, targetReps: 8 }] });

    const templates = await listTemplates();
    expect(templates).toHaveLength(1);
    expect(templates[0].items).toHaveLength(1);
  });
});

describe("deleteTemplate", () => {
  it("removes the template", async () => {
    const id = await saveTemplate({ name: "Push Day", items: [] });
    await deleteTemplate(id);
    expect(await listTemplates()).toHaveLength(0);
  });
});

describe("startSessionFromTemplate", () => {
  it("creates a session named after the template", async () => {
    const template = { id: 1, name: "Push Day", items: [] };
    const sessionId = await startSessionFromTemplate(template);
    const session = await getSession(sessionId);
    expect(session?.name).toBe("Push Day");
    expect(session?.templateId).toBe(1);
  });
});
