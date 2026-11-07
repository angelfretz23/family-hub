import { NextResponse } from "next/server";
import { logTask } from "@/lib/tasks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      taskId?: number;
      personId?: number;
      logDate?: string;
      completed?: boolean;
      minutes?: number | null;
      countValue?: number | null;
      bookTitle?: string | null;
      notes?: string;
    };

    if (!body.taskId || !body.personId) {
      return NextResponse.json(
        { error: "taskId and personId are required" },
        { status: 400 },
      );
    }

    const log = logTask({
      taskId: body.taskId,
      personId: body.personId,
      logDate: body.logDate,
      completed: body.completed,
      minutes: body.minutes,
      countValue: body.countValue,
      bookTitle: body.bookTitle,
      notes: body.notes,
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to log task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
