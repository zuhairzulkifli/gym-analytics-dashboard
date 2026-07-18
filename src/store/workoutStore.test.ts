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
