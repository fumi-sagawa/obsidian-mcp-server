import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listCommandsHandler } from '../list-commands-handler.js';
import { ObsidianAPIClient } from '../../../shared/api/index.js';
import type { CommandInfo, ListCommandsResponse } from '../types.js';

vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('list-commands-handler', () => {
  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // ObsidianAPIClientのモックを設定
    mockGet = vi.fn();
    vi.mocked(ObsidianAPIClient).mockImplementation(() => ({
      get: mockGet,
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn()
    } as any));
  });

  describe('型テスト', () => {
    it('CommandInfo型が正しく定義されている', () => {
      const commandInfo: CommandInfo = {
        id: 'test:command',
        name: 'Test Command'
      };
      
      expect(commandInfo).toHaveProperty('id');
      expect(commandInfo).toHaveProperty('name');
      expect(typeof commandInfo.id).toBe('string');
      expect(typeof commandInfo.name).toBe('string');
    });

    it('ListCommandsResponse型が正しく定義されている', () => {
      const response: ListCommandsResponse = {
        commands: [
          { id: 'command1', name: 'Command 1' },
          { id: 'command2', name: 'Command 2' }
        ]
      };
      
      expect(response).toHaveProperty('commands');
      expect(Array.isArray(response.commands)).toBe(true);
    });
  });

  describe('正常系', () => {
    it('コマンド一覧を正常に取得できる', async () => {
      const mockResponse: ListCommandsResponse = {
        commands: [
          { id: 'global-search:open', name: 'Search: Search in all files' },
          { id: 'graph:open', name: 'Graph view: Open graph view' },
          { id: 'daily-notes:goto-today', name: 'Daily notes: Open today\'s note' }
        ]
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await listCommandsHandler({});

      expect(mockGet).toHaveBeenCalledWith('/commands/');
      expect(result.content[0].type).toBe('text');
      expect(result.content[0].text).toContain('利用可能なコマンド一覧');
      expect(result.content[0].text).toContain('global-search:open');
      expect(result.content[0].text).toContain('Search: Search in all files');
      expect(result.content[0].text).toContain('3個のコマンドが見つかりました');
    });

    it('コマンドが空の場合も適切に処理される', async () => {
      const mockResponse: ListCommandsResponse = {
        commands: []
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await listCommandsHandler({});

      expect(result.content[0].text).toContain('利用可能なコマンドが見つかりませんでした');
    });

    it('大量のコマンドも適切にフォーマットされる', async () => {
      const commands: CommandInfo[] = Array.from({ length: 50 }, (_, i) => ({
        id: `command-${i}`,
        name: `Command ${i} with a very long descriptive name`
      }));

      const mockResponse: ListCommandsResponse = { commands };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await listCommandsHandler({});

      expect(result.content[0].text).toContain('50個のコマンドが見つかりました');
      expect(result.content[0].text).toContain('command-0');
      expect(result.content[0].text).toContain('command-49');
    });
  });

  describe('エラー処理', () => {
    it('API接続エラー時は適切なエラーメッセージを返す', async () => {
      mockGet.mockRejectedValueOnce(new Error('Network error'));

      await expect(listCommandsHandler({})).rejects.toThrow('コマンド一覧の取得中にエラーが発生しました');
    });

    it('APIエラーレスポンスを適切に処理する', async () => {
      mockGet.mockRejectedValueOnce({
        response: {
          status: 401,
          data: { error: 'Unauthorized' }
        }
      });

      await expect(listCommandsHandler({})).rejects.toThrow('APIエラー: Unauthorized');
    });
  });

  describe('フォーマット', () => {
    it('コマンドが見やすい形式で表示される', async () => {
      const mockResponse: ListCommandsResponse = {
        commands: [
          { id: 'app:go-back', name: 'Navigate back' },
          { id: 'app:go-forward', name: 'Navigate forward' },
          { id: 'app:open-settings', name: 'Open settings' }
        ]
      };

      mockGet.mockResolvedValueOnce(mockResponse);

      const result = await listCommandsHandler({});

      const text = result.content[0].text;
      
      // ヘッダーとフッターの確認
      expect(text).toContain('📋 利用可能なコマンド一覧');
      expect(text).toContain('3個のコマンドが見つかりました');
      
      // 各コマンドの表示形式を確認
      expect(text).toMatch(/app:go-back\s+Navigate back/);
      expect(text).toMatch(/app:go-forward\s+Navigate forward/);
      expect(text).toMatch(/app:open-settings\s+Open settings/);
    });
  });
});