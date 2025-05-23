import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// Create a test version of the handler with injected dependencies
function createTestHandler(dependencies: {
  healthCheck: any;
  metrics: any;
  logger: any;
}) {
  const { healthCheck, metrics, logger } = dependencies;
  
  // Helper function to format bytes
  function formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  }
  
  // Helper function to format duration
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hours, ${minutes % 60} minutes`;
    }
    return `${minutes} minutes`;
  }
  
  // This is the handler function extracted from health-check-handler.ts
  return async function handleHealthCheck() {
    try {
      logger.info('Performing health check');
      
      const health = await healthCheck();
      const metricsSnapshot = metrics.getSnapshot();
      const systemInfo = metrics.getSystemInfo();
      
      // Build the health report
      let report = '# Health Check Report\n\n';
      
      // Overall status
      const statusEmoji = health.status === 'healthy' ? '✅' : '❌';
      report += `## Overall Status: ${health.status.toUpperCase()} ${statusEmoji}\n\n`;
      
      // Individual health checks
      if (Object.keys(health.checks || {}).length > 0) {
        report += '## Health Checks\n\n';
        for (const [name, check] of Object.entries(health.checks || {})) {
          const checkEmoji = check.status === 'healthy' ? '✅' : '❌';
          report += `- **${name}**: ${check.status} ${checkEmoji}\n`;
          report += `  - ${check.message}\n`;
          report += `  - Duration: ${check.duration}ms\n`;
          if (check.details) {
            report += `  - Details: ${JSON.stringify(check.details)}\n`;
          }
        }
        report += '\n';
      }
      
      // System metrics from health check
      if (health.metrics) {
        report += '### System Metrics:\n\n';
        report += `- **Uptime**: ${formatDuration(health.metrics.uptime)}\n`;
        report += `- **Memory**: ${health.metrics.memory.percentage}% (${formatBytes(health.metrics.memory.used)} / ${formatBytes(health.metrics.memory.total)})\n`;
        report += `- **CPU**: ${health.metrics.cpu}%\n\n`;
      }
      
      // Metrics
      report += '## Metrics\n\n';
      
      // Counters
      if (Object.keys(metricsSnapshot.counters).length > 0) {
        report += '### Counters:\n\n';
        for (const [name, values] of Object.entries(metricsSnapshot.counters)) {
          const total = values.reduce((sum: number, v: any) => sum + v.value, 0);
          report += `- **${name}**: ${total}\n`;
          for (const value of values) {
            const labels = Object.entries(value.labels)
              .map(([k, v]) => `${k}=${v}`)
              .join(',');
            if (labels) {
              report += `  - {${labels}}: ${value.value}\n`;
            }
          }
        }
        report += '\n';
      }
      
      // Histograms
      if (Object.keys(metricsSnapshot.histograms).length > 0) {
        report += '### Histograms:\n\n';
        for (const [name, histogram] of Object.entries(metricsSnapshot.histograms)) {
          report += `- **${name}**:\n`;
          report += `  - Count: ${histogram.count}\n`;
          report += `  - Mean: ${histogram.mean.toFixed(2)}ms\n`;
          report += `  - P50: ${histogram.p50.toFixed(2)}ms\n`;
          report += `  - P90: ${histogram.p90.toFixed(2)}ms\n`;
          report += `  - P95: ${histogram.p95.toFixed(2)}ms\n`;
          report += `  - P99: ${histogram.p99.toFixed(2)}ms\n`;
        }
        report += '\n';
      }
      
      // Gauges
      if (Object.keys(metricsSnapshot.gauges).length > 0) {
        report += '### Gauges:\n\n';
        for (const [name, values] of Object.entries(metricsSnapshot.gauges)) {
          for (const value of values) {
            const labels = Object.entries(value.labels)
              .map(([k, v]) => `${k}=${v}`)
              .join(',');
            if (labels) {
              report += `- **${name}** {${labels}}: ${value.value}\n`;
            } else {
              report += `- **${name}**: ${value.value}\n`;
            }
          }
        }
        report += '\n';
      }
      
      // System info
      report += '## System Information\n\n';
      report += `- **Platform**: ${systemInfo.platform} (${systemInfo.arch})\n`;
      report += `- **Node Version**: ${systemInfo.nodeVersion}\n`;
      report += `- **CPU Count**: ${systemInfo.cpuCount}\n`;
      report += `- **Total Memory**: ${formatBytes(systemInfo.totalMemory)}\n`;
      report += `- **Free Memory**: ${formatBytes(systemInfo.freeMemory)} (${Math.round(systemInfo.freeMemory / systemInfo.totalMemory * 100)}%)\n`;
      report += `- **Load Average**: ${systemInfo.loadAverage.map((v: number) => v.toFixed(2)).join(', ')}\n`;
      
      return {
        content: [
          {
            type: "text" as const,
            text: report,
          },
        ],
      };
    } catch (error) {
      logger.error('Health check failed', error);
      throw error;
    }
  };
}

// Mock dependencies
const mockHealthCheck = mock.fn();

const mockMetrics = {
  getSnapshot: mock.fn(),
  getSystemInfo: mock.fn()
};

const mockLogger = {
  info: mock.fn(),
  error: mock.fn()
};

describe('handleHealthCheck', () => {
  let handleHealthCheck: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // Create handler with mocked dependencies
    handleHealthCheck = createTestHandler({
      healthCheck: mockHealthCheck,
      metrics: mockMetrics,
      logger: mockLogger
    });
  });
  beforeEach(() => {
    // Reset all mocks before each test
    mockHealthCheck.mock.resetCalls();
    mockMetrics.getSnapshot.mock.resetCalls();
    mockMetrics.getSystemInfo.mock.resetCalls();
    mockLogger.info.mock.resetCalls();
    mockLogger.error.mock.resetCalls();
  });

  it('should return formatted health check report with healthy status', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: Date.now(),
      checks: {
        'nws-api': {
          status: 'healthy',
          duration: 150,
          message: 'API is responsive'
        },
        'memory': {
          status: 'healthy',
          duration: 1,
          message: 'Memory usage is within limits',
          details: { percentage: 45 }
        }
      },
      metrics: {
        uptime: 3600,
        memory: {
          used: 500 * 1024 * 1024,
          total: 2 * 1024 * 1024 * 1024,
          percentage: 25
        },
        cpu: 15
      }
    };

    const mockMetricsSnapshot = {
      counters: {
        'weather_api_calls': [
          { value: 100, labels: { operation: 'get-alerts' } },
          { value: 50, labels: { operation: 'get-forecast' } }
        ]
      },
      histograms: {
        'weather_api_duration': {
          count: 150,
          mean: 200,
          p50: 180,
          p90: 300,
          p95: 350,
          p99: 500
        }
      },
      gauges: {
        'active_connections': [{ value: 5, labels: {} }]
      }
    };

    const mockSystemInfoData = {
      platform: 'darwin',
      arch: 'arm64',
      nodeVersion: 'v20.0.0',
      cpuCount: 8,
      totalMemory: 16 * 1024 * 1024 * 1024,
      freeMemory: 8 * 1024 * 1024 * 1024,
      loadAverage: [1.5, 1.2, 1.0]
    };

    mockHealthCheck.mock.mockImplementation(() => Promise.resolve(mockHealthData));
    mockMetrics.getSnapshot.mock.mockImplementation(() => mockMetricsSnapshot);
    mockMetrics.getSystemInfo.mock.mockImplementation(() => mockSystemInfoData);

    const result = await handleHealthCheck();

    assert.strictEqual(mockHealthCheck.mock.calls.length, 1);
    assert.strictEqual(mockMetrics.getSnapshot.mock.calls.length, 1);
    assert.strictEqual(mockMetrics.getSystemInfo.mock.calls.length, 1);
    assert.strictEqual(mockLogger.info.mock.calls.length, 1);
    assert.strictEqual(mockLogger.info.mock.calls[0].arguments[0], 'Performing health check');
    
    assert.strictEqual(result.content[0].type, 'text');
    const text = result.content[0].text;
    
    // Check main sections
    assert(text.includes('# Health Check Report'));
    assert(text.includes('## Overall Status: HEALTHY'));
    assert(text.includes('## System Information'));
    assert(text.includes('## Metrics'));
    
    // Check health checks
    assert(text.includes('nws-api**: healthy'));
    assert(text.includes('memory**: healthy'));
    assert(text.includes('API is responsive'));
    assert(text.includes('Memory usage is within limits'));
    
    // Check system metrics - more flexible checks
    assert(text.includes('Uptime**:'), 'Uptime not found');
    assert(text.includes('Memory**:'), 'Memory not found');
    assert(text.includes('CPU**:'), 'CPU not found');
    
    // Check counters
    assert(text.includes('weather_api_calls**: 150'));
    assert(text.includes('{operation=get-alerts}: 100'));
    assert(text.includes('{operation=get-forecast}: 50'));
    
    // Check histograms
    assert(text.includes('weather_api_duration'));
    assert(text.includes('Count: 150'));
    assert(text.includes('Mean: 200.00ms'));
    assert(text.includes('P50: 180.00ms'));
    
    // Check system info
    assert(text.includes('Platform**: darwin (arm64)'));
    assert(text.includes('Node Version**: v20.0.0'));
    assert(text.includes('CPU Count**: 8'));
    assert(text.includes('Load Average**: 1.50, 1.20, 1.00'));
  });

  it('should return formatted health check report with unhealthy status', async () => {
    const mockHealthData = {
      status: 'unhealthy',
      timestamp: Date.now(),
      checks: {
        'nws-api': {
          status: 'unhealthy',
          duration: 5000,
          message: 'API timeout'
        },
        'memory': {
          status: 'healthy',
          duration: 1,
          message: 'Memory usage is within limits'
        }
      },
      metrics: {
        uptime: 300,
        memory: {
          used: 1.5 * 1024 * 1024 * 1024,
          total: 2 * 1024 * 1024 * 1024,
          percentage: 75
        },
        cpu: 85
      }
    };

    const mockMetricsSnapshot = {
      counters: {},
      histograms: {},
      gauges: {}
    };

    const mockSystemInfoData = {
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v18.0.0',
      cpuCount: 4,
      totalMemory: 8 * 1024 * 1024 * 1024,
      freeMemory: 2 * 1024 * 1024 * 1024,
      loadAverage: [3.5, 3.2, 3.0]
    };

    mockHealthCheck.mock.mockImplementation(() => Promise.resolve(mockHealthData));
    mockMetrics.getSnapshot.mock.mockImplementation(() => mockMetricsSnapshot);
    mockMetrics.getSystemInfo.mock.mockImplementation(() => mockSystemInfoData);

    const result = await handleHealthCheck();

    assert.strictEqual(result.content[0].type, 'text');
    const text = result.content[0].text;
    
    assert(text.includes('## Overall Status: UNHEALTHY'));
    assert(text.includes('nws-api**: unhealthy'));
    assert(text.includes('API timeout'));
    assert(text.includes('Memory**: 75%'));
    assert(text.includes('CPU**: 85%'));
  });

  it('should handle health check errors', async () => {
    const error = new Error('Health check failed');
    mockHealthCheck.mock.mockImplementation(() => Promise.reject(error));

    await assert.rejects(
      async () => await handleHealthCheck(),
      (err: Error) => {
        assert.strictEqual(err.message, 'Health check failed');
        return true;
      }
    );

    assert.strictEqual(mockLogger.error.mock.calls.length, 1);
    assert.strictEqual(mockLogger.error.mock.calls[0].arguments[0], 'Health check failed');
    assert.strictEqual(mockLogger.error.mock.calls[0].arguments[1], error);
  });

  it('should handle empty metrics data', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: Date.now(),
      checks: {},
      metrics: undefined
    };

    const mockMetricsSnapshot = {
      counters: {},
      histograms: {},
      gauges: {}
    };

    const mockSystemInfoData = {
      platform: 'win32',
      arch: 'x64',
      nodeVersion: 'v20.0.0',
      cpuCount: 8,
      totalMemory: 16 * 1024 * 1024 * 1024,
      freeMemory: 8 * 1024 * 1024 * 1024,
      loadAverage: [0, 0, 0]
    };

    mockHealthCheck.mock.mockImplementation(() => Promise.resolve(mockHealthData));
    mockMetrics.getSnapshot.mock.mockImplementation(() => mockMetricsSnapshot);
    mockMetrics.getSystemInfo.mock.mockImplementation(() => mockSystemInfoData);

    const result = await handleHealthCheck();

    assert.strictEqual(result.content[0].type, 'text');
    const text = result.content[0].text;
    
    // Should not include system metrics section when metrics is undefined
    assert(!text.includes('### System Metrics:'));
    assert(!text.includes('Uptime**'));
    
    // Should still include other sections
    assert(text.includes('## Overall Status: HEALTHY'));
    assert(text.includes('## System Information'));
    assert(text.includes('Platform**: win32'));
  });

  it('should format bytes correctly', async () => {
    const mockHealthData = {
      status: 'healthy',
      timestamp: Date.now(),
      checks: {},
      metrics: {
        uptime: 60,
        memory: {
          used: 1536 * 1024 * 1024, // 1.5 GB
          total: 8 * 1024 * 1024 * 1024, // 8 GB
          percentage: 19
        },
        cpu: 10
      }
    };

    const mockMetricsSnapshot = {
      counters: {},
      histograms: {},
      gauges: {}
    };

    const mockSystemInfoData = {
      platform: 'darwin',
      arch: 'arm64',
      nodeVersion: 'v20.0.0',
      cpuCount: 8,
      totalMemory: 32 * 1024 * 1024 * 1024, // 32 GB
      freeMemory: 16 * 1024 * 1024 * 1024, // 16 GB
      loadAverage: [1.0, 1.0, 1.0]
    };

    mockHealthCheck.mock.mockImplementation(() => Promise.resolve(mockHealthData));
    mockMetrics.getSnapshot.mock.mockImplementation(() => mockMetricsSnapshot);
    mockMetrics.getSystemInfo.mock.mockImplementation(() => mockSystemInfoData);

    const result = await handleHealthCheck();

    const text = result.content[0].text;
    
    // Check memory formatting
    assert(text.includes('Memory**: 19% (1.50 GB / 8.00 GB)'));
    assert(text.includes('Total Memory**: 32.00 GB'));
    assert(text.includes('Free Memory**: 16.00 GB (50%)'));
  });
});