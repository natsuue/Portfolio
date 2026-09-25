# Nathaniel Suarez — Portfolio

React + Vite, no other runtime dependencies.

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # serve the build locally
```

Deploys to Vercel as-is (framework preset: Vite).

## Editing content

All copy lives in `src/data/`. Components never need to change for content updates.

| File | What it holds |
| --- | --- |
| `site.js` | Hero text, About, Contact details, nav links, footer line |
| `skills.js` | Skill groups: add a skill as one string, or `{ name, note }` |
| `projects.js` | Projects, categories, and full case studies |
| `timeline.js` | Journey entries (`type`: education / project / work) |
| `achievements.js` | Certifications; the section hides itself when empty |

**Add a project:** append an object to `projects` in `projects.js`. Filters are built from each
project's `category` array automatically. A new category only needs a label in `categories`.

**Images:** drop files in `public/images/` and point `image` (cover) or `gallery[].src` at them.
Gallery entries without `src` show as labelled placeholders.

**Links:** any `href: null` is hidden. Set `contact.github` to show GitHub in Contact and the footer,
and `contact.phone.public: true` to show the phone number.

**Contact form:** with `contact.formEndpoint: null` the form opens the visitor's email app with the
message pre-filled. Set it to a form-backend URL (e.g. Formspree) to send in-page instead.

**Case studies** open at `/#work/<slug>`, so each one can be linked directly.

## 3D model (Inside PuriSense)

The exploded view loads `public/models/purisense.glb`. To replace it with a new Fusion export:

```bash
npm run model -- "C:\path\to\model.fbx" --simplify=0.001
```

This converts the FBX in headless Chrome (no Blender needed) and compresses it. `--simplify`
reduces very detailed parts (0.001 took the current model from 10 MB to 2.2 MB with no visible
loss); leave it off for a light model. Export the **assembled** design from Fusion's Design
workspace as FBX, with each component named; STL won't work, since it merges everything
into a single mesh. It also prints
every mesh name, which you then reference in `src/data/model.js` along with each part's explode
direction (`offset`), its order (`step`), and its label. three.js loads lazily, only when a
visitor reaches the section. Visitors with reduced motion get a slider instead of the scroll,
and browsers without WebGL see `public/images/purisense-exploded.webp`.

## Intro (power-up loading screen)

Plays on every visit before the Hero, about 3.5 s: pulses travel out from the NS monogram
through a generated circuit, then it dissolves into the Hero. Settings, including an on/off
switch, timing, pulse reach, and circuit density per screen size, live in `src/data/loader.js`.
Direct links to a section (e.g. `/#contact`) skip it, and reduced motion gets a short static
version. The NS mark itself is `src/components/NSLogo.jsx` (also used in the nav) and
`public/favicon.svg`.

## Styling

- `src/styles/tokens.css`: colours, fonts, spacing, easing (retheme here)
- One stylesheet per section alongside it
- All motion is disabled under `prefers-reduced-motion`
