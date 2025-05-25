import { z } from 'zod';

/**
 * delete_periodic_note ツールのZodスキーマ定義
 */

/**
 * 期間の種類のZodスキーマ
 */
export const PeriodTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
  description: '削除する定期ノートの期間',
});

/**
 * delete_periodic_note ツールのパラメータスキーマ
 */
export const DeletePeriodicNoteParamsSchema = z.object({
  period: PeriodTypeSchema,
}, {
  description: 'delete_periodic_note ツールのパラメータ',
});

/**
 * delete_periodic_note ツールの設定
 */
export const deletePeriodicNoteToolConfig = {
  name: 'delete-periodic-note',
  description: '指定された期間の定期ノート（日次・週次・月次・四半期・年次ノート）を削除します',
  inputSchema: DeletePeriodicNoteParamsSchema,
} as const;