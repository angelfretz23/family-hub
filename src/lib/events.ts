import { and, asc, eq, gte, inArray, lte } from "drizzle-orm";
import { db } from "@/db";
import { eventPeople, events, people, type EventRow, type Person } from "@/db/schema";
import {
  addDays,
  endOfDay,
  parseDateKey,
  parseLocalIso,
  startOfDay,
  toDateKey,
  toLocalIso,
} from "@/lib/dates";

export type EventWithPeople = EventRow & { people: Person[] };

export type EventInput = {
  title: string;
  notes?: string;
  startsAt: string;
  endsAt: string;
  allDay?: boolean;
  location?: string;
  personIds?: number[];
};

function normalizeBounds(input: EventInput) {
  if (!input.allDay) {
    return {
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      allDay: false,
    };
  }

  const startKey = input.startsAt.slice(0, 10);
  const endKey = (input.endsAt || input.startsAt).slice(0, 10);
  return {
    startsAt: toLocalIso(startOfDay(parseDateKey(startKey))),
    endsAt: toLocalIso(endOfDay(parseDateKey(endKey))),
    allDay: true,
  };
}

function attachPeople(rows: EventRow[]): EventWithPeople[] {
  if (rows.length === 0) return [];

  const ids = rows.map((row) => row.id);
  const links = db
    .select({
      eventId: eventPeople.eventId,
      person: people,
    })
    .from(eventPeople)
    .innerJoin(people, eq(eventPeople.personId, people.id))
    .where(inArray(eventPeople.eventId, ids))
    .all();

  const byEvent = new Map<number, Person[]>();
  for (const link of links) {
    const list = byEvent.get(link.eventId) ?? [];
    list.push(link.person);
    byEvent.set(link.eventId, list);
  }

  return rows.map((row) => ({
    ...row,
    people: (byEvent.get(row.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder),
  }));
}

function setEventPeople(eventId: number, personIds: number[]) {
  db.delete(eventPeople).where(eq(eventPeople.eventId, eventId)).run();
  for (const personId of [...new Set(personIds)]) {
    db.insert(eventPeople).values({ eventId, personId }).run();
  }
}

export function getEvent(id: number): EventWithPeople | null {
  const row = db.select().from(events).where(eq(events.id, id)).get();
  if (!row) return null;
  return attachPeople([row])[0] ?? null;
}

export function listEventsBetween(start: Date, end: Date): EventWithPeople[] {
  const startIso = toLocalIso(start);
  const endIso = toLocalIso(end);
  const rows = db
    .select()
    .from(events)
    .where(and(lte(events.startsAt, endIso), gte(events.endsAt, startIso)))
    .orderBy(asc(events.startsAt), asc(events.id))
    .all();
  return attachPeople(rows);
}

export function listEventsFrom(start: Date, limit = 50): EventWithPeople[] {
  const startIso = toLocalIso(start);
  const rows = db
    .select()
    .from(events)
    .where(gte(events.endsAt, startIso))
    .orderBy(asc(events.startsAt), asc(events.id))
    .limit(limit)
    .all();
  return attachPeople(rows);
}

export function listEventsForDay(dateKey: string): EventWithPeople[] {
  const day = parseDateKey(dateKey);
  return listEventsBetween(startOfDay(day), endOfDay(day));
}

export function listEventsForToday(): EventWithPeople[] {
  return listEventsForDay(toDateKey(new Date()));
}

export function createEvent(input: EventInput): EventWithPeople {
  const bounds = normalizeBounds(input);
  const now = toLocalIso(new Date());
  const row = db
    .insert(events)
    .values({
      title: input.title.trim(),
      notes: input.notes?.trim() ?? "",
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
      allDay: bounds.allDay,
      location: input.location?.trim() ?? "",
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  setEventPeople(row.id, input.personIds ?? []);
  return getEvent(row.id)!;
}

export function updateEvent(id: number, input: EventInput): EventWithPeople | null {
  const current = getEvent(id);
  if (!current) return null;

  const bounds = normalizeBounds(input);
  db.update(events)
    .set({
      title: input.title.trim(),
      notes: input.notes?.trim() ?? "",
      startsAt: bounds.startsAt,
      endsAt: bounds.endsAt,
      allDay: bounds.allDay,
      location: input.location?.trim() ?? "",
      updatedAt: toLocalIso(new Date()),
    })
    .where(eq(events.id, id))
    .run();

  setEventPeople(id, input.personIds ?? []);
  return getEvent(id);
}

export function deleteEvent(id: number) {
  const result = db.delete(events).where(eq(events.id, id)).run();
  return result.changes > 0;
}

export function groupEventsByDay(items: EventWithPeople[]) {
  const groups = new Map<string, EventWithPeople[]>();
  for (const item of items) {
    const key = toDateKey(parseLocalIso(item.startsAt));
    const list = groups.get(key) ?? [];
    list.push(item);
    groups.set(key, list);
  }
  return [...groups.entries()].map(([dateKey, dayEvents]) => ({
    dateKey,
    label: new Intl.DateTimeFormat("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    }).format(parseDateKey(dateKey)),
    events: dayEvents,
  }));
}

export function defaultNewEventTimes(dateKey?: string) {
  const base = dateKey ? parseDateKey(dateKey) : new Date();
  const start = new Date(base);
  if (!dateKey) {
    start.setMinutes(0, 0, 0);
    start.setHours(start.getHours() + 1);
  } else {
    start.setHours(9, 0, 0, 0);
  }
  const end = new Date(start);
  end.setHours(end.getHours() + 1);
  return {
    startsAt: toLocalIso(start),
    endsAt: toLocalIso(end),
    dateKey: toDateKey(start),
  };
}

export function ensureDemoEvents() {
  const existing = db.select().from(events).all();
  if (existing.length > 0) return;

  const family = db.select().from(people).where(eq(people.active, true)).all();
  if (family.length === 0) return;

  const today = startOfDay(new Date());
  const tomorrow = addDays(today, 1);
  const kids = family.filter((p) => p.role === "child");

  createEvent({
    title: "Library books due",
    startsAt: toDateKey(today),
    endsAt: toDateKey(today),
    allDay: true,
    personIds: family.slice(0, 2).map((p) => p.id),
  });

  createEvent({
    title: "Soccer practice",
    startsAt: toLocalIso(
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 9, 0),
    ),
    endsAt: toLocalIso(
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0),
    ),
    personIds: kids.slice(0, 1).map((p) => p.id),
  });

  createEvent({
    title: "Family dinner",
    startsAt: toLocalIso(
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 18, 0),
    ),
    endsAt: toLocalIso(
      new Date(today.getFullYear(), today.getMonth(), today.getDate(), 19, 0),
    ),
    personIds: family.map((p) => p.id),
  });

  createEvent({
    title: "Dentist",
    startsAt: toLocalIso(
      new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        12,
        30,
      ),
    ),
    endsAt: toLocalIso(
      new Date(
        tomorrow.getFullYear(),
        tomorrow.getMonth(),
        tomorrow.getDate(),
        13,
        15,
      ),
    ),
    personIds: kids.slice(1, 2).map((p) => p.id),
  });

  seedThreeDayAllDayEvent(family.map((p) => p.id), today);
}

const THREE_DAY_DEMO_TITLE = "Camping trip (3-day mock)";

/** Ensures a multi-day all-day event exists for layout testing across views. */
export function ensureThreeDayAllDayDemo() {
  const existing = db
    .select()
    .from(events)
    .where(eq(events.title, THREE_DAY_DEMO_TITLE))
    .get();
  if (existing) return;

  const family = db.select().from(people).where(eq(people.active, true)).all();
  if (family.length === 0) return;

  seedThreeDayAllDayEvent(
    family.map((p) => p.id),
    startOfDay(new Date()),
  );
}

function seedThreeDayAllDayEvent(personIds: number[], start: Date) {
  const end = addDays(start, 2);
  createEvent({
    title: THREE_DAY_DEMO_TITLE,
    notes: "Mock multi-day all-day event to preview List / Day / Week / Month.",
    startsAt: toDateKey(start),
    endsAt: toDateKey(end),
    allDay: true,
    personIds,
  });
}
