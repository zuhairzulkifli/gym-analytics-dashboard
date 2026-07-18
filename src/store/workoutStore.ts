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
