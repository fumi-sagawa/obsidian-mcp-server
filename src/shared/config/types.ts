import type { LogLevel } from '../lib/logger/types.js';

export interface Config {
  // Logging
  logLevel: LogLevel;
  debugMode: boolean;
  
  // API Configuration
  apiTimeout: number;
  apiRetryAttempts: number;
  apiRetryDelay: number;
  
  // NWS API specific
  nwsApiBaseUrl: string;
  nwsUserAgent: string;
  
  // Obsidian API
  obsidianApiUrl?: string;
  obsidianApiKey?: string;
  
  // Development
  prettyLogs: boolean;
  logTimestamps: boolean;
  
  // Performance
  slowOperationThreshold: number;
}