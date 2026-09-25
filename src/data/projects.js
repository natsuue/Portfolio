// Projects shown in the Projects section and their case studies.
// Filters are generated from each project's `category` array; labels come from `categories`.
// Links with `href: null` are hidden. Gallery items without `src` render as labelled placeholders.
//
// NOTE: PuriSense is written from the thesis code and docs. CognitiveAI was drafted from the
// resume only — review it, especially "Challenges" and "Solution".

export const categories = {
  hardware: 'Hardware',
  mobile: 'Mobile',
  web: 'Web',
  AI: 'AI',
};

export const projects = [
  {
    slug: 'cognitiveai',
    title: 'CognitiveAI',
    subtitle: 'Web-Based Cognitive Performance Prediction System',
    category: ['web'],
    period: 'Feb 2026 – May 2026',
    status: 'Completed',
    description:
      'A full-stack clinical web application that predicts human cognitive performance using a pre-trained Gradient Boosting Regressor (R² = 0.8996), with role-based portals for Admin, Practitioner, and Patient.',
    technologies: ['PHP', 'Python', 'Microsoft SQL Server', 'scikit-learn', 'Gradient Boosting Regressor'],
    highlights: [
      'Three-portal role-based access (Admin, Practitioner, Patient) with appointment scheduling, subscription/payment management, and PDF report generation',
      'ML pipeline preprocessing 10 lifestyle parameters (sleep, stress, caffeine intake, etc.) returning real-time cognitive scores',
      'Clinical dashboard with feature-importance visualization',
    ],
    image: '/images/cognitiveai.svg',
    imageAlt:
      'Illustration of the CognitiveAI dashboard: a model-accuracy card, feature-importance bars, and the three role portals.',
    featured: true,
    links: [
      { label: 'Source code', href: null },
      { label: 'Live demo', href: null },
    ],
    caseStudy: {
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          body: [
            'CognitiveAI is a full-stack clinical web application that predicts a person’s cognitive performance from everyday lifestyle data. A pre-trained Gradient Boosting Regressor (R² = 0.8996) sits behind a PHP application with separate portals for administrators, practitioners, and patients.',
          ],
        },
        {
          id: 'problem',
          title: 'Problem & motivation',
          body: [
            'Lifestyle factors like sleep, stress, and caffeine intake shape how well people think, but in a typical clinic they are captured loosely, if at all. A model that turns those inputs into a score is only useful if it lives inside the workflow clinicians already have: appointments, patient records, billing, and reports.',
            'The goal was to build both halves — a model that produces a usable score in real time, and a platform around it that each type of user can actually operate.',
          ],
        },
        {
          id: 'concept',
          title: 'Concept',
          body: [
            'One system, three perspectives. Admins, practitioners, and patients each get a portal scoped to their role, all backed by the same data.',
            'Prediction is a first-class feature rather than a separate tool: entering ten lifestyle parameters returns a cognitive score immediately, alongside the factors that drove it.',
          ],
        },
        {
          id: 'design',
          title: 'Design process',
          body: [
            'The work started from roles rather than pages — listing what each user needs to do and see, then deriving the portals, permissions, and flows from that. The main feature areas:',
          ],
          list: [
            'Role-based access for Admin, Practitioner, and Patient',
            'Appointment scheduling',
            'Subscription and payment management',
            'Real-time cognitive score prediction',
            'PDF report generation and a clinical dashboard',
          ],
        },
        {
          id: 'stack',
          title: 'Technologies used',
          body: [
            'PHP runs the application layer and the three portals. Microsoft SQL Server stores the platform’s data. Python with scikit-learn serves the pre-trained Gradient Boosting Regressor.',
          ],
          tags: ['PHP', 'Python', 'Microsoft SQL Server', 'scikit-learn', 'Gradient Boosting Regressor'],
        },
        {
          id: 'implementation',
          title: 'Implementation',
          body: [
            'Each prediction takes ten lifestyle parameters — sleep, stress, caffeine intake, and others — and runs them through the same preprocessing the model was trained with before they reach the Gradient Boosting Regressor. The score comes back in real time.',
            'On the clinical dashboard, a feature-importance visualization shows which inputs carry the most weight, so a practitioner sees why a score looks the way it does, not just the number. Results can then leave the platform as generated PDF reports.',
          ],
          figure: {
            caption: 'Fig. — CognitiveAI, simplified request path',
            nodes: [
              { tag: 'Client', label: 'Role-based portals', detail: 'Admin · Practitioner · Patient' },
              { tag: 'App', label: 'PHP application', detail: 'auth · scheduling · subscriptions · PDF' },
              { tag: 'Model', label: 'Python ML layer', detail: 'preprocessing · gradient boosting' },
              { tag: 'Data', label: 'Microsoft SQL Server', detail: 'platform data' },
            ],
          },
        },
        {
          id: 'challenges',
          title: 'Challenges',
          body: ['Problems the design had to answer:'],
          list: [
            'Bridging two runtimes — a PHP web application and a Python model — so predictions still feel instant',
            'Keeping preprocessing identical between training and live predictions',
            'Enforcing three separate access levels over one shared database',
            'Making a model’s output explainable to a clinical, non-technical user',
          ],
        },
        {
          id: 'solution',
          title: 'Solution',
          body: [
            'Keep the model behind a single preprocessing path, so every prediction sees the same features the model was trained on; scope every page and query to the signed-in role; and put explanation next to the number — the feature-importance view makes each score readable.',
          ],
        },
        {
          id: 'result',
          title: 'Final result',
          body: [
            'A working three-portal clinical platform with real-time cognitive-performance predictions, appointment scheduling, subscription and payment management, PDF reporting, and a dashboard that explains its own predictions.',
          ],
          stats: [
            { label: 'Model R²', value: '0.8996' },
            { label: 'Role portals', value: '3' },
            { label: 'Lifestyle inputs', value: '10' },
          ],
        },
      ],
      gallery: [
        { caption: 'Practitioner clinical dashboard' },
        { caption: 'Prediction form — 10 lifestyle parameters' },
        { caption: 'Feature-importance visualization' },
        { caption: 'Generated PDF report' },
      ],
    },
  },
  {
    slug: 'purisense',
    title: 'PuriSense',
    subtitle: 'Smart Air Purifier IoT System',
    category: ['hardware', 'mobile', 'web'],
    period: 'Jan 2026 – May 2026',
    status: 'Team thesis · Completed',
    role: 'ESP32 firmware, Flutter app, Firebase backend, and hardware build',
    description:
      'A smart air purifier that measures its own performance: two laser dust sensors compare the air going in with the air coming out, an ESP32 drives four fans from the readings, and a Flutter app follows it all live through Firebase.',
    technologies: [
      'ESP32',
      'C++ / Arduino',
      'FreeRTOS',
      'UART',
      'I2C',
      'Firebase Realtime Database',
      'Cloud Functions',
      'Firestore',
      'Firebase Auth',
      'FCM',
      'Flutter',
      'MQTT (HiveMQ)',
    ],
    highlights: [
      'Dual ZH03B laser sensors on intake and exhaust, calculating filtration efficiency live',
      'Dual-core FreeRTOS firmware: sensors, fans, and display on one core, networking on the other',
      'Live data to Firebase every second over a persistent TLS connection; commands back over SSE',
      'Cloud Function recording minute-by-minute history to Firestore, 24/7',
      'Flutter app with shared devices, role-based access, reports, and push alerts',
    ],
    image: '/images/purisense.svg',
    imageAlt:
      'Illustration of PuriSense: an air purifier unit linked through Firebase to a phone showing a live air-quality dashboard.',
    featured: true,
    links: [
      { label: 'Source code', href: null },
      { label: 'Demo video', href: null },
    ],
    caseStudy: {
      sections: [
        {
          id: 'overview',
          title: 'Overview',
          body: [
            'PuriSense is a smart air purifier built as a team thesis project and developed as a complete IoT system: C++ firmware on an ESP32, a Firebase backend, and a cross-platform Flutter app. My work covered all four layers — the firmware, the app, the Firebase backend, and the physical build.',
            'What sets it apart is that it measures its own effectiveness. One laser dust sensor reads the air entering the purifier, a second reads the air leaving it, and the difference becomes a live filtration-efficiency figure that drives warnings on the device and in the app.',
          ],
        },
        {
          id: 'problem',
          title: 'Problem & motivation',
          body: [
            'Most air purifiers are a black box. They report little about the air around them and nothing about whether their own filter is still working — a clogged filter just quietly stops helping.',
            'PuriSense set out to answer three questions continuously: how clean is the room, how well is the purifier actually filtering right now, and how long will it take to clean this particular room — visible on the device itself and from a phone anywhere.',
          ],
        },
        {
          id: 'concept',
          title: 'Concept',
          body: [
            'Measure both sides of the filter. Two ZH03B laser sensors are queried at the same moment — one at the intake, one at the exhaust — so every efficiency reading compares time-aligned samples.',
            'Keep real-time control on the device, and let the cloud handle everything that must outlive a single session. The ESP32 runs the fans and modes on its own; Firebase Realtime Database carries live data and commands; Firestore keeps the history; the Flutter app turns it into something a person can read and control.',
          ],
        },
        {
          id: 'design',
          title: 'Design process',
          body: [
            'The system was mapped out before and during the build — process flowcharts for the firmware and the app, a data-flow diagram, a schematic, a system architecture, and a combined database design covering both Realtime Database and Firestore. The hardware came together around a clear split of responsibilities:',
          ],
          list: [
            'Sensing — 2× ZH03B laser dust sensors over UART (intake and exhaust)',
            'Actuation — 4× PWM fans at 25 kHz, inaudible for most fans',
            'Local interface — 1.3" SH1106 OLED over I2C and four physical buttons',
            'Setup — WiFiManager captive portal ("PuriSense-Config"); no credentials hardcoded',
            'Modes — Auto, Manual, Timer, and Sleep, on the device and from the app',
          ],
          link: { label: 'Take the prototype apart in 3D', href: '#inside' },
        },
        {
          id: 'stack',
          title: 'Technologies used',
          body: [
            'Firmware in C++ (Arduino core) on an ESP32 WROOM-32 using FreeRTOS, U8g2, WiFiManager, and ArduinoJson. Firebase Realtime Database as the live bridge, a Node.js Cloud Function for history, Firestore for permanent storage, Firebase Auth for accounts, and FCM for push notifications. The app is Flutter with Provider for state and fl_chart for reports. HiveMQ MQTT served as a developer debug feed.',
          ],
          tags: [
            'ESP32 WROOM-32',
            'C++ / Arduino',
            'FreeRTOS',
            'ZH03B (UART)',
            'SH1106 OLED (I2C)',
            'Firebase Realtime Database',
            'Cloud Functions (Node.js)',
            'Firestore',
            'Firebase Auth',
            'FCM',
            'Flutter',
            'Provider',
            'fl_chart',
            'HiveMQ MQTT',
          ],
        },
        {
          id: 'implementation',
          title: 'Implementation',
          body: [
            'The firmware splits work across the ESP32’s two cores. Core 1 runs the main loop: it polls both sensors once a second, applies calibration, controls the fans, reads the buttons, and redraws the OLED every 250 ms. Core 0 runs a dedicated Firebase task that writes telemetry, status, and warnings to Realtime Database every second in a single HTTPS PATCH, and holds a Server-Sent Events stream open to receive commands from the app.',
            'In Auto mode, fan speed follows the PM2.5 air-quality level — 25% when Good, 50% Moderate, 75% Polluted, and 100% Very Polluted. Speed changes ramp gradually instead of jumping, and filtration efficiency is calculated as (input − output) ÷ input.',
            'In the cloud, a Cloud Function triggers on every telemetry write and saves a snapshot to Firestore at most once a minute, so history keeps building even when no phone is open. The Flutter app streams live data from Realtime Database, reads history from Firestore for its day, week, and month reports, and sends commands the device picks up within about a second.',
            'The app supports email and Google sign-in (merging accounts that share an email), shared devices with Owner, Admin, and Member roles and join requests, and four kinds of push notification: air quality worsened, an hourly reminder while air isn’t Good, check filter, and output unhealthy.',
          ],
          figure: {
            caption: 'Fig. — PuriSense system architecture',
            nodes: [
              { tag: 'Sense', label: '2× ZH03B laser sensors', detail: 'UART · intake + exhaust · 1 Hz' },
              { tag: 'Edge', label: 'ESP32 firmware', detail: 'FreeRTOS dual-core · PWM fans · 4 modes' },
              { tag: 'Live', label: 'Firebase Realtime Database', detail: 'HTTPS PATCH every 1 s · SSE commands' },
              { tag: 'History', label: 'Cloud Function → Firestore', detail: '1 snapshot / minute, 24/7' },
              { tag: 'App', label: 'Flutter app', detail: 'live dashboard · controls · reports · alerts' },
            ],
          },
        },
        {
          id: 'challenges',
          title: 'Challenges & solutions',
          body: ['Real problems the build ran into, and how each one was solved:'],
          pairs: [
            {
              title: 'Fans that wouldn’t start',
              problem:
                'At low speeds, the four fans didn’t always start from a standstill — one motor needed more power than the others to overcome static friction.',
              solution:
                'A 300 ms full-power kickstart pulse whenever the fans start from zero, then a smooth ramp down to the target speed. Displayed speed is also scaled by 0.8× to keep motors out of their stress range at the low end.',
            },
            {
              title: 'Noisy sensor readings',
              problem:
                'Raw PM readings spiked from sample to sample, which would make Auto mode jump between fan speeds, and the cheap sensors read low against a reference monitor.',
              solution:
                'A 5-sample rolling average on the intake reading, checksum validation on every 9-byte sensor frame, and correction factors from a single-point calibration against a reference monitor (PM2.5 ×2.20, PM10 ×2.80).',
            },
            {
              title: 'Two cores, one display',
              problem:
                'Network commands arrive on Core 0, but the OLED library isn’t safe to call from that core — a remote power command couldn’t update the screen directly.',
              solution:
                'Core 0 only sets a flag; Core 1 picks it up on its next pass and runs the power-on or power-off sequence itself.',
            },
            {
              title: 'Slow updates to Firebase',
              problem: 'Opening a new TLS connection for every update added roughly 300 ms of handshake to each write.',
              solution:
                'A persistent TLS connection that is reused between writes and re-established automatically if it drops, bringing the effective round trip down to about 50–100 ms.',
            },
            {
              title: 'Nonsense values in history',
              problem:
                'While the fans were still spinning up, estimated cleaning time came out absurd (1,575 minutes in one case), and those readings would pollute the reports.',
              solution:
                'The Cloud Function skips snapshots while fan output is below 5% or PM2.5 hasn’t started reading, and throttles saves to one per minute.',
            },
            {
              title: 'Cleaning time for the wrong room',
              problem: 'The firmware estimates cleaning time assuming a fixed 30 m³ room.',
              solution:
                'The app recalculates air changes per hour and cleaning time from the user’s own room dimensions stored in Firestore, and uses the corrected figure on the dashboard and in notifications.',
            },
          ],
        },
        {
          id: 'result',
          title: 'Final result',
          body: [
            'A working air purifier that reports on its own performance: live PM2.5 readings on both sides of the filter, a filtration-efficiency figure that warns when the filter needs checking (below 70%) or the cleaned air is still unhealthy, four operating modes, and a Flutter app that mirrors and controls it in real time — with shared access, history reports, and push notifications.',
          ],
          stats: [
            { label: 'Live update interval', value: '1 s' },
            { label: 'Update round trip', value: '~50–100 ms' },
            { label: 'Fans / modes', value: '4 / 4' },
            { label: 'History', value: '1 / min, 24/7' },
          ],
        },
      ],
      gallery: [
        { src: '/images/purisense-exploded.webp', caption: 'Exploded view — enclosure, fans, sensor, and electronics (Fusion model)' },
        { caption: 'Physical prototype' },
        { caption: 'Wiring — ESP32, 2× ZH03B, OLED, 4 fans' },
        { caption: 'Flutter app — live dashboard' },
        { caption: 'Flutter app — reports' },
      ],
    },
  },
];
