import { describe, it, expect, vi, beforeEach } from 'vitest';
import { executeCommandCore } from '../execute-command-handler.js';
import type { CommandExecutionRequest, CommandExecutionResponse } from '../types.js';
import { ObsidianAPIClient } from '../../../shared/api/index.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';

// モックの設定
vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('execute_command', () => {
  let mockClient: { post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // ObsidianAPIClientのモックインスタンスを作成
    mockClient = {
      post: vi.fn(),
    };
    
    // コンストラクタのモック
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient as any);
  });

  it('有効なコマンドIDでコマンドを実行できる', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'global-search:open'
    };

    // 204レスポンス（成功）をモック
    mockClient.post.mockResolvedValueOnce(undefined);

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: true,
      data: {
        success: true,
        message: 'Command executed successfully'
      }
    });
    expect(mockClient.post).toHaveBeenCalledWith('/commands/global-search%3Aopen/', {});
  });

  it('commandIdパラメータが必須であることを検証', async () => {
    // commandIdが空文字列の場合
    const request = { commandId: '' };

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 40000,
        message: 'Command ID is required'
      }
    });
  });

  it('存在しないコマンドIDでは404エラーを返す', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'non-existent-command'
    };

    const mockError = new ApiError(
      'The command you specified does not exist.',
      ErrorCode.API_NOT_FOUND,
      404
    );

    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 40004,
        message: 'The command you specified does not exist.'
      }
    });
    expect(mockClient.post).toHaveBeenCalledWith('/commands/non-existent-command/', {});
  });

  it('特殊文字を含むコマンドIDが正しくURLエンコードされる', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'editor:toggle-bold'
    };

    mockClient.post.mockResolvedValueOnce(undefined);

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: true,
      data: {
        success: true,
        message: 'Command executed successfully'
      }
    });
    expect(mockClient.post).toHaveBeenCalledWith('/commands/editor%3Atoggle-bold/', {});
  });

  it('コロンとハイフンを含むコマンドIDが正しく処理される', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'graph:open-local'
    };

    mockClient.post.mockResolvedValueOnce(undefined);

    await executeCommandCore(request);

    expect(mockClient.post).toHaveBeenCalledWith('/commands/graph%3Aopen-local/', {});
  });

  it('接続エラー時は適切なエラーを返す', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'global-search:open'
    };

    const mockError = new ApiError(
      'Connection refused',
      ErrorCode.API_CONNECTION_ERROR,
      503
    );

    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50001,
        message: 'Connection refused'
      }
    });
  });

  it('ネットワークエラー時は適切なエラーメッセージを返す', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'global-search:open'
    };

    mockClient.post.mockRejectedValueOnce(new Error('Network error'));

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50000,
        message: 'Network error'
      }
    });
  });

  it('タイムアウト時は適切なエラーを返す', async () => {
    const request: CommandExecutionRequest = {
      commandId: 'slow-command'
    };

    const mockError = new ApiError(
      'Request timeout',
      ErrorCode.API_TIMEOUT,
      408
    );

    mockClient.post.mockRejectedValueOnce(mockError);

    const result = await executeCommandCore(request);

    expect(result).toEqual({
      success: false,
      error: {
        errorCode: 50002,
        message: 'Request timeout'
      }
    });
  });
});