import type { AppendToPeriodicNoteInput, AppendToPeriodicNoteResponse } from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';
import { AppendToPeriodicNoteInputSchema } from './schema.js';

const handlerLogger = logger.child({ feature: 'append-to-periodic-note' });

/**
 * 定期ノートに追記する（内部処理）
 */
export async function appendToPeriodicNoteCore(
  args: AppendToPeriodicNoteInput
): Promise<AppendToPeriodicNoteResponse> {
  handlerLogger.debug('Appending to periodic note', {
    period: args.period,
    contentLength: args.content.length
  });

  try {
    const client = new ObsidianAPIClient();
    await client.appendToPeriodicNote(args.period, args.content);

    handlerLogger.info('Content appended to periodic note successfully', {
      period: args.period
    });

    // 成功した場合、定期ノートのパスを取得して返す
    try {
      const periodicNote = await client.getPeriodicNote(args.period);
      return {
        success: true,
        path: periodicNote.path
      };
    } catch (error) {
      // パスが取得できない場合でも、追記は成功しているので成功として扱う
      handlerLogger.warn('Could not get periodic note path after append', { 
        period: args.period,
        error: error instanceof Error ? error.message : String(error)
      });
      return {
        success: true
      };
    }
  } catch (error) {
    handlerLogger.error('Failed to append to periodic note', error instanceof Error ? error : new Error(String(error)));

    if (error instanceof ApiError) {
      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: 'Cannot connect to Obsidian. Make sure Obsidian is running and the Local REST API plugin is enabled.'
        };
      }

      if (error.statusCode === 400) {
        return {
          success: false,
          error: 'Bad request. Please check your input parameters.'
        };
      }

      if (error.statusCode === 405) {
        return {
          success: false,
          error: 'The specified path is a directory, not a file.'
        };
      }
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * MCPツールハンドラー
 */
export async function appendToPeriodicNoteHandler(
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  try {
    // 入力検証
    const validatedInput = AppendToPeriodicNoteInputSchema.parse(args);
    
    const result = await appendToPeriodicNoteCore(validatedInput);

    if (result.success) {
      const message = result.path 
        ? `Successfully appended content to ${args.period} note: ${result.path}`
        : `Successfully appended content to ${args.period} note`;
      
      return {
        content: [
          {
            type: "text",
            text: message
          }
        ]
      };
    } else {
      return {
        content: [
          {
            type: "text",
            text: result.error || 'Failed to append to periodic note'
          }
        ]
      };
    }
  } catch (error) {
    // Zodバリデーションエラー
    if (error instanceof Error && error.name === 'ZodError') {
      return {
        content: [
          {
            type: "text",
            text: `Invalid input: ${error.message}`
          }
        ]
      };
    }

    // その他のエラー
    return {
      content: [
        {
          type: "text",
          text: error instanceof Error ? error.message : 'Unknown error'
        }
      ]
    };
  }
}