import { nwsApi, logger, handleError, BusinessError, ValidationError, MetricsMiddleware } from '../../shared/index.js';
import { formatAlert } from './format-alert.js';

const VALID_STATE_CODES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY',
  'DC', 'PR', 'VI', 'GU', 'AS', 'MP'
];

const metricsMiddleware = new MetricsMiddleware();

export async function getAlertsHandler({ state }: { state: string }) {
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

    const formattedAlerts = features.map(formatAlert);
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
}