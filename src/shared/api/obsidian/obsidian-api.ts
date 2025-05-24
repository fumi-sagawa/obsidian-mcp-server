import { logger } from '../../lib/logger/index.js';
import { ApiError, SystemError, ErrorCode } from '../../lib/errors/index.js';
import { getConfig } from '../../config/index.js';
import type { GetActiveFileResponse } from '../../../features/get-active-file/types.js';

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

  /**
   * アクティブファイルを取得
   */
  async getActiveFile(): Promise<GetActiveFileResponse> {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.olrapi.note+json',
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    } else {
      this.apiLogger.warn('No API key configured for Obsidian API');
    }

    const url = `${this.baseUrl}/active/`;
    this.apiLogger.debug('Getting active file', { 
      url,
      hasApiKey: !!this.apiKey
    });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
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
        if (response.status === 401) {
          this.apiLogger.error('Unauthorized: API key is invalid or missing');
          throw new ApiError(
            'Unauthorized: Invalid or missing API key',
            ErrorCode.API_REQUEST_FAILED,
            401,
            undefined,
            { url }
          );
        }
        if (response.status === 404) {
          throw new ApiError(
            'No active file',
            ErrorCode.API_NOT_FOUND,
            404,
            undefined,
            { url }
          );
        }
        const errorBody = await response.text().catch(() => null);
        this.apiLogger.error('API request failed', { 
          status: response.status, 
          statusText: response.statusText,
          errorBody 
        } as any);
        throw ApiError.fromResponse(response, errorBody);
      }

      const data = await response.json() as GetActiveFileResponse;
      this.apiLogger.trace('Active file retrieved successfully', {
        status: response.status,
        path: data.path
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

  /**
   * アクティブファイルにコンテンツを追記
   */
  async appendToActiveFile(content: string): Promise<{ message: string }> {
    const url = `${this.baseUrl}/active/`;
    this.apiLogger.debug('Appending to active file', { 
      url,
      contentLength: content.length,
      hasApiKey: !!this.apiKey
    });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'text/markdown',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      } else {
        this.apiLogger.warn('No API key configured for Obsidian API');
      }

      const fetchOptions: RequestInit = {
        method: 'POST',
        headers,
        body: content,
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
        if (response.status === 401) {
          this.apiLogger.error('Unauthorized: API key is invalid or missing');
          throw new ApiError(
            'Unauthorized: Invalid or missing API key',
            ErrorCode.API_REQUEST_FAILED,
            401,
            undefined,
            { url }
          );
        }
        if (response.status === 404) {
          throw new ApiError(
            'No active file',
            ErrorCode.API_NOT_FOUND,
            404,
            undefined,
            { url }
          );
        }
        const errorBody = await response.text().catch(() => null);
        this.apiLogger.error('API request failed', { 
          status: response.status, 
          statusText: response.statusText,
          errorBody 
        } as any);
        throw ApiError.fromResponse(response, errorBody);
      }

      // 204 No Contentの場合はボディがないため、空のレスポンスを返す
      if (response.status === 204) {
        this.apiLogger.trace('Content appended successfully (204 No Content)', {
          status: response.status
        });
        return { message: 'Content appended successfully' };
      }

      // それ以外の成功レスポンスの場合はJSONをパース
      const data = await response.json() as { message: string };
      this.apiLogger.trace('Content appended successfully', {
        status: response.status,
        data
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

  /**
   * アクティブファイルの内容を更新
   */
  async updateActiveFile(content: string): Promise<void> {
    const url = `${this.baseUrl}/active/`;
    this.apiLogger.debug('Updating active file', { 
      url,
      contentLength: content.length,
      hasApiKey: !!this.apiKey
    });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'text/markdown',
      };

      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      } else {
        this.apiLogger.warn('No API key configured for Obsidian API');
      }

      const fetchOptions: RequestInit = {
        method: 'PUT',
        headers,
        body: content,
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
        if (response.status === 401) {
          this.apiLogger.error('Unauthorized: API key is invalid or missing');
          throw new ApiError(
            'Unauthorized: Invalid or missing API key',
            ErrorCode.API_REQUEST_FAILED,
            401,
            undefined,
            { url }
          );
        }
        if (response.status === 404) {
          throw new ApiError(
            'No active file',
            ErrorCode.API_NOT_FOUND,
            404,
            undefined,
            { url }
          );
        }
        if (response.status === 405) {
          throw new ApiError(
            'Cannot update directory',
            ErrorCode.API_REQUEST_FAILED,
            405,
            undefined,
            { url }
          );
        }
        const errorBody = await response.text().catch(() => null);
        this.apiLogger.error('API request failed', { 
          status: response.status, 
          statusText: response.statusText,
          errorBody 
        } as any);
        throw ApiError.fromResponse(response, errorBody);
      }

      // 204 No Content が返される
      this.apiLogger.trace('Active file updated successfully', {
        status: response.status
      });
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

  /**
   * アクティブファイルに対してPATCH操作を実行
   */
  async patchActiveFile(headers: Record<string, string>, content: string): Promise<void> {
    const url = `${this.baseUrl}/active/`;
    this.apiLogger.debug('Patching active file', { 
      url,
      headers,
      contentLength: content.length,
      hasApiKey: !!this.apiKey
    });

    const controller = new AbortController();
    const config = getConfig();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

    try {
      const requestHeaders: Record<string, string> = {
        ...headers
      };

      if (this.apiKey) {
        requestHeaders['Authorization'] = `Bearer ${this.apiKey}`;
      } else {
        this.apiLogger.warn('No API key configured for Obsidian API');
      }

      const fetchOptions: RequestInit = {
        method: 'PATCH',
        headers: requestHeaders,
        body: content,
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
        if (response.status === 401) {
          this.apiLogger.error('Unauthorized: API key is invalid or missing');
          throw new ApiError(
            'Unauthorized: Invalid or missing API key',
            ErrorCode.API_REQUEST_FAILED,
            401,
            undefined,
            { url }
          );
        }
        if (response.status === 404) {
          throw new ApiError(
            'Target not found',
            ErrorCode.API_NOT_FOUND,
            404,
            undefined,
            { url, headers }
          );
        }
        if (response.status === 400) {
          const errorBody = await response.text().catch(() => null);
          throw new ApiError(
            errorBody || 'Bad request',
            ErrorCode.API_REQUEST_FAILED,
            400,
            undefined,
            { url, headers }
          );
        }
        if (response.status === 405) {
          throw new ApiError(
            'Cannot patch directory',
            ErrorCode.API_REQUEST_FAILED,
            405,
            undefined,
            { url }
          );
        }
        const errorBody = await response.text().catch(() => null);
        this.apiLogger.error('API request failed', { 
          status: response.status, 
          statusText: response.statusText,
          errorBody,
          headers 
        } as any);
        throw ApiError.fromResponse(response, errorBody);
      }

      // 200 OK が返される
      this.apiLogger.trace('Active file patched successfully', {
        status: response.status
      });
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