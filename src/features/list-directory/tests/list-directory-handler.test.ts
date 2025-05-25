import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ListDirectoryRequest, ListDirectoryResponse, ListDirectoryFormattedResponse } from '../types.js';
import { listDirectoryHandler } from '../list-directory-handler.js';

// モックのセットアップ
const mockListDirectory = vi.fn();
const mockLogger = {
  debug: vi.fn(),
  error: vi.fn()
};

vi.mock('../../../shared/api/obsidian', () => ({
  ObsidianAPIClient: vi.fn().mockImplementation(() => ({
    listDirectory: mockListDirectory
  }))
}));

describe('list-directory-handler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListDirectory.mockReset();
    mockLogger.debug.mockReset();
    mockLogger.error.mockReset();
  });

  describe('型定義のテスト', () => {
    it('pathToDirectoryパラメータが必須であること', async () => {
      // @ts-expect-error - pathToDirectoryがないとエラーになることを確認
      const invalidRequest: ListDirectoryRequest = {};

      await expect(listDirectoryHandler({})).resolves.toMatchObject({
        content: expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            text: expect.stringContaining("Error")
          })
        ])
      });
    });

    it('有効なリクエスト型が受け入れられること', () => {
      const validRequest: ListDirectoryRequest = {
        pathToDirectory: 'notes'
      };

      expect(validRequest.pathToDirectory).toBeDefined();
    });

    it('APIレスポンス型が正しく定義されていること', () => {
      const apiResponse: ListDirectoryResponse = {
        files: ['note1.md', 'subfolder/', 'note2.md']
      };

      expect(apiResponse.files).toBeInstanceOf(Array);
      expect(apiResponse.files).toContain('note1.md');
      expect(apiResponse.files).toContain('subfolder/');
    });

    it('フォーマット済みレスポンス型が正しく定義されていること', () => {
      const formattedResponse: ListDirectoryFormattedResponse = {
        directory: 'notes',
        files: ['note1.md', 'note2.md'],
        directories: ['subfolder'],
        totalItems: 3
      };

      expect(formattedResponse.directory).toBe('notes');
      expect(formattedResponse.files).toHaveLength(2);
      expect(formattedResponse.directories).toHaveLength(1);
      expect(formattedResponse.totalItems).toBe(3);
    });
  });

  describe('正常系テスト', () => {
    it('ディレクトリ内容を正常に取得できること', async () => {
      const request = {
        pathToDirectory: 'notes'
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['note1.md', 'note2.md', 'subfolder/']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('notes');
      expect(parsedResponse.files).toContain('note1.md');
      expect(parsedResponse.files).toContain('note2.md');
      expect(parsedResponse.directories).toContain('subfolder/');
      expect(mockListDirectory).toHaveBeenCalledWith('notes');
    });

    it('空ディレクトリを正常に処理できること', async () => {
      const request = {
        pathToDirectory: 'empty-folder'
      };

      const mockResponse: ListDirectoryResponse = {
        files: []
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('empty-folder');
      expect(parsedResponse.totalItems).toBe(0);
      expect(mockListDirectory).toHaveBeenCalledWith('empty-folder');
    });

    it('ルートディレクトリを正常に処理できること', async () => {
      const request = {
        pathToDirectory: ''
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['root-note.md', 'documents/', 'projects/']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('(root)');
      expect(parsedResponse.files).toContain('root-note.md');
      expect(parsedResponse.directories).toContain('documents/');
      expect(parsedResponse.directories).toContain('projects/');
    });
  });

  describe('ネストディレクトリテスト', () => {
    it('深い階層のディレクトリを処理できること', async () => {
      const request = {
        pathToDirectory: 'projects/web/frontend/components'
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['Button.tsx', 'Modal.tsx', 'common/']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('projects/web/frontend/components');
      expect(parsedResponse.files).toContain('Button.tsx');
      expect(parsedResponse.files).toContain('Modal.tsx');
      expect(parsedResponse.directories).toContain('common/');
      expect(mockListDirectory).toHaveBeenCalledWith('projects/web/frontend/components');
    });
  });

  describe('特殊パステスト', () => {
    it('スペースを含むパスが正しく処理されること', async () => {
      const request = {
        pathToDirectory: 'my notes/daily notes'
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['2024-05-24.md', 'templates/']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('my notes/daily notes');
      expect(parsedResponse.files).toContain('2024-05-24.md');
      expect(parsedResponse.directories).toContain('templates/');
      expect(mockListDirectory).toHaveBeenCalledWith('my notes/daily notes');
    });

    it('日本語を含むパスが正しく処理されること', async () => {
      const request = {
        pathToDirectory: 'ノート/プロジェクト'
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['メモ.md', 'タスク/', '会議録.md']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.directory).toBe('ノート/プロジェクト');
      expect(parsedResponse.files).toContain('メモ.md');
      expect(parsedResponse.directories).toContain('タスク/');
      expect(parsedResponse.files).toContain('会議録.md');
    });

    it('先頭のスラッシュが削除されること', async () => {
      const request = {
        pathToDirectory: '/notes/daily'
      };

      const mockResponse: ListDirectoryResponse = {
        files: ['today.md']
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      await listDirectoryHandler(request);

      expect(mockListDirectory).toHaveBeenCalledWith('notes/daily');
    });
  });

  describe('エラーテスト', () => {
    it('存在しないディレクトリのエラー（404）が適切に処理されること', async () => {
      const request = {
        pathToDirectory: 'non-existent-folder'
      };

      const apiError = new Error('Directory not found');
      (apiError as any).response = {
        status: 404,
        data: { errorCode: 40400, message: 'Directory does not exist' }
      };

      mockListDirectory.mockRejectedValueOnce(apiError);

      const result = await listDirectoryHandler(request);
      
      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.error).toContain('Directory not found');
    });

    it('無効なパス形式のエラーが処理されること', async () => {
      const request = {
        pathToDirectory: '../../../etc'
      };

      const result = await listDirectoryHandler(request);
      
      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.error).toContain('Path traversal not allowed');
    });

    it('空のディレクトリパスがエラーになること（バリデーション）', async () => {
      const result = await listDirectoryHandler({});
      
      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.error).toContain('Error');
    });

    it('APIエラーが適切に処理されること', async () => {
      const request = {
        pathToDirectory: 'notes'
      };

      const apiError = new Error('API connection failed');
      mockListDirectory.mockRejectedValueOnce(apiError);

      const result = await listDirectoryHandler(request);
      
      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.error).toContain('API connection failed');
    });
  });

  describe('フォーマットテスト', () => {
    it('ファイルとディレクトリが視覚的に区別されること', async () => {
      const request = {
        pathToDirectory: 'mixed-content'
      };

      const mockResponse: ListDirectoryResponse = {
        files: [
          'document.md',
          'image.png',
          'folder/',
          'another-folder/',
          'script.js'
        ]
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      
      // ファイルの確認
      expect(parsedResponse.files).toContain('document.md');
      expect(parsedResponse.files).toContain('image.png');
      expect(parsedResponse.files).toContain('script.js');
      
      // ディレクトリの確認
      expect(parsedResponse.directories).toContain('folder/');
      expect(parsedResponse.directories).toContain('another-folder/');
    });

    it('統計情報が正しく表示されること', async () => {
      const request = {
        pathToDirectory: 'mixed-content'
      };

      const mockResponse: ListDirectoryResponse = {
        files: [
          'file1.md',
          'file2.md',
          'file3.txt',
          'folder1/',
          'folder2/'
        ]
      };

      mockListDirectory.mockResolvedValueOnce(mockResponse);

      const result = await listDirectoryHandler(request);

      const parsedResponse = JSON.parse(result.content[0].text);
      expect(parsedResponse.totalItems).toBe(5);
      expect(parsedResponse.files).toHaveLength(3);
      expect(parsedResponse.directories).toHaveLength(2);
    });
  });
});