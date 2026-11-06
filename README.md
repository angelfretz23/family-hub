# Family Hub

Wall-kiosk family organizer for a Raspberry Pi + touchscreen.

## Stack

- Next.js (React, App Router)
- Drizzle ORM + SQLite (`better-sqlite3`)
- styled-components

## Tabs

Today · Calendar · Jobs · Routines · Rules

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

## Working now

- People seed + `/people` manage screen (linked from Calendar)
- Calendar **List** and **Day** views with add/edit/delete event sheet
- Today schedule wired to real events
- REST APIs: `/api/people`, `/api/events`

## Notes

- Kiosk-first UI: large touch targets, readable type
- Weather on Today header is a placeholder for Open-Meteo
- Week/Month calendar, Jobs, Routines, Rules content still stubs
- SQLite file: `data/family-hub.db`
