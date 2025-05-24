import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchNotesCore } from '../search-notes-handler.js';
import type { 
  SearchNotesRequest, 
  SearchNotesResponse
} from '../types.js';

// fetchのモック
global.fetch = vi.fn();

// configのモック
vi.mock('../../../shared/config/index.js', () => ({
  getConfig: () => ({
    obsidianApiUrl: 'http://127.0.0.1:27123',
    obsidianApiKey: 'test-api-key',
    apiTimeout: 30000
  })
}));

// ObsidianAPIClientのモック
vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({}))
}));

describe('search_notes', () => {
  const mockFetch = global.fetch as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系テスト', () => {
    it('タグ検索クエリで正常に結果を取得できる', async () => {
      const tagSearchQueryString = '{"in": ["project", {"var": "tags"}]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: tagSearchQueryString
      };

      const mockResponse: SearchNotesResponse = [
        {
          filename: "notes/project-plan.md",
          result: true
        },
        {
          filename: "notes/project-ideas.md", 
          result: true
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await searchNotesCore(mockRequest);

      expect(result).toEqual({
        success: true,
        data: mockResponse
      });
      
      // fetchが呼ばれたことを確認（詳細なパラメータチェックより実用性を重視）
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const fetchCall = mockFetch.mock.calls[0];
      expect(fetchCall[0]).toBe('http://127.0.0.1:27123/search/');
      expect(fetchCall[1].method).toBe('POST');
      expect(fetchCall[1].headers['Content-Type']).toBe('application/vnd.olrapi.jsonlogic+json');
      // JSON.stringifyによる空白の違いは許容
      expect(JSON.parse(fetchCall[1].body)).toEqual(JSON.parse(tagSearchQueryString));
    });

    it('検索結果が空の場合も正常に処理できる', async () => {
      const queryString = '{"in": ["nonexistent-tag", {"var": "tags"}]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: queryString
      };

      const mockResponse: SearchNotesResponse = [];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      });

      const result = await searchNotesCore(mockRequest);

      expect(result).toEqual({
        success: true,
        data: []
      });
    });
  });

  describe('エラーケーステスト', () => {
    it('JSON解析エラーの場合は適切なエラーを返す', async () => {
      const invalidQueryString = '{"invalid": json}'; // 無効なJSON

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: invalidQueryString
      };

      const result = await searchNotesCore(mockRequest);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorCode).toBe(40001);
        expect(result.error.message).toContain('Invalid JsonLogic query format');
      }
    });

    it('APIエラー400の場合は適切なエラーを返す', async () => {
      const validQueryString = '{"==": ["test", "value"]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: validQueryString
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: async () => 'Bad Request',
      });

      const result = await searchNotesCore(mockRequest);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorCode).toBe(400);
      }
    });

    it('APIエラー401の場合は適切なエラーを返す', async () => {
      const queryString = '{"in": ["test", {"var": "tags"}]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: queryString
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: async () => 'Unauthorized',
      });

      const result = await searchNotesCore(mockRequest);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errorCode).toBe(401);
      }
    });

    it('ネットワークエラー時は適切なエラーメッセージを返す', async () => {
      const queryString = '{"in": ["test", {"var": "tags"}]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: queryString
      };

      mockFetch.mockRejectedValueOnce(new Error('Network connection failed'));

      const result = await searchNotesCore(mockRequest);

      expect(result).toEqual({
        success: false,
        error: {
          errorCode: 50001,
          message: 'Connection refused'
        }
      });
    });

    it('予期しないレスポンス形式の場合はエラーを返す', async () => {
      const queryString = '{"in": ["test", {"var": "tags"}]}';

      const mockRequest: SearchNotesRequest = {
        jsonLogicQuery: queryString
      };

      // 不正な形式のレスポンス
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ invalid: 'response' }),
      });

      const result = await searchNotesCore(mockRequest);

      expect(result).toEqual({
        success: false,
        error: {
          errorCode: 50003,
          message: 'Invalid response format'
        }
      });
    });
  });
});