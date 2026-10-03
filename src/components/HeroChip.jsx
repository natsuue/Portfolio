import { useEffect, useRef } from 'react';
import { NS_PADS, NS_TRACES } from './NSLogo.jsx';
import { loaderConfig as config } from '../data/loader.js';
import { release } from '../utils/boot.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

// The NS chip on the right of the Hero, drawn on a canvas that covers the whole Hero so its
// traces can run off-screen. It also plays the intro: the chip is in place from the first frame,
// lights up, its traces escape past the screen edges and settle back to their resting length,
// and the Hero copy comes in (see src/data/loader.js). Afterwards a pulse runs along each trace.
//
// The chip is also a button (rendered by Hero over the chip): hovering or focusing it lifts the
// chip, lights its pins and runs a light round its edge; clicking or tapping it replays the escape.

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x) => {
  const t = clamp01(x);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function rng(seed) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function withLengths(pts) {
  const l = [];
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    l.push(d);
    len += d;
  }
  return { pts, l, len };
}

// One route per pin, in the Hero's routing style (straight runs with 45° jogs). The first part is
// the resting trace; the route keeps going until it is past the screen edge (the escape).
function buildChip(w, h, slot) {
  const size = slot.width;
  const cx = slot.x + size / 2;
  const cy = slot.y + slot.height / 2;
  const half = size * 0.18;
  const rand = rng(config.seed);
  const diag = Math.hypot(w, h);
  const traces = [];
  for (let s = 0; s < 4; s++) {
    const an = (s * Math.PI) / 2;
    const tn = an + Math.PI / 2;
    for (let i = 0; i < config.pins; i++) {
      const o = (((i + 0.5) / config.pins) * 2 - 1) * half * 0.82;
      let x = Math.cos(an) * half * 1.12 + Math.cos(tn) * o;
      let y = Math.sin(an) * half * 1.12 + Math.sin(tn) * o;
      const pts = [[x, y]];
      const restTarget = size * (0.2 + rand() * 0.32);
      let heading = an;
      let len = 0;
      let rest = null;
      for (let guard = 0; guard < 400; guard++) {
        const run = 12 + rand() * 44;
        x += Math.cos(heading) * run;
        y += Math.sin(heading) * run;
        pts.push([x, y]);
        len += run;
        if (rest === null && len >= restTarget) rest = len;
        heading = rand() < 0.42 ? an + ((rand() < 0.5 ? 1 : -1) * Math.PI) / 4 : an;
        const ax = cx + x;
        const ay = cy + y;
        if (rest !== null && (ax < -40 || ax > w + 40 || ay < -40 || ay > h + 40)) break;
        if (len > diag * 1.2) break;
      }
      traces.push({ ...withLengths(pts), rest: rest ?? len, phase: rand() * 3, pad: rand() < 0.5 });
    }
  }
  return { cx, cy, half, traces, maxLen: Math.max(...traces.map((t) => t.len)) };
}

export default function HeroChip({ slotRef, hitRef, playing }) {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();
  // The intro clock lives outside the effect so a re-run (e.g. reduced motion toggled) doesn't restart it.
  const clock = useRef({ start: 0, held: 0, released: !playing });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const css = getComputedStyle(document.documentElement);
    const accent = css.getPropertyValue('--accent-rgb').trim() || '71, 175, 255';
    const text = css.getPropertyValue('--text-rgb').trim() || '236, 235, 230';
    const chipFill = css.getPropertyValue('--bg-2').trim() || '#0f1114';
    const spark = accent
      .split(',')
      .map((c) => Math.round(+c + (255 - c) * 0.85))
      .join(', ');
    const nsPaths = NS_TRACES.map((d) => new Path2D(d));
    const T = config.timing;
    const settledAt = T.settleStart + T.settleDur;
    const c = clock.current;

    if (!c.start) {
      const intro = playing && !reduced;
      c.start = intro ? performance.now() : performance.now() - (settledAt + config.hint.firstAfter) * 1000;
      if (intro) window.scrollTo(0, 0);
    }
    if (reduced && !c.released) {
      c.released = true;
      release();
    }

    let w = 0, h = 0, dpr = 1, chip = null;
    let raf = 0, last = performance.now(), inView = true;
    let hover = 0, hoverOn = false, fireAt = -99, pressAt = -99, tNow = 0;
    let fontsReady = !document.fonts;
    document.fonts?.ready.then(() => (fontsReady = true));

    const build = () => {
      const r = canvas.getBoundingClientRect();
      const sr = slotRef.current.getBoundingClientRect();
      w = r.width;
      h = r.height;
      dpr = Math.min(window.devicePixelRatio || 1, w < 600 ? 1.5 : 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      chip = buildChip(w, h, { x: sr.left - r.left, y: sr.top - r.top, width: sr.width, height: sr.height });
    };

    // stroke part of a trace, from distance a to b along it
    const seg = (t, a, b) => {
      let acc = 0, started = false;
      ctx.beginPath();
      for (let i = 0; i < t.l.length; i++) {
        const p0 = acc, p1 = acc + t.l[i];
        acc = p1;
        if (p1 < a) continue;
        if (p0 > b) break;
        const [px, py] = t.pts[i], [qx, qy] = t.pts[i + 1];
        const f0 = Math.max(0, (a - p0) / t.l[i]), f1 = Math.min(1, (b - p0) / t.l[i]);
        if (!started) {
          ctx.moveTo(chip.cx + px + (qx - px) * f0, chip.cy + py + (qy - py) * f0);
          started = true;
        }
        ctx.lineTo(chip.cx + px + (qx - px) * f1, chip.cy + py + (qy - py) * f1);
      }
      ctx.stroke();
    };
    const pointAt = (t, d) => {
      let acc = 0;
      for (let i = 0; i < t.l.length; i++) {
        if (acc + t.l[i] >= d) {
          const f = (d - acc) / t.l[i], [px, py] = t.pts[i], [qx, qy] = t.pts[i + 1];
          return [chip.cx + px + (qx - px) * f, chip.cy + py + (qy - py) * f];
        }
        acc += t.l[i];
      }
      const e = t.pts[t.pts.length - 1];
      return [chip.cx + e[0], chip.cy + e[1]];
    };
    const drawSpark = ([x, y], a) => {
      ctx.fillStyle = `rgba(${spark}, ${a})`;
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = `rgba(${accent}, ${a * 0.25})`;
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };

    const draw = (t, dt) => {
      const { cx, cy, half, traces, maxLen } = chip;
      const live = !reduced && t > settledAt; // the chip responds once the intro has settled
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      hover += ((hoverOn && live ? 1 : 0) - hover) * Math.min(1, dt * 12);
      const grow = easeOut((t - T.escapeStart) / T.escapeDur);
      const settle = easeInOut((t - T.settleStart) / T.settleDur);
      const fa = t - fireAt, { out: fOut, back: fBack } = config.fire;
      const fire = fa < 0 || fa > fOut + fBack ? 0 : fa < fOut ? easeOut(fa / fOut) : 1 - easeInOut((fa - fOut) / fBack);

      for (const tr of traces) {
        const reach = grow * maxLen;
        if (reach <= 0) continue;
        const tip = Math.min(tr.len, reach); // escaping tip
        let end = settle > 0 ? tr.len - (tr.len - tr.rest) * settle : tip; // retracting far end
        if (fire > 0) end = tr.rest + (tr.len - tr.rest) * fire;
        const visible = Math.min(tip, end);
        const lit = Math.max(1 - smooth((t - T.settleStart - T.settleDur * 0.6) / 0.6), fire); // the long route glows while it travels
        ctx.strokeStyle = `rgba(${text}, ${(0.16 + 0.2 * lit).toFixed(3)})`;
        ctx.lineWidth = 1;
        seg(tr, 0, visible);
        if (lit > 0.01) {
          ctx.strokeStyle = `rgba(${accent}, ${(0.55 * lit).toFixed(3)})`;
          ctx.lineWidth = 1.2;
          seg(tr, Math.max(0, visible - 120), visible);
        }
        if (tip < tr.len && settle <= 0) drawSpark(pointAt(tr, tip), 0.95);
        if (((settle > 0 && settle < 1) || fire > 0) && visible > tr.rest + 1) drawSpark(pointAt(tr, visible), 0.9);
        if (settle >= 1) {
          const [ex, ey] = pointAt(tr, tr.rest);
          ctx.beginPath();
          ctx.arc(ex, ey, tr.pad ? 2 : 2.4, 0, Math.PI * 2);
          if (tr.pad) {
            ctx.fillStyle = `rgba(${accent}, 0.55)`;
            ctx.fill();
          } else {
            ctx.strokeStyle = `rgba(${text}, 0.3)`;
            ctx.stroke();
          }
          if (!reduced && fire <= 0) {
            const head = (((t + tr.phase) % 3) / 3) * (tr.rest + 18);
            ctx.strokeStyle = `rgba(${accent}, 0.9)`;
            ctx.lineWidth = 1.4;
            seg(tr, Math.max(0, head - 18), Math.min(tr.rest, head));
          }
        }
      }

      // "This is tappable": the pins light up on hover…
      if (hover > 0.01) {
        ctx.strokeStyle = `rgba(${accent}, ${(0.9 * hover).toFixed(3)})`;
        ctx.lineWidth = 1.6;
        for (const tr of traces) seg(tr, 0, 6 + 10 * hover);
      }

      // the chip: dim at rest, lit at ignition with a brief soft glow; it lifts on hover and dips when pressed
      const lit = smooth((t - T.ignite + 0.05) / 0.12);
      const flare = Math.max(0, lit - smooth((t - T.ignite - 0.1) / 1) * 0.9, fire * 0.6);
      const pa = t - pressAt;
      const press = pa >= 0 && pa < 0.3 ? Math.sin((Math.PI * pa) / 0.3) * 0.045 : 0;
      const scale = 1 + 0.045 * hover - press;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(scale, scale);
      ctx.translate(-cx, -cy);
      ctx.save();
      const glow = Math.max(0.7 * flare, 0.45 * hover);
      if (glow > 0.01) {
        ctx.shadowColor = `rgba(${accent}, ${glow.toFixed(3)})`;
        ctx.shadowBlur = Math.max(28 * flare, 22 * hover);
      }
      ctx.fillStyle = chipFill;
      ctx.strokeStyle = `rgba(${accent}, ${Math.min(1, 0.25 + 0.6 * lit + 0.15 * hover).toFixed(3)})`;
      ctx.lineWidth = 1.5 + 0.5 * hover;
      ctx.beginPath();
      ctx.roundRect(cx - half, cy - half, half * 2, half * 2, half * 0.16);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      const k = (half * 1.22) / 64;
      ctx.translate(cx - 32 * k, cy - 32 * k);
      ctx.scale(k, k);
      ctx.lineWidth = 4.5;
      ctx.strokeStyle = `rgba(${text}, ${(0.35 + 0.65 * lit).toFixed(3)})`;
      nsPaths.forEach((p) => ctx.stroke(p));
      ctx.fillStyle = `rgba(${accent}, ${(0.3 + 0.7 * lit).toFixed(3)})`;
      NS_PADS.forEach(([x, y], j) => {
        ctx.beginPath();
        ctx.arc(x, y, 3.6 + hover * (0.8 + 0.8 * Math.sin(t * 5 - j * 1.4)), 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();

      // …and a short light runs round the edge: continuously on hover, once every few seconds otherwise
      const { every, dur, firstAfter } = config.hint;
      const idleAge = live ? t - Math.max(fireAt + fOut + fBack, settledAt + firstAfter) : -1;
      const hint = hover < 0.05 && idleAge > 0 ? (idleAge % every) / dur : 9;
      const edge = live ? Math.max(hover, hint < 1 ? Math.sin(Math.PI * hint) : 0) : 0;
      if (edge > 0.01) {
        const r = half * 0.16;
        const perimeter = 8 * half - (8 - 2 * Math.PI) * r;
        const dash = perimeter * 0.18;
        const pos = hint < 1 && hover < 0.05 ? hint * perimeter : ((t / 1.6) % 1) * perimeter;
        ctx.save();
        ctx.setLineDash([dash, perimeter - dash]);
        ctx.lineDashOffset = -pos;
        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(${spark}, ${(0.95 * edge).toFixed(3)})`;
        ctx.shadowColor = `rgba(${accent}, 0.9)`;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.roundRect(cx - half, cy - half, half * 2, half * 2, r);
        ctx.stroke();
        ctx.restore();
      }
      ctx.restore();
    };

    // Real elapsed time drives the intro, so it stays on schedule on slow devices. The only thing
    // that can extend it: if fonts aren't ready, the chip waits (dim) just before it lights up.
    const timeNow = (now) => {
      if (reduced) return 99;
      const elapsed = (now - c.start) / 1000;
      const holdAt = T.ignite - 0.05;
      if (!fontsReady && !c.released && elapsed - c.held >= holdAt && elapsed < config.maxWait) c.held = elapsed - holdAt;
      return elapsed - c.held;
    };
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const t = timeNow(now);
      tNow = t;
      if (!c.released && t >= T.textIn) {
        c.released = true;
        release();
      }
      draw(t, dt);
      raf = requestAnimationFrame(tick);
    };
    const start = () => {
      if (reduced || raf || !inView || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const redraw = () => {
      build();
      if (reduced) draw(99, 0);
    };

    redraw();
    start();

    // the chip button
    const hit = hitRef?.current;
    const onEnter = (e) => e.pointerType === 'mouse' && (hoverOn = true);
    const onLeave = () => (hoverOn = false);
    const onFocus = () => (hoverOn = hit.matches(':focus-visible'));
    const onClick = () => {
      if (tNow <= settledAt || tNow - fireAt < config.fire.cooldown) return;
      pressAt = tNow;
      fireAt = tNow + 0.12;
    };
    if (hit) {
      hit.addEventListener('pointerenter', onEnter);
      hit.addEventListener('pointerleave', onLeave);
      hit.addEventListener('focus', onFocus);
      hit.addEventListener('blur', onLeave);
      hit.addEventListener('click', onClick);
    }

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(redraw, 150);
    });
    ro.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      inView ? start() : stop();
    });
    io.observe(canvas);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stop();
      clearTimeout(resizeTimer);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      if (hit) {
        hit.removeEventListener('pointerenter', onEnter);
        hit.removeEventListener('pointerleave', onLeave);
        hit.removeEventListener('focus', onFocus);
        hit.removeEventListener('blur', onLeave);
        hit.removeEventListener('click', onClick);
      }
    };
  }, [reduced, playing, slotRef, hitRef]);

  return <canvas ref={canvasRef} className="hero__chip-canvas" aria-hidden="true" />;
}
