import { CounterImpl } from './counter.js';
import { GaugeImpl } from './gauge.js';
import { HistogramImpl } from './histogram.js';
import { SystemMetricsCollector } from './system-metrics.js';
import type { Counter, Gauge, Histogram, MetricsSnapshot } from './types.js';

export class MetricsRegistry {
  private static instance: MetricsRegistry;
  
  private counters: Map<string, CounterImpl> = new Map();
  private gauges: Map<string, GaugeImpl> = new Map();
  private histograms: Map<string, HistogramImpl> = new Map();
  private systemMetricsCollector: SystemMetricsCollector;

  private constructor() {
    this.systemMetricsCollector = new SystemMetricsCollector();
    this.initializeDefaultMetrics();
  }

  static getInstance(): MetricsRegistry {
    if (!MetricsRegistry.instance) {
      MetricsRegistry.instance = new MetricsRegistry();
    }
    return MetricsRegistry.instance;
  }

  counter(name: string): Counter {
    if (!this.counters.has(name)) {
      this.counters.set(name, new CounterImpl(name));
    }
    return this.counters.get(name)!;
  }

  gauge(name: string): Gauge {
    if (!this.gauges.has(name)) {
      this.gauges.set(name, new GaugeImpl(name));
    }
    return this.gauges.get(name)!;
  }

  histogram(name: string): Histogram {
    if (!this.histograms.has(name)) {
      this.histograms.set(name, new HistogramImpl(name));
    }
    return this.histograms.get(name)!;
  }

  getSnapshot(): MetricsSnapshot {
    const snapshot: MetricsSnapshot = {
      timestamp: Date.now(),
      counters: {},
      gauges: {},
      histograms: {},
      system: this.systemMetricsCollector.collect()
    };

    // Collect counter values
    for (const [name, counter] of this.counters.entries()) {
      snapshot.counters[name] = counter.getAllValues();
    }

    // Collect gauge values
    for (const [name, gauge] of this.gauges.entries()) {
      snapshot.gauges[name] = gauge.getAllValues();
    }

    // Collect histogram stats
    for (const [name, histogram] of this.histograms.entries()) {
      snapshot.histograms[name] = histogram.getStats();
    }

    return snapshot;
  }

  reset(): void {
    for (const counter of this.counters.values()) {
      counter.reset();
    }
    for (const histogram of this.histograms.values()) {
      histogram.reset();
    }
    // Note: We don't reset gauges as they represent current state
  }

  private initializeDefaultMetrics() {
    // Initialize common metrics
    this.counter('mcp.requests.total');
    this.counter('mcp.requests.errors');
    this.histogram('mcp.request.duration');
    this.gauge('mcp.connections.active');
    
  }

  getSystemInfo() {
    return this.systemMetricsCollector.getSystemInfo();
  }
}