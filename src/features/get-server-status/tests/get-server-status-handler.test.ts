import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getServerStatusCore } from '../get-server-status-handler.js';
import type { ServerStatusResponse, ErrorResponse } from '../types.js';
import { ObsidianAPIClient } from '../../../shared/api/index.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';

// モックの設定
vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('get_server_status', () => {
  let mockClient: { get: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // ObsidianAPIClientのモックインスタンスを作成
    mockClient = {
      get: vi.fn(),
    };
    
    // コンストラクタのモック
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient as any);
  });

  it('正常にサーバー状態を取得できる', async () => {
    // 型定義に基づいた正確なモックデータ
    const mockResponse: ServerStatusResponse = {
      authenticated: true,
      status: 'OK',
      service: 'Obsidian Local REST API',
      versions: {
        obsidian: '1.5.0',
        self: '1.0.0'
      }
    };

    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: true,
      data: mockResponse
    });
    expect(mockClient.get).toHaveBeenCalledWith('/');
  });

  it('認証されていない状態でもステータスを取得できる', async () => {
    // 認証なしの状態のモックデータ
    const mockResponse: ServerStatusResponse = {
      authenticated: false,
      status: 'OK',
      service: 'Obsidian Local REST API',
      versions: {
        obsidian: '1.5.0',
        self: '1.0.0'
      }
    };

    mockClient.get.mockResolvedValueOnce(mockResponse);

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: true,
      data: mockResponse
    });
    expect((result as any).data.authenticated).toBe(false);
  });

  it('接続エラー時は適切なエラー型を返す', async () => {
    const mockError = new ApiError(
      'Connection refused',
      ErrorCode.API_CONNECTION_ERROR,
      503
    );

    mockClient.get.mockRejectedValueOnce(mockError);

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50001,
        message: 'Connection refused'
      }
    });
  });

  it('ネットワークエラー時は適切なエラーメッセージを返す', async () => {
    mockClient.get.mockRejectedValueOnce(new Error('Network error'));

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50000,
        message: 'Network error'
      }
    });
  });

  it('タイムアウト時は適切なエラーを返す', async () => {
    const mockError = new ApiError(
      'Request timeout',
      ErrorCode.API_TIMEOUT,
      408
    );

    mockClient.get.mockRejectedValueOnce(mockError);

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50002,
        message: 'Request timeout'
      }
    });
  });

  it('予期しないレスポンス形式の場合はエラーを返す', async () => {
    // 不正な形式のレスポンス
    mockClient.get.mockResolvedValueOnce({ invalid: 'response' });

    const result = await getServerStatusCore({});

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50003,
        message: 'Invalid response format'
      }
    });
  });
});