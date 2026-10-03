import { useEffect, useRef } from 'react';
import { makeTraces } from './HeroCanvas.jsx';

// A hidden layer of white traces under the Hero's background pattern, denser than the pattern
// itself. It is only ever seen through the flashlight around the mouse (masked in hero.css), so it
// is drawn once per size, with no animation.

export default function HeroReveal() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const text = getComputedStyle(document.documentElement).getPropertyValue('--text-rgb').trim() || '236, 235, 230';

    const draw = () => {
      const { width: w, height: h } = canvas.getBoundingClientRect();
      if (!w || !h) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      const traces = makeTraces(w, h, 3600, 420);
      ctx.lineWidth = 1;
      ctx.strokeStyle = `rgba(${text}, 0.5)`;
      traces.forEach((t) => {
        ctx.beginPath();
        t.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
        ctx.stroke();
      });
      // pads at both ends: some open rings (vias), some filled (solder pads)
      traces.forEach((t, i) => {
        [t.pts[0], t.pts[t.pts.length - 1]].forEach(([x, y], j) => {
          ctx.beginPath();
          ctx.arc(x, y, 2.6, 0, Math.PI * 2);
          if ((i + j) % 3 === 0) {
            ctx.fillStyle = `rgba(${text}, 0.75)`;
            ctx.fill();
          } else {
            ctx.strokeStyle = `rgba(${text}, 0.6)`;
            ctx.stroke();
          }
        });
      });
    };

    draw();
    let timer = 0;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(draw, 150);
    });
    ro.observe(canvas);
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className="hero__reveal" />;
}
