import { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import SectionHeader from './SectionHeader.jsx';
import { purisenseModel as model } from '../data/model.js';
import { activePart, clamp01 } from '../utils/explode.js';
import { pad } from '../utils/emphasize.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

// three.js is only downloaded when this section comes near the viewport.
const ModelStage = lazy(() => import('./ModelStage.jsx'));

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl')));
  } catch {
    return false;
  }
}

export default function ExplodedModel() {
  const reduced = useReducedMotion();
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const stageRef = useRef(null);
  const progressRef = useRef(0);
  const [near, setNear] = useState(false);
  const [status, setStatus] = useState('loading'); // loading | ready | fallback
  const [active, setActive] = useState(0);
  const [manual, setManual] = useState(1);

  useEffect(() => {
    if (!hasWebGL()) setStatus('fallback');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setNear(true);
          io.disconnect();
        }
      },
      { rootMargin: '100% 0px' }
    );
    io.observe(sectionRef.current);
    return () => io.disconnect();
  }, []);

  const apply = useCallback((p) => {
    progressRef.current = p;
    stageRef.current?.setProgress(p);
    trackRef.current?.style.setProperty('--p', p.toFixed(4));
    const next = activePart(model.parts, p);
    setActive((prev) => (prev === next ? prev : next));
  }, []);

  // Scroll drives the explode: 0 as the stage pins, 1 as it's about to leave.
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const measure = () => {
      raf = 0;
      const track = trackRef.current;
      if (!track) return;
      const r = track.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      apply(total > 0 ? clamp01(-r.top / total) : 0);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced, apply]);

  // Reduced motion: no scroll-driven movement; a slider controls the explode instead.
  useEffect(() => {
    if (reduced) apply(manual);
  }, [reduced, manual, apply]);

  const onReady = useCallback(() => {
    setStatus('ready');
    stageRef.current?.setProgress(progressRef.current);
  }, []);
  const onError = useCallback(() => setStatus('fallback'), []);

  return (
    <section
      id="inside"
      ref={sectionRef}
      className={`section inside${reduced ? ' inside--static' : ''}`}
      aria-labelledby="inside-title"
    >
      <div className="container">
        <SectionHeader index="02" label="Prototype" id="inside-title" title={model.title} kicker={model.kicker} />
      </div>

      <div className="inside__track" ref={trackRef}>
        <div className="inside__sticky">
          <div className="container inside__layout">
            <div className="inside__stage">
              <div className="inside__backdrop" aria-hidden="true" />

              {status !== 'ready' && (
                <img
                  className={`inside__poster${status === 'fallback' ? ' is-fallback' : ''}`}
                  src={model.poster}
                  alt={status === 'fallback' ? 'Exploded view of the PuriSense enclosure, with each part separated.' : ''}
                  onError={(e) => (e.currentTarget.hidden = true)}
                />
              )}
              {status === 'loading' && (
                <p className="inside__loading mono" role="status">
                  Loading model…
                </p>
              )}

              {near && status !== 'fallback' && (
                <Suspense fallback={null}>
                  <ModelStage ref={stageRef} model={model} onReady={onReady} onError={onError} />
                </Suspense>
              )}

              {!reduced && (
                <div className="inside__rail" aria-hidden="true">
                  <span className="inside__rail-fill" />
                </div>
              )}
              {!reduced && (
                <p className="inside__hint mono" aria-hidden="true">
                  Scroll to take it apart
                </p>
              )}
            </div>

            <aside className="inside__parts" aria-label="Parts of the enclosure">
              <p className="inside__count mono" aria-hidden="true">
                Part <span>{pad(active + 1)}</span> / {pad(model.parts.length)}
              </p>
              <ol>
                {model.parts.map((part, i) => (
                  <li key={part.label} className={i === active ? 'is-active' : undefined}>
                    <span className="inside__num mono">{pad(i + 1)}</span>
                    <div>
                      <h3>{part.label}</h3>
                      <p>{part.note}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {reduced && status !== 'fallback' && (
                <label className="inside__slider">
                  <span className="mono">Explode</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={Math.round(manual * 100)}
                    onChange={(e) => setManual(Number(e.target.value) / 100)}
                  />
                </label>
              )}
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}
