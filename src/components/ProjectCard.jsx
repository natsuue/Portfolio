import { ArrowUpRight } from './Icons.jsx';

const MAX_TAGS = 5;

// One tall panel per project, side by side. The open panel is wider and shows the description,
// stack and button; the others show just the image and title. Projects.jsx decides which is open
// (pointer, focus or tap). On phones every panel is open and they stack.
export default function ProjectCard({ project: p, open, onActivate, onOpen }) {
  const extra = p.technologies.length - MAX_TAGS;

  return (
    <article
      className={`project-panel${open ? ' is-open' : ''}`}
      aria-labelledby={`project-${p.slug}`}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onActivate()}
      onFocus={onActivate}
      onClick={(e) => {
        // a tap on a closed panel opens it; the button inside opens the case study
        if (!open && !e.target.closest('button')) onActivate();
      }}
    >
      <div className="project-panel__media">
        <img
          src={p.image}
          alt={p.imageAlt}
          width="1600"
          height="1000"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="project-panel__body">
        <p className="project-panel__meta mono">
          {p.period}
          {p.status && <span> / {p.status}</span>}
        </p>
        <h3 id={`project-${p.slug}`} className="project-panel__title">
          {p.title}
        </h3>
        <p className="project-panel__subtitle">{p.subtitle}</p>

        <div className="project-panel__more">
          <div className="project-panel__inner">
            <p className="project-panel__desc">{p.description}</p>
            <ul className="tags tags--compact" aria-label="Technologies">
              {p.technologies.slice(0, MAX_TAGS).map((t) => (
                <li key={t} className="tag">
                  {t}
                </li>
              ))}
              {extra > 0 && <li className="tag tag--more">+{extra}</li>}
            </ul>
            <button
              type="button"
              className="project-panel__cta"
              onClick={(e) => onOpen(p.slug, e.currentTarget)}
            >
              View project<span className="sr-only">: {p.title}</span>
              <ArrowUpRight />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
