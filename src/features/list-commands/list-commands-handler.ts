import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import type { ListCommandsResponse } from './types.js';

/**
 * list_commandsツールのハンドラー
 * Obsidianで利用可能なコマンドの一覧を取得する
 */
export async function listCommandsHandler(
  _args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  logger.debug('list_commands: コマンド一覧の取得を開始');

  try {
    // Obsidian APIクライアントを作成
    const client = new ObsidianAPIClient();
    
    // APIを呼び出してコマンド一覧を取得
    const response = await client.get<ListCommandsResponse>('/commands/');
    
    logger.debug('list_commands: APIレスポンスを受信', {
      commandCount: response.commands.length
    });

    // APIレスポンスをそのまま返す
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(response, null, 2)
      }]
    };
  } catch (error) {
    logger.error('list_commands: エラーが発生しました', { error });

    // エラーレスポンスの処理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.error) {
        return {
          content: [{
            type: 'text',
            text: JSON.stringify({
              error: `APIエラー: ${axiosError.response.data.error}`
            }, null, 2)
          }]
        };
      }
    }

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({
          error: 'コマンド一覧の取得中にエラーが発生しました'
        }, null, 2)
      }]
    };
  }
}