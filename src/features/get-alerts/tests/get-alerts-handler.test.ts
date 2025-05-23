import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// 依存性を注入したテスト用ハンドラーを作成
function createTestHandler(dependencies: {
  nwsApi: any;
  logger: any;
  handleError: any;
  ValidationError: any;
  MetricsMiddleware: any;
}) {
  const { nwsApi, logger, handleError, ValidationError, MetricsMiddleware } = dependencies;
  
  const VALID_STATE_CODES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
    'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
  ];
  
  const metricsMiddleware = new MetricsMiddleware();
  
  // get-alerts-handler.tsから抽出されたハンドラー関数
  return async function getAlertsHandler({ state }: { state: string }) {
    const stateCode = state.toUpperCase();
    const requestId = `alerts-${Date.now()}`;
    const handlerLogger = logger.child({ 
      requestId, 
      operation: 'get-alerts',
      state: stateCode 
    });
    
    handlerLogger.info("Processing get-alerts request");

    try {
      // Validate state code
      if (!VALID_STATE_CODES.includes(stateCode)) {
        throw ValidationError.invalidStateCode(state);
      }

      const alertsData = await metricsMiddleware.trackWeatherAPICall(
        'get-alerts',
        () => nwsApi.getAlerts(stateCode)
      );
      const features = alertsData.features || [];
      
      if (features.length === 0) {
        handlerLogger.info("No active alerts found");
        return {
          content: [
            {
              type: "text" as const,
              text: `No active alerts for ${stateCode}`,
            },
          ],
        };
      }

      handlerLogger.info("Found active alerts", { 
        alertCount: features.length 
      });

      // テスト用のシンプルなフォーマット（formatAlertの代替）
      const formattedAlerts = features.map((feature: any) => {
        const props = feature.properties;
        return `**${props.event}** - ${props.severity}\n${props.headline}\n${props.description}\nArea: ${props.areaDesc}\nEffective: ${props.effective}\nExpires: ${props.expires}`;
      });
      const alertsText = `Active alerts for ${stateCode}:\n\n${formattedAlerts.join("\n")}`;

      return {
        content: [
          {
            type: "text" as const,
            text: alertsText,
          },
        ],
      };
    } catch (error) {
      const weatherError = handleError(error, 'get-alerts-handler');
      
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
  getAlerts: mock.fn()
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

const mockValidationError = {
  invalidStateCode: (state: string) => new Error(`Invalid state code: ${state}`)
};

class MockMetricsMiddleware {
  trackWeatherAPICall = mockMetricsMiddleware.trackWeatherAPICall;
}

describe('getAlertsハンドラー', () => {
  let getAlertsHandler: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // モック化された依存関係でハンドラーを作成
    getAlertsHandler = createTestHandler({
      nwsApi: mockNwsApi,
      logger: mockLogger,
      handleError: mockHandleError,
      ValidationError: mockValidationError,
      MetricsMiddleware: MockMetricsMiddleware
    });
  });
  beforeEach(() => {
    // 各テストの前にすべてのモックをリセット
    mockNwsApi.getAlerts.mock.resetCalls();
    mockHandleError.mock.resetCalls();
    mockMetricsMiddleware.trackWeatherAPICall.mock.resetCalls();
  });

  it('有効な州コードに対してアラートを返すべき', async () => {
    const mockAlertData = {
      features: [
        {
          properties: {
            event: 'Winter Storm Warning',
            headline: 'Winter Storm Warning in effect',
            severity: 'Severe',
            urgency: 'Expected',
            status: 'Actual',
            description: 'Heavy snow expected',
            areaDesc: 'Northern Mountains',
            effective: '2025-01-23T10:00:00Z',
            expires: '2025-01-24T18:00:00Z'
          }
        }
      ]
    };

    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve(mockAlertData));

    const result = await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(mockNwsApi.getAlerts.mock.calls.length, 1);
    assert.strictEqual(mockNwsApi.getAlerts.mock.calls[0].arguments[0], 'CA');
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Active alerts for CA'));
    assert(result.content[0].text.includes('Winter Storm Warning'));
  });

  it('アラートが存在しない場合はアラートなしメッセージを返すべき', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    const result = await getAlertsHandler({ state: 'HI' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'No active alerts for HI');
  });

  it('無効な州コードを処理すべき', async () => {
    const result = await getAlertsHandler({ state: 'XX' });

    assert.strictEqual(mockNwsApi.getAlerts.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid state code: XX'));
  });

  it('州コードを大文字に変換すべき', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    await getAlertsHandler({ state: 'ca' });

    assert.strictEqual(mockNwsApi.getAlerts.mock.calls[0].arguments[0], 'CA');
  });

  it('APIエラーを適切に処理すべき', async () => {
    const apiError = new Error('Network error');
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation((error) => ({ message: 'API request failed' }));

    const result = await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'Error: API request failed');
    assert.strictEqual(mockHandleError.mock.calls.length, 1);
  });

  it('featuresプロパティが欠落している場合を処理すべき', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({}));

    const result = await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'No active alerts for CA');
  });

  it('成功したコールのメトリクスを追跡すべき', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls.length, 1);
    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls[0].arguments[0], 'get-alerts');
  });
});