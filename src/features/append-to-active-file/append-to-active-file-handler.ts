import { appendToActiveFileSchema } from './schema.js';
import { ObsidianAPIClient } from '../../shared/api/obsidian/obsidian-api.js';
import { ApiError } from '../../shared/lib/errors/index.js';
import { logger } from '../../shared/lib/logger/index.js';

const handlerLogger = logger.child({ component: 'append-to-active-file-handler' });

/**
 * append_to_active_fileツールのハンドラー
 * アクティブファイルの末尾にコンテンツを追記する
 */
export async function appendToActiveFileHandler(
  args: unknown
): Promise<any> {
  // 入力値の検証
  const parsed = appendToActiveFileSchema.parse(args);
  
  handlerLogger.debug('Processing append-to-active-file request', { 
    contentLength: parsed.content.length
  });
  
  const apiClient = new ObsidianAPIClient();
  
  try {
    // Obsidian APIへのリクエスト
    // 注: 現在のObsidian APIはpositionパラメータをサポートしていないため、
    // contentのみを送信します
    const response = await apiClient.appendToActiveFile(parsed.content);
    
    handlerLogger.trace('Append operation successful', { response });
    
    return {
      content: [
        {
          type: 'text',
          text: 'アクティブファイルにコンテンツを追記しました。',
        },
      ],
    };
  } catch (error: any) {
    handlerLogger.error('Failed to append to active file', error);
    
    // エラーハンドリング
    if (error instanceof ApiError) {
      if (error.statusCode === 404) {
        throw new Error('アクティブファイルが開かれていません');
      }
      throw new Error('アクティブファイルへの追記に失敗しました');
    }
    
    throw new Error(`アクティブファイルへの追記に失敗しました: ${error.message}`);
  }
}