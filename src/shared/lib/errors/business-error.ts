import { BaseError } from './base-error.js';
import { ErrorCode } from './types.js';

export class BusinessError extends BaseError {
  constructor(
    message: string,
    code: ErrorCode,
    metadata?: Record<string, unknown>
  ) {
    super({
      code,
      message,
      statusCode: 404,
      metadata,
    });
  }

}