import { NextResponse } from "next/server";
import { fetchWeather } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const weather = await fetchWeather();
    return NextResponse.json(weather, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load weather";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
