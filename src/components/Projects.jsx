import { useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from './ProjectCard.jsx';
import CaseStudy from './CaseStudy.jsx';
import { categories, projects } from '../data/projects.js';

const HASH = /^#work\/([\w-]+)$/;
const labelFor = (id) => categories[id] ?? id.charAt(0).toUpperCase() + id.slice(1);

export default function Projects() {
  const [filter, setFilter] = useState('all');
  const [openSlug, setOpenSlug] = useState(null);
  const triggerRef = useRef(null);

  // Filters come straight from the data: known categories first (in `categories` order), then any others.
  const filters = useMemo(() => {
    const present = new Set(projects.flatMap((p) => p.category));
    const ordered = [
      ...Object.keys(categories).filter((c) => present.has(c)),
      ...[...present].filter((c) => !(c in categories)),
    ];
    return [
      { id: 'all', label: 'All', count: projects.length },
      ...ordered.map((id) => ({
        id,
        label: labelFor(id),
        count: projects.filter((p) => p.category.includes(id)).length,
      })),
    ];
  }, []);

  const visible = filter === 'all' ? projects : projects.filter((p) => p.category.includes(filter));

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
  const activeLabel = filters.find((f) => f.id === filter)?.label;

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

        <div className="filters" role="group" aria-label="Filter projects by category">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              className="filter"
              aria-pressed={filter === f.id}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
              <span className="filter__count mono" aria-hidden="true">
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <p className="sr-only" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? 'project' : 'projects'}
          {filter === 'all' ? '' : ` in ${activeLabel}`}.
        </p>

        <ul className="project-list" key={filter}>
          {visible.map((p, i) => (
            <li key={p.slug} style={{ '--i': i }}>
              <ProjectCard
                project={p}
                number={projects.indexOf(p) + 1}
                flip={i % 2 === 1}
                onOpen={open}
              />
            </li>
          ))}
        </ul>
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
