import Reveal from './Reveal.jsx';
import SectionHeader from './SectionHeader.jsx';
import FlowDiagram from './FlowDiagram.jsx';
import { about } from '../data/site.js';

export default function About() {
  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeader index="01" label="About" id="about-title" title={about.title} />

        <div className="about__grid">
          <div className="about__text">
            <Reveal as="p" className="about__lead">
              {about.lead}
            </Reveal>
            <Reveal as="p" className="about__body" delay={80}>
              {about.body}
            </Reveal>

            <dl className="about__facts">
              {about.facts.map((f, i) => (
                <Reveal key={f.label} className="fact" delay={i * 70}>
                  <dt className="mono">{f.label}</dt>
                  <dd>{f.value}</dd>
                </Reveal>
              ))}
            </dl>

            <Reveal as="aside" className="about__story" aria-label="How I work">
              <p className="about__story-label mono">{about.story.label}</p>
              <p>{about.story.text}</p>
            </Reveal>
          </div>

          <Reveal className="about__visual" delay={120}>
            <FlowDiagram {...about.diagram} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
