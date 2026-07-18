export type MuscleGroup = "Chest" | "Back" | "Legs" | "Shoulders" | "Arms" | "Core";
export type ExerciseCategory = "Barbell" | "Dumbbell" | "Machine" | "Cable" | "Bodyweight";

export interface Exercise {
  id?: number;
  name: string;
  muscleGroup: MuscleGroup;
  category: ExerciseCategory;
  isCustom: boolean;
}

export interface WorkoutSession {
  id?: number;
  name: string;
  date: string; // ISO yyyy-MM-dd
  startedAt: string; // ISO datetime
  endedAt: string | null;
  notes: string;
  templateId?: number;
}

export interface WorkoutSet {
  id?: number;
  sessionId: number;
  exerciseId: number;
  weightKg: number;
  reps: number;
  rpe: number;
  order: number;
  createdAt: string; // ISO datetime
}

export interface TemplateItem {
  exerciseId: number;
  targetSets: number;
  targetReps: number;
  targetWeightKg?: number;
}

export interface Template {
  id?: number;
  name: string;
  items: TemplateItem[];
}

export type MeasurementType = "bodyweight" | "waist" | "chest" | "arms" | "thighs" | "custom";

export interface Measurement {
  id?: number;
  date: string; // ISO yyyy-MM-dd
  type: MeasurementType;
  label?: string; // used when type === "custom"
  value: number;
  unit: string;
}

export type GoalType = "exercise1RM" | "exerciseWeight" | "frequency" | "bodyweight";

export interface Goal {
  id?: number;
  type: GoalType;
  exerciseId?: number;
  targetValue: number;
  targetDate?: string; // ISO yyyy-MM-dd
  createdAt: string;
  achievedAt: string | null;
}

export interface AppSettings {
  id?: number; // always 1, singleton
  weightUnit: "kg" | "lb";
  restTimerDefaultSeconds: number;
}
