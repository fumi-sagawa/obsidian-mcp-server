/**
 * Obsidianのコマンド情報を表す型
 */
export interface CommandInfo {
  /** コマンドのID（例: "global-search:open"） */
  id: string;
  /** コマンドの表示名（例: "Search: Search in all files"） */
  name: string;
}

/**
 * /commands/ エンドポイントのレスポンス型
 */
export interface ListCommandsResponse {
  commands: CommandInfo[];
}

/**
 * list_commandsツールのレスポンス型
 */
export interface ListCommandsToolResponse {
  content: Array<{
    type: 'text';
    text: string;
  }>;
}

/**
 * エラーレスポンス型
 */
export interface ErrorResponse {
  error: string;
  code?: string;
}