import { useEffect, useRef, useState } from 'react';
import ProjectCard from './ProjectCard.jsx';
import CaseStudy from './CaseStudy.jsx';
import { projects } from '../data/projects.js';

const HASH = /^#work\/([\w-]+)$/;

export default function Projects() {
  const [openSlug, setOpenSlug] = useState(null);
  const [active, setActive] = useState(0); // the widened panel
  const triggerRef = useRef(null);

  // Case studies are linkable: /#work/purisense opens that project directly.
  useEffect(() => {
    const sync = () => {
      const match = window.location.hash.match(HASH);
      if (match && projects.some((p) => p.slug === match[1])) setOpenSlug(match[1]);
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  const open = (slug, trigger) => {
    if (trigger) triggerRef.current = trigger;
    setOpenSlug(slug);
    history.replaceState(null, '', `#work/${slug}`);
  };

  const close = () => {
    setOpenSlug(null);
    // Only reset the URL if it still points at the case study (a link inside may have moved on).
    if (HASH.test(window.location.hash)) history.replaceState(null, '', '#projects');
    requestAnimationFrame(() => triggerRef.current?.focus({ preventScroll: true }));
  };

  const openIndex = projects.findIndex((p) => p.slug === openSlug);
  const current = projects[openIndex];
  const next = projects.length > 1 ? projects[(openIndex + 1) % projects.length] : null;

  return (
    <section id="projects" className="section projects" aria-labelledby="projects-title">
      <div className="container">
        {/* Just the small label, no big title: the projects themselves open the section. */}
        <header className="section-head projects__head">
          <h2 id="projects-title" className="section-head__label mono">
            <span className="section-head__index">01</span>
            <span className="section-head__rule" aria-hidden="true" />
            Projects
          </h2>
        </header>


        <div className="project-panels">
          {projects.map((p, i) => (
            <ProjectCard
              key={p.slug}
              project={p}
              open={active === i}
              onActivate={() => setActive(i)}
              onOpen={open}
            />
          ))}
        </div>
      </div>

      {current && (
        <CaseStudy
          project={current}
          number={openIndex + 1}
          total={projects.length}
          next={next}
          onNavigate={(slug) => open(slug)}
          onClose={close}
        />
      )}
    </section>
  );
}
