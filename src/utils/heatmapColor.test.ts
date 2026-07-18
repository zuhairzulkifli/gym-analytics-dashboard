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
    expect(low).toMatch(/^#[0-9a-f]{6}$/);
    expect(high).toMatch(/^#[0-9a-f]{6}$/);
    expect(low).not.toBe(high);
  });

  it("is deterministic for the same inputs", () => {
    expect(volumeToHex(500, 1000)).toBe(volumeToHex(500, 1000));
  });
});
