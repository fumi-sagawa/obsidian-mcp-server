import { describe, it, expect, vi, beforeEach } from 'vitest';
import { listVaultFilesHandler } from '../list-vault-files-handler.js';
import { obsidianApi } from '../../../shared/api/obsidian/index.js';
import type { VaultFileListResponse, VaultItem, ListVaultFilesResult } from '../types.js';

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
    
    const text = result.content[0].text;
    
    // フォーマットの確認
    expect(text).toContain('📁 Vault Files');
    expect(text).toContain('📄 Note.md');
    expect(text).toContain('📁 Daily/');
    expect(text).toContain('📁 Projects/');
    expect(text).toContain('3 directories, 3 files');
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
    expect(result.content[0].text).toContain('🔍 Vault is empty');
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
    expect(result.content[0].text).toContain('50 directories, 50 files');
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
    
    const text = result.content[0].text;
    // ファイルとディレクトリが正しく分類されているか確認
    expect(text).toContain('📄 document.md');
    expect(text).toContain('📄 file.txt');
    expect(text).toContain('📄 .hidden');
    expect(text).toContain('📁 folder/');
    expect(text).toContain('📁 another_folder/');
    expect(text).toContain('📁 .hidden_folder/');
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
    
    const text = result.content[0].text;
    // 特殊文字を含むファイル名が正しく表示されているか確認
    expect(text).toContain('📄 日本語のファイル.md');
    expect(text).toContain('📄 file with spaces.md');
    expect(text).toContain('📄 file-with-dashes.md');
    expect(text).toContain('📄 file_with_underscores.md');
    expect(text).toContain('📄 file.multiple.dots.md');
    expect(text).toContain('📁 Folder with Spaces/');
  });
});