import { ArrowUp, GitHub, LinkedIn, Mail } from './Icons.jsx';
import { contact, footer, profile } from '../data/site.js';

export default function Footer() {
  const socials = [
    { label: 'Email', href: `mailto:${contact.email}`, Icon: Mail },
    contact.linkedin && { label: 'LinkedIn', href: contact.linkedin.href, Icon: LinkedIn, external: true },
    contact.github && { label: 'GitHub', href: contact.github.href, Icon: GitHub, external: true },
  ].filter(Boolean);

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__top">
          <div>
            <p className="site-footer__name">{profile.name}</p>
            <p className="site-footer__statement">{footer.statement}</p>
          </div>
          <ul className="site-footer__socials">
            {socials.map(({ label, href, Icon, external }) => (
              <li key={label}>
                <a href={href} aria-label={label} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
                  <Icon />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className="site-footer__bottom mono">
          <p>
            © {new Date().getFullYear()} {profile.name}
          </p>
          <a href="#top" className="site-footer__top-link">
            Back to top <ArrowUp />
          </a>
        </div>
      </div>
    </footer>
  );
}
