# Family Hub

Wall-kiosk family organizer for a Raspberry Pi + touchscreen.

## Stack

- Next.js (React, App Router)
- Drizzle ORM + SQLite (`better-sqlite3`)
- styled-components

## Tabs

Today · Calendar · Routines

Family Rules open from the coat-of-arms button beside the Today title (placeholder art in `public/coat-of-arms.svg`).

Member cards appear on Today (with job counts), Calendar (event filter), and Routines (routine/job filter). Jobs live under the Routines tab as an all-day section.

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — redirects to `/today`.

SQLite file: `data/family-hub.db` (created on first DB import).

```bash
npm run db:generate   # drizzle migrations from schema
npm run db:studio     # browse local DB
```

## Config

Edit `family-hub.config.json`:

```json
{
  "weekStartsOn": "sunday",
  "timeZone": "America/Chicago",
  "latitude": 33.16262,
  "longitude": -96.93751,
  "locationLabel": "Little Elm",
  "postalCode": "75068"
}
```

- `weekStartsOn`: `"sunday"` or `"monday"` — Week and Month calendars
- `timeZone`: IANA zone for the Knights greeting, live clock, and household “now”
- `latitude` / `longitude` / `locationLabel` / `postalCode`: Open-Meteo weather on the Today header

Restart the dev server after changing this file.

## Working now

- People seed + `/people` manage screen (linked from Calendar)
- Calendar **List**, **Day**, vertical **Week**, and **Month** views
- Today schedule wired to real events
- REST APIs: `/api/people`, `/api/events`

## Notes

- Kiosk-first UI: large touch targets, readable type
- Today header shows a live clock + Open-Meteo weather (`/api/weather`)
- SQLite file: `data/family-hub.db`
