/**
 * delete_periodic_note ツールの型定義
 */

/**
 * 期間の種類
 */
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * delete_periodic_note ツールのリクエストパラメータ
 */
export interface DeletePeriodicNoteParams {
  /** 削除する定期ノートの期間 */
  period: PeriodType;
}

/**
 * delete_periodic_note ツールのレスポンス
 * APIは204 No Contentを返すが、MCPツールとしては成功メッセージを返す
 */
export interface DeletePeriodicNoteResponse {
  message: string;
}

/**
 * APIからのエラーレスポンス
 */
export interface ErrorResponse {
  errorCode: number;
  message: string;
}