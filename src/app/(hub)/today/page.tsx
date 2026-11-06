import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { TodayHeader } from "@/components/TodayHeader";
import { TodaySchedule } from "@/components/TodaySchedule";
import { Page, TodayGrid, TodaySide } from "@/components/layout";
import { formatDayHeading, toDateKey } from "@/lib/dates";
import { ensureDemoEvents, listEventsForToday } from "@/lib/events";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import { listRules } from "@/lib/rules";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  ensurePeopleSeeded();
  ensureDemoEvents();

  const people = listPeople(true);
  const events = listEventsForToday();
  const rules = listRules(true);
  const dateKey = toDateKey(new Date());

  return (
    <Page>
      <TodayHeader dateLabel={formatDayHeading(new Date())} rules={rules} />

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
    </Page>
  );
}
