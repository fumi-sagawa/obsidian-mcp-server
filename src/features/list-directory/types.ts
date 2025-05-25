/**
 * リクエストパラメータの型定義
 */
export interface ListDirectoryRequest {
  /** ディレクトリのパス（vault root からの相対パス） */
  pathToDirectory: string;
}

/**
 * API レスポンスの型定義
 * OpenAPI仕様 GET /vault/{pathToDirectory}/ に基づく
 */
export interface ListDirectoryResponse {
  /** ファイル・ディレクトリ一覧（ディレクトリは末尾に "/" が付く） */
  files: string[];
}

/**
 * フォーマット済みレスポンスの型定義
 */
export interface ListDirectoryFormattedResponse {
  /** ディレクトリパス */
  directory: string;
  /** ファイル一覧 */
  files: string[];
  /** ディレクトリ一覧 */
  directories: string[];
  /** 合計アイテム数 */
  totalItems: number;
}

/**
 * ハンドラーの依存関係の型定義
 */
export interface HandlerDependencies {
  obsidianApi: {
    listDirectory: (pathToDirectory: string) => Promise<ListDirectoryResponse>;
  };
  logger: {
    debug: (message: string, context?: unknown) => void;
    error: (message: string, error: unknown) => void;
  };
}

/**
 * APIエラーレスポンスの型定義
 */
export interface ErrorResponse {
  errorCode: number;
  message: string;
}