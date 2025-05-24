import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateActiveFileCore } from '../update-active-file-handler.js';
import type {
  UpdateActiveFileRequest,
  UpdateActiveFileResponse,
  UpdateError,
} from '../types.js';
import { ValidationError } from '../../../shared/lib/errors/index.js';

// モックの設定
vi.mock('../../../shared/api/obsidian/obsidian-api.js', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({
    updateActiveFile: vi.fn(),
  })),
}));

describe('update-active-file-handler', () => {
  let mockObsidianApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await vi.importMock('../../../shared/api/obsidian/obsidian-api.js');
    const ObsidianAPIClient = (module as any).ObsidianAPIClient;
    mockObsidianApi = new ObsidianAPIClient();
  });

  describe('正常系', () => {
    it('アクティブファイルの内容を正常に更新できる', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: '# Updated Content\n\nThis is the new content.',
      };
      const expectedResponse: UpdateActiveFileResponse = {
        success: true,
        message: 'Active file updated successfully',
      };

      mockObsidianApi.updateActiveFile.mockResolvedValue(undefined);

      // Act
      const result = await updateActiveFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledWith(
        request.content
      );
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledTimes(1);
    });

    it('空のコンテンツでファイルを更新できる', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: '',
      };
      const expectedResponse: UpdateActiveFileResponse = {
        success: true,
        message: 'Active file updated successfully',
      };

      mockObsidianApi.updateActiveFile.mockResolvedValue(undefined);

      // Act
      const result = await updateActiveFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledWith('');
    });

    it('大容量のコンテンツでファイルを更新できる', async () => {
      // Arrange
      const largeContent = 'x'.repeat(1000000); // 1MB
      const request: UpdateActiveFileRequest = {
        content: largeContent,
      };
      const expectedResponse: UpdateActiveFileResponse = {
        success: true,
        message: 'Active file updated successfully',
      };

      mockObsidianApi.updateActiveFile.mockResolvedValue(undefined);

      // Act
      const result = await updateActiveFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledWith(
        largeContent
      );
    });

    it('特殊文字を含むコンテンツで更新できる', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: '# 日本語タイトル\n\n特殊文字: 🎉 ★ ♥ © ®\n\n```code\nconst x = "test";\n```',
      };
      const expectedResponse: UpdateActiveFileResponse = {
        success: true,
        message: 'Active file updated successfully',
      };

      mockObsidianApi.updateActiveFile.mockResolvedValue(undefined);

      // Act
      const result = await updateActiveFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledWith(
        request.content
      );
    });
  });

  describe('エラー系', () => {
    it('アクティブファイルが存在しない場合はエラーを返す', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: 'New content',
      };
      const apiError = {
        response: {
          status: 404,
          data: { error: 'No active file' },
        },
      };

      mockObsidianApi.updateActiveFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        updateActiveFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'No active file open in Obsidian',
        code: 'NO_ACTIVE_FILE',
      } satisfies Partial<UpdateError>);
    });

    it('更新処理が失敗した場合はエラーを返す', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: 'New content',
      };
      const apiError = {
        response: {
          status: 400,
          data: { error: 'Invalid content' },
        },
      };

      mockObsidianApi.updateActiveFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        updateActiveFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to update active file: Invalid content',
        code: 'UPDATE_FAILED',
      } satisfies Partial<UpdateError>);
    });

    it('ディレクトリを更新しようとした場合はエラーを返す', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: 'New content',
      };
      const apiError = {
        response: {
          status: 405,
          data: { error: 'Cannot update directory' },
        },
      };

      mockObsidianApi.updateActiveFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        updateActiveFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Cannot update directory: Cannot update directory',
        code: 'UPDATE_FAILED',
      } satisfies Partial<UpdateError>);
    });

    it('ネットワークエラーの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: 'New content',
      };
      const networkError = new Error('Network error');

      mockObsidianApi.updateActiveFile.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        updateActiveFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to update active file',
        code: 'UNKNOWN_ERROR',
      } satisfies Partial<UpdateError>);
    });

    it('APIタイムアウトの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: UpdateActiveFileRequest = {
        content: 'New content',
      };
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      mockObsidianApi.updateActiveFile.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        updateActiveFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to update active file',
        code: 'UNKNOWN_ERROR',
        details: expect.objectContaining({
          code: 'ECONNABORTED',
        }),
      } satisfies Partial<UpdateError>);
    });
  });

  describe('バリデーション', () => {
    it('contentが文字列でない場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        content: 123, // 数値は無効
      } as any;

      // Act & Assert
      await expect(
        updateActiveFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('contentが未定義の場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {} as any;

      // Act & Assert
      await expect(
        updateActiveFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('余分なプロパティがある場合は無視される', async () => {
      // Arrange
      const request = {
        content: 'New content',
        extraProperty: 'should be ignored',
      } as any;
      const expectedResponse: UpdateActiveFileResponse = {
        success: true,
        message: 'Active file updated successfully',
      };

      mockObsidianApi.updateActiveFile.mockResolvedValue(undefined);

      // Act
      const result = await updateActiveFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.updateActiveFile).toHaveBeenCalledWith(
        'New content'
      );
    });
  });
});