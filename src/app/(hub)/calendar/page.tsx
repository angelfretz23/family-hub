import { CalendarClient } from "@/components/CalendarClient";
import { startOfDay, toDateKey } from "@/lib/dates";
import { ensureDemoEvents, listEventsFrom } from "@/lib/events";
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
  const events = listEventsFrom(startOfDay(new Date()), 80);
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
