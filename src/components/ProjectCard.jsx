import { ArrowUpRight } from './Icons.jsx';
import { pad } from '../utils/emphasize.jsx';

const MAX_TAGS = 6;

export default function ProjectCard({ project: p, number, flip, onOpen }) {
  const extra = p.technologies.length - MAX_TAGS;

  return (
    <article className={`project-card${flip ? ' project-card--flip' : ''}`} aria-labelledby={`project-${p.slug}`}>
      <div className="project-card__media">
        <img src={p.image} alt={p.imageAlt} width="1600" height="1000" loading="lazy" decoding="async" />
        <div className="project-card__shade" aria-hidden="true" />
        <span className="project-card__badge mono" aria-hidden="true">
          P.{pad(number)}
        </span>
        {p.status && <span className="project-card__status mono">{p.status}</span>}
        <span className="project-card__peek mono" aria-hidden="true">
          Open case study <ArrowUpRight />
        </span>
      </div>

      <div className="project-card__body">
        <p className="project-card__meta mono">
          <span>{p.period}</span>
        </p>
        <h3 id={`project-${p.slug}`} className="project-card__title">
          {p.title}
        </h3>
        <p className="project-card__subtitle">{p.subtitle}</p>
        <p className="project-card__desc">{p.description}</p>

        <ul className="tags tags--compact" aria-label="Technologies">
          {p.technologies.slice(0, MAX_TAGS).map((t) => (
            <li key={t} className="tag">
              {t}
            </li>
          ))}
          {extra > 0 && <li className="tag tag--more">+{extra}</li>}
        </ul>

        <button type="button" className="project-card__cta" onClick={(e) => onOpen(p.slug, e.currentTarget)}>
          View project<span className="sr-only">: {p.title}</span>
          <ArrowUpRight />
        </button>
      </div>
    </article>
  );
}
