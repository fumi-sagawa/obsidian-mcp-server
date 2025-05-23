import type { ForecastPeriod } from '../../shared/api/index.js';

export function formatForecast(period: ForecastPeriod): string {
  return [
    `${period.name || "Unknown"}:`,
    `Temperature: ${period.temperature || "Unknown"}°${period.temperatureUnit || "F"}`,
    `Wind: ${period.windSpeed || "Unknown"} ${period.windDirection || ""}`,
    `${period.shortForecast || "No forecast available"}`,
    "---",
  ].join("\n");
}