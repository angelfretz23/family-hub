import rawConfig from "../../family-hub.config.json";

export type WeekStartsOn = "sunday" | "monday";
export type TemperatureUnit = "F" | "C";

export type HubConfig = {
  /** First day of the week in Week/Month calendars. */
  weekStartsOn: WeekStartsOn;
  /** Household timezone used for greetings, clock, and local “today”. */
  timeZone: string;
  /** Weather fetch coordinates (Open-Meteo). */
  latitude: number;
  longitude: number;
  /** Optional short label shown under the temperature. */
  locationLabel: string;
  /** Household postal code (for reference / future use). */
  postalCode: string;
  /** Display / fetch temperature unit. Defaults to Fahrenheit. */
  temperatureUnit: TemperatureUnit;
};

const defaults: HubConfig = {
  weekStartsOn: "sunday",
  timeZone: "America/Chicago",
  latitude: 33.16262,
  longitude: -96.93751,
  locationLabel: "Little Elm",
  postalCode: "75068",
  temperatureUnit: "F",
};

function normalizeWeekStartsOn(value: unknown): WeekStartsOn {
  return value === "monday" ? "monday" : "sunday";
}

function normalizeTemperatureUnit(value: unknown): TemperatureUnit {
  if (typeof value !== "string") return defaults.temperatureUnit;
  const normalized = value.trim().toUpperCase();
  return normalized === "C" ? "C" : "F";
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

const raw = rawConfig as Record<string, unknown>;

export const hubConfig: HubConfig = {
  weekStartsOn: normalizeWeekStartsOn(raw.weekStartsOn),
  timeZone: asString(raw.timeZone, defaults.timeZone),
  latitude: asNumber(raw.latitude, defaults.latitude),
  longitude: asNumber(raw.longitude, defaults.longitude),
  locationLabel: asString(raw.locationLabel, defaults.locationLabel),
  postalCode: asString(raw.postalCode, defaults.postalCode),
  temperatureUnit: normalizeTemperatureUnit(raw.temperatureUnit),
};

/** JS getDay() index for the configured week start (0 = Sunday, 1 = Monday). */
export function weekStartIndex(config: HubConfig = hubConfig) {
  return config.weekStartsOn === "monday" ? 1 : 0;
}
