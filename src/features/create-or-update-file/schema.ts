import { z } from 'zod';

/**
 * create-or-update-file ツールの入力スキーマ
 */
export const createOrUpdateFileSchema = z.object({
  /** ファイルパス（Vaultルートからの相対パス） */
  filename: z.string().min(1, 'Filename is required'),
  /** ファイルの内容 */
  content: z.string(),
});