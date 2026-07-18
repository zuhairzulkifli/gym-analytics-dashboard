import type { Exercise } from "../db/types";
import type { GymTrackerDB } from "../db/schema";

type SeedExercise = Omit<Exercise, "id" | "isCustom">;

export const exerciseSeed: SeedExercise[] = [
  // Barbell
  { name: "Barbell Back Squat", muscleGroup: "Legs", category: "Barbell" },
  { name: "Barbell Front Squat", muscleGroup: "Legs", category: "Barbell" },
  { name: "Barbell Box Squat", muscleGroup: "Legs", category: "Barbell" },
  { name: "Conventional Deadlift", muscleGroup: "Back", category: "Barbell" },
  { name: "Sumo Deadlift", muscleGroup: "Back", category: "Barbell" },
  { name: "Romanian Deadlift", muscleGroup: "Legs", category: "Barbell" },
  { name: "Deficit Deadlift", muscleGroup: "Back", category: "Barbell" },
  { name: "Barbell Bench Press", muscleGroup: "Chest", category: "Barbell" },
  { name: "Incline Barbell Bench Press", muscleGroup: "Chest", category: "Barbell" },
  { name: "Decline Barbell Bench Press", muscleGroup: "Chest", category: "Barbell" },
  { name: "Close-Grip Bench Press", muscleGroup: "Arms", category: "Barbell" },
  { name: "Overhead Press (Barbell)", muscleGroup: "Shoulders", category: "Barbell" },
  { name: "Push Press", muscleGroup: "Shoulders", category: "Barbell" },
  { name: "Barbell Row", muscleGroup: "Back", category: "Barbell" },
  { name: "Pendlay Row", muscleGroup: "Back", category: "Barbell" },
  { name: "Barbell Hip Thrust", muscleGroup: "Legs", category: "Barbell" },
  { name: "Barbell Lunge", muscleGroup: "Legs", category: "Barbell" },
  { name: "Barbell Curl", muscleGroup: "Arms", category: "Barbell" },
  { name: "Barbell Shrug", muscleGroup: "Back", category: "Barbell" },
  { name: "Good Morning", muscleGroup: "Legs", category: "Barbell" },
  // Dumbbell
  { name: "Dumbbell Bench Press", muscleGroup: "Chest", category: "Dumbbell" },
  { name: "Incline Dumbbell Press", muscleGroup: "Chest", category: "Dumbbell" },
  { name: "Dumbbell Fly", muscleGroup: "Chest", category: "Dumbbell" },
  { name: "Dumbbell Shoulder Press", muscleGroup: "Shoulders", category: "Dumbbell" },
  { name: "Dumbbell Lateral Raise", muscleGroup: "Shoulders", category: "Dumbbell" },
  { name: "Dumbbell Front Raise", muscleGroup: "Shoulders", category: "Dumbbell" },
  { name: "Dumbbell Rear Delt Fly", muscleGroup: "Shoulders", category: "Dumbbell" },
  { name: "Dumbbell Row", muscleGroup: "Back", category: "Dumbbell" },
  { name: "Dumbbell Pullover", muscleGroup: "Back", category: "Dumbbell" },
  { name: "Dumbbell Romanian Deadlift", muscleGroup: "Legs", category: "Dumbbell" },
  { name: "Dumbbell Lunge", muscleGroup: "Legs", category: "Dumbbell" },
  { name: "Dumbbell Bulgarian Split Squat", muscleGroup: "Legs", category: "Dumbbell" },
  { name: "Dumbbell Goblet Squat", muscleGroup: "Legs", category: "Dumbbell" },
  { name: "Dumbbell Curl", muscleGroup: "Arms", category: "Dumbbell" },
  { name: "Hammer Curl", muscleGroup: "Arms", category: "Dumbbell" },
  { name: "Dumbbell Overhead Tricep Extension", muscleGroup: "Arms", category: "Dumbbell" },
  { name: "Dumbbell Skull Crusher", muscleGroup: "Arms", category: "Dumbbell" },
  { name: "Dumbbell Step-Up", muscleGroup: "Legs", category: "Dumbbell" },
  // Machines
  { name: "Chest Press Machine", muscleGroup: "Chest", category: "Machine" },
  { name: "Pec Deck Machine", muscleGroup: "Chest", category: "Machine" },
  { name: "Lat Pulldown", muscleGroup: "Back", category: "Machine" },
  { name: "Seated Row Machine", muscleGroup: "Back", category: "Machine" },
  { name: "T-Bar Row Machine", muscleGroup: "Back", category: "Machine" },
  { name: "Assisted Pull-up Machine", muscleGroup: "Back", category: "Machine" },
  { name: "Leg Press", muscleGroup: "Legs", category: "Machine" },
  { name: "Hack Squat Machine", muscleGroup: "Legs", category: "Machine" },
  { name: "Leg Extension", muscleGroup: "Legs", category: "Machine" },
  { name: "Leg Curl", muscleGroup: "Legs", category: "Machine" },
  { name: "Seated Calf Raise Machine", muscleGroup: "Legs", category: "Machine" },
  { name: "Standing Calf Raise Machine", muscleGroup: "Legs", category: "Machine" },
  { name: "Hip Abductor Machine", muscleGroup: "Legs", category: "Machine" },
  { name: "Hip Adductor Machine", muscleGroup: "Legs", category: "Machine" },
  { name: "Shoulder Press Machine", muscleGroup: "Shoulders", category: "Machine" },
  { name: "Reverse Pec Deck (Rear Delt)", muscleGroup: "Shoulders", category: "Machine" },
  { name: "Tricep Pushdown", muscleGroup: "Arms", category: "Machine" },
  { name: "Bicep Curl Machine", muscleGroup: "Arms", category: "Machine" },
  { name: "Ab Crunch Machine", muscleGroup: "Core", category: "Machine" },
  { name: "Torso Rotation Machine", muscleGroup: "Core", category: "Machine" },
  { name: "Smith Machine Squat", muscleGroup: "Legs", category: "Machine" },
  { name: "Smith Machine Bench Press", muscleGroup: "Chest", category: "Machine" },
  // Cable
  { name: "Cable Lateral Raise", muscleGroup: "Shoulders", category: "Cable" },
  { name: "Cable Crossover", muscleGroup: "Chest", category: "Cable" },
  { name: "Cable Row", muscleGroup: "Back", category: "Cable" },
  { name: "Cable Face Pull", muscleGroup: "Shoulders", category: "Cable" },
  { name: "Cable Curl", muscleGroup: "Arms", category: "Cable" },
  { name: "Cable Tricep Kickback", muscleGroup: "Arms", category: "Cable" },
  { name: "Cable Woodchopper", muscleGroup: "Core", category: "Cable" },
  { name: "Cable Pull-through", muscleGroup: "Legs", category: "Cable" },
  { name: "Straight Arm Pulldown", muscleGroup: "Back", category: "Cable" },
  // Bodyweight / Calisthenics
  { name: "Pull-up", muscleGroup: "Back", category: "Bodyweight" },
  { name: "Weighted Pull-up", muscleGroup: "Back", category: "Bodyweight" },
  { name: "Chin-up", muscleGroup: "Back", category: "Bodyweight" },
  { name: "Push-up", muscleGroup: "Chest", category: "Bodyweight" },
  { name: "Weighted Dip", muscleGroup: "Chest", category: "Bodyweight" },
  { name: "Dip", muscleGroup: "Chest", category: "Bodyweight" },
  { name: "Plank", muscleGroup: "Core", category: "Bodyweight" },
  { name: "Hanging Leg Raise", muscleGroup: "Core", category: "Bodyweight" },
  { name: "Sit-up", muscleGroup: "Core", category: "Bodyweight" },
  { name: "Pistol Squat", muscleGroup: "Legs", category: "Bodyweight" },
  { name: "Bodyweight Squat", muscleGroup: "Legs", category: "Bodyweight" },
  { name: "Nordic Curl", muscleGroup: "Legs", category: "Bodyweight" },
  { name: "Glute Bridge", muscleGroup: "Legs", category: "Bodyweight" },
  { name: "Inverted Row", muscleGroup: "Back", category: "Bodyweight" },
  { name: "Handstand Push-up", muscleGroup: "Shoulders", category: "Bodyweight" }
];

export async function seedExercises(db: GymTrackerDB): Promise<void> {
  // Runs the check-and-insert inside one readwrite transaction so concurrent
  // callers (e.g. React StrictMode's double effect invocation) serialize
  // instead of both observing count === 0 and double-seeding.
  await db.transaction("rw", db.exercises, async () => {
    const count = await db.exercises.count();
    if (count > 0) return;
    await db.exercises.bulkAdd(exerciseSeed.map((e) => ({ ...e, isCustom: false })));
  });
}
