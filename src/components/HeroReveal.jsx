import { useEffect, useRef } from 'react';
import { makeTraces } from './HeroCanvas.jsx';
import { HERO_SETTINGS_EVENT, heroSettings } from '../data/hero.js';

// A hidden layer of white traces under the Hero's background pattern, denser than the pattern
// itself. It is only ever seen through the flashlight around the mouse (masked in hero.css), so it
// is drawn once per size, with no animation.
//
// Behind the statement the traces are kept faint at a fixed level (not the tweakable brightness),
// so the sentence stays easy to read under the light.

const STATEMENT_ALPHA = 0.14; // trace brightness behind the statement
const STATEMENT_PAD = 18; // px around the statement's box
const FEATHER = 22; // px of soft edge between the two brightnesses

export default function HeroReveal() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const quiet = document.createElement('canvas');
    const qctx = quiet.getContext('2d');
    const text = getComputedStyle(document.documentElement).getPropertyValue('--text-rgb').trim() || '236, 235, 230';
    const statement = canvas.closest('.hero')?.querySelector('.hero__statement');

    const drawTraces = (c, traces, alpha) => {
      c.lineCap = 'round';
      c.lineJoin = 'round';
      c.lineWidth = 1;
      c.strokeStyle = `rgba(${text}, ${alpha})`;
      traces.forEach((t) => {
        c.beginPath();
        t.pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.stroke();
      });
      // pads at both ends: some open rings (vias), some filled (solder pads)
      traces.forEach((t, i) => {
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(([x, y], j) => {
          c.beginPath();
          c.arc(x, y, 2.6, 0, Math.PI * 2);
          if ((i + j) % 3 === 0) {
            c.fillStyle = `rgba(${text}, ${Math.min(1, alpha * 1.5)})`;
            c.fill();
          } else {
            c.strokeStyle = `rgba(${text}, ${Math.min(1, alpha * 1.2)})`;
            c.stroke();
          }
        });
      });
    };

    // A soft-edged box (in device pixels), drawn as the shadow of a rect placed off-canvas.
    const featherBox = (c, box, dpr) => {
      const off = 100000;
      c.save();
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.shadowColor = '#000';
      c.shadowBlur = FEATHER * dpr;
      c.shadowOffsetX = off;
      c.fillStyle = '#000';
      c.fillRect(box.x * dpr - off, box.y * dpr, box.w * dpr, box.h * dpr);
      c.restore();
    };

    const draw = () => {
      const r = canvas.getBoundingClientRect();
      const { width: w, height: h } = r;
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = quiet.width = Math.round(w * dpr);
      canvas.height = quiet.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      qctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const { area, max, brightness } = heroSettings.reveal;
      const traces = makeTraces(w, h, area, max);
      drawTraces(ctx, traces, brightness);

      const s = statement?.getBoundingClientRect();
      if (!s || !s.width) return;
      const box = {
        x: s.left - r.left - STATEMENT_PAD,
        y: s.top - r.top - STATEMENT_PAD,
        w: s.width + STATEMENT_PAD * 2,
        h: s.height + STATEMENT_PAD * 2,
      };
      // cut the statement's area out of the full-brightness traces…
      ctx.globalCompositeOperation = 'destination-out';
      featherBox(ctx, box, dpr);
      ctx.globalCompositeOperation = 'source-over';
      // …and fill it with the same traces at the fixed, fainter level
      drawTraces(qctx, traces, STATEMENT_ALPHA);
      qctx.globalCompositeOperation = 'destination-in';
      featherBox(qctx, box, dpr);
      qctx.globalCompositeOperation = 'source-over';
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(quiet, 0, 0);
      ctx.restore();
    };

    draw();
    document.fonts?.ready.then(draw); // the statement's size settles once the serif font loads
    let timer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(draw, 150);
    });
    ro.observe(canvas);
    if (statement) ro.observe(statement);
    window.addEventListener(HERO_SETTINGS_EVENT, draw);
    return () => {
      window.removeEventListener(HERO_SETTINGS_EVENT, draw);
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__reveal" />;
}
