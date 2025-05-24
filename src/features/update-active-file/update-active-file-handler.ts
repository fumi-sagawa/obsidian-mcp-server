import { z } from 'zod';
import { logger } from '../../shared/lib/logger/index.js';
import { updateActiveFileSchema } from './schema.js';
import type {
  UpdateActiveFileRequest,
  UpdateActiveFileResponse,
  UpdateError,
} from './types.js';
import { ObsidianAPIClient } from '../../shared/api/obsidian/obsidian-api.js';
import { ValidationError, ApiError, ErrorCode } from '../../shared/lib/errors/index.js';

const handlerLogger = logger.child({ handler: 'update-active-file' });

/**
 * アクティブファイルの内容を更新する（内部処理）
 */
export async function updateActiveFileCore(
  request: UpdateActiveFileRequest,
  api?: ObsidianAPIClient
): Promise<UpdateActiveFileResponse> {
  handlerLogger.debug('Starting active file update', {
    contentLength: request.content?.length,
  });

  const client = api || new ObsidianAPIClient();

  try {
    // 入力値の検証
    const validated = updateActiveFileSchema.parse(request);
    handlerLogger.trace('Request validated', { contentLength: validated.content.length });

    // Obsidian APIを呼び出してファイルを更新
    await client.updateActiveFile(validated.content);

    handlerLogger.info('Active file updated successfully');

    return {
      success: true,
      message: 'Active file updated successfully',
    };
  } catch (error) {
    handlerLogger.error('Failed to update active file', error instanceof Error ? error : new Error(String(error)));

    // Zodバリデーションエラー
    if (error instanceof z.ZodError) {
      const updateError: UpdateError = {
        error: `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        code: 'VALIDATION_ERROR',
        details: error.errors,
      };
      throw new ValidationError(updateError.error, ErrorCode.VALIDATION_FAILED, updateError.details as Record<string, unknown>);
    }

    // APIエラー
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        const updateError: UpdateError = {
          error: 'No active file open in Obsidian',
          code: 'NO_ACTIVE_FILE',
          details: error.metadata,
        };
        throw updateError;
      }

      if (error.statusCode === 405) {
        const updateError: UpdateError = {
          error: `Cannot update directory: ${error.message}`,
          code: 'UPDATE_FAILED',
          details: error.metadata,
        };
        throw updateError;
      }

      const updateError: UpdateError = {
        error: `Failed to update active file: ${error.message}`,
        code: 'UPDATE_FAILED',
        details: error.metadata,
      };
      throw updateError;
    }

    // モックテスト用のエラー処理
    if (error && typeof error === 'object' && 'response' in error) {
      const mockError = error as any;
      if (mockError.response?.status === 404) {
        const updateError: UpdateError = {
          error: 'No active file open in Obsidian',
          code: 'NO_ACTIVE_FILE',
          details: mockError.response.data,
        };
        throw updateError;
      }

      if (mockError.response?.status === 405) {
        const updateError: UpdateError = {
          error: `Cannot update directory: ${mockError.response.data?.error || 'Unknown error'}`,
          code: 'UPDATE_FAILED',
          details: mockError.response.data,
        };
        throw updateError;
      }

      if (mockError.response?.status === 400) {
        const updateError: UpdateError = {
          error: `Failed to update active file: ${mockError.response.data?.error || 'Unknown error'}`,
          code: 'UPDATE_FAILED',
          details: mockError.response.data,
        };
        throw updateError;
      }
    }

    // その他のエラー
    const updateError: UpdateError = {
      error: 'Failed to update active file',
      code: 'UNKNOWN_ERROR',
      details: error,
    };
    throw updateError;
  }
}

/**
 * MCPツールハンドラー
 */
export async function updateActiveFileHandler(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await updateActiveFileCore(args as unknown as UpdateActiveFileRequest);
    
    return {
      content: [
        {
          type: "text",
          text: result.message
        }
      ]
    };
  } catch (error) {
    let errorMessage = 'Failed to update active file';
    
    if (error instanceof ValidationError) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'error' in error) {
      errorMessage = (error as UpdateError).error;
    } else if (error instanceof Error) {
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