import { describe, it, expect, vi, beforeEach } from 'vitest';
import { insertIntoActiveFileHandler } from '../insert-into-active-file-handler';
import type { InsertIntoActiveFileParams } from '../types';
import { ObsidianAPIClient } from '../../../shared/api/obsidian';

vi.mock('../../../shared/api/obsidian', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('insertIntoActiveFileHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      patchActiveFile: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  describe('見出しへの操作', () => {
    it('見出しの下にコンテンツを追加（append）', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: 'Heading 1::Subheading 1:1',
        content: 'New content after the heading'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      const result = await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
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
            text: 'Content successfully appended to heading: Heading 1::Subheading 1:1'
          }
        ]
      });
    });

    it('見出しの前にコンテンツを追加（prepend）', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'prepend',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content before the heading'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      const result = await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
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
            text: 'Content successfully prepended to heading: My Heading'
          }
        ]
      });
    });

    it('見出しのコンテンツを置換（replace）', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'replace',
        targetType: 'heading',
        target: 'Old Heading',
        content: 'Completely new content',
        trimTargetWhitespace: true
      };

      mockClient.patchActiveFile.mockResolvedValue();

      const result = await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
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
    });

    it('カスタム区切り文字を使用', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: 'Parent/Child/Grandchild',
        content: 'Content with custom delimiter',
        targetDelimiter: '/'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Target-Delimiter': '/'
        }),
        'Content with custom delimiter'
      );
    });
  });

  describe('ブロック参照への操作', () => {
    it('ブロック参照の下にコンテンツを追加', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'block',
        target: '2d9b4a',
        content: 'Content after block reference'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      const result = await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
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
            text: 'Content successfully appended to block: 2d9b4a'
          }
        ]
      });
    });

    it('テーブルに行を追加（JSON形式）', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'block',
        target: '2c7cfa',
        content: '[["Chicago, IL", "16"]]',
        contentType: 'application/json'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Content-Type': 'application/json'
        }),
        '[["Chicago, IL", "16"]]'
      );
    });
  });

  describe('frontmatterへの操作', () => {
    it('frontmatterフィールドを更新', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'replace',
        targetType: 'frontmatter',
        target: 'title',
        content: 'New Title'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      const result = await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        {
          'Operation': 'replace',
          'Target-Type': 'frontmatter',
          'Target': 'title',
          'Target-Delimiter': '::',
          'Trim-Target-Whitespace': 'false',
          'Content-Type': 'text/markdown'
        },
        'New Title'
      );

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Content successfully replaced in frontmatter: title'
          }
        ]
      });
    });

    it('存在しないfrontmatterフィールドを作成', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'replace',
        targetType: 'frontmatter',
        target: 'newField',
        content: 'New Value',
        createTargetIfMissing: true
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Create-Target-If-Missing': 'true'
        }),
        'New Value'
      );
    });

    it('配列をfrontmatterに追加（JSON形式）', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'frontmatter',
        target: 'tags',
        content: '["new-tag", "another-tag"]',
        contentType: 'application/json'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Operation': 'append',
          'Content-Type': 'application/json'
        }),
        '["new-tag", "another-tag"]'
      );
    });
  });

  describe('エラーケース', () => {
    it('存在しない見出しへの操作', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: 'Non-existent Heading',
        content: 'Some content'
      };

      mockClient.patchActiveFile.mockRejectedValue(
        new Error('Target not found')
      );

      await expect(insertIntoActiveFileHandler(params))
        .rejects.toThrow('Target not found');
    });

    it('無効なoperation', async () => {
      const params = {
        operation: 'invalid',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content'
      } as any;

      await expect(insertIntoActiveFileHandler(params))
        .rejects.toThrow();
    });

    it('無効なtargetType', async () => {
      const params = {
        operation: 'append',
        targetType: 'invalid',
        target: 'Something',
        content: 'Content'
      } as any;

      await expect(insertIntoActiveFileHandler(params))
        .rejects.toThrow();
    });

    it('APIエラー時の処理', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: 'My Heading',
        content: 'Content'
      };

      mockClient.patchActiveFile.mockRejectedValue(
        new Error('API Error: 400 Bad Request')
      );

      await expect(insertIntoActiveFileHandler(params))
        .rejects.toThrow('API Error: 400 Bad Request');
    });
  });

  describe('特殊文字の処理', () => {
    it('非ASCII文字を含むターゲット', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: '日本語の見出し',
        content: 'コンテンツ'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Target': encodeURIComponent('日本語の見出し')
        }),
        'コンテンツ'
      );
    });

    it('特殊文字を含むターゲット', async () => {
      const params: InsertIntoActiveFileParams = {
        operation: 'append',
        targetType: 'heading',
        target: 'Heading with & special < characters >',
        content: 'Content'
      };

      mockClient.patchActiveFile.mockResolvedValue();

      await insertIntoActiveFileHandler(params);

      expect(mockClient.patchActiveFile).toHaveBeenCalledWith(
        expect.objectContaining({
          'Target': encodeURIComponent('Heading with & special < characters >')
        }),
        'Content'
      );
    });
  });
});