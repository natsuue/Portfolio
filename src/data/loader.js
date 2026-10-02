// The "power-up" intro that plays before the Hero: a circuit burst leaving the NS chip.
// These values were tuned in the prototype's Tweak panel ("Copy settings"). Times are in seconds
// from the start of the intro.

export const loaderConfig = {
  enabled: true,
  maxWait: 5, // longest the intro waits (at rest, before ignition) for fonts to load
  seed: 505, // the circuit layout; any number gives a different, stable layout

  timing: {
    ignite: 1, // NS + chip light up and the traces start growing
    growDur: 3, // traces travel from the chip out past the screen edges
    dimStart: 0.5,
    dimAmount: 0, // 0 = traces stay at full brightness
    nsFadeStart: 1.5, // NS + chip outline fade out together…
    nsFadeDur: 0.5,
    linkErase: true, // …and the erase starts the moment the chip is gone (eraseStart ignored)
    eraseStart: 1.65,
    eraseDur: 3, // the erase runs from the centre outward, like the growth in reverse
    heroIn: 2, // the Hero starts appearing underneath
    handoverDur: 1,
  },

  // Desktop values; smaller screens override some of them below.
  traces: {
    pins: 26, // traces per side of the chip
    stubRatio: 0.1,
    jogChance: 0.8,
    traceLength: 1.6,
    dottedRatio: 0,
    backLayers: 2, // fainter layers behind, for depth (0–2)
    backBright: 0.6,
    dataLines: 60,
    glints: 0.5,
  },
  density: {
    tablet: { pins: 20, dataLines: 40, glints: 0.4 },
    mobile: { pins: 13, backLayers: 1, dataLines: 30, glints: 0.3 },
  },

  look: {
    lineWidth: 1,
    brightness: 0.8,
    glow: 1,
    glowBlur: 10, // px
    hue: 206, // electric blue — used only in the intro
    coreDark: 0,
  },
  lookMobile: { glowBlur: 6 },

  ns: { settle: 0.95, chipBright: 0.95 },
  eraseSpark: true, // a bright spark leads the erase, like the growth tips

  // Reduced motion: a still, fully drawn frame, then a plain fade.
  reduced: { hold: 0.6, fade: 0.4 },

  // Reserved for a later optional status line (e.g. ['INITIALIZING SYSTEM', …]).
  statusText: null,
};

export function densityFor(width) {
  const c = loaderConfig;
  if (width < 600) return { traces: { ...c.traces, ...c.density.mobile }, look: { ...c.look, ...c.lookMobile } };
  if (width < 1000) return { traces: { ...c.traces, ...c.density.tablet }, look: c.look };
  return { traces: c.traces, look: c.look };
}
