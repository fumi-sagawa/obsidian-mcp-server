import type { UpdatePeriodicNoteParams } from './types.js';
import { obsidianApi } from '../../shared/api/obsidian/index.js';
import { logger } from '../../shared/lib/logger/logger.js';

export async function updatePeriodicNoteHandler(
  params: UpdatePeriodicNoteParams
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  logger.debug('Updating periodic note', { period: params.period });

  try {
    await obsidianApi.updatePeriodicNote(params.period, params.content);

    logger.info('Successfully updated periodic note', { period: params.period });

    return {
      content: [
        {
          type: 'text',
          text: `Successfully updated ${params.period} periodic note`
        }
      ]
    };
  } catch (error) {
    logger.error('Failed to update periodic note', {
      period: params.period,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}