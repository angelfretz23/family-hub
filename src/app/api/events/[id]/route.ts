import { NextResponse } from "next/server";
import { deleteEvent, getEvent, updateEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const id = Number((await params).id);
  const event = getEvent(id);
  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ event });
}

export async function PATCH(request: Request, { params }: Params) {
  const id = Number((await params).id);
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

  const event = updateEvent(id, {
    title: body.title,
    notes: body.notes,
    startsAt: body.startsAt,
    endsAt: body.endsAt,
    allDay: body.allDay,
    location: body.location,
    personIds: body.personIds ?? [],
  });

  if (!event) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ event });
}

export async function DELETE(_request: Request, { params }: Params) {
  const id = Number((await params).id);
  const ok = deleteEvent(id);
  if (!ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
