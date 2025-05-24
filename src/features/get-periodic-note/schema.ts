import { z } from 'zod';

/**
 * 定期ノート期間タイプのZodスキーマ
 * API仕様の period パラメータの列挙値に対応
 */
export const periodTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

/**
 * 定期ノート取得入力のZodスキーマ
 */
export const getPeriodicNoteSchema = z.object({
  period: periodTypeSchema
});