import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { rules, type Rule } from "@/db/schema";
import { toLocalIso } from "@/lib/dates";

const DEFAULT_RULES = [
  {
    title: "Be kind",
    body: "Speak with respect. Help each other without being asked.",
  },
  {
    title: "Devices down at dinner",
    body: "Phones and tablets stay off the table during family meals.",
  },
  {
    title: "Tell the truth",
    body: "Mistakes are okay. Hiding them is not.",
  },
  {
    title: "Clean up your space",
    body: "Leave rooms ready for the next person.",
  },
];

export function ensureRulesSeeded() {
  const existing = db.select().from(rules).all();
  if (existing.length > 0) return;

  const now = toLocalIso(new Date());
  DEFAULT_RULES.forEach((rule, index) => {
    db.insert(rules)
      .values({
        title: rule.title,
        body: rule.body,
        sortOrder: index,
        active: true,
        updatedAt: now,
      })
      .run();
  });
}

export function listRules(activeOnly = true): Rule[] {
  ensureRulesSeeded();
  if (activeOnly) {
    return db
      .select()
      .from(rules)
      .where(eq(rules.active, true))
      .orderBy(asc(rules.sortOrder), asc(rules.id))
      .all();
  }
  return db
    .select()
    .from(rules)
    .orderBy(asc(rules.sortOrder), asc(rules.id))
    .all();
}
