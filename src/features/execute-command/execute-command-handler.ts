import type { CommandExecutionRequest, CommandExecutionResponse } from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';

const handlerLogger = logger.child({ feature: 'execute-command' });

export interface CommandExecutionResult {
  success: boolean;
  data?: CommandExecutionResponse;
  error?: {
    errorCode: number;
    message: string;
  };
}

/**
 * コマンドを実行する（内部処理）
 */
export async function executeCommandCore(request: CommandExecutionRequest): Promise<CommandExecutionResult> {
  handlerLogger.debug('Executing command', { commandId: request.commandId });

  // commandIdの検証
  if (!request.commandId || request.commandId.trim() === '') {
    handlerLogger.error('Command ID is required');
    return {
      success: false,
      error: {
        errorCode: 40000,
        message: 'Command ID is required'
      }
    };
  }

  try {
    const client = new ObsidianAPIClient();
    
    // commandIdをURLエンコード
    const encodedCommandId = encodeURIComponent(request.commandId);
    const endpoint = `/commands/${encodedCommandId}/`;
    
    handlerLogger.debug('Making API request', { endpoint });
    
    // POST リクエストを送信（204レスポンス期待）
    await client.post(endpoint, {});

    handlerLogger.info('Command executed successfully', { commandId: request.commandId });

    return {
      success: true,
      data: {
        success: true,
        message: 'Command executed successfully'
      }
    };
  } catch (error) {
    handlerLogger.error('Failed to execute command');

    if (error instanceof ApiError) {
      // 404エラー（コマンドが存在しない）
      if (error.code === ErrorCode.API_NOT_FOUND || error.statusCode === 404) {
        return {
          success: false,
          error: {
            errorCode: 40004,
            message: 'The command you specified does not exist.'
          }
        };
      }

      // 接続エラー
      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: {
            errorCode: 50001,
            message: 'Connection refused'
          }
        };
      }

      // タイムアウトエラー
      if (error.code === ErrorCode.API_TIMEOUT) {
        return {
          success: false,
          error: {
            errorCode: 50002,
            message: 'Request timeout'
          }
        };
      }
    }

    // その他のエラー
    return {
      success: false,
      error: {
        errorCode: 50000,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * MCPツールハンドラー
 */
export async function executeCommandHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  // argsからcommandIdを取得
  const commandId = args.commandId as string;
  
  // commandIdが存在しない場合のエラーハンドリング
  if (!commandId) {
    return {
      content: [
        {
          type: "text",
          text: "Error (40000): Command ID is required"
        }
      ]
    };
  }

  const request: CommandExecutionRequest = {
    commandId: commandId
  };

  const result = await executeCommandCore(request);

  if (result.success && result.data) {
    return {
      content: [
        {
          type: "text",
          text: `Command '${request.commandId}' executed successfully.`
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: `Error (${result.error?.errorCode}): ${result.error?.message}`
        }
      ]
    };
  }
}