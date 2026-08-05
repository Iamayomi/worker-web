"use client";

import { useAdminDashboard } from "@/lib/hooks/use-users";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Building2,
  Link2,
} from "lucide-react";

export function AdminTotals() {
  const { data, isLoading } = useAdminDashboard({ days: 14 });
  if (isLoading || !data) return <StatCardsSkeleton count={6} />;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard label="Total users" value={data.total_users} icon={Users} />
      <StatCard label="Active users" value={data.active_users} icon={UserCheck} />
      <StatCard label="New today" value={data.new_users_today} icon={UserPlus} />
      <StatCard label="Talents" value={data.total_talents} icon={Briefcase} />
      <StatCard label="Clients" value={data.total_clients} icon={Building2} />
      <StatCard
        label="Active referrals"
        value={data.referral_stats.active_referrals}
        icon={Link2}
      />
    </div>
  );
}
