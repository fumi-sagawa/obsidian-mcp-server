/**
 * delete-file ツールの型定義
 * DELETE /vault/{filename} エンドポイントに対応
 */

/**
 * ファイル削除リクエスト
 */
export interface DeleteFileRequest {
  /** 削除対象のファイルパス（Vaultルートからの相対パス） */
  filename: string;
}

/**
 * ファイル削除レスポンス
 */
export interface DeleteFileResponse {
  /** 処理成功フラグ */
  success: boolean;
  /** 処理結果のメッセージ */
  message: string;
}

/**
 * エラーレスポンス
 */
export interface ErrorResponse {
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: string;
}