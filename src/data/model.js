// The exploded 3D model in the "Inside PuriSense" section.
// Regenerate the model with:  npm run model -- "<path to .fbx>" --simplify=0.001
//
// Each part names one or more meshes from the model (as printed by the convert script), the
// direction it moves when exploded (`offset`, in model units — the model is 2 units tall), and
// `step`, the order it separates in (parts can share a step). `step: -1` stays in place.
// `tone` picks the material: body / panel / matte / component / accent / teal, or `original`
// to keep the colours from the CAD file. Meshes not listed here stay in place.
//
// NOTE: the part notes are drafts written from the thesis docs — review and correct them.

export const purisenseModel = {
  src: '/models/purisense.glb',
  poster: '/images/purisense-exploded.webp',
  title: 'Inside *PuriSense*.',
  kicker:
    'The thesis prototype modelled in Fusion — enclosure, fans, sensor, and electronics — taken apart piece by piece.',
  parts: [
    {
      meshes: ['main_chasis'],
      label: 'Main Chassis',
      note: 'The main body of the purifier, housing the filter chamber and the electronics bay.',
      offset: [0, 0, 0],
      step: -1,
      tone: 'body',
    },
    {
      meshes: ['top_cover'],
      label: 'Top Cover',
      note: 'Perforated cap over the fan deck.',
      offset: [0, 1.15, 0],
      step: 0,
      tone: 'panel',
    },
    {
      meshes: ['fans'],
      label: 'Fans',
      note: 'The four PWM fans (25 kHz) that pull air through the filter — in Auto mode their speed follows the PM2.5 level.',
      offset: [0, 0.8, 0],
      step: 1,
      tone: 'component',
    },
    {
      meshes: ['funnel'],
      label: 'Funnel',
      note: 'Channels the filtered air up into the fans.',
      offset: [0, 0.45, 0],
      step: 2,
      tone: 'panel',
    },
    {
      meshes: ['side_cover'],
      label: 'Side Cover',
      note: 'Removable side panel for reaching the filter.',
      offset: [0.95, 0, 0],
      step: 3,
      tone: 'panel',
    },
    {
      meshes: ['mock_filter'],
      label: 'Filter',
      note: 'Stand-in for the air filter — the intake and exhaust sensors measure the air on either side of it to calculate filtration efficiency.',
      offset: [0.62, 0, 0],
      step: 4,
      tone: 'accent',
    },
    {
      meshes: ['_zh03b_body', 'zh03b_fan'],
      label: 'ZH03B Sensor',
      note: 'Laser dust sensor with its built-in fan, read over UART once a second. PuriSense pairs two — intake and exhaust.',
      offset: [0.6, -0.55, -0.35],
      step: 5,
      tone: 'teal',
    },
    {
      meshes: ['base_cover'],
      label: 'Base Cover',
      note: 'Floor of the filter chamber, sealing off the electronics bay below.',
      offset: [0, 0, 0],
      step: -1,
      tone: 'matte',
    },
    {
      meshes: ['psu', 'psu_fan'],
      label: 'Power Supply',
      note: 'Powers the fans and electronics, with its own cooling fan.',
      offset: [-0.05, -0.6, -0.2],
      step: 6,
      tone: 'component',
    },
    {
      meshes: ['esp32', 'jst_pin1', 'jst_pin2', 'jst_pin3', 'jst_pin4', 'jst_pin5', 'jst_pin6', 'jst_pin7', 'jst_pin8'],
      label: 'ESP32',
      note: 'ESP32 WROOM-32 with JST connectors — runs the dual-core firmware: sensors, fans, display, and the live link to Firebase.',
      offset: [0.25, -0.75, 0.35],
      step: 6,
      tone: 'original',
    },
    {
      meshes: ['buck_converter'],
      label: 'Buck Converter',
      note: 'Steps the supply voltage down for the logic.',
      offset: [-0.2, -0.95, 0.35],
      step: 7,
      tone: 'original',
    },
    {
      meshes: ['oled_display', 'power_pushbutton', 'main_pushbutton', 'navigation_button1', 'navigation_button2'],
      label: 'Display & Buttons',
      note: '1.3" SH1106 OLED over I2C and four buttons — power, mode, and up / down — for full control on the device itself.',
      offset: [-0.38, -0.2, 0],
      step: 8,
      tone: 'original',
    },
    {
      meshes: ['inner_logo', 'outer_logo'],
      label: 'Logo Inlay',
      note: 'The PuriSense logo, inset into the front of the chassis.',
      offset: [-0.62, 0.3, 0],
      step: 8,
      tone: 'accent',
    },
  ],
};
