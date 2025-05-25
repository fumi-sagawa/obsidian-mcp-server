import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteFileCore } from '../delete-file-handler.js';
import type {
  DeleteFileRequest,
  DeleteFileResponse,
  ErrorResponse,
} from '../types.js';
import { ValidationError } from '../../../shared/lib/errors/index.js';

// モックの設定
vi.mock('../../../shared/api/obsidian/obsidian-api.js', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({
    deleteFile: vi.fn(),
  })),
}));

describe('delete-file-handler', () => {
  let mockObsidianApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await vi.importMock('../../../shared/api/obsidian/obsidian-api.js');
    const ObsidianAPIClient = (module as any).ObsidianAPIClient;
    mockObsidianApi = new ObsidianAPIClient();
  });

  describe('正常系', () => {
    it('ファイルを正常に削除できる', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'test/delete-me.md',
      };
      const expectedResponse: DeleteFileResponse = {
        success: true,
        message: 'File deleted successfully: test/delete-me.md',
      };

      mockObsidianApi.deleteFile.mockResolvedValue(undefined);

      // Act
      const result = await deleteFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.deleteFile).toHaveBeenCalledWith(request.filename);
      expect(mockObsidianApi.deleteFile).toHaveBeenCalledTimes(1);
    });

    it('ネストされたパスのファイルを削除できる', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'deep/nested/path/file.md',
      };
      const expectedResponse: DeleteFileResponse = {
        success: true,
        message: 'File deleted successfully: deep/nested/path/file.md',
      };

      mockObsidianApi.deleteFile.mockResolvedValue(undefined);

      // Act
      const result = await deleteFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.deleteFile).toHaveBeenCalledWith(request.filename);
    });

    it('特殊文字を含むファイル名でも削除できる', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: '日本語ファイル名.md',
      };
      const expectedResponse: DeleteFileResponse = {
        success: true,
        message: 'File deleted successfully: 日本語ファイル名.md',
      };

      mockObsidianApi.deleteFile.mockResolvedValue(undefined);

      // Act
      const result = await deleteFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.deleteFile).toHaveBeenCalledWith(request.filename);
    });
  });

  describe('エラー系', () => {
    it('存在しないファイルの削除でエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'non-existent.md',
      };
      const apiError = {
        response: {
          status: 404,
          data: { error: 'File does not exist' },
        },
      };

      mockObsidianApi.deleteFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'File not found: non-existent.md',
        code: 'FILE_NOT_FOUND',
      } satisfies Partial<ErrorResponse>);
    });

    it('ディレクトリの削除試行でエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'some-directory/',
      };

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Cannot delete directory: some-directory/',
        code: 'INVALID_PATH',
      } satisfies Partial<ErrorResponse>);
    });

    it('削除権限なしでエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'protected.md',
      };
      const apiError = {
        response: {
          status: 403,
          data: { error: 'Permission denied' },
        },
      };

      mockObsidianApi.deleteFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Permission denied: protected.md',
        code: 'PERMISSION_DENIED',
      } satisfies Partial<ErrorResponse>);
    });

    it('API処理が失敗した場合はエラーを返す', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'test.md',
      };
      const apiError = {
        response: {
          status: 405,
          data: { error: 'Method not allowed' },
        },
      };

      mockObsidianApi.deleteFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to delete file: Method not allowed',
        code: 'DELETE_FAILED',
      } satisfies Partial<ErrorResponse>);
    });

    it('ネットワークエラーの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'test.md',
      };
      const networkError = new Error('Network error');

      mockObsidianApi.deleteFile.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to delete file: Network error',
        code: 'UNKNOWN_ERROR',
      } satisfies Partial<ErrorResponse>);
    });

    it('APIタイムアウトの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: 'test.md',
      };
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      mockObsidianApi.deleteFile.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to delete file: timeout of 30000ms exceeded',
        code: 'UNKNOWN_ERROR',
      } satisfies Partial<ErrorResponse>);
    });
  });

  describe('バリデーション', () => {
    it('filenameが文字列でない場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        filename: 123,
      } as any;

      // Act & Assert
      await expect(
        deleteFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('filenameが空文字の場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        filename: '',
      };

      // Act & Assert
      await expect(
        deleteFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('filenameが未定義の場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {} as any;

      // Act & Assert
      await expect(
        deleteFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('余分なプロパティがある場合は無視される', async () => {
      // Arrange
      const request = {
        filename: 'test.md',
        extraProperty: 'should be ignored',
      } as any;
      const expectedResponse: DeleteFileResponse = {
        success: true,
        message: 'File deleted successfully: test.md',
      };

      mockObsidianApi.deleteFile.mockResolvedValue(undefined);

      // Act
      const result = await deleteFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.deleteFile).toHaveBeenCalledWith('test.md');
    });
  });

  describe('パス検証', () => {
    it('親ディレクトリへの参照を含む場合はエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: '../outside-vault.md',
      };

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Invalid file path: ../outside-vault.md',
        code: 'INVALID_PATH',
      } satisfies Partial<ErrorResponse>);
    });

    it('絶対パスの場合はエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: '/absolute/path.md',
      };

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Invalid file path: /absolute/path.md',
        code: 'INVALID_PATH',
      } satisfies Partial<ErrorResponse>);
    });

    it('システムファイルの削除試行でエラー', async () => {
      // Arrange
      const request: DeleteFileRequest = {
        filename: '.obsidian/config',
      };

      // Act & Assert
      await expect(
        deleteFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Cannot delete system file: .obsidian/config',
        code: 'PROTECTED_FILE',
      } satisfies Partial<ErrorResponse>);
    });
  });
});