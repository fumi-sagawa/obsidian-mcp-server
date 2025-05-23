import os from 'os';
import process from 'process';
import type { SystemMetrics } from './types.js';

export class SystemMetricsCollector {
  private lastCpuUsage: NodeJS.CpuUsage | null = null;
  private lastCpuTime: number = 0;

  collect(): SystemMetrics {
    const cpuUsage = this.getCpuUsage();
    const memoryUsage = process.memoryUsage();

    return {
      cpuUsage,
      memoryUsage: {
        heapUsed: memoryUsage.heapUsed,
        heapTotal: memoryUsage.heapTotal,
        external: memoryUsage.external,
        rss: memoryUsage.rss
      },
      uptime: process.uptime()
    };
  }

  private getCpuUsage(): number {
    const currentCpuUsage = process.cpuUsage();
    const currentTime = Date.now();

    if (!this.lastCpuUsage || !this.lastCpuTime) {
      this.lastCpuUsage = currentCpuUsage;
      this.lastCpuTime = currentTime;
      return 0;
    }

    const elapsedTime = (currentTime - this.lastCpuTime) * 1000; // Convert to microseconds
    const elapsedUser = currentCpuUsage.user - this.lastCpuUsage.user;
    const elapsedSystem = currentCpuUsage.system - this.lastCpuUsage.system;
    const elapsedCpu = elapsedUser + elapsedSystem;

    this.lastCpuUsage = currentCpuUsage;
    this.lastCpuTime = currentTime;

    // Calculate CPU percentage
    const cpuPercent = elapsedTime > 0 ? (100 * elapsedCpu) / elapsedTime : 0;
    
    // Normalize by number of CPUs
    const numCpus = os.cpus().length;
    return Math.min(100, cpuPercent / numCpus);
  }

  getSystemInfo() {
    return {
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version,
      totalMemory: os.totalmem(),
      freeMemory: os.freemem(),
      cpuCount: os.cpus().length,
      loadAverage: os.loadavg()
    };
  }
}