import { z } from 'zod';

/**
 * update_active_file ツールの入力スキーマ
 */
export const updateActiveFileSchema = z.object({
  content: z.string().describe('新しいファイル内容'),
});

/**
 * MCPツール定義
 */
export const updateActiveFileTool = {
  name: 'update_active_file',
  description:
    'Obsidianで現在アクティブなファイルの内容を完全に置き換えます。ファイル全体が新しい内容で上書きされます。',
  inputSchema: updateActiveFileSchema,
};