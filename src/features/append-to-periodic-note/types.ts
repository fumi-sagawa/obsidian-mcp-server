/**
 * 定期ノート追記機能の型定義
 */

/**
 * 定期ノートの期間タイプ
 */
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * append_to_periodic_noteツールの入力パラメータ
 */
export interface AppendToPeriodicNoteInput {
  /** 定期ノートの期間タイプ */
  period: PeriodType;
  /** 追記するコンテンツ */
  content: string;
}

/**
 * append_to_periodic_noteツールのレスポンス
 */
export interface AppendToPeriodicNoteResponse {
  /** 成功フラグ */
  success: boolean;
  /** 追記された定期ノートのパス */
  path?: string;
  /** エラーメッセージ（エラー時のみ） */
  error?: string;
}

/**
 * Obsidian APIエラーレスポンス
 */
export interface ObsidianErrorResponse {
  error: string;
  errorCode?: number;
}