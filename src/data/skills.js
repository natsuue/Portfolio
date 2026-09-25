// Skills, grouped as on the resume. Adding a skill is a one-line change:
// use a plain string, or { name, note } to attach a small label (e.g. where it was used).

export const skillGroups = [
  {
    id: 'hardware',
    label: 'Hardware',
    blurb: 'Microcontrollers, firmware, and the protocols that connect them.',
    items: [
      'Arduino',
      'PIC Microcontrollers',
      { name: 'ESP32', note: 'PuriSense' },
      'Embedded C/C++',
      { name: 'FreeRTOS', note: 'PuriSense' },
      'Sensor integration',
      'I2C',
      'UART',
      'MQTT',
      'AutoCAD',
    ],
  },
  {
    id: 'software',
    label: 'Software',
    blurb: 'The languages behind the firmware, the models, and the back ends.',
    items: ['Python', 'C', 'C++', 'JavaScript', 'SQL'],
  },
  {
    id: 'web',
    label: 'Web',
    blurb: 'Full-stack web applications, from interface to database.',
    items: ['HTML', 'CSS', 'Bootstrap', 'PHP', 'Firebase', 'MySQL', 'SQL Server / SSMS'],
  },
  {
    id: 'mobile',
    label: 'Mobile',
    blurb: 'Cross-platform apps backed by real-time cloud data.',
    items: [{ name: 'Flutter', note: 'PuriSense' }],
  },
  {
    id: 'tools',
    label: 'Tools',
    blurb: 'For boards, microcontrollers, and making sense of data.',
    items: ['EagleCAD', 'MPLAB IDE', 'Power BI'],
  },
];
