import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Projects from './components/Projects.jsx';
import ExplodedModel from './components/ExplodedModel.jsx';
import Timeline from './components/Timeline.jsx';
import Achievements from './components/Achievements.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import { lazy, Suspense } from 'react';

// Temporary tuning panel for the Hero's background and flashlight: in `npm run dev`, or with ?tweak.
const HeroTweaks = lazy(() => import('./components/HeroTweaks.jsx'));
const showTweaks = import.meta.env.DEV || new URLSearchParams(window.location.search).has('tweak');

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <Projects />
        <ExplodedModel />
        <About />
        <Timeline />
        <Achievements />
        <Contact />
      </main>
      <Footer />
      {showTweaks && (
        <Suspense fallback={null}>
          <HeroTweaks />
        </Suspense>
      )}
    </>
  );
}
