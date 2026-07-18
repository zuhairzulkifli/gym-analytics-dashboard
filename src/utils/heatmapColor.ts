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
