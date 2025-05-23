import { metrics, measureDuration, trackSlowOperation } from '../metrics/index.js';
import { logger } from '../logger/index.js';

export interface RequestContext {
  tool: string;
  startTime: number;
}

export class MetricsMiddleware {
  private slowOperationThreshold: number;
  private trackSlowOps: ReturnType<typeof trackSlowOperation>;

  constructor(slowOperationThreshold: number = 1000) {
    this.slowOperationThreshold = slowOperationThreshold;
    this.trackSlowOps = trackSlowOperation(slowOperationThreshold, 'mcp-request');
  }

  async trackRequest<T>(
    tool: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const labels = { tool };
    
    // Increment total requests
    metrics.counter('mcp.requests.total').increment(labels);
    
    // Track active connections
    metrics.gauge('mcp.connections.active').increment();
    
    try {
      const result = await measureDuration(
        'mcp.request.duration',
        labels,
        handler
      );
      
      // Track slow operations
      const duration = Date.now() - Date.now(); // This will be calculated by measureDuration
      this.trackSlowOps(duration);
      
      return result;
    } catch (error) {
      // Track errors
      metrics.counter('mcp.requests.errors').increment(labels);
      
      logger.error(`Request failed for tool: ${tool}`, error as Error);
      throw error;
    } finally {
      // Decrement active connections
      metrics.gauge('mcp.connections.active').decrement();
    }
  }

  async trackWeatherAPICall<T>(
    operation: string,
    handler: () => Promise<T>
  ): Promise<T> {
    const labels = { operation };
    
    // Increment API calls
    metrics.counter('weather.api.calls').increment(labels);
    
    try {
      const result = await measureDuration(
        'weather.api.response_time',
        labels,
        handler
      );
      
      return result;
    } catch (error) {
      // Track API errors
      metrics.counter('weather.api.errors').increment(labels);
      throw error;
    }
  }

  trackCacheOperation(hit: boolean): void {
    if (hit) {
      metrics.counter('weather.cache.hits').increment();
    } else {
      metrics.counter('weather.cache.misses').increment();
    }
  }

  updateCacheSize(size: number): void {
    metrics.gauge('weather.cache.size').set(size);
  }
}