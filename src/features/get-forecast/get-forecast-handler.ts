import { nwsApi } from '../../shared/api/index.js';
import { formatForecast } from './format-forecast.js';

export async function getForecastHandler({ latitude, longitude }: { latitude: number; longitude: number }) {
  const pointsData = await nwsApi.getPoints(latitude, longitude);

  if (!pointsData) {
    return {
      content: [
        {
          type: "text" as const,
          text: `Failed to retrieve grid point data for coordinates: ${latitude}, ${longitude}. This location may not be supported by the NWS API (only US locations are supported).`,
        },
      ],
    };
  }

  const forecastUrl = pointsData.properties?.forecast;
  if (!forecastUrl) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Failed to get forecast URL from grid point data",
        },
      ],
    };
  }

  const forecastData = await nwsApi.getForecast(forecastUrl);
  if (!forecastData) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Failed to retrieve forecast data",
        },
      ],
    };
  }

  const periods = forecastData.properties?.periods || [];
  if (periods.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: "No forecast periods available",
        },
      ],
    };
  }

  const formattedForecast = periods.map(formatForecast);
  const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedForecast.join("\n")}`;

  return {
    content: [
      {
        type: "text" as const,
        text: forecastText,
      },
    ],
  };
}