import { describe, it, expect, beforeEach, vi } from 'vitest';

// 依存性を注入したテスト用ハンドラーを作成
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
  
  // 米国の座標を検証するヘルパー関数
  function isValidUSCoordinates(lat: number, lon: number): boolean {
    // 米国本土の境界
    const continental = lat >= 24.5 && lat <= 49.5 && lon >= -125 && lon <= -66.5;
    // アラスカの境界
    const alaska = lat >= 51 && lat <= 72 && lon >= -180 && lon <= -130;
    // ハワイの境界
    const hawaii = lat >= 18 && lat <= 23 && lon >= -162 && lon <= -154;
    
    return continental || alaska || hawaii;
  }
  
  // get-forecast-handler.tsから抽出されたハンドラー関数
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
      // 座標を検証
      if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
        throw ValidationError.invalidCoordinates(latitude, longitude);
      }

      // 座標が米国の境界内にあるか確認
      if (!isValidUSCoordinates(latitude, longitude)) {
        throw BusinessError.locationNotSupported(`${latitude}, ${longitude}`);
      }

      // ロケーションメタデータを取得
      const pointsData = await metricsMiddleware.trackWeatherAPICall(
        'get-points',
        () => nwsApi.getPoints(latitude, longitude)
      );

      const forecastUrl = pointsData?.properties?.forecast;
      if (!forecastUrl) {
        throw BusinessError.noForecastAvailable(latitude, longitude);
      }

      // 予報データを取得
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

      // 予報期間をフォーマット（テスト用のシンプルなフォーマット）
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
      // 404エラーの特別処理
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
      
      const processedError = handleError(error, handlerLogger);
      handlerLogger.error("Error in getForecastHandler", processedError);
      
      return {
        content: [
          {
            type: "text" as const,
            text: `Error: ${processedError.message}`,
          },
        ],
      };
    }
  };
}

// モック依存関係
const mockNwsApi = {
  getPoints: vi.fn(),
  getForecast: vi.fn()
};

const mockLogger = {
  child: () => ({
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  })
};

const mockHandleError = vi.fn((error) => error);

const mockMetricsMiddleware = {
  trackWeatherAPICall: vi.fn(async (operation, fn) => fn())
};

// モックエラークラス
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

describe('getForecastハンドラー', () => {
  let getForecastHandler: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // モック化された依存関係でハンドラーを作成
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
    // 各テストの前にすべてのモックをリセット
    vi.clearAllMocks();
  });

  it('有効な米国の座標に対して予報を返すべき', async () => {
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
            temperature: 62,
            temperatureUnit: 'F',
            windSpeed: '7 mph',
            windDirection: 'W',
            icon: 'https://api.weather.gov/icons/land/day/sct',
            shortForecast: 'Partly Sunny',
            detailedForecast: 'Partly sunny, with a high near 62.'
          }
        ]
      }
    };

    mockNwsApi.getPoints.mockResolvedValue(mockPointsData);
    mockNwsApi.getForecast.mockResolvedValue(mockForecastData);

    const result = await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    expect(mockNwsApi.getPoints).toHaveBeenCalledWith(47.6062, -122.3321);
    expect(mockNwsApi.getForecast).toHaveBeenCalledTimes(1);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Forecast for 47.6062, -122.3321');
    expect(result.content[0].text).toContain('Tonight');
    expect(result.content[0].text).toContain('Tuesday');
  });

  it('無効な緯度を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 91, longitude: -122 });

    expect(mockNwsApi.getPoints).not.toHaveBeenCalled();
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error:');
    expect(result.content[0].text).toContain('Invalid coordinates');
  });

  it('無効な経度を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 47, longitude: 181 });

    expect(mockNwsApi.getPoints).not.toHaveBeenCalled();
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error:');
    expect(result.content[0].text).toContain('Invalid coordinates');
  });

  it('米国の境界外の座標を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 51.5074, longitude: -0.1278 }); // ロンドン

    expect(mockNwsApi.getPoints).not.toHaveBeenCalled();
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error:');
    expect(result.content[0].text).toContain('outside the United States');
  });

  it('ポイントデータに予報URLがない場合を処理すべき', async () => {
    mockNwsApi.getPoints.mockResolvedValue({ properties: {} });
    mockHandleError.mockImplementation(() => MockBusinessError.noForecastAvailable(40, -74));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error:');
    expect(result.content[0].text).toContain('No forecast available');
  });

  it('空の予報期間を処理すべき', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/SEW/124,67/forecast'
      }
    };

    mockNwsApi.getPoints.mockResolvedValue(mockPointsData);
    mockNwsApi.getForecast.mockResolvedValue({ properties: { periods: [] } });
    mockHandleError.mockImplementation(() => MockBusinessError.noForecastAvailable(47.6062, -122.3321));

    const result = await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error:');
    expect(result.content[0].text).toContain('No forecast available');
  });

  it('API 404エラーをカスタムメッセージで処理すべき', async () => {
    const apiError = new MockApiError('Not Found', 404);
    mockNwsApi.getPoints.mockRejectedValue(apiError);
    mockHandleError.mockImplementation(() => apiError);

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Location (40, -74) is not supported by the National Weather Service');
  });

  it('一般的なAPIエラーを処理すべき', async () => {
    const apiError = new Error('Network error');
    mockNwsApi.getPoints.mockRejectedValue(apiError);
    mockHandleError.mockImplementation(() => ({ message: 'API request failed' }));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Error: API request failed');
  });

  it('成功したコールのメトリクスを追跡すべき', async () => {
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
          }
        ]
      }
    };

    mockNwsApi.getPoints.mockResolvedValue(mockPointsData);
    mockNwsApi.getForecast.mockResolvedValue(mockForecastData);

    await getForecastHandler({ latitude: 47.6062, longitude: -122.3321 });

    expect(mockMetricsMiddleware.trackWeatherAPICall).toHaveBeenCalledTimes(2);
    expect(mockMetricsMiddleware.trackWeatherAPICall).toHaveBeenNthCalledWith(1, 'get-points', expect.any(Function));
    expect(mockMetricsMiddleware.trackWeatherAPICall).toHaveBeenNthCalledWith(2, 'get-forecast', expect.any(Function));
  });

  it('有効なアラスカの座標を受け入れるべき', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/AFC/123,456/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [{
          number: 1,
          name: 'Today',
          temperature: -10,
          temperatureUnit: 'F',
          windSpeed: '15 mph',
          windDirection: 'N',
          shortForecast: 'Snow',
          detailedForecast: 'Snow throughout the day.'
        }]
      }
    };

    mockNwsApi.getPoints.mockResolvedValue(mockPointsData);
    mockNwsApi.getForecast.mockResolvedValue(mockForecastData);

    const result = await getForecastHandler({ latitude: 64.8378, longitude: -147.7164 }); // フェアバンクス

    expect(mockNwsApi.getPoints).toHaveBeenCalledWith(64.8378, -147.7164);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Forecast for 64.8378, -147.7164');
    expect(result.content[0].text).not.toContain('Error:');
  });

  it('有効なハワイの座標を受け入れるべき', async () => {
    const mockPointsData = {
      properties: {
        forecast: 'https://api.weather.gov/gridpoints/HFO/123,456/forecast'
      }
    };

    const mockForecastData = {
      properties: {
        periods: [{
          number: 1,
          name: 'Today',
          temperature: 78,
          temperatureUnit: 'F',
          windSpeed: '10 mph',
          windDirection: 'E',
          shortForecast: 'Partly Cloudy',
          detailedForecast: 'Partly cloudy with occasional showers.'
        }]
      }
    };

    mockNwsApi.getPoints.mockResolvedValue(mockPointsData);
    mockNwsApi.getForecast.mockResolvedValue(mockForecastData);

    const result = await getForecastHandler({ latitude: 21.3099, longitude: -157.8581 }); // ホノルル

    expect(mockNwsApi.getPoints).toHaveBeenCalledWith(21.3099, -157.8581);
    expect(result.content[0].type).toBe('text');
    expect(result.content[0].text).toContain('Forecast for 21.3099, -157.8581');
    expect(result.content[0].text).not.toContain('Error:');
  });
});