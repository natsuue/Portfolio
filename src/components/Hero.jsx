import { useEffect, useRef } from 'react';
import HeroCanvas from './HeroCanvas.jsx';
import { profile } from '../data/site.js';
import { emphasize } from '../utils/emphasize.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function Hero() {
  const contentRef = useRef(null);
  const fieldRef = useRef(null);
  const reduced = useReducedMotion();
  const [first, ...rest] = profile.name.split(' ');

  // Scroll parallax: the trace field drifts slower than the page, the copy fades out.
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
        fieldRef.current?.style.setProperty('--scroll-y', `${y * 0.35}px`);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      if (contentRef.current) contentRef.current.style.cssText = '';
    };
  }, [reduced]);

  const onPointerMove = (e) => {
    if (reduced || e.pointerType !== 'mouse' || !fieldRef.current) return;
    const nx = e.clientX / window.innerWidth - 0.5;
    const ny = e.clientY / window.innerHeight - 0.5;
    fieldRef.current.style.setProperty('--px', `${nx * -22}px`);
    fieldRef.current.style.setProperty('--py', `${ny * -16}px`);
  };

  return (
    <section id="top" className="hero" aria-labelledby="hero-title" onPointerMove={onPointerMove}>
      <div className="hero__field" ref={fieldRef} aria-hidden="true">
        <HeroCanvas />
      </div>
      <div className="hero__glow" aria-hidden="true" />

      <div className="hero__content container" ref={contentRef}>
        <p className="hero__eyebrow mono anim" style={{ '--i': 0 }}>
          <span className="pulse-dot" aria-hidden="true" />
          {profile.availability}
        </p>

        {/* 01 — Identity (small) */}
        <p className="hero__identity mono anim" style={{ '--i': 1 }}>
          {profile.identity}
        </p>

        {/* 02 — Name (huge) */}
        <h1 id="hero-title" className="hero__name">
          <span className="hero__line">
            <span style={{ '--i': 2 }}>{first}</span>
          </span>
          <span className="hero__line">
            <span style={{ '--i': 3 }}>{rest.join(' ')}</span>
          </span>
        </h1>

        {/* 03 — Philosophy (medium) */}
        <p className="hero__statement anim" style={{ '--i': 4 }}>
          {emphasize(profile.statement)}
        </p>
      </div>
    </section>
  );
}
