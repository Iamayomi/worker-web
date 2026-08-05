"use client";

import { useJobAnalytics } from "@/lib/hooks/use-jobs";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import { Briefcase, FileText, UserCheck, Users } from "lucide-react";

const ACTIVE_PIPELINE_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
];

export function JobTotals() {
  const { data, isLoading } = useJobAnalytics({ days: 14 });
  if (isLoading || !data) return <StatCardsSkeleton count={4} />;
  return (
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
          data.jobs_by_status.find((s) => s.status === "published")?.count ?? 0
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
  );
}
