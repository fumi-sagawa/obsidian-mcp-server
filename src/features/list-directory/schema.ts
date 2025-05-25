import { z } from 'zod';

/**
 * list-directory ツールの入力スキーマ
 */
export const listDirectorySchema = z.object({
  /** ディレクトリパス（vault root からの相対パス、空文字列の場合はルートディレクトリ）*/
  pathToDirectory: z
    .string()
    // 空文字列も許可（ルートディレクトリの場合）
    .optional()
    .default('')
    // パストラバーサル攻撃防止の基本的なバリデーション
    .refine(
      (path) => !path.includes('..'),
      'Path traversal not allowed'
    )
    // 先頭のスラッシュは除去（相対パスのため）
    .transform((path) => path.replace(/^\//, ''))
    // Windows形式のパス区切り文字を正規化
    .transform((path) => path.replace(/\\/g, '/'))
});

export type ListDirectoryInput = z.infer<typeof listDirectorySchema>;