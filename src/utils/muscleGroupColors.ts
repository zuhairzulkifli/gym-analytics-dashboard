import type { MuscleGroup } from "../db/types";

// Single source of truth for the muscle-group color language used across
// the Progress dashboard (PR board accents, 1RM line color, volume chart
// bars, heatmap legend) so the encoding stays consistent everywhere it
// appears instead of drifting per-component.
export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Chest: "#2563eb",
  Back: "#16a34a",
  Legs: "#dc2626",
  Shoulders: "#d97706",
  Arms: "#9333ea",
  Core: "#0891b2"
};

export const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
