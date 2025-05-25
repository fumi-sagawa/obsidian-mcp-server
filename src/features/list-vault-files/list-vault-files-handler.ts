import { logger } from '../../shared/lib/logger/index.js';
import { obsidianApi } from '../../shared/api/obsidian/index.js';
import { ApiError, BusinessError, ValidationError, ErrorCode } from '../../shared/lib/errors/index.js';
import type { ListVaultFilesParams, VaultItem } from './types.js';

/**
 * Vaultルートディレクトリのファイル一覧を取得するハンドラー
 * @param params パラメータ（空オブジェクト）
 * @returns MCPフォーマットのレスポンス
 */
export async function listVaultFilesHandler(_params: ListVaultFilesParams): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const handlerLogger = logger.child({ handler: 'list-vault-files' });
  
  try {
    handlerLogger.debug('Getting vault file list');

    // APIから Vaultルートディレクトリのファイル一覧を取得
    const response = await obsidianApi.listVaultFiles();

    // レスポンスの検証
    if (!response || !Array.isArray(response.files)) {
      throw new BusinessError(
        'Invalid API response format',
        ErrorCode.BUSINESS_LOGIC_ERROR,
        { response }
      );
    }

    // ファイル名からVaultItem型への変換
    const items: VaultItem[] = response.files.map(name => ({
      name,
      type: name.endsWith('/') ? 'directory' : 'file'
    }));

    handlerLogger.info('Vault file list retrieved successfully', {
      itemCount: items.length,
      fileCount: items.filter(item => item.type === 'file').length,
      directoryCount: items.filter(item => item.type === 'directory').length
    });

    // APIレスポンスの構造を保持して返す
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify({
            files: response.files,
            items: items
          }, null, 2)
        }
      ]
    };
  } catch (error) {
    if (error instanceof ApiError) {
      handlerLogger.error('API error while getting vault files', error, { 
        code: error.code,
        statusCode: error.statusCode
      });
      throw error;
    }

    if (error instanceof BusinessError || error instanceof ValidationError) {
      handlerLogger.error('Business error in list vault files handler', error, {
        code: error.code
      });
      throw error;
    }

    handlerLogger.error(
      'Unexpected error in list vault files handler', 
      error instanceof Error ? error : new Error(String(error))
    );
    throw new BusinessError(
      'Failed to get vault file list',
      ErrorCode.BUSINESS_OPERATION_FAILED,
      { originalError: error instanceof Error ? error.message : String(error) }
    );
  }
}