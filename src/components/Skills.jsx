import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';
import { skillGroups } from '../data/skills.js';
import { pad } from '../utils/emphasize.jsx';

const normalize = (item) => (typeof item === 'string' ? { name: item } : item);

// Moves the card's spotlight to follow the pointer.
function onPointerMove(e) {
  const card = e.target.closest('.skill-card');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', `${e.clientX - r.left}px`);
  card.style.setProperty('--my', `${e.clientY - r.top}px`);
}

export default function Skills() {
  return (
    <section id="skills" className="section skills" aria-labelledby="skills-title">
      <div className="container">
        <SectionHeader
          index="02"
          label="Skills"
          id="skills-title"
          title="Tools of the *trade*."
          kicker="Grouped the way I use them — from bare-metal microcontrollers up to the web."
        />

        <div className="skills__grid" onPointerMove={onPointerMove}>
          {skillGroups.map((group, i) => {
            const items = group.items.map(normalize);
            return (
              <Reveal as="article" key={group.id} className="skill-card" delay={i * 70} aria-labelledby={`skill-${group.id}`}>
                <header className="skill-card__head">
                  <span className="skill-card__index mono">{pad(i + 1)}</span>
                  <h3 id={`skill-${group.id}`}>{group.label}</h3>
                  <span className="skill-card__count mono" aria-label={`${items.length} skills`}>
                    {pad(items.length)}
                  </span>
                </header>
                {group.blurb && <p className="skill-card__blurb">{group.blurb}</p>}
                <ul className="tags">
                  {items.map((it) => (
                    <li key={it.name} className="tag">
                      {it.name}
                      {it.note && <span className="tag__note">{it.note}</span>}
                    </li>
                  ))}
                </ul>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
