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
  const kids = listPeople(true).filter((person) => person.role === "child");
  const kidIds = new Set(kids.map((kid) => kid.id));

  const routines = listRoutinesForToday(dateKey).filter(
    (routine) => routine.person && kidIds.has(routine.personId),
  );
  const jobs = listJobsForDay(dateKey).filter(
    (job) => job.assigneeId && kidIds.has(job.assigneeId),
  );
  const jobStats = jobStatsByPerson(dateKey);

  return (
    <RoutinesBoard
      people={kids}
      routines={routines}
      jobs={jobs}
      jobStats={jobStats}
    />
  );
}
