import { BaseError } from './base-error.js';
import { ErrorCode } from './types.js';

export class ApiError extends BaseError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.API_REQUEST_FAILED,
    statusCode?: number,
    originalError?: Error,
    metadata?: Record<string, unknown>
  ) {
    super({
      code,
      message,
      statusCode: statusCode || 500,
      originalError,
      metadata,
    });
  }

  static fromResponse(response: Response, body?: unknown): ApiError {
    const metadata = {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      body,
    };

    if (response.status === 429) {
      return new ApiError(
        'API rate limit exceeded',
        ErrorCode.API_RATE_LIMIT,
        429,
        undefined,
        metadata
      );
    }

    if (response.status === 408 || response.status === 504) {
      return new ApiError(
        'API request timeout',
        ErrorCode.API_TIMEOUT,
        response.status,
        undefined,
        metadata
      );
    }

    return new ApiError(
      `API request failed: ${response.statusText}`,
      ErrorCode.API_REQUEST_FAILED,
      response.status,
      undefined,
      metadata
    );
  }
}