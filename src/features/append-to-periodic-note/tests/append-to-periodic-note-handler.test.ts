import { describe, it, expect, vi, beforeEach } from 'vitest';
import { appendToPeriodicNoteHandler, appendToPeriodicNoteCore } from '../append-to-periodic-note-handler.js';
import { ObsidianAPIClient } from '../../../shared/api/index.js';
import { ApiError, ErrorCode } from '../../../shared/lib/errors/index.js';
import type { AppendToPeriodicNoteInput, AppendToPeriodicNoteResponse } from '../types.js';
import type { GetPeriodicNoteResponse } from '../../get-periodic-note/types.js';

// ObsidianAPIClientをモック
vi.mock('../../../shared/api/index.js');

describe('append-to-periodic-note-handler', () => {
  let mockClient: any;

  beforeEach(() => {
    mockClient = {
      appendToPeriodicNote: vi.fn(),
      getPeriodicNote: vi.fn()
    };
    vi.mocked(ObsidianAPIClient).mockImplementation(() => mockClient);
  });

  describe('appendToPeriodicNoteCore', () => {
    it('正常に定期ノートに追記でき、パスも取得できる', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'daily',
        content: '# Test Content\n\nThis is a test.'
      };

      const mockPeriodicNote: GetPeriodicNoteResponse = {
        path: 'Daily Notes/2024-05-24.md',
        content: 'Existing content',
        tags: [],
        frontmatter: {},
        stat: {
          ctime: 1716566400000,
          mtime: 1716566400000,
          size: 100
        }
      };

      mockClient.appendToPeriodicNote.mockResolvedValue(undefined);
      mockClient.getPeriodicNote.mockResolvedValue(mockPeriodicNote);

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: true,
        path: 'Daily Notes/2024-05-24.md'
      });
      expect(mockClient.appendToPeriodicNote).toHaveBeenCalledWith('daily', '# Test Content\n\nThis is a test.');
      expect(mockClient.getPeriodicNote).toHaveBeenCalledWith('daily');
    });

    it('追記は成功したがパス取得に失敗した場合でも成功として扱う', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'weekly',
        content: 'Weekly update'
      };

      mockClient.appendToPeriodicNote.mockResolvedValue(undefined);
      mockClient.getPeriodicNote.mockRejectedValue(new Error('Failed to get note'));

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: true
      });
      expect(mockClient.appendToPeriodicNote).toHaveBeenCalledWith('weekly', 'Weekly update');
    });

    it('接続エラー時は適切なエラーメッセージを返す', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'monthly',
        content: 'Monthly report'
      };

      mockClient.appendToPeriodicNote.mockRejectedValue(
        new ApiError('Connection refused', ErrorCode.API_CONNECTION_ERROR, 503)
      );

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: false,
        error: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
      });
    });

    it('400エラー時は適切なエラーメッセージを返す', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'quarterly',
        content: 'Q1 report'
      };

      mockClient.appendToPeriodicNote.mockRejectedValue(
        new ApiError('Bad request', ErrorCode.API_REQUEST_FAILED, 400)
      );

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: false,
        error: 'Bad request. Please check your input parameters.'
      });
    });

    it('405エラー時は適切なエラーメッセージを返す', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'yearly',
        content: 'Annual summary'
      };

      mockClient.appendToPeriodicNote.mockRejectedValue(
        new ApiError('Method not allowed', ErrorCode.API_REQUEST_FAILED, 405)
      );

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: false,
        error: 'The specified path is a directory, not a file.'
      });
    });

    it('その他のエラー時はエラーメッセージをそのまま返す', async () => {
      const input: AppendToPeriodicNoteInput = {
        period: 'daily',
        content: 'Test content'
      };

      mockClient.appendToPeriodicNote.mockRejectedValue(
        new Error('Unexpected error')
      );

      const result = await appendToPeriodicNoteCore(input);

      expect(result).toEqual<AppendToPeriodicNoteResponse>({
        success: false,
        error: 'Unexpected error'
      });
    });
  });

  describe('appendToPeriodicNoteHandler', () => {
    it('正常系：MCPツールとして正しくレスポンスを返す', async () => {
      const args = {
        period: 'daily',
        content: 'Test content'
      };

      mockClient.appendToPeriodicNote.mockResolvedValue(undefined);
      mockClient.getPeriodicNote.mockResolvedValue({
        path: 'Daily Notes/2024-05-24.md',
        content: 'Existing content',
        tags: [],
        frontmatter: {},
        stat: { ctime: 1716566400000, mtime: 1716566400000, size: 100 }
      });

      const result = await appendToPeriodicNoteHandler(args);

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Successfully appended content to daily note: Daily Notes/2024-05-24.md'
          }
        ]
      });
    });

    it('パスなしの成功時も適切なメッセージを返す', async () => {
      const args = {
        period: 'weekly',
        content: 'Test content'
      };

      mockClient.appendToPeriodicNote.mockResolvedValue(undefined);
      mockClient.getPeriodicNote.mockRejectedValue(new Error('Failed'));

      const result = await appendToPeriodicNoteHandler(args);

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Successfully appended content to weekly note'
          }
        ]
      });
    });

    it('異常系：エラー時はエラーメッセージを返す', async () => {
      const args = {
        period: 'monthly',
        content: 'Test content'
      };

      mockClient.appendToPeriodicNote.mockRejectedValue(
        new ApiError('Connection refused', ErrorCode.API_CONNECTION_ERROR, 503)
      );

      const result = await appendToPeriodicNoteHandler(args);

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
          }
        ]
      });
    });

    it('バリデーションエラー時は適切なエラーメッセージを返す', async () => {
      const args = {
        period: 'invalid-period',
        content: 'Test content'
      };

      const result = await appendToPeriodicNoteHandler(args);

      expect(result.content[0].text).toContain('Invalid input');
    });

    it('空のコンテンツはバリデーションエラーになる', async () => {
      const args = {
        period: 'daily',
        content: ''
      };

      const result = await appendToPeriodicNoteHandler(args);

      expect(result.content[0].text).toContain('Invalid input');
    });

    it('必須パラメータが欠けている場合はバリデーションエラー', async () => {
      const args = {
        period: 'daily'
        // content is missing
      };

      const result = await appendToPeriodicNoteHandler(args);

      expect(result.content[0].text).toContain('Invalid input');
    });
  });
});