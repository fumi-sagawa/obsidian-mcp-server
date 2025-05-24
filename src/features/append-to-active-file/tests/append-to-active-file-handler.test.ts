import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appendToActiveFileHandler } from '../append-to-active-file-handler.js';
import type { 
  AppendToActiveFileRequest, 
  AppendToActiveFileResponse,
  ObsidianErrorResponse 
} from '../types.js';
import { ObsidianAPIClient } from '../../../shared/api/obsidian/obsidian-api.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';

// loggerのモック
vi.mock('../../../shared/lib/logger/index.js', () => ({
  logger: {
    child: () => ({
      debug: vi.fn(),
      trace: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

// ObsidianAPIClientのモック
vi.mock('../../../shared/api/obsidian/obsidian-api.js', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('appendToActiveFileHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      appendToActiveFile: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  describe('型安全性テスト', () => {
    it('RequestBody型が正しく定義されている', () => {
      const validRequest: AppendToActiveFileRequest = {
        content: 'テストコンテンツ',
      };
      
      expect(validRequest.content).toBe('テストコンテンツ');
    });


    it('ResponseBody型が正しく定義されている', () => {
      const validResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      
      expect(validResponse.message).toBe('Content appended successfully');
    });
  });

  describe('正常系テスト', () => {
    it('テキストを正常に追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const result = await appendToActiveFileHandler(
        { content: '追記するテキスト' }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith('追記するテキスト');
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });

    it('改行を含むテキストを追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const multilineContent = '行1\n行2\n行3';
      const result = await appendToActiveFileHandler(
        { content: multilineContent }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith(multilineContent);
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });

  });

  describe('境界値テスト', () => {
    it('空文字列を追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const result = await appendToActiveFileHandler(
        { content: '' }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith('');
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });

    it('非常に長いテキストを追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const longContent = 'あ'.repeat(10000); // 10,000文字のテキスト
      const result = await appendToActiveFileHandler(
        { content: longContent }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith(longContent);
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });
  });

  describe('エラーテスト', () => {
    it('アクティブファイルが存在しない場合は404エラー', async () => {
      const error = new ApiError('No active file found', ErrorCode.API_NOT_FOUND, 404);
      mockClient.appendToActiveFile.mockRejectedValue(error);

      await expect(
        appendToActiveFileHandler(
          { content: 'テスト' }
        )
      ).rejects.toThrow('アクティブファイルが開かれていません');
    });

    it('サーバーエラーの場合は適切なエラーメッセージ', async () => {
      const error = new ApiError('Internal server error', ErrorCode.API_REQUEST_FAILED, 500);
      mockClient.appendToActiveFile.mockRejectedValue(error);

      await expect(
        appendToActiveFileHandler(
          { content: 'テスト' }
        )
      ).rejects.toThrow('アクティブファイルへの追記に失敗しました');
    });

    it('ネットワークエラーの場合', async () => {
      mockClient.appendToActiveFile.mockRejectedValue(new Error('Network error'));

      await expect(
        appendToActiveFileHandler(
          { content: 'テスト' }
        )
      ).rejects.toThrow('アクティブファイルへの追記に失敗しました: Network error');
    });
  });

  describe('日本語テスト', () => {
    it('日本語テキストを正常に追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const japaneseContent = '日本語のテキスト\n絵文字も対応😊\n漢字・ひらがな・カタカナ';
      const result = await appendToActiveFileHandler(
        { content: japaneseContent }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith(japaneseContent);
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });

    it('特殊文字を含むテキストを追記できる', async () => {
      const mockResponse: AppendToActiveFileResponse = {
        message: 'Content appended successfully',
      };
      mockClient.appendToActiveFile.mockResolvedValue(mockResponse);

      const specialChars = '特殊文字テスト: 〜「」『』【】（）！？＃＄％＆';
      const result = await appendToActiveFileHandler(
        { content: specialChars }
      );

      expect(mockClient.appendToActiveFile).toHaveBeenCalledWith(specialChars);
      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'アクティブファイルにコンテンツを追記しました。',
          },
        ],
      });
    });
  });
});