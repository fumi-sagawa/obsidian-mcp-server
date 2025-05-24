/**
 * append-to-active-fileツールの型定義
 */

/**
 * append_to_active_fileのリクエストパラメータ
 */
export interface AppendToActiveFileRequest {
  /** 追記するコンテンツ */
  content: string;
}

/**
 * append_to_active_fileのレスポンス
 */
export interface AppendToActiveFileResponse {
  /** 操作結果のメッセージ */
  message: string;
}

/**
 * Obsidian APIのエラーレスポンス
 */
export interface ObsidianErrorResponse {
  /** エラーメッセージ */
  error: string;
  /** HTTPステータスコード */
  status: number;
}