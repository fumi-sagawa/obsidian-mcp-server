import { z } from 'zod';

/**
 * append_to_active_fileツールの入力スキーマ
 */
export const appendToActiveFileSchema = z.object({
  content: z.string().describe('追記するコンテンツ'),
});