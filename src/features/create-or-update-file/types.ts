/**
 * create-or-update-file ツールの型定義
 * PUT /vault/{filename} エンドポイントに対応
 */

/**
 * ファイル作成・更新リクエスト
 */
export interface CreateOrUpdateFileRequest {
  /** ファイルパス（Vaultルートからの相対パス） */
  filename: string;
  /** ファイルの内容 */
  content: string;
}

/**
 * ファイル作成・更新レスポンス
 */
export interface CreateOrUpdateFileResponse {
  /** ファイルが新規作成されたかどうか */
  created: boolean;
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