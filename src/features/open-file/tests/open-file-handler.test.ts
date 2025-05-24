import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { OpenFileRequest } from '../types.js';
import { openFileHandler } from '../open-file-handler.js';
import { ObsidianAPIClient } from '../../../shared/api/obsidian/index.js';

// モックのセットアップ
const mockOpenFile = vi.fn();

vi.mock('../../../shared/api/obsidian', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({
    openFile: mockOpenFile
  }))
}));

describe('open-file-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOpenFile.mockReset();
  });

  describe('型定義のテスト', () => {
    it('filenameパラメータが必須であること', async () => {
      // @ts-expect-error - filenameがないとエラーになることを確認
      const invalidRequest: OpenFileRequest = {
        newLeaf: true
      };

      await expect(openFileHandler({})).resolves.toMatchObject({
        content: expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            text: expect.stringContaining("Error")
          })
        ])
      });
    });

    it('有効なリクエスト型が受け入れられること', () => {
      const validRequest: OpenFileRequest = {
        filename: 'notes/test.md',
        newLeaf: false
      };

      expect(validRequest.filename).toBeDefined();
      expect(validRequest.newLeaf).toBeDefined();
    });
  });

  describe('正常系テスト', () => {
    it('存在するファイルを正常に開けること', async () => {
      const request = {
        filename: 'notes/existing-note.md'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      const result = await openFileHandler(request);

      expect(result).toEqual({
        content: [
          {
            type: "text",
            text: 'File "notes/existing-note.md" opened successfully.'
          }
        ]
      });
      expect(mockOpenFile).toHaveBeenCalledWith('notes/existing-note.md', {});
    });

    it('newLeafオプションが正しく渡されること', async () => {
      const request = {
        filename: 'notes/test.md',
        newLeaf: true
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      await openFileHandler(request);

      expect(mockOpenFile).toHaveBeenCalledWith('notes/test.md', { newLeaf: true });
    });
  });

  describe('パステスト', () => {
    it('相対パスが正しく処理されること', async () => {
      const request = {
        filename: 'daily/2024-05-24.md'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      const result = await openFileHandler(request);

      expect(result.content[0].text).toContain('opened successfully');
      expect(mockOpenFile).toHaveBeenCalledWith('daily/2024-05-24.md', {});
    });

    it('サブディレクトリのパスが正しく処理されること', async () => {
      const request = {
        filename: 'projects/web/frontend/index.md'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      const result = await openFileHandler(request);

      expect(result.content[0].text).toContain('opened successfully');
      expect(mockOpenFile).toHaveBeenCalledWith('projects/web/frontend/index.md', {});
    });

    it('特殊文字を含むパスが正しく処理されること', async () => {
      const request = {
        filename: 'notes/テスト ノート (2024).md'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      const result = await openFileHandler(request);

      expect(result.content[0].text).toContain('opened successfully');
      expect(mockOpenFile).toHaveBeenCalledWith('notes/テスト ノート (2024).md', {});
    });

    it('先頭のスラッシュがあるパスが正しく処理されること', async () => {
      const request = {
        filename: '/notes/test.md'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      await openFileHandler(request);

      // 先頭のスラッシュは削除される
      expect(mockOpenFile).toHaveBeenCalledWith('notes/test.md', {});
    });
  });

  describe('エラーテスト', () => {
    it('存在しないファイルのエラーが適切に処理されること', async () => {
      const request = {
        filename: 'notes/non-existent.md'
      };

      const apiError = new Error('File not found');
      (apiError as any).response = {
        status: 404,
        data: { error: 'File not found', code: 'NOT_FOUND' }
      };

      mockOpenFile.mockRejectedValueOnce(apiError);

      const result = await openFileHandler(request);
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('File not found');
    });

    it('無効なファイルパス形式のエラーが処理されること', async () => {
      const request = {
        filename: '../../../etc/passwd'
      };

      const result = await openFileHandler(request);
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('Invalid file path');
    });

    it('空のファイル名がエラーになること', async () => {
      const request = {
        filename: ''
      };

      const result = await openFileHandler(request);
      
      expect(result.content[0].text).toContain('Error');
    });

    it('APIエラーが適切に処理されること', async () => {
      const request = {
        filename: 'notes/test.md'
      };

      const apiError = new Error('API connection failed');
      mockOpenFile.mockRejectedValueOnce(apiError);

      const result = await openFileHandler(request);
      
      expect(result.content[0].text).toContain('Error');
      expect(result.content[0].text).toContain('API connection failed');
    });
  });

  describe('拡張子テスト', () => {
    it('.md以外のファイルも開けること', async () => {
      const extensions = ['.txt', '.csv', '.json', '.yml', '.pdf', '.png'];

      for (const ext of extensions) {
        const request = {
          filename: `files/document${ext}`
        };

        mockOpenFile.mockResolvedValueOnce(undefined);

        const result = await openFileHandler(request);

        expect(result.content[0].text).toContain('opened successfully');
        expect(mockOpenFile).toHaveBeenCalledWith(`files/document${ext}`, {});
      }
    });

    it('拡張子なしのファイルも開けること', async () => {
      const request = {
        filename: 'files/README'
      };

      mockOpenFile.mockResolvedValueOnce(undefined);

      const result = await openFileHandler(request);

      expect(result.content[0].text).toContain('opened successfully');
      expect(mockOpenFile).toHaveBeenCalledWith('files/README', {});
    });
  });
});