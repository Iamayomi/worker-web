"use client";

import { useState } from "react";
import { useAdminDashboard } from "@/lib/hooks/use-users";
import { StatCard } from "@/components/shared/stat-card";
import { SectionCard } from "@/components/shared/section-card";
import { BarChart } from "@/components/shared/bar-chart";
import { ErrorAlert } from "@/components/shared/error-alert";
import { StatCardsSkeleton, ChartSkeleton } from "@/components/shared/skeletons";
import { AccountType } from "@/types/api/auth";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserPlus,
  Briefcase,
  Building2,
  Link2,
} from "lucide-react";

const DAY_OPTIONS = [
  { value: 7, label: "7d" },
  { value: 14, label: "14d" },
  { value: 30, label: "30d" },
] as const;

const ACCOUNT_TYPES = [
  { value: AccountType.TALENT, label: "Talent" },
  { value: AccountType.CLIENT, label: "Client" },
] as const;

function formatChartLabel(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function UserAnalyticsSection({
  showTotals = true,
}: {
  showTotals?: boolean;
}) {
  const [days, setDays] = useState<number>(14);
  const [accountType, setAccountType] = useState<AccountType | "all">("all");

  const { data, isLoading, isError, error } = useAdminDashboard({
    days,
    accountType: accountType === "all" ? undefined : accountType,
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
          value={accountType}
          onValueChange={(v) => setAccountType(v as AccountType | "all")}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All accounts</SelectItem>
            {ACCOUNT_TYPES.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          {showTotals && <StatCardsSkeleton count={6} />}
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
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total users" value={data.total_users} icon={Users} />
              <StatCard
                label="Active users"
                value={data.active_users}
                icon={UserCheck}
              />
              <StatCard
                label="New today"
                value={data.new_users_today}
                icon={UserPlus}
              />
              <StatCard label="Talents" value={data.total_talents} icon={Briefcase} />
              <StatCard label="Clients" value={data.total_clients} icon={Building2} />
              <StatCard
                label="Active referrals"
                value={data.referral_stats.active_referrals}
                icon={Link2}
              />
            </div>
          )}
          <SectionCard title={`New registrations (last ${days} days)`}>
            <BarChart
              data={data.registration_chart.map((e) => ({
                label: formatChartLabel(e.date),
                value: e.count,
              }))}
            />
          </SectionCard>
        </>
      )}
    </div>
  );
}
