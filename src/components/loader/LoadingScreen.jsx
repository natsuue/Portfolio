import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import NSLogo from '../NSLogo.jsx';
import CircuitNetwork from './CircuitNetwork.jsx';
import { createPulseSystem } from './pulseSystem.js';
import { densityFor, generateCircuit } from './generateCircuit.js';
import { loaderConfig as config } from '../../data/loader.js';
import useReducedMotion from '../../hooks/useReducedMotion.js';

// "Power-up" intro. index.html adds `is-booting` to <html> (skipped for direct links such as
// /#contact) and paints a static NS so the very first frame is already the logo. This
// component takes over, plays the sequence, then removes `is-booting` — which is what lets
// the Hero's own entrance animations and the nav start.

const root = () => document.documentElement;
const logoSizeFor = (w) => Math.min(150, Math.max(88, w * 0.12)); // matches --ns-size in CSS

function release() {
  root().classList.remove('is-booting');
  document.getElementById('boot')?.remove();
}

const easeOut = (t) => 1 - (1 - t) ** 3;

export default function LoadingScreen() {
  const reduced = useReducedMotion();
  const [playing] = useState(() => config.enabled && root().classList.contains('is-booting'));
  const [done, setDone] = useState(!playing);
  const screenRef = useRef(null);
  const els = useRef({ lit: [], halo: [], pulse: [], nodes: [], components: [], ring: null, root: null }).current;

  const circuit = useMemo(() => {
    if (!playing) return null;
    const width = window.innerWidth;
    const height = window.innerHeight;
    return generateCircuit({
      width,
      height,
      logoSize: logoSizeFor(width),
      seed: config.seed,
      ...densityFor(width, config.density),
    });
  }, [playing]);

  // Not playing (disabled, or a direct link): hand straight over.
  useLayoutEffect(() => {
    if (!playing) release();
  }, [playing]);

  useEffect(() => {
    if (!playing || !circuit) return;
    els.root = screenRef.current;
    window.scrollTo(0, 0);
    // The React version is now on screen; the static first frame can go.
    requestAnimationFrame(() => document.getElementById('boot')?.remove());

    const system = createPulseSystem({ circuit, config, els });
    const screen = screenRef.current;
    let fontsReady = !document.fonts;
    document.fonts?.ready.then(() => (fontsReady = true));

    let raf = 0;
    let released = false;
    const start = performance.now();
    let last = start;
    let t = 0;

    const dissolve = (k) => {
      const e = easeOut(Math.min(1, Math.max(0, k)));
      screen.style.setProperty('--fade', (1 - e).toFixed(3));
      screen.style.setProperty('--dissolve', e.toFixed(3));
    };
    const finish = () => {
      if (!released) release();
      setDone(true);
    };

    if (reduced) {
      // Static lit board, a short hold, then a plain fade.
      system.renderStatic(config.persist.at(-1));
      const { hold, fade } = config.reduced;
      const tick = (now) => {
        const s = (now - start) / 1000;
        if (s >= hold && !released) {
          released = true;
          release();
        }
        dissolve((s - hold) / fade);
        if (s >= hold + fade) return finish();
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }

    const finalAt = config.pulses.find((p) => p.final)?.at ?? config.pulses.at(-1).at;
    const holdAt = finalAt - 0.1;
    const { start: dStart, duration: dDur } = config.dissolve;

    const tick = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const elapsed = (now - start) / 1000;
      // Wait (breathing gently) before the final pulse if fonts aren't ready — up to maxWait.
      const waiting = !fontsReady && t + dt >= holdAt && elapsed < config.maxWait;
      if (waiting) {
        t = holdAt;
        system.render(t, { breathe: (Math.sin(now / 420) + 1) / 2 });
      } else {
        t += dt;
        system.render(t);
      }

      if (t >= dStart) {
        if (!released) {
          released = true;
          release();
        }
        const k = (t - dStart) / dDur;
        dissolve(k);
        if (k >= 1) return finish();
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, circuit, reduced, els]);

  if (done || !circuit) return null;

  return (
    <div className="loader" ref={screenRef} aria-hidden="true">
      <div className="loader__bg" />
      <CircuitNetwork circuit={circuit} tail={config.tail} els={els} />
      <div className="loader__glow" />
      <div className="loader__ns">
        <NSLogo className="ns-base" />
        <NSLogo className="ns-halo" />
        <NSLogo className="ns-lit" />
      </div>
    </div>
  );
}
