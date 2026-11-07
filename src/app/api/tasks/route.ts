import { NextResponse } from "next/server";
import {
  createTask,
  ensureTasksSeeded,
  listTasksForKids,
} from "@/lib/tasks";
import type { TaskBand, TaskVariant } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureTasksSeeded();
  return NextResponse.json(listTasksForKids());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      icon?: string;
      personId?: number;
      band?: TaskBand;
      variants?: TaskVariant[];
      starReward?: number;
    };

    if (!body.title?.trim() || !body.personId || !body.band) {
      return NextResponse.json(
        { error: "title, personId, and band are required" },
        { status: 400 },
      );
    }

    const task = createTask({
      title: body.title,
      icon: body.icon,
      personId: body.personId,
      band: body.band,
      variants: body.variants?.length ? body.variants : ["boolean"],
      starReward: body.starReward,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
