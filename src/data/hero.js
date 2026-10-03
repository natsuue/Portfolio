// The Hero's background pattern and the flashlight around the mouse. Tune these live with the
// tweak panel (`npm run dev`, or add ?tweak to the URL), then paste its "Copy settings" output here.

export const heroSettings = {
  // The background pattern: one trace per `area` px² of screen (smaller = more lines), up to `max`.
  lines: { area: 9000, max: 170 },

  // The hidden white traces that only show under the flashlight.
  reveal: { area: 3600, max: 420, brightness: 0.5 },

  flashlight: {
    radius: 280, // px
    core: 32, // % of the radius that is fully lit
    falloff: 62, // % of the radius where the light has dropped to `edge`…
    edge: 0.5, // …strength there (0–1); it fades to nothing at the radius
    dim: 0.15, // how visible the pattern stays outside the light (0–1)
  },
};

// Components listen for this to rebuild after a tweak.
export const HERO_SETTINGS_EVENT = 'hero-settings';
