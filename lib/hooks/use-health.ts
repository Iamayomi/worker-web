import { useQuery } from "@tanstack/react-query";
import { worker } from "@/lib/api/worker";
import {
  HealthCheckData,
  LivenessData,
  ReadinessData,
  PerformanceMetricsData,
} from "@/types/api/health";
import { queryKeys } from "@/lib/api/query-keys";

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health.all(),
    queryFn: async () => {
      const res = await worker.get<HealthCheckData>("/health");
      if (!res.success) throw new Error(res.message || "Failed to check health");
      return res.data!;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function useLiveness() {
  return useQuery({
    queryKey: queryKeys.health.live(),
    queryFn: async () => {
      const res = await worker.get<LivenessData>("/health/live");
      if (!res.success) throw new Error(res.message || "Liveness check failed");
      return res.data!;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  });
}

export function useReadiness() {
  return useQuery({
    queryKey: queryKeys.health.ready(),
    queryFn: async () => {
      const res = await worker.get<ReadinessData>("/health/ready");
      if (!res.success) throw new Error(res.message || "Readiness check failed");
      return res.data!;
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: true,
  });
}

export function usePerformanceMetrics() {
  return useQuery({
    queryKey: queryKeys.health.metrics(),
    queryFn: async () => {
      const res = await worker.auth.get<PerformanceMetricsData>("/health/metrics");
      if (!res.success) throw new Error(res.message || "Failed to load metrics");
      return res.data!;
    },
    refetchInterval: 15_000,
    refetchIntervalInBackground: true,
  });
}
