import { PersonCards } from "@/components/PersonCards";
import { TodayCompletions } from "@/components/TodayCompletions";
import { TodayHeader } from "@/components/TodayHeader";
import { TodaySchedule } from "@/components/TodaySchedule";
import { Page, TodayGrid, TodaySide } from "@/components/layout";
import { formatDayHeading, toDateKey } from "@/lib/dates";
import {
  ensureDemoEvents,
  ensureThreeDayAllDayDemo,
  listEventsForToday,
} from "@/lib/events";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import { listRules } from "@/lib/rules";
import {
  ensureTasksSeeded,
  jobStatsFromTasks,
  listCompletedToday,
  starStatsByPerson,
} from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default function TodayPage() {
  ensurePeopleSeeded();
  ensureDemoEvents();
  ensureThreeDayAllDayDemo();
  ensureTasksSeeded();

  const people = listPeople(true);
  const kids = people.filter((person) => person.role === "child");
  const events = listEventsForToday();
  const rules = listRules(true);
  const dateKey = toDateKey(new Date());
  const jobStats = jobStatsFromTasks(dateKey);
  const starStats = starStatsByPerson(dateKey);
  const completed = listCompletedToday(dateKey);

  return (
    <Page>
      <TodayHeader dateLabel={formatDayHeading(new Date())} rules={rules} />

      <PersonCards
        people={kids}
        showJobStats
        showStarStats
        jobStats={jobStats}
        starStats={starStats}
        variant="portrait"
      />

      <TodayGrid>
        <TodaySchedule people={people} events={events} dateKey={dateKey} />
        <TodaySide>
          <TodayCompletions
            heading="Routines done"
            items={completed.routines}
          />
          <TodayCompletions heading="Jobs done" items={completed.jobs} />
        </TodaySide>
      </TodayGrid>
    </Page>
  );
}
