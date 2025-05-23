import { nwsApi } from '../../shared/api/index.js';
import { formatAlert } from './format-alert.js';

export async function getAlertsHandler({ state }: { state: string }) {
  const stateCode = state.toUpperCase();
  const alertsData = await nwsApi.getAlerts(stateCode);

  if (!alertsData) {
    return {
      content: [
        {
          type: "text" as const,
          text: "Failed to retrieve alerts data",
        },
      ],
    };
  }

  const features = alertsData.features || [];
  if (features.length === 0) {
    return {
      content: [
        {
          type: "text" as const,
          text: `No active alerts for ${stateCode}`,
        },
      ],
    };
  }

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
}