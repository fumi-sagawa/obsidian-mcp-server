/**
 * update_active_file ツールの型定義
 * アクティブファイルの内容を完全に置き換える
 */

/**
 * アクティブファイル更新リクエスト
 */
export interface UpdateActiveFileRequest {
  /** 新しいファイル内容 */
  content: string;
}

/**
 * アクティブファイル更新レスポンス
 */
export interface UpdateActiveFileResponse {
  /** 更新成功フラグ */
  success: boolean;
  /** 結果メッセージ */
  message: string;
}

/**
 * 更新エラーレスポンス
 */
export interface UpdateError {
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: 'NO_ACTIVE_FILE' | 'UPDATE_FAILED' | 'VALIDATION_ERROR' | 'UNKNOWN_ERROR';
  /** 詳細情報 */
  details?: unknown;
}

/**
 * 内部処理用の型
 */
export interface UpdateActiveFileContext {
  /** リクエストデータ */
  request: UpdateActiveFileRequest;
  /** 現在のファイルパス（デバッグ用） */
  filePath?: string;
}