// The Hero's background pattern and the flashlight around the mouse. Tune these live with the
// tweak panel (`npm run dev`, or add ?tweak to the URL), then paste its "Copy settings" output here.

export const heroSettings = {
  // The background pattern: one trace per `area` px² of screen (smaller = more lines), up to `max`.
  lines: { area: 2000, max: 400 },

  // The hidden white traces that only show under the flashlight.
  reveal: { area: 20000, max: 100, brightness: 1 },

  flashlight: {
    radius: 280, // px
    core: 32, // % of the radius that is fully lit
    falloff: 62, // % of the radius where the light has dropped to `edge`…
    edge: 0.5, // …strength there (0–1); it fades to nothing at the radius
    dim: 0.15, // how visible the lines stay outside the light (0–1)
    pulses: 0.6, // how visible the moving blue pulses stay outside the light (0–1)
  },
};

// Components listen for this to rebuild after a tweak.
export const HERO_SETTINGS_EVENT = 'hero-settings';
