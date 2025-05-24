import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { formatCommands } from './format-commands.js';
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

    // コマンドをフォーマット
    const formattedText = formatCommands(response.commands);

    return {
      content: [{
        type: 'text',
        text: formattedText
      }]
    };
  } catch (error) {
    logger.error('list_commands: エラーが発生しました', { error });

    // エラーレスポンスの処理
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.data?.error) {
        throw new Error(`APIエラー: ${axiosError.response.data.error}`);
      }
    }

    throw new Error('コマンド一覧の取得中にエラーが発生しました');
  }
}