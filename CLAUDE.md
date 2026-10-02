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
  - `site.js` (hero, about, contact, nav, footer) · `skills.js` · `projects.js` (projects and
    case studies) · `timeline.js` · `achievements.js`
  - `loader.js` — intro timing and density, tuned by Nathaniel in a prototype. Treat these values
    as his decisions.
  - `model.js` — 3D exploded-view parts (mesh names, explode offsets, order, labels).
- `src/components/` — one component per section. `loader/` holds the intro (`LoadingScreen`,
  `generateBurst`, `burstSystem`). `ExplodedModel` and the lazily loaded `ModelStage` hold the 3D
  section.
- `src/styles/` — `tokens.css` (palette, type, spacing) plus one stylesheet per section, all
  imported in `index.css`.
- In copy strings, `*word*` renders as an italic serif accent (`utils/emphasize.jsx`).

## Design decisions (settled)

- **Palette:** blue `--accent-rgb: 71, 175, 255` (#47afff) and amber second accent
  `--accent-2-rgb: 255, 181, 71`, both in `tokens.css`. Use `var(--accent)` or
  `rgba(var(--accent-rgb), a)`, and never hardcode colours. The intro's burst colour is `hue: 206`
  in `loader.js`; keep it matched to the accent if either changes.
- **Type:** Geist (sans), Geist Mono (labels), Instrument Serif italic (accents). Dark background
  `#0a0b0d`.
- **NS mark:** "Routed Trace" monogram (`NSLogo.jsx`), also used in the nav, the favicon, and the
  static first frame in `index.html`.
- **Intro:** circuit burst from the NS chip, about 3 s. Plays on **every visit** with no skip.
  Direct links (`/#…`) bypass it. Reduced motion shows a still frame and then fades. An 8 s safety
  timeout in `index.html` makes sure the page can never stay covered.
- **Hero:** availability pill, identity line, name, statement — nothing else (no CTAs, by request).
- **Header:** keeps both the "Contact" link and the "Let's talk" button (his choice).
- **Section order:** Hero → About → Skills → Projects → Inside PuriSense (3D, scroll-pinned) →
  Journey → Certifications → Contact.
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
