/**
 * Periodic Note取得機能の型定義
 * OpenAPI仕様書の /periodic/{period}/ エンドポイントに準拠
 */

/**
 * 定期ノートの期間タイプ
 * API仕様の period パラメータの列挙値に対応
 */
export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * 定期ノート取得レスポンス
 * API仕様の NoteJson スキーマに準拠
 */
export interface GetPeriodicNoteResponse {
  content: string;
  frontmatter: Record<string, unknown>;
  path: string;
  stat: {
    ctime: number;
    mtime: number;
    size: number;
  };
  tags: string[];
}

/**
 * 定期ノート取得の入力パラメータ
 */
export interface GetPeriodicNoteInput {
  period: PeriodType;
}

export interface HandlerDependencies {
  obsidianApi: {
    getPeriodicNote: (period: PeriodType) => Promise<GetPeriodicNoteResponse>;
  };
  logger: {
    debug: (message: string, context?: unknown) => void;
    error: (message: string, error: unknown) => void;
  };
}