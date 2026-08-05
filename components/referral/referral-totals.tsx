"use client";

import { useReferralSummary } from "@/lib/hooks/use-referral";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import { UserPlus, Clock, Link2, CheckCircle2, XCircle } from "lucide-react";

export function ReferralTotals() {
  const { data, isLoading } = useReferralSummary();
  if (isLoading || !data) return <StatCardsSkeleton count={5} />;
  const totals = data.totals;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total referrals" value={totals.total} icon={UserPlus} />
      <StatCard label="Pending" value={totals.pending} icon={Clock} />
      <StatCard label="Active" value={totals.active} icon={Link2} />
      <StatCard label="Completed" value={totals.completed} icon={CheckCircle2} />
      <StatCard label="Cancelled" value={totals.cancelled} icon={XCircle} />
    </div>
  );
}
