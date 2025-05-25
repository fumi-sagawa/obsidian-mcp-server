import { ObsidianAPIClient } from '../../shared/api/obsidian/obsidian-api.js';
import { appendToFileRequestSchema } from './schema.js';
import type { AppendToFileRequest } from './types.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError } from '../../shared/lib/errors/index.js';

/**
 * append_to_fileツールのハンドラー
 * 指定されたファイルの末尾にコンテンツを追記する
 * ファイルが存在しない場合は新規作成される
 */
export async function appendToFileHandler(args: unknown): Promise<{ content: { type: 'text'; text: string }[] }> {
  logger.debug('append_to_file handler called', { args });

  // パラメータの検証
  const validatedParams = appendToFileRequestSchema.parse(args) as AppendToFileRequest;
  const { filename, content } = validatedParams;

  // 拡張子のチェック
  if (!filename.includes('.')) {
    logger.warn('Filename without extension', { filename });
    throw new Error(`ファイル名には拡張子を含める必要があります: "${filename}"`);
  }

  logger.info('Appending content to file', { 
    filename, 
    contentLength: content.length 
  });

  try {
    const api = new ObsidianAPIClient();
    
    // POST /vault/{filename} エンドポイントを呼び出し
    await api.appendToFile(filename, content);

    logger.info('Content appended successfully', { filename });
    
    return {
      content: [{
        type: 'text',
        text: `ファイル "${filename}" に内容を追記しました`
      }]
    };
  } catch (error: any) {
    logger.error('Failed to append to file', { 
      error: error.message,
      filename 
    });

    if (error instanceof ApiError) {
      throw new Error(`ファイルへの追記に失敗しました: ${error.message}`);
    }

    throw new Error(`ファイルへの追記に失敗しました: ${error.message}`);
  }
}