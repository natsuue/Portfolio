// Personal details, navigation, and copy used across the site.
// Wrap a word in *asterisks* to render it as an italic accent.

export const profile = {
  name: 'Nathaniel Suarez',
  fullName: 'Nathaniel T. Suarez',
  availability: 'Available for Opportunities',
  identity: 'Computer Engineer · Software × Hardware',
  statement: 'I build at the intersection of *hardware* and *software*.',
};

export const about = {
  title: 'Engineering *across* the stack.',
  lead:
    "I'm a Computer Engineering graduate of De La Salle University Dasmariñas, and I'm drawn to the whole path a signal takes — from a sensor on a board to a number on someone's screen.",
  body:
    'My work spans full-stack web development, mobile apps, IoT systems, and machine learning. I’m most comfortable in Python, C/C++, PHP, SQL, and Flutter, and most interested in projects where hardware and software have to meet. PuriSense — a team thesis where I worked across the ESP32 firmware, the Firebase backend, the Flutter app, and the hardware itself — is the clearest example.',
  story: {
    label: 'Field note — Filinvest Alabang, 2026',
    text:
      'Not every build starts from a clean slate. As an IT Business Solutions intern, I built a Smartsheet-based project management tool inside Smartsheet’s Dynamic View — deliberately, to avoid extra subscription costs — and engineered a unique-identifier system to fix a dropdown-deduplication problem the platform couldn’t handle on its own. Engineering around real constraints is part of the job, and it’s a part I enjoy.',
  },
  facts: [
    { label: 'Education', value: 'BS Computer Engineering, De La Salle University Dasmariñas · 2022–2026' },
    { label: 'Works in', value: 'Python · C/C++ · PHP · SQL · Flutter' },
    { label: 'Certified', value: 'Cisco Certified Network Associate (CCNA)' },
    { label: 'Looking for', value: 'A full-stack or software engineering role — firmware to cloud-connected apps' },
  ],
  diagram: {
    caption: 'Fig. 01 — PuriSense, edge → cloud → mobile',
    nodes: [
      { tag: 'Sense', label: '2× ZH03B laser sensors', detail: 'UART · intake + exhaust' },
      { tag: 'Edge', label: 'ESP32 firmware', detail: 'FreeRTOS dual-core · PWM fans · 4 modes' },
      { tag: 'Live', label: 'Firebase Realtime Database', detail: 'every 1 s · SSE commands' },
      { tag: 'History', label: 'Cloud Function → Firestore', detail: '1 snapshot / minute, 24/7' },
      { tag: 'App', label: 'Flutter app', detail: 'live dashboard · controls · reports' },
    ],
  },
};

export const contact = {
  title: 'Have an idea *worth building?*',
  blurb:
    'I’m looking for full-stack and software engineering roles, and I’m always glad to talk about hardware-meets-software projects. The fastest way to reach me is email.',
  email: 'suareznathaniel44@gmail.com',
  linkedin: { label: 'linkedin.com/in/suareznathaniel', href: 'https://www.linkedin.com/in/suareznathaniel' },
  // Add your GitHub once ready, e.g. { label: 'github.com/you', href: 'https://github.com/you' }
  github: null,
  // Set `public: true` to show the phone number in Contact.
  phone: { label: '+63 992 766 8770', href: 'tel:+639927668770', public: false },
  // Optional: a form backend URL (e.g. a Formspree endpoint). When null, the form opens the
  // visitor's email app with the message pre-filled.
  formEndpoint: null,
};

export const navLinks = [
  { id: 'about', label: 'About' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

export const footer = {
  statement: 'Built with code, curiosity, and a soldering iron.',
};
