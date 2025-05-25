import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updatePeriodicNoteHandler } from '../update-periodic-note-handler.js';
import type { UpdatePeriodicNoteParams, Period } from '../types.js';
import { obsidianApi } from '../../../shared/api/obsidian/index.js';

vi.mock('../../../shared/api/obsidian/index.js');

describe('updatePeriodicNoteHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常に日次ノートを更新できる', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'daily',
      content: '# Daily Note\n\nThis is updated content.'
    };

    vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

    const result = await updatePeriodicNoteHandler(params);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    });

    expect(obsidianApi.updatePeriodicNote).toHaveBeenCalledWith(
      params.period,
      params.content
    );
  });

  it('正常に週次ノートを更新できる', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'weekly',
      content: '# Weekly Review\n\n## Accomplishments\n- Task 1\n- Task 2'
    };

    vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

    const result = await updatePeriodicNoteHandler(params);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    });

    expect(obsidianApi.updatePeriodicNote).toHaveBeenCalledWith(
      params.period,
      params.content
    );
  });

  it.each<Period>(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'])(
    '各期間タイプ（%s）で更新が成功する',
    async (period) => {
      const params: UpdatePeriodicNoteParams = {
        period,
        content: `# ${period} note\n\nUpdated content for ${period} note.`
      };

      vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

      const result = await updatePeriodicNoteHandler(params);

      expect(result).toEqual({
        content: [
          {
            type: 'text',
            text: `Successfully updated ${period} periodic note`
          }
        ]
      });
    }
  );

  it('Markdown形式のコンテンツを正しく更新できる', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'daily',
      content: `# Daily Note
## Tasks
- [ ] Task 1
- [x] Task 2

## Notes
This is a **bold** text and this is *italic*.

### Code Block
\`\`\`typescript
const hello = "world";
\`\`\`

[Link](https://example.com)`
    };

    vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

    const result = await updatePeriodicNoteHandler(params);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    });

    expect(obsidianApi.updatePeriodicNote).toHaveBeenCalledWith(
      params.period,
      params.content
    );
  });

  it('API接続エラー時は適切なエラーを返す', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'daily',
      content: 'Test content'
    };

    const mockError = new Error('Failed to connect to Obsidian API');
    vi.mocked(obsidianApi.updatePeriodicNote).mockRejectedValue(mockError);

    await expect(updatePeriodicNoteHandler(params)).rejects.toThrow(
      'Failed to connect to Obsidian API'
    );
  });

  it('空のコンテンツでも更新できる', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'daily',
      content: ''
    };

    vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

    const result = await updatePeriodicNoteHandler(params);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    });
  });

  it('改行を含む複数行のコンテンツを更新できる', async () => {
    const params: UpdatePeriodicNoteParams = {
      period: 'monthly',
      content: `# Monthly Review

## Goals
- Goal 1
- Goal 2

## Achievements
This month was productive.

## Next Month
Plan for next month.`
    };

    vi.mocked(obsidianApi.updatePeriodicNote).mockResolvedValue(undefined);

    const result = await updatePeriodicNoteHandler(params);

    expect(result).toEqual({
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    });
  });
});