import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listVaultFilesHandler } from '../list-vault-files-handler.js';
import { obsidianApi } from '../../../shared/api/obsidian/index.js';
import type { VaultFileListResponse, VaultItem } from '../types.js';

vi.mock('../../../shared/api/obsidian/index.js');

describe('listVaultFilesHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常にVaultルートのファイル一覧を取得できる', async () => {
    // APIレスポンスのモック
    const mockResponse: VaultFileListResponse = {
      files: [
        'Note.md',
        'Daily/',
        'Projects/',
        'README.md',
        'Templates/',
        'Archive.md'
      ]
    };

    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(mockResponse);

    // ハンドラー実行
    const result = await listVaultFilesHandler({});

    // APIが正しく呼ばれたか確認
    expect(obsidianApi.listVaultFiles).toHaveBeenCalledWith();

    // 結果の検証
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const parsedResponse = JSON.parse(result.content[0].text);
    
    // APIレスポンスの構造が保持されていることを確認
    expect(parsedResponse).toHaveProperty('files');
    expect(parsedResponse).toHaveProperty('items');
    expect(parsedResponse.files).toEqual(mockResponse.files);
    expect(parsedResponse.items).toHaveLength(6);
    expect(parsedResponse.items.filter((item: VaultItem) => item.type === 'directory')).toHaveLength(3);
    expect(parsedResponse.items.filter((item: VaultItem) => item.type === 'file')).toHaveLength(3);
  });

  it('空のVaultディレクトリを正しく処理できる', async () => {
    const mockResponse: VaultFileListResponse = {
      files: []
    };

    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(mockResponse);

    const result = await listVaultFilesHandler({});

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const parsedResponse = JSON.parse(result.content[0].text);
    expect(parsedResponse.files).toEqual([]);
    expect(parsedResponse.items).toEqual([]);
  });

  it('大量のファイルを含むディレクトリを処理できる', async () => {
    // 100個のファイルを生成
    const files = [];
    for (let i = 1; i <= 50; i++) {
      files.push(`file${i}.md`);
    }
    for (let i = 1; i <= 50; i++) {
      files.push(`folder${i}/`);
    }

    const mockResponse: VaultFileListResponse = { files };

    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(mockResponse);

    const result = await listVaultFilesHandler({});

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const parsedResponse = JSON.parse(result.content[0].text);
    expect(parsedResponse.files).toHaveLength(100);
    expect(parsedResponse.items).toHaveLength(100);
    expect(parsedResponse.items.filter((item: VaultItem) => item.type === 'directory')).toHaveLength(50);
    expect(parsedResponse.items.filter((item: VaultItem) => item.type === 'file')).toHaveLength(50);
  });

  it('ファイルタイプを正しく判別できる', async () => {
    const mockResponse: VaultFileListResponse = {
      files: [
        'document.md',          // ファイル
        'folder/',              // ディレクトリ
        'file.txt',             // ファイル
        'another_folder/',      // ディレクトリ
        '.hidden',              // 隠しファイル
        '.hidden_folder/'       // 隠しディレクトリ
      ]
    };

    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(mockResponse);

    const result = await listVaultFilesHandler({});

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const parsedResponse = JSON.parse(result.content[0].text);
    // ファイルとディレクトリが正しく分類されているか確認
    const files = parsedResponse.items.filter((item: VaultItem) => item.type === 'file');
    const directories = parsedResponse.items.filter((item: VaultItem) => item.type === 'directory');
    
    expect(files).toContainEqual({ name: 'document.md', type: 'file' });
    expect(files).toContainEqual({ name: 'file.txt', type: 'file' });
    expect(files).toContainEqual({ name: '.hidden', type: 'file' });
    expect(directories).toContainEqual({ name: 'folder/', type: 'directory' });
    expect(directories).toContainEqual({ name: 'another_folder/', type: 'directory' });
    expect(directories).toContainEqual({ name: '.hidden_folder/', type: 'directory' });
  });

  it('API接続エラー時に適切なエラーをスローする', async () => {
    const error = new Error('Connection failed');
    vi.mocked(obsidianApi.listVaultFiles).mockRejectedValueOnce(error);

    await expect(listVaultFilesHandler({})).rejects.toThrow('Failed to get vault file list');
    expect(obsidianApi.listVaultFiles).toHaveBeenCalledWith();
  });

  it('APIがnullレスポンスを返した場合のエラーハンドリング', async () => {
    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(null as any);

    await expect(listVaultFilesHandler({})).rejects.toThrow();
  });

  it('APIが不正な形式のレスポンスを返した場合のエラーハンドリング', async () => {
    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce({ invalid: 'response' } as any);

    await expect(listVaultFilesHandler({})).rejects.toThrow();
  });

  it('特殊文字を含むファイル名を正しく処理できる', async () => {
    const mockResponse: VaultFileListResponse = {
      files: [
        '日本語のファイル.md',
        'file with spaces.md',
        'file-with-dashes.md',
        'file_with_underscores.md',
        'file.multiple.dots.md',
        'Folder with Spaces/'
      ]
    };

    vi.mocked(obsidianApi.listVaultFiles).mockResolvedValueOnce(mockResponse);

    const result = await listVaultFilesHandler({});

    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    
    const parsedResponse = JSON.parse(result.content[0].text);
    // 特殊文字を含むファイル名が正しく保持されているか確認
    expect(parsedResponse.files).toContain('日本語のファイル.md');
    expect(parsedResponse.files).toContain('file with spaces.md');
    expect(parsedResponse.files).toContain('file-with-dashes.md');
    expect(parsedResponse.files).toContain('file_with_underscores.md');
    expect(parsedResponse.files).toContain('file.multiple.dots.md');
    expect(parsedResponse.files).toContain('Folder with Spaces/');
  });
});