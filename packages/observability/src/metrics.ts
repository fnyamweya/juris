export type MetricType = 'counter' | 'histogram' | 'gauge';

export interface Metric {
  name: string;
  type: MetricType;
  value: number;
  labels: Record<string, string>;
  timestamp: number;
}

export interface MetricsCollector {
  increment(name: string, labels?: Record<string, string>): void;
  histogram(name: string, value: number, labels?: Record<string, string>): void;
  gauge(name: string, value: number, labels?: Record<string, string>): void;
  flush(): Metric[];
}

export function createMetricsCollector(): MetricsCollector {
  const metrics: Metric[] = [];

  function normalizeLabels(labels?: Record<string, string>): Record<string, string> {
    return labels ?? {};
  }

  return {
    increment(name: string, labels?: Record<string, string>) {
      metrics.push({
        name,
        type: 'counter',
        value: 1,
        labels: normalizeLabels(labels),
        timestamp: Date.now(),
      });
    },

    histogram(name: string, value: number, labels?: Record<string, string>) {
      metrics.push({
        name,
        type: 'histogram',
        value,
        labels: normalizeLabels(labels),
        timestamp: Date.now(),
      });
    },

    gauge(name: string, value: number, labels?: Record<string, string>) {
      metrics.push({
        name,
        type: 'gauge',
        value,
        labels: normalizeLabels(labels),
        timestamp: Date.now(),
      });
    },

    flush(): Metric[] {
      const result = [...metrics];
      metrics.length = 0;
      return result;
    },
  };
}
