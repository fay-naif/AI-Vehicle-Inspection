# Architecture

A small, framework-free web app. Everything runs in the browser: no server, no API keys, no build step needed to run it.

## Goals

- **Opens anywhere** – double-click `index.html`, serve it with any static server, or host it on GitHub Pages.
- **Installable** – a Progressive Web App that works offline and opens full screen from the home screen.
- **Bilingual** – Arabic (RTL) and English (LTR) from the same markup.
- **Readable** – one responsibility per file, short files, JSDoc on every public function.

## Folder structure

```
AI-Vehicle-Inspection/
├── index.html                 # all screens (markup only)
├── manifest.webmanifest       # app name, colours, icons (PWA)
├── service-worker.js          # offline cache
├── package.json               # npm scripts: test, build:locales, start
├── css/
│   ├── main.css               # entry point – imports everything in order
│   ├── variables.css          # design tokens (colours, radii, shadows)
│   ├── base.css               # fonts, resets, app-like defaults
│   ├── layout.css             # app shell, screens, transitions, top bars
│   ├── components/            # buttons, forms, cards, slide-to-start, overlay, toast…
│   ├── screens/               # one file per screen
│   ├── rtl.css                # Arabic / English direction tweaks
│   ├── device-frame.css       # phone frame on tablet / desktop
│   └── print.css              # printed report
├── js/
│   ├── app.js                 # entry point – wires everything together
│   ├── router.js              # screens + browser history (back button)
│   ├── i18n.js                # translations + RTL / LTR switching
│   ├── generated/locales.js   # built from locales/*.json
│   ├── utils/                 # dom, format, image helpers
│   ├── services/              # analysis, image metrics, auth, storage, pwa
│   ├── ui/                    # reusable widgets (slider, toast, overlay…)
│   └── screens/               # splash, login, about, upload, report
├── locales/
│   ├── ar.json                # Arabic strings
│   └── en.json                # English strings
├── assets/
│   ├── fonts/                 # IBM Plex Sans Arabic (OFL)
│   ├── icons/                 # SVG icons + app/ (PWA icons)
│   └── images/                # logo, hero art, sample photos, CREDITS.md
├── scripts/build-locales.mjs  # locales/*.json → js/generated/locales.js
├── tests/project.test.mjs     # project checks (npm test)
├── docs/ARCHITECTURE.md
├── screenshots/
├── README.md · README_AR.md · LICENSE · .editorconfig · .gitignore
```

## How the JavaScript is organised

The app uses plain `<script>` files (not ES modules) so it also works from `file://`, where browsers block module imports. Each file adds one module to a single global namespace, `window.VAI`, and the files are loaded in dependency order at the bottom of `index.html`:

| Layer | Modules | Depends on |
| --- | --- | --- |
| Data | `VAI.locales` (generated) | – |
| Utils | `VAI.dom`, `VAI.format`, `VAI.image` | – |
| Core | `VAI.i18n`, `VAI.router` | utils |
| Services | `VAI.storage`, `VAI.auth`, `VAI.imageMetrics`, `VAI.analysis`, `VAI.sampleResults`, `VAI.pwa` | utils |
| UI widgets | `VAI.toast`, `VAI.analysisOverlay`, `VAI.slideToStart`, `VAI.installButton`, `VAI.commonActions` | core, services |
| Screens | `VAI.screens.splash`, `.login`, `.about`, `.upload`, `.report` | everything above |
| Entry | `js/app.js` | everything |

Rules of thumb:

- **Services never touch the DOM.** `auth.js` validates and stores accounts; `screens/login.js` reads the form and shows errors.
- **Screens own their own markup.** Each screen module only queries elements inside its own `<section>`.
- **`app.js` is the only place that knows the whole flow** (which screen follows which, route guards).

## Screen flow and navigation

```
splash ──slide──▶ login ──sign in / guest──▶ about ──▶ upload ──analyse──▶ report
```

`router.js` keeps one history entry per screen (`#splash`, `#login`, …), so the browser or phone back button / gesture moves between screens. Route guards in `app.js` send signed-out users to `login` and open `upload` when a report is requested without a result. Going back plays the screen transition in reverse.

## Translations

Strings live in `locales/ar.json` and `locales/en.json`. Because `fetch()` of local JSON is blocked on `file://`, `npm run build:locales` bundles them into `js/generated/locales.js`, which the page loads like any other script. `npm test` fails if the bundle is out of date or a key is missing in either language.

Markup uses `data-i18n="key"` for text and `data-i18n-aria="key"` for accessible labels; switching language updates both and flips `dir` on `<html>`. Layout uses logical CSS properties (`inline-start`, `inset-inline-end`, …) so most components need no RTL overrides.

## The analysis

`services/image-metrics.js` draws the photo on a small `<canvas>` and measures sharpness, exposure, surface irregularity and paint consistency. `services/analysis.js` combines them into a score, a grade, notes and recommendations. Results are deterministic (seeded from the pixels). It is a visual estimate, not a trained model.

Browsers block reading pixels from local files on `file://`; for the bundled sample photos the app then uses the stored results in `services/sample-results.js`, which were produced by the same analyser.

## PWA

- `manifest.webmanifest` – name, colours, `standalone` display and icons (192, 512 and a maskable 512).
- `service-worker.js` – caches every app file on install and serves cache-first, refreshing in the background. Bump `CACHE_VERSION` when files change; `npm test` checks that every file is in the list.
- `services/pwa.js` – registers the worker (only over http/https) and keeps the browser's install prompt for the **Install app** button. On iPhone, where there is no prompt, the button explains *Share → Add to Home Screen*.
- iOS meta tags and `viewport-fit=cover` + `env(safe-area-inset-*)` padding make the installed app sit correctly under the notch and above the home indicator.

## Styling

`css/main.css` imports the other stylesheets in a fixed order: tokens → base → layout → components → screens → direction tweaks → device frame. Colours and sizes come from `variables.css`.

On screens wider than 500px (and only in a normal browser tab) `device-frame.css` draws a phone around the app – bezel, Dynamic Island, status bar, side buttons – using CSS only. On phones and in the installed app the frame is skipped.

## Checks

```bash
npm test               # translations, file references, offline list, manifest, file sizes
npm run build:locales  # after editing locales/*.json
```
