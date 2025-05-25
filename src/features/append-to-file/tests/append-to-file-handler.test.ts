import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appendToFileHandler } from '../append-to-file-handler.js';
import type { AppendToFileRequest, AppendToFileResponse } from '../types.js';
import { ApiError } from '../../../shared/lib/errors/index.js';

vi.mock('../../../shared/api/obsidian/obsidian-api.js');

describe('appendToFileHandler', () => {
  let mockObsidianApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await import('../../../shared/api/obsidian/obsidian-api.js');
    mockObsidianApi = vi.mocked(module).ObsidianAPIClient;
  });

  describe('型定義テスト', () => {
    it('必須パラメータが正しく定義されている', () => {
      const request: AppendToFileRequest = {
        filename: 'test.md',
        content: 'テスト内容'
      };
      expect(request.filename).toBeDefined();
      expect(request.content).toBeDefined();
    });

    it('レスポンス型が正しく定義されている', () => {
      const response: AppendToFileResponse = {
        success: true,
        message: 'コンテンツを追記しました'
      };
      expect(response.success).toBeDefined();
      expect(response.message).toBeDefined();
    });
  });

  describe('正常系テスト', () => {
    it('既存ファイルへの追記が成功する', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: 'notes/daily/2024-05-24.md',
        content: '\n## 新しいセクション\n追記内容'
      };

      const result = await appendToFileHandler(request);

      expect(mockInstance.appendToFile).toHaveBeenCalledWith(
        'notes/daily/2024-05-24.md',
        '\n## 新しいセクション\n追記内容'
      );
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'ファイル "notes/daily/2024-05-24.md" に内容を追記しました'
        }]
      });
    });

    it('新規ファイルテスト：存在しないファイルへの追記で新規作成される', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: 'new-file.md',
        content: '# 新規ファイル\n初期コンテンツ'
      };

      const result = await appendToFileHandler(request);

      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'ファイル "new-file.md" に内容を追記しました'
        }]
      });
    });

    it('改行テスト：追記時の改行処理が正しく動作する', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const testCases = [
        { content: 'テキスト', description: '改行なし' },
        { content: '\nテキスト', description: '先頭改行あり' },
        { content: 'テキスト\n', description: '末尾改行あり' },
        { content: '\nテキスト\n', description: '両端改行あり' }
      ];

      for (const testCase of testCases) {
        const request: AppendToFileRequest = {
          filename: 'test.md',
          content: testCase.content
        };

        await appendToFileHandler(request);

        expect(mockInstance.appendToFile).toHaveBeenCalledWith(
          'test.md',
          testCase.content
        );
      }
    });
  });

  describe('境界値テスト', () => {
    it('空文字テスト：空のコンテンツ追記が成功する', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: 'test.md',
        content: ''
      };

      const result = await appendToFileHandler(request);

      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'ファイル "test.md" に内容を追記しました'
        }]
      });
    });

    it('非常に長いテキストの追記が成功する', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const longContent = 'A'.repeat(10000);
      const request: AppendToFileRequest = {
        filename: 'large-file.md',
        content: longContent
      };

      const result = await appendToFileHandler(request);

      expect(mockInstance.appendToFile).toHaveBeenCalledWith(
        'large-file.md',
        longContent
      );
      expect(result.content[0].text).toContain('追記しました');
    });
  });

  describe('エラーテスト', () => {
    it('無効なファイルパスの場合エラーを返す', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockRejectedValue(new ApiError(
          'Bad Request',
          'API_REQUEST_FAILED',
          400
        ))
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: '../invalid/path.md',
        content: 'テスト'
      };

      await expect(appendToFileHandler(request)).rejects.toThrow('ファイルへの追記に失敗しました: Bad Request');
    });

    it('APIエラー時は適切なエラーメッセージを返す', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockRejectedValue(new ApiError(
          'Internal Server Error',
          'API_REQUEST_FAILED',
          500
        ))
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: 'test.md',
        content: 'テスト'
      };

      await expect(appendToFileHandler(request)).rejects.toThrow('ファイルへの追記に失敗しました: Internal Server Error');
    });

    it('ネットワークエラー時は適切なエラーメッセージを返す', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockRejectedValue(new Error('Network Error'))
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: 'test.md',
        content: 'テスト'
      };

      await expect(appendToFileHandler(request)).rejects.toThrow('ファイルへの追記に失敗しました: Network Error');
    });

    it('拡張子なしのファイル名の場合エラーを返す', async () => {
      const request: AppendToFileRequest = {
        filename: 'test-without-extension',
        content: 'テストコンテンツ'
      };

      await expect(appendToFileHandler(request)).rejects.toThrow('ファイル名には拡張子を含める必要があります');
    });
  });

  describe('日本語テスト', () => {
    it('マルチバイト文字の追記が正しく処理される', async () => {
      const mockInstance = {
        appendToFile: vi.fn().mockResolvedValue(undefined)
      };
      mockObsidianApi.prototype.constructor = vi.fn().mockReturnValue(mockInstance);
      mockObsidianApi.prototype.appendToFile = mockInstance.appendToFile;

      const request: AppendToFileRequest = {
        filename: '日本語ファイル名.md',
        content: '## 日本語の見出し\n\nこれは日本語のコンテンツです。\n絵文字も含みます: 😊 🎉 🌸'
      };

      const result = await appendToFileHandler(request);

      expect(mockInstance.appendToFile).toHaveBeenCalledWith(
        '日本語ファイル名.md',
        '## 日本語の見出し\n\nこれは日本語のコンテンツです。\n絵文字も含みます: 😊 🎉 🌸'
      );
      expect(result).toEqual({
        content: [{
          type: 'text',
          text: 'ファイル "日本語ファイル名.md" に内容を追記しました'
        }]
      });
    });
  });
});