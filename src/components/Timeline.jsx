import { useEffect, useRef } from 'react';
import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';
import { timeline } from '../data/timeline.js';
import useReducedMotion from '../hooks/useReducedMotion.js';

const TYPE_LABELS = { education: 'Education', project: 'Project', work: 'Experience' };

export default function Timeline() {
  const listRef = useRef(null);
  const reduced = useReducedMotion();

  // The rail fills in as the reader scrolls through the timeline.
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (reduced) {
      list.style.setProperty('--progress', '1');
      return;
    }
    let raf = 0;
    const update = () => {
      const r = list.getBoundingClientRect();
      const p = (window.innerHeight * 0.65 - r.top) / r.height;
      list.style.setProperty('--progress', String(Math.min(1, Math.max(0, p))));
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [reduced]);

  return (
    <section id="journey" className="section journey" aria-labelledby="journey-title">
      <div className="container">
        <SectionHeader index="03" label="Journey" id="journey-title" title="The *path* so far." />

        <div className="timeline" ref={listRef}>
          <span className="timeline__progress" aria-hidden="true" />
          <ol className="timeline__list">
          {timeline.map((item) => (
            <Reveal as="li" key={`${item.title}-${item.period}`} className="timeline__item" data-type={item.type}>
              <p className="timeline__date mono">{item.period}</p>
              <span className="timeline__node" aria-hidden="true" />
              <div className="timeline__card">
                <p className="timeline__type mono">{TYPE_LABELS[item.type] ?? item.type}</p>
                <h3>{item.title}</h3>
                <p className="timeline__org">{item.org}</p>
                <p className="timeline__desc">{item.description}</p>
              </div>
            </Reveal>
          ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
