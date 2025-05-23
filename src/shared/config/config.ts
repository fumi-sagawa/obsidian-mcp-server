import { Config } from './types.js';
import type { LogLevel } from '../lib/logger/types.js';
import { SystemError } from '../lib/errors/index.js';

function getEnvString(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  
  const parsed = Number(value);
  if (isNaN(parsed)) {
    throw SystemError.configurationError(
      `Invalid number value for ${key}: ${value}`
    );
  }
  
  return parsed;
}

function getEnvBoolean(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (!value) {
    return defaultValue;
  }
  
  return value.toLowerCase() === 'true' || value === '1';
}

function getLogLevel(): LogLevel {
  const value = getEnvString('LOG_LEVEL', 'info').toLowerCase();
  const validLevels: LogLevel[] = ['trace', 'debug', 'info', 'warn', 'error'];
  
  if (!validLevels.includes(value as LogLevel)) {
    throw SystemError.configurationError(
      `Invalid log level: ${value}. Must be one of: ${validLevels.join(', ')}`
    );
  }
  
  return value as LogLevel;
}

export function loadConfig(): Config {
  const debugMode = getEnvBoolean('DEBUG_MODE', false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // Logging
    logLevel: getLogLevel(),
    debugMode,
    
    // API Configuration
    apiTimeout: getEnvNumber('API_TIMEOUT', 30000), // 30 seconds
    apiRetryAttempts: getEnvNumber('API_RETRY_ATTEMPTS', 3),
    apiRetryDelay: getEnvNumber('API_RETRY_DELAY', 1000), // 1 second
    
    // NWS API specific
    nwsApiBaseUrl: getEnvString('NWS_API_BASE_URL', 'https://api.weather.gov'),
    nwsUserAgent: getEnvString('NWS_USER_AGENT', '(weather-mcp-server, contact@example.com)'),
    
    // Development
    prettyLogs: getEnvBoolean('PRETTY_LOGS', isDevelopment),
    logTimestamps: getEnvBoolean('LOG_TIMESTAMPS', true),
    
    // Performance
    slowOperationThreshold: getEnvNumber('SLOW_OPERATION_THRESHOLD', 1000), // 1 second
  };
}

// Singleton instance
let configInstance: Config | null = null;

export function getConfig(): Config {
  if (!configInstance) {
    configInstance = loadConfig();
  }
  return configInstance;
}

// Allow reloading config (useful for tests)
export function reloadConfig(): Config {
  configInstance = loadConfig();
  return configInstance;
}