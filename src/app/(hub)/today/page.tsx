import { PersonCards } from "@/components/PersonCards";
import { PlaceholderPanel } from "@/components/PlaceholderPanel";
import { TodayHeader } from "@/components/TodayHeader";
import { TodaySchedule } from "@/components/TodaySchedule";
import { Page, TodayGrid, TodaySide } from "@/components/layout";
import { formatDayHeading, toDateKey } from "@/lib/dates";
import {
  ensureDemoEvents,
  ensureThreeDayAllDayDemo,
  listEventsForToday,
} from "@/lib/events";
import { ensureJobsSeeded, jobStatsByPerson } from "@/lib/jobs";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import { ensureRoutinesSeeded } from "@/lib/routines";
import { listRules } from "@/lib/rules";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  ensurePeopleSeeded();
  ensureDemoEvents();
  ensureThreeDayAllDayDemo();
  ensureJobsSeeded();
  ensureRoutinesSeeded();

  const people = listPeople(true);
  const kids = people.filter((person) => person.role === "child");
  const events = listEventsForToday();
  const rules = listRules(true);
  const dateKey = toDateKey(new Date());
  const jobStats = jobStatsByPerson(dateKey);

  return (
    <Page>
      <TodayHeader dateLabel={formatDayHeading(new Date())} rules={rules} />

      <PersonCards
        people={kids}
        showJobStats
        jobStats={jobStats}
        variant="portrait"
      />

      <TodayGrid>
        <TodaySchedule people={people} events={events} dateKey={dateKey} />
        <TodaySide>
          <PlaceholderPanel
            heading="Routines"
            body="Open the Routines tab for morning, afternoon, evening, and jobs."
          />
          <PlaceholderPanel
            heading="Jobs due"
            body="Job counts are on each family card above. Full list is under Routines."
          />
        </TodaySide>
      </TodayGrid>
    </Page>
  );
}
