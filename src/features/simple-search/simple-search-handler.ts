import { simpleSearchRequestSchema } from './schema.js';
import { obsidianApi } from '../../shared/api/obsidian/index.js';
import { ValidationError, ApiError, ErrorCode } from '../../shared/lib/errors/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { formatSearchResults } from './format-results.js';
import type { SimpleSearchResponse } from './types.js';

export async function simpleSearchHandler(params: unknown): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const startTime = Date.now();
  const requestId = `simple-search-${Date.now()}`;

  logger.debug('simple_search ハンドラーを開始', { requestId, params });

  try {
    // 入力値の検証
    const validationResult = simpleSearchRequestSchema.safeParse(params);
    if (!validationResult.success) {
      throw new ValidationError(
        'Invalid request parameters',
        ErrorCode.VALIDATION_FAILED,
        { errors: validationResult.error.errors }
      );
    }

    const { query, contextLength } = validationResult.data;
    logger.debug('検索パラメータを検証しました', { requestId, query, contextLength });

    // Obsidian APIを呼び出し
    const results = await obsidianApi.searchSimple(query, contextLength);
    
    logger.info(
      'simple_search が完了しました',
      { 
        requestId, 
        query, 
        resultsCount: results.length,
        duration: Date.now() - startTime 
      }
    );

    // 結果をフォーマットしてMCP形式で返す
    const formattedText = formatSearchResults(results);
    
    return {
      content: [
        {
          type: "text" as const,
          text: formattedText,
        },
      ],
    };
  } catch (error) {
    logger.error(
      'simple_search でエラーが発生しました',
      { 
        requestId, 
        error,
        duration: Date.now() - startTime 
      }
    );

    if (error instanceof ValidationError) {
      throw error;
    }

    if (error instanceof ApiError) {
      throw error;
    }

    throw new ApiError(
      'Search operation failed',
      ErrorCode.API_REQUEST_FAILED,
      500,
      error instanceof Error ? error : undefined,
      { details: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}