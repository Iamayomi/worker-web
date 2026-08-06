"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  Clock,
  Download,
  Eye,
  FileText,
  Mail,
  Star,
  Target,
  UserCheck,
  Users,
  Wallet,
} from "lucide-react";
import { useTalentAnalytics, useClientAnalytics } from "@/lib/hooks/use-analytics";
import type {
  ClientAnalyticsData,
  TalentAnalyticsData,
} from "@/lib/hooks/use-analytics";
import { APPLICATION_STATUSES } from "@/lib/constants/enums";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { BarChart } from "@/components/shared/bar-chart";
import { DonutChart } from "@/components/shared/donut-chart";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCardsSkeleton, ChartSkeleton } from "@/components/shared/skeletons";
import { ExportCsvButton } from "@/components/shared/export-csv-button";
import type { CsvRow } from "@/components/shared/export-csv-button";
import { cn } from "@/lib/utils";

const DAY_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
] as const;

function formatChartLabel(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function statusLabel(value: string) {
  return (
    APPLICATION_STATUSES.find((s) => s.value === value)?.label ??
    value.replace(/_/g, " ")
  );
}

function DayRangePicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (days: number) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border/15 p-1">
      {DAY_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            value === opt.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted"
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Rate({ value }: { value: number | null }) {
  return value == null ? (
    <span className="text-muted-foreground">—</span>
  ) : (
    <>{value}%</>
  );
}

function talentCsvRows(data: TalentAnalyticsData): CsvRow[] {
  const downloadsByDate = new Map(
    data.resume_downloads_chart.map((e) => [e.date, e.count])
  );
  const rows: CsvRow[] = data.profile_views_chart.map((entry) => [
    entry.date,
    entry.count,
    downloadsByDate.get(entry.date) ?? 0,
  ]);
  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Profile views", data.profile_views]);
  rows.push(["Resume downloads", data.resume_downloads]);
  rows.push(["Job matches", data.job_matches]);
  rows.push(["Applications", data.total_applications]);
  rows.push(["Interview rate (%)", data.interview_rate ?? ""]);
  rows.push(["Response rate (%)", data.response_rate ?? ""]);
  return rows;
}

function clientCsvRows(data: ClientAnalyticsData): CsvRow[] {
  const byDate = new Map(data.applications_chart.map((e) => [e.date, e]));
  const rows: CsvRow[] = data.job_views_chart.map((entry) => [
    entry.date,
    entry.count,
    byDate.get(entry.date)?.count ?? 0,
  ]);
  rows.push([]);
  rows.push(["Summary"]);
  rows.push(["Total jobs", data.total_jobs]);
  rows.push(["Job views", data.job_views]);
  rows.push(["Total applications", data.total_applications]);
  rows.push(["Application rate (%)", data.application_rate ?? ""]);
  rows.push(["Hires", data.hires]);
  rows.push(["Time to hire (days)", data.time_to_hire_days ?? ""]);
  rows.push(["Cost per hire", data.cost_per_hire ?? ""]);
  rows.push(["Quality of hire", data.quality_of_hire ?? ""]);
  return rows;
}

export function TalentAnalyticsView() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error } = useTalentAnalytics(days);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton count={6} />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert
        message={
          error instanceof Error ? error.message : "Failed to load analytics"
        }
      />
    );
  }

  const platform = data.platform_averages;
  const comparison: {
    label: string;
    you: number | null;
    avg: number | null;
  }[] = [
    {
      label: "Profile views",
      you: data.profile_views,
      avg: platform.avg_profile_views,
    },
    {
      label: "Resume downloads",
      you: data.resume_downloads,
      avg: platform.avg_resume_downloads,
    },
    {
      label: "Applications",
      you: data.total_applications,
      avg: platform.avg_applications,
    },
    {
      label: "Interview rate (%)",
      you: data.interview_rate,
      avg: platform.avg_interview_rate,
    },
    {
      label: "Response rate (%)",
      you: data.response_rate,
      avg: platform.avg_response_rate,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DayRangePicker value={days} onChange={setDays} />
        <ExportCsvButton
          filename={`talent-analytics-${new Date().toISOString().slice(0, 10)}.csv`}
          headers={["Date", "Profile views", "Resume downloads"]}
          rows={talentCsvRows(data)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Profile views" value={data.profile_views} icon={Eye} />
        <StatCard label="Resume downloads" value={data.resume_downloads} icon={Download} />
        <StatCard label="Job matches" value={data.job_matches} icon={Target} />
        <StatCard label="Applications" value={data.total_applications} icon={FileText} />
        <StatCard label="Interview rate" value={<Rate value={data.interview_rate} />} icon={UserCheck} />
        <StatCard label="Response rate" value={<Rate value={data.response_rate} />} icon={Mail} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title={`Profile views (last ${days} days)`}>
          <BarChart
            data={data.profile_views_chart.map((e) => ({
              label: formatChartLabel(e.date),
              value: e.count,
            }))}
          />
        </SectionCard>
        <SectionCard title={`Resume downloads (last ${days} days)`}>
          <BarChart
            data={data.resume_downloads_chart.map((e) => ({
              label: formatChartLabel(e.date),
              value: e.count,
            }))}
          />
        </SectionCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title={`Applications (last ${days} days)`}>
          {data.total_applications === 0 ? (
            <p className="text-sm text-muted-foreground">
              No applications yet. Apply to jobs to start building your
              application history.
            </p>
          ) : (
            <BarChart
              data={data.applications_chart.map((e) => ({
                label: formatChartLabel(e.date),
                value: e.count,
              }))}
            />
          )}
        </SectionCard>
        <SectionCard title="Applications by status">
          {data.total_applications === 0 ? (
            <p className="text-sm text-muted-foreground">
              Your applications will be broken down by status here.
            </p>
          ) : (
            <DonutChart
              data={data.applications_by_status.map((s) => ({
                label: statusLabel(s.status),
                value: s.count,
              }))}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard title="How you compare to the platform average">
        {data.total_applications === 0 && data.profile_views === 0 ? (
          <p className="text-sm text-muted-foreground">
            No activity yet — once you have views and applications, we&apos;ll
            benchmark you against other talents.
          </p>
        ) : (
          <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
            {comparison.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-3 border-b border-border/10 pb-3 last:border-0">
                <span className="text-sm text-muted-foreground">{row.label}</span>
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">{row.you ?? "—"}</span>
                  <span className="w-16 text-right text-xs text-muted-foreground">
                    avg {row.avg ?? "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

export function ClientAnalyticsView() {
  const [days, setDays] = useState(30);
  const { data, isLoading, isError, error } = useClientAnalytics(days);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <StatCardsSkeleton count={6} />
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <ErrorAlert
        message={
          error instanceof Error ? error.message : "Failed to load analytics"
        }
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <DayRangePicker value={days} onChange={setDays} />
        <ExportCsvButton
          filename={`client-analytics-${new Date().toISOString().slice(0, 10)}.csv`}
          headers={["Date", "Job views", "Applications"]}
          rows={clientCsvRows(data)}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total jobs" value={data.total_jobs} icon={Briefcase} />
        <StatCard label="Job views" value={data.job_views} icon={Eye} />
        <StatCard label="Applications" value={data.total_applications} icon={Users} />
        <StatCard label="Application rate" value={<Rate value={data.application_rate} />} icon={Target} />
        <StatCard label="Hires" value={data.hires} icon={UserCheck} />
        <StatCard label="Time to hire" value={data.time_to_hire_days == null ? "—" : `${data.time_to_hire_days}d`} icon={Clock} />
        <StatCard label="Cost per hire" value={data.cost_per_hire == null ? "—" : `$${data.cost_per_hire}`} icon={Wallet} />
        <StatCard label="Quality of hire" value={data.quality_of_hire == null ? "—" : `${data.quality_of_hire}/5`} icon={Star} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard title={`Job views (last ${days} days)`}>
          {data.job_views === 0 ? (
            <p className="text-sm text-muted-foreground">
              No views yet. Share your job posts to attract applicants.
            </p>
          ) : (
            <BarChart
              data={data.job_views_chart.map((e) => ({
                label: formatChartLabel(e.date),
                value: e.count,
              }))}
            />
          )}
        </SectionCard>
        <SectionCard title={`Applications (last ${days} days)`}>
          {data.total_applications === 0 ? (
            <p className="text-sm text-muted-foreground">
              Applications to your jobs will show up here.
            </p>
          ) : (
            <BarChart
              data={data.applications_chart.map((e) => ({
                label: formatChartLabel(e.date),
                value: e.count,
              }))}
            />
          )}
        </SectionCard>
      </div>

      <SectionCard title="Hiring funnel">
        {data.total_applications === 0 ? (
          <p className="text-sm text-muted-foreground">
            Your hiring funnel will appear here once candidates apply.
          </p>
        ) : (
          <DonutChart
            data={data.hiring_funnel.map((s) => ({
              label: statusLabel(s.status),
              value: s.count,
            }))}
          />
        )}
      </SectionCard>

      {!data.cost_data_available && (
        <div className="rounded-lg border border-border/15 bg-secondary/30 px-4 py-3 text-sm text-muted-foreground">
          Add a cost to your jobs to track cost per hire.{" "}
          <Link href="/jobs/mine" className="font-medium text-primary hover:underline">
            Manage jobs
          </Link>
        </div>
      )}
    </div>
  );
}
