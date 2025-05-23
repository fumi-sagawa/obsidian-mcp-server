import { LogLevel, LogContext, LogEntry, Logger } from './types.js';
import { getConfig } from '../../config/index.js';
import { BaseError } from '../errors/index.js';

export class MCPLogger implements Logger {
  private static LOG_LEVELS: Record<LogLevel, number> = {
    trace: 0,
    debug: 1,
    info: 2,
    warn: 3,
    error: 4,
  };

  private minLevel: LogLevel;
  private config = getConfig();
  private defaultContext: LogContext;

  constructor(minLevel?: LogLevel, defaultContext: LogContext = {}) {
    this.minLevel = minLevel || this.config.logLevel;
    this.defaultContext = defaultContext;
  }

  trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, errorOrContext?: Error | BaseError | LogContext, context?: LogContext): void {
    let actualError: Error | BaseError | undefined;
    let actualContext: LogContext | undefined;

    // Handle overloaded parameters
    if (errorOrContext instanceof Error || (errorOrContext && 'name' in errorOrContext && 'message' in errorOrContext)) {
      actualError = errorOrContext as Error | BaseError;
      actualContext = context;
    } else {
      actualContext = errorOrContext as LogContext;
    }

    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      context: { ...this.defaultContext, ...actualContext },
    };

    if (actualError) {
      if (actualError instanceof BaseError) {
        logEntry.error = {
          name: actualError.name,
          message: actualError.message,
          stack: actualError.stack,
          code: actualError.code,
          statusCode: actualError.statusCode,
          metadata: actualError.metadata,
        };
      } else {
        logEntry.error = {
          name: actualError.name,
          message: actualError.message,
          stack: actualError.stack,
        };
      }
    }

    this.write(logEntry);
  }

  child(context: LogContext): Logger {
    return new MCPLogger(this.minLevel, { ...this.defaultContext, ...context });
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (this.shouldLog(level)) {
      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        context: { ...this.defaultContext, ...context },
      };
      this.write(logEntry);
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return MCPLogger.LOG_LEVELS[level] >= MCPLogger.LOG_LEVELS[this.minLevel];
  }

  private write(entry: LogEntry): void {
    if (this.config.prettyLogs) {
      this.writePretty(entry);
    } else {
      // MCP requires logging to stderr
      console.error(JSON.stringify(entry));
    }
  }

  private writePretty(entry: LogEntry): void {
    const colors = {
      trace: '\x1b[90m', // gray
      debug: '\x1b[36m', // cyan
      info: '\x1b[32m',  // green
      warn: '\x1b[33m',  // yellow
      error: '\x1b[31m', // red
    };
    const reset = '\x1b[0m';
    const color = colors[entry.level];
    
    let output = '';
    
    if (this.config.logTimestamps) {
      output += `[${entry.timestamp}] `;
    }
    
    output += `${color}${entry.level.toUpperCase().padEnd(5)}${reset} ${entry.message}`;
    
    if (entry.context && Object.keys(entry.context).length > 0) {
      output += ` ${JSON.stringify(entry.context)}`;
    }
    
    if (entry.error) {
      output += `\n  Error: ${entry.error.message}`;
      if (this.config.debugMode && entry.error.stack) {
        output += `\n${entry.error.stack}`;
      }
    }
    
    console.error(output);
  }
}

// Default logger instance
export const logger = new MCPLogger();