# Gym Tracker

A comprehensive, local-first workout tracker built as an installable Progressive Web App. Live workout logging with a rest timer, workout templates, personal-record tracking, body measurements, goals, a training calendar/streak view, a custom exercise library, and an anatomical muscle-volume heatmap — all stored on-device (IndexedDB), no account or backend required.

![React](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Vite](https://img.shields.io/badge/Vite-5-purple)
![License](https://img.shields.io/badge/License-MIT-green)

## Features

- **Live workout mode** — start a session, track it with a real-time timer, log sets as you go, with an auto-starting rest timer between sets
- **Workout templates** — save a routine and start it with one tap
- **Personal records** — PRs computed live from your logged sets, with a "New PR!" toast and a dedicated PR board
- **History** — sessions grouped by day with per-set delete, plus a calendar view showing your current training streak
- **Progress analytics** — estimated 1RM trend (Epley formula), weekly training volume by muscle group, an anatomical front/back muscle heatmap, bodyweight/measurement trend charts
- **Body measurements & goals** — track bodyweight and custom measurements over time; set and track goals against a lift, a 1RM, a bodyweight, or a weekly training frequency
- **Custom exercises** — extend the ~85-exercise built-in library with your own
- **Export/import** — full JSON backup/restore, plus CSV export of raw sets
- **Installable on iOS** — Add to Home Screen from Safari for a standalone, offline-capable app

## Tech stack

- **Framework:** React + TypeScript + Vite
- **Styling:** Tailwind CSS
- **Storage:** Dexie.js over IndexedDB (fully local, offline-first)
- **Charts:** Recharts
- **State:** Zustand (active session/timer), React Router (navigation)
- **PWA:** vite-plugin-pwa (installable manifest + service worker)

## Quick start

```bash
npm install
npm run dev
```

Open the printed local URL in a desktop browser to develop, or on your phone's browser (same network / deployed URL) to test the mobile layout.

## Running tests

```bash
npm run test
```

## Deploying and installing on iPhone

1. Deploy the `dist/` build to Vercel or Netlify (or any static host):
   ```bash
   npm run build
   npx vercel --prod        # or drag-and-drop the dist/ folder into Netlify
   ```
2. On your iPhone, open the deployed URL in **Safari** (must be Safari, not Chrome, for iOS PWA install).
3. Tap the **Share** icon → **Add to Home Screen**.
4. The app now launches full-screen from your home screen, works offline, and stores all your data locally on the device.

> Data lives only in that browser/app's IndexedDB — use Settings → Data → Export to back it up periodically.

## Project structure

```
gym-tracker-pwa/
├── src/
│   ├── db/            # Dexie schema, types, query layer
│   ├── data/           # seed exercise library
│   ├── store/           # Zustand active-workout store
│   ├── features/         # workout, history, progress, templates, measurements, goals, settings, today
│   ├── components/       # shared UI (TabBar, Card, Toast, Layout)
│   └── pages/             # route-level page components
├── public/                 # PWA icons, favicon
├── legacy/                 # original Streamlit/Python version (superseded, kept for reference)
└── docs/superpowers/        # design spec and implementation plan for this rewrite
```

## Legacy version

The original Streamlit/Python dashboard this project replaced lives in [`legacy/`](legacy/README.md).

## Author

Built by Zuhair — www.linkedin.com/in/zuhair-zulkifli
