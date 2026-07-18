import { describe, it, expect } from "vitest";
import { volumeToHex } from "./heatmapColor";

describe("volumeToHex", () => {
  it("returns a muted slate that recedes into the UI when volume is zero", () => {
    expect(volumeToHex(0, 1000)).toBe("#1e293b");
  });

  it("returns the same muted slate when maxVolume is zero", () => {
    expect(volumeToHex(0, 0)).toBe("#1e293b");
  });

  it("returns a brighter, more vivid shade for higher volume (dark-UI heatmap: signal should pop, not recede)", () => {
    const low = volumeToHex(100, 1000);
    const high = volumeToHex(900, 1000);
    expect(low).toMatch(/^#[0-9a-f]{6}$/);
    expect(high).toMatch(/^#[0-9a-f]{6}$/);
    expect(low).not.toBe(high);

    // "brighter" = higher summed RGB channels, since both ramp toward blue-400
    const sum = (hex: string) =>
      [1, 3, 5].reduce((acc, i) => acc + parseInt(hex.slice(i, i + 2), 16), 0);
    expect(sum(high)).toBeGreaterThan(sum(low));
  });

  it("is deterministic for the same inputs", () => {
    expect(volumeToHex(500, 1000)).toBe(volumeToHex(500, 1000));
  });

  it("reaches the full vivid peak color at max volume", () => {
    expect(volumeToHex(1000, 1000)).toBe("#60a5fa");
  });
});
