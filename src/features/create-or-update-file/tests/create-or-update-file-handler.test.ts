import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createOrUpdateFileCore } from '../create-or-update-file-handler.js';
import type {
  CreateOrUpdateFileRequest,
  CreateOrUpdateFileResponse,
  ErrorResponse,
} from '../types.js';
import { ValidationError } from '../../../shared/lib/errors/index.js';

// モックの設定
vi.mock('../../../shared/api/obsidian/obsidian-api.js', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({
    getFile: vi.fn(),
    createOrUpdateFile: vi.fn(),
  })),
}));

describe('create-or-update-file-handler', () => {
  let mockObsidianApi: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module = await vi.importMock('../../../shared/api/obsidian/obsidian-api.js');
    const ObsidianAPIClient = (module as any).ObsidianAPIClient;
    mockObsidianApi = new ObsidianAPIClient();
  });

  describe('正常系', () => {
    it('存在しないファイルを新規作成できる', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'test/new-note.md',
        content: '# New Note\n\nThis is a new note.',
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: test/new-note.md',
      };

      // ファイルが存在しない場合は404を返す
      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.getFile).toHaveBeenCalledWith(request.filename);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        request.content
      );
    });

    it('既存ファイルを更新できる', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'existing-note.md',
        content: '# Updated Content\n\nThis content has been updated.',
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: false,
        message: 'File updated successfully: existing-note.md',
      };

      // ファイルが存在する場合
      mockObsidianApi.getFile.mockResolvedValue({
        content: '# Old Content',
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.getFile).toHaveBeenCalledWith(request.filename);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        request.content
      );
    });

    it('親ディレクトリが存在しない場合でも自動作成される', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'new/deep/path/note.md',
        content: '# Deep Path Note',
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: new/deep/path/note.md',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        request.content
      );
    });

    it('空のコンテンツでファイルを作成できる', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'empty-note.md',
        content: '',
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: empty-note.md',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        ''
      );
    });

    it('大容量のコンテンツでファイルを作成できる', async () => {
      // Arrange
      const largeContent = 'x'.repeat(1000000); // 1MB
      const request: CreateOrUpdateFileRequest = {
        filename: 'large-note.md',
        content: largeContent,
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: large-note.md',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        largeContent
      );
    });

    it('特殊文字を含むコンテンツで作成できる', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'special-chars.md',
        content: '# 日本語タイトル\n\n特殊文字: 🎉 ★ ♥ © ®\n\n```code\nconst x = "test";\n```',
      };
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: special-chars.md',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        request.filename,
        request.content
      );
    });
  });

  describe('エラー系', () => {
    it('無効なパスの場合はエラーを返す', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: '../outside-vault.md',
        content: 'Content',
      };

      // Act & Assert
      await expect(
        createOrUpdateFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Invalid file path: ../outside-vault.md',
        code: 'INVALID_PATH',
      } satisfies Partial<ErrorResponse>);
    });

    it('ディレクトリパスの場合はエラーを返す', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'some-directory/',
        content: 'Content',
      };

      // Act & Assert
      await expect(
        createOrUpdateFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Invalid file path: some-directory/',
        code: 'INVALID_PATH',
      } satisfies Partial<ErrorResponse>);
    });

    it('API処理が失敗した場合はエラーを返す', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'test.md',
        content: 'Content',
      };
      const apiError = {
        response: {
          status: 400,
          data: { error: 'Processing failed' },
        },
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockRejectedValue(apiError);

      // Act & Assert
      await expect(
        createOrUpdateFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to create or update file: Processing failed',
        code: 'OPERATION_FAILED',
      } satisfies Partial<ErrorResponse>);
    });

    it('ネットワークエラーの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'test.md',
        content: 'Content',
      };
      const networkError = new Error('Network error');

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        createOrUpdateFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to create or update file: Network error',
        code: 'UNKNOWN_ERROR',
      } satisfies Partial<ErrorResponse>);
    });

    it('APIタイムアウトの場合は適切なエラーを返す', async () => {
      // Arrange
      const request: CreateOrUpdateFileRequest = {
        filename: 'test.md',
        content: 'Content',
      };
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockRejectedValue(timeoutError);

      // Act & Assert
      await expect(
        createOrUpdateFileCore(request, mockObsidianApi)
      ).rejects.toMatchObject({
        error: 'Failed to create or update file: timeout of 30000ms exceeded',
        code: 'UNKNOWN_ERROR',
      } satisfies Partial<ErrorResponse>);
    });
  });

  describe('バリデーション', () => {
    it('filenameが文字列でない場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        filename: 123,
        content: 'Content',
      } as any;

      // Act & Assert
      await expect(
        createOrUpdateFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('contentが文字列でない場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        filename: 'test.md',
        content: { text: 'Content' },
      } as any;

      // Act & Assert
      await expect(
        createOrUpdateFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('必須パラメータが不足している場合はバリデーションエラー', async () => {
      // Arrange
      const invalidRequest = {
        filename: 'test.md',
        // contentが不足
      } as any;

      // Act & Assert
      await expect(
        createOrUpdateFileCore(invalidRequest, mockObsidianApi)
      ).rejects.toThrow(ValidationError);
    });

    it('余分なプロパティがある場合は無視される', async () => {
      // Arrange
      const request = {
        filename: 'test.md',
        content: 'Content',
        extraProperty: 'should be ignored',
      } as any;
      const expectedResponse: CreateOrUpdateFileResponse = {
        created: true,
        message: 'File created successfully: test.md',
      };

      mockObsidianApi.getFile.mockRejectedValue({
        response: { status: 404 },
      });
      mockObsidianApi.createOrUpdateFile.mockResolvedValue(undefined);

      // Act
      const result = await createOrUpdateFileCore(request, mockObsidianApi);

      // Assert
      expect(result).toEqual(expectedResponse);
      expect(mockObsidianApi.createOrUpdateFile).toHaveBeenCalledWith(
        'test.md',
        'Content'
      );
    });
  });
});