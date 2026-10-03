// The "power-up" intro and the Hero chip's interaction. The NS chip sits in its Hero spot from
// the first frame: it lights up, its traces escape past the screen edges, then settle back to
// their short resting length as the Hero copy comes in. Chosen from the mockups on 2026-10-03
// ("Escape, then settle", no glow ring; interaction option 6). Times are in seconds from the
// start of the intro.

export const loaderConfig = {
  enabled: true,
  maxWait: 5, // longest the chip waits (dim, before lighting up) for fonts to load
  seed: 206, // the trace layout; any number gives a different, stable layout
  pins: 6, // traces per side of the chip

  timing: {
    ignite: 0.9, // the chip lights up
    escapeStart: 1.0, // traces race out past the screen edges…
    escapeDur: 1.2,
    settleStart: 2.0, // …then their far ends retract to the resting length
    settleDur: 1.0,
    textIn: 2.0, // the Hero copy and the nav come in (the background pattern follows 0.2 s later, in CSS)
  },

  // Clicking or tapping the chip replays the escape.
  fire: { out: 0.55, back: 0.8, cooldown: 1.4 },

  // Without hover (phones), a light runs once round the chip's edge every few seconds as a hint
  // that it can be tapped.
  hint: { every: 6, dur: 1.3, firstAfter: 1.5 },
};
