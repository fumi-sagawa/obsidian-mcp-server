import { logger } from '../../shared/lib/logger/index.js';
import { ObsidianAPIClient } from '../../shared/api/obsidian/obsidian-api.js';
import { ApiError } from '../../shared/lib/errors/index.js';
import type { DeletePeriodicNoteParams, DeletePeriodicNoteResponse } from './types.js';

const handlerLogger = logger.child({ handler: 'delete-periodic-note' });

/**
 * 定期ノートを削除する（内部処理）
 */
export async function deletePeriodicNoteCore(
  params: DeletePeriodicNoteParams,
  api?: ObsidianAPIClient
): Promise<DeletePeriodicNoteResponse> {
  handlerLogger.debug('Starting periodic note deletion', { period: params.period });

  const client = api || new ObsidianAPIClient();

  try {
    // Obsidian APIを呼び出して定期ノートを削除
    // APIは204 No Contentを返すため、成功メッセージはこちらで生成
    await client.deletePeriodicNote(params.period);

    handlerLogger.info('Periodic note deleted successfully', { period: params.period });

    return {
      message: `${params.period} note deleted successfully`,
    };
  } catch (error) {
    handlerLogger.error('Failed to delete periodic note', error instanceof Error ? error : new Error(String(error)));

    // APIエラー
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new Error(`No ${params.period} note found`);
      }

      if (error.statusCode === 405) {
        throw new Error('Your path references a directory instead of a file');
      }

      throw new Error(`Failed to delete ${params.period} note: ${error.message}`);
    }

    // モックテスト用のエラー処理
    if (error && typeof error === 'object' && 'response' in error) {
      const mockError = error as any;
      if (mockError.response?.status === 404) {
        throw new Error(mockError.response.data?.message || `No ${params.period} note found`);
      }

      if (mockError.response?.status === 405) {
        throw new Error(mockError.response.data?.message || 'Your path references a directory instead of a file');
      }
    }

    // その他のエラー
    throw error instanceof Error ? error : new Error(`Failed to delete ${params.period} note`);
  }
}

/**
 * MCPツールハンドラー
 */
export async function deletePeriodicNoteHandler(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await deletePeriodicNoteCore(args as unknown as DeletePeriodicNoteParams);
    
    return {
      content: [
        {
          type: "text",
          text: result.message
        }
      ]
    };
  } catch (error) {
    let errorMessage = 'Failed to delete periodic note';
    
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