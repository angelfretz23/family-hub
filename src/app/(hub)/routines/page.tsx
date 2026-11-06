import { RoutinesBoard } from "@/components/RoutinesBoard";
import { toDateKey } from "@/lib/dates";
import { ensureJobsSeeded, jobStatsByPerson, listJobsForDay } from "@/lib/jobs";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import { ensureRoutinesSeeded, listRoutinesForToday } from "@/lib/routines";

export const dynamic = "force-dynamic";

export default function RoutinesPage() {
  ensurePeopleSeeded();
  ensureJobsSeeded();
  ensureRoutinesSeeded();

  const dateKey = toDateKey(new Date());
  const people = listPeople(true);
  const routines = listRoutinesForToday(dateKey).filter((routine) =>
    Boolean(routine.person),
  );
  const jobs = listJobsForDay(dateKey);
  const jobStats = jobStatsByPerson(dateKey);

  return (
    <RoutinesBoard
      people={people}
      routines={routines}
      jobs={jobs}
      jobStats={jobStats}
    />
  );
}
