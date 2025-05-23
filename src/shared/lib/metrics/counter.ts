import type { Counter, MetricValue } from './types.js';

export class CounterImpl implements Counter {
  private values: Map<string, number> = new Map();
  private name: string;

  constructor(name: string) {
    this.name = name;
  }

  increment(labels?: Record<string, string>): void {
    const key = this.labelsToKey(labels);
    const current = this.values.get(key) || 0;
    this.values.set(key, current + 1);
  }

  get(): number {
    const noLabelsKey = this.labelsToKey();
    return this.values.get(noLabelsKey) || 0;
  }

  getWithLabels(labels: Record<string, string>): number {
    const key = this.labelsToKey(labels);
    return this.values.get(key) || 0;
  }

  reset(): void {
    this.values.clear();
  }

  getAllValues(): MetricValue[] {
    const result: MetricValue[] = [];
    const timestamp = Date.now();

    for (const [key, value] of this.values.entries()) {
      const labels = this.keyToLabels(key);
      result.push({
        value,
        timestamp,
        labels: Object.keys(labels).length > 0 ? labels : undefined
      });
    }

    return result;
  }

  private labelsToKey(labels?: Record<string, string>): string {
    if (!labels || Object.keys(labels).length === 0) {
      return '';
    }
    
    const sorted = Object.keys(labels)
      .sort()
      .map(key => `${key}:${labels[key]}`)
      .join(',');
    
    return sorted;
  }

  private keyToLabels(key: string): Record<string, string> {
    if (!key) return {};
    
    const labels: Record<string, string> = {};
    const pairs = key.split(',');
    
    for (const pair of pairs) {
      const [k, v] = pair.split(':');
      if (k && v) {
        labels[k] = v;
      }
    }
    
    return labels;
  }
}