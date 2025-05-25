import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getActiveFileHandler, getActiveFileCore } from '../get-active-file-handler.js';
import type { GetActiveFileResponse } from '../types.js';
import { ObsidianAPIClient } from '../../../shared/api/index.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';

vi.mock('../../../shared/api/index.js', () => ({
  ObsidianAPIClient: vi.fn()
}));

describe('getActiveFileHandler', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      getActiveFile: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  it('正常にアクティブファイルの情報を取得できる', async () => {
    const mockResponse: GetActiveFileResponse = {
      content: '# Test Note\n\nThis is a test note.',
      frontmatter: {
        title: 'Test Note',
        tags: ['test', 'sample'],
        date: '2024-05-24',
      },
      path: 'notes/test-note.md',
      stat: {
        ctime: 1716566400000,
        mtime: 1716570000000,
        size: 1024,
      },
      tags: ['#test', '#sample'],
    };

    mockClient.getActiveFile.mockResolvedValue(mockResponse);

    const result = await getActiveFileHandler({});

    expect(mockClient.getActiveFile).toHaveBeenCalledTimes(1);
    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResponse, null, 2),
        },
      ],
    });
  });

  it('アクティブファイルが存在しない場合、適切なメッセージを返す', async () => {
    const error = new ApiError('Not found', ErrorCode.API_NOT_FOUND, 404);
    mockClient.getActiveFile.mockRejectedValue(error);

    const result = await getActiveFileHandler({});

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'No active file is currently open in Obsidian'
          }, null, 2),
        },
      ],
    });
  });

  it('API 接続エラーが発生した場合、接続エラーメッセージを返す', async () => {
    const error = new ApiError('Connection refused', ErrorCode.API_CONNECTION_ERROR, 503);
    mockClient.getActiveFile.mockRejectedValue(error);

    const result = await getActiveFileHandler({});

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
          }, null, 2),
        },
      ],
    });
  });

  it('フロントマターが空の場合でも正常に処理できる', async () => {
    const mockResponse: GetActiveFileResponse = {
      content: 'Simple note without frontmatter',
      frontmatter: {},
      path: 'simple-note.md',
      stat: {
        ctime: 1716566400000,
        mtime: 1716570000000,
        size: 256,
      },
      tags: [],
    };

    mockClient.getActiveFile.mockResolvedValue(mockResponse);

    const result = await getActiveFileHandler({});

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify(mockResponse, null, 2),
        },
      ],
    });
  });

  it('予期しないエラーが発生した場合、エラーメッセージを返す', async () => {
    const error = new Error('Unexpected error');
    mockClient.getActiveFile.mockRejectedValue(error);

    const result = await getActiveFileHandler({});

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: 'Unexpected error'
          }, null, 2),
        },
      ],
    });
  });
});

describe('getActiveFileCore', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      getActiveFile: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  it('成功時はsuccessがtrueでデータを返す', async () => {
    const mockResponse: GetActiveFileResponse = {
      content: 'Test content',
      frontmatter: {},
      path: 'test.md',
      stat: {
        ctime: 1716566400000,
        mtime: 1716570000000,
        size: 100,
      },
      tags: [],
    };

    mockClient.getActiveFile.mockResolvedValue(mockResponse);

    const result = await getActiveFileCore({});

    expect(result).toEqual({
      success: true,
      data: mockResponse
    });
  });

  it('404エラーの場合は適切なエラーメッセージを返す', async () => {
    const error = new ApiError('Not found', ErrorCode.API_NOT_FOUND, 404);
    mockClient.getActiveFile.mockRejectedValue(error);

    const result = await getActiveFileCore({});

    expect(result).toEqual({
      success: false,
      error: {
        message: 'No active file is currently open in Obsidian'
      }
    });
  });

  it('接続エラーの場合は接続エラーメッセージを返す', async () => {
    const error = new ApiError('Connection refused', ErrorCode.API_CONNECTION_ERROR, 503);
    mockClient.getActiveFile.mockRejectedValue(error);

    const result = await getActiveFileCore({});

    expect(result).toEqual({
      success: false,
      error: {
        message: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
      }
    });
  });
});