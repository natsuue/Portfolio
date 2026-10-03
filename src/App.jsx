import Nav from './components/Nav.jsx';
import Hero from './components/Hero.jsx';
import About from './components/About.jsx';
import Skills from './components/Skills.jsx';
import Projects from './components/Projects.jsx';
import ExplodedModel from './components/ExplodedModel.jsx';
import Timeline from './components/Timeline.jsx';
import Achievements from './components/Achievements.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';

export default function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <Hero />
        <About />
        <Skills />
        <Projects />
        <ExplodedModel />
        <Timeline />
        <Achievements />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
