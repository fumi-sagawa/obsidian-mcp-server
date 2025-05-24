import { logger } from '../../shared/lib/logger/index.js';
import { ObsidianAPIClient } from '../../shared/api/obsidian/obsidian-api.js';
import { ApiError } from '../../shared/lib/errors/index.js';
import type { DeleteActiveFileParams, DeleteActiveFileResponse } from './types.js';

const handlerLogger = logger.child({ handler: 'delete-active-file' });

/**
 * アクティブファイルを削除する（内部処理）
 */
export async function deleteActiveFileCore(
  params: DeleteActiveFileParams,
  api?: ObsidianAPIClient
): Promise<DeleteActiveFileResponse> {
  handlerLogger.debug('Starting active file deletion');

  const client = api || new ObsidianAPIClient();

  try {
    // Obsidian APIを呼び出してファイルを削除
    // APIは204 No Contentを返すため、成功メッセージはこちらで生成
    await client.deleteActiveFile();

    handlerLogger.info('Active file deleted successfully');

    return {
      message: 'Active file deleted successfully',
    };
  } catch (error) {
    handlerLogger.error('Failed to delete active file', error instanceof Error ? error : new Error(String(error)));

    // APIエラー
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new Error('No active file found');
      }

      if (error.statusCode === 405) {
        throw new Error('Your path references a directory instead of a file');
      }

      throw new Error(`Failed to delete active file: ${error.message}`);
    }

    // モックテスト用のエラー処理
    if (error && typeof error === 'object' && 'response' in error) {
      const mockError = error as any;
      if (mockError.response?.status === 404) {
        throw new Error(mockError.response.data?.message || 'No active file found');
      }

      if (mockError.response?.status === 405) {
        throw new Error(mockError.response.data?.message || 'Your path references a directory instead of a file');
      }
    }

    // その他のエラー
    throw error instanceof Error ? error : new Error('Failed to delete active file');
  }
}

/**
 * MCPツールハンドラー
 */
export async function deleteActiveFileHandler(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await deleteActiveFileCore(args as DeleteActiveFileParams);
    
    return {
      content: [
        {
          type: "text",
          text: result.message
        }
      ]
    };
  } catch (error) {
    let errorMessage = 'Failed to delete active file';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      content: [
        {
          type: "text",
          text: `Error: ${errorMessage}`
        }
      ]
    };
  }
}