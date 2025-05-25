import { describe, it, expect, vi, beforeEach } from 'vitest';
import { insertIntoFileHandler } from '../insert-into-file-handler';
import type { InsertIntoFileParams } from '../types';
import { ObsidianAPIClient } from '../../../shared/api/obsidian';

vi.mock('../../../shared/api/obsidian', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('insertIntoFileHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      patchFile: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  describe('見出しへの操作', () => {
    it('見出しの下にコンテンツを追加（append）', async () => {
      const params: InsertIntoFileParams = {
        filename: 'test-note.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Heading 1::Subheading 1:1',
        content: 'New content after the heading'
      };

      mockClient.patchFile.mockResolvedValue();

      const result = await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'test-note.md',
        {
          'Operation': 'append',
          'Target-Type': 'heading',
          'Target': 'Heading 1::Subheading 1:1',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'false',
          'Content-Type': 'text/markdown'
        },
        'New content after the heading'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully appended to heading: Heading 1::Subheading 1:1 in file: test-note.md'
          }
        ]
      });
    });

    it('見出しの前にコンテンツを追加（prepend）', async () => {
      const params: InsertIntoFileParams = {
        filename: 'notes/my-note.md',
        operation: 'prepend',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content before the heading'
      };

      mockClient.patchFile.mockResolvedValue();

      const result = await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'notes/my-note.md',
        {
          'Operation': 'prepend',
          'Target-Type': 'heading',
          'Target': 'My Heading',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'false',
          'Content-Type': 'text/markdown'
        },
        'Content before the heading'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully prepended to heading: My Heading in file: notes/my-note.md'
          }
        ]
      });
    });

    it('見出しのコンテンツを置換（replace）', async () => {
      const params: InsertIntoFileParams = {
        filename: 'documents/important.md',
        operation: 'replace',
        targetType: 'heading',
        target: 'Old Heading',
        content: 'Completely new content',
        trimTargetWhitespace: true
      };

      mockClient.patchFile.mockResolvedValue();

      const result = await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'documents/important.md',
        {
          'Operation': 'replace',
          'Target-Type': 'heading',
          'Target': 'Old Heading',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'true',
          'Content-Type': 'text/markdown'
        },
        'Completely new content'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully replaced in heading: Old Heading in file: documents/important.md'
          }
        ]
      });
    });

    it('カスタム区切り文字を使用', async () => {
      const params: InsertIntoFileParams = {
        filename: 'hierarchical-notes.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Parent/Child/Grandchild',
        content: 'Content with custom delimiter',
        targetDelimiter: '/'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'hierarchical-notes.md',
        expect.objectContaining({
          'Target-Delimiter': '/'
        }),
        'Content with custom delimiter'
      );
    });
  });

  describe('ブロック参照への操作', () => {
    it('ブロック参照の下にコンテンツを追加', async () => {
      const params: InsertIntoFileParams = {
        filename: 'research-notes.md',
        operation: 'append',
        targetType: 'block',
        target: '2d9b4a',
        content: 'Content after block reference'
      };

      mockClient.patchFile.mockResolvedValue();

      const result = await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'research-notes.md',
        {
          'Operation': 'append',
          'Target-Type': 'block',
          'Target': '2d9b4a',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'false',
          'Content-Type': 'text/markdown'
        },
        'Content after block reference'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully appended to block: 2d9b4a in file: research-notes.md'
          }
        ]
      });
    });

    it('テーブルに行を追加（JSON形式）', async () => {
      const params: InsertIntoFileParams = {
        filename: 'data/cities.md',
        operation: 'append',
        targetType: 'block',
        target: '2c7cfa',
        content: '[["Chicago, IL", "16"]]',
        contentType: 'application/json'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'data/cities.md',
        expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        '[["Chicago, IL", "16"]]'
      );
    });
  });

  describe('frontmatterへの操作', () => {
    it('frontmatterフィールドを更新', async () => {
      const params: InsertIntoFileParams = {
        filename: 'blog/article.md',
        operation: 'replace',
        targetType: 'frontmatter',
        target: 'title',
        content: 'New Article Title'
      };

      mockClient.patchFile.mockResolvedValue();

      const result = await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'blog/article.md',
        {
          'Operation': 'replace',
          'Target-Type': 'frontmatter',
          'Target': 'title',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'false',
          'Content-Type': 'text/markdown'
        },
        'New Article Title'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully replaced in frontmatter: title in file: blog/article.md'
          }
        ]
      });
    });

    it('存在しないfrontmatterフィールドを作成', async () => {
      const params: InsertIntoFileParams = {
        filename: 'templates/note-template.md',
        operation: 'replace',
        targetType: 'frontmatter',
        target: 'newField',
        content: 'New Value',
        createTargetIfMissing: true
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'templates/note-template.md',
        expect.objectContaining({
          'Create-Target-If-Missing': 'true'
        }),
        'New Value'
      );
    });

    it('配列をfrontmatterに追加（JSON形式）', async () => {
      const params: InsertIntoFileParams = {
        filename: 'tags/tagged-note.md',
        operation: 'append',
        targetType: 'frontmatter',
        target: 'tags',
        content: '["new-tag", "another-tag"]',
        contentType: 'application/json'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'tags/tagged-note.md',
        expect.objectContaining({
          'Operation': 'append',
          'Content-Type': 'application/json'
        }),
        '["new-tag", "another-tag"]'
      );
    });
  });

  describe('ファイル名の検証', () => {
    it('拡張子付きファイル名', async () => {
      const params: InsertIntoFileParams = {
        filename: 'my-document.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Test',
        content: 'Content'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'my-document.md',
        expect.any(Object),
        'Content'
      );
    });

    it('拡張子なしファイル名', async () => {
      const params: InsertIntoFileParams = {
        filename: 'my-document',
        operation: 'append',
        targetType: 'heading',
        target: 'Test',
        content: 'Content'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'my-document',
        expect.any(Object),
        'Content'
      );
    });

    it('ネストしたパス', async () => {
      const params: InsertIntoFileParams = {
        filename: 'projects/2024/research/notes.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Research Notes',
        content: 'New findings'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'projects/2024/research/notes.md',
        expect.any(Object),
        'New findings'
      );
    });
  });

  describe('エラーケース', () => {
    it('存在しないファイル', async () => {
      const params: InsertIntoFileParams = {
        filename: 'non-existent-file.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Heading',
        content: 'Content'
      };

      mockClient.patchFile.mockRejectedValue(
        new Error('404: File not found')
      );

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow('404: File not found');
    });

    it('存在しない見出しへの操作', async () => {
      const params: InsertIntoFileParams = {
        filename: 'existing-file.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Non-existent Heading',
        content: 'Some content'
      };

      mockClient.patchFile.mockRejectedValue(
        new Error('Target not found')
      );

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow('Target not found');
    });

    it('無効なoperation', async () => {
      const params = {
        filename: 'test.md',
        operation: 'invalid',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content'
      } as any;

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow();
    });

    it('無効なtargetType', async () => {
      const params = {
        filename: 'test.md',
        operation: 'append',
        targetType: 'invalid',
        target: 'Something',
        content: 'Content'
      } as any;

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow();
    });

    it('空のファイル名', async () => {
      const params: InsertIntoFileParams = {
        filename: '',
        operation: 'append',
        targetType: 'heading',
        target: 'Heading',
        content: 'Content'
      };

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow();
    });

    it('APIエラー時の処理', async () => {
      const params: InsertIntoFileParams = {
        filename: 'test.md',
        operation: 'append',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content'
      };

      mockClient.patchFile.mockRejectedValue(
        new Error('API Error: 400 Bad Request')
      );

      await expect(insertIntoFileHandler(params))
        .rejects.toThrow('API Error: 400 Bad Request');
    });
  });

  describe('特殊文字の処理', () => {
    it('非ASCII文字を含むファイル名とターゲット', async () => {
      const params: InsertIntoFileParams = {
        filename: '日本語のファイル.md',
        operation: 'append',
        targetType: 'heading',
        target: '日本語の見出し',
        content: 'コンテンツ'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        '日本語のファイル.md',
        expect.objectContaining({
          'Target': encodeURIComponent('日本語の見出し')
        }),
        'コンテンツ'
      );
    });

    it('特殊文字を含むターゲット', async () => {
      const params: InsertIntoFileParams = {
        filename: 'special-chars.md',
        operation: 'append',
        targetType: 'heading',
        target: 'Heading with & special < characters >',
        content: 'Content'
      };

      mockClient.patchFile.mockResolvedValue();

      await insertIntoFileHandler(params);

      expect(mockClient.patchFile).toHaveBeenCalledWith(
        'special-chars.md',
        expect.objectContaining({
          'Target': encodeURIComponent('Heading with & special < characters >')
        }),
        'Content'
      );
    });
  });
});