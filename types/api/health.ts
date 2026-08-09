export type HealthStatus = "healthy" | "unhealthy";

export interface HealthCheckResult {
  status: HealthStatus;
  latency_ms?: number;
  error?: string;
  details?: Record<string, unknown>;
}

export interface HealthMemory {
  rss: number;
  heapTotal: number;
  heapUsed: number;
  external: number;
}

export interface LivenessData {
  status: "ok";
  timestamp: string;
  uptime: number;
}

export interface ReadinessData {
  status: "ready";
  timestamp: string;
  checks: Record<string, HealthCheckResult>;
}

export interface HealthCheckData {
  status: HealthStatus;
  timestamp: string;
  uptime: number;
  checks: Record<string, HealthCheckResult>;
  memory: HealthMemory;
}

export interface RouteMetricEntry {
  method: string;
  path: string;
  requests: number;
  failures: number;
  error_rate: number;
  avg_latency_ms: number;
  p95_latency_ms: number;
  max_latency_ms: number;
}

export interface MetricsTimelineEntry {
  timestamp: string;
  requests: number;
  failures: number;
  avg_latency_ms: number;
}

export interface PerformanceMetricsData {
  window_seconds: number;
  collected_at: string;
  totals: {
    requests: number;
    failures: number;
    error_rate: number;
    success_rate: number;
    avg_latency_ms: number;
    requests_per_minute: number;
  };
  routes: RouteMetricEntry[];
  timeline: MetricsTimelineEntry[];
}
