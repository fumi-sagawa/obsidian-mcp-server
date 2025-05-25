import { z } from 'zod';

/**
 * append_to_fileツールのZodスキーマ定義
 */

/**
 * append_to_fileのリクエストスキーマ
 */
export const appendToFileRequestSchema = z.object({
  filename: z.string().min(1, 'ファイル名は必須です'),
  content: z.string() // 空文字も許可
});