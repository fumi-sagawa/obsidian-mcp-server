/**
 * Vault内のアイテム（ファイルまたはディレクトリ）を表す型
 */
export interface VaultItem {
  /** アイテムの名前（ディレクトリの場合は末尾に/が付く） */
  name: string;
  /** アイテムのタイプ */
  type: 'file' | 'directory';
}

/**
 * /vault/ エンドポイントのレスポンス型
 * APIの仕様に準拠し、files配列を含む
 */
export interface VaultFileListResponse {
  /** Vaultルートディレクトリのファイル一覧 */
  files: string[];
}

/**
 * ハンドラー用のパラメータ型
 * /vault/ エンドポイントは引数を取らない
 */
export interface ListVaultFilesParams {
  // パラメータなし
}

/**
 * MCP用にフォーマットされたレスポンス型
 */
export interface ListVaultFilesResult {
  /** フォーマットされたファイル一覧 */
  content: string;
  /** 処理されたアイテム（内部処理用） */
  items: VaultItem[];
}