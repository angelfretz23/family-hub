import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import {
  Page,
  RulesTeaser,
  TodayGrid,
  TodaySide,
  WeatherChip,
  WeatherMeta,
  WeatherTemp,
} from "@/components/layout";
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
    <Page>
      <HubChrome
        title="Today"
        subtitle={todayLabel}
        trailing={
          <WeatherChip aria-label="Weather placeholder">
            <WeatherTemp>—°</WeatherTemp>
            <WeatherMeta>Weather soon</WeatherMeta>
          </WeatherChip>
        }
      />

      <TodayGrid>
        <PlaceholderPanel
          heading="Schedule"
          body="Today’s events will list here — all-day first, then timed."
        />
        <TodaySide>
          <PlaceholderPanel
            heading="Routines"
            body="Active routines and progress (e.g. 3/5) will show here."
          />
          <PlaceholderPanel
            heading="Jobs due"
            body="Open jobs due today or overdue will show here."
          />
        </TodaySide>
      </TodayGrid>

      <RulesTeaser href="/rules">
        Family Rules · Tap for the full board
      </RulesTeaser>
    </Page>
  );
}
