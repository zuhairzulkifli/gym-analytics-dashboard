import type { MuscleGroup } from "../db/types";

// Single source of truth for the muscle-group color language used across
// the Progress dashboard (PR board accents, 1RM line color, volume chart
// bars, heatmap legend) so the encoding stays consistent everywhere it
// appears instead of drifting per-component.
//
// Earth-tone family matching the app's warm editorial palette, each
// verified at >=3:1 against both the card (#211c15) and body (#17140f)
// backgrounds it's rendered on (WCAG 1.4.11 non-text contrast, since these
// are informational graphics — dots, chart fills — not text runs).
export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  Chest: "#c4633c", // terracotta
  Back: "#a08558", // warm olive-gold
  Legs: "#b04d38", // brick red
  Shoulders: "#c99a4a", // ochre
  Arms: "#a85c52", // dusty clay
  Core: "#7d8570" // muted sage
};

export const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
