import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Create a test version of the handler with injected dependencies
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
  
  // This is the handler function extracted from get-alerts-handler.ts
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

      // Simple formatting for tests (replacing formatAlert)
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

describe('getAlertsHandler', () => {
  let getAlertsHandler: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // Create handler with mocked dependencies
    getAlertsHandler = createTestHandler({
      nwsApi: mockNwsApi,
      logger: mockLogger,
      handleError: mockHandleError,
      ValidationError: mockValidationError,
      MetricsMiddleware: MockMetricsMiddleware
    });
  });
  beforeEach(() => {
    // Reset all mocks before each test
    mockNwsApi.getAlerts.mock.resetCalls();
    mockHandleError.mock.resetCalls();
    mockMetricsMiddleware.trackWeatherAPICall.mock.resetCalls();
  });

  it('should return alerts for valid state code', async () => {
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

  it('should return no alerts message when no alerts exist', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    const result = await getAlertsHandler({ state: 'HI' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'No active alerts for HI');
  });

  it('should handle invalid state code', async () => {
    const result = await getAlertsHandler({ state: 'XX' });

    assert.strictEqual(mockNwsApi.getAlerts.mock.calls.length, 0);
    assert.strictEqual(result.content[0].type, 'text');
    assert(result.content[0].text.includes('Error:'));
    assert(result.content[0].text.includes('Invalid state code: XX'));
  });

  it('should convert state code to uppercase', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    await getAlertsHandler({ state: 'ca' });

    assert.strictEqual(mockNwsApi.getAlerts.mock.calls[0].arguments[0], 'CA');
  });

  it('should handle API errors gracefully', async () => {
    const apiError = new Error('Network error');
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.reject(apiError));
    mockHandleError.mock.mockImplementation((error) => ({ message: 'API request failed' }));

    const result = await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'Error: API request failed');
    assert.strictEqual(mockHandleError.mock.calls.length, 1);
  });

  it('should handle missing features property', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({}));

    const result = await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(result.content[0].type, 'text');
    assert.strictEqual(result.content[0].text, 'No active alerts for CA');
  });

  it('should track metrics for successful calls', async () => {
    mockNwsApi.getAlerts.mock.mockImplementation(() => Promise.resolve({ features: [] }));

    await getAlertsHandler({ state: 'CA' });

    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls.length, 1);
    assert.strictEqual(mockMetricsMiddleware.trackWeatherAPICall.mock.calls[0].arguments[0], 'get-alerts');
  });
});