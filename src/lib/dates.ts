/** Local calendar helpers — family hub runs in household local time. */

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

/** Household greeting for the Today header (Modern Day Knight theme). */
export function knightGreeting(date = new Date()) {
  const hour = date.getHours();
  if (hour >= 5 && hour < 12) return "Good Morning Knights";
  if (hour >= 12 && hour < 17) return "Good Afternoon Knights";
  if (hour >= 17 && hour < 21) return "Good Evening Knights";
  return "Good Night Knights";
}
