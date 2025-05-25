import { z } from 'zod';

/**
 * delete-file ツールの入力スキーマ
 */
export const deleteFileSchema = z.object({
  /** ファイルパス（Vaultルートからの相対パス） */
  filename: z.string().min(1, 'Filename is required'),
});