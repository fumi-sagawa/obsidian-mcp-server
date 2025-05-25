import type { ListDirectoryRequest, ListDirectoryResponse, ListDirectoryFormattedResponse } from './types.js';
import { listDirectorySchema } from './schema.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { ValidationError } from '../../shared/lib/errors/index.js';
import { logger } from '../../shared/lib/logger/index.js';

/**
 * ディレクトリパスの検証
 * @param path 検証するパス
 * @throws ValidationError 無効なパスの場合
 */
function validateDirectoryPath(path: string): void {
  // パストラバーサル攻撃の防止
  if (path.includes('../') || path.includes('..\\')) {
    throw new ValidationError('Path traversal not allowed');
  }

  // 絶対パスの禁止（セキュリティ上の理由）
  if (path.startsWith('/etc/') || path.startsWith('/usr/') || path.startsWith('/var/')) {
    throw new ValidationError('Absolute system paths are not allowed');
  }
}

/**
 * ディレクトリパスの正規化
 * @param path 正規化するパス
 * @returns 正規化されたパス
 */
function normalizeDirectoryPath(path: string): string {
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
 * ディレクトリリストのフォーマット
 * @param directoryPath ディレクトリパス
 * @param response APIレスポンス
 * @returns フォーマット済みレスポンス
 */
function formatDirectoryListing(directoryPath: string, response: ListDirectoryResponse): ListDirectoryFormattedResponse {
  const files: string[] = [];
  const directories: string[] = [];

  // ファイルとディレクトリを分類
  response.files.forEach(item => {
    if (item.endsWith('/')) {
      directories.push(item);
    } else {
      files.push(item);
    }
  });

  return {
    directory: directoryPath || '(root)',
    files,
    directories,
    totalItems: response.files.length
  };
}

/**
 * フォーマット済みレスポンスを文字列に変換
 * @param formatted フォーマット済みレスポンス
 * @returns 整形されたテキスト
 */
function formatListingText(formatted: ListDirectoryFormattedResponse): string {
  const lines: string[] = [];
  
  lines.push(`📁 Directory: ${formatted.directory}`);
  lines.push('');

  if (formatted.totalItems === 0) {
    lines.push('🔍 No files found in this directory.');
    return lines.join('\n');
  }

  // ディレクトリを先に表示
  if (formatted.directories.length > 0) {
    lines.push('📂 Directories:');
    formatted.directories
      .sort()
      .forEach(dir => {
        lines.push(`  📁 ${dir}`);
      });
    lines.push('');
  }

  // ファイルを表示
  if (formatted.files.length > 0) {
    lines.push('📋 Files:');
    formatted.files
      .sort()
      .forEach(file => {
        lines.push(`  📄 ${file}`);
      });
    lines.push('');
  }

  // 統計情報
  lines.push(`📊 Total: ${formatted.totalItems} items (Files: ${formatted.files.length}, Directories: ${formatted.directories.length})`);

  return lines.join('\n');
}

/**
 * ディレクトリを一覧表示（内部処理）
 * @param request ディレクトリ一覧表示リクエスト
 * @returns 一覧表示結果
 */
async function listDirectoryCore(request: ListDirectoryRequest): Promise<ListDirectoryFormattedResponse> {
  const requestId = Date.now().toString();
  logger.debug('list-directory: Starting request', { requestId, request });

  try {
    // 入力検証
    const validatedRequest = listDirectorySchema.parse(request);
    
    // パスの検証
    validateDirectoryPath(validatedRequest.pathToDirectory);
    
    // パスの正規化
    const normalizedPath = normalizeDirectoryPath(validatedRequest.pathToDirectory);
    
    logger.debug('list-directory: Listing directory', { 
      requestId, 
      originalPath: validatedRequest.pathToDirectory,
      normalizedPath
    });

    // Obsidian APIクライアントを作成
    const apiClient = new ObsidianAPIClient();
    
    // Obsidian APIを呼び出し
    const apiResponse = await apiClient.listDirectory(normalizedPath);

    // レスポンスのフォーマット
    const formattedResponse = formatDirectoryListing(normalizedPath, apiResponse);

    logger.info('list-directory: Directory listed successfully', { 
      requestId, 
      directory: normalizedPath,
      itemCount: formattedResponse.totalItems 
    });

    return formattedResponse;
  } catch (error) {
    logger.error('list-directory: Error listing directory', { 
      requestId, 
      error,
      pathToDirectory: request.pathToDirectory 
    });

    // エラーの詳細な処理
    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof Error) {
      // APIエラーの場合
      const apiError = error as any;
      if (apiError.response?.status === 404) {
        throw new Error('Directory not found');
      }
      
      throw error;
    }

    throw new Error('Failed to list directory');
  }
}

/**
 * MCPツールハンドラー
 */
export async function listDirectoryHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    const result = await listDirectoryCore(args as unknown as ListDirectoryRequest);
    
    const text = formatListingText(result);
    
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
          text: `Error listing directory: ${errorMessage}`
        }
      ]
    };
  }
}