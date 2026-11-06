import { asc, eq, isNull, or } from "drizzle-orm";
import { db } from "@/db";
import { jobs, type Job, type Person } from "@/db/schema";
import { toDateKey, toLocalIso } from "@/lib/dates";
import { listPeople } from "@/lib/people";

export type JobWithAssignee = Job & { assignee: Person | null };

export type PersonJobStats = {
  personId: number;
  completed: number;
  total: number;
};

export function ensureJobsSeeded() {
  const existing = db.select().from(jobs).all();
  if (existing.length > 0) return;

  const family = listPeople(true);
  if (family.length === 0) return;
  const today = toDateKey(new Date());
  const now = toLocalIso(new Date());

  const seeds: Array<{
    title: string;
    assigneeId: number;
    status: "open" | "done";
  }> = [];

  for (const person of family.filter((member) => member.role === "child")) {
    seeds.push(
      { title: "Make bed", assigneeId: person.id, status: "done" },
      { title: "Feed the dog", assigneeId: person.id, status: "open" },
      { title: "Clear dishes", assigneeId: person.id, status: "open" },
    );
  }

  seeds.forEach((seed, index) => {
    db.insert(jobs)
      .values({
        title: seed.title,
        notes: "",
        assigneeId: seed.assigneeId,
        dueAt: today,
        status: seed.status,
        sortOrder: index,
        createdAt: now,
        completedAt: seed.status === "done" ? now : null,
      })
      .run();
  });
}

export function listJobsForDay(dateKey = toDateKey(new Date())): JobWithAssignee[] {
  ensureJobsSeeded();
  const people = listPeople(false);
  const byId = new Map(people.map((person) => [person.id, person]));

  const rows = db
    .select()
    .from(jobs)
    .where(or(eq(jobs.dueAt, dateKey), isNull(jobs.dueAt)))
    .orderBy(asc(jobs.sortOrder), asc(jobs.id))
    .all();

  return rows.map((job) => ({
    ...job,
    assignee: job.assigneeId ? byId.get(job.assigneeId) ?? null : null,
  }));
}

export function jobStatsByPerson(
  dateKey = toDateKey(new Date()),
): Map<number, PersonJobStats> {
  const todaysJobs = listJobsForDay(dateKey);
  const stats = new Map<number, PersonJobStats>();

  for (const job of todaysJobs) {
    if (!job.assigneeId) continue;
    const current = stats.get(job.assigneeId) ?? {
      personId: job.assigneeId,
      completed: 0,
      total: 0,
    };
    current.total += 1;
    if (job.status === "done") current.completed += 1;
    stats.set(job.assigneeId, current);
  }

  return stats;
}

export function toggleJobDone(jobId: number) {
  const job = db.select().from(jobs).where(eq(jobs.id, jobId)).get();
  if (!job) return null;
  const done = job.status !== "done";
  return db
    .update(jobs)
    .set({
      status: done ? "done" : "open",
      completedAt: done ? toLocalIso(new Date()) : null,
    })
    .where(eq(jobs.id, jobId))
    .returning()
    .get();
}
