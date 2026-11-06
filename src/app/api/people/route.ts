import { NextResponse } from "next/server";
import { createPerson, listPeople } from "@/lib/people";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ people: listPeople(false) });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    color?: string;
    role?: "adult" | "child";
  };

  if (!body.name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const person = createPerson({
    name: body.name,
    color: body.color,
    role: body.role,
  });

  return NextResponse.json({ person }, { status: 201 });
}
