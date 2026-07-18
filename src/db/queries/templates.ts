import { db } from "../schema";
import type { Template } from "../types";
import { startSession } from "./sessions";

export async function listTemplates(): Promise<Template[]> {
  return db.templates.orderBy("name").toArray();
}

export async function saveTemplate(input: Omit<Template, "id">): Promise<number> {
  return db.templates.add(input);
}

export async function deleteTemplate(id: number): Promise<void> {
  await db.templates.delete(id);
}

export async function startSessionFromTemplate(template: Template): Promise<number> {
  return startSession(template.name, template.id);
}
