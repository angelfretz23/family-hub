/** Local calendar helpers — family hub runs in household local time. */

import { hubConfig, weekStartIndex } from "@/config/hub";

export function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toDateKey(date: Date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseDateKey(key: string) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

export function endOfDay(date: Date) {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    23,
    59,
    59,
    999,
  );
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

/** Week start from `family-hub.config.json` (`sunday` or `monday`). */
export function startOfWeek(date: Date) {
  const day = startOfDay(date);
  const start = weekStartIndex();
  const diff = (day.getDay() - start + 7) % 7;
  return addDays(day, -diff);
}

export function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

export function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

export function endOfMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function weekDayKeys(date: Date) {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, index) => toDateKey(addDays(start, index)));
}

/**
 * Month grid including leading/trailing days from adjacent months,
 * but only weeks that contain at least one day of the visible month.
 */
export function monthGridDayKeys(date: Date) {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const keys: string[] = [];
  let cursor = gridStart;
  while (cursor <= gridEnd) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function formatWeekRange(date: Date) {
  const start = startOfWeek(date);
  const end = addDays(start, 6);
  const startLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(start);
  const endLabel = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(end);
  return `${startLabel} – ${endLabel}`;
}

export function formatMonthHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function weekdayShortLabels() {
  const start = startOfWeek(parseDateKey("2024-01-10"));
  return Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(
      addDays(start, index),
    ),
  );
}

export function eventsOnDayKey<T extends { startsAt: string; endsAt: string }>(
  items: T[],
  dayKey: string,
) {
  return items.filter((event) => {
    const startKey = event.startsAt.slice(0, 10);
    const endKey = event.endsAt.slice(0, 10);
    return startKey <= dayKey && endKey >= dayKey;
  });
}

/** Inclusive list of YYYY-MM-DD keys from start through end. */
export function eachDayKey(startKey: string, endKey: string) {
  const keys: string[] = [];
  let cursor = parseDateKey(startKey);
  const end = parseDateKey(endKey);
  while (cursor <= end) {
    keys.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }
  return keys;
}

export function toLocalIso(date: Date) {
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function parseLocalIso(value: string) {
  // Accept YYYY-MM-DD or YYYY-MM-DDTHH:mm[:ss]
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return parseDateKey(value);
  }
  const [datePart, timePart = "00:00:00"] = value.split("T");
  const [y, m, d] = datePart.split("-").map(Number);
  const [hh = 0, mm = 0, ss = 0] = timePart.split(":").map(Number);
  return new Date(y, m - 1, d, hh, mm, ss || 0, 0);
}

export function formatDayHeading(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

export function formatTime(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatCompactRange(startsAt: string, endsAt: string, allDay: boolean) {
  if (allDay) return "All day";
  const start = parseLocalIso(startsAt);
  const end = parseLocalIso(endsAt);
  return `${formatTime(start)} – ${formatTime(end)}`;
}

/** Hour in the household timezone (Pi / cloud VMs often run UTC). */
export function householdHour(date = new Date()) {
  const hourText = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    hour12: false,
    timeZone: hubConfig.timeZone,
  }).format(date);
  return Number(hourText);
}

/** Household greeting for the Today header (Modern Day Knight theme). */
export function knightGreeting(date = new Date()) {
  const hour = householdHour(date);
  if (hour >= 5 && hour < 12) return "Good Morning Knights";
  if (hour >= 12 && hour < 17) return "Good Afternoon Knights";
  if (hour >= 17 && hour < 21) return "Good Evening Knights";
  return "Good Night Knights";
}
