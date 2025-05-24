import type { 
  SearchNotesRequest, 
  SearchNotesResult, 
  SearchNotesResponse, 
  SearchResultItem
} from './types.js';
import { ObsidianAPIClient } from '../../shared/api/index.js';
import { logger } from '../../shared/lib/logger/index.js';
import { ApiError, ErrorCode } from '../../shared/lib/errors/index.js';
import { getConfig } from '../../shared/config/index.js';

const handlerLogger = logger.child({ feature: 'search-notes' });

/**
 * JsonLogicクエリを専用のContent-Typeで送信する
 */
async function postJsonLogicQuery(client: ObsidianAPIClient, query: any): Promise<SearchNotesResponse> {
  const config = getConfig();
  const baseUrl = (client as any).baseUrl || config.obsidianApiUrl || 'http://127.0.0.1:27123';
  const apiKey = (client as any).apiKey || config.obsidianApiKey || process.env.OBSIDIAN_API_KEY;
  
  const url = `${baseUrl}/search/`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/vnd.olrapi.jsonlogic+json',
    };

    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    const fetchOptions: RequestInit = {
      method: 'POST',
      headers,
      body: JSON.stringify(query),
      signal: controller.signal,
    };

    // HTTPSの場合は証明書検証を無効化（自己署名証明書対応）
    if (typeof process !== 'undefined' && process.versions && process.versions.node && baseUrl.startsWith('https:')) {
      (fetchOptions as any).agent = new (await import('https')).Agent({
        rejectUnauthorized: false
      });
    }

    const response = await fetch(url, fetchOptions);
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => null);
      throw ApiError.fromResponse(response, errorBody);
    }

    const data = await response.json() as SearchNotesResponse;
    
    handlerLogger.trace('JsonLogic search request successful', {
      status: response.status,
      resultCount: data.length
    });

    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError(
          'Request timeout',
          ErrorCode.API_TIMEOUT,
          408,
          undefined,
          { url, timeout: config.apiTimeout }
        );
      }

      // ネットワークエラー（接続拒否など）
      if (error.message.includes('ECONNREFUSED') || error.message.includes('Network')) {
        throw new ApiError(
          'Connection refused',
          ErrorCode.API_CONNECTION_ERROR,
          503,
          undefined,
          { url, originalError: error.message }
        );
      }
    }

    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error',
      ErrorCode.API_REQUEST_FAILED,
      500,
      undefined,
      { url, originalError: error }
    );
  }
}

/**
 * JsonLogicクエリによる高度な検索を実行する（内部処理）
 */
export async function searchNotesCore(args: SearchNotesRequest): Promise<SearchNotesResult> {
  handlerLogger.debug('Executing JsonLogic search', {
    queryString: args.jsonLogicQuery
  });

  try {
    // JsonLogicクエリ文字列をパースしてオブジェクトに変換
    let jsonLogicQuery: any;
    try {
      jsonLogicQuery = JSON.parse(args.jsonLogicQuery);
    } catch (parseError) {
      handlerLogger.error('Failed to parse JsonLogic query', 
        parseError instanceof Error ? parseError : new Error(String(parseError))
      );
      return {
        success: false,
        error: {
          errorCode: 40001,
          message: 'Invalid JsonLogic query format: ' + (parseError instanceof Error ? parseError.message : 'JSON parse error')
        }
      };
    }

    const client = new ObsidianAPIClient();
    
    // JsonLogicクエリを特別なContent-Typeで送信するため、直接fetchを使用
    const response = await postJsonLogicQuery(client, jsonLogicQuery);

    // レスポンスの形式を検証
    if (!isValidSearchResponse(response)) {
      handlerLogger.error('Invalid response format');
      return {
        success: false,
        error: {
          errorCode: 50003,
          message: 'Invalid response format'
        }
      };
    }

    handlerLogger.info('Search completed successfully', {
      resultCount: response.length,
      queryType: 'JsonLogic'
    });

    return {
      success: true,
      data: response
    };
  } catch (error) {
    handlerLogger.error('Failed to execute search', 
      error instanceof Error ? error : new Error(String(error)), 
      {
        queryString: args.jsonLogicQuery
      }
    );

    if (error instanceof ApiError) {
      // 特定のステータスコードに基づいてエラーメッセージを設定
      if (error.statusCode === 400) {
        return {
          success: false,
          error: {
            errorCode: 400,
            message: error.message
          }
        };
      }

      if (error.statusCode === 401) {
        return {
          success: false,
          error: {
            errorCode: 401,
            message: error.message
          }
        };
      }

      if (error.code === ErrorCode.API_CONNECTION_ERROR) {
        return {
          success: false,
          error: {
            errorCode: 50001,
            message: 'Connection refused'
          }
        };
      }

      if (error.code === ErrorCode.API_TIMEOUT) {
        return {
          success: false,
          error: {
            errorCode: 50002,
            message: 'Request timeout'
          }
        };
      }

      // その他のAPIエラー
      return {
        success: false,
        error: {
          errorCode: error.statusCode || 50000,
          message: error.message
        }
      };
    }

    // その他のエラー
    return {
      success: false,
      error: {
        errorCode: 50000,
        message: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * MCPツールハンドラー
 */
export async function searchNotesHandler(args: Record<string, unknown>): Promise<{ content: Array<{ type: "text"; text: string }> }> {
  const result = await searchNotesCore(args as unknown as SearchNotesRequest);

  if (result.success) {
    // 検索結果をフォーマット
    const formattedResults = formatSearchResults(result.data);
    
    return {
      content: [
        {
          type: "text",
          text: formattedResults
        }
      ]
    };
  } else {
    return {
      content: [
        {
          type: "text",
          text: `Search Error (${result.error.errorCode}): ${result.error.message}`
        }
      ]
    };
  }
}

/**
 * 検索結果をフォーマットする
 */
function formatSearchResults(results: SearchNotesResponse): string {
  if (results.length === 0) {
    return 'No matches found for the JsonLogic query.';
  }

  const lines = [
    `Found ${results.length} matching file(s):`,
    '',
  ];

  results.forEach((item, index) => {
    lines.push(`${index + 1}. **${item.filename}**`);
    
    // 結果の型に応じて表示を調整
    if (typeof item.result === 'boolean') {
      lines.push(`   - Match: ${item.result ? 'Yes' : 'No'}`);
    } else if (typeof item.result === 'string') {
      // 長すぎる文字列は truncate
      const truncatedResult = item.result.length > 100 
        ? item.result.substring(0, 100) + '...'
        : item.result;
      lines.push(`   - Result: ${truncatedResult}`);
    } else if (typeof item.result === 'number') {
      lines.push(`   - Value: ${item.result}`);
    } else if (Array.isArray(item.result)) {
      lines.push(`   - Results: [${item.result.length} items]`);
      if (item.result.length <= 5) {
        item.result.forEach((subItem, subIndex) => {
          lines.push(`     ${subIndex + 1}. ${String(subItem)}`);
        });
      } else {
        lines.push(`     (showing first 3 of ${item.result.length})`);
        item.result.slice(0, 3).forEach((subItem, subIndex) => {
          lines.push(`     ${subIndex + 1}. ${String(subItem)}`);
        });
      }
    } else if (typeof item.result === 'object' && item.result !== null) {
      lines.push(`   - Object result with ${Object.keys(item.result).length} properties`);
    } else {
      lines.push(`   - Result: ${String(item.result)}`);
    }
    
    lines.push(''); // 空行を追加
  });

  return lines.join('\n');
}

/**
 * レスポンスが有効なSearchNotesResponse型かどうかを検証
 */
function isValidSearchResponse(response: unknown): response is SearchNotesResponse {
  if (!Array.isArray(response)) {
    return false;
  }

  // 空の配列は有効
  if (response.length === 0) {
    return true;
  }

  // 各アイテムが正しい形式かチェック
  return response.every((item: unknown) => {
    if (!item || typeof item !== 'object') {
      return false;
    }

    const r = item as any;
    
    return (
      typeof r.filename === 'string' &&
      r.hasOwnProperty('result') // result は any 型なので型チェックは不要
    );
  });
}

/**
 * JsonLogicクエリの基本的な検証
 */
export function validateJsonLogicQuery(query: unknown): query is any {
  if (!query || typeof query !== 'object') {
    return false;
  }

  // JsonLogicクエリは必ず演算子をキーとするオブジェクト
  const keys = Object.keys(query as object);
  if (keys.length !== 1) {
    return false;
  }

  const operator = keys[0];
  const validOperators = [
    '==', '===', '!=', '!==', '>', '>=', '<', '<=',
    'and', 'or', '!',
    'in', 'cat', 'substr',
    'glob', 'regexp',
    'var',
    'if'
  ];

  return validOperators.includes(operator);
}