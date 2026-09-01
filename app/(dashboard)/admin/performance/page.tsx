"use client";

import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useHealth, usePerformanceMetrics } from "@/lib/hooks/use-health";
import { usePageTitle } from "@/lib/hooks/use-page-title";
import { AnimatedContent } from "@/components/shared/animated-content";
import { SectionCard } from "@/components/shared/section-card";
import { StatCard } from "@/components/shared/stat-card";
import { BarChart, type BarDatum } from "@/components/shared/bar-chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
 Table,
 TableBody,
 TableCell,
 TableHead,
 TableHeader,
 TableRow,
} from "@/components/ui/table";
import { ErrorAlert } from "@/components/shared/error-alert";
import { ErrorPage } from "@/components/shared/error-page";
import { Skeleton } from "@/components/ui/skeleton";
import {
 Database,
 RefreshCw,
 Clock,
 Activity,
 CheckCircle2,
 XCircle,
 ArrowDownToLine,
 Gauge,
 Loader2,
 AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import type { HealthCheckResult, HealthStatus } from "@/types/api/health";

const CHECK_LABELS: Record<string, string> = {
 database: "Database",
 redis: "Redis",
 queue: "Queue",
};

const METHOD_COLORS: Record<string, string> = {
 GET: "text-blue-600",
 POST: "text-green-600",
 PATCH: "text-amber-600",
 PUT: "text-amber-600",
 DELETE: "text-red-600",
};

function formatBytes(bytes: number) {
 if (bytes >= 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
 if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
 if (bytes >= 1024) return `${(bytes / 1024).toFixed(1)} KB`;
 return `${bytes} B`;
}

function formatUptime(seconds: number) {
 const days = Math.floor(seconds / 86400);
 const hours = Math.floor((seconds % 86400) / 3600);
 const minutes = Math.floor((seconds % 3600) / 60);
 if (days > 0) return `${days}d ${hours}h ${minutes}m`;
 if (hours > 0) return `${hours}h ${minutes}m`;
 return `${minutes}m`;
}

function formatPct(value: number) {
 return `${(value * 100).toFixed(1)}%`;
}

function formatMs(value: number) {
 return `${value.toFixed(value >= 10 ? 0 : 1)} ms`;
}

function StatusPill({ status }: { status: HealthStatus }) {
 const healthy = status === "healthy";
 return (
 <Badge
 className={cn(
 "gap-1",
 healthy
 ? "bg-green-500/10 text-green-600"
 : "bg-red-500/10 text-red-600",
 )}
 >
 {healthy ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
 {healthy ? "Healthy" : "Unhealthy"}
 </Badge>
 );
}

function CheckRow({ name, check }: { name: string; check: HealthCheckResult }) {
 const healthy = check.status === "healthy";
 return (
 <div className="flex items-center justify-between gap-4 py-3">
 <div className="flex items-center gap-3">
 <div
 className={cn(
 " p-2",
 healthy ? "bg-green-500/10" : "bg-red-500/10",
 )}
 >
 <Database
 className={cn(
 "h-4 w-4",
 healthy ? "text-green-600" : "text-red-600",
 )}
 />
 </div>
 <div>
 <p className="text-sm font-medium">{name}</p>
 {check.error && (
 <p className="mt-0.5 max-w-md truncate text-xs text-destructive">
 {check.error}
 </p>
 )}
 {check.details && Object.keys(check.details).length > 0 && (
 <p className="mt-0.5 text-xs text-muted-foreground">
 {Object.entries(check.details)
 .map(([k, v]) => `${k}: ${String(v)}`)
 .join(" · ")}
 </p>
 )}
 </div>
 </div>
 <div className="flex items-center gap-3">
 {typeof check.latency_ms === "number" && (
 <span className="text-xs text-muted-foreground">{check.latency_ms}ms</span>
 )}
 <StatusPill status={check.status} />
 </div>
 </div>
 );
}

function MemoryBar({
 label,
 value,
 total,
}: {
 label: string;
 value: number;
 total: number;
}) {
 const pct = total > 0 ? Math.min(100, Math.round((value / total) * 100)) : 0;
 return (
 <div>
 <div className="mb-1 flex items-center justify-between text-xs">
 <span className="text-muted-foreground">{label}</span>
 <span className="font-medium">{formatBytes(value)}</span>
 </div>
 <div className="h-1.5 w-full overflow-hidden bg-secondary">
 <div
 className={cn(
 "h-full transition-all",
 pct > 85 ? "bg-red-500" : pct > 60 ? "bg-yellow-500" : "bg-green-500",
 )}
 style={{ width: `${pct}%` }}
 />
 </div>
 </div>
 );
}

export default function PerformancePage() {
 usePageTitle("Performance");
 const { user } = useAuth();
 const isAdmin = useMemo(
 () =>
 (user?.roles ?? []).includes("super_admin") ||
 (user?.roles ?? []).includes("admin"),
 [user],
 );
 const {
 data,
 isLoading,
 isError,
 error,
 refetch,
 isFetching,
 } = useHealth();
 const {
 data: metrics,
 isLoading: metricsLoading,
 isError: metricsError,
 error: metricsErrorObj,
 refetch: metricsRefetch,
 isFetching: metricsFetching,
 } = usePerformanceMetrics();
 const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
 const [showDependencyDetail, setShowDependencyDetail] = useState(false);
 const [showStatsDetail, setShowStatsDetail] = useState(false);

 const handleRefresh = () => {
 void Promise.all([refetch(), metricsRefetch()]).then(() =>
 setLastRefreshed(new Date()),
 );
 };

 if (!isAdmin) {
 return (
 <AnimatedContent>
 <div className="mx-auto max-w-2xl">
 <div className=" border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 You need an admin role to view this page.
 </div>
 </div>
 </AnimatedContent>
 );
 }

 if (isError && metricsError) {
 return (
 <AnimatedContent>
 <div className="mx-auto max-w-6xl">
 <ErrorPage
 variant="page"
 title="Performance unavailable"
 description="We couldn't reach the API for health and request metrics. Try again — if the problem keeps happening, please check back shortly."
 onRetry={handleRefresh}
 showHome
 />
 </div>
 </AnimatedContent>
 );
 }

 const overallHealthy = data?.status === "healthy";
 const timelineBars: BarDatum[] = (metrics?.timeline ?? []).map(t => ({
 id: t.timestamp,
 label: new Date(t.timestamp).toLocaleTimeString([], {
 hour: "2-digit",
 minute: "2-digit",
 }),
 value: t.requests,
 }));
 const topRoutes = metrics?.routes ?? [];
 const refreshing = isFetching || metricsFetching;
 const worstLatencyMs = Math.max(
 0,
 ...(metrics?.routes ?? []).map(r => r.max_latency_ms),
 );

 return (
 <AnimatedContent>
 <div className="mx-auto max-w-6xl space-y-6">
 <div className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
 <p className="mt-1 text-sm text-muted-foreground">
 Live health, dependencies and rolling request analytics.
 </p>
 </div>
 <div className="flex items-center gap-3">
 {data && (
 <span className="text-xs text-muted-foreground">
 Last checked:{" "}
 {(lastRefreshed ?? new Date(data.timestamp)).toLocaleTimeString()}
 </span>
 )}
 <Button
 variant="outline"
 size="sm"
 onClick={handleRefresh}
 disabled={refreshing}
 >
 {refreshing ? (
 <Loader2 className="h-4 w-4 animate-spin" />
 ) : (
 <RefreshCw className="h-4 w-4" />
 )}
 Refresh
 </Button>
 </div>
 </div>

 {(isError || metricsError) && (
 <div className="space-y-2">
 {isError && (
 <ErrorAlert
 message={
 error instanceof Error
 ? error.message
 : "Failed to load performance"
 }
 />
 )}
 {metricsError && (
 <ErrorAlert
 message={
 metricsErrorObj instanceof Error
 ? metricsErrorObj.message
 : "Failed to load request metrics"
 }
 />
 )}
 </div>
 )}

 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <SectionCard title="Overall">
 {isLoading ? (
 <Skeleton className="h-16 w-full" />
 ) : (
 <div className="flex items-center justify-between">
 <Activity className="h-5 w-5 text-primary" />
 {data && <StatusPill status={data.status} />}
 </div>
 )}
 </SectionCard>
 <SectionCard title="Uptime">
 {isLoading ? (
 <Skeleton className="h-16 w-full" />
 ) : (
 <div className="flex items-center justify-between">
 <Clock className="h-5 w-5 text-primary" />
 <span className="text-xl font-bold">
 {data ? formatUptime(data.uptime) : "—"}
 </span>
 </div>
 )}
 </SectionCard>
 <SectionCard
 title="Dependencies"
 actions={
 data && (
 <Button
 variant="ghost"
 size="sm"
 className="h-7 px-2 text-xs"
 onClick={() => setShowDependencyDetail(v => !v)}
 >
 {showDependencyDetail ? "View less" : "View more"}
 </Button>
 )
 }
 >
 {isLoading ? (
 <Skeleton className="h-16 w-full" />
 ) : (
 <>
 <div className="flex flex-wrap gap-1.5">
 {data &&
 Object.entries(data.checks).map(([key, check]) => (
 <StatusPill key={key} status={check.status} />
 ))}
 </div>
 {showDependencyDetail && data && (
 <div className="mt-3 divide-y divide-border/10 border-t border-border/15 pt-2">
 {Object.entries(data.checks).map(([key, check]) => (
 <CheckRow
 key={key}
 name={CHECK_LABELS[key] ?? key}
 check={check}
 />
 ))}
 </div>
 )}
 </>
 )}
 </SectionCard>
 <SectionCard title="API">
 <div className="flex items-center justify-between">
 <Activity className="h-5 w-5 text-primary" />
 <StatusPill status={overallHealthy ? "healthy" : "unhealthy"} />
 </div>
 </SectionCard>
 </div>

 <div>
 <div className="flex items-center justify-between gap-4">
 <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
 Request stats
 </h2>
 {!metricsLoading && metrics && (
 <Button
 variant="ghost"
 size="sm"
 className="h-7 px-2 text-xs"
 onClick={() => setShowStatsDetail(v => !v)}
 >
 {showStatsDetail ? "View less" : "View more"}
 </Button>
 )}
 </div>
 <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {metricsLoading ? (
 <>
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 <Skeleton className="h-24 w-full" />
 </>
 ) : (
 <>
 <StatCard
 label="Requests (15 min)"
 value={metrics?.totals.requests?.toLocaleString() ?? "—"}
 icon={ArrowDownToLine}
 extra={
 showStatsDetail && metrics ? (
 <>
 <span>
 Failures: {metrics.totals.failures.toLocaleString()}
 </span>
 <span>
 Success rate: {formatPct(metrics.totals.success_rate)}
 </span>
 </>
 ) : undefined
 }
 />
 <StatCard
 label="Requests / min"
 value={
 metrics
 ? metrics.totals.requests_per_minute.toFixed(1)
 : "—"
 }
 icon={Gauge}
 extra={
 showStatsDetail && metrics ? (
 <span>
 Failures / min:{" "}
 {(
 metrics.totals.failures /
 (metrics.window_seconds / 60)
 ).toFixed(1)}
 </span>
 ) : undefined
 }
 />
 <StatCard
 label="Error rate"
 value={metrics ? formatPct(metrics.totals.error_rate) : "—"}
 icon={AlertTriangle}
 extra={
 showStatsDetail && metrics ? (
 <>
 <span>
 Failures: {metrics.totals.failures.toLocaleString()}
 </span>
 <span>
 Success rate: {formatPct(metrics.totals.success_rate)}
 </span>
 </>
 ) : undefined
 }
 />
 <StatCard
 label="Avg response time"
 value={metrics ? formatMs(metrics.totals.avg_latency_ms) : "—"}
 icon={Clock}
 extra={
 showStatsDetail && metrics ? (
 <span>
 Worst endpoint (max): {formatMs(worstLatencyMs)}
 </span>
 ) : undefined
 }
 />
 </>
 )}
 </div>
 </div>

 <SectionCard
 title="Request timeline (30s buckets)"
 actions={
 !metricsLoading && timelineBars.length > 0 ? (
 <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
 <Link href="/admin/performance/timeline">View more</Link>
 </Button>
 ) : undefined
 }
 >
 {metricsLoading ? (
 <Skeleton className="h-52 w-full" />
 ) : (
 <BarChart data={timelineBars} height={180} />
 )}
 </SectionCard>

 <SectionCard
 title="Per-endpoint breakdown"
 actions={
 topRoutes.length > 0 ? (
 <Button asChild variant="ghost" size="sm" className="h-7 px-2 text-xs">
 <Link href="/admin/performance/routes">View all ({topRoutes.length})</Link>
 </Button>
 ) : undefined
 }
 >
 {metricsLoading ? (
 <Skeleton className="h-64 w-full" />
 ) : topRoutes.length === 0 ? (
 <p className="text-sm text-muted-foreground">
 No request data yet. Traffic will appear here once requests flow through the API.
 </p>
 ) : (
 <div className="overflow-x-auto">
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
 </TableRow>
 </TableHeader>
 <TableBody>
 {topRoutes.slice(0, 8).map((route) => (
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
 <TableCell className="font-mono text-xs">{route.path}</TableCell>
 <TableCell className="text-right">{route.requests.toLocaleString()}</TableCell>
 <TableCell className="text-right">{route.failures.toLocaleString()}</TableCell>
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
 <TableCell className="text-right">{formatMs(route.avg_latency_ms)}</TableCell>
 <TableCell className="text-right">{formatMs(route.p95_latency_ms)}</TableCell>
 </TableRow>
 ))}
 </TableBody>
 </Table>
 </div>
 )}
 </SectionCard>

 <div className="grid gap-4 lg:grid-cols-2">
 <SectionCard title="Dependencies">
 {isLoading ? (
 <div className="space-y-3">
 {["Database", "Redis", "Queue"].map((n) => (
 <Skeleton key={n} className="h-12 w-full" />
 ))}
 </div>
 ) : (
 <div className="divide-y divide-border/10">
 {data &&
 Object.entries(data.checks).map(([key, check]) => (
 <CheckRow
 key={key}
 name={CHECK_LABELS[key] ?? key}
 check={check}
 />
 ))}
 </div>
 )}
 </SectionCard>

 <SectionCard title="Memory usage">
 {isLoading ? (
 <Skeleton className="h-32 w-full" />
 ) : data?.memory ? (
 <div className="space-y-4">
 <MemoryBar
 label="Heap used"
 value={data.memory.heapUsed}
 total={data.memory.heapTotal}
 />
 <MemoryBar
 label="Resident set size (RSS)"
 value={data.memory.rss}
 total={data.memory.rss}
 />
 <p className="pt-1 text-xs text-muted-foreground">
 Total heap: {formatBytes(data.memory.heapTotal)} · External:{" "}
 {formatBytes(data.memory.external)}
 </p>
 </div>
 ) : (
 <p className="text-sm text-muted-foreground">
 No memory data available.
 </p>
 )}
 </SectionCard>
 </div>
 </div>
 </AnimatedContent>
 );
}
