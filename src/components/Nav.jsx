import { useEffect, useRef, useState } from 'react';
import { contact, navLinks, profile } from '../data/site.js';
import { pad } from '../utils/emphasize.jsx';
import NSLogo from './NSLogo.jsx';

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const toggleRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Highlight the link for whichever section sits in the middle of the viewport.
  useEffect(() => {
    const ids = ['top', ...navLinks.map((l) => l.id)];
    const sections = ids.map((id) => document.getElementById(id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    root.classList.add('is-locked');
    menuRef.current?.querySelector('a')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia('(min-width: 860px)');
    const onMq = (e) => e.matches && setOpen(false);

    window.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      root.classList.remove('is-locked');
      window.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  return (
    <header className={`site-header${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="site-header__inner container">
        <a href="#top" className="brand" onClick={() => setOpen(false)}>
          <span className="brand__mark" aria-hidden="true">
            <NSLogo />
          </span>
          <span className="brand__name">{profile.name}</span>
        </a>

        <nav aria-label="Primary" className="nav-desktop">
          <ul>
            {navLinks.map((l) => (
              <li key={l.id}>
                <a href={`#${l.id}`} aria-current={active === l.id ? 'true' : undefined}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <a href="#contact" className="btn btn--primary btn--small header-cta">
          Let’s talk
        </a>

        <button
          ref={toggleRef}
          type="button"
          className="menu-toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-toggle__bars" aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" ref={menuRef} className="mobile-menu" hidden={!open}>
        <nav aria-label="Mobile">
          <ol>
            {navLinks.map((l, i) => (
              <li key={l.id} style={{ '--i': i }}>
                <a href={`#${l.id}`} onClick={() => setOpen(false)}>
                  <span className="mono">{pad(i + 1)}</span>
                  {l.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
        <div className="mobile-menu__foot">
          <span className="mono">Say hello</span>
          <a href={`mailto:${contact.email}`}>{contact.email}</a>
        </div>
      </div>
    </header>
  );
}
