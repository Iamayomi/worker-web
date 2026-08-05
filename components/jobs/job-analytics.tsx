"use client";

import { useState } from "react";
import { useJobAnalytics } from "@/lib/hooks/use-jobs";
import { JOB_STATUSES, APPLICATION_STATUSES } from "@/lib/constants/enums";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { BarChart } from "@/components/shared/bar-chart";
import { DonutChart } from "@/components/shared/donut-chart";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCardsSkeleton, ChartSkeleton } from "@/components/shared/skeletons";
import { cn } from "@/lib/utils";
import { JobStatus } from "@/types/api/jobs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Briefcase, FileText, UserCheck, Users } from "lucide-react";

const DAY_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
] as const;

const ACTIVE_PIPELINE_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
];

function formatChartLabel(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusLabel(
  value: string,
  options: readonly { value: string; label: string }[],
) {
  return options.find((o) => o.value === value)?.label ?? value.replace(/_/g, " ");
}

export function JobAnalyticsSection({
  showTotals = true,
}: {
  showTotals?: boolean;
}) {
  const [days, setDays] = useState<number>(14);
  const [status, setStatus] = useState<JobStatus | "all">("all");

  const { data, isLoading, isError, error } = useJobAnalytics({
    days,
    status: status === "all" ? undefined : status,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex rounded-lg border border-border/15 p-1">
          {DAY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDays(opt.value)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                days === opt.value
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <Select
          value={status}
          onValueChange={(v) => setStatus(v as JobStatus | "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Job status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {JOB_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {showTotals && <StatCardsSkeleton count={4} />}
          <ChartSkeleton />
        </div>
      ) : isError || !data ? (
        <ErrorAlert
          message={
            error instanceof Error ? error.message : "Failed to load analytics"
          }
        />
      ) : (
        <>
          {showTotals && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total jobs" value={data.total_jobs} icon={Briefcase} />
              <StatCard
                label="Total applications"
                value={data.total_applications}
                icon={Users}
              />
              <StatCard
                label="Published"
                value={
                  data.jobs_by_status.find((s) => s.status === "published")?.count ??
                  0
                }
                icon={FileText}
              />
              <StatCard
                label="Active pipelines"
                value={data.applications_by_status
                  .filter((s) => ACTIVE_PIPELINE_STATUSES.includes(s.status))
                  .reduce((sum, s) => sum + s.count, 0)}
                icon={UserCheck}
              />
            </div>
          )}
          <SectionCard title={`Applications received (last ${days} days)`}>
            <BarChart
              data={data.applications_chart.map((e) => ({
                label: formatChartLabel(e.date),
                value: e.count,
              }))}
            />
          </SectionCard>
          <div className="grid gap-6 lg:grid-cols-2">
            <SectionCard title="Jobs by status">
              {data.total_jobs === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No jobs yet. Post your first job to see the breakdown.
                </p>
              ) : (
                <DonutChart
                  data={data.jobs_by_status.map((s) => ({
                    label: statusLabel(s.status, JOB_STATUSES),
                    value: s.count,
                  }))}
                />
              )}
            </SectionCard>
            <SectionCard title="Applications by status">
              {data.total_applications === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No applications yet. Applications will show up here.
                </p>
              ) : (
                <DonutChart
                  data={data.applications_by_status.map((s) => ({
                    label: statusLabel(s.status, APPLICATION_STATUSES),
                    value: s.count,
                  }))}
                />
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}
