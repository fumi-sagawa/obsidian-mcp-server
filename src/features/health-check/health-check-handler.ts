import { healthCheck } from '../../shared/lib/health/index.js';
import { metrics } from '../../shared/lib/metrics/index.js';
import { logger } from '../../shared/index.js';
import type { SystemHealth } from '../../shared/lib/health/types.js';

export async function handleHealthCheck(): Promise<{
  content: Array<{
    type: "text";
    text: string;
  }>;
}> {
  try {
    logger.info("Performing health check");
    
    const health = await healthCheck();
    const metricsSnapshot = metrics.getSnapshot();
    const systemInfo = metrics.getSystemInfo();
    
    const healthSummary = formatHealthSummary(health);
    const metricsSummary = formatMetricsSummary(metricsSnapshot);
    const systemSummary = formatSystemInfo(systemInfo);
    
    return {
      content: [
        {
          type: "text" as const,
          text: `# Health Check Report\n\n${healthSummary}\n\n## System Information\n${systemSummary}\n\n## Metrics\n${metricsSummary}`
        }
      ]
    };
  } catch (error) {
    logger.error("Health check failed", error as Error);
    throw error;
  }
}

function formatHealthSummary(health: SystemHealth): string {
  const lines: string[] = [];
  
  lines.push(`## Overall Status: ${health.status.toUpperCase()}`);
  lines.push(`Timestamp: ${new Date(health.timestamp).toISOString()}`);
  lines.push('');
  
  lines.push('### Health Checks:');
  for (const [name, result] of Object.entries(health.checks)) {
    lines.push(`- **${name}**: ${result.status} (${result.duration}ms)`);
    if (result.message) {
      lines.push(`  - ${result.message}`);
    }
    if (result.details) {
      lines.push(`  - Details: ${JSON.stringify(result.details, null, 2).replace(/\n/g, '\n    ')}`);
    }
  }
  
  if (health.metrics) {
    lines.push('');
    lines.push('### System Metrics:');
    lines.push(`- **Uptime**: ${Math.floor(health.metrics.uptime / 60)} minutes`);
    lines.push(`- **Memory**: ${health.metrics.memory.percentage}% (${formatBytes(health.metrics.memory.used)} / ${formatBytes(health.metrics.memory.total)})`);
    lines.push(`- **CPU**: ${health.metrics.cpu}%`);
  }
  
  return lines.join('\n');
}

function formatMetricsSummary(snapshot: any): string {
  const lines: string[] = [];
  
  // Format counters
  lines.push('### Counters:');
  for (const [name, values] of Object.entries(snapshot.counters)) {
    if (Array.isArray(values) && values.length > 0) {
      const total = values.reduce((sum: number, v: any) => sum + v.value, 0);
      lines.push(`- **${name}**: ${total}`);
      
      // Show breakdown by labels if any
      const labeled = values.filter((v: any) => v.labels);
      if (labeled.length > 0) {
        for (const v of labeled) {
          const labelStr = Object.entries(v.labels || {})
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
          lines.push(`  - {${labelStr}}: ${v.value}`);
        }
      }
    }
  }
  
  // Format histograms
  lines.push('');
  lines.push('### Response Times:');
  for (const [name, stats] of Object.entries(snapshot.histograms)) {
    if (stats && typeof stats === 'object' && 'count' in stats) {
      const s = stats as any;
      if (s.count > 0) {
        lines.push(`- **${name}**:`);
        lines.push(`  - Count: ${s.count}`);
        lines.push(`  - Mean: ${s.mean.toFixed(2)}ms`);
        lines.push(`  - P50: ${s.p50.toFixed(2)}ms`);
        lines.push(`  - P90: ${s.p90.toFixed(2)}ms`);
        lines.push(`  - P95: ${s.p95.toFixed(2)}ms`);
        lines.push(`  - P99: ${s.p99.toFixed(2)}ms`);
      }
    }
  }
  
  // Format gauges
  lines.push('');
  lines.push('### Current Values:');
  for (const [name, values] of Object.entries(snapshot.gauges)) {
    if (Array.isArray(values) && values.length > 0) {
      for (const v of values) {
        if (v.labels && Object.keys(v.labels).length > 0) {
          const labelStr = Object.entries(v.labels)
            .map(([k, v]) => `${k}=${v}`)
            .join(', ');
          lines.push(`- **${name}** {${labelStr}}: ${v.value}`);
        } else {
          lines.push(`- **${name}**: ${v.value}`);
        }
      }
    }
  }
  
  return lines.join('\n');
}

function formatSystemInfo(info: any): string {
  const lines: string[] = [];
  
  lines.push(`- **Platform**: ${info.platform} (${info.arch})`);
  lines.push(`- **Node Version**: ${info.nodeVersion}`);
  lines.push(`- **CPU Count**: ${info.cpuCount}`);
  lines.push(`- **Total Memory**: ${formatBytes(info.totalMemory)}`);
  lines.push(`- **Free Memory**: ${formatBytes(info.freeMemory)} (${Math.round((info.freeMemory / info.totalMemory) * 100)}%)`);
  lines.push(`- **Load Average**: ${info.loadAverage.map((v: number) => v.toFixed(2)).join(', ')}`);
  
  return lines.join('\n');
}

function formatBytes(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(2)} ${units[unitIndex]}`;
}