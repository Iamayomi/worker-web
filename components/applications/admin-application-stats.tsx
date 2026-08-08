"use client";

import { FileCheck2, UserCheck, Users, UserX } from "lucide-react";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import type { AllApplicationsData } from "@/lib/hooks/use-jobs";

const ACTIVE_PIPELINE_STATUSES = [
  "applied",
  "under_review",
  "shortlisted",
  "interview",
  "offered",
];

interface AdminApplicationStatsProps {
  stats?: AllApplicationsData["stats"];
}

export function AdminApplicationStats({ stats }: AdminApplicationStatsProps) {
  if (!stats) return <StatCardsSkeleton count={4} />;

  const countFor = (status: string) => stats.byStatus[status] ?? 0;
  const active = ACTIVE_PIPELINE_STATUSES.reduce(
    (sum, status) => sum + countFor(status),
    0,
  );
  const success = countFor("offered") + countFor("accepted");

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total applications" value={stats.total} icon={Users} />
      <StatCard label="Active pipeline" value={active} icon={UserCheck} />
      <StatCard label="Offers & accepted" value={success} icon={FileCheck2} />
      <StatCard label="Rejected" value={countFor("rejected")} icon={UserX} />
    </div>
  );
}
