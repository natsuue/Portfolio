// Converts a CAD export (.fbx) into the web-ready GLB used by the "Inside PuriSense" section.
//
//   npm run model -- "<path to model.fbx>" [--simplify=0.0005]
//
// --simplify reduces triangle count on detailed parts (the number is the allowed error, as a
// fraction of the model's size; 0.0005 is visually lossless at portfolio sizes).
//
// Output: public/models/purisense.glb (meshopt-compressed with gltf-transform; meshes are kept
// separate — never joined — so each part can move on its own).
//
// The FBX is parsed by three.js in headless Chrome (no Blender needed). Every mesh has its
// world transform baked in and is re-parented under one flat root, centred at the origin and
// scaled to 2 units tall, so the site can move each part along a simple explode vector.
// Set CHROME_PATH if Chrome isn't in the default Windows location.

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import puppeteer from 'puppeteer-core';

const args = process.argv.slice(2);
const simplify = args.find((a) => a.startsWith('--simplify'))?.split('=')[1] ?? null;
const [input, output = 'public/models/purisense.glb'] = args.filter((a) => !a.startsWith('--'));
const raw = path.join(os.tmpdir(), 'purisense.raw.glb');
if (!input) {
  console.error('Usage: node scripts/convert-model.mjs <model.fbx> [output.glb]');
  process.exit(1);
}

const threeDir = path.resolve('node_modules/three');
const chrome = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const page = `<!doctype html><script type="importmap">
{ "imports": { "three": "/three/build/three.module.js", "three/addons/": "/three/examples/jsm/" } }
</script>
<script type="module">
import * as THREE from 'three';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { mergeVertices, toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';

window.convert = async () => {
  const fbx = await new FBXLoader().loadAsync('/model.fbx');
  // Fusion exports Z-up; the web (and glTF) is Y-up.
  fbx.rotation.x = -Math.PI / 2;
  fbx.updateMatrixWorld(true);

  // Bake every mesh into world space under a flat root.
  const root = new THREE.Group();
  root.name = 'PuriSense';
  const meshes = [];
  fbx.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const toStandard = (src) => new THREE.MeshStandardMaterial({
    name: src?.name ?? 'Material',
    color: src?.color ?? new THREE.Color(0x888888),
    metalness: /steel|metal/i.test(src?.name ?? '') ? 0.6 : 0,
    roughness: 0.55,
  });
  // Share vertices, then rebuild normals with a 30° crease: smooth curves, crisp CAD edges,
  // and welded geometry the simplifier can actually reduce.
  const prep = (positions) => {
    let g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    g = mergeVertices(g, 1e-3);
    return toCreasedNormals(g, Math.PI / 6);
  };

  for (const m of meshes) {
    const base = (m.geometry.index ? m.geometry.toNonIndexed() : m.geometry.clone()).applyMatrix4(m.matrixWorld);
    const pos = base.attributes.position.array;
    const mats = [m.material].flat();
    const groups = base.groups.length ? base.groups : [{ start: 0, count: pos.length / 3, materialIndex: 0 }];
    // Same rule three.js applies to node names on load: spaces become underscores.
    const name = m.name.trim().replace(/\\s+/g, '_');

    // One single-material mesh per colour, grouped under the part's name when there are several.
    const pieces = groups.map((grp, i) => {
      const mesh = new THREE.Mesh(
        prep(pos.slice(grp.start * 3, (grp.start + grp.count) * 3)),
        toStandard(mats[grp.materialIndex ?? 0])
      );
      mesh.name = groups.length > 1 ? name + '_' + i : name;
      return mesh;
    });
    if (pieces.length === 1) {
      root.add(pieces[0]);
    } else {
      const part = new THREE.Group();
      part.name = name;
      part.add(...pieces);
      root.add(part);
    }
  }

  // Centre on the origin and scale to 2 units tall.
  const box = new THREE.Box3().setFromObject(root);
  const size = box.getSize(new THREE.Vector3());
  const centre = box.getCenter(new THREE.Vector3());
  const scale = 2 / size.y;
  root.traverse((o) => {
    if (o.isMesh) o.geometry.translate(-centre.x, -centre.y, -centre.z).scale(scale, scale, scale);
  });

  const report = root.children.map((part) => {
    const b = new THREE.Box3().setFromObject(part);
    const c = b.getCenter(new THREE.Vector3()), s = b.getSize(new THREE.Vector3());
    const r = (v) => [v.x, v.y, v.z].map((n) => +n.toFixed(3));
    const meshes = part.isMesh ? [part] : part.children;
    const tris = meshes.reduce((n, m) => n + (m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3, 0);
    return { name: part.name, colours: meshes.length, tris, centre: r(c), size: r(s) };
  });

  const glb = await new GLTFExporter().parseAsync(root, { binary: true });
  const bytes = new Uint8Array(glb);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return { report, originalSize: [size.x, size.y, size.z], glb: btoa(bin) };
};
window.ready = true;
</script>`;

const server = http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/') return res.end(page);
  if (url === '/model.fbx') return fs.createReadStream(input).pipe(res);
  if (url.startsWith('/three/')) {
    const file = path.join(threeDir, url.slice('/three/'.length));
    if (!file.startsWith(threeDir) || !fs.existsSync(file)) return res.writeHead(404).end();
    res.setHeader('Content-Type', 'text/javascript');
    return fs.createReadStream(file).pipe(res);
  }
  res.writeHead(404).end();
});
await new Promise((r) => server.listen(0, r));

const browser = await puppeteer.launch({ executablePath: chrome, headless: 'new' });
try {
  const tab = await browser.newPage();
  tab.on('pageerror', (e) => console.error('page error:', e.message));
  await tab.goto(`http://localhost:${server.address().port}/`);
  await tab.waitForFunction('window.ready === true');
  const { report, originalSize, glb } = await tab.evaluate(() => window.convert());
  fs.writeFileSync(raw, Buffer.from(glb, 'base64'));
  fs.mkdirSync(path.dirname(output), { recursive: true });
  execSync(
    `npx -y @gltf-transform/cli@4 optimize "${raw}" "${output}" --compress meshopt --texture-compress false ${simplify ? `--simplify true --simplify-error ${simplify}` : "--simplify false"} --join false --flatten false --instance false --palette false`,
    { stdio: 'inherit' }
  );
  fs.rmSync(raw);
  console.log(`Original size (FBX units): ${originalSize.map((n) => n.toFixed(1)).join(' × ')}`);
  console.table(report);
  console.log(`Wrote ${output} (${(fs.statSync(output).size / 1024).toFixed(0)} KB)`);
} finally {
  await browser.close();
  server.close();
}
