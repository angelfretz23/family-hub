import { and, asc, eq } from "drizzle-orm";
import { db } from "@/db";
import {
  routineRuns,
  routineStepChecks,
  routineSteps,
  routines,
  type Person,
  type Routine,
  type RoutineBand,
  type RoutineStep,
} from "@/db/schema";
import { toDateKey, toLocalIso } from "@/lib/dates";
import { listPeople } from "@/lib/people";

export type RoutineWithProgress = Routine & {
  person: Person;
  steps: RoutineStep[];
  checkedStepIds: number[];
  completed: boolean;
};

export function ensureRoutinesSeeded() {
  const existing = db.select().from(routines).all();
  if (existing.length > 0) return;

  const family = listPeople(true);
  if (family.length === 0) return;

  const templates: Array<{
    title: string;
    band: RoutineBand;
    steps: string[];
  }> = [
    {
      title: "Morning routine",
      band: "morning",
      steps: ["Wake up", "Brush teeth", "Get dressed", "Breakfast"],
    },
    {
      title: "Afternoon reset",
      band: "afternoon",
      steps: ["Homework start", "Snack", "Tidy desk"],
    },
    {
      title: "Evening wind-down",
      band: "evening",
      steps: ["Devices away", "Pack bag", "Pajamas", "Prayers / reading"],
    },
  ];

  const kids = family.filter((person) => person.role === "child");
  for (const person of kids) {
    templates.forEach((template, routineIndex) => {
      const routine = db
        .insert(routines)
        .values({
          title: template.title,
          personId: person.id,
          band: template.band,
          active: true,
          sortOrder: routineIndex,
        })
        .returning()
        .get();

      template.steps.forEach((stepTitle, stepIndex) => {
        db.insert(routineSteps)
          .values({
            routineId: routine.id,
            title: stepTitle,
            sortOrder: stepIndex,
          })
          .run();
      });

      // Progress demo: mark first morning step done
      if (template.band === "morning") {
        const run = ensureRun(routine.id, person.id, toDateKey(new Date()));
        const firstStep = db
          .select()
          .from(routineSteps)
          .where(eq(routineSteps.routineId, routine.id))
          .orderBy(asc(routineSteps.sortOrder))
          .all()[0];
        if (firstStep) {
          db.insert(routineStepChecks)
            .values({
              runId: run.id,
              stepId: firstStep.id,
              checkedAt: toLocalIso(new Date()),
            })
            .run();
        }
      }
    });
  }
}

function ensureRun(routineId: number, personId: number, runDate: string) {
  const existing = db
    .select()
    .from(routineRuns)
    .where(
      and(
        eq(routineRuns.routineId, routineId),
        eq(routineRuns.personId, personId),
        eq(routineRuns.runDate, runDate),
      ),
    )
    .get();
  if (existing) return existing;

  return db
    .insert(routineRuns)
    .values({
      routineId,
      personId,
      runDate,
      completedAt: null,
    })
    .returning()
    .get();
}

export function listRoutinesForToday(
  dateKey = toDateKey(new Date()),
): RoutineWithProgress[] {
  ensureRoutinesSeeded();
  const family = listPeople(false);
  const byId = new Map(family.map((person) => [person.id, person]));

  const rows = db
    .select()
    .from(routines)
    .where(eq(routines.active, true))
    .orderBy(asc(routines.sortOrder), asc(routines.id))
    .all();

  return rows.map((routine) => {
    const steps = db
      .select()
      .from(routineSteps)
      .where(eq(routineSteps.routineId, routine.id))
      .orderBy(asc(routineSteps.sortOrder), asc(routineSteps.id))
      .all();

    const run = db
      .select()
      .from(routineRuns)
      .where(
        and(
          eq(routineRuns.routineId, routine.id),
          eq(routineRuns.runDate, dateKey),
        ),
      )
      .get();

    const checks = run
      ? db
          .select()
          .from(routineStepChecks)
          .where(eq(routineStepChecks.runId, run.id))
          .all()
      : [];

    const checkedStepIds = checks.map((check) => check.stepId);
    const completed =
      steps.length > 0 && checkedStepIds.length >= steps.length;

    return {
      ...routine,
      person: byId.get(routine.personId)!,
      steps,
      checkedStepIds,
      completed,
    };
  });
}
