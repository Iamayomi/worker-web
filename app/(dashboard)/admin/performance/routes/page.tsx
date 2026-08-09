"use client";

import { useMemo } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { usePerformanceMetrics } from "@/lib/hooks/use-health";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AnimatedContent } from "@/components/shared/animated-content";
import { StatCard } from "@/components/shared/stat-card";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorPage } from "@/components/shared/error-page";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertTriangle,
  ArrowDownToLine,
  Clock,
  Gauge,
  Route,
} from "lucide-react";
import { cn } from "@/lib/utils";

const METHOD_COLORS: Record<string, string> = {
  GET: "text-blue-600",
  POST: "text-green-600",
  PATCH: "text-amber-600",
  PUT: "text-amber-600",
  DELETE: "text-red-600",
};

function formatPct(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatMs(value: number) {
  return `${value.toFixed(value >= 10 ? 0 : 1)} ms`;
}

export default function EndpointBreakdownPage() {
  usePageTitle("Endpoint breakdown");
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
            title="Endpoint breakdown"
            description="Request, failure and latency detail for every endpoint in the rolling window."
            backHref="/admin/performance"
          />
          <ErrorPage
            variant="card"
            title="Endpoint data unavailable"
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

  const routes = metrics?.routes ?? [];
  const worstP95 = Math.max(0, ...routes.map((r) => r.p95_latency_ms));

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title="Endpoint breakdown"
          description="Request, failure and latency detail for every endpoint in the rolling window."
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
              label="Total requests"
              value={metrics?.totals.requests?.toLocaleString() ?? "—"}
              icon={ArrowDownToLine}
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
            <StatCard
              label="Worst endpoint P95"
              value={routes.length > 0 ? formatMs(worstP95) : "—"}
              icon={Gauge}
            />
          </div>
        )}

        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : routes.length === 0 ? (
          <div className="rounded-lg border border-border/15">
            <EmptyState
              icon={Route}
              title="No request data yet"
              description="Traffic will appear here once requests flow through the API."
            />
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border/15">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Method</TableHead>
                  <TableHead>Route</TableHead>
                  <TableHead className="text-right">Requests</TableHead>
                  <TableHead className="text-right">Failures</TableHead>
                  <TableHead className="text-right">Error rate</TableHead>
                  <TableHead className="text-right">Avg latency</TableHead>
                  <TableHead className="text-right">P95</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {routes.map((route) => (
                  <TableRow key={`${route.method} ${route.path}`}>
                    <TableCell>
                      <span
                        className={cn(
                          "font-mono text-xs font-semibold",
                          METHOD_COLORS[route.method] ?? "text-foreground",
                        )}
                      >
                        {route.method}
                      </span>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {route.path}
                    </TableCell>
                    <TableCell className="text-right">
                      {route.requests.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {route.failures.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          "font-medium",
                          route.error_rate > 0.05
                            ? "text-red-600"
                            : route.error_rate > 0
                              ? "text-amber-600"
                              : "text-muted-foreground",
                        )}
                      >
                        {formatPct(route.error_rate)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMs(route.avg_latency_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMs(route.p95_latency_ms)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatMs(route.max_latency_ms)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AnimatedContent>
  );
}
