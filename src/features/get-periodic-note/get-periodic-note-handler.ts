import type { GetPeriodicNoteResponse, PeriodType } from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';

const handlerLogger = logger.child({ feature: 'get-periodic-note' });

/**
 * 定期ノートを取得する（内部処理）
 */
export async function getPeriodicNoteCore(args: Record<string, unknown>): Promise<{ success: boolean; data?: GetPeriodicNoteResponse; error?: { message: string } }> {
  handlerLogger.debug('Getting periodic note', { args });

  // 入力検証
  const { period } = args;
  
  if (!period || typeof period !== 'string') {
    return {
      success: false,
      error: {
        message: 'Period parameter is required and must be a string'
      }
    };
  }

  // 有効なperiod値かチェック
  const validPeriods: PeriodType[] = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
  if (!validPeriods.includes(period as PeriodType)) {
    return {
      success: false,
      error: {
        message: `Invalid period type. Must be one of: ${validPeriods.join(', ')}`
      }
    };
  }

  try {
    const client = new ObsidianAPIClient();
    const periodicNote = await client.getPeriodicNote(period as PeriodType);

    handlerLogger.info('Periodic note retrieved successfully', {
      period,
      path: periodicNote.path,
      size: periodicNote.stat.size
    });

    return {
      success: true,
      data: periodicNote
    };
  } catch (error) {
    handlerLogger.error('Failed to get periodic note', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ApiError) {
      if (error.code === ErrorCode.API_NOT_FOUND) {
        return {
          success: false,
          error: {
            message: `No ${period} note found. The ${period} note may not exist yet.`
          }
        };
      }

      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: {
            message: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
          }
        };
      }
    }

    return {
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * MCPツールハンドラー
 */
export async function getPeriodicNoteHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const result = await getPeriodicNoteCore(args);

  if (result.success && result.data) {
    const formattedContent = formatPeriodicNoteResponse(result.data, args.period as PeriodType);
    return {
      content: [
        {
          type: "text",
          text: formattedContent
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: result.error?.message || 'Failed to get periodic note'
        }
      ]
    };
  }
}

function formatPeriodicNoteResponse(note: GetPeriodicNoteResponse, period: PeriodType): string {
  const lines: string[] = [
    `${period.charAt(0).toUpperCase() + period.slice(1)} note: ${note.path}`,
    `Size: ${note.stat.size} bytes`,
    `Modified: ${new Date(note.stat.mtime).toISOString()}`,
    `Tags: ${note.tags.length > 0 ? note.tags.join(', ') : '(none)'}`,
    '',
    'Content:',
    note.content,
  ];

  return lines.join('\n');
}