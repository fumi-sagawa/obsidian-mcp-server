import type { GetServerStatusResult, ServerStatusResponse } from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';

const handlerLogger = logger.child({ feature: 'get-server-status' });

/**
 * Obsidianサーバーのステータスを取得する（内部処理）
 */
export async function getServerStatusCore(args: Record<string, unknown>): Promise<GetServerStatusResult> {
  handlerLogger.debug('Getting server status');

  try {
    const client = new ObsidianAPIClient();
    const response = await client.get<ServerStatusResponse>('/');

    // レスポンスの形式を検証
    if (!isValidServerStatusResponse(response)) {
      handlerLogger.error('Invalid response format');
      return {
        success: false,
        error: {
          errorCode: 50003,
          message: 'Invalid response format'
        }
      };
    }

    handlerLogger.info('Server status retrieved successfully', {
      authenticated: response.authenticated,
      versions: response.versions
    });

    return {
      success: true,
      data: response
    };
  } catch (error) {
    handlerLogger.error('Failed to get server status');

    if (error instanceof ApiError) {
      // 特定のエラーコードに基づいてエラーメッセージを設定
      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: {
            errorCode: 50001,
            message: 'Connection refused'
          }
        };
      }

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
export async function getServerStatusHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const result = await getServerStatusCore(args);

  if (result.success) {
    const statusText = [
      `Obsidian Server Status:`,
      `- Status: ${result.data.status}`,
      `- Authenticated: ${result.data.authenticated ? 'Yes' : 'No'}`,
      `- Service: ${result.data.service}`,
      `- Obsidian Version: ${result.data.versions.obsidian}`,
      `- Plugin Version: ${result.data.versions.self}`,
    ].join('\n');

    return {
      content: [
        {
          type: "text",
          text: statusText
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: `Error (${result.error.errorCode}): ${result.error.message}`
        }
      ]
    };
  }
}

/**
 * レスポンスが有効なServerStatusResponse型かどうかを検証
 */
function isValidServerStatusResponse(response: unknown): response is ServerStatusResponse {
  if (!response || typeof response !== 'object') {
    return false;
  }

  const r = response as any;
  
  return (
    typeof r.authenticated === 'boolean' &&
    typeof r.status === 'string' &&
    typeof r.service === 'string' &&
    r.versions &&
    typeof r.versions === 'object' &&
    typeof r.versions.obsidian === 'string' &&
    typeof r.versions.self === 'string'
  );
}