import { BaseError } from './base-error.js';
import { ErrorCode } from './types.js';

export class BusinessError extends BaseError {
  constructor(
    message: string,
    code: ErrorCode,
    metadata?: Record<string, unknown>
  ) {
    super({
      code,
      message,
      statusCode: 404,
      metadata,
    });
  }

  static noAlertsFound(state: string): BusinessError {
    return new BusinessError(
      `No weather alerts found for state: ${state}`,
      ErrorCode.NO_ALERTS_FOUND,
      { state }
    );
  }

  static noForecastAvailable(lat: number, lon: number): BusinessError {
    return new BusinessError(
      `No forecast available for coordinates: ${lat}, ${lon}`,
      ErrorCode.NO_FORECAST_AVAILABLE,
      { latitude: lat, longitude: lon }
    );
  }

  static locationNotSupported(location: string): BusinessError {
    return new BusinessError(
      `Location not supported by weather service: ${location}`,
      ErrorCode.LOCATION_NOT_SUPPORTED,
      { location }
    );
  }
}