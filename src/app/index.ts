import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAlertsHandler, alertsSchema } from '../features/get-alerts/index.js';
import { getForecastHandler, forecastSchema } from '../features/get-forecast/index.js';
import { handleHealthCheck, HealthCheckSchema } from '../features/health-check/index.js';
import { getServerStatusHandler, getServerStatusArgsSchema } from '../features/get-server-status/index.js';
import { getActiveFileHandler, getActiveFileSchema } from '../features/get-active-file/index.js';
import { logger, handleError, getConfig, MetricsMiddleware } from '../shared/index.js';

const config = getConfig();

const server = new McpServer({
  name: "obsidian-mcp-server",
  version: "1.0.0",
  capabilities: {
    resources: {},
    tools: {},
  },
});

const appLogger = logger.child({ component: 'app' });
const metricsMiddleware = new MetricsMiddleware(config.slowOperationThreshold || 1000);

appLogger.info("Initializing Obsidian MCP Server", { 
  name: "obsidian-mcp-server", 
  version: "1.0.0",
  config: {
    logLevel: config.logLevel,
    debugMode: config.debugMode,
    apiTimeout: config.apiTimeout,
    apiRetryAttempts: config.apiRetryAttempts,
  }
});

// Wrap handlers with error boundary and metrics
const wrapHandler = <T extends (...args: any[]) => any>(
  handler: T,
  toolName: string
): T => {
  return (async (...args: Parameters<T>) => {
    return metricsMiddleware.trackRequest(toolName, async () => {
      try {
        return await handler(...args);
      } catch (error) {
        const obsidianError = handleError(error, `tool-${toolName}`);
        
        // Log the error details
        appLogger.error(`Tool execution failed: ${toolName}`, obsidianError);
        
        // Return error response to MCP client
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${obsidianError.message}`,
            },
          ],
        };
      }
    });
  }) as T;
};

server.tool(
  "get-alerts",
  "Get weather alerts for a state",
  alertsSchema,
  wrapHandler(getAlertsHandler, 'get-alerts')
);
appLogger.debug("Registered tool: get-alerts");

server.tool(
  "get-forecast",
  "Get weather forecast for a location",
  forecastSchema,
  wrapHandler(getForecastHandler, 'get-forecast')
);
appLogger.debug("Registered tool: get-forecast");

server.tool(
  "health-check",
  "Check the health status of the weather service",
  HealthCheckSchema,
  wrapHandler(handleHealthCheck, 'health-check')
);
appLogger.debug("Registered tool: health-check");

server.tool(
  "get-server-status",
  "Get Obsidian server status and version information",
  getServerStatusArgsSchema,
  wrapHandler(getServerStatusHandler, 'get-server-status')
);
appLogger.debug("Registered tool: get-server-status");

server.tool(
  "get-active-file",
  "Get the currently active file in Obsidian",
  getActiveFileSchema,
  wrapHandler(getActiveFileHandler, 'get-active-file')
);
appLogger.debug("Registered tool: get-active-file");

// Add graceful shutdown
process.on('SIGINT', async () => {
  appLogger.info('Received SIGINT, shutting down gracefully');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  appLogger.info('Received SIGTERM, shutting down gracefully');
  process.exit(0);
});

export async function startServer() {
  try {
    const transport = new StdioServerTransport();
    
    // Log transport events in debug mode
    if (config.debugMode) {
      // StdioServerTransport doesn't expose onmessage directly
      // We'll add message logging through other means if needed
      appLogger.debug('Debug mode enabled - additional logging active');
    }
    
    await server.connect(transport);
    appLogger.info("Obsidian MCP Server running on stdio", {
      pid: process.pid,
      nodeVersion: process.version,
    });
  } catch (error) {
    const obsidianError = handleError(error, 'server-startup');
    appLogger.error("Failed to start server", obsidianError);
    throw obsidianError;
  }
}