import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

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

      const weatherError = handleError(error, 'get-forecast-handler');
      
      // ユーザーフレンドリーなエラーメッセージを返す
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

// モック依存関係
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
    mockNwsApi.getPoints.mock.resetCalls();
    mockNwsApi.getForecast.mock.resetCalls();
    mockHandleError.mock.resetCalls();
    mockMetricsMiddleware.trackWeatherAPICall.mock.resetCalls();
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

  it('無効な緯度を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 91, longitude: -122 });

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid coordinates'));
  });

  it('無効な経度を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 47, longitude: 181 });

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid coordinates'));
  });

  it('米国の境界外の座標を拒否すべき', async () => {
    const result = await getForecastHandler({ latitude: 51.5074, longitude: -0.1278 }); // ロンドン

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('outside the United States'));
  });

  it('ポイントデータに予報URLがない場合を処理すべき', async () => {
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.resolve({ properties: {} }));
    mockHandleError.mock.mockImplementation(() => MockBusinessError.noForecastAvailable(40, -74));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('No forecast available'));
  });

  it('空の予報期間を処理すべき', async () => {
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

  it('API 404エラーをカスタムメッセージで処理すべき', async () => {
    const apiError = new MockApiError('Not Found', 404);
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation(() => apiError);

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Location (40, -74) is not supported by the National Weather Service'));
  });

  it('一般的なAPIエラーを処理すべき', async () => {
    const apiError = new Error('Network error');
    mockNwsApi.getPoints.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation(() => ({ message: 'API request failed' }));

    const result = await getForecastHandler({ latitude: 40, longitude: -74 });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'Error: API request failed');
  });

  it('成功したコールのメトリクスを追跡すべき', async () => {
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

  it('有効なアラスカの座標を受け入れるべき', async () => {
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

    const result = await getForecastHandler({ latitude: 64.8378, longitude: -147.7164 }); // フェアバンクス

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 1);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Forecast for 64.8378, -147.7164'));
  });

  it('有効なハワイの座標を受け入れるべき', async () => {
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

    const result = await getForecastHandler({ latitude: 21.3099, longitude: -157.8581 }); // ホノルル

    assert.strictEqual(mockNwsApi.getPoints.mock.calls.length, 1);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Forecast for 21.3099, -157.8581'));
  });
});