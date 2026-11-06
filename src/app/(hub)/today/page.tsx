import { HubChrome } from "@/components/HubChrome";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { TodaySchedule } from "@/components/TodaySchedule";
import {
  Page,
  RulesTeaser,
  TodayGrid,
  TodaySide,
  WeatherChip,
  WeatherMeta,
  WeatherTemp,
} from "@/components/layout";
import { formatDayHeading, toDateKey } from "@/lib/dates";
import { ensureDemoEvents, listEventsForToday } from "@/lib/events";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  ensurePeopleSeeded();
  ensureDemoEvents();

  const people = listPeople(true);
  const events = listEventsForToday();
  const dateKey = toDateKey(new Date());

  return (
    <Page>
      <HubChrome
        title="Today"
        subtitle={formatDayHeading(new Date())}
        trailing={
          <WeatherChip aria-label="Weather placeholder">
            <WeatherTemp>—°</WeatherTemp>
            <WeatherMeta>Weather soon</WeatherMeta>
          </WeatherChip>
        }
      />

      <TodayGrid>
        <TodaySchedule people={people} events={events} dateKey={dateKey} />
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
