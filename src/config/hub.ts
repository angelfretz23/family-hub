import rawConfig from "../../family-hub.config.json";

export type WeekStartsOn = "sunday" | "monday";

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
};

const defaults: HubConfig = {
  weekStartsOn: "sunday",
  timeZone: "America/Chicago",
  latitude: 33.16262,
  longitude: -96.93751,
  locationLabel: "Little Elm",
  postalCode: "75068",
};

function normalizeWeekStartsOn(value: unknown): WeekStartsOn {
  return value === "monday" ? "monday" : "sunday";
}

function asNumber(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

export const hubConfig: HubConfig = {
  weekStartsOn: normalizeWeekStartsOn(rawConfig.weekStartsOn),
  timeZone:
    typeof rawConfig.timeZone === "string" && rawConfig.timeZone.trim()
      ? rawConfig.timeZone.trim()
      : defaults.timeZone,
  latitude: asNumber(
    (rawConfig as { latitude?: unknown }).latitude,
    defaults.latitude,
  ),
  longitude: asNumber(
    (rawConfig as { longitude?: unknown }).longitude,
    defaults.longitude,
  ),
  locationLabel:
    typeof (rawConfig as { locationLabel?: unknown }).locationLabel === "string" &&
    (rawConfig as { locationLabel: string }).locationLabel.trim()
      ? (rawConfig as { locationLabel: string }).locationLabel.trim()
      : defaults.locationLabel,
  postalCode:
    typeof (rawConfig as { postalCode?: unknown }).postalCode === "string" &&
    (rawConfig as { postalCode: string }).postalCode.trim()
      ? (rawConfig as { postalCode: string }).postalCode.trim()
      : defaults.postalCode,
};

/** JS getDay() index for the configured week start (0 = Sunday, 1 = Monday). */
export function weekStartIndex(config: HubConfig = hubConfig) {
  return config.weekStartsOn === "monday" ? 1 : 0;
}
