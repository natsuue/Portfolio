import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { clamp01, easeInOut, explodeProgress, partAmount, stepCount } from '../utils/explode.js';
import { pad } from '../utils/emphasize.jsx';

// The three.js half of the exploded view. Loaded lazily; renders only when progress changes.

const lerp = (a, b, t) => a + (b - a) * t;

// Camera path over the explode: a slow orbit round to the logo side, pulling back to fit.
const CAMERA = {
  azimuth: [0.95, -0.35],
  elevation: [0.22, 0.3],
  distance: [5.2, 9.4],
  targetY: [0, 0.1],
};

function makeMaterials(accent, accent2) {
  return {
    component: new THREE.MeshStandardMaterial({ color: 0x8a929c, metalness: 0.45, roughness: 0.45 }),
    accent2: new THREE.MeshStandardMaterial({ color: accent2, metalness: 0.2, roughness: 0.5 }),
    body: new THREE.MeshStandardMaterial({ color: 0x2c3138, metalness: 0.75, roughness: 0.38 }),
    panel: new THREE.MeshStandardMaterial({ color: 0x454c56, metalness: 0.7, roughness: 0.32 }),
    matte: new THREE.MeshStandardMaterial({ color: 0x1b1e23, metalness: 0, roughness: 0.9 }),
    accent: new THREE.MeshStandardMaterial({
      color: accent,
      metalness: 0.1,
      roughness: 0.45,
      emissive: accent,
      emissiveIntensity: 0.12,
    }),
  };
}

function makeShadow() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  grad.addColorStop(0, 'rgba(0,0,0,0.55)');
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2.6, 2.6),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false })
  );
  mesh.rotation.x = -Math.PI / 2;
  mesh.position.y = -2.05;
  return mesh;
}

const ModelStage = forwardRef(function ModelStage({ model, onReady, onError }, ref) {
  const hostRef = useRef(null);
  const canvasRef = useRef(null);
  const labelRefs = useRef([]);
  const state = useRef({ target: 0, current: 0, kick: null });

  useImperativeHandle(ref, () => ({
    setProgress(p) {
      state.current.target = clamp01(p);
      state.current.kick?.();
    },
  }));

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const small = window.matchMedia('(max-width: 599px)').matches;
    const accentHex = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#47afff';

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.75));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const key = new THREE.DirectionalLight(0xffffff, 1.4);
    key.position.set(3, 5, 4);
    const rim = new THREE.DirectionalLight(new THREE.Color(accentHex), 0.6);
    rim.position.set(-4, 2, -3);
    scene.add(key, rim, makeShadow());

    const css = getComputedStyle(document.documentElement);
    const accent2Hex = css.getPropertyValue('--accent-2').trim() || '#ffb547';
    const materials = makeMaterials(new THREE.Color(accentHex), new THREE.Color(accent2Hex));
    const count = stepCount(model.parts);
    let parts = [];
    const cadMaterials = new Map();
    let raf = 0;
    let disposed = false;
    let loaded = false;

    const target = new THREE.Vector3();
    const tmp = new THREE.Vector3();

    const update = () => {
      const s = state.current;
      s.current += (s.target - s.current) * 0.16;
      if (Math.abs(s.target - s.current) < 0.0005) s.current = s.target;

      for (const part of parts) {
        part.amount = partAmount(s.current, part.step, count);
        for (const obj of part.objects) obj.position.copy(obj.userData.base).addScaledVector(part.offset, part.amount);
      }

      const t = explodeProgress(s.current);
      const e = easeInOut(t);
      // Pull back early: the top parts fly out first, so the camera has to make room quickly.
      const zoom = 1 - (1 - clamp01(t * 2.5)) ** 3;
      const aspect = camera.aspect;
      const az = lerp(...CAMERA.azimuth, e);
      const el = lerp(...CAMERA.elevation, e);
      // Portrait screens need the camera further back to fit the width.
      const dist = lerp(...CAMERA.distance, zoom) * (aspect < 1 ? Math.pow(1 / aspect, 0.75) : 1);
      target.set(0, lerp(...CAMERA.targetY, e), 0);
      camera.position.set(
        dist * Math.cos(el) * Math.sin(az),
        target.y + dist * Math.sin(el),
        dist * Math.cos(el) * Math.cos(az)
      );
      camera.lookAt(target);
      renderer.render(scene, camera);

      // Pin each label to its part's current centre.
      const { clientWidth: w, clientHeight: h } = host;
      parts.forEach((part) => {
        const el = labelRefs.current[part.index];
        if (!el) return;
        tmp.copy(part.centre).addScaledVector(part.offset, part.amount).project(camera);
        const x = (tmp.x * 0.5 + 0.5) * w;
        const y = (-tmp.y * 0.5 + 0.5) * h;
        const shown = part.amount > 0.85;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
        el.dataset.side = x > w * 0.5 ? 'right' : 'left';
        el.classList.toggle('is-shown', shown && tmp.z < 1);
      });

      return s.current !== s.target;
    };

    const tick = () => {
      raf = 0;
      if (disposed || !loaded) return;
      if (update()) kick();
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    state.current.kick = kick;

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      kick();
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).load(
      model.src,
      (gltf) => {
        if (disposed) return;
        // Parts are named nodes: a mesh, or a group of single-colour meshes.
        const byName = {};
        gltf.scene.traverse((o) => {
          if (o.name) byName[o.name] = o;
          if (o.isMesh) {
            cadMaterials.set(o, o.material);
            o.material = materials.body;
          }
        });
        gltf.scene.updateMatrixWorld(true);
        parts = model.parts.map((part, index) => {
          const objects = part.meshes.map((n) => byName[n]).filter(Boolean);
          objects.forEach((o) => {
            o.traverse((m) => {
              if (!m.isMesh) return;
              m.material = part.tone === 'original' ? cadMaterials.get(m) : materials[part.tone] ?? materials.body;
            });
            o.userData.base = o.position.clone();
          });
          const box = new THREE.Box3();
          objects.forEach((o) => box.expandByObject(o));
          return {
            index,
            step: part.step,
            objects,
            offset: new THREE.Vector3(...part.offset),
            centre: box.isEmpty() ? new THREE.Vector3() : box.getCenter(new THREE.Vector3()),
            amount: 0,
          };
        });
        scene.add(gltf.scene);
        loaded = true;
        state.current.current = state.current.target;
        update();
        onReady?.();
      },
      undefined,
      (err) => {
        console.error('Model failed to load', err);
        if (!disposed) onError?.();
      }
    );

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      state.current.kick = null;
      scene.traverse((o) => {
        o.geometry?.dispose();
        if (o.material?.map) o.material.map.dispose();
        o.material?.dispose?.();
      });
      Object.values(materials).forEach((m) => m.dispose());
      cadMaterials.forEach((m) => m.dispose());
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [model]);

  return (
    <div className="model-stage" ref={hostRef}>
      <canvas ref={canvasRef} aria-hidden="true" />
      <div className="model-labels" aria-hidden="true">
        {model.parts.map((part, i) => part.step >= 0 && (
          <span key={part.label} className="model-label" ref={(el) => (labelRefs.current[i] = el)}>
            <span className="model-label__dot" />
            <span className="model-label__text">
              <span className="mono">{pad(i + 1)}</span> {part.label}
            </span>
          </span>
        ))}
      </div>
    </div>
  );
});

export default ModelStage;
