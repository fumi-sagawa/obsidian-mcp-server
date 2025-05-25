import { z } from 'zod';

/**
 * 定期ノートの期間タイプのスキーマ
 */
export const PeriodTypeSchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']);

/**
 * append_to_periodic_noteツールの入力スキーマ
 */
export const AppendToPeriodicNoteInputSchema = z.object({
  period: PeriodTypeSchema,
  content: z.string().min(1, 'Content cannot be empty')
});

/**
 * MCPツール定義
 */
export const appendToPeriodicNoteTool = {
  name: 'append_to_periodic_note',
  description: 'Append content to a periodic note (daily, weekly, monthly, quarterly, or yearly). Creates the note if it doesn\'t exist.',
  inputSchema: AppendToPeriodicNoteInputSchema
};