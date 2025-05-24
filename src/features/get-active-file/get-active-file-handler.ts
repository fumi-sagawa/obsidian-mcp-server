import type { GetActiveFileResponse } from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';

const handlerLogger = logger.child({ feature: 'get-active-file' });

/**
 * アクティブファイルを取得する（内部処理）
 */
export async function getActiveFileCore(args: Record<string, unknown>): Promise<{ success: boolean; data?: GetActiveFileResponse; error?: { message: string } }> {
  handlerLogger.debug('Getting active file');

  try {
    const client = new ObsidianAPIClient();
    const activeFile = await client.getActiveFile();

    handlerLogger.info('Active file retrieved successfully', {
      path: activeFile.path,
      size: activeFile.stat.size
    });

    return {
      success: true,
      data: activeFile
    };
  } catch (error) {
    handlerLogger.error('Failed to get active file', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ApiError) {
      if (error.code === ErrorCode.API_NOT_FOUND) {
        return {
          success: false,
          error: {
            message: 'No active file is currently open in Obsidian'
          }
        };
      }

      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: {
            message: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
          }
        };
      }
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * MCPツールハンドラー
 */
export async function getActiveFileHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const result = await getActiveFileCore(args);

  if (result.success && result.data) {
    const formattedContent = formatActiveFileResponse(result.data);
    return {
      content: [
        {
          type: "text",
          text: formattedContent
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: result.error?.message || 'Failed to get active file'
        }
      ]
    };
  }
}

function formatActiveFileResponse(file: GetActiveFileResponse): string {
  const lines: string[] = [
    `Active file: ${file.path}`,
    `Size: ${file.stat.size} bytes`,
    `Modified: ${new Date(file.stat.mtime).toISOString()}`,
    `Tags: ${file.tags.length > 0 ? file.tags.join(', ') : '(none)'}`,
    '',
    'Content:',
    file.content,
  ];

  return lines.join('\n');
}