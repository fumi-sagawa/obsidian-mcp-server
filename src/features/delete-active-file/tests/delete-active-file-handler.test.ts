import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteActiveFileCore } from '../delete-active-file-handler.js';
import { ObsidianAPIClient } from '../../../shared/api/obsidian/obsidian-api.js';
import type { DeleteActiveFileParams, DeleteActiveFileResponse, ErrorResponse } from '../types.js';

// モックの設定
vi.mock('../../../shared/api/obsidian/obsidian-api.js');

describe('deleteActiveFileHandler', () => {
  const mockDeleteActiveFile = vi.fn();
  const mockApi = {
    deleteActiveFile: mockDeleteActiveFile,
  } as unknown as ObsidianAPIClient;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('正常系', () => {
    it('正常にアクティブファイルを削除できる', async () => {
      // APIが204を返すことをモック
      mockDeleteActiveFile.mockResolvedValueOnce(undefined);

      const params: DeleteActiveFileParams = {};
      const result = await deleteActiveFileCore(params, mockApi);

      // 型安全なアサーション
      const expectedResponse: DeleteActiveFileResponse = {
        message: 'Active file deleted successfully',
      };
      
      expect(result).toEqual(expectedResponse);
      expect(mockDeleteActiveFile).toHaveBeenCalledOnce();
    });
  });

  describe('エラー系', () => {
    it('アクティブファイルが存在しない場合は404エラーを返す', async () => {
      // 404エラーのモック
      const errorResponse: ErrorResponse = {
        errorCode: 40401,
        message: 'No active file found',
      };
      
      mockDeleteActiveFile.mockRejectedValueOnce({
        response: {
          status: 404,
          data: errorResponse,
        },
      });

      await expect(deleteActiveFileCore({}, mockApi)).rejects.toThrow('No active file found');
      expect(mockDeleteActiveFile).toHaveBeenCalledOnce();
    });

    it('ディレクトリの場合は405エラーを返す', async () => {
      // 405エラーのモック
      const errorResponse: ErrorResponse = {
        errorCode: 40501,
        message: 'Your path references a directory instead of a file',
      };
      
      mockDeleteActiveFile.mockRejectedValueOnce({
        response: {
          status: 405,
          data: errorResponse,
        },
      });

      await expect(deleteActiveFileCore({}, mockApi)).rejects.toThrow('Your path references a directory instead of a file');
      expect(mockDeleteActiveFile).toHaveBeenCalledOnce();
    });

    it('ネットワークエラーの場合は適切なエラーを返す', async () => {
      // ネットワークエラーのモック
      mockDeleteActiveFile.mockRejectedValueOnce(new Error('Network error'));

      await expect(deleteActiveFileCore({}, mockApi)).rejects.toThrow('Network error');
      expect(mockDeleteActiveFile).toHaveBeenCalledOnce();
    });
  });

  describe('破壊的操作の警告', () => {
    it('削除操作は復元不可能であることを前提とする', async () => {
      // このテストは概念的なもので、実際の警告メカニズムはMCPクライアント側で実装されるべき
      // ここでは削除が成功したことだけを確認
      mockDeleteActiveFile.mockResolvedValueOnce(undefined);

      const result = await deleteActiveFileCore({}, mockApi);
      
      // 削除成功メッセージが返ることを確認
      expect(result.message).toContain('deleted successfully');
    });
  });
});