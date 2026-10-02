// Drives the intro burst. Given a time `t` (seconds since the intro began), it works out how far
// the traces have grown and been erased, and draws one frame to the canvas. NS / chip / Hero
// levels are returned as numbers so the component can apply them without React re-renders.

const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (x) => 1 - (1 - clamp01(x)) ** 3;
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${Math.max(0, a).toFixed(3)})`;

export function hslToRgb(h, s, l) {
  s /= 100;
  l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}
export const paletteFor = (hue) => ({ core: hslToRgb(hue, 100, 94), mid: hslToRgb(hue, 100, 64), glow: hslToRgb(hue, 100, 54) });

// ---------------------------------------------------------------- timeline
export function makeTimeline(timing) {
  const T = { ...timing, growStart: timing.ignite + 0.03, end: timing.heroIn + timing.handoverDur };
  // NS + chip share one fade-out: the lit layer fades first, then the whole mark.
  const fadeA = (t) => 1 - smooth((t - T.nsFadeStart) / T.nsFadeDur);
  const fadeB = (t) => 1 - smooth((t - T.nsFadeStart - 0.3) / (T.nsFadeDur * 0.83));
  // The moment the chip outline reaches zero — the erase starts here when linked.
  const chipGoneAt = T.nsFadeStart + Math.min(T.nsFadeDur, 0.3 + 0.83 * T.nsFadeDur);
  T.eraseStartAt = T.linkErase ? chipGoneAt : T.eraseStart;
  const ignition = (t) => smooth((t - T.ignite + 0.05) / 0.12);
  return {
    T,
    ignition,
    nsLit: (t, settle) => ignition(t) * (1 - (1 - settle) * smooth((t - T.ignite - 0.2) / 0.5)) * fadeA(t) * fadeB(t),
    nsMark: (t) => fadeB(t),
    chip: (t) => ignition(t) * fadeA(t) * fadeB(t),
    reveal: (t) => smooth((t - T.heroIn) / (T.end - T.heroIn)),
    intensity: (t) => smooth((t - T.growStart) / 0.22) * (1 - T.dimAmount * smooth((t - T.dimStart) / 1.05)),
    growth: (t, reach) => reach * easeOutCubic((t - T.growStart) / T.growDur),
    erase: (t, reach) => reach * 1.35 * easeOutCubic((t - T.eraseStartAt) / T.eraseDur),
    // When nothing visible is left: the erase has passed every on-screen point (and the Hero is in).
    finishAt(reach, visibleExtent) {
      const v = visibleExtent / (reach * 1.35);
      const x = v >= 1 ? 1 : 1 - Math.cbrt(1 - v);
      return Math.max(T.end, T.eraseStartAt + x * T.eraseDur) + 0.05;
    },
  };
}

// The part of a trace between distances `from` and `upto` along it.
function partialPath(tr, from, upto) {
  if (from <= 0 && upto >= tr.len) return { path: tr.fullPath, tip: tr.pts[tr.pts.length - 1], start: tr.pts[0] };
  const path = new Path2D();
  let acc = 0;
  let started = false;
  let tip = tr.pts[0];
  let start = tr.pts[0];
  for (let i = 0; i < tr.lens.length; i++) {
    const l = tr.lens[i];
    const s0 = acc;
    const s1 = acc + l;
    acc = s1;
    if (s1 <= from) continue;
    if (s0 >= upto) break;
    const [ax, ay] = tr.pts[i];
    const [bx, by] = tr.pts[i + 1];
    const f0 = Math.max(0, (from - s0) / l);
    const f1 = Math.min(1, (upto - s0) / l);
    if (!started) {
      start = [ax + (bx - ax) * f0, ay + (by - ay) * f0];
      path.moveTo(start[0], start[1]);
      started = true;
    }
    tip = [ax + (bx - ax) * f1, ay + (by - ay) * f1];
    path.lineTo(tip[0], tip[1]);
  }
  return { path, tip, start };
}

// ---------------------------------------------------------------- renderer
export function createBurstRenderer({ canvas, burst, look, eraseSpark, timeline }) {
  const ctx = canvas.getContext('2d');
  const bloom = document.createElement('canvas');
  const bctx = bloom.getContext('2d');
  const pal = paletteFor(look.hue);
  // Canvas blur isn't available in every browser; without it, the glow layer is skipped.
  ctx.filter = 'blur(1px)';
  const canBlur = ctx.filter === 'blur(1px)';
  ctx.filter = 'none';
  const useBloom = canBlur && look.glow > 0 && look.glowBlur > 0;
  let W = 0;
  let H = 0;
  let dpr = 1;

  function resize(w, h, ratio) {
    W = w;
    H = h;
    dpr = ratio;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    bloom.width = Math.ceil(W / 4);
    bloom.height = Math.ceil(H / 4);
  }

  function render(t, { staticFrame = false } = {}) {
    const { T } = timeline;
    const I = staticFrame ? 1 : timeline.intensity(t);
    const R = staticFrame ? Infinity : timeline.growth(t, burst.reach);
    const E = staticFrame ? -Infinity : timeline.erase(t, burst.reach);
    const sparkFade = staticFrame ? 0 : 1 - smooth((t - T.end + 0.2) / 0.4);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (useBloom) {
      bctx.setTransform(1, 0, 0, 1, 0, 0);
      bctx.clearRect(0, 0, bloom.width, bloom.height);
    }
    if (I <= 0.002 || R <= 0) return;

    ctx.setTransform(dpr, 0, 0, dpr, (dpr * W) / 2, (dpr * H) / 2);
    ctx.globalCompositeOperation = 'lighter';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (useBloom) {
      bctx.setTransform(0.25, 0, 0, 0.25, W / 8, H / 8);
      bctx.globalCompositeOperation = 'lighter';
      bctx.lineCap = 'round';
      bctx.lineJoin = 'round';
    }
    const lw = look.lineWidth;

    for (const tr of burst.traces) {
      const upto = Math.min(tr.len, R * tr.rscale - tr.d0);
      const from = Math.max(0, E * tr.rscale - tr.d0);
      if (upto <= 0 || from >= upto) continue;
      const near = 1 - 0.5 * clamp01(tr.d0 / (burst.reach * tr.rscale));
      const a = Math.min(1.5, I * tr.bright * near * look.brightness);
      const { path, tip, start } = partialPath(tr, from, upto);

      ctx.setLineDash(tr.dotted ? [1.4, 4] : []);
      ctx.strokeStyle = rgba(pal.glow, 0.09 * a);
      ctx.lineWidth = 5 * tr.width * lw;
      ctx.stroke(path);
      ctx.strokeStyle = rgba(pal.mid, 0.5 * a);
      ctx.lineWidth = 1.7 * tr.width * lw;
      ctx.stroke(path);
      ctx.strokeStyle = rgba(pal.core, 0.95 * a);
      ctx.lineWidth = 0.7 * tr.width * lw;
      ctx.stroke(path);
      ctx.setLineDash([]);
      if (useBloom) {
        bctx.strokeStyle = rgba(pal.mid, 0.8 * a);
        bctx.lineWidth = 5 * tr.width;
        bctx.stroke(path);
      }

      if (!staticFrame && upto < tr.len) {
        // growing tip: a small bright spark
        ctx.fillStyle = rgba(pal.core, 0.9 * a * sparkFade);
        ctx.beginPath();
        ctx.arc(tip[0], tip[1], 1.5 * lw, 0, Math.PI * 2);
        ctx.fill();
        if (useBloom) {
          bctx.fillStyle = rgba(pal.mid, a * sparkFade);
          bctx.beginPath();
          bctx.arc(tip[0], tip[1], 8, 0, Math.PI * 2);
          bctx.fill();
        }
      }
      if (eraseSpark && from > 0) {
        // the erase front looks like growth in reverse: a glowing edge led by a spark
        const aSpark = Math.min(1, tr.bright * near * look.brightness) * sparkFade;
        ctx.strokeStyle = rgba(pal.core, 0.95 * aSpark);
        ctx.lineWidth = 1.2 * tr.width * lw;
        ctx.stroke(partialPath(tr, from, Math.min(upto, from + 16)).path);
        ctx.fillStyle = rgba(pal.core, 0.95 * aSpark);
        ctx.beginPath();
        ctx.arc(start[0], start[1], 1.6 * lw, 0, Math.PI * 2);
        ctx.fill();
        if (useBloom) {
          bctx.fillStyle = rgba(pal.mid, aSpark);
          bctx.beginPath();
          bctx.arc(start[0], start[1], 9, 0, Math.PI * 2);
          bctx.fill();
        }
      }
      if (upto >= tr.len && tr.end) {
        // finished traces end in a solder pad (filled) or a via (ring)
        const end = tr.pts[tr.pts.length - 1];
        ctx.beginPath();
        ctx.arc(end[0], end[1], (tr.end === 'pad' ? 1.9 : 2.3) * lw * Math.max(1, tr.width), 0, Math.PI * 2);
        if (tr.end === 'pad') {
          ctx.fillStyle = rgba(pal.mid, 0.85 * a);
          ctx.fill();
        } else {
          ctx.strokeStyle = rgba(pal.mid, 0.85 * a);
          ctx.lineWidth = 0.9 * lw;
          ctx.stroke();
        }
      }
    }

    // glints: tiny chip footprints that flicker as the front passes them
    for (const g of burst.glints) {
      if (R < g.d || E >= g.d) continue;
      const f = I * (0.4 + 0.6 * Math.abs(Math.sin(t * 9 + g.phase)));
      ctx.strokeStyle = rgba(pal.mid, 0.6 * f);
      ctx.lineWidth = 0.8;
      ctx.strokeRect(g.x - g.s / 2, g.y - g.s / 3, g.s, g.s * 0.66);
      if (useBloom) {
        bctx.fillStyle = rgba(pal.mid, 0.5 * f);
        bctx.fillRect(g.x - g.s, g.y - g.s, g.s * 2, g.s * 2);
      }
    }

    if (useBloom) {
      // the low-res glow layer, blurred once and added on top
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.save();
      ctx.filter = `blur(${look.glowBlur}px)`;
      ctx.globalAlpha = Math.min(1, look.glow);
      ctx.drawImage(bloom, 0, 0, W, H);
      ctx.restore();
    }

    if (look.coreDark > 0) {
      // optional dark halo behind NS
      ctx.globalCompositeOperation = 'source-over';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const core = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, 130);
      core.addColorStop(0, `rgba(10,11,13,${(look.coreDark * Math.min(1, I * 1.6) * (1 - timeline.reveal(t))).toFixed(3)})`);
      core.addColorStop(1, 'rgba(10,11,13,0)');
      ctx.fillStyle = core;
      ctx.fillRect(0, 0, W, H);
    }
  }

  return { resize, render };
}
