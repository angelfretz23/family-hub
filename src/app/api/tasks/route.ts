import { NextResponse } from "next/server";
import {
  createTask,
  ensureTasksSeeded,
  listTaskTemplates,
} from "@/lib/tasks";
import type { TaskBand, TaskVariant } from "@/db/schema";

export const dynamic = "force-dynamic";

export async function GET() {
  ensureTasksSeeded();
  return NextResponse.json(listTaskTemplates());
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      icon?: string;
      band?: TaskBand;
      variants?: TaskVariant[];
      starReward?: number;
    };

    if (!body.title?.trim() || !body.band) {
      return NextResponse.json(
        { error: "title and band are required" },
        { status: 400 },
      );
    }

    const task = createTask({
      title: body.title,
      icon: body.icon,
      band: body.band,
      variants: body.variants?.length ? body.variants : ["boolean"],
      starReward: body.starReward,
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create task";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
