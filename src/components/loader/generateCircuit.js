// Builds the intro's circuit: a tree of traces rooted at the NS monogram.
// Every edge and node records `d`, its distance from NS along the traces, which is what the
// pulses use to decide what they've reached. Seeded, so the layout is stable between visits.

const DIRS = [
  [1, 0], [1, 1], [0, 1], [-1, 1],
  [-1, 0], [-1, -1], [0, -1], [1, -1],
];

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function densityFor(width, density) {
  if (width < 600) return density.mobile;
  if (width < 1000) return density.tablet;
  return density.desktop;
}

export function generateCircuit({ width, height, logoSize, seed, grid, roots, maxDepth, branchChance, maxEdges, componentChance }) {
  const rand = mulberry32(seed);
  const cx = width / 2;
  const cy = height / 2;
  const px = (i, j) => [cx + i * grid, cy + j * grid];
  const key = (i, j) => `${i},${j}`;
  // Direction points away from the centre (or sideways) — keeps traces spreading outward.
  const outward = (i, j, d) => DIRS[d][0] * i + DIRS[d][1] * j >= 0;

  const occupied = new Set();
  const half = Math.ceil((logoSize / 2 + grid * 0.75) / grid);
  for (let i = -half; i <= half; i++) for (let j = -half; j <= half; j++) occupied.add(key(i, j));
  const limI = Math.ceil(width / 2 / grid) + 1;
  const limJ = Math.ceil(height / 2 / grid) + 1;

  const edges = [];
  const nodes = [];
  const components = [];

  const leaf = (i, j, d, dir, depth) => {
    const [x, y] = px(i, j);
    if (depth >= 2 && rand() < componentChance) {
      const horizontal = DIRS[dir][1] === 0;
      const w = grid * (horizontal ? 1.5 : 0.9);
      const h = grid * (horizontal ? 0.9 : 1.5);
      const ox = DIRS[dir][0] * (w / 2);
      const oy = DIRS[dir][1] * (h / 2);
      components.push({ x: x + ox - w / 2, y: y + oy - h / 2, w, h, d, horizontal });
    } else {
      nodes.push({ x, y, d, type: 'pad' });
    }
  };

  function grow(i, j, dir, depth, dist) {
    if (edges.length >= maxEdges) return;
    const steps = 1 + Math.floor(rand() * 4);
    let ci = i;
    let cj = j;
    let n = 0;
    for (let s = 0; s < steps; s++) {
      const ni = ci + DIRS[dir][0];
      const nj = cj + DIRS[dir][1];
      if (Math.abs(ni) > limI || Math.abs(nj) > limJ || occupied.has(key(ni, nj))) break;
      occupied.add(key(ni, nj));
      ci = ni;
      cj = nj;
      n++;
    }
    if (!n) {
      if (depth > 0) leaf(i, j, dist, dir, depth);
      return;
    }

    const [x1, y1] = px(i, j);
    const [x2, y2] = px(ci, cj);
    const len = Math.hypot(x2 - x1, y2 - y1);
    edges.push({ x1, y1, x2, y2, d0: dist, len });
    const d1 = dist + len;
    const offscreen = x2 < -grid || x2 > width + grid || y2 < -grid || y2 > height + grid;
    if (offscreen) return;
    if (depth >= maxDepth) return leaf(ci, cj, d1, dir, depth);

    // Occasionally branch off at 90°, marked with a via.
    if (rand() < branchChance) {
      const bd = (dir + (rand() < 0.5 ? 2 : 6)) % 8;
      if (outward(ci, cj, bd)) {
        nodes.push({ x: x2, y: y2, d: d1, type: 'via' });
        grow(ci, cj, bd, depth + 1, d1);
      }
    }
    // Usually carry on, sometimes turning 45°.
    if (rand() < 0.88) {
      let nd = (dir + [7, 0, 0, 1][Math.floor(rand() * 4)]) % 8;
      if (!outward(ci, cj, nd)) nd = dir;
      grow(ci, cj, nd, depth + 1, d1);
    } else {
      leaf(ci, cj, d1, dir, depth);
    }
  }

  // Roots sit on a ring round the logo; a short lead trace connects each to the logo's edge.
  const ring = [];
  for (let k = -half; k < half; k++) ring.push([k, -half]); // top, left → right
  for (let k = -half; k < half; k++) ring.push([half, k]); // right, top → bottom
  for (let k = half; k > -half; k--) ring.push([k, half]); // bottom, right → left
  for (let k = half; k > -half; k--) ring.push([-half, k]); // left, bottom → top

  const logoEdge = logoSize * 0.42;
  const picked = new Set();
  for (let r = 0; r < roots; r++) {
    const idx = Math.floor(((r + 0.25 + rand() * 0.5) / roots) * ring.length) % ring.length;
    if (picked.has(idx)) continue;
    picked.add(idx);
    const [i, j] = ring[idx];
    const corner = Math.abs(i) === half && Math.abs(j) === half;
    let dir;
    if (corner) dir = i > 0 ? (j > 0 ? 1 : 7) : j > 0 ? 3 : 5;
    else if (Math.abs(i) === half) dir = i > 0 ? 0 : 4;
    else dir = j > 0 ? 2 : 6;

    // Lead from the logo's edge out to the ring, so every trace visibly leaves NS.
    // Side roots run straight out; corner roots leave diagonally from the logo's corner.
    const [rx, ry] = px(i, j);
    const lx = Math.abs(i) === half ? cx + Math.sign(i) * logoEdge : rx;
    const ly = Math.abs(j) === half ? cy + Math.sign(j) * logoEdge : ry;
    const lead = Math.hypot(rx - lx, ry - ly);
    edges.push({ x1: lx, y1: ly, x2: rx, y2: ry, d0: 0, len: lead });
    grow(i, j, dir, 0, lead);
  }

  const dmax = Math.max(1, ...edges.map((e) => e.d0 + e.len), ...nodes.map((n) => n.d));
  return { width, height, edges, nodes, components, dmax };
}
