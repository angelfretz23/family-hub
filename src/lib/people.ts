import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { people, type Person } from "@/db/schema";
import { PERSON_COLORS } from "@/lib/person-colors";

export { PERSON_COLORS };

const DEFAULT_PEOPLE = [
  { name: "Parent 1", color: PERSON_COLORS[0], role: "adult" as const, sortOrder: 0 },
  { name: "Parent 2", color: PERSON_COLORS[1], role: "adult" as const, sortOrder: 1 },
  { name: "Kid 1", color: PERSON_COLORS[2], role: "child" as const, sortOrder: 2 },
  { name: "Kid 2", color: PERSON_COLORS[3], role: "child" as const, sortOrder: 3 },
];

export function listPeople(activeOnly = true): Person[] {
  ensurePeopleSeeded();
  if (activeOnly) {
    return db
      .select()
      .from(people)
      .where(eq(people.active, true))
      .orderBy(asc(people.sortOrder), asc(people.id))
      .all();
  }
  return db
    .select()
    .from(people)
    .orderBy(asc(people.sortOrder), asc(people.id))
    .all();
}

export function ensurePeopleSeeded() {
  const existing = db.select().from(people).all();
  if (existing.length > 0) return;
  for (const person of DEFAULT_PEOPLE) {
    db.insert(people).values(person).run();
  }
}

export function getPerson(id: number) {
  return db.select().from(people).where(eq(people.id, id)).get();
}

export function createPerson(input: {
  name: string;
  color?: string;
  role?: "adult" | "child";
}) {
  const sortOrder =
    (db.select().from(people).orderBy(asc(people.sortOrder)).all().at(-1)
      ?.sortOrder ?? -1) + 1;

  const result = db
    .insert(people)
    .values({
      name: input.name.trim(),
      color: input.color ?? PERSON_COLORS[sortOrder % PERSON_COLORS.length],
      role: input.role ?? "child",
      sortOrder,
      active: true,
    })
    .returning()
    .get();

  return result;
}

export function updatePerson(
  id: number,
  input: Partial<{
    name: string;
    color: string;
    role: "adult" | "child";
    active: boolean;
    sortOrder: number;
  }>,
) {
  const current = getPerson(id);
  if (!current) return null;

  return db
    .update(people)
    .set({
      name: input.name?.trim() ?? current.name,
      color: input.color ?? current.color,
      role: input.role ?? current.role,
      active: input.active ?? current.active,
      sortOrder: input.sortOrder ?? current.sortOrder,
    })
    .where(eq(people.id, id))
    .returning()
    .get();
}
