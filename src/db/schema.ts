import Dexie, { type Table } from "dexie";
import type {
  Exercise,
  WorkoutSession,
  WorkoutSet,
  Template,
  Measurement,
  Goal,
  AppSettings
} from "./types";

export class GymTrackerDB extends Dexie {
  exercises!: Table<Exercise, number>;
  sessions!: Table<WorkoutSession, number>;
  sets!: Table<WorkoutSet, number>;
  templates!: Table<Template, number>;
  measurements!: Table<Measurement, number>;
  goals!: Table<Goal, number>;
  settings!: Table<AppSettings, number>;

  constructor() {
    super("gym-tracker");
    this.version(1).stores({
      exercises: "++id, name, muscleGroup, category, isCustom",
      sessions: "++id, date",
      sets: "++id, sessionId, exerciseId, createdAt",
      templates: "++id, name",
      measurements: "++id, date, type",
      goals: "++id, type, exerciseId",
      settings: "id"
    });
  }
}

export const db = new GymTrackerDB();

export async function ensureDefaultSettings(): Promise<AppSettings> {
  const existing = await db.settings.get(1);
  if (existing) return existing;
  const defaults: AppSettings = { id: 1, weightUnit: "kg", restTimerDefaultSeconds: 90 };
  await db.settings.put(defaults);
  return defaults;
}
