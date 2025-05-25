import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ObsidianAPIClient } from './obsidian-api.js';
import { ApiError, SystemError, ErrorCode } from '../../lib/errors/index.js';

// モック設定
vi.mock('../../config/index.js', () => ({
  getConfig: vi.fn(() => ({
    obsidianApiUrl: 'http://127.0.0.1:27123',
    obsidianApiKey: 'test-api-key',
    apiTimeout: 30000,
  }))
}));

vi.mock('../../lib/logger/index.js', () => ({
  logger: {
    child: vi.fn(() => ({
      debug: vi.fn(),
      trace: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }))
  }
}));

// fetch のモック
const mockFetch = vi.fn();
global.fetch = mockFetch;

// AbortControllerのモック
global.AbortController = class {
  signal = { aborted: false };
  abort = vi.fn();
};

describe('ObsidianAPIClient', () => {
  let client: ObsidianAPIClient;

  beforeEach(() => {
    client = new ObsidianAPIClient();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('constructor', () => {
    it('デフォルト設定で初期化できる', () => {
      const client = new ObsidianAPIClient();
      expect(client).toBeInstanceOf(ObsidianAPIClient);
    });

    it('カスタム設定で初期化できる', () => {
      const client = new ObsidianAPIClient('https://custom.example.com', 'custom-key');
      expect(client).toBeInstanceOf(ObsidianAPIClient);
    });
  });

  describe('get メソッド', () => {
    it('正常なGETリクエストが成功する', async () => {
      const mockResponse = { status: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.get('/test');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/test',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );
    });

    it('APIキーなしでもリクエストできる', async () => {
      const clientWithoutKey = new ObsidianAPIClient('http://127.0.0.1:27123', undefined);
      const mockResponse = { status: 'success' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await clientWithoutKey.get('/test');
      expect(result).toEqual(mockResponse);
    });

    it('HTTPエラーレスポンスでApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        text: () => Promise.resolve('Not found'),
      });

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });

    it('ネットワークエラーでApiErrorをスローする', async () => {
      const networkError = new Error('ECONNREFUSED');
      mockFetch.mockRejectedValueOnce(networkError);

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });

    it('タイムアウトエラーでApiErrorをスローする', async () => {
      const abortError = new Error('AbortError');
      abortError.name = 'AbortError';
      mockFetch.mockRejectedValueOnce(abortError);

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });

    it('予期しないエラーでSystemErrorをスローする', async () => {
      const unexpectedError = new Error('Unexpected error');
      mockFetch.mockRejectedValueOnce(unexpectedError);

      await expect(client.get('/test')).rejects.toThrow(SystemError);
    });
  });

  describe('post メソッド', () => {
    it('正常なPOSTリクエストが成功する', async () => {
      const mockResponse = { message: 'Created' };
      const requestBody = { data: 'test' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.post('/test', requestBody);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/test',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
          body: JSON.stringify(requestBody),
        })
      );
    });

    it('204 No Contentレスポンスを正しく処理する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.post('/test', {});
      expect(result).toBeUndefined();
    });
  });

  describe('getActiveFile メソッド', () => {
    it('アクティブファイルを正常に取得できる', async () => {
      const mockResponse = {
        path: 'test.md',
        content: 'Test content',
        stat: { mtime: Date.now(), size: 100 }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getActiveFile();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/active/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/vnd.olrapi.note+json',
          }),
        })
      );
    });

    it('401エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        text: () => Promise.resolve('Unauthorized'),
      });

      await expect(client.getActiveFile()).rejects.toThrow(ApiError);
    });

    it('404エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: () => Promise.resolve('No active file'),
      });

      await expect(client.getActiveFile()).rejects.toThrow(ApiError);
    });
  });

  describe('appendToActiveFile メソッド', () => {
    it('アクティブファイルに正常に追記できる', async () => {
      const content = 'New content to append';
      const mockResponse = { message: 'Content appended successfully' };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.appendToActiveFile(content);
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/active/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });

    it('204 No Contentレスポンスを正しく処理する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      const result = await client.appendToActiveFile('test content');
      expect(result).toEqual({ message: 'Content appended successfully' });
    });
  });

  describe('updateActiveFile メソッド', () => {
    it('アクティブファイルを正常に更新できる', async () => {
      const content = 'Updated content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.updateActiveFile(content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/active/',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });

    it('405エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 405,
        text: () => Promise.resolve('Cannot update directory'),
      });

      await expect(client.updateActiveFile('content')).rejects.toThrow(ApiError);
    });
  });

  describe('deleteActiveFile メソッド', () => {
    it('アクティブファイルを正常に削除できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.deleteActiveFile()).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/active/',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('patchActiveFile メソッド', () => {
    it('アクティブファイルに正常にパッチできる', async () => {
      const headers = { 'X-Target-Type': 'heading', 'X-Target': 'Test Heading' };
      const content = 'Patch content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await expect(client.patchActiveFile(headers, content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/active/',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining(headers),
          body: content,
        })
      );
    });

    it('400エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      });

      await expect(client.patchActiveFile({}, 'content')).rejects.toThrow(ApiError);
    });
  });

  describe('getPeriodicNote メソッド', () => {
    it('定期ノートを正常に取得できる', async () => {
      const mockResponse = {
        path: 'daily/2024-05-25.md',
        content: 'Daily note content',
        stat: { mtime: Date.now(), size: 100 }
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.getPeriodicNote('daily');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/periodic/daily/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/vnd.olrapi.note+json',
          }),
        })
      );
    });
  });

  describe('openFile メソッド', () => {
    it('ファイルを正常に開ける', async () => {
      const filename = 'test.md';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await expect(client.openFile(filename)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/open/test.md',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('newLeafオプションを正しく処理する', async () => {
      const filename = 'test.md';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await client.openFile(filename, { newLeaf: true });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/open/test.md?newLeaf=true',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('特殊文字を含むファイル名を正しくエンコードする', async () => {
      const filename = 'test file & special chars.md';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await client.openFile(filename);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/open/test%20file%20%26%20special%20chars.md',
        expect.any(Object)
      );
    });
  });

  describe('searchSimple メソッド', () => {
    it('シンプル検索を正常に実行できる', async () => {
      const mockResults = [
        { filename: 'test.md', score: 1.0, matches: [] }
      ];
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResults),
      });

      const result = await client.searchSimple('test query');
      expect(result).toEqual(mockResults);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/search/simple/?query=test+query',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('contextLengthパラメータを正しく処理する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve([]),
      });

      await client.searchSimple('test', 50);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/search/simple/?query=test&contextLength=50',
        expect.any(Object)
      );
    });
  });

  describe('appendToFile メソッド', () => {
    it('ファイルに正常に追記できる', async () => {
      const filename = 'test.md';
      const content = 'Content to append';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.appendToFile(filename, content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/test.md',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });

    it('400エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Bad request'),
      });

      await expect(client.appendToFile('test.md', 'content')).rejects.toThrow(ApiError);
    });
  });

  describe('appendToPeriodicNote メソッド', () => {
    it('定期ノートに正常に追記できる', async () => {
      const content = 'Content to append';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.appendToPeriodicNote('daily', content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/periodic/daily/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });
  });

  describe('getFile メソッド', () => {
    it('ファイルを正常に取得できる', async () => {
      const filename = 'test.md';
      const content = 'File content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve(content),
      });

      const result = await client.getFile(filename);
      expect(result).toEqual({ content });
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/test.md',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'text/markdown',
          }),
        })
      );
    });
  });

  describe('deleteFile メソッド', () => {
    it('ファイルを正常に削除できる', async () => {
      const filename = 'test.md';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.deleteFile(filename)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/test.md',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('deletePeriodicNote メソッド', () => {
    it('定期ノートを正常に削除できる', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.deletePeriodicNote('weekly')).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/periodic/weekly/',
        expect.objectContaining({
          method: 'DELETE',
        })
      );
    });
  });

  describe('updatePeriodicNote メソッド', () => {
    it('定期ノートを正常に更新できる', async () => {
      const content = 'Updated content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.updatePeriodicNote('monthly', content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/periodic/monthly/',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });

    it('400エラーで適切なApiErrorをスローする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Incoming file could not be processed'),
      });

      await expect(client.updatePeriodicNote('daily', 'content')).rejects.toThrow(ApiError);
    });
  });

  describe('patchFile メソッド', () => {
    it('ファイルに正常にパッチできる', async () => {
      const filename = 'test.md';
      const headers = { 'X-Target-Type': 'heading', 'X-Target': 'Test' };
      const content = 'Patch content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
      });

      await expect(client.patchFile(filename, headers, content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/test.md',
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining(headers),
          body: content,
        })
      );
    });
  });

  describe('listDirectory メソッド', () => {
    it('ディレクトリ一覧を正常に取得できる', async () => {
      const mockResponse = {
        files: [
          { name: 'test.md', path: 'notes/test.md', isFolder: false },
          { name: 'subfolder', path: 'notes/subfolder', isFolder: true }
        ]
      };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.listDirectory('notes');
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/notes/',
        expect.objectContaining({
          method: 'GET',
        })
      );
    });

    it('ルートディレクトリを正しく処理する', async () => {
      const mockResponse = { files: [] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      await client.listDirectory('');
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/',
        expect.any(Object)
      );
    });
  });

  describe('listVaultFiles メソッド', () => {
    it('Vaultファイル一覧を正常に取得できる', async () => {
      const mockResponse = { files: ['test.md', 'notes/daily.md'] };
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await client.listVaultFiles();
      expect(result).toEqual(mockResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Accept': 'application/json',
          }),
        })
      );
    });
  });

  describe('createOrUpdateFile メソッド', () => {
    it('ファイルを正常に作成または更新できる', async () => {
      const filename = 'new-file.md';
      const content = 'New file content';
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
      });

      await expect(client.createOrUpdateFile(filename, content)).resolves.toBeUndefined();
      expect(mockFetch).toHaveBeenCalledWith(
        'http://127.0.0.1:27123/vault/new-file.md',
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'text/markdown',
          }),
          body: content,
        })
      );
    });
  });

  describe('HTTPSサポート', () => {
    it('HTTPSのURLで自己署名証明書を受け入れる', async () => {
      // Node.js環境をシミュレート
      const originalProcess = global.process;
      global.process = {
        versions: { node: '18.0.0' },
      } as any;

      const httpsClient = new ObsidianAPIClient('https://127.0.0.1:27123', 'test-key');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.resolve({}),
      });

      await httpsClient.get('/test');

      // process オブジェクトを復元
      global.process = originalProcess;

      expect(mockFetch).toHaveBeenCalledWith(
        'https://127.0.0.1:27123/test',
        expect.any(Object)
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('API応答がnullの場合、適切にエラーハンドリングする', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: () => Promise.reject(new Error('Cannot read response')),
      });

      await expect(client.get('/test')).rejects.toThrow(ApiError);
    });

    it('JSONパースエラーを適切に処理する', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: () => Promise.reject(new Error('Invalid JSON')),
      });

      await expect(client.get('/test')).rejects.toThrow();
    });
  });
});