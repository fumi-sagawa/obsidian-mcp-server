import { z } from 'zod';

/**
 * delete_active_file ツールの入力スキーマ
 * このツールはパラメータを受け取らない
 */
export const deleteActiveFileSchema = z.object({});

/**
 * delete_active_file ツールのレスポンススキーマ
 */
export const deleteActiveFileResponseSchema = z.object({
  message: z.string(),
});