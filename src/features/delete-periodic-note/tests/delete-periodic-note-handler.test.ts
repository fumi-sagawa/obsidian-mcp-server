import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deletePeriodicNoteCore } from '../delete-periodic-note-handler.js';
import { ObsidianAPIClient } from '../../../shared/api/obsidian/obsidian-api.js';
import type { DeletePeriodicNoteParams, DeletePeriodicNoteResponse, ErrorResponse, PeriodType } from '../types.js';

// モックの設定
vi.mock('../../../shared/api/obsidian/obsidian-api.js');

describe('deletePeriodicNoteHandler', () => {
  const mockDeletePeriodicNote = vi.fn();
  const mockApi = {
    deletePeriodicNote: mockDeletePeriodicNote,
  } as unknown as ObsidianAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('正常に日次ノートを削除できる', async () => {
      // APIが204を返すことをモック
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const params: DeletePeriodicNoteParams = { period: 'daily' };
      const result = await deletePeriodicNoteCore(params, mockApi);

      // 型安全なアサーション
      const expectedResponse: DeletePeriodicNoteResponse = {
        message: 'daily note deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith('daily');
      expect(mockDeletePeriodicNote).toHaveBeenCalledOnce();
    });

    it('正常に週次ノートを削除できる', async () => {
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const params: DeletePeriodicNoteParams = { period: 'weekly' };
      const result = await deletePeriodicNoteCore(params, mockApi);

      const expectedResponse: DeletePeriodicNoteResponse = {
        message: 'weekly note deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith('weekly');
    });

    it('正常に月次ノートを削除できる', async () => {
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const params: DeletePeriodicNoteParams = { period: 'monthly' };
      const result = await deletePeriodicNoteCore(params, mockApi);

      const expectedResponse: DeletePeriodicNoteResponse = {
        message: 'monthly note deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith('monthly');
    });

    it('正常に四半期ノートを削除できる', async () => {
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const params: DeletePeriodicNoteParams = { period: 'quarterly' };
      const result = await deletePeriodicNoteCore(params, mockApi);

      const expectedResponse: DeletePeriodicNoteResponse = {
        message: 'quarterly note deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith('quarterly');
    });

    it('正常に年次ノートを削除できる', async () => {
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const params: DeletePeriodicNoteParams = { period: 'yearly' };
      const result = await deletePeriodicNoteCore(params, mockApi);

      const expectedResponse: DeletePeriodicNoteResponse = {
        message: 'yearly note deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith('yearly');
    });
  });

  describe('エラー系', () => {
    it('定期ノートが存在しない場合は404エラーを返す', async () => {
      const period: PeriodType = 'daily';
      // 404エラーのモック
      const errorResponse: ErrorResponse = {
        errorCode: 40401,
        message: 'No daily note found',
      };
      
      mockDeletePeriodicNote.mockRejectedValueOnce({
        response: {
          status: 404,
          data: errorResponse,
        },
      });

      await expect(deletePeriodicNoteCore({ period }, mockApi)).rejects.toThrow('No daily note found');
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith(period);
      expect(mockDeletePeriodicNote).toHaveBeenCalledOnce();
    });

    it('ディレクトリの場合は405エラーを返す', async () => {
      const period: PeriodType = 'weekly';
      // 405エラーのモック
      const errorResponse: ErrorResponse = {
        errorCode: 40501,
        message: 'Your path references a directory instead of a file',
      };
      
      mockDeletePeriodicNote.mockRejectedValueOnce({
        response: {
          status: 405,
          data: errorResponse,
        },
      });

      await expect(deletePeriodicNoteCore({ period }, mockApi)).rejects.toThrow('Your path references a directory instead of a file');
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith(period);
      expect(mockDeletePeriodicNote).toHaveBeenCalledOnce();
    });

    it('ネットワークエラーの場合は適切なエラーを返す', async () => {
      const period: PeriodType = 'monthly';
      // ネットワークエラーのモック
      mockDeletePeriodicNote.mockRejectedValueOnce(new Error('Network error'));

      await expect(deletePeriodicNoteCore({ period }, mockApi)).rejects.toThrow('Network error');
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith(period);
      expect(mockDeletePeriodicNote).toHaveBeenCalledOnce();
    });

    it('API接続エラーの場合は適切なエラーメッセージを返す', async () => {
      const period: PeriodType = 'yearly';
      // API接続エラーのモック
      mockDeletePeriodicNote.mockRejectedValueOnce(new Error('Connection refused'));

      await expect(deletePeriodicNoteCore({ period }, mockApi)).rejects.toThrow('Connection refused');
      expect(mockDeletePeriodicNote).toHaveBeenCalledWith(period);
    });
  });

  describe('破壊的操作の警告', () => {
    it('削除操作は復元不可能であることを前提とする', async () => {
      // このテストは概念的なもので、実際の警告メカニズムはMCPクライアント側で実装されるべき
      // ここでは削除が成功したことだけを確認
      mockDeletePeriodicNote.mockResolvedValueOnce(undefined);

      const result = await deletePeriodicNoteCore({ period: 'daily' }, mockApi);
      
      // 削除成功メッセージが返ることを確認
      expect(result.message).toContain('deleted successfully');
    });
  });
});