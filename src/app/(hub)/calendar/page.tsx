import { CalendarClient } from "@/components/CalendarClient";
import {
  addMonths,
  endOfMonth,
  parseDateKey,
  startOfMonth,
  startOfWeek,
  toDateKey,
} from "@/lib/dates";
import { ensureDemoEvents, listEventsBetween } from "@/lib/events";
import { ensurePeopleSeeded, listPeople } from "@/lib/people";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ view?: string; date?: string }>;

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  ensurePeopleSeeded();
  ensureDemoEvents();

  const params = await searchParams;
  const people = listPeople(true);
  const anchor = params.date ? parseDateKey(params.date) : new Date();

  // Cover current week/month navigation plus neighbors for Prev/Next without gaps.
  const rangeStart = startOfWeek(startOfMonth(addMonths(anchor, -1)));
  const rangeEnd = endOfMonth(addMonths(anchor, 2));
  const events = listEventsBetween(rangeStart, rangeEnd);

  const view =
    params.view === "day" ||
    params.view === "week" ||
    params.view === "month" ||
    params.view === "list"
      ? params.view
      : "list";

  return (
    <CalendarClient
      people={people}
      events={events}
      initialView={view}
      initialDateKey={params.date ?? toDateKey(new Date())}
    />
  );
}
