import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getFileHandler } from '../get-file-handler.js';
import { obsidianApi } from '../../../shared/api/obsidian/index.js';

vi.mock('../../../shared/api/obsidian/index.js');

const mockObsidianApi = vi.mocked(obsidianApi);

describe('get-file-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系テスト', () => {
    it('.mdファイルの内容を取得できる', async () => {
      const mockRequest = {
        filename: 'test.md'
      };

      const mockResponse = {
        content: '# テストドキュメント\n\nこれはテストです。'
      };

      mockObsidianApi.getFile = vi.fn().mockResolvedValue(mockResponse);

      const result = await getFileHandler(mockRequest);

      expect(mockObsidianApi.getFile).toHaveBeenCalledWith('test.md');
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.content).toBe('# テストドキュメント\n\nこれはテストです。');
      expect(parsedContent.path).toBe('test.md');
    });

    it('UTF-8日本語コンテンツを正しく取得できる', async () => {
      const mockRequest = {
        filename: 'japanese-note.md'
      };

      const mockResponse = {
        content: '# 日本語テスト\n\nこれは日本語のテストです。\n絵文字も使えます 🎉'
      };

      mockObsidianApi.getFile = vi.fn().mockResolvedValue(mockResponse);

      const result = await getFileHandler(mockRequest);

      const parsedContent = JSON.parse(result.content[0].text);
      expect(parsedContent.content).toBe('# 日本語テスト\n\nこれは日本語のテストです。\n絵文字も使えます 🎉');
    });
  });

  describe('エラーテスト', () => {
    it('存在しないファイルの場合はエラーをスローする', async () => {
      const mockRequest = {
        filename: 'non-existent.md'
      };

      mockObsidianApi.getFile = vi.fn().mockRejectedValue(
        new Error('ファイルが見つかりません')
      );

      await expect(getFileHandler(mockRequest)).rejects.toThrow('ファイルが見つかりません');
      expect(mockObsidianApi.getFile).toHaveBeenCalledWith('non-existent.md');
    });

    it('空のファイル名の場合はバリデーションエラーとなる', async () => {
      const mockRequest = {
        filename: ''
      };

      await expect(getFileHandler(mockRequest)).rejects.toThrow();
    });
  });
});