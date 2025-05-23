import os from 'os';
import type { HealthCheck, HealthCheckResult } from '../types.js';
import { HealthStatus } from '../types.js';

export class MemoryHealthCheck implements HealthCheck {
  name = 'memory';
  private thresholds = {
    warning: 0.8,  // 80% memory usage
    critical: 0.9  // 90% memory usage
  };

  async check(): Promise<HealthCheckResult> {
    const start = Date.now();
    
    try {
      const memoryUsage = process.memoryUsage();
      const totalMemory = os.totalmem();
      const freeMemory = os.freemem();
      const usedMemory = totalMemory - freeMemory;
      const usagePercentage = usedMemory / totalMemory;
      
      const heapUsagePercentage = memoryUsage.heapUsed / memoryUsage.heapTotal;
      
      let status = HealthStatus.HEALTHY;
      let message = 'Memory usage is within normal limits';
      
      if (usagePercentage >= this.thresholds.critical || heapUsagePercentage >= this.thresholds.critical) {
        status = HealthStatus.UNHEALTHY;
        message = 'Critical memory usage detected';
      } else if (usagePercentage >= this.thresholds.warning || heapUsagePercentage >= this.thresholds.warning) {
        status = HealthStatus.DEGRADED;
        message = 'High memory usage detected';
      }
      
      return {
        status,
        message,
        duration: Date.now() - start,
        timestamp: Date.now(),
        details: {
          system: {
            total: totalMemory,
            used: usedMemory,
            free: freeMemory,
            percentage: Math.round(usagePercentage * 100)
          },
          process: {
            heapUsed: memoryUsage.heapUsed,
            heapTotal: memoryUsage.heapTotal,
            heapPercentage: Math.round(heapUsagePercentage * 100),
            external: memoryUsage.external,
            rss: memoryUsage.rss
          }
        }
      };
    } catch (error) {
      return {
        status: HealthStatus.UNHEALTHY,
        message: `Failed to check memory: ${error instanceof Error ? error.message : 'Unknown error'}`,
        duration: Date.now() - start,
        timestamp: Date.now()
      };
    }
  }
}