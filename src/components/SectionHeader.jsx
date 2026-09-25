import Reveal from './Reveal.jsx';
import { emphasize } from '../utils/emphasize.jsx';

export default function SectionHeader({ index, label, title, kicker, id }) {
  return (
    <Reveal as="header" className="section-head">
      <p className="section-head__label mono">
        <span className="section-head__index">{index}</span>
        <span className="section-head__rule" aria-hidden="true" />
        {label}
      </p>
      <h2 id={id} className="section-head__title">
        {emphasize(title)}
      </h2>
      {kicker && <p className="section-head__kicker">{kicker}</p>}
    </Reveal>
  );
}
