import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import NSLogo from '../NSLogo.jsx';
import { generateBurst } from './generateBurst.js';
import { createBurstRenderer, makeTimeline, paletteFor } from './burstSystem.js';
import { densityFor, loaderConfig as config } from '../../data/loader.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// "Power-up" intro. index.html adds `is-booting` to <html> (skipped for direct links such as
// /#contact) and paints a static dim NS so the very first frame is already the logo. This
// component takes over and plays the circuit burst. Removing `is-booting` at the Hero handover
// is what lets the Hero's own entrance animations and the nav start.

const root = () => document.documentElement;
const nsSizeFor = (w) => Math.min(150, Math.max(88, w * 0.12)); // matches --ns-size in CSS
const smooth = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};
const PINS = Array.from({ length: 8 }, (_, i) => 2 + (60 * (i + 0.5)) / 8);
const rgb = (c) => `rgb(${c.join(',')})`;

function release() {
  root().classList.remove('is-booting');
  document.getElementById('boot')?.remove();
}

export default function LoadingScreen() {
  const reduced = useReducedMotion();
  const [playing] = useState(() => config.enabled && root().classList.contains('is-booting'));
  const [done, setDone] = useState(!playing);
  const screenRef = useRef(null);
  const canvasRef = useRef(null);
  const markRef = useRef(null);
  const litRef = useRef(null);
  const haloRef = useRef(null);
  const chipRef = useRef(null);

  const setup = useMemo(() => {
    if (!playing) return null;
    const width = window.innerWidth;
    const height = window.innerHeight;
    const { traces, look } = densityFor(width);
    return {
      burst: generateBurst({ width, height, nsSize: nsSizeFor(width), seed: config.seed, traces }),
      look,
      timeline: makeTimeline(config.timing),
      palette: paletteFor(look.hue),
    };
  }, [playing]);

  // Not playing (disabled, or a direct link): hand straight over.
  useLayoutEffect(() => {
    if (!playing) release();
  }, [playing]);

  useEffect(() => {
    if (!playing || !setup) return;
    window.scrollTo(0, 0);
    // The React version is now on screen; the static first frame can go.
    requestAnimationFrame(() => document.getElementById('boot')?.remove());

    const { burst, look, timeline } = setup;
    const { T } = timeline;
    const renderer = createBurstRenderer({ canvas: canvasRef.current, burst, look, eraseSpark: config.eraseSpark, timeline });
    const fit = () => renderer.resize(window.innerWidth, window.innerHeight, Math.min(window.devicePixelRatio || 1, window.innerWidth < 600 ? 1.5 : 2));
    fit();
    window.addEventListener('resize', fit);

    const screen = screenRef.current;
    const levels = (t, still = false) => {
      const lit = still ? 1 : timeline.nsLit(t, config.ns.settle);
      litRef.current.style.opacity = lit.toFixed(3);
      haloRef.current.style.opacity = (lit * 0.9).toFixed(3);
      markRef.current.style.opacity = (still ? 1 : timeline.nsMark(t)).toFixed(3);
      chipRef.current.style.opacity = ((still ? 1 : timeline.chip(t)) * config.ns.chipBright).toFixed(3);
    };

    let fontsReady = !document.fonts;
    document.fonts?.ready.then(() => (fontsReady = true));
    let raf = 0;
    let released = false;
    const start = performance.now();
    const finish = () => {
      if (!released) release();
      setDone(true);
    };
    const cleanup = () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', fit);
    };

    if (reduced) {
      // A still, fully drawn frame, a short hold, then a plain fade.
      renderer.render(0, { staticFrame: true });
      levels(0, true);
      const { hold, fade } = config.reduced;
      const tick = (now) => {
        const s = (now - start) / 1000;
        if (s >= hold && !released) {
          released = true;
          release();
        }
        screen.style.opacity = (1 - smooth((s - hold) / fade)).toFixed(3);
        if (s >= hold + fade) return finish();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return cleanup;
    }

    // Real elapsed time drives the sequence, so it stays on schedule on slow devices. The only
    // thing that can extend it: if fonts aren't ready, NS waits at rest just before ignition.
    const finishAt = timeline.finishAt(burst.reach, burst.visibleExtent);
    const holdAt = T.ignite - 0.05;
    let held = 0;
    const tick = (now) => {
      const elapsed = (now - start) / 1000;
      let t = elapsed - held;
      if (!fontsReady && t >= holdAt && elapsed < config.maxWait) {
        held = elapsed - holdAt;
        t = holdAt;
      }
      renderer.render(t);
      levels(t);
      screen.style.setProperty('--fade', (1 - timeline.reveal(t)).toFixed(3));
      if (t >= T.heroIn && !released) {
        released = true;
        release();
      }
      if (t >= finishAt) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return cleanup;
  }, [playing, setup, reduced]);

  if (done || !setup) return null;

  return (
    <div
      className="loader"
      ref={screenRef}
      aria-hidden="true"
      style={{ '--burst-core': rgb(setup.palette.core), '--burst-mid': rgb(setup.palette.mid) }}
    >
      <div className="loader__bg" />
      <canvas className="loader__burst" ref={canvasRef} />
      <svg className="loader__chip" ref={chipRef} viewBox="-10 -10 84 84" fill="none" strokeLinecap="round">
        <rect x="2" y="2" width="60" height="60" rx="7" strokeWidth="1.5" />
        <g strokeWidth="1.5">
          {PINS.map((v) => (
            <path key={v} d={`M${v} 2 V-6 M${v} 62 V70 M2 ${v} H-6 M62 ${v} H70`} />
          ))}
        </g>
      </svg>
      <div className="loader__ns" ref={markRef}>
        <span className="ns-layer ns-base">
          <NSLogo />
        </span>
        <span className="ns-layer ns-halo" ref={haloRef}>
          <NSLogo />
        </span>
        <span className="ns-layer ns-lit" ref={litRef}>
          <NSLogo />
        </span>
      </div>
    </div>
  );
}
