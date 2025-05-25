import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getAlertsHandler, alertsSchema } from '../features/get-alerts/index.js';
import { getForecastHandler, forecastSchema } from '../features/get-forecast/index.js';
import { handleHealthCheck, HealthCheckSchema } from '../features/health-check/index.js';
import { getServerStatusHandler, getServerStatusArgsSchema } from '../features/get-server-status/index.js';
import { getActiveFileHandler, getActiveFileSchema } from '../features/get-active-file/index.js';
import { updateActiveFileHandler, updateActiveFileTool } from '../features/update-active-file/index.js';
import { appendToActiveFileHandler, appendToActiveFileSchema } from '../features/append-to-active-file/index.js';
import { insertIntoActiveFileHandler, insertIntoActiveFileSchema } from '../features/insert-into-active-file/index.js';
import { insertIntoFileHandler, insertIntoFileSchema } from '../features/insert-into-file/index.js';
import { deleteActiveFileHandler, deleteActiveFileSchema } from '../features/delete-active-file/index.js';
import { deletePeriodicNoteHandler, deletePeriodicNoteToolConfig } from '../features/delete-periodic-note/index.js';
import { listCommandsHandler, ListCommandsInputSchema } from '../features/list-commands/index.js';
import { executeCommandHandler, executeCommandArgsSchema } from '../features/execute-command/index.js';
import { openFileHandler, openFileSchema } from '../features/open-file/index.js';
import { getPeriodicNoteHandler, getPeriodicNoteSchema } from '../features/get-periodic-note/index.js';
import { appendToPeriodicNoteHandler, appendToPeriodicNoteTool } from '../features/append-to-periodic-note/index.js';
import { updatePeriodicNoteHandler, updatePeriodicNoteSchema } from '../features/update-periodic-note/index.js';
import { appendToFileHandler, appendToFileRequestSchema } from '../features/append-to-file/index.js';
import { simpleSearchHandler } from '../features/simple-search/index.js';
import { simpleSearchRequestSchema } from '../features/simple-search/schema.js';
import { createOrUpdateFileHandler, createOrUpdateFileSchema } from '../features/create-or-update-file/index.js';
import { deleteFileHandler, deleteFileSchema } from '../features/delete-file/index.js';
import { getFileHandler, GetFileRequestSchema } from '../features/get-file/index.js';
import { listDirectoryHandler, listDirectorySchema } from '../features/list-directory/index.js';
import { listVaultFilesHandler, listVaultFilesTool } from '../features/list-vault-files/index.js';
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

// Weather関連ツールは削除（Obsidian APIには含まれないため）

// ========== サーバー管理系 ==========
server.tool(
  "check_service_health",
  "Check health status of Obsidian service and connections",
  HealthCheckSchema,
  wrapHandler(handleHealthCheck, 'check_service_health')
);
appLogger.debug("Registered tool: check_service_health");

server.tool(
  "get_server_status",
  "Get Obsidian server connection status and version info",
  getServerStatusArgsSchema,
  wrapHandler(getServerStatusHandler, 'get_server_status')
);
appLogger.debug("Registered tool: get_server_status");

// ========== アクティブファイル操作系 ==========
server.tool(
  "get_active_file",
  "Get content and metadata of currently active file",
  getActiveFileSchema,
  wrapHandler(getActiveFileHandler, 'get_active_file')
);
appLogger.debug("Registered tool: get_active_file");

server.tool(
  "update_active_file",
  "Replace entire content of currently active file",
  updateActiveFileTool.inputSchema.shape,
  wrapHandler(updateActiveFileHandler, 'update_active_file')
);
appLogger.debug("Registered tool: update_active_file");

server.tool(
  "append_to_active_file",
  "Append text to end of currently active file",
  appendToActiveFileSchema.shape,
  wrapHandler(appendToActiveFileHandler, 'append_to_active_file')
);
appLogger.debug("Registered tool: append_to_active_file");

server.tool(
  "insert_to_active_file",
  "Insert text at specific location in active file",
  insertIntoActiveFileSchema.shape,
  wrapHandler(insertIntoActiveFileHandler, 'insert_to_active_file')
);
appLogger.debug("Registered tool: insert_to_active_file");

server.tool(
  "delete_active_file",
  "Delete currently active file permanently",
  deleteActiveFileSchema.shape,
  wrapHandler(deleteActiveFileHandler, 'delete_active_file')
);
appLogger.debug("Registered tool: delete_active_file");

// ========== ファイル操作系 ==========
server.tool(
  "get_file_content",
  "Get content and metadata of specified file",
  GetFileRequestSchema.shape,
  wrapHandler(getFileHandler, 'get_file_content')
);
appLogger.debug("Registered tool: get_file_content");

server.tool(
  "create_or_update_file",
  "Create new file or replace content of existing file",
  createOrUpdateFileSchema.shape,
  wrapHandler(createOrUpdateFileHandler, 'create_or_update_file')
);
appLogger.debug("Registered tool: create_or_update_file");

server.tool(
  "append_to_file",
  "Append text to end of specified file",
  appendToFileRequestSchema.shape,
  wrapHandler(appendToFileHandler, 'append_to_file')
);
appLogger.debug("Registered tool: append_to_file");

server.tool(
  "insert_to_file",
  "Insert text at specific location in file",
  insertIntoFileSchema.shape,
  wrapHandler(insertIntoFileHandler, 'insert_to_file')
);
appLogger.debug("Registered tool: insert_to_file");

server.tool(
  "delete_file",
  "Delete specified file permanently",
  deleteFileSchema.shape,
  wrapHandler(deleteFileHandler, 'delete_file')
);
appLogger.debug("Registered tool: delete_file");

server.tool(
  "open_file",
  "Open specified file in Obsidian editor",
  openFileSchema.shape,
  wrapHandler(openFileHandler, 'open_file')
);
appLogger.debug("Registered tool: open_file");

// ========== 周期ノート系 ==========
server.tool(
  "get_periodic_note",
  "Get content of daily, weekly, monthly, quarterly or yearly note",
  getPeriodicNoteSchema.shape,
  wrapHandler(getPeriodicNoteHandler, 'get_periodic_note')
);
appLogger.debug("Registered tool: get_periodic_note");

server.tool(
  "append_to_periodic_note",
  "Append text to periodic note for specified date",
  appendToPeriodicNoteTool.inputSchema.shape,
  wrapHandler(appendToPeriodicNoteHandler, 'append_to_periodic_note')
);
appLogger.debug("Registered tool: append_to_periodic_note");

server.tool(
  "update_periodic_note",
  "Replace content of periodic note for specified date",
  updatePeriodicNoteSchema.shape,
  wrapHandler(updatePeriodicNoteHandler, 'update_periodic_note')
);
appLogger.debug("Registered tool: update_periodic_note");

server.tool(
  "delete_periodic_note",
  "Delete periodic note for specified date",
  deletePeriodicNoteToolConfig.inputSchema.shape,
  wrapHandler(deletePeriodicNoteHandler, 'delete_periodic_note')
);
appLogger.debug("Registered tool: delete_periodic_note");

// ========== 検索・一覧系 ==========
server.tool(
  "search_notes",
  "Search notes by text query across entire vault",
  simpleSearchRequestSchema.shape,
  wrapHandler(simpleSearchHandler, 'search_notes')
);
appLogger.debug("Registered tool: search_notes");

server.tool(
  "list_directory",
  "List files and folders in specified directory",
  listDirectorySchema.shape,
  wrapHandler(listDirectoryHandler, 'list_directory')
);
appLogger.debug("Registered tool: list_directory");

server.tool(
  "list_vault_files",
  "List all files in vault with optional path filter",
  listVaultFilesTool.inputSchema.shape,
  wrapHandler(listVaultFilesHandler, 'list_vault_files')
);
appLogger.debug("Registered tool: list_vault_files");

// ========== コマンド実行系 ==========
server.tool(
  "list_commands",
  "List all available Obsidian commands",
  ListCommandsInputSchema,
  wrapHandler(listCommandsHandler, 'list_commands')
);
appLogger.debug("Registered tool: list_commands");

server.tool(
  "execute_command",
  "Execute Obsidian command by ID",
  executeCommandArgsSchema.shape,
  wrapHandler(executeCommandHandler, 'execute_command')
);
appLogger.debug("Registered tool: execute_command");

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