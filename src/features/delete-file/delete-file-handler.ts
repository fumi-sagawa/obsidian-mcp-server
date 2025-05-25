import type { ObsidianAPIClient } from '../../shared/api/obsidian/index.js';
import { ApiError, ValidationError, ErrorCode } from '../../shared/lib/errors/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { deleteFileSchema } from './schema.js';
import type {
  DeleteFileRequest,
  DeleteFileResponse,
  ErrorResponse,
} from './types.js';

const handlerLogger = logger.child({ component: 'delete-file-handler' });

/**
 * パスの妥当性を検証
 */
function validatePath(filename: string): void {
  // パスが空の場合
  if (!filename || filename.trim() === '') {
    const error: ErrorResponse = {
      error: 'Invalid file path: empty path',
      code: 'INVALID_PATH',
    };
    throw error;
  }

  // 親ディレクトリへの参照を含む場合
  if (filename.includes('../')) {
    const error: ErrorResponse = {
      error: `Invalid file path: ${filename}`,
      code: 'INVALID_PATH',
    };
    throw error;
  }

  // 絶対パスの場合
  if (filename.startsWith('/')) {
    const error: ErrorResponse = {
      error: `Invalid file path: ${filename}`,
      code: 'INVALID_PATH',
    };
    throw error;
  }

  // ディレクトリパスの場合（末尾がスラッシュ）
  if (filename.endsWith('/')) {
    const error: ErrorResponse = {
      error: `Cannot delete directory: ${filename}`,
      code: 'INVALID_PATH',
    };
    throw error;
  }

  // システムファイルの場合
  if (filename.startsWith('.obsidian/')) {
    const error: ErrorResponse = {
      error: `Cannot delete system file: ${filename}`,
      code: 'PROTECTED_FILE',
    };
    throw error;
  }
}

/**
 * ファイル削除処理のコア実装
 */
export async function deleteFileCore(
  request: DeleteFileRequest,
  obsidianApi: ObsidianAPIClient
): Promise<DeleteFileResponse> {
  handlerLogger.debug('Processing delete-file request', { 
    filename: request.filename
  });

  // バリデーション
  const validationResult = deleteFileSchema.safeParse(request);
  if (!validationResult.success) {
    handlerLogger.error('Validation failed', { errors: validationResult.error.errors } as any);
    throw new ValidationError(
      'Invalid request parameters',
      ErrorCode.VALIDATION_FAILED,
      { errors: validationResult.error.errors }
    );
  }

  const { filename } = validationResult.data;

  // パスの検証
  validatePath(filename);

  try {
    // ファイルを削除
    await obsidianApi.deleteFile(filename);

    const response: DeleteFileResponse = {
      success: true,
      message: `File deleted successfully: ${filename}`,
    };

    handlerLogger.debug('File deleted successfully', { filename });

    return response;
  } catch (error: any) {
    handlerLogger.error('File deletion failed', { 
      error,
      filename
    } as any);

    // 既にErrorResponseの場合はそのまま投げる
    if (error && typeof error === 'object' && 'error' in error && 'code' in error) {
      throw error;
    }

    // ApiErrorの場合はエラー内容に応じて適切なレスポンスを返す
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        const errorResponse: ErrorResponse = {
          error: `File not found: ${filename}`,
          code: 'FILE_NOT_FOUND',
        };
        throw errorResponse;
      }
      
      if (error.statusCode === 403) {
        const errorResponse: ErrorResponse = {
          error: `Permission denied: ${filename}`,
          code: 'PERMISSION_DENIED',
        };
        throw errorResponse;
      }

      if (error.statusCode === 405) {
        const errorResponse: ErrorResponse = {
          error: `Failed to delete file: ${error.message}`,
          code: 'DELETE_FAILED',
        };
        throw errorResponse;
      }
      
      // その他のApiErrorはそのまま投げる
      throw error;
    }

    // response.data.errorがある場合（モックエラー）
    if (error?.response?.data?.error) {
      if (error.response.status === 404) {
        const errorResponse: ErrorResponse = {
          error: `File not found: ${filename}`,
          code: 'FILE_NOT_FOUND',
        };
        throw errorResponse;
      }
      
      if (error.response.status === 403) {
        const errorResponse: ErrorResponse = {
          error: `Permission denied: ${filename}`,
          code: 'PERMISSION_DENIED',
        };
        throw errorResponse;
      }

      const errorResponse: ErrorResponse = {
        error: `Failed to delete file: ${error.response.data.error}`,
        code: 'DELETE_FAILED',
      };
      throw errorResponse;
    }

    // その他のエラー
    const errorResponse: ErrorResponse = {
      error: 'Failed to delete file',
      code: 'UNKNOWN_ERROR',
    };

    if (error?.message) {
      errorResponse.error = `Failed to delete file: ${error.message}`;
    }

    throw errorResponse;
  }
}

/**
 * MCPツールハンドラー
 */
export async function deleteFileHandler(
  args: any
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const { ObsidianAPIClient } = await import('../../shared/api/obsidian/index.js');
  const obsidianApi = new ObsidianAPIClient();
  
  try {
    const result = await deleteFileCore(args as DeleteFileRequest, obsidianApi);
    
    return {
      content: [
        {
          type: 'text',
          text: result.message
        }
      ]
    };
  } catch (error: any) {
    // エラーレスポンスの場合
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.error || error.message || 'Unknown error occurred'}`
        }
      ]
    };
  }
}