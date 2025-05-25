import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleHealthCheck } from '../health-check-handler.js';

// モック設定
vi.mock('../../../shared/lib/health/index.js', () => ({
  healthCheck: vi.fn()
}));

vi.mock('../../../shared/lib/metrics/index.js', () => ({
  metrics: {
    getSnapshot: vi.fn(),
    getSystemInfo: vi.fn()
  }
}));

vi.mock('../../../shared/index.js', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn()
  }
}));

import { healthCheck } from '../../../shared/lib/health/index.js';
import { metrics } from '../../../shared/lib/metrics/index.js';
import { logger } from '../../../shared/index.js';

describe('handleHealthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('正常にヘルスチェックレポートを生成できる', async () => {
    // モックデータの設定
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      checks: {
        'memory': {
          status: 'pass' as const,
          duration: 5,
          message: 'Memory usage is normal'
        },
        'obsidian-api': {
          status: 'pass' as const,
          duration: 100,
          message: 'API connection successful'
        }
      },
      metrics: {
        uptime: 3600, // 1 hour
        memory: {
          percentage: 65,
          used: 1073741824, // 1GB
          total: 1610612736 // 1.5GB
        },
        cpu: 15
      }
    };

    const mockMetricsSnapshot = {
      counters: {
        'http_requests_total': [
          { value: 150, labels: { method: 'GET', status: '200' } },
          { value: 25, labels: { method: 'POST', status: '200' } },
          { value: 5, labels: { method: 'GET', status: '404' } }
        ]
      },
      histograms: {
        'http_request_duration': {
          count: 180,
          mean: 125.5,
          p50: 100,
          p90: 200,
          p95: 250,
          p99: 400
        }
      },
      gauges: {
        'active_connections': [
          { value: 10, labels: {} }
        ],
        'memory_usage': [
          { value: 65, labels: { type: 'heap' } },
          { value: 45, labels: { type: 'rss' } }
        ]
      }
    };

    const mockSystemInfo = {
      platform: 'darwin',
      arch: 'arm64',
      nodeVersion: 'v18.17.0',
      cpuCount: 8,
      totalMemory: 17179869184, // 16GB
      freeMemory: 8589934592, // 8GB
      loadAverage: [1.5, 1.2, 1.0]
    };

    // モック関数の設定
    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue(mockMetricsSnapshot);
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    // テスト実行
    const result = await handleHealthCheck();

    // 結果検証
    expect(result).toHaveProperty('content');
    expect(result.content).toHaveLength(1);
    expect(result.content[0]).toHaveProperty('type', 'text');
    expect(result.content[0]).toHaveProperty('text');

    const reportText = result.content[0].text;
    
    // レポート内容の検証
    expect(reportText).toContain('# Health Check Report');
    expect(reportText).toContain('## Overall Status: HEALTHY');
    expect(reportText).toContain('### Health Checks:');
    expect(reportText).toContain('**memory**: pass (5ms)');
    expect(reportText).toContain('**obsidian-api**: pass (100ms)');
    expect(reportText).toContain('## System Information');
    expect(reportText).toContain('**Platform**: darwin (arm64)');
    expect(reportText).toContain('**Node Version**: v18.17.0');
    expect(reportText).toContain('## Metrics');
    expect(reportText).toContain('### Counters:');
    expect(reportText).toContain('**http_requests_total**: 180');
    expect(reportText).toContain('### Response Times:');
    expect(reportText).toContain('**http_request_duration**:');
    expect(reportText).toContain('Count: 180');
    expect(reportText).toContain('Mean: 125.50ms');

    // モック関数が呼ばれたことを確認
    expect(healthCheck).toHaveBeenCalledOnce();
    expect(metrics.getSnapshot).toHaveBeenCalledOnce();
    expect(metrics.getSystemInfo).toHaveBeenCalledOnce();
    expect(logger.info).toHaveBeenCalledWith('Performing health check');
  });

  it('メトリクスがない場合でも正常に動作する', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      checks: {
        'basic': {
          status: 'pass' as const,
          duration: 1,
          message: 'Basic check passed'
        }
      }
      // metrics プロパティなし
    };

    const mockMetricsSnapshot = {
      counters: {},
      histograms: {},
      gauges: {}
    };

    const mockSystemInfo = {
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v18.17.0',
      cpuCount: 4,
      totalMemory: 8589934592,
      freeMemory: 4294967296,
      loadAverage: [0.5, 0.3, 0.2]
    };

    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue(mockMetricsSnapshot);
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    const result = await handleHealthCheck();

    expect(result.content[0].text).toContain('# Health Check Report');
    expect(result.content[0].text).toContain('**basic**: pass (1ms)');
    expect(result.content[0].text).not.toContain('### System Metrics:');
  });

  it('チェック結果に詳細情報がある場合、正しくフォーマットする', async () => {
    const mockHealth = {
      status: 'degraded' as const,
      timestamp: Date.now(),
      checks: {
        'memory': {
          status: 'warn' as const,
          duration: 10,
          message: 'High memory usage detected',
          details: {
            current: 85,
            threshold: 80,
            trend: 'increasing'
          }
        }
      }
    };

    const mockMetricsSnapshot = { counters: {}, histograms: {}, gauges: {} };
    const mockSystemInfo = {
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v18.17.0',
      cpuCount: 4,
      totalMemory: 8589934592,
      freeMemory: 4294967296,
      loadAverage: [0.5, 0.3, 0.2]
    };

    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue(mockMetricsSnapshot);
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    const result = await handleHealthCheck();
    const reportText = result.content[0].text;

    expect(reportText).toContain('## Overall Status: DEGRADED');
    expect(reportText).toContain('**memory**: warn (10ms)');
    expect(reportText).toContain('High memory usage detected');
    expect(reportText).toContain('Details: {');
    expect(reportText).toContain('"current": 85');
    expect(reportText).toContain('"threshold": 80');
    expect(reportText).toContain('"trend": "increasing"');
  });

  it('空のメトリクススナップショットを正しく処理する', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      checks: {}
    };

    const mockMetricsSnapshot = {
      counters: {},
      histograms: {},
      gauges: {}
    };

    const mockSystemInfo = {
      platform: 'win32',
      arch: 'x64',
      nodeVersion: 'v18.17.0',
      cpuCount: 2,
      totalMemory: 4294967296,
      freeMemory: 2147483648,
      loadAverage: [0, 0, 0] // Windows では通常0
    };

    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue(mockMetricsSnapshot);
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    const result = await handleHealthCheck();
    const reportText = result.content[0].text;

    expect(reportText).toContain('### Counters:');
    expect(reportText).toContain('### Response Times:');
    expect(reportText).toContain('### Current Values:');
    expect(reportText).toContain('**Platform**: win32 (x64)');
  });

  it('ヘルスチェックでエラーが発生した場合、適切にエラーをスローする', async () => {
    const error = new Error('Health check failed');
    (healthCheck as any).mockRejectedValue(error);

    await expect(handleHealthCheck()).rejects.toThrow('Health check failed');
    expect(logger.error).toHaveBeenCalledWith('Health check failed', error);
  });

  it('formatBytes関数が正しく動作する', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      checks: {},
      metrics: {
        uptime: 7200, // 2 hours
        memory: {
          percentage: 50,
          used: 2147483648, // 2GB
          total: 4294967296  // 4GB
        },
        cpu: 25
      }
    };

    const mockSystemInfo = {
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v18.17.0',
      cpuCount: 4,
      totalMemory: 17179869184, // 16GB
      freeMemory: 1073741824,   // 1GB
      loadAverage: [1.0, 0.8, 0.6]
    };

    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue({ counters: {}, histograms: {}, gauges: {} });
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    const result = await handleHealthCheck();
    const reportText = result.content[0].text;

    // formatBytes関数の動作確認
    expect(reportText).toContain('**Memory**: 50% (2.00 GB / 4.00 GB)');
    expect(reportText).toContain('**Total Memory**: 16.00 GB');
    expect(reportText).toContain('**Free Memory**: 1.00 GB');
    expect(reportText).toContain('**Uptime**: 120 minutes');
  });

  it('ラベル付きメトリクスを正しくフォーマットする', async () => {
    const mockHealth = {
      status: 'healthy' as const,
      timestamp: Date.now(),
      checks: {}
    };

    const mockMetricsSnapshot = {
      counters: {
        'api_calls': [
          { value: 100, labels: { endpoint: '/health', method: 'GET' } },
          { value: 50, labels: { endpoint: '/status', method: 'GET' } }
        ]
      },
      histograms: {},
      gauges: {
        'connection_pool': [
          { value: 10, labels: { pool: 'obsidian', status: 'active' } },
          { value: 5, labels: { pool: 'obsidian', status: 'idle' } },
          { value: 25, labels: {} } // ラベルなし
        ]
      }
    };

    const mockSystemInfo = {
      platform: 'linux',
      arch: 'x64',
      nodeVersion: 'v18.17.0',
      cpuCount: 4,
      totalMemory: 8589934592,
      freeMemory: 4294967296,
      loadAverage: [0.5, 0.3, 0.2]
    };

    (healthCheck as any).mockResolvedValue(mockHealth);
    (metrics.getSnapshot as any).mockReturnValue(mockMetricsSnapshot);
    (metrics.getSystemInfo as any).mockReturnValue(mockSystemInfo);

    const result = await handleHealthCheck();
    const reportText = result.content[0].text;

    // ラベル付きメトリクスの確認
    expect(reportText).toContain('**api_calls**: 150');
    expect(reportText).toContain('{endpoint=/health, method=GET}: 100');
    expect(reportText).toContain('{endpoint=/status, method=GET}: 50');
    expect(reportText).toContain('**connection_pool** {pool=obsidian, status=active}: 10');
    expect(reportText).toContain('**connection_pool** {pool=obsidian, status=idle}: 5');
    expect(reportText).toContain('**connection_pool**: 25');
  });
});