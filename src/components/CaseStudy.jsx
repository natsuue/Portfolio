import { useEffect, useRef, useState } from 'react';
import FlowDiagram from './FlowDiagram.jsx';
import { ArrowRight, ArrowUpRight, Close } from './Icons.jsx';
import { categories } from '../data/projects.js';
import { pad } from '../utils/emphasize.jsx';
import useReducedMotion from '../hooks/useReducedMotion.js';

export default function CaseStudy({ project: p, number, total, next, onNavigate, onClose }) {
  const dialogRef = useRef(null);
  const scrollRef = useRef(null);
  const lightboxCloseRef = useRef(null);
  const closeTimer = useRef(0);
  const reduced = useReducedMotion();
  const [closing, setClosing] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    document.documentElement.classList.add('is-locked');
    return () => {
      document.documentElement.classList.remove('is-locked');
      clearTimeout(closeTimer.current);
    };
  }, []);

  // Moving to the next project starts from the top.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
    setLightbox(null);
  }, [p.slug]);

  useEffect(() => {
    if (lightbox) lightboxCloseRef.current?.focus();
  }, [lightbox]);

  const requestClose = () => {
    if (lightbox) return setLightbox(null);
    if (closing) return;
    setClosing(true);
    closeTimer.current = setTimeout(() => dialogRef.current?.close(), reduced ? 0 : 240);
  };

  const onCancel = (e) => {
    e.preventDefault();
    requestClose();
  };

  const sectionId = (id) => `cs-${p.slug}-${id}`;
  const { sections, gallery = [] } = p.caseStudy;
  const links = p.links.filter((l) => l.href);
  const toc = [...sections, gallery.length && { id: 'gallery', title: 'Gallery' }, { id: 'links', title: 'Links' }].filter(Boolean);

  const jumpTo = (id) => {
    const el = document.getElementById(sectionId(id));
    if (!el) return;
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    el.querySelector('h3')?.focus({ preventScroll: true });
  };

  return (
    <dialog
      ref={dialogRef}
      className={`case${closing ? ' is-closing' : ''}`}
      aria-labelledby="case-title"
      onCancel={onCancel}
      onClose={onClose}
    >
      <div className="case__scroll" ref={scrollRef}>
        <div className="case__bar">
          <span className="mono">
            Case study — P.{pad(number)} / {pad(total)}
          </span>
          <button type="button" className="case__close" onClick={requestClose}>
            Close <Close />
          </button>
        </div>

        <header className="case__head container" key={`head-${p.slug}`}>
          <p className="case__cats mono">
            {p.category.map((c) => categories[c] ?? c).join(' · ')} — {p.period}
          </p>
          <h2 id="case-title" className="case__title">
            {p.title}
          </h2>
          <p className="case__subtitle">{p.subtitle}</p>
        </header>

        <figure className="case__hero container">
          <img key={p.slug} src={p.image} alt={p.imageAlt} width="1600" height="1000" />
        </figure>

        <div className="case__layout container">
          <aside className="case__aside">
            <dl className="case__meta">
              <div>
                <dt className="mono">Period</dt>
                <dd>{p.period}</dd>
              </div>
              {p.role && (
                <div>
                  <dt className="mono">My role</dt>
                  <dd>{p.role}</dd>
                </div>
              )}
              {p.status && (
                <div>
                  <dt className="mono">Status</dt>
                  <dd>{p.status}</dd>
                </div>
              )}
              <div>
                <dt className="mono">Disciplines</dt>
                <dd>{p.category.map((c) => categories[c] ?? c).join(', ')}</dd>
              </div>
            </dl>
            <nav className="case__toc" aria-label="Case study sections">
              <p className="mono">Contents</p>
              <ol>
                {toc.map((s, i) => (
                  <li key={s.id}>
                    <button type="button" onClick={() => jumpTo(s.id)}>
                      <span className="mono">{pad(i + 1)}</span>
                      {s.title}
                    </button>
                  </li>
                ))}
              </ol>
            </nav>
          </aside>

          <div className="case__content">
            {sections.map((s, i) => (
              <section key={s.id} id={sectionId(s.id)} className="case__section" aria-labelledby={`${sectionId(s.id)}-h`}>
                <header className="case__section-head">
                  <span className="mono">{pad(i + 1)}</span>
                  <h3 id={`${sectionId(s.id)}-h`} tabIndex={-1}>
                    {s.title}
                  </h3>
                </header>
                {s.body?.map((para, j) => (
                  <p key={j}>{para}</p>
                ))}
                {s.list && (
                  <ul className="case__list">
                    {s.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
                {s.pairs && (
                  <ol className="case__pairs">
                    {s.pairs.map((pair, j) => (
                      <li key={pair.title} className="pair">
                        <h4 className="pair__title">
                          <span className="mono">{pad(j + 1)}</span>
                          {pair.title}
                        </h4>
                        <dl className="pair__body">
                          <div>
                            <dt className="mono">Problem</dt>
                            <dd>{pair.problem}</dd>
                          </div>
                          <div>
                            <dt className="mono">Fix</dt>
                            <dd>{pair.solution}</dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ol>
                )}
                {s.tags && (
                  <ul className="tags case__tags">
                    {s.tags.map((t) => (
                      <li key={t} className="tag">
                        {t}
                      </li>
                    ))}
                  </ul>
                )}
                {s.link && (
                  <p className="case__link">
                    <a className="text-link" href={s.link.href} onClick={requestClose}>
                      {s.link.label} <ArrowRight />
                    </a>
                  </p>
                )}
                {s.figure && <FlowDiagram {...s.figure} />}
                {s.stats && (
                  <dl className="case__stats">
                    {s.stats.map((st) => (
                      <div key={st.label}>
                        <dt className="mono">{st.label}</dt>
                        <dd>{st.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </section>
            ))}

            {gallery.length > 0 && (
              <section id={sectionId('gallery')} className="case__section" aria-labelledby={`${sectionId('gallery')}-h`}>
                <header className="case__section-head">
                  <span className="mono">{pad(sections.length + 1)}</span>
                  <h3 id={`${sectionId('gallery')}-h`} tabIndex={-1}>
                    Gallery
                  </h3>
                </header>
                <ul className="gallery">
                  {gallery.map((g) => (
                    <li key={g.caption}>
                      <figure>
                        {g.src ? (
                          <button type="button" className="gallery__item" onClick={() => setLightbox(g)}>
                            <img src={g.src} alt={g.alt ?? g.caption} loading="lazy" />
                            <span className="sr-only">Enlarge image</span>
                          </button>
                        ) : (
                          <div className="gallery__placeholder mono" aria-hidden="true">
                            Image coming soon
                          </div>
                        )}
                        <figcaption className="mono">{g.caption}</figcaption>
                      </figure>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section id={sectionId('links')} className="case__section" aria-labelledby={`${sectionId('links')}-h`}>
              <header className="case__section-head">
                <span className="mono">{pad(toc.length)}</span>
                <h3 id={`${sectionId('links')}-h`} tabIndex={-1}>
                  Links
                </h3>
              </header>
              {links.length ? (
                <ul className="case__links">
                  {links.map((l) => (
                    <li key={l.label}>
                      <a className="btn btn--ghost" href={l.href} target="_blank" rel="noreferrer">
                        {l.label} <ArrowUpRight />
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>
                  A code walkthrough or demo is available on request —{' '}
                  <a className="text-link" href="#contact" onClick={requestClose}>
                    get in touch
                  </a>
                  .
                </p>
              )}
            </section>
          </div>
        </div>

        {next && next.slug !== p.slug && (
          <div className="case__next container">
            <p className="mono">Next project</p>
            <button type="button" onClick={() => onNavigate(next.slug)}>
              {next.title} <ArrowRight />
            </button>
          </div>
        )}
      </div>

      {lightbox && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={lightbox.caption} onClick={() => setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.alt ?? lightbox.caption} onClick={(e) => e.stopPropagation()} />
          <p className="mono">{lightbox.caption}</p>
          <button ref={lightboxCloseRef} type="button" className="case__close lightbox__close" onClick={() => setLightbox(null)}>
            Close <Close />
          </button>
        </div>
      )}
    </dialog>
  );
}
