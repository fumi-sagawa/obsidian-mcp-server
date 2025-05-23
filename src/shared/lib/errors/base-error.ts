import { ErrorCode, ErrorDetails } from './types.js';

export abstract class BaseError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode?: number;
  public readonly originalError?: Error;
  public readonly metadata?: Record<string, unknown>;
  public readonly timestamp: Date;

  constructor(details: ErrorDetails) {
    super(details.message);
    this.name = this.constructor.name;
    this.code = details.code;
    this.statusCode = details.statusCode;
    this.originalError = details.originalError;
    this.metadata = details.metadata;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  toJSON() {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      metadata: this.metadata,
      timestamp: this.timestamp,
      stack: this.stack,
    };
  }
}