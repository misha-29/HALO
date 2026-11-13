# HALO: Health Assessment for Long-duration Operations

NASA Space Apps Challenge 2026: *Create Health Monitoring Software for Astronauts on Space Missions*.

## Run it

`index.html` works on its own: double-click it. Fonts are embedded, so it needs no network.

Some features need the folder served over http (or https), because browsers only allow them there:

```
cd halo
python3 -m http.server 8000
# open http://localhost:8000
```

| Needs http | Why |
|---|---|
| Reading a device display (OCR) | Loads the offline OCR pack in `vendor/tesseract` in a web worker |
| Offline caching (`sw.js`) | Service workers only run over http(s) |
| Bluetooth heart rate strap | Web Bluetooth: Chrome or Edge on a computer or Android |
| Camera heart rate, photos | Camera access |

Demo passcode for every crew member: **1969**. Log in as **Marco Varga** (the CMO) to see the Crew tab.

## Health Buddy AI (optional)

Health Buddy works fully offline with its protocol library. To add an AI model, open Health Buddy, then the gear icon:

- **On-board AI model (Ollama):** `ollama run qwen2.5:7b-instruct`. No data leaves the ship.
- **HALO proxy:** `ANTHROPIC_API_KEY=... node proxy.mjs`. The key stays on the server, never on crew devices. Recommended for missions.
- **Anthropic API, key on this device:** for quick demos only.

Urgent red-flag protocols always come from the on-board library, whatever the AI says. The AI can raise a level but never lower it.

## What's inside

- **Data:** each reading is stored with a timestamp, its source (typed, wearable, Bluetooth, camera, photo, self-rating, HALO test) and who logged it. Records are in IndexedDB, encrypted with AES-GCM using a key derived from the passcode (PBKDF2). Each crew member's summary is also encrypted to the CMO's RSA key, so only the CMO can read the crew roster.
- **Personal baselines:** a reading inside the population range is still flagged Watch when it is unusual for that astronaut (2.5 spreads from their pre-flight baseline). A single high manual reading stays on Watch until a repeat confirms it, unless it is critical (for example temperature 39.5 °C or more, or oxygen under 88%).
- **Indicators:** heart rate, blood pressure, glucose, temperature, oxygen, sleep, mood, hydration, exercise, bone density, near vision with an Amsler grid (SANS), vigilance lapses (3 minute PVT-B), Samn-Perelli fatigue, body mass, food energy, cabin CO2 and radiation dose. Pain is logged on the body map, plus a medication log.
- **Mission awareness:** five environments. Each changes escalation (station and Moon: call the ground; Mars and transit: the CMO decides on board), ground reply times, exercise equipment and the bone-loss note. Also an EVA go/no-go card, a gravity change stand test, and a simulated communications blackout.
- **Alerts:** open, acknowledged (re-check due in 30 minutes or 4 hours), re-check due, escalated (an Urgent alert left open for 10 minutes goes to the CMO), cleared by the CMO, resolved. Every step is kept in the alert history.
- **Reports:** a compact JSON health report, sized for a slow link, queued until the link is up.
- **Health Buddy safety:** negated phrases ("no chest pain") are not treated as symptoms, crisis phrases are always checked on the full text, and a built-in triage self-test runs 54 phrases (gear icon, *Run triage self-test*). Disagreements between the AI and the library are logged.
- **Demo:** Mission panel → *Replay the last 30 days* shows the patterns appear day by day.

Thresholds are prototype values, to be reviewed against NASA-STD-3001. Not for clinical use.

## Licences

Fonts: Host Grotesk and Atkinson Hyperlegible Mono (SIL Open Font License). OCR: Tesseract.js (Apache 2.0), English data from tessdata (Apache 2.0).
