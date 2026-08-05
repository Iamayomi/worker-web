"use client";

import { Briefcase, FileText, RotateCw, Send } from "lucide-react";
import { useJobAnalytics } from "@/lib/hooks/use-jobs";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";

export function MyJobStats() {
  const { data, isLoading } = useJobAnalytics({ days: 14, scope: "mine" });
  if (isLoading || !data) return <StatCardsSkeleton count={4} />;

  const countFor = (status: string) =>
    data.jobs_by_status.find((entry) => entry.status === status)?.count ?? 0;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        label="Total jobs"
        value={data.total_jobs}
        icon={Briefcase}
        href="/jobs/mine"
      />
      <StatCard label="Published" value={countFor("published")} icon={Send} />
      <StatCard label="Drafts" value={countFor("draft")} icon={FileText} />
      <StatCard label="Expired" value={countFor("expired")} icon={RotateCw} />
    </div>
  );
}
