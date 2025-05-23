import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAlertsHandler, alertsSchema } from '../features/get-alerts/index.js';
import { getForecastHandler, forecastSchema } from '../features/get-forecast/index.js';

const server = new McpServer({
  name: "weather",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

server.tool(
  "get-alerts",
  "Get weather alerts for a state",
  alertsSchema,
  getAlertsHandler
);

server.tool(
  "get-forecast",
  "Get weather forecast for a location",
  forecastSchema,
  getForecastHandler
);

export async function startServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Weather MCP Server running on stdio");
}