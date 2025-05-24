import { z } from 'zod';

/**
 * open-file ツールの入力スキーマ
 */
export const openFileSchema = z.object({
  /** ファイルパス（必須） */
  filename: z.string().min(1, 'Filename is required'),
  
  /** 新しいリーフとして開くか（オプション） */
  newLeaf: z.boolean().optional()
});