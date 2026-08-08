"use client";

import { useApplicationAnalytics } from "@/lib/hooks/use-jobs";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { APPLICATION_STATUS } from "@/lib/constants/status";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { BarChart, type BarDatum } from "@/components/shared/bar-chart";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCardsSkeleton, ChartSkeleton } from "@/components/shared/skeletons";
import { Briefcase, FileText, Send, Users } from "lucide-react";

function chartLabel(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function ApplicationStats() {
  const { data, isLoading, isError, error } = useApplicationAnalytics({
    days: 14,
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton count={4} />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorAlert
        message={
          error instanceof Error
            ? error.message
            : "Failed to load application analytics"
        }
      />
    );
  }

  const countFor = (value: string) =>
    data.applications_by_status.find((entry) => entry.status === value)
      ?.count ?? 0;

  const chart: BarDatum[] = data.applications_chart.map((entry) => ({
    label: chartLabel(entry.date),
    value: entry.count,
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total applications"
          value={data.total_applications}
          icon={Briefcase}
        />
        <StatCard label="Active pipeline" value={countFor("applied")} icon={Send} />
        <StatCard
          label="Under review"
          value={countFor("under_review")}
          icon={FileText}
        />
        <StatCard label="Offers" value={countFor("offered")} icon={Users} />
      </div>

      <SectionCard title="Applications over the last 14 days">
        {chart.length > 0 ? (
          <BarChart data={chart} height={180} />
        ) : (
          <p className="text-sm text-muted-foreground">
            No application activity yet.
          </p>
        )}
      </SectionCard>

      <SectionCard title="Applications by status">
        <div className="grid gap-2 sm:grid-cols-2">
          {APPLICATION_STATUSES.map((status) => {
            const count = countFor(status.value);
            return (
              <div
                key={status.value}
                className="flex items-center justify-between rounded-lg border border-border/10 px-4 py-2.5 text-sm"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      APPLICATION_STATUS[status.value]?.split(" ")[0] ??
                      "bg-muted"
                    }`}
                  />
                  {status.label}
                </span>
                <span className="font-semibold">{count}</span>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
