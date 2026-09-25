// The "power-up" intro that plays before the Hero.
// Times are in seconds from the start of the sequence; `reach` is how far a pulse travels, as a
// fraction of the whole circuit's radius. The circuit layout is generated from `seed`, so it
// looks the same on every visit (for a given screen size).

export const loaderConfig = {
  enabled: true,
  maxWait: 5, // longest the intro waits for fonts before handing over anyway
  seed: 20260926,

  // Circuit density per screen size.
  density: {
    desktop: { grid: 24, roots: 24, maxDepth: 11, branchChance: 0.4, maxEdges: 360, componentChance: 0.16 },
    tablet: { grid: 24, roots: 18, maxDepth: 9, branchChance: 0.34, maxEdges: 240, componentChance: 0.14 },
    mobile: { grid: 22, roots: 12, maxDepth: 8, branchChance: 0.3, maxEdges: 150, componentChance: 0.12 },
  },

  // Each pulse leaves NS at `at` and reaches further than the last; the final one runs past
  // the edges of the board.
  pulses: [
    { at: 0.35, reach: 0.32 },
    { at: 1.0, reach: 0.56 },
    { at: 1.7, reach: 0.8 },
    { at: 2.4, reach: 1, final: true },
  ],
  pulseSpeed: 1.15, // circuit radii per second
  tail: 70, // length of a pulse's glowing head, in px
  persist: [0.14, 0.2, 0.27, 0.42], // how lit the traces stay after each pulse
  nsRest: 0.04, // NS glow between pulses (0–1)

  // Soft glow as the final wave clears the board, then the dissolve into the Hero.
  glow: 0.2,
  dissolve: { start: 3.05, duration: 0.5 },

  // Reduced motion: a static lit circuit, then a quick fade.
  reduced: { hold: 0.5, fade: 0.4 },

  // Reserved for a later optional status line (e.g. ['INITIALIZING SYSTEM', …]).
  statusText: null,
};
