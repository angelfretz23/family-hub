import { RoutinesBoard } from "@/components/RoutinesBoard";
import { toDateKey } from "@/lib/dates";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";
import {
  ensureTasksSeeded,
  listTasksForPerson,
  starStatsByPerson,
} from "@/lib/tasks";

export const dynamic = "force-dynamic";

export default function RoutinesPage() {
  ensurePeopleSeeded();
  ensureTasksSeeded();

  const dateKey = toDateKey(new Date());
  const kids = listPeople(true).filter((person) => person.role === "child");
  const tasksByPerson: Record<number, ReturnType<typeof listTasksForPerson>> =
    {};
  for (const kid of kids) {
    tasksByPerson[kid.id] = listTasksForPerson(kid.id, dateKey);
  }
  const starStats = starStatsByPerson(dateKey);

  return (
    <RoutinesBoard
      people={kids}
      tasksByPerson={tasksByPerson}
      starStats={starStats}
    />
  );
}
