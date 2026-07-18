// Color ramp for the muscle-group heatmap, tuned for the app's dark UI.
//
// The original implementation reused matplotlib's light-to-dark "Blues"
// ramp verbatim: low volume -> pale blue, high volume -> near-black navy.
// That ramp assumes a white/paper background, where dark = high-value. On
// this app's dark navy body (#0f172a), the inverse happens: the most-
// trained muscle group renders nearly invisible (blending into the page),
// while an untrained group renders as the brightest element on screen.
// That's backwards for a heatmap — the data with the most signal should
// have the most visual weight.
//
// This ramp fixes the encoding for a dark surface: untrained recedes into
// the UI's own muted tones, and volume ramps toward a vivid, glowing color.
//
// Recalibrated for the warm editorial palette (near-black + terracotta):
// untrained matches --surface-raised, trained ramps toward --accent-text.
const UNTRAINED = "#2b241b"; // surface-raised — recedes into the card, correctly deprioritized
const TRAINED_FLOOR = { r: 58, g: 42, b: 30 }; // dim warm brown — visible but quiet, for barely-trained groups
const TRAINED_PEAK = { r: 224, g: 138, b: 95 }; // accent-text — vivid terracotta glow, for the most-trained group

function toHex(n: number): string {
  return Math.round(n).toString(16).padStart(2, "0");
}

export function volumeToHex(volume: number, maxVolume: number): string {
  if (maxVolume <= 0 || volume <= 0) return UNTRAINED;

  const t = Math.min(volume / maxVolume, 1);
  const r = TRAINED_FLOOR.r + (TRAINED_PEAK.r - TRAINED_FLOOR.r) * t;
  const g = TRAINED_FLOOR.g + (TRAINED_PEAK.g - TRAINED_FLOOR.g) * t;
  const b = TRAINED_FLOOR.b + (TRAINED_PEAK.b - TRAINED_FLOOR.b) * t;

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
