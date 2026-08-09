"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { usePerformanceMetrics } from "@/lib/hooks/use-health";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AnimatedContent } from "@/components/shared/animated-content";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { BarChart, type BarDatum } from "@/components/shared/bar-chart";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorPage } from "@/components/shared/error-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  Clock,
  Gauge,
} from "lucide-react";

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMs(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 1)} ms`;
}

export default function RequestTimelinePage() {
  usePageTitle("Request timeline");
  const { user } = useAuth();
  const isAdmin = useMemo(
    () =>
      (user?.roles ?? []).includes("super_admin") ||
      (user?.roles ?? []).includes("admin"),
    [user],
  );
  const {
    data: metrics,
    isLoading,
    isError,
    error,
    refetch,
  } = usePerformanceMetrics();

  if (!isAdmin) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            You need an admin role to view this page.
          </div>
        </div>
      </AnimatedContent>
    );
  }

  if (isError) {
    return (
      <AnimatedContent>
        <div className="mx-auto max-w-6xl space-y-6">
          <PageHeader
            title="Request timeline"
            description="Rolling 30s-bucket request and latency history for the current window."
            backHref="/admin/performance"
          />
          <ErrorPage
            variant="card"
            title="Timeline data unavailable"
            description={
              error instanceof Error
                ? error.message
                : "We couldn't load request metrics for this page."
            }
            onRetry={refetch}
          />
        </div>
      </AnimatedContent>
    );
  }

  const timeline = metrics?.timeline ?? [];
  const requestBars: BarDatum[] = timeline.map((t) => ({
    id: t.timestamp,
    label: new Date(t.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: t.requests,
  }));
  const latencyBars: BarDatum[] = timeline.map((t) => ({
    id: t.timestamp,
    label: new Date(t.timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    value: Math.round(t.avg_latency_ms),
  }));

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Request timeline"
          description="Rolling 30s-bucket request and latency history for the current window."
          backHref="/admin/performance"
        />

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Requests (15 min)"
              value={metrics?.totals.requests?.toLocaleString() ?? "—"}
              icon={ArrowDownToLine}
            />
            <StatCard
              label="Requests / min"
              value={
                metrics ? metrics.totals.requests_per_minute.toFixed(1) : "—"
              }
              icon={Gauge}
            />
            <StatCard
              label="Error rate"
              value={metrics ? formatPct(metrics.totals.error_rate) : "—"}
              icon={AlertTriangle}
            />
            <StatCard
              label="Avg response time"
              value={metrics ? formatMs(metrics.totals.avg_latency_ms) : "—"}
              icon={Clock}
            />
          </div>
        )}

        <SectionCard title="Requests per bucket (30s)">
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : requestBars.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No request data yet. Traffic will appear here once requests flow
              through the API.
            </p>
          ) : (
            <BarChart data={requestBars} height={320} />
          )}
        </SectionCard>

        <SectionCard title="Avg latency per bucket (30s)">
          {isLoading ? (
            <Skeleton className="h-80 w-full" />
          ) : latencyBars.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No request data yet. Traffic will appear here once requests flow
              through the API.
            </p>
          ) : (
            <BarChart data={latencyBars} height={320} valueSuffix=" ms" />
          )}
        </SectionCard>

        {metrics && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Activity className="h-4 w-4" />
            Window: {(metrics.window_seconds / 60).toFixed(0)} minutes ·{" "}
            {timeline.length} buckets · Collected at{" "}
            {new Date(metrics.collected_at).toLocaleTimeString()}
          </div>
        )}
      </div>
    </AnimatedContent>
  );
}
