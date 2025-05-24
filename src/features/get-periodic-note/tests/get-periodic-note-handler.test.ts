import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getPeriodicNoteHandler, getPeriodicNoteCore } from '../get-periodic-note-handler.js';
import type { GetPeriodicNoteResponse, PeriodType } from '../types.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';

// モックデータ
const mockPeriodicNoteResponse: GetPeriodicNoteResponse = {
  content: "# 2024-05-24\n\n## 今日のタスク\n- [ ] プロジェクト進行",
  frontmatter: {
    date: "2024-05-24",
    tags: ["daily"]
  },
  path: "Daily Notes/2024-05-24.md",
  stat: {
    ctime: 1716505200000,
    mtime: 1716508800000,
    size: 1024
  },
  tags: ["daily", "work"]
};

// ObsidianAPIClientのモック
const mockGetPeriodicNote = vi.fn();
vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn(() => ({
    getPeriodicNote: mockGetPeriodicNote
  }))
}));

// ロガーのモック
vi.mock('../../../shared/lib/logger/index.js', () => ({
  logger: {
    child: vi.fn(() => ({
      debug: vi.fn(),
      info: vi.fn(),
      error: vi.fn()
    }))
  }
}));

describe('get-periodic-note-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('型定義テスト', () => {
    it('PeriodType型は正しい列挙値を持つ', () => {
      const validPeriods: PeriodType[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      
      // 各期間タイプが型的に有効であることを確認
      validPeriods.forEach(period => {
        expect(typeof period).toBe('string');
        expect(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']).toContain(period);
      });
    });

    it('GetPeriodicNoteResponse型は正しい構造を持つ', () => {
      const response: GetPeriodicNoteResponse = mockPeriodicNoteResponse;
      
      expect(response).toHaveProperty('content');
      expect(response).toHaveProperty('frontmatter');
      expect(response).toHaveProperty('path');
      expect(response).toHaveProperty('stat');
      expect(response).toHaveProperty('tags');
      
      expect(typeof response.content).toBe('string');
      expect(typeof response.frontmatter).toBe('object');
      expect(typeof response.path).toBe('string');
      expect(Array.isArray(response.tags)).toBe(true);
    });
  });

  describe('getPeriodicNoteCore', () => {
    it('各期間タイプで定期ノートを正常に取得できる', async () => {
      const periods: PeriodType[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      
      for (const period of periods) {
        mockGetPeriodicNote.mockResolvedValueOnce(mockPeriodicNoteResponse);
        
        const result = await getPeriodicNoteCore({ period });
        
        expect(result.success).toBe(true);
        expect(result.data).toEqual(mockPeriodicNoteResponse);
        expect(mockGetPeriodicNote).toHaveBeenCalledWith(period);
      }
    });

    it('ノートが存在しない場合は404エラーを適切に処理する', async () => {
      const notFoundError = new ApiError('Periodic note not found', ErrorCode.API_NOT_FOUND);
      mockGetPeriodicNote.mockRejectedValueOnce(notFoundError);
      
      const result = await getPeriodicNoteCore({ period: 'daily' });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('No daily note found');
    });

    it('接続エラーの場合は適切なエラーメッセージを返す', async () => {
      const connectionError = new ApiError('Connection failed', ErrorCode.API_CONNECTION_ERROR);
      mockGetPeriodicNote.mockRejectedValueOnce(connectionError);
      
      const result = await getPeriodicNoteCore({ period: 'weekly' });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Cannot connect to Obsidian');
    });

    it('無効なperiodタイプの場合はエラーを返す', async () => {
      const result = await getPeriodicNoteCore({ period: 'invalid' as PeriodType });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toContain('Invalid period type');
    });

    it('その他のエラーは適切に処理される', async () => {
      const unknownError = new Error('Unknown error');
      mockGetPeriodicNote.mockRejectedValueOnce(unknownError);
      
      const result = await getPeriodicNoteCore({ period: 'monthly' });
      
      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Unknown error');
    });
  });

  describe('getPeriodicNoteHandler', () => {
    it('正常時は定期ノートの内容をフォーマットして返す', async () => {
      mockGetPeriodicNote.mockResolvedValueOnce(mockPeriodicNoteResponse);
      
      const result = await getPeriodicNoteHandler({ period: 'daily' });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      
      const text = result.content[0].text;
      expect(text).toContain('Daily Notes/2024-05-24.md');
      expect(text).toContain('1024 bytes');
      expect(text).toContain('daily, work');
      expect(text).toContain('# 2024-05-24');
    });

    it('エラー時はエラーメッセージを返す', async () => {
      const error = new ApiError('Not found', ErrorCode.API_NOT_FOUND);
      mockGetPeriodicNote.mockRejectedValueOnce(error);
      
      const result = await getPeriodicNoteHandler({ period: 'daily' });
      
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('No daily note found');
    });
  });
});