# Comprehensive Gym Tracker PWA — Design

Date: 2026-07-18

## Why

The existing app (`app.py`) is a single-file Streamlit dashboard: functional for logging sets and viewing basic analytics on desktop, but not installable or comfortable as a mobile/iOS app, and missing several features expected of a "comprehensive" tracker (templates, PRs, rest timer, body measurements, goals, calendar view, custom exercises, export/import).

This is a full rewrite as a local-first, installable Progressive Web App (PWA), replacing the Streamlit app as the primary project. It is a personal, single-user tool — no accounts, no backend, no server.

## Tech stack

- **Vite + React + TypeScript** — client-only app, no server needed since there's no backend
- **Tailwind CSS** — mobile-first styling, respects iOS safe-area insets
- **Dexie.js** (IndexedDB wrapper) — all data persisted locally in the browser; works fully offline
- **vite-plugin-pwa** — web app manifest + service worker, so Safari's "Add to Home Screen" produces a standalone app icon/splash screen with no browser chrome
- **Recharts** — 1RM trend, weekly volume, bodyweight/measurement charts
- **React Router** — bottom tab-bar navigation
- **Zustand** — lightweight state for the active workout session and rest timer
- **date-fns** — date handling (streaks, calendar, weekly grouping)

## Repo layout

```
/legacy/                  # old Streamlit app, moved as-is: app.py, requirements.txt, data/, .streamlit/
/src/
  main.tsx, App.tsx
  db/                     # Dexie schema + queries
  features/
    workout/              # active session, set logging, rest timer
    templates/
    history/               # session list, calendar/streak view
    progress/              # 1RM trend, volume chart, muscle heatmap, PR board, bodyweight/measurement trends, goals
    settings/              # custom exercises, templates mgmt, goals mgmt, export/import, prefs
  components/              # shared UI: TabBar, Card, Modal, Timer, Toast
  data/exerciseDb.ts        # seed exercise library
  hooks/
  utils/                    # 1RM calc, PR detection, streak calc
public/                     # manifest icons
index.html
vite.config.ts
package.json
README.md                   # rewritten for the new app; keeps a pointer to legacy/README.md
```

## Navigation — 5 bottom tabs

1. **Today** — greeting, current streak, quick-start (blank session or from a saved template), recent PRs ticker
2. **Train** — active workout: timer, exercise picker (search + category browse), set logging form, auto rest timer overlay
3. **History** — session list grouped by date (expandable, per-set delete, same as current app), calendar view toggle showing trained days + streak
4. **Progress** — 1RM trend (per-exercise selector), weekly volume by muscle group, anatomical muscle heatmap (ported from current SVG, front/back), PR board, bodyweight/measurement trend charts, goal progress bars
5. **Settings** — manage custom exercises, manage templates, manage goals, export/import data, unit preference (kg/lb), default rest timer duration, reset-data option

## Data model (Dexie / IndexedDB tables)

- `exercises`: id, name, muscleGroup, category, isCustom
- `sessions`: id, name, date, startedAt, endedAt, notes
- `sets`: id, sessionId, exerciseId, weightKg, reps, rpe, order, createdAt
- `templates`: id, name, items: [{ exerciseId, targetSets, targetReps, targetWeightKg? }]
- `measurements`: id, date, type (bodyweight | waist | chest | arms | thighs | custom label), value, unit
- `goals`: id, type (exercise1RM | exerciseWeight | frequency | bodyweight), exerciseId?, targetValue, targetDate?, createdAt, achievedAt?
- `settings`: singleton row — weightUnit, restTimerDefaultSeconds

PRs are **not** stored — computed on the fly from `sets` per exercise (max weight-for-any-rep, best estimated 1RM via Epley, max reps at bodyweight for calisthenics), so they can't drift out of sync with edited/deleted sets. Logging a set that beats a prior best triggers a "New PR!" toast.

## Feature details

- **Templates**: name + list of planned exercises with target sets/reps; "Start from template" on the Today/Train screen pre-fills the set-logging flow (still logged as a normal session).
- **Rest timer**: auto-starts after each logged set during a live session (default from settings, e.g. 90s), ±15s adjust buttons, skip button, vibration (`navigator.vibrate`) + sound on completion. Runs via Zustand store so it persists across tab navigation within the session.
- **Body measurements**: separate log (date + type + value), bodyweight gets its own quick-entry on Today; trend charts live in Progress.
- **Goals**: target a 1RM, a raw lift weight, a bodyweight, or a training-frequency (sessions/week); progress bar computed from current data vs. target.
- **Calendar/streak**: month grid marking days with a completed session; current streak is defined as consecutive calendar days with at least one logged session, shown on Today.
- **Custom exercises**: user-added exercises stored in the `exercises` table with `isCustom: true`, shown alongside the seed library. Any exercise (seed or custom) can be deleted as long as no logged `set` references it; if sets reference it, deletion is blocked with a message telling the user why.
- **Export/import**: JSON export = full dump of all Dexie tables (complete backup/restore); CSV export = flat `sets` table in the same shape as the current `workouts.csv` for spreadsheet use. Import accepts the app's own JSON export format; CSV import is not required for v1 since the current `workouts.csv` is empty (header row only).
- **Exercise library**: expand from ~27 to roughly 70-90 exercises across Barbell/Dumbbell, Machines, Bodyweight/Calisthenics, Cables — each still mapped to one of the existing muscle groups (Chest, Back, Legs, Shoulders, Arms, Core).

## PWA / installability

- `manifest.json`: name, short_name, theme_color, background_color, icons (192px, 512px, maskable), `display: standalone`, `orientation: portrait`
- `apple-touch-icon` + `apple-mobile-web-app-capable`/`apple-mobile-web-app-status-bar-style` meta tags for correct iOS home-screen behavior
- Service worker (via `vite-plugin-pwa`, `registerType: autoUpdate`) caches the app shell; since all data is already local IndexedDB, the app works fully offline after first load

## Deployment

Vite production build (`dist/`) is static-hosting-ready. README documents deploying to Vercel or Netlify (either via CLI or drag-and-drop of `dist/`) and installing on iPhone via Safari → Share → Add to Home Screen. Actual deployment is done by the user when ready; this design only ensures the build is deployment-ready.

## Migration of existing project

- `app.py`, `requirements.txt`, `data/`, `.streamlit/` move into `legacy/` unchanged.
- `README.md` at repo root is rewritten to document the new app; keeps a short pointer to `legacy/README.md` for the old Python version.
- The existing `data/workouts.csv` contains only a header row (no real data), so no data migration/import step is needed.

## Out of scope (v1)

- Multi-user accounts / cloud sync / authentication
- Native Swift/SwiftUI app
- CSV import of historical data (not needed — no existing data to migrate)
- Push notifications (rest timer uses in-app vibration/sound only, not OS-level notifications, since that requires a backend or the Notifications API with user permission — can be a future addition)
