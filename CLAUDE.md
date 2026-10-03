# Nathaniel Suarez — Portfolio

Personal portfolio for Nathaniel Suarez (Computer Engineering graduate, DLSU-D 2026).
React 18 + Vite, plain CSS, three.js only for the 3D section. Live at
https://nathanielsuarez.vercel.app (repo: github.com/natsuue/Portfolio).

## Working with Nathaniel

- **Review before implementing.** For anything broad (new sections, site-wide effects, redesigns),
  explain the plan, conflicts, and open questions first, and wait for approval. Small, targeted fixes
  can go ahead directly.
- **Never push without being asked.** Commit locally when a change is done; push only on "push it".
  A push to `main` deploys to Vercel automatically within about a minute.
- **Don't invent facts.** All content comes from his resume, the thesis code and docs, or his own
  words. Drafted copy must be flagged for his review.
- He likes to see options visually (screenshots, playable prototypes) before choosing.

## Commands

```bash
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # serve the build on :4173 (used for headless-Chrome checks)
npm run model -- "<path>.fbx" --simplify=0.001   # convert a Fusion FBX → public/models/purisense.glb
```

There's no test suite. Verify visually: `npm run build`, `npm run preview`, then screenshot with
`puppeteer-core` (a dev dependency) driving the installed Chrome at
`C:/Program Files/Google/Chrome/Application/chrome.exe`. Check desktop (1440×900) and mobile
(390×844), the browser console for errors, horizontal overflow, and reduced motion. Load `/#top`
to skip the intro when checking other sections.

## Structure

- `src/data/` — **all content and settings.** Edit these, not components, for content changes.
  - `site.js` (hero, about card, contact, nav, footer) · `skills.js` (the About marquee rows) · `projects.js` (projects and
    case studies) · `timeline.js` · `achievements.js`
  - `loader.js` — intro timing, the chip's trace layout, and its tap and hint timing. Chosen by
    Nathaniel from mockups. Treat these values as his decisions.
  - `model.js` — 3D exploded-view parts (mesh names, explode offsets, order, labels).
- `src/components/` — one component per section. `HeroChip` draws the Hero's NS chip and plays the
  intro; `HeroCanvas` is the Hero's background pattern. `ExplodedModel` and the lazily loaded
  `ModelStage` hold the 3D section.
- `src/styles/` — `tokens.css` (palette, type, spacing) plus one stylesheet per section, all
  imported in `index.css`.
- In copy strings, `*word*` renders as an italic serif accent (`utils/emphasize.jsx`).

## Design decisions (settled)

- **Palette:** blue `--accent-rgb: 71, 175, 255` (#47afff) and amber second accent
  `--accent-2-rgb: 255, 181, 71`, both in `tokens.css`. Use `var(--accent)` or
  `rgba(var(--accent-rgb), a)`, and never hardcode colours. The canvases read `--accent-rgb` and
  `--text-rgb` at runtime.
- **Type:** Geist (sans), Geist Mono (labels), Instrument Serif italic (accents). Dark background
  `#0a0b0d`.
- **NS mark:** "Routed Trace" monogram (`NSLogo.jsx`), also used in the nav, the favicon, and the
  Hero chip.
- **Intro:** plays inside the Hero, about 3 s, on **every visit** with no skip. The NS chip is in its
  Hero spot from the first frame. It lights up, its traces escape past the screen edges, then they
  settle back to short resting traces while the copy and nav come in. The background pattern follows.
  No glow ring. Direct links (`/#…`) and reduced motion show the settled Hero straight away. An 8 s
  safety timeout in `index.html` makes sure the copy can never stay hidden.
- **Hero:** availability pill, identity line ("Software Engineer", Hero only; everywhere else says
  Computer Engineer), name, statement — no CTAs, by request. The NS chip is on the right (above the
  copy on mobile).
- **Hero interaction:** with a mouse, the background pattern dims and a soft light around the pointer
  reveals it. The chip is a button: hover or focus lifts it, lights its pins and runs a light round
  its edge; clicking or tapping it replays the escape. Without hover, the edge light runs once every
  6 s as a hint. None of this runs under reduced motion.
- **Header:** keeps both the "Contact" link and the "Let's talk" button (his choice).
- **Section order:** Hero → About (About and Skills merged) → Projects → Inside PuriSense (3D,
  scroll-pinned) → Journey → Certifications → Contact. The nav has one "About" link for both.
- **About:** a card in the same spot as the Hero's chip (so it reads as the chip's replacement):
  his four graduation photos (`public/images/about/`, one burst stepped through by scroll, natural
  colour), a small "Engineering *across* the stack." heading, and only the first About sentence, set
  large in the serif. Four rows of large skill names slide behind it. Pins on wide screens; on phones
  the card comes first, then the rows. Next step (not built): the card rises into the Hero to take
  the chip's place, with the Hero's background staying fixed behind both.
- PuriSense is a **team thesis**. Always credit it as such, with his role (firmware, Flutter app,
  Firebase backend, hardware).
- Respect `prefers-reduced-motion` in anything animated, and keep mobile layouts intentional.

## Source material outside the repo

- PuriSense thesis code and docs: `C:\Users\natsu\OneDrive\Desktop\tangina desktop to\thesiscodes`
  (`PuriSense_System_Explanation.html` is the best summary). Never copy credentials from it.
- `reference-folder/` holds a watermarked stock clip used only as a visual reference. It is
  gitignored and must never be committed or used on the site.

Open to-dos are tracked in Claude's memory (`portfolio-open-items`); the main gap is the CognitiveAI
case study, which is still drafted from his resume only.
