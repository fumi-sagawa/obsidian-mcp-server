import { BaseError } from './base-error.js';
import { ErrorCode } from './types.js';

export class SystemError extends BaseError {
  constructor(
    message: string,
    originalError?: Error,
    metadata?: Record<string, unknown>
  ) {
    super({
      code: ErrorCode.SYSTEM_ERROR,
      message,
      statusCode: 500,
      originalError,
      metadata,
    });
  }

  static configurationError(message: string, metadata?: Record<string, unknown>): SystemError {
    return new SystemError(
      message,
      undefined,
      { ...metadata, code: ErrorCode.CONFIGURATION_ERROR }
    );
  }
}