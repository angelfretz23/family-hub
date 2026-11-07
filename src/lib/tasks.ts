import { and, asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  people,
  taskLogs,
  tasks,
  type Person,
  type Task,
  type TaskBand,
  type TaskLog,
  type TaskVariant,
} from "@/db/schema";
import { addDays, toDateKey, toLocalIso } from "@/lib/dates";
import { listPeople } from "@/lib/people";

export type TaskWithMeta = Task & {
  person: Person;
  variantsList: TaskVariant[];
  todayLog: TaskLog | null;
  streak: number;
  /** True after this kid has logged the task at least once today. */
  loggedForPerson: boolean;
};

export type TaskInput = {
  title: string;
  icon?: string;
  band: TaskBand;
  variants: TaskVariant[];
  starReward?: number;
  sortOrder?: number;
};

export type TaskLogInput = {
  taskId: number;
  personId: number;
  logDate?: string;
  completed?: boolean;
  minutes?: number | null;
  countValue?: number | null;
  bookTitle?: string | null;
  notes?: string;
};

export type PersonStarStats = {
  personId: number;
  starsToday: number;
  starsTotal: number;
  jobsCompleted: number;
  jobsTotal: number;
};

const ALL_VARIANTS: TaskVariant[] = ["boolean", "time", "count", "reading"];

export function parseVariants(raw: string): TaskVariant[] {
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return ["boolean"];
    const list = parsed.filter((value): value is TaskVariant =>
      ALL_VARIANTS.includes(value as TaskVariant),
    );
    return list.length > 0 ? list : ["boolean"];
  } catch {
    return ["boolean"];
  }
}

function serializeVariants(variants: TaskVariant[]) {
  const unique = [
    ...new Set(variants.length ? variants : (["boolean"] as TaskVariant[])),
  ];
  return JSON.stringify(unique);
}

type SeedTask = {
  title: string;
  icon: string;
  band: TaskBand;
  variants: TaskVariant[];
  starReward: number;
};

const PRESET_TASKS: SeedTask[] = [
  {
    title: "Brush teeth",
    icon: "🪥",
    band: "morning",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Get dressed",
    icon: "👕",
    band: "morning",
    variants: ["boolean"],
    starReward: 1,
  },
  {
    title: "Make bed",
    icon: "🛏️",
    band: "morning",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Eat breakfast",
    icon: "🥣",
    band: "morning",
    variants: ["boolean"],
    starReward: 1,
  },
  {
    title: "Morning prayer / devotion",
    icon: "🙏",
    band: "morning",
    variants: ["boolean", "time"],
    starReward: 3,
  },
  {
    title: "Play piano",
    icon: "🎹",
    band: "afternoon",
    variants: ["boolean", "time"],
    starReward: 4,
  },
  {
    title: "Push-ups",
    icon: "💪",
    band: "afternoon",
    variants: ["boolean", "count"],
    starReward: 3,
  },
  {
    title: "Reading",
    icon: "📖",
    band: "afternoon",
    variants: ["boolean", "time", "reading"],
    starReward: 5,
  },
  {
    title: "Math lesson",
    icon: "➗",
    band: "afternoon",
    variants: ["boolean", "time"],
    starReward: 4,
  },
  {
    title: "Outdoor play",
    icon: "🌳",
    band: "afternoon",
    variants: ["boolean", "time"],
    starReward: 2,
  },
  {
    title: "Clear dishes",
    icon: "🍽️",
    band: "evening",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Pack bag for tomorrow",
    icon: "🎒",
    band: "evening",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Devices away",
    icon: "📵",
    band: "evening",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Bath / shower",
    icon: "🛁",
    band: "evening",
    variants: ["boolean"],
    starReward: 1,
  },
  {
    title: "Bedtime reading",
    icon: "🌙",
    band: "evening",
    variants: ["boolean", "time", "reading"],
    starReward: 4,
  },
  {
    title: "Feed the dog",
    icon: "🐕",
    band: "job",
    variants: ["boolean"],
    starReward: 2,
  },
  {
    title: "Take out trash",
    icon: "🗑️",
    band: "job",
    variants: ["boolean"],
    starReward: 3,
  },
  {
    title: "Tidy room",
    icon: "🧹",
    band: "job",
    variants: ["boolean", "time"],
    starReward: 3,
  },
];

export function ensureTasksSeeded() {
  const existing = db.select().from(tasks).all();
  if (existing.length > 0) return;

  const now = toLocalIso(new Date());
  PRESET_TASKS.forEach((preset, index) => {
    db.insert(tasks)
      .values({
        title: preset.title,
        icon: preset.icon,
        band: preset.band,
        variants: serializeVariants(preset.variants),
        starReward: preset.starReward,
        sortOrder: index,
        active: true,
        createdAt: now,
      })
      .run();
  });
}

function getPerson(id: number) {
  return db.select().from(people).where(eq(people.id, id)).get();
}

function todayLogFor(taskId: number, personId: number, dateKey: string) {
  return db
    .select()
    .from(taskLogs)
    .where(
      and(
        eq(taskLogs.taskId, taskId),
        eq(taskLogs.personId, personId),
        eq(taskLogs.logDate, dateKey),
      ),
    )
    .orderBy(desc(taskLogs.id))
    .get();
}

function computeStreak(taskId: number, personId: number, fromDate = new Date()) {
  let streak = 0;
  let cursor = startOfLocalDay(fromDate);
  const todayKey = toDateKey(cursor);
  const today = todayLogFor(taskId, personId, todayKey);
  if (!today?.completed) {
    cursor = addDays(cursor, -1);
  }

  for (let i = 0; i < 60; i += 1) {
    const key = toDateKey(cursor);
    const log = todayLogFor(taskId, personId, key);
    if (!log?.completed) break;
    streak += 1;
    cursor = addDays(cursor, -1);
  }
  return streak;
}

function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Shared task templates personalized for one selected kid. */
export function listTasksForPerson(
  personId: number,
  dateKey = toDateKey(new Date()),
): TaskWithMeta[] {
  ensureTasksSeeded();
  const person = getPerson(personId);
  if (!person || person.role !== "child") return [];

  const rows = db
    .select()
    .from(tasks)
    .where(eq(tasks.active, true))
    .orderBy(asc(tasks.sortOrder), asc(tasks.id))
    .all();

  return rows.map((task) => {
    const todayLog = todayLogFor(task.id, personId, dateKey) ?? null;
    return {
      ...task,
      person,
      variantsList: parseVariants(task.variants),
      todayLog,
      streak: computeStreak(task.id, personId),
      loggedForPerson: Boolean(todayLog),
    };
  });
}

export function listTaskTemplates() {
  ensureTasksSeeded();
  return db
    .select()
    .from(tasks)
    .where(eq(tasks.active, true))
    .orderBy(asc(tasks.sortOrder), asc(tasks.id))
    .all()
    .map((task) => ({
      ...task,
      variantsList: parseVariants(task.variants),
    }));
}

export function createTask(input: TaskInput) {
  return db
    .insert(tasks)
    .values({
      title: input.title.trim(),
      icon: input.icon?.trim() || "⭐",
      band: input.band,
      variants: serializeVariants(input.variants),
      starReward: input.starReward ?? 1,
      sortOrder: input.sortOrder ?? 999,
      active: true,
      createdAt: toLocalIso(new Date()),
    })
    .returning()
    .get();
}

export function getTask(id: number) {
  return db.select().from(tasks).where(eq(tasks.id, id)).get();
}

export function logTask(input: TaskLogInput) {
  const task = getTask(input.taskId);
  if (!task) throw new Error("Task not found");
  const person = getPerson(input.personId);
  if (!person || person.role !== "child") {
    throw new Error("Logs must belong to a kid");
  }

  const logDate = input.logDate ?? toDateKey(new Date());
  const completed = input.completed ?? true;
  const starsEarned = completed ? task.starReward : 0;
  const now = toLocalIso(new Date());

  const existing = todayLogFor(task.id, input.personId, logDate);
  if (existing) {
    return db
      .update(taskLogs)
      .set({
        completed,
        minutes: input.minutes ?? null,
        countValue: input.countValue ?? null,
        bookTitle: input.bookTitle?.trim() || null,
        starsEarned,
        notes: input.notes?.trim() || "",
      })
      .where(eq(taskLogs.id, existing.id))
      .returning()
      .get();
  }

  return db
    .insert(taskLogs)
    .values({
      taskId: task.id,
      personId: input.personId,
      logDate,
      completed,
      minutes: input.minutes ?? null,
      countValue: input.countValue ?? null,
      bookTitle: input.bookTitle?.trim() || null,
      starsEarned,
      notes: input.notes?.trim() || "",
      createdAt: now,
    })
    .returning()
    .get();
}

export function starStatsByPerson(dateKey = toDateKey(new Date())) {
  ensureTasksSeeded();
  const kids = listPeople(true).filter((person) => person.role === "child");
  const jobTasks = db
    .select()
    .from(tasks)
    .where(and(eq(tasks.active, true), eq(tasks.band, "job")))
    .all();
  const stats = new Map<number, PersonStarStats>();

  for (const kid of kids) {
    const todayLogs = db
      .select()
      .from(taskLogs)
      .where(and(eq(taskLogs.personId, kid.id), eq(taskLogs.logDate, dateKey)))
      .all();
    const starsToday = todayLogs.reduce(
      (sum, log) => sum + (log.starsEarned || 0),
      0,
    );

    const totalRow = db
      .select({
        total: sql<number>`coalesce(sum(${taskLogs.starsEarned}), 0)`,
      })
      .from(taskLogs)
      .where(eq(taskLogs.personId, kid.id))
      .get();

    let jobsCompleted = 0;
    for (const job of jobTasks) {
      const log = todayLogFor(job.id, kid.id, dateKey);
      if (log?.completed) jobsCompleted += 1;
    }

    stats.set(kid.id, {
      personId: kid.id,
      starsToday,
      starsTotal: Number(totalRow?.total ?? 0),
      jobsCompleted,
      jobsTotal: jobTasks.length,
    });
  }

  return stats;
}

/** @deprecated use starStatsByPerson — kept for Today person cards job tally shape */
export function jobStatsFromTasks(dateKey = toDateKey(new Date())) {
  const stars = starStatsByPerson(dateKey);
  const map = new Map<
    number,
    { personId: number; completed: number; total: number }
  >();
  for (const [personId, stat] of stars) {
    map.set(personId, {
      personId,
      completed: stat.jobsCompleted,
      total: stat.jobsTotal,
    });
  }
  return map;
}

export type CompletedTaskEntry = TaskWithMeta & {
  log: TaskLog;
};

/** Completed routines (non-job) and jobs for all kids today. */
export function listCompletedToday(dateKey = toDateKey(new Date())) {
  ensureTasksSeeded();
  const kids = listPeople(true).filter((person) => person.role === "child");
  const routines: CompletedTaskEntry[] = [];
  const jobs: CompletedTaskEntry[] = [];

  for (const kid of kids) {
    for (const task of listTasksForPerson(kid.id, dateKey)) {
      if (!task.todayLog?.completed) continue;
      const entry: CompletedTaskEntry = { ...task, log: task.todayLog };
      if (task.band === "job") jobs.push(entry);
      else routines.push(entry);
    }
  }

  const bySort = (a: CompletedTaskEntry, b: CompletedTaskEntry) =>
    a.sortOrder - b.sortOrder || a.person.sortOrder - b.person.sortOrder;

  routines.sort(bySort);
  jobs.sort(bySort);
  return { routines, jobs };
}
