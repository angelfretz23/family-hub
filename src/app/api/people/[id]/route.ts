import { NextResponse } from "next/server";
import { updatePerson } from "@/lib/people";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }

  const body = (await request.json()) as Partial<{
    name: string;
    color: string;
    role: "adult" | "child";
    active: boolean;
  }>;

  const person = updatePerson(id, body);
  if (!person) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ person });
}
