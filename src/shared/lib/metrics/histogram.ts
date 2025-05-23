import type { Histogram } from './types.js';

interface HistogramData {
  values: number[];
  count: number;
  sum: number;
}

export class HistogramImpl implements Histogram {
  private data: Map<string, HistogramData> = new Map();
  private name: string;
  private maxValues: number = 10000; // Prevent memory issues

  constructor(name: string) {
    this.name = name;
  }

  observe(value: number, labels?: Record<string, string>): void {
    const key = this.labelsToKey(labels);
    let data = this.data.get(key);

    if (!data) {
      data = { values: [], count: 0, sum: 0 };
      this.data.set(key, data);
    }

    data.values.push(value);
    data.count++;
    data.sum += value;

    // Implement reservoir sampling if we exceed maxValues
    if (data.values.length > this.maxValues) {
      const randomIndex = Math.floor(Math.random() * data.values.length);
      data.values[randomIndex] = value;
    }
  }

  getPercentile(percentile: number): number {
    const allValues = this.getAllValues();
    if (allValues.length === 0) return 0;

    allValues.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * allValues.length) - 1;
    return allValues[Math.max(0, index)];
  }

  getMean(): number {
    let totalSum = 0;
    let totalCount = 0;

    for (const data of this.data.values()) {
      totalSum += data.sum;
      totalCount += data.count;
    }

    return totalCount > 0 ? totalSum / totalCount : 0;
  }

  getCount(): number {
    let totalCount = 0;
    for (const data of this.data.values()) {
      totalCount += data.count;
    }
    return totalCount;
  }

  reset(): void {
    this.data.clear();
  }

  getStats() {
    const allValues = this.getAllValues();
    if (allValues.length === 0) {
      return {
        count: 0,
        mean: 0,
        p50: 0,
        p90: 0,
        p95: 0,
        p99: 0
      };
    }

    allValues.sort((a, b) => a - b);

    return {
      count: this.getCount(),
      mean: this.getMean(),
      p50: this.getPercentileValue(allValues, 50),
      p90: this.getPercentileValue(allValues, 90),
      p95: this.getPercentileValue(allValues, 95),
      p99: this.getPercentileValue(allValues, 99)
    };
  }

  private getAllValues(): number[] {
    const allValues: number[] = [];
    for (const data of this.data.values()) {
      allValues.push(...data.values);
    }
    return allValues;
  }

  private getPercentileValue(sortedValues: number[], percentile: number): number {
    const index = Math.ceil((percentile / 100) * sortedValues.length) - 1;
    return sortedValues[Math.max(0, index)];
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
}