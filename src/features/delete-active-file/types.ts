/**
 * delete_active_file ツールの型定義
 */

/**
 * delete_active_file ツールのリクエストパラメータ
 * このツールはパラメータを受け取らない
 */
export interface DeleteActiveFileParams {
  // パラメータなし
}

/**
 * delete_active_file ツールのレスポンス
 * APIは204 No Contentを返すが、MCPツールとしては成功メッセージを返す
 */
export interface DeleteActiveFileResponse {
  message: string;
}

/**
 * APIからのエラーレスポンス
 */
export interface ErrorResponse {
  errorCode: number;
  message: string;
}