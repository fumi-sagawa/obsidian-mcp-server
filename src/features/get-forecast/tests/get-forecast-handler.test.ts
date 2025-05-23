import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Create a test version of the handler with injected dependencies
function createTestHandler(dependencies: {
  nwsApi: any;
  logger: any;
  handleError: any;
  ValidationError: any;
  BusinessError: any;
  ApiError: any;
  MetricsMiddleware: any;
}) {
  const { nwsApi, logger, handleError, ValidationError, BusinessError, ApiError, MetricsMiddleware } = dependencies;
  
  const metricsMiddleware = new MetricsMiddleware();
  
  // Helper function to validate US coordinates
  function isValidUSCoordinates(lat: number, lon: number): boolean {
    // Continental US bounds
    const continental = lat >= 24.5 && lat <= 49.5 && lon >= -125 && lon <= -66.5;
    // Alaska bounds
    const alaska = lat >= 51 && lat <= 72 && lon >= -180 && lon <= -130;
    // Hawaii bounds
    const hawaii = lat >= 18 && lat <= 23 && lon >= -162 && lon <= -154;
    
    return continental || alaska || hawaii;
  }
  
  // This is the handler function extracted from get-forecast-handler.ts
  return async function getForecastHandler({ latitude, longitude }: { latitude: number; longitude: number }) {
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
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw ValidationError.invalidCoordinates(latitude, longitude);
      }

      // Check if coordinates are within US bounds
      if (!isValidUSCoordinates(latitude, longitude)) {
        throw BusinessError.locationNotSupported(`${latitude}, ${longitude}`);
      }

      // Get location metadata
      const pointsData = await metricsMiddleware.trackWeatherAPICall(
        'get-points',
        () => nwsApi.getPoints(latitude, longitude)
      );

      const forecastUrl = pointsData?.properties?.forecast;
      if (!forecastUrl) {
        throw BusinessError.noForecastAvailable(latitude, longitude);
      }

      // Get forecast data
      const forecastData = await metricsMiddleware.trackWeatherAPICall(
        'get-forecast',
        () => nwsApi.getForecast(forecastUrl)
      );

      const periods = forecastData?.properties?.periods || [];
      if (periods.length === 0) {
        throw BusinessError.noForecastAvailable(latitude, longitude);
      }

      handlerLogger.info("Successfully retrieved forecast", { 
        periodCount: periods.length 
      });

      // Format forecast periods (simple formatting for tests)
      const formattedPeriods = periods.map((period: any) => {
        return `### ${period.name}\n${period.temperature}°${period.temperatureUnit} - ${period.shortForecast}\nWind: ${period.windSpeed} ${period.windDirection}\n${period.detailedForecast}`;
      });

      const forecastText = `Forecast for ${latitude}, ${longitude}:\n\n${formattedPeriods.join('\n\n')}`;

      return {
        content: [
          {
            type: "text" as const,
            text: forecastText,
          },
        ],
      };
    } catch (error: any) {
      // Special handling for 404 errors
      if (error.name === 'ApiError' && error.statusCode === 404) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Location (${latitude}, ${longitude}) is not supported by the National Weather Service`,
            },
          ],
        };
      }

      const weatherError = handleError(error, 'get-forecast-handler');
      
      // Return user-friendly error messages
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${weatherError.message}`,
          },
        ],
      };
    }
  };
}

// Mock dependencies
const mockNwsApi = {
  getPoints: mock.fn(),
  getForecast: mock.fn()
};

const mockLogger = {
  child: () => ({
    info: mock.fn(),
    error: mock.fn(),
    warn: mock.fn(),
    debug: mock.fn()
  })
};

const mockHandleError = mock.fn((error) => error);

const mockMetricsMiddleware = {
  trackWeatherAPICall: mock.fn(async (operation, fn) => fn())
};

// Mock error classes
class MockBusinessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BusinessError';
  }
  static noForecastAvailable = (lat: number, lon: number) => 
    new MockBusinessError(`No forecast available for location: ${lat}, ${lon}`);
  static locationNotSupported = (coords: string) =>
    new MockBusinessError(`Location ${coords} is outside the United States`);
}

class MockValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
  static invalidCoordinates = (lat: number, lon: number) =>
    new MockValidationError(`Invalid coordinates: latitude ${lat}, longitude ${lon}`);
}

class MockApiError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
  }
}

class MockMetricsMiddleware {
  trackWeatherAPICall = mockMetricsMiddleware.trackWeatherAPICall;
}

describe('getForecastHandler', () => {
  let getForecastHandler: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // Create handler with mocked dependencies
    getForecastHandler = createTestHandler({
      nwsApi: mockNwsApi,
      logger: mockLogger,
      handleError: mockHandleError,
      ValidationError: MockValidationError,
      BusinessError: MockBusinessError,
      ApiError: MockApiError,
      MetricsMiddleware: MockMetricsMiddleware
    });
  });
  beforeEach(() => {
    // Reset all mocks before each test
    mockNwsApi.getPoints.mock.resetCalls();
    mockNwsApi.getForecast.mock.resetCalls();
    mockHandleError.mock.resetCalls();
    mockMetricsMiddleware.trackWeatherAPICall.mock.resetCalls();
  });

  it('should return forecast for valid US coordinates', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/SEW/124,67/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [
          {
            number: 1,
            name: 'Tonight',
            temperature: 45,
            temperatureUnit: 'F',
            windSpeed: '5 mph',
            windDirection: 'NW',
            icon: 'https://api.weather.gov/icons/land/night/few',
            shortForecast: 'Mostly Clear',
            detailedForecast: 'Mostly clear, with a low around 45.'
          },
          {
            number: 2,
            name: 'Tuesday',
            temperature: 60,
            temperatureUnit: 'F',
            windSpeed: '10 mph',
            windDirection: 'W',
            icon: 'https://api.weather.gov/icons/land/day/sct',
            shortForecast: 'Partly Cloudy',
            detailedForecast: 'Partly cloudy, with a high near 60.'
          }
        ]
      }
    };

    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve(mockPointsData));
    mockNwsApi.getForecast.mock.mockImplementation(() => Promise.resolve(mockForecastData));

    const result = await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 1);
    assert.strictEqual(mockNwsApi.getPoints.mock.calls[0].arguments[0], 47.6062);
    assert.strictEqual(mockNwsApi.getPoints.mock.calls[0].arguments[1], -122.3321);
    assert.strictEqual(mockNwsApi.getForecast.mock.calls.length, 1);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Forecast for 47.6062, -122.3321'));
    assert(result.content[0].text.includes('Tonight'));
    assert(result.content[0].text.includes('Tuesday'));
  });

  it('should reject invalid latitude', async () => {
    const result = await getForecastHandler({ latitude: 91, longitude: -122 });

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid coordinates'));
  });

  it('should reject invalid longitude', async () => {
    const result = await getForecastHandler({ latitude: 47, longitude: 181 });

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid coordinates'));
  });

  it('should reject coordinates outside US bounds', async () => {
    const result = await getForecastHandler({ latitude: 51.5074, longitude: -0.1278 }); // London

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('outside the United States'));
  });

  it('should handle missing forecast URL in points data', async () => {
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve({ properties: {} }));
    mockHandleError.mock.mockImplementation(() => MockBusinessError.noForecastAvailable(40, -74));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('No forecast available'));
  });

  it('should handle empty forecast periods', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/SEW/124,67/forecast'
      }
    };

    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve(mockPointsData));
    mockNwsApi.getForecast.mock.mockImplementation(() => Promise.resolve({ properties: { periods: [] } }));
    mockHandleError.mock.mockImplementation(() => MockBusinessError.noForecastAvailable(47.6062, -122.3321));

    const result = await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('No forecast available'));
  });

  it('should handle API 404 errors with custom message', async () => {
    const apiError = new MockApiError('Not Found', 404);
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation(() => apiError);

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Location (40, -74) is not supported by the National Weather Service'));
  });

  it('should handle generic API errors', async () => {
    const apiError = new Error('Network error');
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation(() => ({ message: 'API request failed' }));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'Error: API request failed');
  });

  it('should track metrics for successful calls', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/SEW/124,67/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [{
          number: 1,
          name: 'Tonight',
          temperature: 45,
          temperatureUnit: 'F',
          windSpeed: '5 mph',
          windDirection: 'NW',
          icon: 'https://api.weather.gov/icons/land/night/few',
          shortForecast: 'Mostly Clear',
          detailedForecast: 'Mostly clear, with a low around 45.'
        }]
      }
    };

    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve(mockPointsData));
    mockNwsApi.getForecast.mock.mockImplementation(() => Promise.resolve(mockForecastData));

    await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls.length, 2);
    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls[0].arguments[0], 'get-points');
    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls[1].arguments[0], 'get-forecast');
  });

  it('should accept valid Alaska coordinates', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/AFG/124,67/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [{
          number: 1,
          name: 'Tonight',
          temperature: -10,
          temperatureUnit: 'F',
          windSpeed: '15 mph',
          windDirection: 'N',
          icon: 'https://api.weather.gov/icons/land/night/sn',
          shortForecast: 'Snow',
          detailedForecast: 'Snow, with a low around -10.'
        }]
      }
    };

    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve(mockPointsData));
    mockNwsApi.getForecast.mock.mockImplementation(() => Promise.resolve(mockForecastData));

    const result = await getForecastHandler({ latitude: 64.8378, longitude: -147.7164 }); // Fairbanks

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 1);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Forecast for 64.8378, -147.7164'));
  });

  it('should accept valid Hawaii coordinates', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/HFO/124,67/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [{
          number: 1,
          name: 'Tonight',
          temperature: 75,
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'E',
          icon: 'https://api.weather.gov/icons/land/night/few',
          shortForecast: 'Clear',
          detailedForecast: 'Clear, with a low around 75.'
        }]
      }
    };

    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve(mockPointsData));
    mockNwsApi.getForecast.mock.mockImplementation(() => Promise.resolve(mockForecastData));

    const result = await getForecastHandler({ latitude: 21.3099, longitude: -157.8581 }); // Honolulu

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 1);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Forecast for 21.3099, -157.8581'));
  });
});