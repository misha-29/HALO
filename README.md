# HALO: Health Assessment for Long-duration Operations

NASA Space Apps Challenge 2026: *Create Health Monitoring Software for Astronauts on Space Missions*.

HALO is a static website: plain HTML, CSS and JavaScript with no build step and no server code. It works on laptops and tablets (and phones), and keeps working offline after the first visit.

Demo passcode for every crew member: **1969**. Log in as **Marco Varga** (the CMO) to see the Crew tab.

## Deploy on Vercel

1. In Vercel, choose **Add New → Project** and import this GitHub repository.
2. Framework preset: **Other**. Leave the build command and output directory empty (the site is served from the repository root).
3. Deploy. Every push to `main` redeploys automatically.

`vercel.json` sets cache headers so updates to the app, `sw.js` and `knowledge.md` show up straight away.

## Run it locally

Serve the folder over http. Opening `index.html` by double-clicking it shows the app, but Health Buddy cannot read `knowledge.md` from a `file://` page.

With Node.js/npm and Python 3 installed, start the local server from the repository root:

```
npm run dev
```

Then open <http://localhost:8000>. Stop the server with `Ctrl+C`. This script uses Python's built-in HTTP server, so it does not install npm dependencies. Alternatively, run `npx serve .` or `python3 -m http.server 8000`.

| Needs http(s) | Why |
|---|---|
| Health Buddy knowledge base | Reads `knowledge.md` |
| Reading a device display (OCR) | Loads the offline OCR pack in `vendor/tesseract` in a web worker |
| Offline caching (`sw.js`) | Service workers only run over http(s) |
| Bluetooth heart rate strap | Web Bluetooth: Chrome or Edge on a computer or Android |
| Camera heart rate, photos | Camera access |

## Files

| Path | What it is |
|---|---|
| `index.html` | Page structure |
| `css/fonts.css` | Embedded fonts, so no font downloads are needed |
| `css/styles.css` | Layout and theme, with breakpoints for tablet (under 960px) and phone (under 640px) |
| `js/app.js` | The app: records, alerts, charts, games, Health Buddy |
| `knowledge.md` | Health Buddy's knowledge base (NASA spaceflight hazards and risks) |
| `sw.js` | Service worker for offline use |
| `vercel.json` | Vercel headers |
| `vendor/tesseract/` | Offline OCR engine and English data |

## Health Buddy and knowledge.md

Health Buddy does not use an AI model. It answers in this order:

1. **Urgent red flags** (chest pain, trouble breathing, collapse, self-harm and others) always get the on-board protocol and an *Alert the CMO* button.
2. **Commands and readings:** "log heart rate 72", "why is my sleep flagged?", "how am I today?".
3. **Questions about spaceflight hazards and risks** are answered from `knowledge.md`, for example "What is SANS?", "Tell me about space radiation", "How far is Mars?".
4. **Other symptoms** (headache, dizziness, nausea and others) get their on-board protocol.

`knowledge.md` summarises NASA's Human Research Program pages on the [five hazards of human spaceflight](https://www.nasa.gov/hrp/hazards/) and the [17 human health and performance risks](https://www.nasa.gov/hrp/risks/). Each `##` section is one topic:

```
## Topic title
Category: Risk (Physiology)
Keywords: words, or short phrases, that point a question here
The short answer.
NASA: what NASA says.
HALO: what to do on board with this app.
```

To change what Health Buddy knows, edit `knowledge.md` and push. The gear icon in Health Buddy can reload the file, list its topics, and run the triage self-test (54 phrases).

## What's inside

- **Data:** each reading is stored with a timestamp, its source (typed, wearable, Bluetooth, camera, photo, self-rating, HALO test) and who logged it. Records are in IndexedDB, encrypted with AES-GCM using a key derived from the passcode (PBKDF2). Each crew member's summary is also encrypted to the CMO's RSA key, so only the CMO can read the crew roster.
- **Personal baselines:** a reading inside the population range is still flagged Watch when it is unusual for that astronaut (2.5 spreads from their pre-flight baseline). A single high manual reading stays on Watch until a repeat confirms it, unless it is critical (for example temperature 39.5 °C or more, or oxygen under 88%).
- **Indicators:** heart rate, blood pressure, glucose, temperature, oxygen, sleep, mood, hydration, exercise, bone density, near vision with an Amsler grid (SANS), vigilance lapses (3 minute PVT-B), Samn-Perelli fatigue, body mass, food energy, cabin CO2 and radiation dose. Pain is logged on the body map, plus a medication log.
- **Mission awareness:** five environments. Each changes escalation (station and Moon: call the ground; Mars and transit: the CMO decides on board), ground reply times, exercise equipment and the bone-loss note. Also an EVA go/no-go card, a gravity change stand test, and a simulated communications blackout.
- **Alerts:** open, acknowledged (re-check due in 30 minutes or 4 hours), re-check due, escalated (an Urgent alert left open for 10 minutes goes to the CMO), cleared by the CMO, resolved. Every step is kept in the alert history.
- **Reports:** a compact JSON health report, sized for a slow link, queued until the link is up.
- **Health Buddy safety:** negated phrases ("no chest pain") are not treated as symptoms, and crisis phrases are always checked on the full text.
- **Demo:** Mission panel → *Replay the last 30 days* shows the patterns appear day by day.

Thresholds are prototype values, to be reviewed against NASA-STD-3001. Not for clinical use.

## Licences

Fonts: Host Grotesk and Atkinson Hyperlegible Mono (SIL Open Font License). OCR: Tesseract.js (Apache 2.0), English data from tessdata (Apache 2.0). Knowledge base content summarised from NASA Human Research Program public web pages.
