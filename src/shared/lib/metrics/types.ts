export interface MetricValue {
  value: number;
  timestamp: number;
  labels?: Record<string, string>;
}

export interface Counter {
  increment(labels?: Record<string, string>): void;
  get(): number;
  getWithLabels(labels: Record<string, string>): number;
  reset(): void;
}

export interface Gauge {
  set(value: number, labels?: Record<string, string>): void;
  increment(labels?: Record<string, string>): void;
  decrement(labels?: Record<string, string>): void;
  get(): number;
  getWithLabels(labels: Record<string, string>): number;
}

export interface Histogram {
  observe(value: number, labels?: Record<string, string>): void;
  getPercentile(percentile: number): number;
  getMean(): number;
  getCount(): number;
  reset(): void;
}

export interface MetricsSnapshot {
  timestamp: number;
  counters: Record<string, MetricValue[]>;
  gauges: Record<string, MetricValue[]>;
  histograms: Record<string, {
    count: number;
    mean: number;
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  }>;
  system: SystemMetrics;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  uptime: number;
}