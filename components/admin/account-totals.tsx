"use client";

import { useAdminDashboard } from "@/lib/hooks/use-users";
import { StatCard } from "@/components/shared/stat-card";
import { StatCardsSkeleton } from "@/components/shared/skeletons";
import { AccountType } from "@/types/api/auth";
import { Building2, CalendarRange, HardHat, UserCheck, UserPlus } from "lucide-react";

export function AccountTotals({ accountType }: { accountType: AccountType }) {
 const { data, isLoading } = useAdminDashboard({
 days: 14,
 accountType,
 });
 if (isLoading || !data) return <StatCardsSkeleton count={4} />;

 const isTalent = accountType === AccountType.TALENT;
 const total = isTalent ? data.total_talents : data.total_clients;
 const newInWindow = data.registration_chart.reduce(
 (sum, entry) => sum + entry.count,
 0
 );

 return (
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
 <StatCard
 label={isTalent ? "Total talents" : "Total clients"}
 value={total}
 icon={isTalent ? HardHat : Building2}
 />
 <StatCard label="Active accounts" value={data.active_users} icon={UserCheck} />
 <StatCard label="New today" value={data.new_users_today} icon={UserPlus} />
 <StatCard
 label="New (14 days)"
 value={newInWindow}
 icon={CalendarRange}
 />
 </div>
 );
}
