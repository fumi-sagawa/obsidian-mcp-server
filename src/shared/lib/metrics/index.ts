export * from './types.js';
export { MetricsRegistry } from './metrics-registry.js';

// Convenience functions for accessing metrics
import { MetricsRegistry } from './metrics-registry.js';

const registry = MetricsRegistry.getInstance();

export const metrics = {
  counter: (name: string) => registry.counter(name),
  gauge: (name: string) => registry.gauge(name),
  histogram: (name: string) => registry.histogram(name),
  getSnapshot: () => registry.getSnapshot(),
  getSystemInfo: () => registry.getSystemInfo(),
  reset: () => registry.reset()
};

// Helper function to measure async operation duration
export async function measureDuration<T>(
  histogramName: string,
  labels: Record<string, string> | undefined,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    registry.histogram(histogramName).observe(duration, labels);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    registry.histogram(histogramName).observe(duration, { ...labels, status: 'error' });
    throw error;
  }
}

// Helper to track slow operations
export function trackSlowOperation(
  threshold: number = 1000, // 1 second default
  operationName: string
): (duration: number) => void {
  return (duration: number) => {
    if (duration > threshold) {
      registry.counter('mcp.slow_operations').increment({ operation: operationName });
      console.warn(`Slow operation detected: ${operationName} took ${duration}ms (threshold: ${threshold}ms)`);
    }
  };
}