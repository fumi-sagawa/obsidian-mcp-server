import type { OpenFileRequest, OpenFileResponse } from './types.js';
import { openFileSchema } from './schema.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { ValidationError } from '../../shared/lib/errors/index.js';
import { logger } from '../../shared/lib/logger/index.js';

/**
 * ファイルパスの検証
 * @param path 検証するパス
 * @throws ValidationError 無効なパスの場合
 */
function validateFilePath(path: string): void {
  // 空のパスチェック
  if (!path || path.trim() === '') {
    throw new ValidationError('File path cannot be empty');
  }

  // パストラバーサル攻撃の防止
  if (path.includes('../') || path.includes('..\\')) {
    throw new ValidationError('Invalid file path: Path traversal is not allowed');
  }

  // 絶対パスの禁止（セキュリティ上の理由）
  if (path.startsWith('/etc/') || path.startsWith('/usr/') || path.startsWith('/var/')) {
    throw new ValidationError('Invalid file path: Absolute system paths are not allowed');
  }
}

/**
 * ファイルパスの正規化
 * @param path 正規化するパス
 * @returns 正規化されたパス
 */
function normalizeFilePath(path: string): string {
  // 先頭のスラッシュを削除
  let normalized = path.startsWith('/') ? path.slice(1) : path;
  
  // バックスラッシュをスラッシュに変換（Windows対応）
  normalized = normalized.replace(/\\/g, '/');
  
  // 複数の連続するスラッシュを単一に
  normalized = normalized.replace(/\/+/g, '/');
  
  // 末尾のスラッシュを削除
  normalized = normalized.replace(/\/$/, '');
  
  return normalized;
}

/**
 * ファイルを開く（内部処理）
 * @param request ファイルを開くリクエスト
 * @returns 操作結果
 */
async function openFileCore(request: OpenFileRequest): Promise<OpenFileResponse> {
  const requestId = Date.now().toString();
  logger.debug('open-file: Starting request', { requestId, request });

  try {
    // 入力検証
    const validatedRequest = openFileSchema.parse(request);
    
    // パスの検証
    validateFilePath(validatedRequest.filename);
    
    // パスの正規化
    const normalizedPath = normalizeFilePath(validatedRequest.filename);
    
    logger.debug('open-file: Opening file', { 
      requestId, 
      originalPath: validatedRequest.filename,
      normalizedPath,
      newLeaf: validatedRequest.newLeaf 
    });

    // APIオプションの構築
    const options: { newLeaf?: boolean } = {};
    if (validatedRequest.newLeaf !== undefined) {
      options.newLeaf = validatedRequest.newLeaf;
    }

    // Obsidian APIクライアントを作成
    const apiClient = new ObsidianAPIClient();
    
    // Obsidian APIを呼び出し
    await apiClient.openFile(normalizedPath, options);

    const response: OpenFileResponse = {
      success: true,
      message: 'File opened successfully',
      filename: normalizedPath
    };

    logger.info('open-file: File opened successfully', { 
      requestId, 
      filename: normalizedPath 
    });

    return response;
  } catch (error) {
    logger.error('open-file: Error opening file', { 
      requestId, 
      error,
      filename: request.filename 
    });

    // エラーの詳細な処理
    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof Error) {
      // APIエラーの場合
      const apiError = error as any;
      if (apiError.response?.status === 404) {
        throw new Error('File not found');
      }
      
      throw error;
    }

    throw new Error('Failed to open file');
  }
}

/**
 * MCPツールハンドラー
 */
export async function openFileHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await openFileCore(args as unknown as OpenFileRequest);
    
    const text = result.success 
      ? `File "${result.filename}" opened successfully.`
      : `Failed to open file: ${result.message}`;
    
    return {
      content: [
        {
          type: "text",
          text
        }
      ]
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return {
      content: [
        {
          type: "text",
          text: `Error opening file: ${errorMessage}`
        }
      ]
    };
  }
}