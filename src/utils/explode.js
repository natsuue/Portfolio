// Timing for the exploded view: how far each part has moved at a given scroll progress.
// Kept free of three.js so the section can use it before the 3D chunk has loaded.

const HOLD_START = 0.06; // assembled, before anything moves
const HOLD_END = 0.88; // fully exploded, before the section scrolls away

export const clamp01 = (n) => Math.min(1, Math.max(0, n));
export const easeInOut = (t) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export const stepCount = (parts) => Math.max(0, ...parts.map((p) => p.step)) + 1;

// Overall explode progress (0–1) once the hold at each end is removed.
export const explodeProgress = (p) => clamp01((p - HOLD_START) / (HOLD_END - HOLD_START));

// 0 = in place, 1 = fully exploded. Parts start one after another, with overlapping windows.
export function partAmount(p, step, count) {
  if (step < 0) return 0;
  const t = explodeProgress(p);
  const width = Math.min(1, 1.6 / count);
  const start = count > 1 ? (step * (1 - width)) / (count - 1) : 0;
  return easeInOut(clamp01((t - start) / width));
}

// Index of the part that most recently started moving (the chassis, index 0, when none has).
export function activePart(parts, p) {
  const count = stepCount(parts);
  let active = 0;
  let best = -1;
  parts.forEach((part, i) => {
    if (part.step > best && partAmount(p, part.step, count) > 0.05) {
      best = part.step;
      active = i;
    }
  });
  return active;
}
