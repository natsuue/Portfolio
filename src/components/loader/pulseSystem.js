// Drives the intro frame by frame. Given a time `t` (seconds), it works out where every pulse
// is and writes opacity / dash offsets straight to the SVG elements — no React re-renders.

const smooth = (x) => {
  const t = Math.min(1, Math.max(0, x));
  return t * t * (3 - 2 * t);
};

export function createPulseSystem({ circuit, config, els }) {
  const { edges, nodes, components, dmax, width, height } = circuit;
  const v = config.pulseSpeed * dmax; // px per second
  const tail = config.tail;
  const pulses = config.pulses.map((p, k) => ({
    ...p,
    reachPx: p.final ? Infinity : p.reach * dmax,
    persist: config.persist[k] ?? config.persist.at(-1),
  }));
  const final = pulses.find((p) => p.final) ?? pulses.at(-1);
  const diag = Math.hypot(width, height) / 2;
  const cache = new WeakMap();

  // Only touch the DOM when a value actually changes.
  const set = (el, prop, value) => {
    if (!el) return;
    let c = cache.get(el);
    if (!c) cache.set(el, (c = {}));
    if (c[prop] === value) return;
    c[prop] = value;
    el.style[prop] = value;
  };

  // When (if ever) a pulse arrives at distance d, and how lit things stay afterwards.
  const arrival = (d) => {
    let latest = null;
    for (const p of pulses) {
      if (d >= p.reachPx) continue;
      latest = { p, time: p.at + d / v };
    }
    return latest;
  };

  // How bright NS is: a quick swell just before each pulse leaves, then it settles back to rest.
  const nsGlow = (t) => {
    let g = config.nsRest;
    for (const p of pulses) {
      const dt = t - p.at + 0.12;
      if (dt < 0) continue;
      const bump = dt < 0.12 ? dt / 0.12 : Math.exp(-(dt - 0.12) / 0.22);
      const amp = p.final ? 1 : 0.72;
      g = Math.max(g, config.nsRest + amp * bump * (1 - config.nsRest));
    }
    return g;
  };

  function renderEdges(t, staticLit) {
    edges.forEach((e, i) => {
      let lit = 0;
      let trail = 0;
      let head = 0;
      let offset = 0;
      if (staticLit != null) {
        lit = staticLit;
      } else {
        for (const p of pulses) {
          if (e.d0 >= p.reachPx) continue;
          const f = (t - p.at) * v; // how far this pulse's front has travelled
          if (f <= e.d0) continue;
          lit = p.persist;
          const tPass = p.at + Math.min(e.d0 + e.len, p.reachPx) / v;
          trail = t > tPass ? 0.55 * Math.exp(-(t - tPass) / 0.45) : 0.55;
          if (f - tail < e.d0 + e.len && (p.final || f < p.reachPx + tail)) {
            head = p.final ? 1 : 1 - smooth((f - (p.reachPx - tail * 1.5)) / (tail * 2));
            offset = -(f - e.d0 - tail);
          }
        }
      }
      set(els.lit[i], 'opacity', Math.min(1, lit + trail).toFixed(3));
      const h = head.toFixed(3);
      const o = `${offset.toFixed(1)}px`;
      set(els.pulse[i], 'opacity', h);
      set(els.halo[i], 'opacity', h);
      set(els.pulse[i], 'strokeDashoffset', o);
      set(els.halo[i], 'strokeDashoffset', o);
    });
  }

  function renderPoints(list, targets, t, staticLit) {
    list.forEach((n, i) => {
      let o = 0;
      if (staticLit != null) {
        o = staticLit + 0.3;
      } else {
        const a = arrival(n.d);
        if (a && t >= a.time) o = a.p.persist + 0.3 + 0.7 * Math.exp(-(t - a.time) / 0.3);
      }
      set(targets[i], 'opacity', Math.min(1, o).toFixed(3));
    });
  }

  return {
    // `breathe` (0–1) adds a gentle idle swell to NS while the intro waits for fonts.
    render(t, { breathe = 0 } = {}) {
      renderEdges(t);
      renderPoints(nodes, els.nodes, t);
      renderPoints(components, els.components, t);

      // The final wave: a ring that carries on past the edges of the board.
      const r = (t - final.at) * v;
      const ringVisible = r > dmax * 0.7;
      const ringO = ringVisible ? smooth((r - dmax * 0.7) / (dmax * 0.25)) * (1 - smooth((r - dmax) / (diag * 0.9))) : 0;
      if (els.ring) {
        els.ring.setAttribute('r', Math.max(0, r).toFixed(1));
        set(els.ring, 'opacity', ringO.toFixed(3));
      }

      // Soft glow as the wave clears the board — never a white flash.
      const tEdge = final.at + dmax / v;
      const glow = config.glow * Math.exp(-(((t - tEdge) / 0.3) ** 2));
      els.root?.style.setProperty('--glow', glow.toFixed(3));
      els.root?.style.setProperty('--ns', Math.min(1, nsGlow(t) + breathe * 0.12).toFixed(3));
    },

    // Reduced motion: everything lit, nothing travelling.
    renderStatic(level) {
      renderEdges(0, level);
      renderPoints(nodes, els.nodes, 0, level);
      renderPoints(components, els.components, 0, level);
      els.root?.style.setProperty('--glow', '0');
      els.root?.style.setProperty('--ns', '1');
    },
  };
}
