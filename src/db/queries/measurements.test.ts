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
