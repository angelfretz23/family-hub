# Family Hub

Wall-kiosk family organizer for a Raspberry Pi + touchscreen.

## Stack

- Next.js (React, App Router)
- Drizzle ORM + SQLite (`better-sqlite3`)
- Tailwind CSS

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

## Notes

- Kiosk-first UI: large touch targets, readable type
- Weather on Today header is a placeholder for Open-Meteo
- Feature screens beyond navigation are stubs for the next build slices
