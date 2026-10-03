import { useEffect, useState } from 'react';
import { HERO_SETTINGS_EVENT, heroSettings } from '../data/hero.js';
import '../styles/tweaks.css';

// Temporary tuning panel for the Hero's background pattern and flashlight. Shown in `npm run dev`
// or with ?tweak in the URL (see App.jsx). Changes apply live and are kept in this browser; "Copy
// settings" gives the values to paste into src/data/hero.js. Remove once the values are settled.

const STORE = 'hero-tweaks';
const DEFAULTS = JSON.parse(JSON.stringify(heroSettings));

const CONTROLS = [
  {
    title: 'Background lines',
    rows: [
      { group: 'lines', key: 'area', label: 'Spacing (smaller = more lines)', min: 2000, max: 30000, step: 500 },
      { group: 'lines', key: 'max', label: 'Most lines allowed', min: 20, max: 400, step: 10 },
    ],
  },
  {
    title: 'White traces under the light',
    rows: [
      { group: 'reveal', key: 'area', label: 'Spacing (smaller = more lines)', min: 1200, max: 20000, step: 200 },
      { group: 'reveal', key: 'max', label: 'Most lines allowed', min: 40, max: 800, step: 20 },
      { group: 'reveal', key: 'brightness', label: 'Brightness', min: 0.05, max: 1, step: 0.05 },
    ],
  },
  {
    title: 'Flashlight',
    rows: [
      { group: 'flashlight', key: 'radius', label: 'Size (px)', min: 100, max: 700, step: 10 },
      { group: 'flashlight', key: 'core', label: 'Fully lit centre (%)', min: 0, max: 90, step: 1 },
      { group: 'flashlight', key: 'falloff', label: 'Fade point (%)', min: 10, max: 100, step: 1 },
      { group: 'flashlight', key: 'edge', label: 'Strength at fade point', min: 0, max: 1, step: 0.05 },
      { group: 'flashlight', key: 'dim', label: 'Pattern outside the light', min: 0, max: 1, step: 0.05 },
    ],
  },
];

const notify = () => window.dispatchEvent(new Event(HERO_SETTINGS_EVENT));

function save() {
  try {
    const { lines, reveal, flashlight } = heroSettings;
    localStorage.setItem(STORE, JSON.stringify({ lines, reveal, flashlight }));
  } catch {
    /* storage unavailable: tweaks just won't survive a reload */
  }
}

function snippet() {
  const { lines: l, reveal: r, flashlight: f } = heroSettings;
  return [
    `  lines: { area: ${l.area}, max: ${l.max} },`,
    `  reveal: { area: ${r.area}, max: ${r.max}, brightness: ${r.brightness} },`,
    `  flashlight: { radius: ${f.radius}, core: ${f.core}, falloff: ${f.falloff}, edge: ${f.edge}, dim: ${f.dim} },`,
  ].join('\n');
}

// how many lines a setting gives on the Hero right now (mirrors makeTraces in HeroCanvas)
function lineCount({ area, max }) {
  const field = document.querySelector('.hero__field');
  if (!field) return 0;
  const { width, height } = field.getBoundingClientRect();
  return Math.max(24, Math.min(max, Math.round((width * height) / area)));
}

export default function HeroTweaks() {
  const [open, setOpen] = useState(true);
  const [, setVersion] = useState(0);
  const [keepLit, setKeepLit] = useState(false);
  const [copied, setCopied] = useState('');
  const refresh = () => setVersion((v) => v + 1);

  // restore this browser's last tweaks
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || 'null');
      if (saved) {
        for (const group of ['lines', 'reveal', 'flashlight']) Object.assign(heroSettings[group], saved[group]);
        notify();
        refresh();
      }
    } catch {
      /* ignore unreadable storage */
    }
    return () => {
      heroSettings.keepLit = false;
    };
  }, []);

  const set = (group, key, value) => {
    heroSettings[group][key] = value;
    save();
    notify();
    refresh();
  };

  const reset = () => {
    for (const group of ['lines', 'reveal', 'flashlight']) Object.assign(heroSettings[group], DEFAULTS[group]);
    try {
      localStorage.removeItem(STORE);
    } catch {
      /* ignore */
    }
    notify();
    refresh();
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippet());
      setCopied('Copied. Paste over the three settings in src/data/hero.js.');
    } catch {
      setCopied(snippet());
    }
  };

  const toggleKeepLit = (on) => {
    setKeepLit(on);
    heroSettings.keepLit = on;
    const field = document.querySelector('.hero__field');
    // relight at the last mouse position (the light went out when the mouse moved to this panel)
    if (on && field?.style.getPropertyValue('--lx')) field.classList.add('is-lit');
    if (!on) field?.classList.remove('is-lit');
  };

  return (
    <aside className={`tweaks${open ? '' : ' is-closed'}`} aria-label="Hero tuning panel">
      <button type="button" className="tweaks__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span>Hero tweaks</span>
        <span aria-hidden="true">{open ? '–' : '+'}</span>
      </button>
      {open && (
        <div className="tweaks__body">
          <label className="tweaks__check">
            <input type="checkbox" checked={keepLit} onChange={(e) => toggleKeepLit(e.target.checked)} />
            Keep the light on while adjusting (move the mouse over the Hero once first)
          </label>
          {CONTROLS.map((section) => (
            <fieldset key={section.title} className="tweaks__group">
              <legend>
                {section.title}
                {section.rows[0].group !== 'flashlight' && (
                  <span className="tweaks__count">
                    {' '}
                    · {lineCount(heroSettings[section.rows[0].group])} lines on this screen
                    {lineCount(heroSettings[section.rows[0].group]) === heroSettings[section.rows[0].group].max &&
                      ' (at the limit: raise “Most lines allowed”)'}
                  </span>
                )}
              </legend>
              {section.rows.map((row) => {
                const value = heroSettings[row.group][row.key];
                const def = DEFAULTS[row.group][row.key];
                const changed = value !== def;
                return (
                  <div key={row.key} className="tweaks__row">
                    <label>
                      <span className="tweaks__label">
                        {row.label}
                        <output>{value}</output>
                      </span>
                      {/* the tick on the track marks the default value */}
                      <span className="tweaks__track" style={{ '--p': (def - row.min) / (row.max - row.min) }}>
                        <span className="tweaks__tick" aria-hidden="true" />
                        <input
                          type="range"
                          min={row.min}
                          max={row.max}
                          step={row.step}
                          value={value}
                          onChange={(e) => set(row.group, row.key, Number(e.target.value))}
                        />
                      </span>
                    </label>
                    <span className="tweaks__default">
                      Default {def}
                      {changed && (
                        <button type="button" onClick={() => set(row.group, row.key, def)}>
                          use
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </fieldset>
          ))}
          <div className="tweaks__actions">
            <button type="button" onClick={copy}>
              Copy settings
            </button>
            <button type="button" onClick={reset}>
              Reset
            </button>
          </div>
          {copied && <pre className="tweaks__note">{copied}</pre>}
        </div>
      )}
    </aside>
  );
}
