import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';
import { ArrowUpRight } from './Icons.jsx';
import { achievements } from '../data/achievements.js';

export default function Achievements() {
  if (!achievements.length) return null;

  return (
    <section id="certifications" className="section achievements" aria-labelledby="certifications-title">
      <div className="container">
        <SectionHeader index="04" label="Certifications" id="certifications-title" title="*Credentials*." />

        <ul className="creds">
          {achievements.map((a, i) => (
            <Reveal as="li" key={a.title} className="cred" delay={i * 80}>
              <span className="cred__badge" aria-hidden="true">
                {a.short}
              </span>
              <div className="cred__body">
                <p className="cred__issuer mono">Issued by {a.issuer}</p>
                <h3 className="cred__title">{a.title}</h3>
                {a.description && <p className="cred__desc">{a.description}</p>}
                {a.href && (
                  <a className="text-link cred__link" href={a.href} target="_blank" rel="noreferrer">
                    Verify credential <ArrowUpRight />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
