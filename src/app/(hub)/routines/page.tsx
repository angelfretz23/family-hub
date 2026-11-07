import { RoutinesBoard } from "@/components/RoutinesBoard";
import { toDateKey } from "@/lib/dates";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import { ensureTasksSeeded, jobStatsFromTasks, listTasksForKids } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default function RoutinesPage() {
  ensurePeopleSeeded();
  ensureTasksSeeded();

  const dateKey = toDateKey(new Date());
  const kids = listPeople(true).filter((person) => person.role === "child");
  const tasks = listTasksForKids(dateKey);
  const jobStats = jobStatsFromTasks(dateKey);

  return <RoutinesBoard people={kids} tasks={tasks} jobStats={jobStats} />;
}
