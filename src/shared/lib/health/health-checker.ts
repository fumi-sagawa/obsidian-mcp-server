import { MetricsRegistry } from '../metrics/index.js';
import type { HealthCheck, SystemHealth, HealthCheckResult } from './types.js';
import { HealthStatus } from './types.js';
import { NWSAPIHealthCheck } from './checks/nws-api-check.js';
import { MemoryHealthCheck } from './checks/memory-check.js';

export class HealthChecker {
  private static instance: HealthChecker;
  private checks: Map<string, HealthCheck> = new Map();
  private metricsRegistry: MetricsRegistry;

  private constructor() {
    this.metricsRegistry = MetricsRegistry.getInstance();
    this.registerDefaultChecks();
  }

  static getInstance(): HealthChecker {
    if (!HealthChecker.instance) {
      HealthChecker.instance = new HealthChecker();
    }
    return HealthChecker.instance;
  }

  registerCheck(check: HealthCheck): void {
    this.checks.set(check.name, check);
  }

  async checkHealth(): Promise<SystemHealth> {
    const checkResults: Record<string, HealthCheckResult> = {};
    const checkPromises: Promise<void>[] = [];

    // Run all health checks in parallel
    for (const [name, check] of this.checks.entries()) {
      checkPromises.push(
        check.check().then(result => {
          checkResults[name] = result;
          
          // Record metrics
          this.metricsRegistry.counter('health.checks.total').increment({ 
            check: name, 
            status: result.status 
          });
          this.metricsRegistry.histogram('health.check.duration').observe(
            result.duration, 
            { check: name }
          );
        }).catch(error => {
          checkResults[name] = {
            status: HealthStatus.UNHEALTHY,
            message: `Check failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            duration: 0,
            timestamp: Date.now()
          };
        })
      );
    }

    await Promise.all(checkPromises);

    // Determine overall health status
    const overallStatus = this.determineOverallStatus(checkResults);
    
    // Collect system metrics
    const systemMetrics = this.metricsRegistry.getSnapshot().system;
    
    return {
      status: overallStatus,
      timestamp: Date.now(),
      checks: checkResults,
      metrics: {
        uptime: systemMetrics.uptime,
        memory: {
          used: systemMetrics.memoryUsage.heapUsed,
          total: systemMetrics.memoryUsage.heapTotal,
          percentage: Math.round((systemMetrics.memoryUsage.heapUsed / systemMetrics.memoryUsage.heapTotal) * 100)
        },
        cpu: Math.round(systemMetrics.cpuUsage)
      }
    };
  }

  private determineOverallStatus(checkResults: Record<string, HealthCheckResult>): HealthStatus {
    const statuses = Object.values(checkResults).map(result => result.status);
    
    if (statuses.some(status => status === HealthStatus.UNHEALTHY)) {
      return HealthStatus.UNHEALTHY;
    } else if (statuses.some(status => status === HealthStatus.DEGRADED)) {
      return HealthStatus.DEGRADED;
    }
    
    return HealthStatus.HEALTHY;
  }

  private registerDefaultChecks(): void {
    this.registerCheck(new NWSAPIHealthCheck());
    this.registerCheck(new MemoryHealthCheck());
  }
}