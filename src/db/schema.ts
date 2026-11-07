import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const people = sqliteTable("people", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#3F6F5B"),
  role: text("role", { enum: ["adult", "child"] })
    .notNull()
    .default("child"),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  avatarUrl: text("avatar_url"),
});

export const settings = sqliteTable("settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  startsAt: text("starts_at").notNull(),
  endsAt: text("ends_at").notNull(),
  allDay: integer("all_day", { mode: "boolean" }).notNull().default(false),
  location: text("location").notNull().default(""),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const eventPeople = sqliteTable("event_people", {
  eventId: integer("event_id")
    .notNull()
    .references(() => events.id, { onDelete: "cascade" }),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
});

export const rules = sqliteTable("rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  body: text("body").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  notes: text("notes").notNull().default(""),
  assigneeId: integer("assignee_id").references(() => people.id, {
    onDelete: "set null",
  }),
  dueAt: text("due_at"),
  status: text("status", { enum: ["open", "done", "skipped"] })
    .notNull()
    .default("open"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
});

export const routines = sqliteTable("routines", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  band: text("band", { enum: ["morning", "afternoon", "evening"] })
    .notNull()
    .default("morning"),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const routineSteps = sqliteTable("routine_steps", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const routineRuns = sqliteTable("routine_runs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  routineId: integer("routine_id")
    .notNull()
    .references(() => routines.id, { onDelete: "cascade" }),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  runDate: text("run_date").notNull(),
  completedAt: text("completed_at"),
});

export const routineStepChecks = sqliteTable("routine_step_checks", {
  runId: integer("run_id")
    .notNull()
    .references(() => routineRuns.id, { onDelete: "cascade" }),
  stepId: integer("step_id")
    .notNull()
    .references(() => routineSteps.id, { onDelete: "cascade" }),
  checkedAt: text("checked_at").notNull(),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  icon: text("icon").notNull().default("⭐"),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  band: text("band", {
    enum: ["morning", "afternoon", "evening", "job"],
  })
    .notNull()
    .default("morning"),
  /** JSON array of TaskVariant values, e.g. ["boolean","time"]. */
  variants: text("variants").notNull().default('["boolean"]'),
  starReward: integer("star_reward").notNull().default(1),
  sortOrder: integer("sort_order").notNull().default(0),
  active: integer("active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull(),
});

export const taskLogs = sqliteTable("task_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  taskId: integer("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  personId: integer("person_id")
    .notNull()
    .references(() => people.id, { onDelete: "cascade" }),
  logDate: text("log_date").notNull(),
  completed: integer("completed", { mode: "boolean" }).notNull().default(true),
  minutes: integer("minutes"),
  countValue: integer("count_value"),
  bookTitle: text("book_title"),
  starsEarned: integer("stars_earned").notNull().default(0),
  notes: text("notes").notNull().default(""),
  createdAt: text("created_at").notNull(),
});

export type Person = typeof people.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type Rule = typeof rules.$inferSelect;
export type Job = typeof jobs.$inferSelect;
export type Routine = typeof routines.$inferSelect;
export type RoutineStep = typeof routineSteps.$inferSelect;
export type RoutineBand = "morning" | "afternoon" | "evening";
export type Task = typeof tasks.$inferSelect;
export type TaskLog = typeof taskLogs.$inferSelect;
export type TaskBand = "morning" | "afternoon" | "evening" | "job";
export type TaskVariant = "boolean" | "time" | "count" | "reading";
