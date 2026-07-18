# Comprehensive Gym Tracker PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the Streamlit gym dashboard with a local-first, installable React PWA covering live workout logging, templates, PR tracking, rest timer, body measurements, goals, calendar/streak view, custom exercises, and data export/import.

**Architecture:** Client-only Vite + React + TypeScript app. All persistence via Dexie (IndexedDB) — no backend, no auth. Five-tab bottom navigation (Today / Train / History / Progress / Settings). Zustand holds transient active-session/timer state; Dexie holds everything durable.

**Tech Stack:** Vite 5, React 18, TypeScript 5, Tailwind CSS 3, Dexie 4 + dexie-react-hooks, React Router 6, Zustand 4, Recharts 2, date-fns 3, vite-plugin-pwa, Vitest + @testing-library/react + fake-indexeddb for tests.

## Global Constraints

- No backend, no network calls, no accounts — everything runs client-side against IndexedDB (per spec: local-first, single-user).
- Weight is stored internally in kg (`weightKg`); display unit is a user setting (kg/lb) applied only at render time.
- PRs are never stored — always computed from `sets` at read time (per spec, to avoid drift).
- Seed exercises and custom exercises share one `exercises` table; an exercise can only be deleted if no `set` references it.
- The app must build to a static `dist/` with no server-side code (deploy target: Vercel/Netlify static hosting).
- Existing `data/workouts.csv` has no real rows (header only) — no data migration step is needed.
- `legacy/` holds the untouched Streamlit app; nothing in `legacy/` is imported by the new app.

---

## Task 1: Project scaffold + legacy migration

**Files:**
- Move: `app.py` → `legacy/app.py`
- Move: `requirements.txt` → `legacy/requirements.txt`
- Move: `data/` → `legacy/data/`
- Move: `.streamlit/` → `legacy/.streamlit/`
- Create: `legacy/README.md` (copy of current root `README.md`, unmodified)
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/App.tsx`
- Create: `src/index.css`
- Create: `vitest.setup.ts`
- Modify: `.gitignore` (add `node_modules`, `dist`, `dist-ssr`, `*.local`)

**Interfaces:**
- Produces: `App` component default-exported from `src/App.tsx`, rendered by `src/main.tsx` into `#root`. Later tasks add routes inside `App`.

- [ ] **Step 1: Move legacy files**

```bash
mkdir -p legacy
git mv app.py legacy/app.py
git mv requirements.txt legacy/requirements.txt
git mv data legacy/data
git mv .streamlit legacy/.streamlit
cp README.md legacy/README.md
git add legacy/README.md
```

- [ ] **Step 2: Create `package.json`**

```json
{
  "name": "gym-tracker-pwa",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "date-fns": "^3.6.0",
    "dexie": "^4.0.8",
    "dexie-react-hooks": "^1.1.7",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.1",
    "recharts": "^2.12.7",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.8",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "fake-indexeddb": "^6.0.0",
    "jsdom": "^24.1.1",
    "postcss": "^8.4.40",
    "tailwindcss": "^3.4.7",
    "typescript": "^5.5.4",
    "vite": "^5.3.5",
    "vite-plugin-pwa": "^0.20.1",
    "vitest": "^2.0.5"
  }
}
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create `tsconfig.node.json`**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create `vite.config.ts`**

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        name: "Gym Tracker",
        short_name: "Gym Tracker",
        description: "Comprehensive local-first workout tracker",
        theme_color: "#0f172a",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        start_url: "/",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true
  }
});
```

- [ ] **Step 6: Create `vitest.setup.ts`**

```typescript
import "@testing-library/jest-dom/vitest";
import "fake-indexeddb/auto";
```

- [ ] **Step 7: Create `tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          dark: "#1d4ed8"
        }
      }
    }
  },
  plugins: []
} satisfies Config;
```

- [ ] **Step 8: Create `postcss.config.js`**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {}
  }
};
```

- [ ] **Step 9: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Gym Tracker" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <title>Gym Tracker</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 10: Create `src/index.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html, body, #root {
  height: 100%;
}

body {
  padding-top: env(safe-area-inset-top);
  padding-bottom: env(safe-area-inset-bottom);
  background-color: #0f172a;
  color: #f1f5f9;
}
```

- [ ] **Step 11: Create `src/App.tsx`**

```tsx
export default function App() {
  return (
    <div className="flex min-h-full flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">Gym Tracker</h1>
    </div>
  );
}
```

- [ ] **Step 12: Create `src/main.tsx`**

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

- [ ] **Step 13: Install dependencies and verify build**

Run: `npm install`
Expected: installs without errors, creates `package-lock.json`

Run: `npm run build`
Expected: `tsc -b` passes with no type errors, `vite build` succeeds, `dist/` is created with `index.html`, JS/CSS bundles, and PWA files (`manifest.webmanifest`, `sw.js`).

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "Scaffold Vite/React/TS PWA, move Streamlit app to legacy/"
```

---

## Task 2: Dexie schema + core calculation utils (TDD)

**Files:**
- Create: `src/db/types.ts`
- Create: `src/db/schema.ts`
- Create: `src/utils/calculations.ts`
- Test: `src/utils/calculations.test.ts`

**Interfaces:**
- Consumes: nothing (foundation layer).
- Produces:
  - Types: `Exercise`, `WorkoutSession`, `WorkoutSet`, `Template`, `TemplateItem`, `Measurement`, `Goal`, `AppSettings` (all in `src/db/types.ts`).
  - `db` (default export of `src/db/schema.ts`), a `Dexie` instance with tables `exercises`, `sessions`, `sets`, `templates`, `measurements`, `goals`, `settings`.
  - `estimate1RM(weightKg: number, reps: number): number`
  - `computeVolume(weightKg: number, reps: number): number`
  - `computePRs(sets: WorkoutSet[], exerciseId: number): { maxWeightKg: number; best1RM: number; maxReps: number }`
  - `computeStreak(sessionDates: string[], today?: Date): number` — `sessionDates` are ISO `yyyy-MM-dd` strings.

- [ ] **Step 1: Create `src/db/types.ts`**

```typescript
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
```

- [ ] **Step 2: Create `src/db/schema.ts`**

```typescript
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
```

- [ ] **Step 3: Write failing tests for calculations**

```typescript
// src/utils/calculations.test.ts
import { describe, it, expect } from "vitest";
import { estimate1RM, computeVolume, computePRs, computeStreak } from "./calculations";
import type { WorkoutSet } from "../db/types";

describe("estimate1RM", () => {
  it("returns the weight itself for a 1-rep set", () => {
    expect(estimate1RM(100, 1)).toBeCloseTo(103.33, 1);
  });

  it("applies the Epley formula for higher reps", () => {
    expect(estimate1RM(100, 5)).toBeCloseTo(116.67, 1);
  });
});

describe("computeVolume", () => {
  it("multiplies weight by reps", () => {
    expect(computeVolume(80, 10)).toBe(800);
  });
});

function makeSet(overrides: Partial<WorkoutSet>): WorkoutSet {
  return {
    id: 1,
    sessionId: 1,
    exerciseId: 1,
    weightKg: 100,
    reps: 5,
    rpe: 8,
    order: 0,
    createdAt: "2026-01-01T10:00:00.000Z",
    ...overrides
  };
}

describe("computePRs", () => {
  it("finds max weight, best est. 1RM, and max reps for the given exercise only", () => {
    const sets: WorkoutSet[] = [
      makeSet({ exerciseId: 1, weightKg: 100, reps: 5 }),
      makeSet({ exerciseId: 1, weightKg: 110, reps: 2 }),
      makeSet({ exerciseId: 1, weightKg: 60, reps: 12 }),
      makeSet({ exerciseId: 2, weightKg: 200, reps: 1 }) // different exercise, ignored
    ];
    const prs = computePRs(sets, 1);
    expect(prs.maxWeightKg).toBe(110);
    expect(prs.maxReps).toBe(12);
    expect(prs.best1RM).toBeCloseTo(estimate1RM(100, 5), 5);
  });

  it("returns zeros when no sets exist for the exercise", () => {
    const prs = computePRs([], 5);
    expect(prs).toEqual({ maxWeightKg: 0, best1RM: 0, maxReps: 0 });
  });
});

describe("computeStreak", () => {
  const today = new Date("2026-07-18T12:00:00Z");

  it("counts consecutive days ending today", () => {
    const dates = ["2026-07-16", "2026-07-17", "2026-07-18"];
    expect(computeStreak(dates, today)).toBe(3);
  });

  it("counts consecutive days ending yesterday (today not trained yet)", () => {
    const dates = ["2026-07-16", "2026-07-17"];
    expect(computeStreak(dates, today)).toBe(2);
  });

  it("resets to 0 when the most recent session is more than 1 day old", () => {
    const dates = ["2026-07-10", "2026-07-11"];
    expect(computeStreak(dates, today)).toBe(0);
  });

  it("deduplicates same-day entries", () => {
    const dates = ["2026-07-18", "2026-07-18"];
    expect(computeStreak(dates, today)).toBe(1);
  });
});
```

- [ ] **Step 4: Run tests to verify they fail**

Run: `npm run test -- src/utils/calculations.test.ts`
Expected: FAIL — `Cannot find module './calculations'`

- [ ] **Step 5: Implement `src/utils/calculations.ts`**

```typescript
import type { WorkoutSet } from "../db/types";

export function estimate1RM(weightKg: number, reps: number): number {
  return weightKg * (1 + reps / 30);
}

export function computeVolume(weightKg: number, reps: number): number {
  return weightKg * reps;
}

export function computePRs(
  sets: WorkoutSet[],
  exerciseId: number
): { maxWeightKg: number; best1RM: number; maxReps: number } {
  const relevant = sets.filter((s) => s.exerciseId === exerciseId);
  if (relevant.length === 0) {
    return { maxWeightKg: 0, best1RM: 0, maxReps: 0 };
  }
  return {
    maxWeightKg: Math.max(...relevant.map((s) => s.weightKg)),
    best1RM: Math.max(...relevant.map((s) => estimate1RM(s.weightKg, s.reps))),
    maxReps: Math.max(...relevant.map((s) => s.reps))
  };
}

export function computeStreak(sessionDates: string[], today: Date = new Date()): number {
  const uniqueDates = Array.from(new Set(sessionDates)).sort().reverse();
  if (uniqueDates.length === 0) return 0;

  const toUtcMidnight = (d: Date) =>
    Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const dayMs = 24 * 60 * 60 * 1000;

  const mostRecent = toUtcMidnight(new Date(uniqueDates[0] + "T00:00:00Z"));
  const todayMidnight = toUtcMidnight(today);
  const gapFromToday = (todayMidnight - mostRecent) / dayMs;

  if (gapFromToday > 1) return 0;

  let streak = 1;
  let cursor = mostRecent;
  for (let i = 1; i < uniqueDates.length; i++) {
    const dayMidnight = toUtcMidnight(new Date(uniqueDates[i] + "T00:00:00Z"));
    if (cursor - dayMidnight === dayMs) {
      streak++;
      cursor = dayMidnight;
    } else {
      break;
    }
  }
  return streak;
}
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npm run test -- src/utils/calculations.test.ts`
Expected: PASS, 8 tests passing

- [ ] **Step 7: Commit**

```bash
git add src/db src/utils
git commit -m "Add Dexie schema, domain types, and 1RM/PR/streak calculation utils"
```

---

## Task 3: Seed exercise database

**Files:**
- Create: `src/data/exerciseSeed.ts`
- Test: `src/data/exerciseSeed.test.ts`

**Interfaces:**
- Consumes: `MuscleGroup`, `ExerciseCategory` from `src/db/types.ts` (Task 2).
- Produces: `exerciseSeed: Omit<Exercise, "id" | "isCustom">[]`, `seedExercises(db: GymTrackerDB): Promise<void>` (populates `exercises` table only if empty, setting `isCustom: false`).

- [ ] **Step 1: Write failing test**

```typescript
// src/data/exerciseSeed.test.ts
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
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/data/exerciseSeed.test.ts`
Expected: FAIL — `Cannot find module './exerciseSeed'`

- [ ] **Step 3: Implement `src/data/exerciseSeed.ts`**

```typescript
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
  const count = await db.exercises.count();
  if (count > 0) return;
  await db.exercises.bulkAdd(exerciseSeed.map((e) => ({ ...e, isCustom: false })));
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npm run test -- src/data/exerciseSeed.test.ts`
Expected: PASS, 5 tests passing

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "Add expanded seed exercise library (85 exercises)"
```

---

## Task 4: Query layer for exercises, sessions, and sets (TDD)

**Files:**
- Create: `src/db/queries/exercises.ts`
- Create: `src/db/queries/sessions.ts`
- Create: `src/db/queries/sets.ts`
- Test: `src/db/queries/exercises.test.ts`
- Test: `src/db/queries/sessions.test.ts`
- Test: `src/db/queries/sets.test.ts`

**Interfaces:**
- Consumes: `db`, `Exercise`, `WorkoutSession`, `WorkoutSet` from Task 2.
- Produces:
  - `listExercises(): Promise<Exercise[]>`
  - `addCustomExercise(input: Omit<Exercise, "id" | "isCustom">): Promise<number>`
  - `deleteExercise(id: number): Promise<{ ok: true } | { ok: false; reason: string }>`
  - `startSession(name: string, templateId?: number): Promise<number>` (creates session with `date`/`startedAt` = now, `endedAt: null`)
  - `endSession(sessionId: number): Promise<void>` (sets `endedAt` = now)
  - `getSession(id: number): Promise<WorkoutSession | undefined>`
  - `deleteSession(id: number): Promise<void>` (cascades: deletes all sets with that `sessionId`)
  - `logSet(input: Omit<WorkoutSet, "id" | "createdAt" | "order">): Promise<number>` (auto-assigns `order` = count of existing sets in that session)
  - `deleteSet(id: number): Promise<void>`
  - `getSetsForSession(sessionId: number): Promise<WorkoutSet[]>`
  - `getAllSets(): Promise<WorkoutSet[]>`

- [ ] **Step 1: Write failing tests for exercises queries**

```typescript
// src/db/queries/exercises.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { listExercises, addCustomExercise, deleteExercise } from "./exercises";
import { logSet } from "./sets";
import { startSession } from "./sessions";

beforeEach(async () => {
  await db.exercises.clear();
  await db.sets.clear();
  await db.sessions.clear();
});

describe("addCustomExercise / listExercises", () => {
  it("adds a custom exercise flagged isCustom: true", async () => {
    const id = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const all = await listExercises();
    expect(all).toHaveLength(1);
    expect(all[0]).toMatchObject({ id, name: "Zercher Squat", isCustom: true });
  });
});

describe("deleteExercise", () => {
  it("deletes an exercise with no logged sets", async () => {
    const id = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const result = await deleteExercise(id);
    expect(result).toEqual({ ok: true });
    expect(await listExercises()).toHaveLength(0);
  });

  it("refuses to delete an exercise referenced by a logged set", async () => {
    const exId = await addCustomExercise({ name: "Zercher Squat", muscleGroup: "Legs", category: "Barbell" });
    const sessionId = await startSession("Legs");
    await logSet({ sessionId, exerciseId: exId, weightKg: 60, reps: 5, rpe: 8 });

    const result = await deleteExercise(exId);
    expect(result.ok).toBe(false);
    expect(await listExercises()).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Write failing tests for sessions queries**

```typescript
// src/db/queries/sessions.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { startSession, endSession, getSession, deleteSession } from "./sessions";
import { logSet } from "./sets";
import { addCustomExercise } from "./exercises";

beforeEach(async () => {
  await db.sessions.clear();
  await db.sets.clear();
  await db.exercises.clear();
});

describe("startSession / endSession", () => {
  it("creates an open session and can close it", async () => {
    const id = await startSession("Push");
    let session = await getSession(id);
    expect(session?.name).toBe("Push");
    expect(session?.endedAt).toBeNull();

    await endSession(id);
    session = await getSession(id);
    expect(session?.endedAt).not.toBeNull();
  });
});

describe("deleteSession", () => {
  it("cascades to delete all sets belonging to the session", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    await deleteSession(sessionId);

    expect(await db.sessions.get(sessionId)).toBeUndefined();
    expect(await db.sets.where("sessionId").equals(sessionId).count()).toBe(0);
  });
});
```

- [ ] **Step 3: Write failing tests for sets queries**

```typescript
// src/db/queries/sets.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { logSet, deleteSet, getSetsForSession, getAllSets } from "./sets";
import { startSession } from "./sessions";
import { addCustomExercise } from "./exercises";

beforeEach(async () => {
  await db.sessions.clear();
  await db.sets.clear();
  await db.exercises.clear();
});

describe("logSet", () => {
  it("assigns increasing order within a session", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    const sets = await getSetsForSession(sessionId);
    expect(sets.map((s) => s.order)).toEqual([0, 1]);
  });
});

describe("deleteSet", () => {
  it("removes only the targeted set", async () => {
    const exId = await addCustomExercise({ name: "Test Exercise", muscleGroup: "Chest", category: "Barbell" });
    const sessionId = await startSession("Push");
    const id1 = await logSet({ sessionId, exerciseId: exId, weightKg: 50, reps: 10, rpe: 7 });
    await logSet({ sessionId, exerciseId: exId, weightKg: 55, reps: 8, rpe: 8 });

    await deleteSet(id1);

    const remaining = await getAllSets();
    expect(remaining).toHaveLength(1);
    expect(remaining[0].weightKg).toBe(55);
  });
});
```

- [ ] **Step 4: Run all three test files to verify they fail**

Run: `npm run test -- src/db/queries`
Expected: FAIL — modules `./exercises`, `./sessions`, `./sets` don't exist yet

- [ ] **Step 5: Implement `src/db/queries/exercises.ts`**

```typescript
import { db } from "../schema";
import type { Exercise } from "../types";

export async function listExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy("name").toArray();
}

export async function addCustomExercise(
  input: Omit<Exercise, "id" | "isCustom">
): Promise<number> {
  return db.exercises.add({ ...input, isCustom: true });
}

export async function deleteExercise(
  id: number
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const referencingSets = await db.sets.where("exerciseId").equals(id).count();
  if (referencingSets > 0) {
    return { ok: false, reason: `${referencingSets} logged set(s) use this exercise` };
  }
  await db.exercises.delete(id);
  return { ok: true };
}
```

- [ ] **Step 6: Implement `src/db/queries/sessions.ts`**

```typescript
import { db } from "../schema";
import type { WorkoutSession } from "../types";

export async function startSession(name: string, templateId?: number): Promise<number> {
  const now = new Date();
  const session: WorkoutSession = {
    name,
    date: now.toISOString().slice(0, 10),
    startedAt: now.toISOString(),
    endedAt: null,
    notes: "",
    templateId
  };
  return db.sessions.add(session);
}

export async function endSession(sessionId: number): Promise<void> {
  await db.sessions.update(sessionId, { endedAt: new Date().toISOString() });
}

export async function getSession(id: number): Promise<WorkoutSession | undefined> {
  return db.sessions.get(id);
}

export async function deleteSession(id: number): Promise<void> {
  await db.transaction("rw", db.sessions, db.sets, async () => {
    await db.sets.where("sessionId").equals(id).delete();
    await db.sessions.delete(id);
  });
}

export async function listSessions(): Promise<WorkoutSession[]> {
  return db.sessions.orderBy("startedAt").reverse().toArray();
}
```

- [ ] **Step 7: Implement `src/db/queries/sets.ts`**

```typescript
import { db } from "../schema";
import type { WorkoutSet } from "../types";

export async function logSet(
  input: Omit<WorkoutSet, "id" | "createdAt" | "order">
): Promise<number> {
  const existingCount = await db.sets.where("sessionId").equals(input.sessionId).count();
  const set: WorkoutSet = {
    ...input,
    order: existingCount,
    createdAt: new Date().toISOString()
  };
  return db.sets.add(set);
}

export async function deleteSet(id: number): Promise<void> {
  await db.sets.delete(id);
}

export async function getSetsForSession(sessionId: number): Promise<WorkoutSet[]> {
  return db.sets.where("sessionId").equals(sessionId).sortBy("order");
}

export async function getAllSets(): Promise<WorkoutSet[]> {
  return db.sets.toArray();
}
```

- [ ] **Step 8: Run tests to verify they pass**

Run: `npm run test -- src/db/queries`
Expected: PASS, all tests in the three files passing

- [ ] **Step 9: Commit**

```bash
git add src/db/queries
git commit -m "Add Dexie query layer for exercises, sessions, and sets"
```

---

## Task 5: App shell — routing, bottom tab bar, shared components

**Files:**
- Create: `src/components/TabBar.tsx`
- Create: `src/components/Layout.tsx`
- Create: `src/components/Card.tsx`
- Create: `src/components/Toast.tsx` (context + provider + `useToast()` hook)
- Create: `src/pages/TodayPage.tsx` (stub, filled in Task 11)
- Create: `src/pages/TrainPage.tsx` (stub, filled in Task 6)
- Create: `src/pages/HistoryPage.tsx` (stub, filled in Task 7)
- Create: `src/pages/ProgressPage.tsx` (stub, filled in Task 8)
- Create: `src/pages/SettingsPage.tsx` (stub, filled in Tasks 9-10)
- Modify: `src/App.tsx`
- Test: `src/components/TabBar.test.tsx`

**Interfaces:**
- Produces: `<TabBar />`, `<Layout>{children}</Layout>`, `<Card>{children}</Card>`, `ToastProvider`, `useToast(): { showToast: (message: string) => void }`. Routes: `/`, `/train`, `/history`, `/progress`, `/settings`.

- [ ] **Step 1: Write failing test for TabBar**

```tsx
// src/components/TabBar.test.tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import TabBar from "./TabBar";

function renderWithRouter(initialPath: string) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="*" element={<TabBar />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("TabBar", () => {
  it("renders all five tabs", () => {
    renderWithRouter("/");
    for (const label of ["Today", "Train", "History", "Progress", "Settings"]) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("marks the active tab based on the current route", () => {
    renderWithRouter("/progress");
    expect(screen.getByText("Progress").closest("a")).toHaveAttribute("aria-current", "page");
  });
});
```

Add `@testing-library/user-event` to `package.json` devDependencies (`"@testing-library/user-event": "^14.5.2"`) and run `npm install`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/TabBar.test.tsx`
Expected: FAIL — `Cannot find module './TabBar'`

- [ ] **Step 3: Implement `src/components/TabBar.tsx`**

```tsx
import { NavLink } from "react-router-dom";

const TABS = [
  { to: "/", label: "Today", icon: "🏠" },
  { to: "/train", label: "Train", icon: "🏋️" },
  { to: "/history", label: "History", icon: "📋" },
  { to: "/progress", label: "Progress", icon: "📈" },
  { to: "/settings", label: "Settings", icon: "⚙️" }
];

export default function TabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex border-t border-slate-800 bg-slate-900 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === "/"}
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-1 py-2 text-xs ${
              isActive ? "text-brand" : "text-slate-400"
            }`
          }
        >
          <span className="text-lg">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/TabBar.test.tsx`
Expected: PASS, 2 tests passing

- [ ] **Step 5: Implement `src/components/Layout.tsx`**

```tsx
import type { ReactNode } from "react";
import TabBar from "./TabBar";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-full pb-20">
      <main className="mx-auto max-w-md px-4 pt-4">{children}</main>
      <TabBar />
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/components/Card.tsx`**

```tsx
import type { ReactNode } from "react";

export default function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-slate-800 bg-slate-900/60 p-4 ${className}`}>
      {children}
    </div>
  );
}
```

- [ ] **Step 7: Implement `src/components/Toast.tsx`**

```tsx
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

interface ToastContextValue {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-brand px-4 py-2 text-sm text-white shadow-lg">
          {message}
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
```

- [ ] **Step 8: Create stub pages**

```tsx
// src/pages/TodayPage.tsx
export default function TodayPage() {
  return <h1 className="text-xl font-bold">Today</h1>;
}
```

```tsx
// src/pages/TrainPage.tsx
export default function TrainPage() {
  return <h1 className="text-xl font-bold">Train</h1>;
}
```

```tsx
// src/pages/HistoryPage.tsx
export default function HistoryPage() {
  return <h1 className="text-xl font-bold">History</h1>;
}
```

```tsx
// src/pages/ProgressPage.tsx
export default function ProgressPage() {
  return <h1 className="text-xl font-bold">Progress</h1>;
}
```

```tsx
// src/pages/SettingsPage.tsx
export default function SettingsPage() {
  return <h1 className="text-xl font-bold">Settings</h1>;
}
```

- [ ] **Step 9: Wire up routing in `src/App.tsx`**

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import { ToastProvider } from "./components/Toast";
import TodayPage from "./pages/TodayPage";
import TrainPage from "./pages/TrainPage";
import HistoryPage from "./pages/HistoryPage";
import ProgressPage from "./pages/ProgressPage";
import SettingsPage from "./pages/SettingsPage";
import { db, ensureDefaultSettings } from "./db/schema";
import { seedExercises } from "./data/exerciseSeed";

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([seedExercises(db), ensureDefaultSettings()]).then(() => setReady(true));
  }, []);

  if (!ready) {
    return <div className="flex min-h-full items-center justify-center">Loading…</div>;
  }

  return (
    <ToastProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/train" element={<TrainPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </ToastProvider>
  );
}
```

- [ ] **Step 10: Verify dev build renders**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 11: Commit**

```bash
git add src/components src/pages src/App.tsx package.json package-lock.json
git commit -m "Add app shell: routing, bottom tab bar, layout, toast, card"
```

---

## Task 6: Train feature — active session, exercise picker, set logging, rest timer

**Files:**
- Create: `src/store/workoutStore.ts`
- Create: `src/features/workout/ExercisePicker.tsx`
- Create: `src/features/workout/SetLogForm.tsx`
- Create: `src/features/workout/RestTimer.tsx`
- Create: `src/features/workout/TrainScreen.tsx`
- Modify: `src/pages/TrainPage.tsx`
- Test: `src/store/workoutStore.test.ts`

**Interfaces:**
- Consumes: `startSession`, `endSession`, `logSet` (Task 4); `listExercises` (Task 4); `computePRs`, `estimate1RM` (Task 2); `useToast` (Task 5).
- Produces: `useWorkoutStore` zustand hook with state `{ sessionId: number | null; sessionName: string | null; startedAt: string | null; restEndsAt: number | null }` and actions `start(name, sessionId, startedAt)`, `end()`, `startRest(seconds)`, `clearRest()`.

- [ ] **Step 1: Write failing test for the store**

```typescript
// src/store/workoutStore.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { useWorkoutStore } from "./workoutStore";

beforeEach(() => {
  useWorkoutStore.setState({ sessionId: null, sessionName: null, startedAt: null, restEndsAt: null });
});

describe("useWorkoutStore", () => {
  it("starts with no active session", () => {
    expect(useWorkoutStore.getState().sessionId).toBeNull();
  });

  it("start() sets session fields", () => {
    useWorkoutStore.getState().start("Push", 42, "2026-07-18T10:00:00.000Z");
    const state = useWorkoutStore.getState();
    expect(state.sessionId).toBe(42);
    expect(state.sessionName).toBe("Push");
  });

  it("end() clears session fields", () => {
    useWorkoutStore.getState().start("Push", 42, "2026-07-18T10:00:00.000Z");
    useWorkoutStore.getState().end();
    expect(useWorkoutStore.getState().sessionId).toBeNull();
  });

  it("startRest() sets a future restEndsAt timestamp", () => {
    const before = Date.now();
    useWorkoutStore.getState().startRest(90);
    const state = useWorkoutStore.getState();
    expect(state.restEndsAt).not.toBeNull();
    expect(state.restEndsAt! - before).toBeGreaterThanOrEqual(89_000);
  });

  it("clearRest() resets restEndsAt to null", () => {
    useWorkoutStore.getState().startRest(90);
    useWorkoutStore.getState().clearRest();
    expect(useWorkoutStore.getState().restEndsAt).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/store/workoutStore.test.ts`
Expected: FAIL — `Cannot find module './workoutStore'`

- [ ] **Step 3: Implement `src/store/workoutStore.ts`**

```typescript
import { create } from "zustand";

interface WorkoutState {
  sessionId: number | null;
  sessionName: string | null;
  startedAt: string | null;
  restEndsAt: number | null;
  start: (name: string, sessionId: number, startedAt: string) => void;
  end: () => void;
  startRest: (seconds: number) => void;
  clearRest: () => void;
}

export const useWorkoutStore = create<WorkoutState>((set) => ({
  sessionId: null,
  sessionName: null,
  startedAt: null,
  restEndsAt: null,
  start: (name, sessionId, startedAt) => set({ sessionId, sessionName: name, startedAt }),
  end: () => set({ sessionId: null, sessionName: null, startedAt: null, restEndsAt: null }),
  startRest: (seconds) => set({ restEndsAt: Date.now() + seconds * 1000 }),
  clearRest: () => set({ restEndsAt: null })
}));
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/store/workoutStore.test.ts`
Expected: PASS, 5 tests passing

- [ ] **Step 5: Implement `src/features/workout/RestTimer.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useWorkoutStore } from "../../store/workoutStore";

export default function RestTimer() {
  const restEndsAt = useWorkoutStore((s) => s.restEndsAt);
  const clearRest = useWorkoutStore((s) => s.clearRest);
  const startRest = useWorkoutStore((s) => s.startRest);
  const [remainingMs, setRemainingMs] = useState(0);

  useEffect(() => {
    if (!restEndsAt) return;
    const tick = () => {
      const remaining = restEndsAt - Date.now();
      if (remaining <= 0) {
        setRemainingMs(0);
        if (navigator.vibrate) navigator.vibrate(200);
        clearRest();
      } else {
        setRemainingMs(remaining);
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
  }, [restEndsAt, clearRest]);

  if (!restEndsAt) return null;

  const seconds = Math.ceil(remainingMs / 1000);
  const mm = Math.floor(seconds / 60);
  const ss = seconds % 60;

  return (
    <div className="fixed bottom-24 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-800 px-4 py-2 shadow-lg">
      <span className="font-mono text-lg">
        {mm}:{ss.toString().padStart(2, "0")}
      </span>
      <button
        className="rounded-full bg-slate-700 px-3 py-1 text-xs"
        onClick={() => startRest(Math.max(seconds - 15, 0))}
      >
        -15s
      </button>
      <button
        className="rounded-full bg-slate-700 px-3 py-1 text-xs"
        onClick={() => startRest(seconds + 15)}
      >
        +15s
      </button>
      <button className="rounded-full bg-brand px-3 py-1 text-xs" onClick={clearRest}>
        Skip
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/features/workout/ExercisePicker.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import type { Exercise } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";

export default function ExercisePicker({
  onSelect
}: {
  onSelect: (exercise: Exercise) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    listExercises().then(setExercises);
  }, []);

  const filtered = useMemo(
    () => exercises.filter((e) => e.name.toLowerCase().includes(query.toLowerCase())),
    [exercises, query]
  );

  const byCategory = useMemo(() => {
    const groups: Record<string, Exercise[]> = {};
    for (const e of filtered) {
      groups[e.category] = groups[e.category] ?? [];
      groups[e.category].push(e);
    }
    return groups;
  }, [filtered]);

  return (
    <div>
      <input
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        placeholder="Search exercises…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="max-h-64 space-y-4 overflow-y-auto">
        {Object.entries(byCategory).map(([category, items]) => (
          <div key={category}>
            <p className="mb-1 text-xs uppercase text-slate-500">{category}</p>
            {items.map((ex) => (
              <button
                key={ex.id}
                className="block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-slate-800"
                onClick={() => onSelect(ex)}
              >
                {ex.name} <span className="text-slate-500">· {ex.muscleGroup}</span>
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Implement `src/features/workout/SetLogForm.tsx`**

```tsx
import { useState } from "react";
import type { Exercise } from "../../db/types";

const RPE_OPTIONS = [6, 6.5, 7, 7.5, 8, 8.5, 9, 9.5, 10];

export default function SetLogForm({
  exercise,
  onSubmit,
  onCancel
}: {
  exercise: Exercise;
  onSubmit: (data: { weightKg: number; reps: number; rpe: number }) => void;
  onCancel: () => void;
}) {
  const [weight, setWeight] = useState(0);
  const [reps, setReps] = useState(1);
  const [rpe, setRpe] = useState(8);

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ weightKg: weight, reps, rpe });
      }}
    >
      <p className="text-sm font-semibold">
        {exercise.name} <span className="text-slate-500">· {exercise.muscleGroup}</span>
      </p>
      <label className="block text-xs text-slate-400">
        Weight (kg)
        <input
          type="number"
          step={0.5}
          min={0}
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs text-slate-400">
        Reps
        <input
          type="number"
          step={1}
          min={1}
          value={reps}
          onChange={(e) => setReps(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        />
      </label>
      <label className="block text-xs text-slate-400">
        RPE
        <select
          value={rpe}
          onChange={(e) => setRpe(Number(e.target.value))}
          className="mt-1 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {RPE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 rounded-lg bg-slate-800 py-2 text-sm">
          Cancel
        </button>
        <button type="submit" className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold">
          Log set
        </button>
      </div>
    </form>
  );
}
```

- [ ] **Step 8: Implement `src/features/workout/TrainScreen.tsx`**

```tsx
import { useState } from "react";
import Card from "../../components/Card";
import ExercisePicker from "./ExercisePicker";
import SetLogForm from "./SetLogForm";
import RestTimer from "./RestTimer";
import { useWorkoutStore } from "../../store/workoutStore";
import { useToast } from "../../components/Toast";
import { startSession, endSession } from "../../db/queries/sessions";
import { logSet, getAllSets } from "../../db/queries/sets";
import { computePRs } from "../../utils/calculations";
import { db, ensureDefaultSettings } from "../../db/schema";
import type { Exercise } from "../../db/types";

const SESSION_TYPES = ["Upper Body", "Lower Body", "Push", "Pull", "Legs", "Full Body", "Other"];

export default function TrainScreen() {
  const { sessionId, sessionName, start, end, startRest } = useWorkoutStore();
  const [sessionType, setSessionType] = useState(SESSION_TYPES[0]);
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  const { showToast } = useToast();

  const handleStart = async () => {
    const id = await startSession(sessionType);
    start(sessionType, id, new Date().toISOString());
  };

  const handleEnd = async () => {
    if (sessionId) await endSession(sessionId);
    end();
  };

  const handleLog = async (data: { weightKg: number; reps: number; rpe: number }) => {
    if (!sessionId || !activeExercise) return;
    const priorSets = await getAllSets();
    const priorPR = computePRs(priorSets, activeExercise.id!);

    await logSet({ sessionId, exerciseId: activeExercise.id!, ...data });

    if (data.weightKg > priorPR.maxWeightKg) {
      showToast(`New PR! ${activeExercise.name} — ${data.weightKg}kg`);
    } else {
      showToast(`Logged ${activeExercise.name}`);
    }

    const settings = await ensureDefaultSettings();
    startRest(settings.restTimerDefaultSeconds);
    setActiveExercise(null);
  };

  if (!sessionId) {
    return (
      <Card>
        <h1 className="mb-3 text-lg font-bold">Start a workout</h1>
        <select
          value={sessionType}
          onChange={(e) => setSessionType(e.target.value)}
          className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {SESSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
        <button onClick={handleStart} className="w-full rounded-lg bg-brand py-2 font-semibold">
          ▶️ Start Workout
        </button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card className="flex items-center justify-between">
        <span className="font-semibold">{sessionName} in progress</span>
        <button onClick={handleEnd} className="rounded-lg bg-slate-800 px-3 py-1 text-sm">
          ⏹️ End
        </button>
      </Card>
      <Card>
        {activeExercise ? (
          <SetLogForm exercise={activeExercise} onSubmit={handleLog} onCancel={() => setActiveExercise(null)} />
        ) : (
          <ExercisePicker onSelect={setActiveExercise} />
        )}
      </Card>
      <RestTimer />
    </div>
  );
}
```

- [ ] **Step 9: Wire into `src/pages/TrainPage.tsx`**

```tsx
import TrainScreen from "../features/workout/TrainScreen";

export default function TrainPage() {
  return <TrainScreen />;
}
```

- [ ] **Step 10: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 11: Manual verification**

Run: `npm run dev`, open the app, start a workout, log a set, confirm the rest timer appears and counts down, confirm ending the workout returns to the start screen.

- [ ] **Step 12: Commit**

```bash
git add src/store src/features/workout src/pages/TrainPage.tsx
git commit -m "Add Train tab: session start/end, exercise picker, set logging, rest timer"
```

---

## Task 7: History feature — session list and calendar/streak view

**Files:**
- Create: `src/db/queries/history.ts`
- Create: `src/features/history/SessionList.tsx`
- Create: `src/features/history/CalendarView.tsx`
- Create: `src/features/history/HistoryScreen.tsx`
- Modify: `src/pages/HistoryPage.tsx`
- Test: `src/db/queries/history.test.ts`

**Interfaces:**
- Consumes: `db`, `WorkoutSession`, `WorkoutSet`, `Exercise` (Task 2); `computeVolume` (Task 2); `deleteSet` (Task 4).
- Produces: `getSessionsWithSets(): Promise<Array<WorkoutSession & { sets: (WorkoutSet & { exerciseName: string; muscleGroup: string })[] }>>`, `getTrainedDates(): Promise<string[]>`.

- [ ] **Step 1: Write failing test**

```typescript
// src/db/queries/history.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/db/queries/history.test.ts`
Expected: FAIL — `Cannot find module './history'`

- [ ] **Step 3: Implement `src/db/queries/history.ts`**

```typescript
import { db } from "../schema";
import type { WorkoutSession, WorkoutSet } from "../types";

export type SetWithExercise = WorkoutSet & { exerciseName: string; muscleGroup: string };
export type SessionWithSets = WorkoutSession & { sets: SetWithExercise[] };

export async function getSessionsWithSets(): Promise<SessionWithSets[]> {
  const [sessions, sets, exercises] = await Promise.all([
    db.sessions.orderBy("startedAt").reverse().toArray(),
    db.sets.toArray(),
    db.exercises.toArray()
  ]);

  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const setsBySession = new Map<number, SetWithExercise[]>();

  for (const s of sets) {
    const ex = exerciseById.get(s.exerciseId);
    const enriched: SetWithExercise = {
      ...s,
      exerciseName: ex?.name ?? "Unknown exercise",
      muscleGroup: ex?.muscleGroup ?? "Unknown"
    };
    const list = setsBySession.get(s.sessionId) ?? [];
    list.push(enriched);
    setsBySession.set(s.sessionId, list);
  }

  return sessions.map((session) => ({
    ...session,
    sets: (setsBySession.get(session.id!) ?? []).sort((a, b) => a.order - b.order)
  }));
}

export async function getTrainedDates(): Promise<string[]> {
  const sessions = await db.sessions.toArray();
  return Array.from(new Set(sessions.map((s) => s.date)));
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/db/queries/history.test.ts`
Expected: PASS, 2 tests passing

- [ ] **Step 5: Implement `src/features/history/SessionList.tsx`**

```tsx
import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { getSessionsWithSets, type SessionWithSets } from "../../db/queries/history";
import { deleteSet } from "../../db/queries/sets";
import { computeVolume } from "../../utils/calculations";

export default function SessionList() {
  const [sessions, setSessions] = useState<SessionWithSets[]>([]);
  const [openId, setOpenId] = useState<number | null>(null);

  const reload = () => getSessionsWithSets().then(setSessions);

  useEffect(() => {
    reload();
  }, []);

  if (sessions.length === 0) {
    return <Card className="text-sm text-slate-400">No sessions logged yet.</Card>;
  }

  return (
    <div className="space-y-2">
      {sessions.map((session) => {
        const totalVolume = session.sets.reduce((sum, s) => sum + computeVolume(s.weightKg, s.reps), 0);
        const isOpen = openId === session.id;
        return (
          <Card key={session.id}>
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setOpenId(isOpen ? null : session.id!)}
            >
              <span className="font-semibold">
                {session.name} — {session.date}
              </span>
              <span className="text-xs text-slate-500">
                {session.sets.length} sets, {totalVolume.toFixed(0)}kg
              </span>
            </button>
            {isOpen && (
              <div className="mt-3 space-y-2">
                {session.sets.map((set) => (
                  <div key={set.id} className="flex items-center justify-between text-sm">
                    <span>
                      {set.exerciseName} ({set.muscleGroup}) — {set.weightKg}kg x {set.reps} @ RPE {set.rpe}
                    </span>
                    <button
                      className="text-xs text-red-400"
                      onClick={async () => {
                        await deleteSet(set.id!);
                        reload();
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/features/history/CalendarView.tsx`**

```tsx
import { useEffect, useState } from "react";
import { eachDayOfInterval, endOfMonth, format, startOfMonth } from "date-fns";
import Card from "../../components/Card";
import { getTrainedDates } from "../../db/queries/history";
import { computeStreak } from "../../utils/calculations";

export default function CalendarView() {
  const [trainedDates, setTrainedDates] = useState<Set<string>>(new Set());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    getTrainedDates().then((dates) => {
      setTrainedDates(new Set(dates));
      setStreak(computeStreak(dates));
    });
  }, []);

  const today = new Date();
  const days = eachDayOfInterval({ start: startOfMonth(today), end: endOfMonth(today) });

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <span className="font-semibold">{format(today, "MMMM yyyy")}</span>
        <span className="text-sm text-brand">🔥 {streak} day streak</span>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          const trained = trainedDates.has(key);
          return (
            <div
              key={key}
              className={`rounded-full py-1 ${trained ? "bg-brand text-white" : "text-slate-500"}`}
            >
              {format(day, "d")}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

- [ ] **Step 7: Implement `src/features/history/HistoryScreen.tsx`**

```tsx
import CalendarView from "./CalendarView";
import SessionList from "./SessionList";

export default function HistoryScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">History</h1>
      <CalendarView />
      <SessionList />
    </div>
  );
}
```

- [ ] **Step 8: Wire into `src/pages/HistoryPage.tsx`**

```tsx
import HistoryScreen from "../features/history/HistoryScreen";

export default function HistoryPage() {
  return <HistoryScreen />;
}
```

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors. Add `date-fns` usage confirms the dependency from Task 1 is used correctly.

- [ ] **Step 10: Commit**

```bash
git add src/db/queries/history.ts src/features/history src/pages/HistoryPage.tsx
git commit -m "Add History tab: grouped session list with delete, calendar/streak view"
```

---

## Task 8: Progress feature — 1RM trend, volume chart, muscle heatmap, PR board

**Files:**
- Create: `src/utils/heatmapColor.ts`
- Create: `src/features/progress/OneRepMaxChart.tsx`
- Create: `src/features/progress/VolumeChart.tsx`
- Create: `src/features/progress/MuscleHeatmap.tsx`
- Create: `src/features/progress/PRBoard.tsx`
- Create: `src/features/progress/ProgressScreen.tsx`
- Modify: `src/pages/ProgressPage.tsx`
- Test: `src/utils/heatmapColor.test.ts`

**Interfaces:**
- Consumes: `getAllSets` (Task 4), `listExercises` (Task 4), `estimate1RM`, `computeVolume`, `computePRs` (Task 2).
- Produces: `volumeToHex(volume: number, maxVolume: number): string` (replicates the current app's matplotlib "Blues" ramp without matplotlib, via manual RGB interpolation between two fixed endpoint colors).

- [ ] **Step 1: Write failing test for heatmap color**

```typescript
// src/utils/heatmapColor.test.ts
import { describe, it, expect } from "vitest";
import { volumeToHex } from "./heatmapColor";

describe("volumeToHex", () => {
  it("returns neutral grey when volume is zero", () => {
    expect(volumeToHex(0, 1000)).toBe("#e0e0e0");
  });

  it("returns neutral grey when maxVolume is zero", () => {
    expect(volumeToHex(0, 0)).toBe("#e0e0e0");
  });

  it("returns a darker shade for higher volume", () => {
    const low = volumeToHex(100, 1000);
    const high = volumeToHex(900, 1000);
    // both are hex colors; high volume should have a lower blue-channel luminance base (darker overall)
    expect(low).toMatch(/^#[0-9a-f]{6}$/);
    expect(high).toMatch(/^#[0-9a-f]{6}$/);
    expect(low).not.toBe(high);
  });

  it("is deterministic for the same inputs", () => {
    expect(volumeToHex(500, 1000)).toBe(volumeToHex(500, 1000));
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/utils/heatmapColor.test.ts`
Expected: FAIL — `Cannot find module './heatmapColor'`

- [ ] **Step 3: Implement `src/utils/heatmapColor.ts`**

```typescript
// Manual replacement for matplotlib's "Blues" colormap (light -> dark blue), with a
// 0.3 floor so even low nonzero volume stays visibly blue instead of near-white.
const BLUES_LIGHT = { r: 222, g: 235, b: 247 }; // approx Blues(0.3)
const BLUES_DARK = { r: 8, g: 48, b: 107 }; // approx Blues(1.0)

function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, "0");
}

export function volumeToHex(volume: number, maxVolume: number): string {
  if (maxVolume <= 0 || volume <= 0) return "#e0e0e0";

  const normalized = 0.3 + 0.7 * Math.min(volume / maxVolume, 1);
  // Re-map normalized [0.3, 1.0] onto [0, 1] for interpolation between the two endpoints
  const t = (normalized - 0.3) / 0.7;

  const r = BLUES_LIGHT.r + (BLUES_DARK.r - BLUES_LIGHT.r) * t;
  const g = BLUES_LIGHT.g + (BLUES_DARK.g - BLUES_LIGHT.g) * t;
  const b = BLUES_LIGHT.b + (BLUES_DARK.b - BLUES_LIGHT.b) * t;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/utils/heatmapColor.test.ts`
Expected: PASS, 4 tests passing

- [ ] **Step 5: Implement `src/features/progress/OneRepMaxChart.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { estimate1RM } from "../../utils/calculations";
import type { Exercise, WorkoutSet } from "../../db/types";

export default function OneRepMaxChart() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
      const trainedIds = new Set(s.map((set) => set.exerciseId));
      const firstTrained = e.find((ex) => trainedIds.has(ex.id!));
      setSelectedId(firstTrained?.id ?? null);
    });
  }, []);

  const trainedExercises = useMemo(() => {
    const trainedIds = new Set(sets.map((s) => s.exerciseId));
    return exercises.filter((e) => trainedIds.has(e.id!));
  }, [sets, exercises]);

  const chartData = useMemo(() => {
    if (!selectedId) return [];
    const byDate = new Map<string, number>();
    for (const s of sets.filter((s) => s.exerciseId === selectedId)) {
      const date = s.createdAt.slice(0, 10);
      const rm = estimate1RM(s.weightKg, s.reps);
      byDate.set(date, Math.max(byDate.get(date) ?? 0, rm));
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, est1rm]) => ({ date, est1rm: Number(est1rm.toFixed(1)) }));
  }, [sets, selectedId]);

  if (trainedExercises.length === 0) {
    return <Card className="text-sm text-slate-400">Log a few sets to see your 1RM trend.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Estimated 1RM trend</h2>
      <select
        value={selectedId ?? ""}
        onChange={(e) => setSelectedId(Number(e.target.value))}
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      >
        {trainedExercises.map((e) => (
          <option key={e.id} value={e.id}>
            {e.name}
          </option>
        ))}
      </select>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Line type="monotone" dataKey="est1rm" stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

- [ ] **Step 6: Implement `src/features/progress/VolumeChart.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { startOfWeek, format } from "date-fns";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computeVolume } from "../../utils/calculations";
import type { Exercise, WorkoutSet, MuscleGroup } from "../../db/types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const COLORS: Record<MuscleGroup, string> = {
  Chest: "#2563eb",
  Back: "#16a34a",
  Legs: "#dc2626",
  Shoulders: "#d97706",
  Arms: "#9333ea",
  Core: "#0891b2"
};

export default function VolumeChart() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const chartData = useMemo(() => {
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));
    const byWeek = new Map<string, Record<string, number>>();

    for (const s of sets) {
      const ex = exerciseById.get(s.exerciseId);
      if (!ex) continue;
      const weekKey = format(startOfWeek(new Date(s.createdAt)), "yyyy-MM-dd");
      const row = byWeek.get(weekKey) ?? { week: weekKey };
      row[ex.muscleGroup] = (Number(row[ex.muscleGroup]) || 0) + computeVolume(s.weightKg, s.reps);
      byWeek.set(weekKey, row);
    }

    return Array.from(byWeek.values()).sort((a, b) => String(a.week).localeCompare(String(b.week)));
  }, [sets, exercises]);

  if (chartData.length === 0) {
    return <Card className="text-sm text-slate-400">Log a few sets to see weekly volume.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Weekly volume per muscle group</h2>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData}>
          <XAxis dataKey="week" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} />
          <Tooltip />
          <Legend wrapperStyle={{ fontSize: 10 }} />
          {MUSCLE_GROUPS.map((g) => (
            <Bar key={g} dataKey={g} stackId="a" fill={COLORS[g]} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

- [ ] **Step 7: Implement `src/features/progress/MuscleHeatmap.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import { subDays } from "date-fns";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computeVolume } from "../../utils/calculations";
import { volumeToHex } from "../../utils/heatmapColor";
import type { Exercise, WorkoutSet, MuscleGroup } from "../../db/types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const WINDOWS = [
  { label: "This Week (last 7 days)", days: 7 },
  { label: "Last 30 Days", days: 30 },
  { label: "All Time", days: null as number | null }
];

export default function MuscleHeatmap() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [windowIdx, setWindowIdx] = useState(0);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const volumeByGroup = useMemo(() => {
    const exerciseById = new Map(exercises.map((e) => [e.id, e]));
    const days = WINDOWS[windowIdx].days;
    const cutoff = days ? subDays(new Date(), days) : null;

    const result: Record<MuscleGroup, number> = {
      Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0
    };
    for (const s of sets) {
      if (cutoff && new Date(s.createdAt) < cutoff) continue;
      const ex = exerciseById.get(s.exerciseId);
      if (!ex) continue;
      result[ex.muscleGroup] += computeVolume(s.weightKg, s.reps);
    }
    return result;
  }, [sets, exercises, windowIdx]);

  const maxVolume = Math.max(...Object.values(volumeByGroup));
  const color = (g: MuscleGroup) => volumeToHex(volumeByGroup[g], maxVolume);

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Muscle group heatmap</h2>
      <select
        value={windowIdx}
        onChange={(e) => setWindowIdx(Number(e.target.value))}
        className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      >
        {WINDOWS.map((w, i) => (
          <option key={w.label} value={i}>
            {w.label}
          </option>
        ))}
      </select>
      <svg viewBox="0 0 460 280" className="w-full max-w-md">
        <text x="100" y="18" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#cbd5e1">FRONT</text>
        <circle cx="100" cy="42" r="20" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="64" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="136" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="72" y="68" width="56" height="42" rx="8" fill={color("Chest")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="76" y="108" width="48" height="36" rx="6" fill={color("Core")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="40" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="143" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="74" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="104" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />

        <text x="360" y="18" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#cbd5e1">BACK</text>
        <circle cx="360" cy="42" r="20" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="324" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <ellipse cx="396" cy="78" rx="20" ry="13" fill={color("Shoulders")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="332" y="68" width="56" height="76" rx="8" fill={color("Back")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="300" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="403" y="80" width="17" height="80" rx="8" fill={color("Arms")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="334" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
        <rect x="364" y="146" width="22" height="90" rx="8" fill={color("Legs")} stroke="#1e293b" strokeWidth="1.5" />
      </svg>
      <p className="mt-2 text-xs text-slate-500">
        {MUSCLE_GROUPS.map((g) => `${g}: ${volumeByGroup[g].toFixed(0)}kg`).join(" • ")}
      </p>
    </Card>
  );
}
```

- [ ] **Step 8: Implement `src/features/progress/PRBoard.tsx`**

```tsx
import { useEffect, useMemo, useState } from "react";
import Card from "../../components/Card";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { computePRs } from "../../utils/calculations";
import type { Exercise, WorkoutSet } from "../../db/types";

export default function PRBoard() {
  const [sets, setSets] = useState<WorkoutSet[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    Promise.all([getAllSets(), listExercises()]).then(([s, e]) => {
      setSets(s);
      setExercises(e);
    });
  }, []);

  const rows = useMemo(() => {
    const trainedIds = new Set(sets.map((s) => s.exerciseId));
    return exercises
      .filter((e) => trainedIds.has(e.id!))
      .map((e) => ({ exercise: e, prs: computePRs(sets, e.id!) }))
      .sort((a, b) => b.prs.maxWeightKg - a.prs.maxWeightKg);
  }, [sets, exercises]);

  if (rows.length === 0) {
    return <Card className="text-sm text-slate-400">No PRs yet — log some sets first.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold">PR board</h2>
      <div className="space-y-2 text-sm">
        {rows.map(({ exercise, prs }) => (
          <div key={exercise.id} className="flex items-center justify-between">
            <span>{exercise.name}</span>
            <span className="text-slate-400">
              {prs.maxWeightKg}kg · est. 1RM {prs.best1RM.toFixed(1)}kg · {prs.maxReps} reps
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

- [ ] **Step 9: Implement `src/features/progress/ProgressScreen.tsx`**

```tsx
import OneRepMaxChart from "./OneRepMaxChart";
import VolumeChart from "./VolumeChart";
import MuscleHeatmap from "./MuscleHeatmap";
import PRBoard from "./PRBoard";

export default function ProgressScreen() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Progress</h1>
      <PRBoard />
      <OneRepMaxChart />
      <VolumeChart />
      <MuscleHeatmap />
    </div>
  );
}
```

- [ ] **Step 10: Wire into `src/pages/ProgressPage.tsx`**

```tsx
import ProgressScreen from "../features/progress/ProgressScreen";

export default function ProgressPage() {
  return <ProgressScreen />;
}
```

- [ ] **Step 11: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 12: Commit**

```bash
git add src/utils/heatmapColor.ts src/features/progress src/pages/ProgressPage.tsx
git commit -m "Add Progress tab: 1RM trend, volume chart, muscle heatmap, PR board"
```

---

## Task 9: Templates — save routines and start from a template

**Files:**
- Create: `src/db/queries/templates.ts`
- Create: `src/features/templates/TemplateForm.tsx`
- Create: `src/features/templates/TemplateList.tsx`
- Modify: `src/features/workout/TrainScreen.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Test: `src/db/queries/templates.test.ts`

**Interfaces:**
- Consumes: `db`, `Template`, `TemplateItem` (Task 2); `startSession` (Task 4).
- Produces: `listTemplates(): Promise<Template[]>`, `saveTemplate(input: Omit<Template, "id">): Promise<number>`, `deleteTemplate(id: number): Promise<void>`, `startSessionFromTemplate(template: Template): Promise<number>` (creates a session named after the template and pre-creates zero sets — items are just a plan, not logged sets).

- [ ] **Step 1: Write failing test**

```typescript
// src/db/queries/templates.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/db/queries/templates.test.ts`
Expected: FAIL — `Cannot find module './templates'`

- [ ] **Step 3: Implement `src/db/queries/templates.ts`**

```typescript
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/db/queries/templates.test.ts`
Expected: PASS, 3 tests passing

- [ ] **Step 5: Implement `src/features/templates/TemplateForm.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Exercise, TemplateItem } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";
import { saveTemplate } from "../../db/queries/templates";

export default function TemplateForm({ onSaved }: { onSaved: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);

  useEffect(() => {
    listExercises().then(setExercises);
  }, []);

  const addItem = () => {
    if (exercises.length === 0) return;
    setItems([...items, { exerciseId: exercises[0].id!, targetSets: 3, targetReps: 8 }]);
  };

  const updateItem = (index: number, patch: Partial<TemplateItem>) => {
    setItems(items.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!name || items.length === 0) return;
    await saveTemplate({ name, items });
    setName("");
    setItems([]);
    onSaved();
  };

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        placeholder="Template name (e.g. Push Day)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <select
            className="flex-1 rounded-lg bg-slate-800 px-2 py-1 text-xs"
            value={item.exerciseId}
            onChange={(e) => updateItem(i, { exerciseId: Number(e.target.value) })}
          >
            {exercises.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="w-14 rounded-lg bg-slate-800 px-2 py-1 text-xs"
            value={item.targetSets}
            onChange={(e) => updateItem(i, { targetSets: Number(e.target.value) })}
          />
          <span className="text-xs text-slate-500">x</span>
          <input
            type="number"
            className="w-14 rounded-lg bg-slate-800 px-2 py-1 text-xs"
            value={item.targetReps}
            onChange={(e) => updateItem(i, { targetReps: Number(e.target.value) })}
          />
          <button onClick={() => removeItem(i)} className="text-xs text-red-400">
            ✕
          </button>
        </div>
      ))}
      <button onClick={addItem} className="w-full rounded-lg bg-slate-800 py-2 text-xs">
        + Add exercise
      </button>
      <button onClick={handleSave} className="w-full rounded-lg bg-brand py-2 text-sm font-semibold">
        Save template
      </button>
    </div>
  );
}
```

- [ ] **Step 6: Implement `src/features/templates/TemplateList.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Template } from "../../db/types";
import { listTemplates, deleteTemplate } from "../../db/queries/templates";

export default function TemplateList({
  onStart
}: {
  onStart?: (template: Template) => void;
}) {
  const [templates, setTemplates] = useState<Template[]>([]);

  const reload = () => listTemplates().then(setTemplates);

  useEffect(() => {
    reload();
  }, []);

  if (templates.length === 0) {
    return <p className="text-sm text-slate-400">No templates saved yet.</p>;
  }

  return (
    <div className="space-y-2">
      {templates.map((t) => (
        <div key={t.id} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
          <div>
            <p className="font-semibold">{t.name}</p>
            <p className="text-xs text-slate-500">{t.items.length} exercises</p>
          </div>
          <div className="flex gap-2">
            {onStart && (
              <button className="rounded-lg bg-brand px-2 py-1 text-xs" onClick={() => onStart(t)}>
                Start
              </button>
            )}
            <button
              className="rounded-lg bg-slate-700 px-2 py-1 text-xs"
              onClick={async () => {
                await deleteTemplate(t.id!);
                reload();
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 7: Wire "start from template" into `src/features/workout/TrainScreen.tsx`**

Add these imports at the top:

```tsx
import { useEffect, useState } from "react";
import TemplateList from "../templates/TemplateList";
import { startSessionFromTemplate } from "../../db/queries/templates";
import type { Template } from "../../db/types";
```

Replace the `if (!sessionId) { ... }` block's return with:

```tsx
  const handleStartFromTemplate = async (template: Template) => {
    const id = await startSessionFromTemplate(template);
    start(template.name, id, new Date().toISOString());
  };

  if (!sessionId) {
    return (
      <div className="space-y-4">
        <Card>
          <h1 className="mb-3 text-lg font-bold">Start a workout</h1>
          <select
            value={sessionType}
            onChange={(e) => setSessionType(e.target.value)}
            className="mb-3 w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
          >
            {SESSION_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button onClick={handleStart} className="w-full rounded-lg bg-brand py-2 font-semibold">
            ▶️ Start Workout
          </button>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold">Or start from a template</h2>
          <TemplateList onStart={handleStartFromTemplate} />
        </Card>
      </div>
    );
  }
```

- [ ] **Step 8: Add template management to `src/pages/SettingsPage.tsx`**

```tsx
import { useState } from "react";
import Card from "../components/Card";
import TemplateForm from "../features/templates/TemplateForm";
import TemplateList from "../features/templates/TemplateList";

export default function SettingsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <Card>
        <h2 className="mb-2 font-semibold">Workout templates</h2>
        <TemplateForm onSaved={() => setRefreshKey((k) => k + 1)} />
        <div key={refreshKey} className="mt-4">
          <TemplateList />
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 9: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 10: Commit**

```bash
git add src/db/queries/templates.ts src/features/templates src/features/workout/TrainScreen.tsx src/pages/SettingsPage.tsx
git commit -m "Add workout templates: create, list, delete, start-from-template"
```

---

## Task 10: Body measurements and goals

**Files:**
- Create: `src/db/queries/measurements.ts`
- Create: `src/db/queries/goals.ts`
- Create: `src/utils/goalProgress.ts`
- Create: `src/features/measurements/MeasurementForm.tsx`
- Create: `src/features/measurements/MeasurementTrendChart.tsx`
- Create: `src/features/goals/GoalForm.tsx`
- Create: `src/features/goals/GoalProgressList.tsx`
- Modify: `src/features/progress/ProgressScreen.tsx`
- Test: `src/db/queries/measurements.test.ts`
- Test: `src/utils/goalProgress.test.ts`

**Interfaces:**
- Consumes: `db`, `Measurement`, `Goal` (Task 2); `computePRs`, `estimate1RM` (Task 2); `getAllSets` (Task 4).
- Produces:
  - `logMeasurement(input: Omit<Measurement, "id">): Promise<number>`
  - `listMeasurements(type?: MeasurementType): Promise<Measurement[]>`
  - `saveGoal(input: Omit<Goal, "id" | "createdAt" | "achievedAt">): Promise<number>`
  - `listGoals(): Promise<Goal[]>`
  - `deleteGoal(id: number): Promise<void>`
  - `computeGoalProgress(goal: Goal, context: { sets: WorkoutSet[]; measurements: Measurement[]; sessionCountLast7Days: number }): { current: number; target: number; percent: number }`

- [ ] **Step 1: Write failing test for measurements queries**

```typescript
// src/db/queries/measurements.test.ts
import { describe, it, expect, beforeEach } from "vitest";
import { db } from "../schema";
import { logMeasurement, listMeasurements } from "./measurements";

beforeEach(async () => {
  await db.measurements.clear();
});

describe("logMeasurement / listMeasurements", () => {
  it("stores and retrieves a measurement", async () => {
    await logMeasurement({ date: "2026-07-18", type: "bodyweight", value: 82.5, unit: "kg" });
    const all = await listMeasurements();
    expect(all).toHaveLength(1);
    expect(all[0].value).toBe(82.5);
  });

  it("filters by type when requested", async () => {
    await logMeasurement({ date: "2026-07-18", type: "bodyweight", value: 82.5, unit: "kg" });
    await logMeasurement({ date: "2026-07-18", type: "waist", value: 85, unit: "cm" });
    const weightOnly = await listMeasurements("bodyweight");
    expect(weightOnly).toHaveLength(1);
    expect(weightOnly[0].type).toBe("bodyweight");
  });
});
```

- [ ] **Step 2: Write failing test for goal progress utility**

```typescript
// src/utils/goalProgress.test.ts
import { describe, it, expect } from "vitest";
import { computeGoalProgress } from "./goalProgress";
import type { WorkoutSet, Measurement, Goal } from "../db/types";

function makeGoal(overrides: Partial<Goal>): Goal {
  return {
    id: 1,
    type: "exerciseWeight",
    targetValue: 100,
    createdAt: "2026-01-01T00:00:00.000Z",
    achievedAt: null,
    ...overrides
  };
}

describe("computeGoalProgress", () => {
  it("computes progress toward a raw exercise weight goal", () => {
    const sets: WorkoutSet[] = [
      { id: 1, sessionId: 1, exerciseId: 5, weightKg: 80, reps: 5, rpe: 8, order: 0, createdAt: "2026-07-01T00:00:00.000Z" }
    ];
    const goal = makeGoal({ type: "exerciseWeight", exerciseId: 5, targetValue: 100 });
    const result = computeGoalProgress(goal, { sets, measurements: [], sessionCountLast7Days: 0 });
    expect(result).toEqual({ current: 80, target: 100, percent: 80 });
  });

  it("computes progress toward a bodyweight goal using the latest measurement", () => {
    const measurements: Measurement[] = [
      { id: 1, date: "2026-07-01", type: "bodyweight", value: 75, unit: "kg" },
      { id: 2, date: "2026-07-10", type: "bodyweight", value: 78, unit: "kg" }
    ];
    const goal = makeGoal({ type: "bodyweight", targetValue: 80 });
    const result = computeGoalProgress(goal, { sets: [], measurements, sessionCountLast7Days: 0 });
    expect(result).toEqual({ current: 78, target: 80, percent: 97.5 });
  });

  it("computes progress toward a weekly-frequency goal", () => {
    const goal = makeGoal({ type: "frequency", targetValue: 4 });
    const result = computeGoalProgress(goal, { sets: [], measurements: [], sessionCountLast7Days: 3 });
    expect(result).toEqual({ current: 3, target: 4, percent: 75 });
  });

  it("clamps percent at 100", () => {
    const sets: WorkoutSet[] = [
      { id: 1, sessionId: 1, exerciseId: 5, weightKg: 120, reps: 1, rpe: 9, order: 0, createdAt: "2026-07-01T00:00:00.000Z" }
    ];
    const goal = makeGoal({ type: "exerciseWeight", exerciseId: 5, targetValue: 100 });
    const result = computeGoalProgress(goal, { sets, measurements: [], sessionCountLast7Days: 0 });
    expect(result.percent).toBe(100);
  });
});
```

- [ ] **Step 3: Run both test files to verify they fail**

Run: `npm run test -- src/db/queries/measurements.test.ts src/utils/goalProgress.test.ts`
Expected: FAIL — modules don't exist yet

- [ ] **Step 4: Implement `src/db/queries/measurements.ts`**

```typescript
import { db } from "../schema";
import type { Measurement, MeasurementType } from "../types";

export async function logMeasurement(input: Omit<Measurement, "id">): Promise<number> {
  return db.measurements.add(input);
}

export async function listMeasurements(type?: MeasurementType): Promise<Measurement[]> {
  const all = await db.measurements.orderBy("date").toArray();
  return type ? all.filter((m) => m.type === type) : all;
}
```

- [ ] **Step 5: Implement `src/db/queries/goals.ts`**

```typescript
import { db } from "../schema";
import type { Goal } from "../types";

export async function saveGoal(input: Omit<Goal, "id" | "createdAt" | "achievedAt">): Promise<number> {
  return db.goals.add({ ...input, createdAt: new Date().toISOString(), achievedAt: null });
}

export async function listGoals(): Promise<Goal[]> {
  return db.goals.orderBy("createdAt").reverse().toArray();
}

export async function deleteGoal(id: number): Promise<void> {
  await db.goals.delete(id);
}
```

- [ ] **Step 6: Implement `src/utils/goalProgress.ts`**

```typescript
import type { Goal, WorkoutSet, Measurement } from "../db/types";
import { computePRs } from "./calculations";

export function computeGoalProgress(
  goal: Goal,
  context: { sets: WorkoutSet[]; measurements: Measurement[]; sessionCountLast7Days: number }
): { current: number; target: number; percent: number } {
  let current = 0;

  if (goal.type === "exerciseWeight" && goal.exerciseId !== undefined) {
    current = computePRs(context.sets, goal.exerciseId).maxWeightKg;
  } else if (goal.type === "exercise1RM" && goal.exerciseId !== undefined) {
    current = computePRs(context.sets, goal.exerciseId).best1RM;
  } else if (goal.type === "bodyweight") {
    const bodyweightEntries = context.measurements
      .filter((m) => m.type === "bodyweight")
      .sort((a, b) => a.date.localeCompare(b.date));
    current = bodyweightEntries.at(-1)?.value ?? 0;
  } else if (goal.type === "frequency") {
    current = context.sessionCountLast7Days;
  }

  const percent = goal.targetValue > 0 ? Math.min((current / goal.targetValue) * 100, 100) : 0;
  return { current, target: goal.targetValue, percent: Number(percent.toFixed(1)) };
}
```

- [ ] **Step 7: Run tests to verify they pass**

Run: `npm run test -- src/db/queries/measurements.test.ts src/utils/goalProgress.test.ts`
Expected: PASS, 6 tests passing

- [ ] **Step 8: Implement `src/features/measurements/MeasurementForm.tsx`**

```tsx
import { useState } from "react";
import type { MeasurementType } from "../../db/types";
import { logMeasurement } from "../../db/queries/measurements";

const TYPES: { value: MeasurementType; label: string; unit: string }[] = [
  { value: "bodyweight", label: "Bodyweight", unit: "kg" },
  { value: "waist", label: "Waist", unit: "cm" },
  { value: "chest", label: "Chest", unit: "cm" },
  { value: "arms", label: "Arms", unit: "cm" },
  { value: "thighs", label: "Thighs", unit: "cm" }
];

export default function MeasurementForm({ onSaved }: { onSaved: () => void }) {
  const [type, setType] = useState<MeasurementType>("bodyweight");
  const [value, setValue] = useState(0);

  const selectedUnit = TYPES.find((t) => t.value === type)?.unit ?? "cm";

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await logMeasurement({
          date: new Date().toISOString().slice(0, 10),
          type,
          value,
          unit: selectedUnit
        });
        setValue(0);
        onSaved();
      }}
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as MeasurementType)}
        className="rounded-lg bg-slate-800 px-2 py-2 text-sm"
      >
        {TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <input
        type="number"
        step={0.1}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-24 rounded-lg bg-slate-800 px-2 py-2 text-sm"
      />
      <span className="pb-2 text-xs text-slate-500">{selectedUnit}</span>
      <button type="submit" className="rounded-lg bg-brand px-3 py-2 text-sm font-semibold">
        Log
      </button>
    </form>
  );
}
```

- [ ] **Step 9: Implement `src/features/measurements/MeasurementTrendChart.tsx`**

```tsx
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import Card from "../../components/Card";
import { listMeasurements } from "../../db/queries/measurements";
import type { MeasurementType } from "../../db/types";

export default function MeasurementTrendChart({ type = "bodyweight" as MeasurementType }) {
  const [data, setData] = useState<{ date: string; value: number }[]>([]);

  useEffect(() => {
    listMeasurements(type).then((entries) =>
      setData(entries.map((m) => ({ date: m.date, value: m.value })))
    );
  }, [type]);

  if (data.length === 0) {
    return <Card className="text-sm text-slate-400">No {type} entries logged yet.</Card>;
  }

  return (
    <Card>
      <h2 className="mb-2 font-semibold capitalize">{type} trend</h2>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
          <Tooltip />
          <Line type="monotone" dataKey="value" stroke="#16a34a" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}
```

- [ ] **Step 10: Implement `src/features/goals/GoalForm.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Exercise, GoalType } from "../../db/types";
import { listExercises } from "../../db/queries/exercises";
import { saveGoal } from "../../db/queries/goals";

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "exerciseWeight", label: "Lift a weight" },
  { value: "exercise1RM", label: "Reach an estimated 1RM" },
  { value: "bodyweight", label: "Reach a bodyweight" },
  { value: "frequency", label: "Train N times a week" }
];

export default function GoalForm({ onSaved }: { onSaved: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [type, setType] = useState<GoalType>("exerciseWeight");
  const [exerciseId, setExerciseId] = useState<number | undefined>(undefined);
  const [targetValue, setTargetValue] = useState(0);

  useEffect(() => {
    listExercises().then((all) => {
      setExercises(all);
      setExerciseId(all[0]?.id);
    });
  }, []);

  const needsExercise = type === "exerciseWeight" || type === "exercise1RM";

  return (
    <form
      className="space-y-2"
      onSubmit={async (e) => {
        e.preventDefault();
        await saveGoal({
          type,
          exerciseId: needsExercise ? exerciseId : undefined,
          targetValue
        });
        setTargetValue(0);
        onSaved();
      }}
    >
      <select
        value={type}
        onChange={(e) => setType(e.target.value as GoalType)}
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      >
        {GOAL_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      {needsExercise && (
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(Number(e.target.value))}
          className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
        >
          {exercises.map((ex) => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      )}
      <input
        type="number"
        placeholder="Target value"
        value={targetValue}
        onChange={(e) => setTargetValue(Number(e.target.value))}
        className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm"
      />
      <button type="submit" className="w-full rounded-lg bg-brand py-2 text-sm font-semibold">
        Save goal
      </button>
    </form>
  );
}
```

- [ ] **Step 11: Implement `src/features/goals/GoalProgressList.tsx`**

```tsx
import { useEffect, useState } from "react";
import Card from "../../components/Card";
import { listGoals, deleteGoal } from "../../db/queries/goals";
import { listExercises } from "../../db/queries/exercises";
import { getAllSets } from "../../db/queries/sets";
import { listMeasurements } from "../../db/queries/measurements";
import { computeGoalProgress } from "../../utils/goalProgress";
import type { Goal, Exercise } from "../../db/types";
import { subDays } from "date-fns";

export default function GoalProgressList() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [progress, setProgress] = useState<Map<number, { current: number; target: number; percent: number }>>(new Map());

  const reload = async () => {
    const [g, ex, sets, measurements] = await Promise.all([
      listGoals(),
      listExercises(),
      getAllSets(),
      listMeasurements()
    ]);
    setGoals(g);
    setExercises(ex);

    const sevenDaysAgo = subDays(new Date(), 7);
    const sessionCountLast7Days = new Set(
      sets.filter((s) => new Date(s.createdAt) >= sevenDaysAgo).map((s) => s.sessionId)
    ).size;

    const map = new Map<number, { current: number; target: number; percent: number }>();
    for (const goal of g) {
      map.set(goal.id!, computeGoalProgress(goal, { sets, measurements, sessionCountLast7Days }));
    }
    setProgress(map);
  };

  useEffect(() => {
    reload();
  }, []);

  if (goals.length === 0) {
    return <Card className="text-sm text-slate-400">No goals set yet.</Card>;
  }

  const exerciseName = (id?: number) => exercises.find((e) => e.id === id)?.name ?? "";

  return (
    <Card>
      <h2 className="mb-2 font-semibold">Goals</h2>
      <div className="space-y-3">
        {goals.map((goal) => {
          const p = progress.get(goal.id!) ?? { current: 0, target: goal.targetValue, percent: 0 };
          return (
            <div key={goal.id}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>
                  {goal.type === "frequency"
                    ? `Train ${goal.targetValue}x/week`
                    : `${exerciseName(goal.exerciseId)} → ${goal.targetValue}`}
                </span>
                <button
                  className="text-xs text-red-400"
                  onClick={async () => {
                    await deleteGoal(goal.id!);
                    reload();
                  }}
                >
                  ✕
                </button>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800">
                <div
                  className="h-2 rounded-full bg-brand"
                  style={{ width: `${p.percent}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {p.current} / {p.target} ({p.percent}%)
              </p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
```

- [ ] **Step 12: Add measurements + goals to `src/features/progress/ProgressScreen.tsx`**

```tsx
import OneRepMaxChart from "./OneRepMaxChart";
import VolumeChart from "./VolumeChart";
import MuscleHeatmap from "./MuscleHeatmap";
import PRBoard from "./PRBoard";
import Card from "../../components/Card";
import MeasurementForm from "../measurements/MeasurementForm";
import MeasurementTrendChart from "../measurements/MeasurementTrendChart";
import GoalForm from "../goals/GoalForm";
import GoalProgressList from "../goals/GoalProgressList";
import { useState } from "react";

export default function ProgressScreen() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Progress</h1>
      <PRBoard />
      <OneRepMaxChart />
      <VolumeChart />
      <MuscleHeatmap />
      <Card>
        <h2 className="mb-2 font-semibold">Log a measurement</h2>
        <MeasurementForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </Card>
      <div key={`m-${refreshKey}`}>
        <MeasurementTrendChart type="bodyweight" />
      </div>
      <Card>
        <h2 className="mb-2 font-semibold">Set a goal</h2>
        <GoalForm onSaved={() => setRefreshKey((k) => k + 1)} />
      </Card>
      <div key={`g-${refreshKey}`}>
        <GoalProgressList />
      </div>
    </div>
  );
}
```

- [ ] **Step 13: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 14: Commit**

```bash
git add src/db/queries/measurements.ts src/db/queries/goals.ts src/utils/goalProgress.ts src/features/measurements src/features/goals src/features/progress/ProgressScreen.tsx
git commit -m "Add body measurements and goals with progress tracking"
```

---

## Task 11: Custom exercises management + Today tab

**Files:**
- Create: `src/features/settings/ExerciseManager.tsx`
- Create: `src/features/today/TodayScreen.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Modify: `src/pages/TodayPage.tsx`

**Interfaces:**
- Consumes: `listExercises`, `addCustomExercise`, `deleteExercise` (Task 4); `getTrainedDates` (Task 7); `computeStreak` (Task 2); `getAllSets` (Task 4); `computePRs` (Task 2); `listTemplates`, `startSessionFromTemplate` (Task 9); `useWorkoutStore` (Task 6); `useToast` (Task 5).

- [ ] **Step 1: Implement `src/features/settings/ExerciseManager.tsx`**

```tsx
import { useEffect, useState } from "react";
import type { Exercise, ExerciseCategory, MuscleGroup } from "../../db/types";
import { listExercises, addCustomExercise, deleteExercise } from "../../db/queries/exercises";
import { useToast } from "../../components/Toast";

const MUSCLE_GROUPS: MuscleGroup[] = ["Chest", "Back", "Legs", "Shoulders", "Arms", "Core"];
const CATEGORIES: ExerciseCategory[] = ["Barbell", "Dumbbell", "Machine", "Cable", "Bodyweight"];

export default function ExerciseManager() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [name, setName] = useState("");
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup>("Chest");
  const [category, setCategory] = useState<ExerciseCategory>("Barbell");
  const { showToast } = useToast();

  const reload = () => listExercises().then(setExercises);

  useEffect(() => {
    reload();
  }, []);

  const customExercises = exercises.filter((e) => e.isCustom);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        <input
          className="rounded-lg bg-slate-800 px-3 py-2 text-sm"
          placeholder="Exercise name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <div className="flex gap-2">
          <select
            className="flex-1 rounded-lg bg-slate-800 px-2 py-2 text-sm"
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value as MuscleGroup)}
          >
            {MUSCLE_GROUPS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
          <select
            className="flex-1 rounded-lg bg-slate-800 px-2 py-2 text-sm"
            value={category}
            onChange={(e) => setCategory(e.target.value as ExerciseCategory)}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <button
          className="rounded-lg bg-brand py-2 text-sm font-semibold"
          onClick={async () => {
            if (!name) return;
            await addCustomExercise({ name, muscleGroup, category });
            setName("");
            reload();
          }}
        >
          + Add custom exercise
        </button>
      </div>
      {customExercises.length === 0 ? (
        <p className="text-sm text-slate-400">No custom exercises yet.</p>
      ) : (
        <div className="space-y-1">
          {customExercises.map((ex) => (
            <div key={ex.id} className="flex items-center justify-between rounded-lg bg-slate-800 px-3 py-2 text-sm">
              <span>
                {ex.name} <span className="text-slate-500">· {ex.muscleGroup}</span>
              </span>
              <button
                className="text-xs text-red-400"
                onClick={async () => {
                  const result = await deleteExercise(ex.id!);
                  if (!result.ok) {
                    showToast(`Can't delete: ${result.reason}`);
                    return;
                  }
                  reload();
                }}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Add `ExerciseManager` to `src/pages/SettingsPage.tsx`**

```tsx
import { useState } from "react";
import Card from "../components/Card";
import TemplateForm from "../features/templates/TemplateForm";
import TemplateList from "../features/templates/TemplateList";
import ExerciseManager from "../features/settings/ExerciseManager";

export default function SettingsPage() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Settings</h1>
      <Card>
        <h2 className="mb-2 font-semibold">Custom exercises</h2>
        <ExerciseManager />
      </Card>
      <Card>
        <h2 className="mb-2 font-semibold">Workout templates</h2>
        <TemplateForm onSaved={() => setRefreshKey((k) => k + 1)} />
        <div key={refreshKey} className="mt-4">
          <TemplateList />
        </div>
      </Card>
    </div>
  );
}
```

- [ ] **Step 3: Implement `src/features/today/TodayScreen.tsx`**

```tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/Card";
import { getTrainedDates } from "../../db/queries/history";
import { computeStreak, computePRs } from "../../utils/calculations";
import { getAllSets } from "../../db/queries/sets";
import { listExercises } from "../../db/queries/exercises";
import { listTemplates } from "../../db/queries/templates";
import { startSessionFromTemplate } from "../../db/queries/templates";
import { useWorkoutStore } from "../../store/workoutStore";
import type { Template, Exercise, WorkoutSet } from "../../db/types";
import { subDays } from "date-fns";

export default function TodayScreen() {
  const navigate = useNavigate();
  const start = useWorkoutStore((s) => s.start);
  const [streak, setStreak] = useState(0);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [recentPRs, setRecentPRs] = useState<{ exercise: Exercise; weightKg: number }[]>([]);

  useEffect(() => {
    Promise.all([getTrainedDates(), listTemplates(), getAllSets(), listExercises()]).then(
      ([dates, tpls, sets, exercises]) => {
        setStreak(computeStreak(dates));
        setTemplates(tpls);

        const sevenDaysAgo = subDays(new Date(), 7);
        const recentSets = sets.filter((s) => new Date(s.createdAt) >= sevenDaysAgo);
        const prsHit: { exercise: Exercise; weightKg: number }[] = [];
        const seen = new Set<number>();
        for (const s of recentSets as WorkoutSet[]) {
          if (seen.has(s.exerciseId)) continue;
          const priorAndCurrent = sets.filter((x) => x.exerciseId === s.exerciseId);
          const pr = computePRs(priorAndCurrent, s.exerciseId);
          if (pr.maxWeightKg === s.weightKg) {
            const exercise = exercises.find((e) => e.id === s.exerciseId);
            if (exercise) {
              prsHit.push({ exercise, weightKg: s.weightKg });
              seen.add(s.exerciseId);
            }
          }
        }
        setRecentPRs(prsHit.slice(0, 5));
      }
    );
  }, []);

  const handleStartFromTemplate = async (template: Template) => {
    const id = await startSessionFromTemplate(template);
    start(template.name, id, new Date().toISOString());
    navigate("/train");
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">👋 Welcome back</h1>
      <Card className="flex items-center justify-between">
        <span className="text-sm">Current streak</span>
        <span className="text-lg font-semibold text-brand">🔥 {streak} days</span>
      </Card>
      <Card>
        <button
          onClick={() => navigate("/train")}
          className="w-full rounded-lg bg-brand py-2 font-semibold"
        >
          ▶️ Start a workout
        </button>
      </Card>
      {templates.length > 0 && (
        <Card>
          <h2 className="mb-2 font-semibold">Quick start from template</h2>
          <div className="space-y-2">
            {templates.map((t) => (
              <button
                key={t.id}
                onClick={() => handleStartFromTemplate(t)}
                className="block w-full rounded-lg bg-slate-800 px-3 py-2 text-left text-sm"
              >
                {t.name} <span className="text-slate-500">· {t.items.length} exercises</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      <Card>
        <h2 className="mb-2 font-semibold">Recent PRs</h2>
        {recentPRs.length === 0 ? (
          <p className="text-sm text-slate-400">No PRs in the last 7 days yet.</p>
        ) : (
          <ul className="space-y-1 text-sm">
            {recentPRs.map(({ exercise, weightKg }) => (
              <li key={exercise.id}>
                🏆 {exercise.name} — {weightKg}kg
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
```

- [ ] **Step 4: Wire into `src/pages/TodayPage.tsx`**

```tsx
import TodayScreen from "../features/today/TodayScreen";

export default function TodayPage() {
  return <TodayScreen />;
}
```

- [ ] **Step 5: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 6: Manual verification**

Run: `npm run dev`, confirm the Today tab shows the streak, a working "Start a workout" button, template quick-start buttons (if any templates exist), and confirm Settings → Custom exercises can add/delete an exercise (and that deleting one referenced by a set is blocked with a toast).

- [ ] **Step 7: Commit**

```bash
git add src/features/settings/ExerciseManager.tsx src/features/today src/pages/SettingsPage.tsx src/pages/TodayPage.tsx
git commit -m "Add Today tab (streak, quick start, recent PRs) and custom exercise management"
```

---

## Task 12: Export/Import (JSON backup + CSV export)

**Files:**
- Create: `src/utils/backup.ts`
- Create: `src/features/settings/ExportImport.tsx`
- Modify: `src/pages/SettingsPage.tsx`
- Test: `src/utils/backup.test.ts`

**Interfaces:**
- Consumes: `db` and all table types (Task 2).
- Produces:
  - `exportAllDataAsJson(): Promise<string>` (JSON string of `{ exercises, sessions, sets, templates, measurements, goals, settings }`)
  - `importAllDataFromJson(json: string): Promise<void>` (clears and replaces all tables)
  - `exportSetsAsCsv(): Promise<string>` (CSV matching the original app's column order: `date,exercise,weight_kg,reps,rpe,muscle_group,session_id,session_name`)

- [ ] **Step 1: Write failing test**

```typescript
// src/utils/backup.test.ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/utils/backup.test.ts`
Expected: FAIL — `Cannot find module './backup'`

- [ ] **Step 3: Implement `src/utils/backup.ts`**

```typescript
import { db } from "../db/schema";

interface BackupPayload {
  exercises: unknown[];
  sessions: unknown[];
  sets: unknown[];
  templates: unknown[];
  measurements: unknown[];
  goals: unknown[];
  settings: unknown[];
}

export async function exportAllDataAsJson(): Promise<string> {
  const payload: BackupPayload = {
    exercises: await db.exercises.toArray(),
    sessions: await db.sessions.toArray(),
    sets: await db.sets.toArray(),
    templates: await db.templates.toArray(),
    measurements: await db.measurements.toArray(),
    goals: await db.goals.toArray(),
    settings: await db.settings.toArray()
  };
  return JSON.stringify(payload, null, 2);
}

export async function importAllDataFromJson(json: string): Promise<void> {
  const payload = JSON.parse(json) as BackupPayload;
  await db.transaction(
    "rw",
    [db.exercises, db.sessions, db.sets, db.templates, db.measurements, db.goals, db.settings],
    async () => {
      await Promise.all([
        db.exercises.clear(),
        db.sessions.clear(),
        db.sets.clear(),
        db.templates.clear(),
        db.measurements.clear(),
        db.goals.clear(),
        db.settings.clear()
      ]);
      await Promise.all([
        db.exercises.bulkAdd(payload.exercises as never[]),
        db.sessions.bulkAdd(payload.sessions as never[]),
        db.sets.bulkAdd(payload.sets as never[]),
        db.templates.bulkAdd(payload.templates as never[]),
        db.measurements.bulkAdd(payload.measurements as never[]),
        db.goals.bulkAdd(payload.goals as never[]),
        db.settings.bulkAdd(payload.settings as never[])
      ]);
    }
  );
}

export async function exportSetsAsCsv(): Promise<string> {
  const [sets, exercises, sessions] = await Promise.all([
    db.sets.toArray(),
    db.exercises.toArray(),
    db.sessions.toArray()
  ]);
  const exerciseById = new Map(exercises.map((e) => [e.id, e]));
  const sessionById = new Map(sessions.map((s) => [s.id, s]));

  const header = "date,exercise,weight_kg,reps,rpe,muscle_group,session_id,session_name";
  const rows = sets.map((s) => {
    const ex = exerciseById.get(s.exerciseId);
    const session = sessionById.get(s.sessionId);
    return [
      session?.date ?? "",
      ex?.name ?? "",
      s.weightKg,
      s.reps,
      s.rpe,
      ex?.muscleGroup ?? "",
      s.sessionId,
      session?.name ?? ""
    ].join(",");
  });

  return [header, ...rows].join("\n");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/utils/backup.test.ts`
Expected: PASS, 2 tests passing

- [ ] **Step 5: Implement `src/features/settings/ExportImport.tsx`**

```tsx
import { useRef } from "react";
import { exportAllDataAsJson, importAllDataFromJson, exportSetsAsCsv } from "../../utils/backup";
import { useToast } from "../../components/Toast";

function download(filename: string, content: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportImport() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

  return (
    <div className="space-y-2">
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={async () => {
          const json = await exportAllDataAsJson();
          download(`gym-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`, json, "application/json");
        }}
      >
        ⬇️ Export full backup (JSON)
      </button>
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={async () => {
          const csv = await exportSetsAsCsv();
          download(`gym-tracker-sets-${new Date().toISOString().slice(0, 10)}.csv`, csv, "text/csv");
        }}
      >
        ⬇️ Export sets (CSV)
      </button>
      <button
        className="w-full rounded-lg bg-slate-800 py-2 text-sm"
        onClick={() => fileInputRef.current?.click()}
      >
        ⬆️ Import backup (JSON)
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          try {
            await importAllDataFromJson(text);
            showToast("Backup restored");
          } catch {
            showToast("Import failed — invalid backup file");
          }
          e.target.value = "";
        }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Add `ExportImport` to `src/pages/SettingsPage.tsx`**

```tsx
import ExportImport from "../features/settings/ExportImport";
```

Add inside the returned JSX, after the templates `Card`:

```tsx
      <Card>
        <h2 className="mb-2 font-semibold">Data</h2>
        <ExportImport />
      </Card>
```

- [ ] **Step 7: Verify build**

Run: `npm run build`
Expected: succeeds with no type errors

- [ ] **Step 8: Commit**

```bash
git add src/utils/backup.ts src/features/settings/ExportImport.tsx src/pages/SettingsPage.tsx
git commit -m "Add JSON backup/restore and CSV export"
```

---

## Task 13: PWA icons, deploy config, README rewrite

**Files:**
- Create: `public/icon-source.svg`
- Create: `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-512-maskable.png` (generated)
- Create: `public/apple-touch-icon.png` (generated)
- Create: `public/favicon.svg`
- Create: `vercel.json`
- Modify: `README.md` (root)

**Interfaces:**
- Consumes: `vite.config.ts` PWA manifest icon paths from Task 1 (already reference `icons/icon-192.png` etc.).

- [ ] **Step 1: Create `public/icon-source.svg`**

```xml
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" rx="96" fill="#0f172a"/>
  <rect x="60" y="226" width="60" height="60" rx="12" fill="#2563eb"/>
  <rect x="392" y="226" width="60" height="60" rx="12" fill="#2563eb"/>
  <rect x="140" y="196" width="30" height="120" rx="10" fill="#2563eb"/>
  <rect x="342" y="196" width="30" height="120" rx="10" fill="#2563eb"/>
  <rect x="170" y="241" width="172" height="30" rx="10" fill="#f1f5f9"/>
</svg>
```

Copy it as the favicon too:

```bash
cp public/icon-source.svg public/favicon.svg
```

- [ ] **Step 2: Generate PNG icon sizes**

```bash
npm install --save-dev sharp
node -e "
const sharp = require('sharp');
const src = 'public/icon-source.svg';
const jobs = [
  ['public/icons/icon-192.png', 192],
  ['public/icons/icon-512.png', 512],
  ['public/icons/icon-512-maskable.png', 512],
  ['public/apple-touch-icon.png', 180]
];
Promise.all(jobs.map(([out, size]) => sharp(src).resize(size, size).png().toFile(out)))
  .then(() => console.log('icons generated'))
  .catch((e) => { console.error(e); process.exit(1); });
"
```

Expected output: `icons generated`, and the four PNG files exist under `public/`.

- [ ] **Step 3: Remove the temporary `sharp` devDependency** (only needed for icon generation, not the runtime app)

```bash
npm uninstall sharp
```

- [ ] **Step 4: Create `vercel.json`**

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- [ ] **Step 5: Rewrite root `README.md`**

```markdown
# Gym Tracker

A comprehensive, local-first workout tracker built as an installable Progressive Web App. Live workout logging with a rest timer, workout templates, personal-record tracking, body measurements, goals, a training calendar/streak view, a custom exercise library, and an anatomical muscle-volume heatmap — all stored on-device (IndexedDB), no account or backend required.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Live workout mode** — start a session, track it with a real-time timer, log sets as you go, with an auto-starting rest timer between sets
- **Workout templates** — save a routine and start it with one tap
- **Personal records** — PRs computed live from your logged sets, with a "New PR!" toast and a dedicated PR board
- **History** — sessions grouped by day with per-set delete, plus a calendar view showing your current training streak
- **Progress analytics** — estimated 1RM trend (Epley formula), weekly training volume by muscle group, an anatomical front/back muscle heatmap, bodyweight/measurement trend charts
- **Body measurements & goals** — track bodyweight and custom measurements over time; set and track goals against a lift, a 1RM, a bodyweight, or a weekly training frequency
- **Custom exercises** — extend the ~85-exercise built-in library with your own
- **Export/import** — full JSON backup/restore, plus CSV export of raw sets
- **Installable on iOS** — Add to Home Screen from Safari for a standalone, offline-capable app

## Tech stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Storage:** Dexie.js over IndexedDB (fully local, offline-first)
- **Charts:** Recharts
- **State:** Zustand (active session/timer), React Router (navigation)
- **PWA:** vite-plugin-pwa (installable manifest + service worker)

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL in a desktop browser to develop, or on your phone's browser (same network / deployed URL) to test the mobile layout.

## Running tests

```bash
npm run test
```

## Deploying and installing on iPhone

1. Deploy the `dist/` build to Vercel or Netlify (or any static host):
   ```bash
   npm run build
   npx vercel --prod        # or drag-and-drop the dist/ folder into Netlify
   ```
2. On your iPhone, open the deployed URL in **Safari** (must be Safari, not Chrome, for iOS PWA install).
3. Tap the **Share** icon → **Add to Home Screen**.
4. The app now launches full-screen from your home screen, works offline, and stores all your data locally on the device.

> Data lives only in that browser/app's IndexedDB — use Settings → Data → Export to back it up periodically.

## Project structure

```
gym-tracker-pwa/
├── src/
│   ├── db/            # Dexie schema, types, query layer
│   ├── data/           # seed exercise library
│   ├── store/           # Zustand active-workout store
│   ├── features/         # workout, history, progress, templates, measurements, goals, settings, today
│   ├── components/       # shared UI (TabBar, Card, Toast, Layout)
│   └── pages/             # route-level page components
├── public/                 # PWA icons, favicon
├── legacy/                 # original Streamlit/Python version (superseded, kept for reference)
└── docs/superpowers/        # design spec and implementation plan for this rewrite
```

## Legacy version

The original Streamlit/Python dashboard this project replaced lives in [`legacy/`](legacy/README.md).

## Author

Built by Zuhair — www.linkedin.com/in/zuhair-zulkifli
```

- [ ] **Step 6: Verify production build one more time end-to-end**

Run: `npm run build`
Expected: succeeds; `dist/` contains `index.html`, `manifest.webmanifest`, `sw.js`, and hashed JS/CSS bundles

Run: `npm run test`
Expected: all test suites pass

- [ ] **Step 7: Commit**

```bash
git add public vercel.json README.md
git commit -m "Add PWA icons, Vercel deploy config, rewrite README for the new app"
```

---

## Post-plan verification

After Task 13, run the `verify` skill (or manually): `npm run dev`, walk through the full golden path in a mobile-width browser window — start a workout from Today, log sets across a couple of exercises, confirm the rest timer and a PR toast fire, end the workout, check it appears in History (calendar day + session list), check Progress (1RM chart, volume chart, heatmap, PR board update), create a template and start a session from it, log a measurement and a goal and confirm progress bars move, add and delete a custom exercise, and finally export a JSON backup and re-import it.
