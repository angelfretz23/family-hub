import { and, asc, desc, eq } from "drizzle-orm";
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
};

export type TaskInput = {
  title: string;
  icon?: string;
  personId: number;
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
  const unique = [...new Set(variants.length ? variants : (["boolean"] as TaskVariant[]))];
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
  // Morning
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
  // Afternoon — homeschool
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
  // Evening
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
  // Jobs (all day)
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

  const kids = listPeople(true).filter((person) => person.role === "child");
  if (kids.length === 0) return;
  const now = toLocalIso(new Date());

  kids.forEach((kid) => {
    PRESET_TASKS.forEach((preset, index) => {
      db.insert(tasks)
        .values({
          title: preset.title,
          icon: preset.icon,
          personId: kid.id,
          band: preset.band,
          variants: serializeVariants(preset.variants),
          starReward: preset.starReward,
          sortOrder: index,
          active: true,
          createdAt: now,
        })
        .run();
    });
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
  // If today not completed yet, start from yesterday for ongoing streak display
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

export function listTasksForKids(
  dateKey = toDateKey(new Date()),
): TaskWithMeta[] {
  ensureTasksSeeded();
  const kids = listPeople(true).filter((person) => person.role === "child");
  const byId = new Map(kids.map((kid) => [kid.id, kid]));
  const kidIds = new Set(kids.map((kid) => kid.id));

  const rows = db
    .select()
    .from(tasks)
    .where(eq(tasks.active, true))
    .orderBy(asc(tasks.sortOrder), asc(tasks.id))
    .all()
    .filter((task) => kidIds.has(task.personId));

  return rows.map((task) => {
    const person = byId.get(task.personId)!;
    return {
      ...task,
      person,
      variantsList: parseVariants(task.variants),
      todayLog: todayLogFor(task.id, task.personId, dateKey) ?? null,
      streak: computeStreak(task.id, task.personId),
    };
  });
}

export function createTask(input: TaskInput) {
  const person = getPerson(input.personId);
  if (!person || person.role !== "child") {
    throw new Error("Tasks can only be assigned to kids");
  }

  return db
    .insert(tasks)
    .values({
      title: input.title.trim(),
      icon: input.icon?.trim() || "⭐",
      personId: input.personId,
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

export function jobStatsFromTasks(dateKey = toDateKey(new Date())) {
  const all = listTasksForKids(dateKey).filter((task) => task.band === "job");
  const stats = new Map<
    number,
    { personId: number; completed: number; total: number }
  >();
  for (const task of all) {
    const current = stats.get(task.personId) ?? {
      personId: task.personId,
      completed: 0,
      total: 0,
    };
    current.total += 1;
    if (task.todayLog?.completed) current.completed += 1;
    stats.set(task.personId, current);
  }
  return stats;
}
