import { describe, it, expect, vi, beforeEach } from 'vitest';
import { simpleSearchHandler } from '../simple-search-handler.js';
import { obsidianApi } from '../../../shared/api/obsidian/index.js';
import type { SimpleSearchResponse, SearchResult } from '../types.js';
import { ValidationError, ApiError } from '../../../shared/lib/errors/index.js';

// Obsidian APIのモック
vi.mock('../../../shared/api/obsidian/index.js', () => ({
  obsidianApi: {
    searchSimple: vi.fn(),
  },
}));

describe('simple_search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('型テスト：必須パラメータqueryの検証', () => {
    it('queryが未指定の場合はエラーになる', async () => {
      await expect(simpleSearchHandler({})).rejects.toThrow(ValidationError);
    });

    it('queryが空文字の場合はエラーになる', async () => {
      await expect(simpleSearchHandler({ query: '' })).rejects.toThrow(ValidationError);
    });

    it('contextLengthが負の数の場合はエラーになる', async () => {
      await expect(simpleSearchHandler({ query: 'test', contextLength: -1 })).rejects.toThrow(ValidationError);
    });

    it('contextLengthが小数の場合はエラーになる', async () => {
      await expect(simpleSearchHandler({ query: 'test', contextLength: 10.5 })).rejects.toThrow(ValidationError);
    });
  });

  describe('正常系テスト：基本的なキーワード検索', () => {
    it('単一のキーワードで検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/daily/2024-01-20.md',
          matches: [
            {
              match: { start: 10, end: 14 },
              context: 'This is a test document with some content',
            },
          ],
          score: 0.95,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: 'test' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/daily/2024-01-20.md');
      expect(obsidianApi.searchSimple).toHaveBeenCalledWith('test', undefined);
    });

    it('複数の結果を正しく返す', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/projects/todo.md',
          matches: [
            {
              match: { start: 0, end: 7 },
              context: 'Project planning document',
            },
            {
              match: { start: 50, end: 57 },
              context: 'Another project reference here',
            },
          ],
          score: 0.98,
        },
        {
          filename: 'notes/ideas.md',
          matches: [
            {
              match: { start: 20, end: 27 },
              context: 'Ideas for new project features',
            },
          ],
          score: 0.85,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: 'project' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('2件のファイルが見つかりました');
      expect(response.content[0].text).toContain('notes/projects/todo.md');
      expect(response.content[0].text).toContain('notes/ideas.md');
    });

    it('contextLengthを指定して検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/test.md',
          matches: [
            {
              match: { start: 0, end: 4 },
              context: 'This is a longer context around the match with more text before and after to provide better understanding',
            },
          ],
          score: 0.9,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: 'This', contextLength: 200 });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/test.md');
      expect(obsidianApi.searchSimple).toHaveBeenCalledWith('This', 200);
    });
  });

  describe('日本語テスト：日本語クエリでの検索', () => {
    it('日本語のキーワードで検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/日記/2024-01-20.md',
          matches: [
            {
              match: { start: 5, end: 9 },
              context: '今日は会議がありました。',
            },
          ],
          score: 0.92,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: '会議' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/日記/2024-01-20.md');
      expect(obsidianApi.searchSimple).toHaveBeenCalledWith('会議', undefined);
    });

    it('日本語の複数単語で検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/プロジェクト/タスク管理.md',
          matches: [
            {
              match: { start: 0, end: 12 },
              context: 'タスクの優先順位を決める',
            },
          ],
          score: 0.88,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: 'タスク 優先順位' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/プロジェクト/タスク管理.md');
    });
  });

  describe('特殊文字テスト：記号を含むクエリの処理', () => {
    it('ハッシュタグを含むクエリで検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/tags.md',
          matches: [
            {
              match: { start: 0, end: 10 },
              context: '#important task for today',
            },
          ],
          score: 0.87,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: '#important' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/tags.md');
    });

    it('特殊文字を含むクエリで検索できる', async () => {
      const mockResults: SearchResult[] = [
        {
          filename: 'notes/code.md',
          matches: [
            {
              match: { start: 10, end: 25 },
              context: 'function test() { return true; }',
            },
          ],
          score: 0.75,
        },
      ];

      vi.mocked(obsidianApi.searchSimple).mockResolvedValue(mockResults);

      const response = await simpleSearchHandler({ query: 'test()' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('notes/code.md');
    });
  });

  describe('空クエリテスト：適切なエラーハンドリング', () => {
    it('nullのクエリはエラーになる', async () => {
      await expect(simpleSearchHandler({ query: null as any })).rejects.toThrow(ValidationError);
    });

    it('undefinedのクエリはエラーになる', async () => {
      await expect(simpleSearchHandler({ query: undefined as any })).rejects.toThrow(ValidationError);
    });

    it('空白のみのクエリはエラーになる', async () => {
      await expect(simpleSearchHandler({ query: '   ' })).rejects.toThrow(ValidationError);
    });
  });

  describe('結果なしテスト：マッチしない場合の処理', () => {
    it('マッチする結果がない場合は空の配列を返す', async () => {
      vi.mocked(obsidianApi.searchSimple).mockResolvedValue([]);

      const response = await simpleSearchHandler({ query: 'nonexistentquery12345' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('検索結果が見つかりませんでした');
    });

    it('存在しないパターンでも正常に処理される', async () => {
      vi.mocked(obsidianApi.searchSimple).mockResolvedValue([]);

      const response = await simpleSearchHandler({ query: '絶対に存在しないクエリ文字列' });

      expect(response.content).toHaveLength(1);
      expect(response.content[0].type).toBe('text');
      expect(response.content[0].text).toContain('検索結果が見つかりませんでした');
      expect(obsidianApi.searchSimple).toHaveBeenCalledWith('絶対に存在しないクエリ文字列', undefined);
    });
  });

  describe('エラーハンドリング', () => {
    it('API接続エラーを適切に処理する', async () => {
      vi.mocked(obsidianApi.searchSimple).mockRejectedValue(
        new Error('Failed to connect to Obsidian')
      );

      await expect(simpleSearchHandler({ query: 'test' })).rejects.toThrow(ApiError);
      await expect(simpleSearchHandler({ query: 'test' })).rejects.toThrow(
        'Search operation failed'
      );
    });

    it('タイムアウトエラーを適切に処理する', async () => {
      vi.mocked(obsidianApi.searchSimple).mockRejectedValue(
        new Error('Request timeout')
      );

      await expect(simpleSearchHandler({ query: 'test' })).rejects.toThrow(ApiError);
      await expect(simpleSearchHandler({ query: 'test' })).rejects.toThrow('Search operation failed');
    });
  });
});