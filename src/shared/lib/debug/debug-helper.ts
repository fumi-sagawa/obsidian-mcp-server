import { logger } from '../logger/index.js';
import { getConfig } from '../../config/index.js';

export interface DebugContext {
  operation: string;
  requestId: string;
  [key: string]: unknown;
}

export class DebugHelper {
  private static instance: DebugHelper;
  private config = getConfig();
  private startTimes = new Map<string, number>();

  private constructor() {}

  static getInstance(): DebugHelper {
    if (!DebugHelper.instance) {
      DebugHelper.instance = new DebugHelper();
    }
    return DebugHelper.instance;
  }

  startTimer(requestId: string): void {
    if (this.config.debugMode) {
      this.startTimes.set(requestId, Date.now());
    }
  }

  endTimer(requestId: string, operation: string): void {
    if (this.config.debugMode) {
      const startTime = this.startTimes.get(requestId);
      if (startTime) {
        const duration = Date.now() - startTime;
        logger.debug(`Operation completed: ${operation}`, {
          requestId,
          durationMs: duration,
        });
        this.startTimes.delete(requestId);
      }
    }
  }

  logMemoryUsage(context: string): void {
    if (this.config.debugMode) {
      const usage = process.memoryUsage();
      logger.trace(`Memory usage: ${context}`, {
        heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
        rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
        external: `${Math.round(usage.external / 1024 / 1024)}MB`,
      });
    }
  }

  logEnvironment(): void {
    if (this.config.debugMode) {
      logger.debug('Environment information', {
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        pid: process.pid,
        uptime: process.uptime(),
        env: {
          LOG_LEVEL: process.env.LOG_LEVEL,
          DEBUG_MODE: process.env.DEBUG_MODE,
          PRETTY_LOGS: process.env.PRETTY_LOGS,
          NODE_ENV: process.env.NODE_ENV,
        },
      });
    }
  }

  createRequestLogger(requestId: string, operation: string) {
    return logger.child({ requestId, operation });
  }
}

export const debugHelper = DebugHelper.getInstance();