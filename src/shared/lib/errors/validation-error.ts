import { BaseError } from './base-error.js';
import { ErrorCode } from './types.js';

export class ValidationError extends BaseError {
  constructor(
    message: string,
    code: ErrorCode = ErrorCode.VALIDATION_FAILED,
    metadata?: Record<string, unknown>
  ) {
    super({
      code,
      message,
      statusCode: 400,
      metadata,
    });
  }

  static invalidCoordinates(lat: number, lon: number): ValidationError {
    return new ValidationError(
      `Invalid coordinates: latitude ${lat}, longitude ${lon}`,
      ErrorCode.INVALID_COORDINATES,
      { latitude: lat, longitude: lon }
    );
  }

  static invalidStateCode(state: string): ValidationError {
    return new ValidationError(
      `Invalid state code: ${state}. Must be a valid 2-letter US state code.`,
      ErrorCode.INVALID_STATE_CODE,
      { state }
    );
  }

  static fromZodError(error: unknown): ValidationError {
    const message = error instanceof Error ? error.message : 'Validation failed';
    return new ValidationError(message, ErrorCode.VALIDATION_FAILED, {
      zodError: error,
    });
  }
}