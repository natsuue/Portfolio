import { useEffect, useRef } from 'react';
import { about } from '../data/site.js';
import { skillGroups } from '../data/skills.js';
import { emphasize } from '../utils/emphasize.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

// About + Skills. A card (the photo burst and one sentence) sits where the Hero's chip sits, so it
// reads as the chip's replacement; four rows of skill names slide behind it. On wide screens the
// section pins for a stretch of scrolling: the photo steps through the burst and the rows drift
// (faster while you scroll, paused under the mouse). On phones nothing pins: card, then rows.

const normalize = (item) => (typeof item === 'string' ? { name: item } : item);
const ROWS = [[skillGroups[0]], [skillGroups[1]], [skillGroups[2]], [skillGroups[3], skillGroups[4]]];
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => {
  const t = clamp01(x);
  return t * t * (3 - 2 * t);
};

function Row({ groups }) {
  const unit = groups.map((g) => (
    <span className="about__unit" key={g.id}>
      <b>{g.label}</b>
      {g.items.map(normalize).map((x) => (
        <span key={x.name} className={x.note ? 'is-puri' : undefined}>
          {x.name}
        </span>
      ))}
    </span>
  ));
  // four copies, so the loop never shows a gap at any width
  return (
    <div className="about__row" aria-hidden="true">
      <div className="about__run">
        {unit}
        {unit}
        {unit}
        {unit}
      </div>
    </div>
  );
}

export default function About() {
  const trackRef = useRef(null);
  const photosRef = useRef(null);
  const ticksRef = useRef(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const track = trackRef.current;
    const imgs = [...photosRef.current.children];
    const ticks = [...ticksRef.current.children];
    const rows = [...track.querySelectorAll('.about__row')].map((el, k) => {
      const row = { el, run: el.firstChild, dir: k % 2 ? 1 : -1, speed: 24 + (k % 2) * 8, off: k * 173, hover: false };
      el.addEventListener('pointerenter', () => (row.hover = true));
      el.addEventListener('pointerleave', () => (row.hover = false));
      return row;
    });

    // p (0..1) → which shot, holding each and crossfading over the middle of its stretch;
    // the last shot lands with a fifth of the stretch to spare
    const setPhoto = (p) => {
      const f = clamp01((p - 0.04) / 0.76) * (imgs.length - 1);
      const i = Math.min(imgs.length - 2, Math.floor(f));
      const t = smooth((f - i - 0.3) / 0.4);
      imgs.forEach((im, k) => (im.style.opacity = k < i ? 0 : k === i ? 1 : k === i + 1 ? t : 0));
      ticks.forEach((tk, k) => tk.classList.toggle('is-on', k <= Math.round(f)));
    };
    const progress = () => {
      const r = track.getBoundingClientRect();
      if (window.innerWidth > 860) return clamp01(-r.top / Math.max(1, r.height - window.innerHeight));
      // phones (no pinning): while the card passes through the screen
      const c = photosRef.current.getBoundingClientRect();
      return clamp01((window.innerHeight * 0.9 - c.top) / (window.innerHeight * 0.9 + c.height * 0.4));
    };

    if (reduced) {
      setPhoto(1);
      rows.forEach((row) => (row.run.style.transform = ''));
      return undefined;
    }

    let raf = 0;
    let last = performance.now();
    let lastY = window.scrollY;
    const loop = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const dy = Math.abs(window.scrollY - lastY);
      lastY = window.scrollY;
      setPhoto(progress());
      rows.forEach((row) => {
        row.off += (row.hover ? 0 : row.speed * dt) + dy * 0.25;
        const size = row.run.scrollWidth / 4;
        const o = ((row.off % size) + size) % size;
        row.run.style.transform = `translate3d(${(row.dir < 0 ? -o : o - size).toFixed(1)}px, 0, 0)`;
      });
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([entry]) => {
      cancelAnimationFrame(raf);
      if (entry.isIntersecting) {
        last = performance.now();
        lastY = window.scrollY;
        raf = requestAnimationFrame(loop);
      }
    });
    io.observe(track);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [reduced]);

  return (
    <section id="about" className="about" aria-labelledby="about-title">
      <div className="about__track" ref={trackRef}>
        <div className="about__stage">
          {ROWS.map((groups, i) => (
            <Row key={i} groups={groups} />
          ))}

          <div className="about__layout container">
            <article className="about__card">
              <div className="about__photos" ref={photosRef} role="img" aria-label={about.photoAlt}>
                {about.photos.map((ph, i) => (
                  <img
                    key={ph.src}
                    src={ph.src}
                    alt=""
                    width="840"
                    height="560"
                    loading="lazy"
                    decoding="async"
                    style={{ objectPosition: ph.position, opacity: i === 0 ? 1 : 0 }}
                  />
                ))}
              </div>
              <div className="about__ticks" ref={ticksRef} aria-hidden="true">
                {about.photos.map((ph) => (
                  <i key={ph.src} />
                ))}
              </div>
              <h2 id="about-title" className="about__title">
                {emphasize(about.title)}
              </h2>
              <p className="about__statement">{emphasize(about.statement)}</p>

              {/* The rows are decoration; this is the skills list for screen readers. */}
              <ul className="sr-only">
                {skillGroups.map((g) => (
                  <li key={g.id}>
                    {g.label}: {g.items.map((it) => normalize(it).name).join(', ')}
                  </li>
                ))}
              </ul>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
