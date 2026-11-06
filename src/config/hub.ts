import rawConfig from "../../family-hub.config.json";

export type WeekStartsOn = "sunday" | "monday";

export type HubConfig = {
  /** First day of the week in Week/Month calendars. */
  weekStartsOn: WeekStartsOn;
  /** Household timezone used for greetings and local “today”. */
  timeZone: string;
};

const defaults: HubConfig = {
  weekStartsOn: "sunday",
  timeZone: "America/Chicago",
};

function normalizeWeekStartsOn(value: unknown): WeekStartsOn {
  return value === "monday" ? "monday" : "sunday";
}

export const hubConfig: HubConfig = {
  weekStartsOn: normalizeWeekStartsOn(rawConfig.weekStartsOn),
  timeZone:
    typeof rawConfig.timeZone === "string" && rawConfig.timeZone.trim()
      ? rawConfig.timeZone.trim()
      : defaults.timeZone,
};

/** JS getDay() index for the configured week start (0 = Sunday, 1 = Monday). */
export function weekStartIndex(config: HubConfig = hubConfig) {
  return config.weekStartsOn === "monday" ? 1 : 0;
}
