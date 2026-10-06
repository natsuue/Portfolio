import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import HeroCanvas from './HeroCanvas.jsx';
import HeroChip from './HeroChip.jsx';
import HeroReveal from './HeroReveal.jsx';
import { profile } from '../data/site.js';
import { loaderConfig } from '../data/loader.js';
import { HERO_SETTINGS_EVENT, heroSettings } from '../data/hero.js';
import { emphasize } from '../utils/emphasize.jsx';
import { isBooting, release } from '../utils/boot.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

const IDLE_MS = 3000;

export default function Hero() {
  const contentRef = useRef(null);
  const fieldRef = useRef(null);
  const slotRef = useRef(null);
  const hitRef = useRef(null);
  const reduced = useReducedMotion();
  // On a normal visit the Hero plays the intro (HeroChip runs it); direct links skip it.
  const [playing] = useState(() => loaderConfig.enabled && isBooting());
  const [first, ...rest] = profile.name.split(' ');

  useLayoutEffect(() => {
    if (!playing) release();
  }, [playing]);

  // Scroll: the copy drifts and fades out; the background pattern stays fixed, then fades with About.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const vh = window.innerHeight;
        const y = Math.min(window.scrollY, vh);
        if (contentRef.current) {
          contentRef.current.style.transform = `translate3d(0, ${y * 0.16}px, 0)`;
          contentRef.current.style.opacity = String(Math.max(0, 1 - y / (vh * 1.05)));
        }
        // The pattern is fixed behind the Hero and About; it fades out as About ends, and stops
        // drawing once it's gone. (Left alone while the intro holds it hidden.)
        const field = fieldRef.current;
        const about = document.getElementById('about');
        if (field && about && !isBooting()) {
          const fade = Math.min(1, Math.max(0, (about.getBoundingClientRect().bottom - vh * 0.45) / (vh * 0.55)));
          field.style.transition = fade < 1 ? 'none' : '';
          field.style.opacity = fade < 1 ? fade.toFixed(3) : '';
          field.style.display = fade <= 0 ? 'none' : '';
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      if (contentRef.current) contentRef.current.style.cssText = '';
      if (fieldRef.current) Object.assign(fieldRef.current.style, { opacity: '', display: '', transition: '' });
    };
  }, [reduced]);

  // Flashlight: with a mouse, the background pattern dims and a soft light around the pointer
  // reveals it, along with a hidden layer of white traces (HeroReveal). The light trails the pointer slightly. Styles in hero.css (.hero__field.is-lit).
  // After IDLE_MS without mouse movement the light goes out and the whole pattern shows again,
  // as it does when the mouse leaves the Hero; moving the mouse brings the light back.
  const light = useRef({ x: 0, y: 0, tx: 0, ty: 0, raf: 0, idle: 0 });
  useEffect(
    () => () => {
      cancelAnimationFrame(light.current.raf);
      clearTimeout(light.current.idle);
    },
    []
  );

  // The flashlight's shape comes from src/data/hero.js (and the tweak panel, while tuning).
  useEffect(() => {
    const apply = () => {
      const f = heroSettings.flashlight;
      const s = fieldRef.current?.style;
      if (!s) return;
      s.setProperty('--spot-r', `${f.radius}px`);
      s.setProperty('--spot-core', `${f.core}%`);
      s.setProperty('--spot-falloff', `${f.falloff}%`);
      s.setProperty('--spot-edge', String(f.edge));
      s.setProperty('--floor-lit', String(f.dim));
      s.setProperty('--pulse-floor-lit', String(f.pulses ?? f.dim));
    };
    apply();
    window.addEventListener(HERO_SETTINGS_EVENT, apply);
    return () => window.removeEventListener(HERO_SETTINGS_EVENT, apply);
  }, []);

  const onPointerMove = (e) => {
    const field = fieldRef.current;
    if (reduced || e.pointerType !== 'mouse' || !field || isBooting()) return;
    const l = light.current;
    clearTimeout(l.idle);
    l.idle = setTimeout(() => !heroSettings.keepLit && field.classList.remove('is-lit'), IDLE_MS);
    const r = field.getBoundingClientRect();
    l.tx = e.clientX - r.left;
    l.ty = e.clientY - r.top;
    if (!field.classList.contains('is-lit')) {
      l.x = l.tx;
      l.y = l.ty;
      field.classList.add('is-lit');
    }
    if (l.raf) return;
    const follow = () => {
      l.x += (l.tx - l.x) * 0.22;
      l.y += (l.ty - l.y) * 0.22;
      field.style.setProperty('--lx', `${l.x.toFixed(1)}px`);
      field.style.setProperty('--ly', `${l.y.toFixed(1)}px`);
      l.raf = Math.abs(l.tx - l.x) + Math.abs(l.ty - l.y) > 0.5 ? requestAnimationFrame(follow) : 0;
    };
    l.raf = requestAnimationFrame(follow);
  };
  // (the tweak panel can keep the light on while you adjust it)
  const onPointerLeave = () => {
    clearTimeout(light.current.idle);
    if (!heroSettings.keepLit) fieldRef.current?.classList.remove('is-lit');
  };

  return (
    <section
      id="top"
      className="hero"
      aria-labelledby="hero-title"
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      <div className="hero__field" ref={fieldRef} aria-hidden="true">
        <HeroCanvas />
        {!reduced && <HeroReveal />}
      </div>
      <HeroChip slotRef={slotRef} hitRef={hitRef} playing={playing} />

      <div className="hero__stage container">
        <div className="hero__content" ref={contentRef}>
          <p className="hero__status hero__fade" style={{ '--d': '0.1s' }}>
            <span className="hero__dot" aria-hidden="true" />
            {profile.availability}
          </p>

          {/* 01 — Identity (small) */}
          <p className="hero__identity hero__fade" style={{ '--d': '0.25s' }}>
            {profile.identity}
          </p>

          {/* 02 — Name (huge) */}
          <h1 id="hero-title" className="hero__name">
            <span className="hero__line">
              <span style={{ '--i': 1 }}>{first}</span>
            </span>
            <span className="hero__line">
              <span style={{ '--i': 2 }}>{rest.join(' ')}</span>
            </span>
          </h1>

          {/* 03 — Philosophy (medium) */}
          <p className="hero__statement hero__fade" style={{ '--d': '0.6s' }}>
            {emphasize(profile.statement)}
          </p>
        </div>

        {/* Where HeroChip draws the chip; the button over it replays the escape. */}
        <div className="hero__chip" ref={slotRef}>
          {!reduced && (
            <button ref={hitRef} type="button" className="hero__chip-hit" aria-label="Replay the circuit animation" />
          )}
        </div>
      </div>
    </section>
  );
}
