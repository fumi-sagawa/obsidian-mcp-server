import { logger } from '../../lib/logger/index.js';
import { ApiError, SystemError, ErrorCode } from '../../lib/errors/index.js';
import { getConfig } from '../../config/index.js';

/**
 * Obsidian Local REST APIクライアント
 */
export class ObsidianAPIClient {
  private baseUrl: string;
  private apiKey?: string;
  private apiLogger = logger.child({ component: 'obsidian-api' });

  constructor(baseUrl?: string, apiKey?: string) {
    const config = getConfig();
    this.baseUrl = baseUrl || config.obsidianApiUrl || 'http://127.0.0.1:27123';
    this.apiKey = apiKey || config.obsidianApiKey || process.env.OBSIDIAN_API_KEY;
  }

  /**
   * GETリクエストを実行
   */
  async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.apiLogger.debug('Making Obsidian API request', { url, method: 'GET' });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };

      // APIキーがある場合は認証ヘッダーを追加
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const fetchOptions: RequestInit = {
        method: 'GET',
        headers,
        signal: controller.signal,
      };

      // HTTPSの場合は証明書検証を無効化（自己署名証明書対応）
      if (typeof process !== 'undefined' && process.versions && process.versions.node && this.baseUrl.startsWith('https:')) {
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

      const data = await response.json() as T;
      this.apiLogger.trace('Obsidian API request successful', {
        status: response.status,
        dataSize: JSON.stringify(data).length
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

      throw new SystemError(
        'Unexpected error during API request',
        error instanceof Error ? error : undefined,
        { url }
      );
    }
  }

  /**
   * POSTリクエストを実行
   */
  async post<T>(path: string, body: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    this.apiLogger.debug('Making Obsidian API request', { url, method: 'POST' });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const fetchOptions: RequestInit = {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
        signal: controller.signal,
      };

      // HTTPSの場合は証明書検証を無効化（自己署名証明書対応）
      if (typeof process !== 'undefined' && process.versions && process.versions.node && this.baseUrl.startsWith('https:')) {
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

      const data = await response.json() as T;
      this.apiLogger.trace('Obsidian API request successful', {
        status: response.status,
        dataSize: JSON.stringify(data).length
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

      throw new SystemError(
        'Unexpected error during API request',
        error instanceof Error ? error : undefined,
        { url }
      );
    }
  }
}