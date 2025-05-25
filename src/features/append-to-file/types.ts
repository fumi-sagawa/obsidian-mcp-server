/**
 * append-to-fileツールの型定義
 */

/**
 * append_to_fileのリクエストパラメータ
 */
export interface AppendToFileRequest {
  /** 追記対象のファイルパス（vault rootからの相対パス） */
  filename: string;
  /** 追記するコンテンツ */
  content: string;
}

/**
 * append_to_fileのレスポンス
 */
export interface AppendToFileResponse {
  /** 成功フラグ */
  success: boolean;
  /** 操作結果のメッセージ */
  message: string;
}

/**
 * Obsidian APIのエラーレスポンス
 */
export interface ObsidianErrorResponse {
  /** エラーメッセージ */
  message: string;
  /** エラーコード (5桁の数値) */
  errorCode?: number;
}