import { db } from "../schema";
import type { Measurement, MeasurementType } from "../types";

export async function logMeasurement(input: Omit<Measurement, "id">): Promise<number> {
  return db.measurements.add(input);
}

export async function listMeasurements(type?: MeasurementType): Promise<Measurement[]> {
  const all = await db.measurements.orderBy("date").toArray();
  return type ? all.filter((m) => m.type === type) : all;
}
