import { hubConfig, type TemperatureUnit } from "@/config/hub";

export type WeatherSnapshot = {
  temp: number;
  feelsLike: number;
  unit: TemperatureUnit;
  condition: string;
  weatherCode: number;
  isDay: boolean;
  icon: string;
  iconUrl: string;
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

/**
 * Map Open-Meteo WMO code + day/night to a Meteocons fill icon name.
 * Icons live in `/public/meteocons` (Bas Milius / MIT).
 */
export function weatherIconName(code: number, isDay: boolean): string {
  const day = isDay;

  if (code === 0) return day ? "clear-day" : "clear-night";
  if (code === 1) return day ? "mostly-clear-day" : "mostly-clear-night";
  if (code === 2) return day ? "partly-cloudy-day" : "partly-cloudy-night";
  if (code === 3) return "overcast";
  if (code === 45 || code === 48) {
    return day ? "fog-day" : "fog-night";
  }
  if (code >= 51 && code <= 57) return "drizzle";
  if (code >= 61 && code <= 67) return "rain";
  if (code >= 71 && code <= 77) return "snow";
  if (code >= 80 && code <= 82) return "rain";
  if (code === 85 || code === 86) return "snow";
  if (code === 95) return day ? "thunderstorms-day" : "thunderstorms-night";
  if (code === 96 || code === 99) {
    return day ? "thunderstorms-day-hail" : "thunderstorms-night-hail";
  }
  return day ? "cloudy" : "partly-cloudy-night";
}

type OpenMeteoCurrent = {
  temperature_2m?: number;
  apparent_temperature?: number;
  weather_code?: number;
  is_day?: number;
};

type OpenMeteoResponse = {
  current?: OpenMeteoCurrent;
};

export async function fetchWeather(
  config = hubConfig,
): Promise<WeatherSnapshot> {
  const latitude =
    typeof config.latitude === "number" ? config.latitude : 33.16262;
  const longitude =
    typeof config.longitude === "number" ? config.longitude : -96.93751;
  const timeZone = config.timeZone || "America/Chicago";
  const unit: TemperatureUnit =
    config.temperatureUnit === "C" ? "C" : "F";

  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,weather_code,is_day",
  );
  url.searchParams.set(
    "temperature_unit",
    unit === "C" ? "celsius" : "fahrenheit",
  );
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

  const isDay = current.is_day === 1;
  const icon = weatherIconName(current.weather_code, isDay);

  return {
    temp: Math.round(current.temperature_2m),
    feelsLike: Math.round(
      typeof current.apparent_temperature === "number"
        ? current.apparent_temperature
        : current.temperature_2m,
    ),
    unit,
    condition: weatherCodeLabel(current.weather_code),
    weatherCode: current.weather_code,
    isDay,
    icon,
    iconUrl: `/meteocons/${icon}.svg`,
    locationLabel: config.locationLabel,
    fetchedAt: new Date().toISOString(),
  };
}

export function formatWeatherTempLine(weather: WeatherSnapshot) {
  const degree = `${weather.temp}°`;
  if (weather.temp === weather.feelsLike) return degree;
  return `${degree}, Feels Like ${weather.feelsLike}°`;
}
