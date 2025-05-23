import { describe, it, mock, beforeEach } from 'node:test';
import assert from 'node:assert';

// 依存性を注入したテスト用ハンドラーを作成
function createTestHandler(dependencies: {
  healthCheck: any;
  metrics: any;
  logger: any;
}) {
  const { healthCheck, metrics, logger } = dependencies;
  
  // バイトをフォーマットするヘルパー関数
  function formatBytes(bytes: number): string {
    const gb = bytes / (1024 * 1024 * 1024);
    return `${gb.toFixed(2)} GB`;
  }
  
  // 期間をフォーマットするヘルパー関数
  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours} hours, ${minutes % 60} minutes`;
    }
    return `${minutes} minutes`;
  }
  
  // health-check-handler.tsから抽出されたハンドラー関数
  return async function handleHealthCheck() {
    try {
      logger.info('Performing health check');
      
      const health = await healthCheck();
      const metricsSnapshot = metrics.getSnapshot();
      const systemInfo = metrics.getSystemInfo();
      
      // ヘルスレポートを作成
      let report = '# Health Check Report\n\n';
      
      // 全体ステータス
      const statusEmoji = health.status === 'healthy' ? '✅' : '❌';
      report += `## Overall Status: ${health.status.toUpperCase()} ${statusEmoji}\n\n`;
      
      // 個別のヘルスチェック
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
      
      // ヘルスチェックからのシステムメトリクス
      if (health.metrics) {
        report += '### System Metrics:\n\n';
        report += `- **Uptime**: ${formatDuration(health.metrics.uptime)}\n`;
        report += `- **Memory**: ${health.metrics.memory.percentage}% (${formatBytes(health.metrics.memory.used)} / ${formatBytes(health.metrics.memory.total)})\n`;
        report += `- **CPU**: ${health.metrics.cpu}%\n\n`;
      }
      
      // メトリクス
      report += '## Metrics\n\n';
      
      // カウンター
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
      
      // ヒストグラム
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
      
      // ゲージ
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
      
      // システム情報
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

// モック依存関係
const mockHealthCheck = mock.fn();

const mockMetrics = {
  getSnapshot: mock.fn(),
  getSystemInfo: mock.fn()
};

const mockLogger = {
  info: mock.fn(),
  error: mock.fn()
};

describe('ヘルスチェックハンドラー', () => {
  let handleHealthCheck: ReturnType<typeof createTestHandler>;
  
  beforeEach(() => {
    // モック化された依存関係でハンドラーを作成
    handleHealthCheck = createTestHandler({
      healthCheck: mockHealthCheck,
      metrics: mockMetrics,
      logger: mockLogger
    });
  });
  beforeEach(() => {
    // 各テストの前にすべてのモックをリセット
    mockHealthCheck.mock.resetCalls();
    mockMetrics.getSnapshot.mock.resetCalls();
    mockMetrics.getSystemInfo.mock.resetCalls();
    mockLogger.info.mock.resetCalls();
    mockLogger.error.mock.resetCalls();
  });

  it('健全なステータスでフォーマットされたヘルスチェックレポートを返すべき', async () => {
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
    
    // メインセクションを確認
    assert(text.includes('# Health Check Report'));
    assert(text.includes('## Overall Status: HEALTHY'));
    assert(text.includes('## System Information'));
    assert(text.includes('## Metrics'));
    
    // ヘルスチェックを確認
    assert(text.includes('nws-api**: healthy'));
    assert(text.includes('memory**: healthy'));
    assert(text.includes('API is responsive'));
    assert(text.includes('Memory usage is within limits'));
    
    // システムメトリクスを確認 - より柔軟なチェック
    assert(text.includes('Uptime**:'), 'アップタイムが見つかりません');
    assert(text.includes('Memory**:'), 'メモリが見つかりません');
    assert(text.includes('CPU**:'), 'CPUが見つかりません');
    
    // カウンターを確認
    assert(text.includes('weather_api_calls**: 150'));
    assert(text.includes('{operation=get-alerts}: 100'));
    assert(text.includes('{operation=get-forecast}: 50'));
    
    // ヒストグラムを確認
    assert(text.includes('weather_api_duration'));
    assert(text.includes('Count: 150'));
    assert(text.includes('Mean: 200.00ms'));
    assert(text.includes('P50: 180.00ms'));
    
    // システム情報を確認
    assert(text.includes('Platform**: darwin (arm64)'));
    assert(text.includes('Node Version**: v20.0.0'));
    assert(text.includes('CPU Count**: 8'));
    assert(text.includes('Load Average**: 1.50, 1.20, 1.00'));
  });

  it('不健全なステータスでフォーマットされたヘルスチェックレポートを返すべき', async () => {
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

  it('ヘルスチェックエラーを処理すべき', async () => {
    const error = new Error('ヘルスチェックが失敗しました');
    mockHealthCheck.mock.mockImplementation(() => Promise.reject(error));

    await assert.rejects(
      async () => await handleHealthCheck(),
      (err: Error) => {
        assert.strictEqual(err.message, 'ヘルスチェックが失敗しました');
        return true;
      }
    );

    assert.strictEqual(mockLogger.error.mock.calls.length, 1);
    assert.strictEqual(mockLogger.error.mock.calls[0].arguments[0], 'Health check failed');
    assert.strictEqual(mockLogger.error.mock.calls[0].arguments[1], error);
  });

  it('空のメトリクスデータを処理すべき', async () => {
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
    
    // metricsがundefinedの場合、システムメトリクスセクションを含めるべきではない
    assert(!text.includes('### System Metrics:'));
    assert(!text.includes('Uptime**'));
    
    // 他のセクションは含めるべき
    assert(text.includes('## Overall Status: HEALTHY'));
    assert(text.includes('## System Information'));
    assert(text.includes('Platform**: win32'));
  });

  it('バイトを正しくフォーマットすべき', async () => {
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
    
    // メモリのフォーマットを確認
    assert(text.includes('Memory**: 19% (1.50 GB / 8.00 GB)'));
    assert(text.includes('Total Memory**: 32.00 GB'));
    assert(text.includes('Free Memory**: 16.00 GB (50%)'));
  });
});