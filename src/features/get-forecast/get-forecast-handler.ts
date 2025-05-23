import { nwsApi, logger, handleError, BusinessError, ValidationError, ApiError, MetricsMiddleware } from '../../shared/index.js';
import { formatForecast } from './format-forecast.js';

function validateCoordinates(latitude: number, longitude: number): void {
  // Validate latitude (-90 to 90)
  if (latitude < -90 || latitude > 90) {
    throw ValidationError.invalidCoordinates(latitude, longitude);
  }
  
  // Validate longitude (-180 to 180)
  if (longitude < -180 || longitude > 180) {
    throw ValidationError.invalidCoordinates(latitude, longitude);
  }
  
  // Check if coordinates are within US bounds (rough check)
  // Continental US: roughly 24°N to 49°N, 66°W to 125°W
  // Alaska: roughly 51°N to 71°N, 130°W to 173°E
  // Hawaii: roughly 18°N to 29°N, 154°W to 163°W
  const isInContinentalUS = latitude >= 24 && latitude <= 49 && longitude >= -125 && longitude <= -66;
  const isInAlaska = latitude >= 51 && latitude <= 71 && longitude >= -173 && longitude <= -130;
  const isInHawaii = latitude >= 18 && latitude <= 29 && longitude >= -163 && longitude <= -154;
  
  if (!isInContinentalUS && !isInAlaska && !isInHawaii) {
    throw BusinessError.locationNotSupported(`${latitude}, ${longitude}`);
  }
}

const metricsMiddleware = new MetricsMiddleware();

export async function getForecastHandler({ latitude, longitude }: { latitude: number; longitude: number }) {
  const requestId = `forecast-${Date.now()}`;
  const handlerLogger = logger.child({ 
    requestId, 
    operation: 'get-forecast',
    latitude, 
    longitude 
  });
  
  handlerLogger.info("Processing get-forecast request");

  try {
    // Validate coordinates
    validateCoordinates(latitude, longitude);

    const pointsData = await metricsMiddleware.trackWeatherAPICall(
      'get-points',
      () => nwsApi.getPoints(latitude, longitude)
    );
    const forecastUrl = pointsData.properties?.forecast;
    
    if (!forecastUrl) {
      handlerLogger.error("No forecast URL in grid point data", undefined, { 
        pointsData: JSON.stringify(pointsData) 
      });
      throw BusinessError.noForecastAvailable(latitude, longitude);
    }

    handlerLogger.debug("Retrieved forecast URL", { forecastUrl });

    const forecastData = await metricsMiddleware.trackWeatherAPICall(
      'get-forecast',
      () => nwsApi.getForecast(forecastUrl)
    );
    const periods = forecastData.properties?.periods || [];
    
    if (periods.length === 0) {
      handlerLogger.warn("No forecast periods available");
      throw BusinessError.noForecastAvailable(latitude, longitude);
    }

    handlerLogger.info("Successfully retrieved forecast", { 
      periodCount: periods.length 
    });

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
  } catch (error) {
    const weatherError = handleError(error, 'get-forecast-handler');
    
    // Provide specific error messages based on error type
    let userMessage = weatherError.message;
    
    if (weatherError instanceof ApiError && weatherError.statusCode === 404) {
      userMessage = `Location (${latitude}, ${longitude}) is not supported by the National Weather Service. Only US locations are supported.`;
    } else if (weatherError instanceof BusinessError) {
      userMessage = weatherError.message;
    } else if (weatherError instanceof ValidationError) {
      userMessage = weatherError.message;
    }
    
    return {
      content: [
        {
          type: "text" as const,
          text: `Error: ${userMessage}`,
        },
      ],
    };
  }
}