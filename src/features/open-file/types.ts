/**
 * open-file ツールの型定義
 * Obsidian Local REST API の /open/{filename} エンドポイントに対応
 */

/**
 * ファイルを開くリクエストの型
 */
export interface OpenFileRequest {
  /** 開くファイルのパス（Vaultルートからの相対パス） */
  filename: string;
  /** 新しいリーフとして開くか（オプション） */
  newLeaf?: boolean;
}

/**
 * ファイルを開いた結果のレスポンス型
 */
export interface OpenFileResponse {
  /** 操作の成功可否 */
  success: boolean;
  /** メッセージ（成功時または失敗時の詳細） */
  message: string;
  /** 開いたファイルのパス */
  filename?: string;
}

/**
 * エラーレスポンスの型
 */
export interface OpenFileErrorResponse {
  /** エラーメッセージ */
  error: string;
  /** エラーコード */
  code: string;
}