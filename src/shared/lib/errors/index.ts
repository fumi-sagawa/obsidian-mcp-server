export * from './types.js';
export * from './base-error.js';
export * from './api-error.js';
export * from './validation-error.js';
export * from './system-error.js';
export * from './business-error.js';

import { BaseError } from './base-error.js';
import { ApiError } from './api-error.js';
import { ValidationError } from './validation-error.js';
import { SystemError } from './system-error.js';
import { BusinessError } from './business-error.js';
import { logger } from '../logger/index.js';

export function isWeatherError(error: unknown): error is BaseError {
  return error instanceof BaseError;
}

export function handleError(error: unknown, context?: string): BaseError {
  const contextStr = context ? `[${context}] ` : '';

  if (isWeatherError(error)) {
    logger.error(`${contextStr}${error.name}`, error);
    return error;
  }

  if (error instanceof Error) {
    logger.error(`${contextStr}Unexpected error`, error);
    return new SystemError(error.message, error);
  }

  const message = String(error);
  logger.error(`${contextStr}Unknown error: ${message}`);
  return new SystemError(message);
}