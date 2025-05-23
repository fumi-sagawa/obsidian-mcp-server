import type { AlertsResponse, PointsResponse, ForecastResponse } from './types.js';
import { logger } from '../../lib/logger/index.js';
import { ApiError, SystemError, ErrorCode } from '../../lib/errors/index.js';
import { getConfig } from '../../config/index.js';

async function makeRequest<T>(url: string): Promise<T> {
  const config = getConfig();
  const headers = {
    "User-Agent": config.nwsUserAgent,
    Accept: "application/geo+json",
  };

  const apiLogger = logger.child({ component: 'nws-api', url });
  apiLogger.debug("Making NWS API request");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  try {
    const response = await fetch(url, { 
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      throw ApiError.fromResponse(response, errorBody);
    }
    
    const data = await response.json() as T;
    apiLogger.trace("NWS API request successful", { 
      status: response.status,
      dataSize: JSON.stringify(data).length 
    });
    
    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout',
          ErrorCode.API_TIMEOUT,
          408,
          error,
          { timeout: config.apiTimeout }
        );
      }
      
      throw new SystemError('Network request failed', error, { url });
    }
    
    throw error;
  }
}

async function retryRequest<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  const config = getConfig();
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= config.apiRetryAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      // Don't retry validation errors or 4xx errors (except 429)
      if (error instanceof ApiError && 
          error.statusCode && 
          error.statusCode >= 400 && 
          error.statusCode < 500 &&
          error.statusCode !== 429) {
        throw error;
      }
      
      if (attempt < config.apiRetryAttempts) {
        const delay = config.apiRetryDelay * attempt;
        logger.warn(`Retrying ${context} after ${delay}ms`, {
          attempt,
          maxAttempts: config.apiRetryAttempts,
          error: lastError.message,
        });
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError || new SystemError(`Failed after ${config.apiRetryAttempts} attempts`);
}

export const nwsApi = {
  async getAlerts(stateCode: string): Promise<AlertsResponse> {
    const config = getConfig();
    const url = `${config.nwsApiBaseUrl}/alerts?area=${stateCode}`;
    logger.info("Fetching weather alerts", { stateCode });
    
    return retryRequest(
      () => makeRequest<AlertsResponse>(url),
      `getAlerts(${stateCode})`
    );
  },

  async getPoints(latitude: number, longitude: number): Promise<PointsResponse> {
    const config = getConfig();
    const url = `${config.nwsApiBaseUrl}/points/${latitude.toFixed(4)},${longitude.toFixed(4)}`;
    logger.info("Fetching grid points", { latitude, longitude });
    
    return retryRequest(
      () => makeRequest<PointsResponse>(url),
      `getPoints(${latitude}, ${longitude})`
    );
  },

  async getForecast(forecastUrl: string): Promise<ForecastResponse> {
    logger.info("Fetching forecast data", { forecastUrl });
    
    return retryRequest(
      () => makeRequest<ForecastResponse>(forecastUrl),
      `getForecast(${forecastUrl})`
    );
  },
};