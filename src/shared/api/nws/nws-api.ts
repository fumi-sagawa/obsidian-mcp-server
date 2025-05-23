import type { AlertsResponse, PointsResponse, ForecastResponse } from './types.js';

const NWS_API_BASE = "https://api.weather.gov";
const USER_AGENT = "weather-app/1.0";

async function makeRequest<T>(url: string): Promise<T | null> {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "application/geo+json",
  };

  try {
    const response = await fetch(url, { headers });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.error("Error making NWS request:", error);
    return null;
  }
}

export const nwsApi = {
  async getAlerts(stateCode: string): Promise<AlertsResponse | null> {
    const url = `${NWS_API_BASE}/alerts?area=${stateCode}`;
    return makeRequest<AlertsResponse>(url);
  },

  async getPoints(latitude: number, longitude: number): Promise<PointsResponse | null> {
    const url = `${NWS_API_BASE}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    return makeRequest<PointsResponse>(url);
  },

  async getForecast(forecastUrl: string): Promise<ForecastResponse | null> {
    return makeRequest<ForecastResponse>(forecastUrl);
  },
};