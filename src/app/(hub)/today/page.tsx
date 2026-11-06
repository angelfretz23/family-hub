import Link from "next/link";
import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { db } from "@/db";
import { people } from "@/db/schema";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  // Touch SQLite so the local DB file and tables exist on first load.
  db.select().from(people).all();

  const todayLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="page">
      <HubChrome
        title="Today"
        subtitle={todayLabel}
        trailing={
          <div className="weather-chip" aria-label="Weather placeholder">
            <span className="weather-temp">—°</span>
            <span className="weather-meta">Weather soon</span>
          </div>
        }
      />

      <div className="today-grid">
        <PlaceholderPanel
          heading="Schedule"
          body="Today’s events will list here — all-day first, then timed."
        />
        <div className="today-side">
          <PlaceholderPanel
            heading="Routines"
            body="Active routines and progress (e.g. 3/5) will show here."
          />
          <PlaceholderPanel
            heading="Jobs due"
            body="Open jobs due today or overdue will show here."
          />
        </div>
      </div>

      <Link href="/rules" className="rules-teaser">
        Family Rules · Tap for the full board
      </Link>
    </div>
  );
}
