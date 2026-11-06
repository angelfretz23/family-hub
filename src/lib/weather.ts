import { hubConfig } from "@/config/hub";

export type WeatherSnapshot = {
  tempF: number;
  feelsLikeF: number;
  condition: string;
  locationLabel: string;
  fetchedAt: string;
};

/** WMO weather interpretation codes → short kiosk labels. */
export function weatherCodeLabel(code: number): string {
  if (code === 0) return "Clear";
  if (code === 1) return "Mostly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 57) return "Drizzle";
  if (code >= 61 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Storm + hail";
  return "Weather";
}

type OpenMeteoCurrent = {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
};

type OpenMeteoResponse = {
  current?: OpenMeteoCurrent;
};

export async function fetchWeather(
  config = hubConfig,
): Promise<WeatherSnapshot> {
  const latitude =
    typeof config.latitude === "number" ? config.latitude : 41.8781;
  const longitude =
    typeof config.longitude === "number" ? config.longitude : -87.6298;
  const timeZone = config.timeZone || "America/Chicago";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code",
  );
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("timezone", timeZone);

  const response = await fetch(url.toString(), {
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Weather request failed (${response.status})${detail ? `: ${detail.slice(0, 200)}` : ""}`,
    );
  }

  const data = (await response.json()) as OpenMeteoResponse;
  const current = data.current;
  if (
    !current ||
    typeof current.temperature_2m !== "number" ||
    typeof current.weather_code !== "number"
  ) {
    throw new Error("Weather response missing current conditions");
  }

  return {
    tempF: Math.round(current.temperature_2m),
    feelsLikeF: Math.round(
      typeof current.apparent_temperature === "number"
        ? current.apparent_temperature
        : current.temperature_2m,
    ),
    condition: weatherCodeLabel(current.weather_code),
    locationLabel: config.locationLabel,
    fetchedAt: new Date().toISOString(),
  };
}
