import { NextResponse } from "next/server";
import { parseDateKey, startOfDay, toDateKey } from "@/lib/dates";
import {
  createEvent,
  ensureDemoEvents,
  ensureThreeDayAllDayDemo,
  listEventsForDay,
  listEventsFrom,
} from "@/lib/events";
import { ensurePeopleSeeded } from "@/lib/people";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  ensurePeopleSeeded();
  ensureDemoEvents();
  ensureThreeDayAllDayDemo();

  const { searchParams } = new URL(request.url);
  const day = searchParams.get("day");
  const from = searchParams.get("from");

  if (day) {
    return NextResponse.json({ events: listEventsForDay(day) });
  }

  const start = from ? startOfDay(parseDateKey(from)) : startOfDay(new Date());
  return NextResponse.json({
    events: listEventsFrom(start),
    from: toDateKey(start),
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    notes?: string;
    startsAt?: string;
    endsAt?: string;
    allDay?: boolean;
    location?: string;
    personIds?: number[];
  };

  if (!body.title?.trim() || !body.startsAt || !body.endsAt) {
    return NextResponse.json(
      { error: "title, startsAt, and endsAt are required" },
      { status: 400 },
    );
  }

  const event = createEvent({
    title: body.title,
    notes: body.notes,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    allDay: body.allDay,
    location: body.location,
    personIds: body.personIds ?? [],
  });

  return NextResponse.json({ event }, { status: 201 });
}
