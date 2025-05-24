import { z } from 'zod';

/**
 * JsonLogicクエリの基本的なバリデーション
 */
function validateJsonLogicString(value: string): boolean {
  try {
    const parsed = JSON.parse(value);
    
    // 基本的なオブジェクト形式のチェック
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return false;
    }
    
    // 少なくとも1つのキーを持つことを確認
    if (Object.keys(parsed).length === 0) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * search_notes ツールの入力スキーマ
 */
export const searchNotesSchema = z.object({
  jsonLogicQuery: z.string()
    .min(1, 'JsonLogicクエリは空文字列にできません')
    .refine(
      validateJsonLogicString,
      {
        message: 'JsonLogicクエリは有効なJSONオブジェクトである必要があります'
      }
    )
    .describe(
      'JsonLogicクエリ（JSON文字列）。Obsidianノートのメタデータ（path, content, frontmatter, tags, stat）に対して論理演算、glob、regexpなどを使用して検索条件を指定します。例: {"in": ["project", {"var": "tags"}]}'
    ),
});

/**
 * MCPツール定義
 */
export const searchNotesTool = {
  name: 'search_notes',
  description: `
Obsidianノートに対してJsonLogicクエリ（JSON文字列）による高度な検索を実行します。

このツールは以下の機能を提供します：
- タグによる検索: '{"in": ["tagName", {"var": "tags"}]}'
- フロントマターフィールドによる検索: '{"==": [{"var": "frontmatter.fieldName"}, "value"]}'
- ファイルパスのglob検索: '{"glob": ["*.md", {"var": "path"}]}'
- 正規表現検索: '{"regexp": ["pattern", {"var": "content"}]}'
- 論理演算子の組み合わせ: '{"and": [...]}' '{"or": [...]}'
- 比較演算子: {"==", "!=", ">", "<", ">=", "<="}

利用可能なフィールド：
- path: ファイルパス
- content: ファイル内容  
- frontmatter: フロントマターオブジェクト
- tags: タグ配列
- stat.ctime, stat.mtime, stat.size: ファイル統計情報

サンプルクエリ：
- タグ検索: '{"in": ["project", {"var": "tags"}]}'
- 複合条件: '{"and": [{"in": ["project", {"var": "tags"}]}, {"glob": ["2024*.md", {"var": "path"}]}]}'
- 日付範囲: '{"and": [{">": [{"var": "stat.mtime"}, 1704067200000]}, {"<": [{"var": "stat.mtime"}, 1735689600000]}]}'
`,
  inputSchema: searchNotesSchema,
};

export type SearchNotesArgs = z.infer<typeof searchNotesSchema>;