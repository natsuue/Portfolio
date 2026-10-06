// Personal details, navigation, and copy used across the site.
// Wrap a word in *asterisks* to render it as an italic accent.

export const profile = {
  name: 'Nathaniel Suarez',
  fullName: 'Nathaniel T. Suarez',
  availability: 'Available for Opportunities',
  identity: 'Software Engineer', // the Hero's identity line only; title, meta, About and timeline say Computer Engineer
  statement: 'I build at the intersection of *hardware* and *software*.',
};

// About + Skills, merged: a card with the photo burst and one sentence, over the skills marquee
// (the skills come from skills.js). The photos are one burst, in order: looking away, turning,
// facing the camera, smiling. Scrolling steps through them.
export const about = {
  title: 'Engineering *across* the stack.',
  // the card's sentence; the words in *asterisks* are set in the accent colour
  statement:
    'I’m a Computer Engineering graduate of De La Salle University Dasmariñas, drawn to the whole path a signal takes, from a sensor on a board to *a number on someone’s screen.*',
  photos: [
    { src: '/images/about/grad-1.jpg', position: '47% 40%' },
    { src: '/images/about/grad-2.jpg', position: '49% 40%' },
    { src: '/images/about/grad-3.jpg', position: '51% 40%' },
    { src: '/images/about/grad-4.jpg', position: '49% 40%' },
  ],
  photoAlt: 'Nathaniel Suarez in his graduation gown',
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
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'journey', label: 'Journey' },
  { id: 'contact', label: 'Contact' },
];

export const footer = {
  statement: 'Built with code, curiosity, and a soldering iron.',
};
