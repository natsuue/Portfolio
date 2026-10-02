// Builds the intro's circuit burst: traces leave every pin on all four sides of the chip and
// bend (in 45° steps) toward pointing straight out, with jogs, short stubs, data streaks and
// chip glints — plus up to two fainter, larger layers behind for depth.
// Every trace records `d0`, its distance from NS where it starts, so a single growing front
// (and later a single erase front) can reveal or remove all of them in step.

const Q = Math.PI / 4; // 45°
const step = (p, a, l) => [p[0] + Math.cos(a) * l, p[1] + Math.sin(a) * l];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeTrace(pts, o) {
  const lens = [];
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    const l = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    lens.push(l);
    len += l;
  }
  return { pts, lens, len, ...o };
}

// One layer of pin traces. `scale` > 1 makes a bigger, fainter background layer.
function radialLayer({ W, H, nsSize, seed, scale, alpha, t, withGlints }) {
  const rand = mulberry32(seed);
  const diag = Math.hypot(W, H) / 2;
  const half = nsSize * 0.52; // chip body half-width
  const exit = nsSize * 0.64; // traces leave just past the pins
  const reach = diag * 1.1;
  const traces = [];
  const glints = [];

  for (let s = 0; s < 4; s++) {
    const na = (s * Math.PI) / 2;
    const ta = na + Math.PI / 2;
    for (let i = 0; i < t.pins; i++) {
      const o = ((i / Math.max(1, t.pins - 1)) * 2 - 1) * half * 0.92 + (rand() - 0.5) * 3;
      let p = [Math.cos(na) * exit + Math.cos(ta) * o, Math.sin(na) * exit + Math.sin(ta) * o];
      const pts = [p];
      const radial = Math.atan2(p[1], p[0]);
      let heading = na;
      const stub = rand() < t.stubRatio;
      const total = stub ? 20 + rand() * 60 : reach * (0.35 + rand() * 0.75) * t.traceLength;
      let travelled = 0;
      while (travelled < total) {
        const run = stub ? total : 25 + rand() * 120;
        p = step(p, heading, run);
        pts.push(p);
        travelled += run;
        const diff = Math.atan2(Math.sin(radial - heading), Math.cos(radial - heading));
        if (Math.abs(diff) > Q * 0.5 && rand() < 0.7) heading += Math.sign(diff) * Q;
        else if (rand() < t.jogChance) {
          p = step(p, heading + (rand() < 0.5 ? Q : -Q), 6 + rand() * 18);
          pts.push(p);
        }
        if (withGlints && !stub && rand() < t.glints) glints.push({ x: p[0], y: p[1], d: exit + travelled, s: 3 + rand() * 5, phase: rand() * 6.28 });
      }
      traces.push(
        makeTrace(
          pts.map(([x, y]) => [x * scale, y * scale]),
          {
            d0: exit * scale,
            rscale: scale,
            end: stub ? 'pad' : rand() < 0.5 ? 'pad' : 'via',
            bright: (0.55 + rand() * 0.45) * alpha,
            width: (stub ? 0.7 : 0.8 + rand() * 0.5) * (scale > 1 ? 0.8 : 1),
            dotted: rand() < t.dottedRatio,
          }
        )
      );
    }
  }

  // loose dotted "data" streaks between the traces
  if (scale === 1) {
    for (let i = 0; i < t.dataLines; i++) {
      const th = rand() * Math.PI * 2;
      const r0 = exit * 1.6 + rand() * diag * 0.6;
      const len = 50 + rand() * 200;
      traces.push(
        makeTrace([[Math.cos(th) * r0, Math.sin(th) * r0], [Math.cos(th) * (r0 + len), Math.sin(th) * (r0 + len)]], {
          d0: r0, rscale: 1, end: null, bright: 0.3 + rand() * 0.3, width: 0.7, dotted: true,
        })
      );
    }
  }
  return { traces, glints, reach };
}

export function generateBurst({ width: W, height: H, nsSize, seed, traces: t }) {
  const front = radialLayer({ W, H, nsSize, seed, scale: 1, alpha: 1, t, withGlints: true });
  const layers = [[1.7, 0.45, 10], [2.6, 0.25, 20]].slice(0, t.backLayers);
  for (const [scale, alpha, off] of layers) {
    const back = radialLayer({ W, H, nsSize, seed: seed + off, scale, alpha: Math.min(1, alpha * t.backBright), t, withGlints: false });
    front.traces.push(...back.traces);
  }

  // How far the erase has to travel before nothing visible is left: the furthest on-screen
  // point of any trace, in front-layer units (coordinates are relative to the screen centre).
  const inView = ([x, y]) => Math.abs(x) <= W / 2 + 20 && Math.abs(y) <= H / 2 + 20;
  let visibleExtent = 0;
  for (const tr of front.traces) {
    let acc = 0;
    let last = inView(tr.pts[0]) ? 0 : -1;
    for (let i = 1; i < tr.pts.length; i++) {
      acc += tr.lens[i - 1];
      if (inView(tr.pts[i]) || inView(tr.pts[i - 1])) last = acc;
    }
    if (last >= 0) visibleExtent = Math.max(visibleExtent, (tr.d0 + last) / tr.rscale);
  }
  front.visibleExtent = visibleExtent;

  // Fully drawn traces reuse one path instead of rebuilding it every frame.
  for (const tr of front.traces) {
    const path = new Path2D();
    tr.pts.forEach(([x, y], i) => (i ? path.lineTo(x, y) : path.moveTo(x, y)));
    tr.fullPath = path;
  }
  return front;
}
