import { useEffect, useRef } from 'react';
import useReducedMotion from '../hooks/useReducedMotion.js';

// Procedural PCB-style traces with signal pulses travelling along them.
// Static traces are drawn once to an offscreen canvas; each frame only adds the pulses.

const GRID = 28;
const PULSE = 64;
const DIRS = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];

function makeTraces(w, h) {
  const count = Math.max(24, Math.min(110, Math.round((w * h) / 15000)));
  const traces = [];
  for (let i = 0; i < count; i++) {
    let x = Math.round((Math.random() * w) / GRID) * GRID;
    let y = Math.round((Math.random() * h) / GRID) * GRID;
    let d = Math.floor(Math.random() * 4) * 2; // start orthogonal
    const pts = [[x, y]];
    const segs = 2 + Math.floor(Math.random() * 3);
    for (let s = 0; s < segs; s++) {
      const steps = 2 + Math.floor(Math.random() * 6);
      x += DIRS[d][0] * steps * GRID;
      y += DIRS[d][1] * steps * GRID;
      pts.push([x, y]);
      d = (d + (Math.random() < 0.5 ? 1 : 7)) % 8; // turn ±45°
    }
    const lens = [];
    let len = 0;
    for (let s = 0; s < pts.length - 1; s++) {
      const l = Math.hypot(pts[s + 1][0] - pts[s][0], pts[s + 1][1] - pts[s][1]);
      lens.push(l);
      len += l;
    }
    traces.push({ pts, lens, len, speed: 70 + Math.random() * 120, head: -Math.random() * len * 3 });
  }
  return traces;
}

function strokeBetween(ctx, t, a, b) {
  let acc = 0;
  let started = false;
  ctx.beginPath();
  for (let i = 0; i < t.lens.length; i++) {
    const s0 = acc;
    const s1 = acc + t.lens[i];
    acc = s1;
    if (s1 < a) continue;
    if (s0 > b) break;
    const [px, py] = t.pts[i];
    const [qx, qy] = t.pts[i + 1];
    const t0 = Math.max(0, (a - s0) / t.lens[i]);
    const t1 = Math.min(1, (b - s0) / t.lens[i]);
    if (!started) {
      ctx.moveTo(px + (qx - px) * t0, py + (qy - py) * t0);
      started = true;
    }
    ctx.lineTo(px + (qx - px) * t1, py + (qy - py) * t1);
  }
  ctx.stroke();
}

export default function HeroCanvas() {
  const canvasRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#47afff';
    const base = document.createElement('canvas');
    let w = 0, h = 0, dpr = 1, traces = [], raf = 0, last = 0, visible = true;

    const drawBase = () => {
      const b = base.getContext('2d');
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.clearRect(0, 0, w, h);
      b.fillStyle = 'rgba(236, 235, 230, 0.07)';
      for (let x = 0; x <= w; x += GRID) for (let y = 0; y <= h; y += GRID) b.fillRect(x - 0.5, y - 0.5, 1, 1);
      b.lineWidth = 1;
      b.lineJoin = 'round';
      b.strokeStyle = 'rgba(236, 235, 230, 0.085)';
      traces.forEach((t) => {
        b.beginPath();
        t.pts.forEach(([x, y], i) => (i ? b.lineTo(x, y) : b.moveTo(x, y)));
        b.stroke();
      });
      b.strokeStyle = 'rgba(236, 235, 230, 0.2)';
      traces.forEach((t) => {
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(([x, y]) => {
          b.beginPath();
          b.arc(x, y, 2.5, 0, Math.PI * 2);
          b.stroke();
        });
      });
    };

    const paint = (dt) => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(base, 0, 0);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.strokeStyle = accent;
      for (const t of traces) {
        t.head += t.speed * dt;
        if (t.head - PULSE > t.len) t.head = -Math.random() * t.len * 2.5;
        if (t.head <= 0) continue;
        const a = Math.max(0, t.head - PULSE);
        const b = Math.min(t.len, t.head);
        ctx.globalAlpha = 0.18;
        ctx.lineWidth = 5;
        strokeBetween(ctx, t, a, b);
        ctx.globalAlpha = 0.95;
        ctx.lineWidth = 1.4;
        strokeBetween(ctx, t, a, b);
      }
      ctx.globalAlpha = 1;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = base.width = Math.round(w * dpr);
      canvas.height = base.height = Math.round(h * dpr);
      traces = makeTraces(w, h);
      drawBase();
      if (reduced) {
        // A still frame with a few traces lit.
        traces.forEach((t, i) => (t.head = i % 5 === 0 ? t.len * 0.6 : -1));
        paint(0);
      }
    };

    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      paint(dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    build();
    start();

    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(build, 150);
    });
    ro.observe(canvas);

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      visible ? start() : stop();
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
    };
  }, [reduced]);

  return <canvas ref={canvasRef} className="hero__canvas" />;
}
