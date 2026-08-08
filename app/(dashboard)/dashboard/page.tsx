"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { useDisplayName } from "@/lib/hooks/use-display-name";
import { AccountType, UserRole } from "@/types/api/auth";
import { UserAnalyticsSection } from "@/components/admin/user-analytics";
import { JobAnalyticsSection } from "@/components/jobs/job-analytics";
import { AdminTotals } from "@/components/admin/admin-totals";
import { JobTotals } from "@/components/jobs/job-totals";
import { AnimatedContent } from "@/components/shared/animated-content";

function formatToday() {
  return new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const name = useDisplayName();
  const router = useRouter();

  const roles = (user?.roles ?? []) as UserRole[];
  const isSuperAdmin = roles.includes(UserRole.SUPER_ADMIN);
  const isAdmin =
    isSuperAdmin ||
    roles.includes(UserRole.ADMIN) ||
    user?.accountType === AccountType.ADMIN;
  const isClient = user?.accountType === AccountType.CLIENT;
  const isTalent = user?.accountType === AccountType.TALENT;

  useEffect(() => {
    if (isTalent && !isAdmin) {
      router.replace("/home");
    }
  }, [isTalent, isAdmin, router]);

  if (isTalent && !isAdmin) return null;

  return (
    <AnimatedContent>
      <div className="mx-auto max-w-6xl space-y-8">
        <>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {name ? `Welcome back, ${name}` : "Welcome back"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatToday()}
            </p>
          </div>

          {isAdmin && (
            <div className="space-y-4">
              <AdminTotals />
              <JobTotals />
            </div>
          )}
          {isClient && !isAdmin && <JobTotals />}

          <section className="space-y-4">
            <h2 className="text-lg font-semibold">Analytics</h2>
            {isAdmin && (
              <div className="space-y-8">
                <UserAnalyticsSection showTotals={false} />
                <JobAnalyticsSection showTotals={false} />
              </div>
            )}
            {isClient && !isAdmin && (
              <div className="space-y-8">
                <JobAnalyticsSection showTotals={false} />
              </div>
            )}
          </section>
        </>
      </div>
    </AnimatedContent>
  );
}
