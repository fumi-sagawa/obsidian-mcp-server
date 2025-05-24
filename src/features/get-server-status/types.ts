/**
 * get_server_status ツールの型定義
 * OpenAPI仕様書に基づいた正確な型定義
 */

/**
 * GET / エンドポイントのレスポンス型
 */
export interface ServerStatusResponse {
  /**
   * 認証状態
   */
  authenticated: boolean;
  
  /**
   * ステータス（固定値 'OK'）
   */
  status: string;
  
  /**
   * サービス名（固定値 'Obsidian Local REST API'）
   */
  service: string;
  
  /**
   * バージョン情報
   */
  versions: {
    /**
     * Obsidian plugin API version
     */
    obsidian: string;
    
    /**
     * Plugin version
     */
    self: string;
  };
  
  /**
   * プラグインマニフェスト情報
   */
  manifest?: {
    id: string;
    name: string;
    version: string;
    minAppVersion: string;
    description: string;
    author: string;
    authorUrl: string;
    isDesktopOnly: boolean;
    dir: string;
  };
  
  /**
   * 証明書情報
   */
  certificateInfo?: {
    validityDays: number;
    regenerateRecommended: boolean;
  };
  
  /**
   * API拡張機能
   */
  apiExtensions?: string[];
}

/**
 * APIエラーレスポンス型
 */
export interface ErrorResponse {
  /**
   * 5桁のエラーコード
   */
  errorCode: number;
  
  /**
   * エラーの説明メッセージ
   */
  message: string;
}

/**
 * MCPツールのレスポンス型
 * （成功時はサーバー状態、エラー時はエラー情報を返す）
 */
export type GetServerStatusResult = {
  success: true;
  data: ServerStatusResponse;
} | {
  success: false;
  error: ErrorResponse;
};